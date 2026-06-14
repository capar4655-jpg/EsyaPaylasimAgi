import { useMemo, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { C } from '@/constants/colors';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
}

interface Props {
  center: { lat: number; lng: number };
  markers: MapMarker[];
  radiusM?: number;
  onSelect?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Leaflet + OpenStreetMap haritası (WebView içinde — Expo Go uyumlu, API key yok).
 * Kullanıcı konumu, "geofence" çemberi ve eşya marker'larını gösterir.
 */
export function MapViewLeaflet({
  center,
  markers,
  radiusM = 3000,
  onSelect,
  style,
}: Props) {
  const webRef = useRef<WebView>(null);
  const markersKey = JSON.stringify(markers);

  const html = useMemo(
    () => buildHtml(center, markers, radiusM),
    // center ve markers kasıtlı olarak serialize edilmiş anahtarlarla izleniyor
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [center.lat, center.lng, radiusM, markersKey]
  );

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        scrollEnabled={false}
        onMessage={(e) => onSelect?.(e.nativeEvent.data)}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

function buildHtml(
  center: { lat: number; lng: number },
  markers: MapMarker[],
  radiusM: number
): string {
  const markersJson = JSON.stringify(markers).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#map{height:100%;margin:0;padding:0;background:#e8eeeb}</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var center=[${center.lat},${center.lng}];
  var map=L.map('map',{zoomControl:false,attributionControl:false}).setView(center,14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);

  L.circle(center,{radius:${radiusM},color:'${C.primary}',fillColor:'${C.primary}',fillOpacity:0.08,weight:1}).addTo(map);

  function dot(color){return L.divIcon({className:'',html:'<div style="width:18px;height:18px;border-radius:9px;background:'+color+';border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.4)"></div>',iconSize:[18,18],iconAnchor:[9,9]});}

  L.marker(center,{icon:dot('${C.info}')}).addTo(map).bindPopup('Buradasın');

  var items=${markersJson};
  items.forEach(function(it){
    var m=L.marker([it.lat,it.lng],{icon:dot('${C.primary}')}).addTo(map);
    var box=document.createElement('div');
    var t=document.createElement('b'); t.innerText=it.title;
    var btn=document.createElement('button');
    btn.innerText='Detayı gör';
    btn.style.cssText='margin-top:6px;padding:6px 10px;border:none;border-radius:8px;background:${C.primary};color:#fff;font-weight:700';
    btn.onclick=function(){ if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(it.id); };
    box.appendChild(t); box.appendChild(document.createElement('br')); box.appendChild(btn);
    m.bindPopup(box);
  });
</script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#e8eeeb' },
  web: { flex: 1, backgroundColor: 'transparent' },
});
