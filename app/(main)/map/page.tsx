import { AlertTriangle } from 'lucide-react'

// Client wrapper to fetch and pass issues
import { MapClientWrapper } from './MapClientWrapper'

export default function MapPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative animate-in fade-in duration-500">
      <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur shadow-md border rounded-lg p-3 max-w-xs">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Live Issue Map
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Viewing civic issues across the city. Red markers indicate high priority items.
        </p>
      </div>
      
      <div className="flex-1 w-full h-full">
        <MapClientWrapper />
      </div>
    </div>
  )
}
