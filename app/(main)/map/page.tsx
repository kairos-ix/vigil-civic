import { AlertTriangle } from 'lucide-react'

// Client wrapper to fetch and pass issues
import { MapClientWrapper } from './MapClientWrapper'

export default function MapPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative animate-in fade-in duration-500">
      <div className="absolute top-4 right-4 md:right-6 z-[1000] w-[calc(100vw-70px)] rounded-lg border bg-background/95 p-2 backdrop-blur surface-floating sm:w-auto sm:max-w-xs md:p-3">
        <h1 className="text-sm md:text-lg font-bold flex items-center gap-1.5 md:gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-primary md:h-5 md:w-5" />
          Live Map
        </h1>
        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 leading-tight">
          See what needs fixing near you.
        </p>
      </div>
      
      <div className="flex-1 w-full h-full">
        <MapClientWrapper />
      </div>
    </div>
  )
}
