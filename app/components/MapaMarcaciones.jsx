// components/MapaMarcaciones.jsx
'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createCustomIcon = (type) => {
  const normalized = type?.toLowerCase();
  const color = normalized === 'ingreso' ? '#10b981' : '#ef4444';
  
  return L.divIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const MapaMarcaciones = ({ marcaciones = [] }) => {
  const mapRef = useRef(null);

  const getMapCenter = () => {
    if (marcaciones.length === 0) {
      return [-31.4201, -64.1888];
    }

    const latitudes = marcaciones.map(m => m.coordenadas.latitud);
    const longitudes = marcaciones.map(m => m.coordenadas.longitud);
    
    const centerLat = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
    const centerLng = longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;
    
    return [centerLat, centerLng];
  };

  const formatearFecha = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (mapRef.current && marcaciones.length > 0) {
      const map = mapRef.current;
      const group = new L.featureGroup(
        marcaciones.map(marcacion => {
          const tipoNorm = marcacion.tipo?.toLowerCase();
          const offset = tipoNorm === 'salida' ? 0.00005 : 0;
          return L.marker([
            marcacion.coordenadas.latitud + offset,
            marcacion.coordenadas.longitud + offset
          ]);
        })
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [marcaciones]);

  const center = getMapCenter();
  const zoom = marcaciones.length > 0 ? 13 : 11;

  return (
    <div className="w-full overflow-hidden rounded-lg h-96">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {marcaciones.map((marcacion) => {
          const tipoNorm = marcacion.tipo?.toLowerCase();
          const offset = tipoNorm === 'salida' ? 0.00005 : 0;

          return (
            <Marker
              key={marcacion.id || marcacion.timestamp}
              position={[
                marcacion.coordenadas.latitud + offset,
                marcacion.coordenadas.longitud + offset
              ]}
              icon={createCustomIcon(tipoNorm)}
            >
              <Popup>
                <div className="min-w-48">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {marcacion.tecnicoNombre}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tipoNorm === 'ingreso'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tipoNorm === 'ingreso' ? '📥 ingreso' : '📤 salida'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">🕒</span>
                      {formatearFecha(marcacion.timestamp)}
                    </div>
                    
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📍</span>
                      {marcacion.coordenadas.latitud.toFixed(4)}, {marcacion.coordenadas.longitud.toFixed(4)}
                    </div>
                    
                    {marcacion.precision && (
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-2">🎯</span>
                        Precisión: ±{Math.round(marcacion.precision)}m
                      </div>
                    )}
                    
                    {marcacion.observaciones && (
                      <div className="pt-2 mt-2 border-t border-gray-200">
                        <span className="w-4 h-4 mr-2">💬</span>
                        {marcacion.observaciones}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapaMarcaciones;



