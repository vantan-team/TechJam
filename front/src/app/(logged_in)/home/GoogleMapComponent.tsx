'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, MoveUpRight } from 'lucide-react';

// Leafletのアイコンの問題を修正
const setupLeafletIcons = () => {
  // アイコンのデフォルト設定をリセット
  if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/marker-icon-2x.png',
      iconUrl: '/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    });
  }
};

interface MarkerData {
  position: [number, number];
  popup?: string;
  title?: string;
  id?: number;
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  selectedMarkerId?: number | null;
  showOnlySelected?: boolean;
}

// マーカーに合わせてマップの表示範囲を調整するコンポーネント
function FitBoundsToMarkers({ markers, selectedMarkerId, initialFit = false }: { 
  markers: MarkerData[], 
  selectedMarkerId?: number | null,
  initialFit?: boolean 
}) {
  const map = useMap();
  const hasInitialFitted = useRef(false);

  useEffect(() => {
    // 選択されたマーカーにフォーカス（ユーザーが明示的に選択した場合のみ）
    if (selectedMarkerId !== null && selectedMarkerId !== undefined) {
      const selectedMarker = markers.find(marker => marker.id === selectedMarkerId);
      if (selectedMarker) {
        // より控えめなアニメーションでマーカーを表示
        map.setView([selectedMarker.position[0]-0.005, selectedMarker.position[1]], Math.max(map.getZoom(), 15), { 
          animate: true,
          duration: 0.3 
        });
      }
    }
  }, [selectedMarkerId, map]); // markersを依存関係から除外

  useEffect(() => {
    // 初回のみ、マーカー全体にフィット（複数マーカーがある場合のみ）
    if (markers.length > 1 && (!hasInitialFitted.current || initialFit)) {
      setTimeout(() => { // マップの初期化を待つ
        const bounds = L.latLngBounds(markers.map(marker => marker.position));
        
        // ボトムシートを考慮したパディング
        const mapSize = map.getSize();
        const paddingTop = mapSize.y * 0.1;
        const paddingBottom = mapSize.y * 0.5;
        const paddingSide = 20;
        
        map.fitBounds(bounds, { 
          paddingTopLeft: [paddingSide, paddingTop],
          paddingBottomRight: [paddingSide, paddingBottom],
          animate: false, // 初回は滑らかでない移動でOK
          maxZoom: 15 // 最大ズームレベルを制限
        });
        
        hasInitialFitted.current = true;
      }, 100); // 短い遅延でマップの準備を待つ
    } else if (markers.length === 1 && (!hasInitialFitted.current || initialFit)) {
      // 単一マーカーの場合は適切なズームレベルで表示
      setTimeout(() => {
        map.setView(markers[0].position, 14, { animate: false });
        hasInitialFitted.current = true;
      }, 100);
    }
  }, [markers.length, initialFit, map]); // markers.lengthのみ監視

  return null;
}

// カスタムマーカーコンポーネント（選択されたマーカーのポップアップを自動で開く）
function CustomMarker({
  marker,
  isSelected,
  onDetailClick,
}: {
  marker: MarkerData;
  isSelected: boolean;
  onDetailClick?: (marker: MarkerData) => void;
}) {
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && markerRef.current) {
      // マップフォーカス後にポップアップを開く（タイミングを遅らせる）
      setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 500);
    } else if (!isSelected && markerRef.current) {
      // 選択が解除された時にポップアップを閉じる
      markerRef.current.closePopup();
    }
  }, [isSelected]);

  return (
    <Marker ref={markerRef} position={marker.position}>
      {marker.popup && (
        <Popup>
          {marker.title && <strong>{marker.title}</strong>}
          {marker.title && <br />}
          <span dangerouslySetInnerHTML={{ __html: marker.popup }} />
          <br />
            <button
            style={{
              marginTop: 8,
              background: 'none',
              color: '#A90017',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            onClick={() => onDetailClick && onDetailClick(marker)}
            >
              <div className='flex items-center'>
                店舗の詳細
                <ExternalLink size='15'></ExternalLink>
              </div>
            </button>
        </Popup>
      )}
    </Marker>
  );
}

export default function SimpleMap({
  center = [35.1698, 136.8913], // 名古屋中心部（栄・名駅の中間）
  zoom = 12,
  markers = [],
  selectedMarkerId = null,
  showOnlySelected = false,
  onDetailClick,
}: MapProps & { onDetailClick?: (marker: MarkerData) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // クライアントサイドでのみLeafletアイコンを設定
    setupLeafletIcons();
  }, []);

  // 表示するマーカーをフィルタリング
  const displayMarkers =
    showOnlySelected && selectedMarkerId !== null
      ? markers.filter((marker) => marker.id === selectedMarkerId)
      : markers;

  return (
    <div ref={mapRef} style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true}
        boxZoom={false}
        keyboard={true}
        attributionControl={true}
      >
        <TileLayer
          attribution="&copy; Google Maps"
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&lang=ja"
          maxZoom={20}
        />
        {/* propsから渡されたマーカー */}
        {displayMarkers.map((marker, index) => (
          <CustomMarker
            key={`${marker.id}-${index}`}
            marker={marker}
            isSelected={marker.id === selectedMarkerId}
            onDetailClick={onDetailClick}
          />
        ))}
        {/* マーカーに合わせてマップの表示範囲を調整 */}
        <FitBoundsToMarkers
          markers={displayMarkers}
          selectedMarkerId={selectedMarkerId}
          initialFit={displayMarkers.length > 0}
        />
      </MapContainer>
    </div>
  );
}
