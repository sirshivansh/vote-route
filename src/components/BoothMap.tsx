import { useEffect, useRef, useState } from "react";
import { MapPin, Search, Navigation, ShieldCheck } from "lucide-react";
import { logger } from "@/utils/logger";

declare global {
  interface Window {
    google: any;
  }
}

export function BoothMap({ city }: { city?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [hasGoogle, setHasGoogle] = useState(false);

  useEffect(() => {
    let checkCount = 0;
    const checkGoogle = setInterval(() => {
      checkCount++;
      if (window.google && window.google.maps) {
        clearInterval(checkGoogle);
        setHasGoogle(true);
        initMap();
      } else if (checkCount > 50) { // Fallback after 5s
        clearInterval(checkGoogle);
        setLoading(false);
      }
    }, 100);

    function initMap() {
      if (!mapRef.current) return;
      
      try {
        const center = { lat: 19.0760, lng: 72.8777 }; // Default Mumbai
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 14,
          disableDefaultUI: true,
          styles: [
            {
              "elementType": "geometry",
              "stylers": [{ "color": "#242f3e" }]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [{ "color": "#242f3e" }]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#746855" }]
            }
          ]
        });

        new window.google.maps.Marker({
          position: center,
          map,
          title: "Your Polling Booth"
        });

        setLoading(false);
        logger.info('☁️ System', `Google Maps initialized for: ${city || 'Mumbai'}`);
      } catch (e) {
        logger.error('☁️ System', 'Failed to init Google Map', e);
        setLoading(false);
      }
    }

    return () => clearInterval(checkGoogle);
  }, [city]);

  return (
    <div 
      className="relative overflow-hidden rounded-2xl border border-border bg-muted/30 aspect-video sm:aspect-[21/9] flex items-center justify-center group"
      role="region"
      aria-label="Polling Booth Map"
    >
      {/* Real Map Container */}
      <div ref={mapRef} className={cn("absolute inset-0 transition-opacity duration-1000", loading ? "opacity-0" : "opacity-100")} />

      {loading && (
        <div className="flex flex-col items-center gap-3 animate-pulse z-10">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Activating Maps SDK...</span>
        </div>
      )}

      {!loading && !hasGoogle && (
        <div className="relative z-10 text-center p-6 bg-background/80 backdrop-blur-md m-4 rounded-3xl border border-border">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron/10 border border-saffron/20 shadow-sm mb-4">
            <Search className="w-3.5 h-3.5 text-saffron" />
            <span className="text-xs font-bold text-saffron">Offline Mode</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Simulated Booth Data</h3>
            <p className="text-xs text-muted-foreground">Add a real Google Maps API key to .env to see live satellite data.</p>
          </div>
        </div>
      )}

      {hasGoogle && !loading && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 backdrop-blur-md shadow-glow animate-in fade-in zoom-in-95">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Google Maps Active</span>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button 
          className="w-8 h-8 rounded-lg bg-background/90 backdrop-blur shadow-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Zoom in map"
        >
          <span className="text-lg font-medium" aria-hidden="true">+</span>
        </button>
        <button 
          className="w-8 h-8 rounded-lg bg-background/90 backdrop-blur shadow-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Zoom out map"
        >
          <span className="text-lg font-medium" aria-hidden="true">-</span>
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full px-4 max-w-sm">
        <div className="p-4 rounded-2xl bg-background/90 backdrop-blur-xl border border-border shadow-2xl flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Nearest Station</div>
            <div className="text-sm font-bold truncate">Govt. Primary School, 14A</div>
          </div>
          <button className="shrink-0 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:scale-105 transition-transform flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5" /> Navigate
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

