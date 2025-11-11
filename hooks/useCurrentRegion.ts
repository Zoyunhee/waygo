import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export default function useCurrentRegion() {
    const [region, setRegion] = useState({
        latitude: 35.2444,   // 인제대(기본)
        longitude: 128.9017,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
    });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;

                // 에뮬레이터에서 lastKnown이 없으면 getCurrent로 대체
                const last = await Location.getLastKnownPositionAsync();
                const pos = last ?? await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                if (!mounted || !pos) return;
                setRegion(r => ({
                    ...r,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                }));
            } catch (e) {
                console.warn('location error', e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    return { region, setRegion };
}
