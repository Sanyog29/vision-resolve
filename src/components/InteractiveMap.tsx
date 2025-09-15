import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from 'lucide-react';

interface Report {
  id: string;
  lat: number;
  lng: number;
  title: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
}

interface InteractiveMapProps {
  reports: Report[];
  center?: [number, number];
  onReportClick?: (report: Report) => void;
  mapboxToken?: string;
}

export default function InteractiveMap({ 
  reports, 
  center = [-74.5, 40], 
  onReportClick,
  mapboxToken = "your-mapbox-token-here" 
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // For demo purposes, we'll show a placeholder message if no token
    if (mapboxToken === "your-mapbox-token-here") {
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for reports
    reports.forEach((report) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23${getMarkerColor(report.status, report.priority)}'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E)`;
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundSize = '100%';
      el.style.cursor = 'pointer';

      el.addEventListener('click', () => {
        onReportClick?.(report);
      });

      new mapboxgl.Marker(el)
        .setLngLat([report.lng, report.lat])
        .addTo(map.current!);

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-medium text-sm">${report.title}</h3>
            <p class="text-xs text-gray-600">${report.category}</p>
            <p class="text-xs font-medium mt-1 ${getStatusColor(report.status)}">${report.status.toUpperCase()}</p>
          </div>
        `);

      new mapboxgl.Marker(el)
        .setLngLat([report.lng, report.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [reports, center, mapboxToken, onReportClick]);

  const getMarkerColor = (status: string, priority: string) => {
    if (status === 'resolved') return '22c55e';
    if (priority === 'high') return 'ef4444';
    if (priority === 'medium') return 'f59e0b';
    return '6b7280';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      default: return 'text-amber-600';
    }
  };

  if (mapboxToken === "your-mapbox-token-here") {
    return (
      <Card className="w-full h-96">
        <CardHeader>
          <CardTitle>Interactive Report Map</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 bg-muted rounded-lg">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Connect Mapbox to view interactive map
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Add your Mapbox token in project settings
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Live Report Map
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-96" />
      </CardContent>
    </Card>
  );
}