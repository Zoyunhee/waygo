import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import useCurrentRegion from '@/hooks/useCurrentRegion'; // 위에서 만든 훅

export default function MainScreen() {
  const { region, setRegion } = useCurrentRegion();

  return (
      <View style={{ flex: 1 }}>
        <MapView
            style={StyleSheet.absoluteFill}
            region={region}
            onRegionChangeComplete={setRegion as any}
            showsUserLocation           // 내 위치 파란 점
            showsMyLocationButton       // (Android) 내 위치 버튼
        >
          {/* 테스트용 마커 한 개 */}
          <Marker
              coordinate={{ latitude: region.latitude, longitude: region.longitude }}
              title="현재 중심"
              description="지도의 중심 좌표"
          />
        </MapView>
      </View>
  );
}
