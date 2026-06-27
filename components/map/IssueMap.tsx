'use client'

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, CircleMarker, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Issue } from '@/types'
import { SEVERITY_COLORS, STATUS_CONFIG } from '@/lib/constants'
import { UpvoteButton } from '@/components/issues/UpvoteButton'
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { getSession, setSession, SESSION_KEYS } from '@/lib/sessionStorage'
import { Plus, LocateFixed } from 'lucide-react'

// Fix Leaflet's default icon path issues in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Patch for Leaflet/Vaul pointer capture crash on drag
if (typeof window !== 'undefined' && typeof Element !== 'undefined') {
  const originalReleasePointerCapture = Element.prototype.releasePointerCapture
  Element.prototype.releasePointerCapture = function(pointerId) {
    try {
      if (this.hasPointerCapture(pointerId)) {
        originalReleasePointerCapture.call(this, pointerId)
      }
    } catch (e) {
      // Ignore NotFoundError
    }
  }
}

const createCustomIcon = (severity: string) => {
  const color = SEVERITY_COLORS[severity] || '#6B7280'
  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>`

  return L.divIcon({
    html: `<div style="width: 32px; height: 32px; transform: translate(-50%, -100%); mt-2">${svgTemplate}</div>`,
    className: '', // Remove default leaflet styles
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Anchor at bottom center
    popupAnchor: [0, -32], // Popup appears above the marker
  })
}

// Custom component to handle map clicks
function MapEvents({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

// "My Location" control — pulsing blue dot + geolocation logic
function LocateControl({ autoLocate = false, onReady, onLocatingChange }: { autoLocate?: boolean, onReady?: (trigger: () => void) => void, onLocatingChange?: (locating: boolean) => void }) {
  const map = useMap()
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [accuracy, setAccuracy] = useState<number>(0)
  const [locating, setLocating] = useState(false)
  const [active, setActive] = useState(false)

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      return
    }

    setLocating(true)
    onLocatingChange?.(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords
        const latlng: [number, number] = [latitude, longitude]
        setUserPosition(latlng)
        setAccuracy(acc)
        setActive(true)
        setLocating(false)
        onLocatingChange?.(false)
        setSession(SESSION_KEYS.USER_LOCATION, { lat: latitude, lng: longitude, accuracy: acc })
        
        setTimeout(() => {
          if (!map || !(map as any)._loaded) return
          try {
            map.flyTo(latlng, 17, { duration: 1.5 })
          } catch {
            try {
              map.setView(latlng, 17)
            } catch {
              // Ignore safely
            }
          }
        }, 100)
      },
      () => {
        setLocating(false)
        onLocatingChange?.(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [map])

  // Expose handleLocate to parent via onReady
  useEffect(() => {
    if (onReady) {
      onReady(handleLocate)
    }
  }, [handleLocate, onReady])

  // Trigger autoLocate if requested and not already located
  useEffect(() => {
    if (autoLocate && !userPosition && !locating) {
      queueMicrotask(() => handleLocate())
    }
  }, [autoLocate, userPosition, locating, handleLocate])

  // Inject keyframe animation for the spinner
  useEffect(() => {
    const styleId = 'locate-control-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulse-ring {
        0% { transform: scale(0.8); opacity: 0.6; }
        50% { transform: scale(1.2); opacity: 0.2; }
        100% { transform: scale(0.8); opacity: 0.6; }
      }
      .leaflet-user-location-pulse {
        animation: pulse-ring 2s ease-in-out infinite;
      }
    `
    document.head.appendChild(style)

    return () => {
      const el = document.getElementById(styleId)
      if (el) el.remove()
    }
  }, [])

  if (!userPosition) return null

  // Render the pulsing blue dot and accuracy circle
  return (
    <>
      {/* Accuracy radius circle (geographical radius in meters) */}
      <Circle
        center={userPosition}
        radius={accuracy}
        pathOptions={{
          color: '#4285f4',
          fillColor: '#4285f4',
          fillOpacity: 0.1,
          weight: 1,
          opacity: 0.3,
        }}
        className="leaflet-user-location-pulse"
      />
      {/* Inner solid blue dot (fixed pixel size) */}
      <CircleMarker
        center={userPosition}
        radius={8}
        pathOptions={{
          color: 'white',
          fillColor: '#4285f4',
          fillOpacity: 1,
          weight: 3,
          opacity: 1,
        }}
      >
        <Popup>
          <div className="text-sm font-medium">You are here</div>
          <div className="text-xs text-muted-foreground">
            Accuracy: ~{Math.round(accuracy)}m
          </div>
        </Popup>
      </CircleMarker>
    </>
  )
}

interface IssueMapProps {
  issues: Issue[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (issue: Issue) => void
  onIssueUpdate?: (issue: Issue) => void
  onViewIssue?: (issue: Issue) => void
  onLocationSelect?: (lat: number, lng: number) => void
  selectable?: boolean
  className?: string
  showLocateButton?: boolean
  autoLocate?: boolean
  showAddButton?: boolean
  onAddClick?: () => void
}

export default function IssueMap({
  issues,
  center = [23.0225, 72.5714], // Default to Ahmedabad
  zoom = 13,
  onMarkerClick,
  onIssueUpdate,
  onViewIssue,
  onLocationSelect,
  selectable = false,
  className = "h-full w-full rounded-lg shadow-sm z-0",
  showLocateButton = false,
  autoLocate = false,
  showAddButton = false,
  onAddClick
}: IssueMapProps) {

  // Read user's cached location to use as default center
  const cachedLocation = useMemo(() => {
    return getSession<{lat: number, lng: number}>(SESSION_KEYS.USER_LOCATION)
  }, [])

  const locateTriggerRef = useRef<(() => void) | null>(null)
  const [locating, setLocating] = useState(false)

  const defaultMapCenter = cachedLocation ? [cachedLocation.lat, cachedLocation.lng] as [number, number] : center

  // Auto-center map if only one issue is passed (like on issue detail page)
  const mapCenter = issues.length === 1 && issues[0].location?.coordinates
    ? [issues[0].location.coordinates[1], issues[0].location.coordinates[0]] as [number, number]
    : defaultMapCenter

  return (
    <div className={`${className} relative`} style={{ minHeight: '300px' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {selectable && <MapEvents onLocationSelect={onLocationSelect} />}

        {/* My Location control with pulsing blue dot */}
        <LocateControl autoLocate={autoLocate} onReady={(trigger) => { locateTriggerRef.current = trigger }} onLocatingChange={setLocating} />

        {issues.map((issue) => {
          if (!issue.location?.coordinates) return null
          
          // GeoJSON coordinates are [lng, lat], Leaflet wants [lat, lng]
          const position: [number, number] = [
            issue.location.coordinates[1],
            issue.location.coordinates[0]
          ]

          return (
            <Marker
              key={issue._id}
              position={position}
              icon={createCustomIcon(issue.severity)}
              eventHandlers={
                onMarkerClick && !onIssueUpdate
                  ? { click: () => onMarkerClick(issue) }
                  : undefined
              }
            >
              {(onIssueUpdate || !onMarkerClick) && (
                <Popup minWidth={220}>
                  <div className="space-y-3 py-1">
                    <div>
                      <div className="font-semibold leading-snug">{issue.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {STATUS_CONFIG[issue.status]?.label}
                      </div>
                    </div>
                    {onIssueUpdate && (
                      <UpvoteButton
                        issueId={issue._id}
                        upvotes={issue.upvotes}
                        onUpdate={onIssueUpdate}
                        showLabel
                        variant="outline"
                        className="h-9 w-full justify-center px-3"
                      />
                    )}
                    {onViewIssue && (
                      <button
                        type="button"
                        className="w-full text-center text-sm font-medium text-primary hover:underline"
                        onClick={() => onViewIssue(issue)}
                      >
                        View full details
                      </button>
                    )}
                  </div>
                </Popup>
              )}
            </Marker>
          )
        })}

        {/* Selected Location Marker (for reporting) */}
        {selectable && center && (
          <Marker position={center} icon={createCustomIcon('reported')} />
        )}
      </MapContainer>

      {showLocateButton && (
        <button
          type="button"
          onClick={() => locateTriggerRef.current?.()}
          disabled={locating}
          aria-label="My Location"
          className="absolute lg:bottom-5 bottom-20 left-4 lg:right-6 z-[1000] flex h-12 w-12 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform active:scale-95 hover:scale-105"
          style={{ touchAction: 'manipulation' }}
        >
          <LocateFixed className={`h-5 w-5 ${locating ? 'animate-spin text-blue-500' : ''}`} />
        </button>
      )}
    </div>
  )
}
