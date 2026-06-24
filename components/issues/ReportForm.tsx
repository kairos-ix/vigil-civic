'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Camera, Image as ImageIcon, MapPin, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useGeolocation } from '@/hooks/useGeolocation'
import { AIClassificationResult } from './AIClassificationResult'
import { ClassificationResult } from '@/lib/gemini'
import dynamic from 'next/dynamic'
import { CATEGORIES } from '@/lib/constants'

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper').then(mod => mod.MapWrapper), { ssr: false })

export function ReportForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { lat: geoLat, lng: geoLng, getLocation, loading: geoLoading } = useGeolocation()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isClassifying, setIsClassifying] = useState(false)
  const [classification, setClassification] = useState<ClassificationResult | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    severity: 'low',
    lat: 23.0225,
    lng: 72.5714,
    address: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Request location when component mounts
  useEffect(() => {
    getLocation()
  }, [getLocation])

  // Update map center when geolocation succeeds
  useEffect(() => {
    if (geoLat && geoLng) {
      setFormData(prev => ({ ...prev, lat: geoLat, lng: geoLng }))
    }
  }, [geoLat, geoLng])

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
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      
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
      })

      const result = await res.json()

      if (res.ok) {
        if (result.isDuplicate) {
          toast.info('Similar issue found nearby. We added your vote to it!')
        } else {
          toast.success('Issue reported successfully! +10 points')
        }
        router.push(`/issues/${result.issue._id}`)
      } else {
        toast.error(result.error || 'Failed to submit report')
      }
    } catch (error) {
      console.error(error)
      toast.error('An unexpected error occurred')
    } finally {
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
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Severity</label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.severity}
                        onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
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
                    <label className="block text-sm font-medium">Location</label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={getLocation} 
                      disabled={geoLoading}
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
                      onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))}
                    />
                  </div>

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
