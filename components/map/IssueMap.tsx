'use client'

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Issue } from '@/types'
import { STATUS_CONFIG } from '@/lib/constants'
import { useEffect } from 'react'

// Fix Leaflet's default icon path issues in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const createCustomIcon = (status: string) => {
  const color = STATUS_CONFIG[status]?.color || '#6B7280'
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

interface IssueMapProps {
  issues: Issue[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (issue: Issue) => void
  onLocationSelect?: (lat: number, lng: number) => void
  selectable?: boolean
  className?: string
}

export default function IssueMap({
  issues,
  center = [23.0225, 72.5714], // Default to Ahmedabad
  zoom = 13,
  onMarkerClick,
  onLocationSelect,
  selectable = false,
  className = "h-full w-full rounded-lg shadow-sm z-0"
}: IssueMapProps) {

  // Auto-center map if only one issue is passed (like on issue detail page)
  const mapCenter = issues.length === 1 && issues[0].location?.coordinates
    ? [issues[0].location.coordinates[1], issues[0].location.coordinates[0]] as [number, number]
    : center

  return (
    <div className={className} style={{ minHeight: '300px' }}>
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
              icon={createCustomIcon(issue.status)}
              eventHandlers={{
                click: () => onMarkerClick?.(issue),
              }}
            >
              {/* Optional simple popup if no custom click handler provided */}
              {!onMarkerClick && (
                <Popup>
                  <div className="font-semibold">{issue.title}</div>
                  <div className="text-sm text-muted-foreground">{STATUS_CONFIG[issue.status]?.label}</div>
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
    </div>
  )
}
