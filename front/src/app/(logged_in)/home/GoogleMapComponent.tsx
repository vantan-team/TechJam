'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Leafletのアイコンの問題を修正
const setupLeafletIcons = () => {
  // アイコンのデフォルト設定をリセット
  if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
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
function FitBoundsToMarkers({ markers, selectedMarkerId }: { markers: MarkerData[], selectedMarkerId?: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedMarkerId !== null && selectedMarkerId !== undefined) {
      // 選択されたマーカーが存在する場合、そのマーカーにフォーカス
      const selectedMarker = markers.find(marker => marker.id === selectedMarkerId);
      if (selectedMarker) {
        const targetZoom = 16;
        
        // マップの状態をリセットしてから新しい位置にフォーカス
        const focusMarker = () => {
          // 現在のズームレベルを確認し、目標ズームレベルと比較
          const currentMapZoom = map.getZoom();
          const useZoom = currentMapZoom >= targetZoom ? currentMapZoom : targetZoom;
          
          const mapSize = map.getSize();
          // 目標位置：上部25%、左右50%（中央）
          const targetX = mapSize.x * 0.5;  // 水平中央
          const targetY = mapSize.y * 0.25; // 上部25%
          
          // マーカーが目標位置に来るマップ中心を計算
          const markerLatLng = L.latLng(selectedMarker.position);
          
          // マーカー位置をピクセル座標で取得（使用するズームレベルで）
          const markerPoint = map.project(markerLatLng, useZoom);
          
          // 目標位置に来るための新しいマップ中心を計算
          const mapCenterX = markerPoint.x - targetX + (mapSize.x * 0.5);
          const mapCenterY = markerPoint.y - targetY + (mapSize.y * 0.5);
          const newCenterPoint = L.point(mapCenterX, mapCenterY);
          
          // ピクセル座標を地理座標に変換
          const newCenterLatLng = map.unproject(newCenterPoint, useZoom);
          
          // 一度の移動で目標位置にマーカーを配置（ズームレベルを保持）
          map.setView(newCenterLatLng, useZoom, { 
            animate: true,
            duration: 0.5
          });
        };
        
        // すぐに実行
        focusMarker();
      }
    } else if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(marker => marker.position));
      
      // ボトムシートがあるため、マップの中心を上部25%の位置に調整
      const mapSize = map.getSize();
      const paddingTop = mapSize.y * 0.1; // 上部10%のパディング
      const paddingBottom = mapSize.y * 0.5; // 下部50%のパディング（ボトムシート分を考慮）
      const paddingSide = 20;
      
      map.fitBounds(bounds, { 
        paddingTopLeft: [paddingSide, paddingTop],
        paddingBottomRight: [paddingSide, paddingBottom]
      });
    }
  }, [markers, selectedMarkerId, map]);

  return null;
}

// カスタムマーカーコンポーネント（選択されたマーカーのポップアップを自動で開く）
function CustomMarker({ marker, isSelected }: { marker: MarkerData; isSelected: boolean }) {
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
        </Popup>
      )}
    </Marker>
  );
}

export default function SimpleMap({ 
  center = [35.6762, 139.6503], // 東京駅の座標
  zoom = 13,
  markers = [],
  selectedMarkerId = null,
  showOnlySelected = false
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // クライアントサイドでのみLeafletアイコンを設定
    setupLeafletIcons();
  }, []);

  // 表示するマーカーをフィルタリング
  const displayMarkers = showOnlySelected && selectedMarkerId !== null
    ? markers.filter(marker => marker.id === selectedMarkerId)
    : markers;

  return (
    <div ref={mapRef} style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&lang=ja"
          maxZoom={20}
        />
        {/* propsから渡されたマーカー */}
        {displayMarkers.map((marker, index) => (
          <CustomMarker 
            key={`${marker.id}-${index}`} 
            marker={marker} 
            isSelected={marker.id === selectedMarkerId}
          />
        ))}
        {/* マーカーに合わせてマップの表示範囲を調整 */}
        <FitBoundsToMarkers markers={displayMarkers} selectedMarkerId={selectedMarkerId} />
      </MapContainer>
    </div>
  );
}
