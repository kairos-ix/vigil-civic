'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Camera, Image as ImageIcon, MapPin, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useGeolocation } from '@/hooks/useGeolocation'
import { AIClassificationResult } from './AIClassificationResult'
import { ClassificationResult } from '@/lib/gemini'
import { geocodeReverse } from '@/lib/geocode'
import dynamic from 'next/dynamic'
import { CATEGORIES } from '@/lib/constants'
import { CustomSelect } from '@/components/ui/custom-select'
import { getSession, setSession, removeSession, SESSION_KEYS } from '@/lib/sessionStorage'

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper').then(mod => mod.MapWrapper), { ssr: false })

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Failed to read image file'))
        return
      }
      resolve(result.replace(/^data:[^;]+;base64,/, ''))
    }
    reader.onerror = () => reject(reader.error || new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export function ReportForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { lat: geoLat, lng: geoLng, accuracy, getLocation, loading: geoLoading } = useGeolocation()

  const [step, setStep] = useState<1 | 2 | 3>(() => {
    const saved = getSession<number>(SESSION_KEYS.REPORT_STEP)
    return (saved === 2 || saved === 3 ? saved : 1) as 1 | 2 | 3
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isClassifying, setIsClassifying] = useState(false)
  const [classification, setClassification] = useState<ClassificationResult | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const showLowAccuracyWarning = accuracy !== null && accuracy > 100
  const geocodeDebounceRef = useRef<NodeJS.Timeout | null>(null)
  
  const [formData, setFormData] = useState(() => {
    const draft = getSession<{
      title: string
      description: string
      category: string
      severity: string
      lat: number
      lng: number
      address: string
    }>(SESSION_KEYS.REPORT_DRAFT)
    return draft || {
      title: '',
      description: '',
      category: 'other',
      severity: 'low',
      lat: 23.0225,
      lng: 72.5714,
      address: ''
    }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Persist form draft and step to sessionStorage on changes
  useEffect(() => {
    setSession(SESSION_KEYS.REPORT_DRAFT, formData)
  }, [formData])

  useEffect(() => {
    setSession(SESSION_KEYS.REPORT_STEP, step)
  }, [step])

  // Restore image from session storage on mount
  useEffect(() => {
    const savedDataUrl = getSession<string>(SESSION_KEYS.REPORT_IMAGE_BASE64)
    if (savedDataUrl && !imageFile) {
      try {
        const file = dataURLtoFile(savedDataUrl, 'cached-image.jpg')
        setImageFile(file)
        setImagePreview(savedDataUrl)
      } catch (e) {
        console.error('Failed to restore image from session storage', e)
      }
    }
  }, [imageFile])

  // Geocode when pin is dragged (debounced)
  const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }))
    
    if (geocodeDebounceRef.current) {
      clearTimeout(geocodeDebounceRef.current)
    }
    
    geocodeDebounceRef.current = setTimeout(async () => {
      setIsGeocoding(true)
      try {
        const result = await geocodeReverse(lat, lng)
        setFormData(prev => ({ ...prev, address: result.address }))
      } catch {
        // Keep existing address
      } finally {
        setIsGeocoding(false)
      }
    }, 500)
  }, [])

  // Request location when component mounts
  useEffect(() => {
    getLocation()
  }, [getLocation])

  // Geocode and update form when geolocation succeeds
  useEffect(() => {
    if (geoLat && geoLng && !formData.address) {
      const fetchAddress = async () => {
        setIsGeocoding(true)
        try {
          const result = await geocodeReverse(geoLat, geoLng)
          setFormData(prev => ({
            ...prev,
            lat: geoLat,
            lng: geoLng,
            address: result.address,
          }))
        } catch {
          setFormData(prev => ({ ...prev, lat: geoLat, lng: geoLng }))
        } finally {
          setIsGeocoding(false)
        }
      }
      fetchAddress()
    }
  }, [geoLat, geoLng, accuracy, formData.address])

  // Pre-fill form when classification succeeds
  useEffect(() => {
    if (classification && classification.issueDetected) {
      setFormData(prev => ({
        ...prev,
        title: classification.title || prev.title,
        description: classification.description || prev.description,
        category: classification.category || prev.category,
        severity: classification.severity || prev.severity,
      }))
    }
  }, [classification])

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setStep(2)

    // Start AI Classification
    setIsClassifying(true)
    try {
      const base64 = await fileToBase64(file)
      const dataUrl = `data:${file.type};base64,${base64}`
      setSession(SESSION_KEYS.REPORT_IMAGE_BASE64, dataUrl)
      
      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type })
      })
      
      const data = await res.json()
      if (res.ok) {
        setClassification(data)
        toast.success('AI analysis complete')
      } else {
        toast.error('AI analysis failed. Please fill details manually.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to connect to AI service')
    } finally {
      setIsClassifying(false)
    }
  }

  const handleRetake = () => {
    setImagePreview(null)
    setImageFile(null)
    setClassification(null)
    setStep(1)
    removeSession(SESSION_KEYS.REPORT_IMAGE_BASE64)
    // Reset draft but keep location
    setFormData(prev => ({
      ...prev,
      title: '',
      description: '',
      category: 'other',
      severity: 'low',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) {
      toast.error('Image is required')
      return
    }

    setIsSubmitting(true)

    try {
      const data = new FormData()
      data.append('image', imageFile)
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('category', formData.category)
      data.append('severity', formData.severity)
      data.append('lat', formData.lat.toString())
      data.append('lng', formData.lng.toString())
      if (formData.address) data.append('address', formData.address)

      const res = await fetch('/api/issues', {
        method: 'POST',
        body: data,
        credentials: 'include',
      })

      const result = await res.json()

      if (res.ok) {
        // Clear the saved draft on successful submit
        removeSession(SESSION_KEYS.REPORT_DRAFT)
        removeSession(SESSION_KEYS.REPORT_STEP)
        removeSession(SESSION_KEYS.REPORT_IMAGE_BASE64)
        if (result.isDuplicate) {
          toast.info('Similar issue found nearby. We added your vote to it!')
        } else {
          toast.success('Issue reported successfully! +10 points')
        }
        router.refresh()
        router.push(`/issues/${result.issue._id}`)
        // Intentionally not setting isSubmitting(false) here so the button stays disabled while navigating
      } else {
        toast.error(result.error || 'Failed to submit report')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Progress Bar */}
      <div className="flex h-2 w-full bg-muted">
        <div 
          className="bg-primary transition-all duration-500 ease-in-out" 
          style={{ width: `${(step / 3) * 100}%` }} 
        />
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          {step === 1 && 'Capture Issue'}
          {step === 2 && 'Review AI Analysis'}
          {step === 3 && 'Confirm Details'}
        </h2>

        {/* STEP 1: Image Capture */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-32 flex-col gap-3 bg-primary/5 hover:bg-primary/10 hover:text-primary border-primary/20"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture')
                    fileInputRef.current.click()
                  }
                }}
              >
                <ImageIcon className="h-8 w-8" />
                <span>Upload Photo</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-32 flex-col gap-3 bg-primary/5 hover:bg-primary/10 hover:text-primary border-primary/20"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('capture', 'environment')
                    fileInputRef.current.click()
                  }
                }}
              >
                <Camera className="h-8 w-8" />
                <span>Take Photo</span>
              </Button>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageCapture}
            />
            <p className="text-sm text-center text-muted-foreground mt-4">
              Clear photos help our AI automatically identify and categorize the issue.
            </p>
          </div>
        )}

        {/* STEP 2 & 3: Review and Form */}
        {(step === 2 || step === 3) && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Preview & AI Result */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                  {imagePreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 rounded-full opacity-80 hover:opacity-100"
                    onClick={handleRetake}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                <AIClassificationResult result={classification} isLoading={isClassifying} />

                <div className="flex justify-end pt-4">
                  <Button 
                    type="button" 
                    onClick={() => setStep(3)} 
                    disabled={isClassifying}
                    className="w-full sm:w-auto"
                  >
                    {isClassifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Continue to Details'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Manual Form Details */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Issue Title</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="E.g., Large pothole near junction"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Category</label>
                      <CustomSelect
                        value={formData.category}
                        onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                        options={CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Severity</label>
                      <CustomSelect
                        value={formData.severity}
                        onChange={(val) => setFormData(prev => ({ ...prev, severity: val }))}
                        options={[
                          { value: 'low', label: 'Low' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'high', label: 'High' },
                          { value: 'critical', label: 'Critical' },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Description</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide additional details..."
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium">Confirm Location</label>
                      <p className="text-xs text-muted-foreground mt-1">Move the pin to the exact spot. Accurate locations help authorities find the issue faster.</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={getLocation} 
                      disabled={geoLoading || isGeocoding}
                    >
                      {geoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                      Use My Location
                    </Button>
                  </div>
                  
                  <div className="h-[200px] w-full rounded-md border overflow-hidden">
                    <MapWrapper 
                      issues={[]} 
                      center={[formData.lat, formData.lng]} 
                      zoom={15} 
                      selectable={true}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>

                  {showLowAccuracyWarning && (
                    <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>Location accuracy is ~{accuracy}m. Please drag the pin to correct it.</span>
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Landmark or specific address (optional)"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
