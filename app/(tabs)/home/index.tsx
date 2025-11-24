// app/(tabs)/home/index.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Keyboard,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Alert,
} from 'react-native';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import useCurrentRegion from '@/hooks/useCurrentRegion';
import { useRouter } from 'expo-router';

type Category = 'toilet' | 'store' | 'hospital' | 'gas';
type Place = { id: string; name: string; lat: number; lng: number; address?: string; rating?: number; iconUrl?: string };
type CityRank = { rank: number; city: string };
type SearchItem = { id: string; title: string; address?: string; lat?: number; lng?: number; rating?: number; imageUrl?: string };

const RADIUS_KM = 1;
const DEFAULT_DELTA = 0.015;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const BACKEND_ENABLED = false;
const BASE_URL = 'https://YOUR-BACKEND.EXAMPLE.COM';

export default function HomeScreen() {
    const { region, setRegion } = useCurrentRegion();
    const mapRef = useRef<MapView>(null);
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['15%', '45%', '90%'], []);
    const [sheetIndex, setSheetIndex] = useState(1);

    const router = useRouter();

    const zoomRef = useRef({ latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA });
    const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null);

    const userLocationRef = useRef<{ latitude: number; longitude: number } | null>(null); // 내 현위치 저장용 ref

    const [active, setActive] = useState<Category | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);

    const [ranks, setRanks] = useState<CityRank[]>([]);
    const [loadingTop10, setLoadingTop10] = useState(false);

    const [q, setQ] = useState('');
    const [results, setResults] = useState<SearchItem[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    async function fetchCityTop10(): Promise<CityRank[]> {
        if (BACKEND_ENABLED) {
            const res = await fetch(`${BASE_URL}/api/destinations/top10`);
            const data = await res.json();
            return (data.items ?? data).map((v: any, i: number) => ({
                rank: v.rank ?? i + 1,
                city: v.city ?? v.name,
            }));
        }
        return ['파리', '런던 세인트파크라스', '서울', '양산', '부산', '속초', '진주', '여수', '전주', '대구'].map((city, i) => ({
            rank: i + 1,
            city,
        }));
    }

    async function fetchPlacesByCategory(cat: Category, center: { lat: number; lng: number }): Promise<Place[]> {
        if (BACKEND_ENABLED) {
            const url = `${BASE_URL}/api/nearby?lat=${center.lat}&lng=${center.lng}&radius=${RADIUS_KM * 1000}&category=${cat}`;
            const res = await fetch(url);
            const data = await res.json();
            return (data.items ?? data).map((v: any) => ({
                id: String(v.id ?? v.placeId),
                name: v.name,
                lat: v.lat,
                lng: v.lng,
                address: v.address,
                rating: v.rating,
                iconUrl: v.iconUrl,
            }));
        }
        const labels: Record<Category, string[]> = {
            toilet: ['공중화장실', '역 화장실', '공원 화장실', '주차장 화장실', '관공서 화장실'],
            store: ['GS25', 'CU', '세븐일레븐', '이마트24', '로손'],
            hospital: ['내과의원', '치과의원', '정형외과', '응급의료', '소아과'],
            gas: ['GS칼텍스', 'SK주유소', '현대오일뱅크', 'S-OIL', '무인주유'],
        };
        return labels[cat].map((n, i) => {
            const km = 0.15 + (i + 1) * 0.18;
            const bearing = (i * 65) * Math.PI / 180;
            const dLat = (km / 110.574) * Math.cos(bearing);
            const dLng = (km / (111.32 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(bearing);
            return {
                id: `${cat}-${i}`,
                name: n,
                lat: center.lat + dLat,
                lng: center.lng + dLng,
                address: `${n} 주소`,
                rating: 3.5 + (i % 3) * 0.4,
                iconUrl: undefined,
            };
        });
    }

    async function fetchSearch(keyword: string): Promise<SearchItem[]> {
        if (BACKEND_ENABLED) {
            const res = await fetch(`${BASE_URL}/api/destinations/search?q=${encodeURIComponent(keyword)}&size=20`);
            const data = await res.json();
            return (data.items ?? data).map((v: any) => ({
                id: String(v.id ?? v.slug ?? v.placeId),
                title: v.title ?? v.name,
                address: v.address ?? v.countryName,
                lat: v.lat,
                lng: v.lng,
                rating: v.rating,
                imageUrl: v.imageUrl ?? v.coverUrl,
            }));
        }
        const baseLat = region.latitude,
            baseLng = region.longitude;
        return Array.from({ length: 10 }).map((_, i) => ({
            id: `${keyword}-${i}`,
            title: `${keyword} 랜드마크 ${i + 1}`,
            address: `${keyword} 중심가 ${100 + i}번지`,
            lat: baseLat + 0.01 * Math.cos(i),
            lng: baseLng + 0.01 * Math.sin(i),
            rating: 4.0 - ((i % 4) * 0.3),
            imageUrl: 'https://picsum.photos/seed/' + encodeURIComponent(keyword + i) + '/800/480',
        }));
    }

    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoadingTop10(true);
            try {
                const list = await fetchCityTop10();
                if (!ignore) setRanks(list);
            } finally {
                if (!ignore) setLoadingTop10(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;
        (async () => {
            if (!active) return setPlaces([]);
            setLoadingPlaces(true);
            try {
                const list = await fetchPlacesByCategory(active, { lat: region.latitude, lng: region.longitude });
                if (!ignore) setPlaces(list);
            } finally {
                if (!ignore) setLoadingPlaces(false);
            }
        })();
        return () => {
            ignore = true;
        };
    }, [active, region.latitude, region.longitude]);

    useEffect(() => {
        if (!mapRef.current) return;
        const THRESHOLD_DEG = 0.0003;
        const prev = prevCenterRef.current;
        if (
            prev &&
            Math.abs(region.latitude - prev.lat) < THRESHOLD_DEG &&
            Math.abs(region.longitude - prev.lng) < THRESHOLD_DEG
        )
            return;
        prevCenterRef.current = { lat: region.latitude, lng: region.longitude };

        mapRef.current.animateToRegion(
            {
                latitude: region.latitude,
                longitude: region.longitude,
                latitudeDelta: zoomRef.current.latitudeDelta,
                longitudeDelta: zoomRef.current.longitudeDelta,
            },
            350,
        );
    }, [region.latitude, region.longitude]);

    const onSubmitSearch = () => {
        const keyword = q.trim();
        if (!keyword) return;
        Keyboard.dismiss();
        sheetRef.current?.snapToIndex(2);
    };

    const onChangeQuery = (text: string) => {
        setQ(text);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        const kw = text.trim();
        if (kw.length > 0) sheetRef.current?.snapToIndex(2);
        debounceTimer.current = setTimeout(async () => {
            if (!kw) {
                setResults([]);
                setSearchError(null);
                setLoadingSearch(false);
                return;
            }
            setLoadingSearch(true);
            setSearchError(null);
            try {
                const list = await fetchSearch(kw);
                setResults(list);
            } catch (e: any) {
                setSearchError(e?.message ?? '검색 실패');
            } finally {
                setLoadingSearch(false);
            }
        }, 350);
    };

    const focusOn = (lat?: number, lng?: number) => {
        if (!lat || !lng || !mapRef.current) return;
        mapRef.current.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 400);
    };

    const recenterToCurrent = async () => {
        try {
            // 1) 위치 권한 요청 (이미 허용돼 있으면 바로 통과)
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('위치 접근 불가', '설정에서 위치 권한을 허용해 주세요.');
                return;
            }

            // 2) 현재 위치 가져오기
            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const { latitude, longitude } = pos.coords;

            // 3) 그 위치로 맵 이동
            if (mapRef.current) {
                mapRef.current.animateToRegion(
                    {
                        latitude,
                        longitude,
                        latitudeDelta: DEFAULT_DELTA,
                        longitudeDelta: DEFAULT_DELTA,
                    },
                    400,
                );
            }
        } catch (e) {
            console.log('recenterToCurrent error', e);
            Alert.alert('오류', '현재 위치를 가져오지 못했어요.');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={{ ...region, latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA }}
                onRegionChangeComplete={(r: Region) => {
                    setRegion(r);
                    zoomRef.current = { latitudeDelta: r.latitudeDelta, longitudeDelta: r.longitudeDelta };
                }}
                showsUserLocation
                showsMyLocationButton
                onMapReady={() =>
                    mapRef.current?.animateToRegion(
                        { ...region, latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA },
                        1,
                    )
                }
            >

            {active && (
                    <Circle
                        center={{ latitude: region.latitude, longitude: region.longitude }}
                        radius={RADIUS_KM * 1000}
                        strokeColor="rgba(0,0,0,0.25)"
                        fillColor="rgba(0,0,0,0.08)"
                    />
                )}
                {places.map((p) => (
                    <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} title={p.name} description={p.address} />
                ))}
                <Marker
                    coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                    title="현재 중심"
                    description="지도의 중심 좌표"
                    pinColor="blue"
                />
            </MapView>

            <View style={styles.header}>
                <Text style={styles.logo}>WayGo</Text>
                <View style={styles.chipsRow}>
                    {(['toilet', 'store', 'hospital', 'gas'] as Category[]).map((c) => (
                        <Text
                            key={c}
                            onPress={() => setActive((prev) => (prev === c ? null : c))}
                            style={[styles.chip, active === c && styles.chipActive]}
                        >
                            {c === 'toilet' ? '🚻 화장실' : c === 'store' ? '🏪 편의점' : c === 'hospital' ? '🏥 병원' : '⛽ 주유소'}
                        </Text>
                    ))}
                </View>

                <View style={styles.recenterRow}>
                    <TouchableOpacity style={styles.recenterButton} onPress={recenterToCurrent}>
                        <Text style={styles.recenterText}>📍</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <BottomSheet ref={sheetRef} index={sheetIndex} snapPoints={snapPoints} enablePanDownToClose={false} onChange={setSheetIndex}>
                <BottomSheetView style={styles.sheetContent}>
                    <View style={styles.searchBox}>
                        <TextInput
                            value={q}
                            onChangeText={onChangeQuery}
                            placeholder="여행지 검색"
                            onFocus={() => sheetRef.current?.snapToIndex(2)}
                            returnKeyType="search"
                            onSubmitEditing={onSubmitSearch}
                            style={{ fontSize: 16, paddingVertical: 10 }}
                        />
                    </View>

                    {q.trim().length === 0 ? (
                        <>
                            {loadingTop10 && <ActivityIndicator style={{ marginTop: 6 }} />}

                            {/* 1~5 왼쪽, 6~10 오른쪽 */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {/* 왼 12345 */}
                                <View style={{ flex: 1 }}>
                                    {ranks.slice(0, 5).map((item) => (
                                        <View key={item.rank} style={styles.rankItem}>
                                            <Text style={styles.rankText}>{item.rank}. {item.city}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* 오 678910 */}
                                <View style={{ flex: 1 }}>
                                    {ranks.slice(5, 10).map((item) => (
                                        <View key={item.rank} style={styles.rankItem}>
                                            <Text style={styles.rankText}>{item.rank}. {item.city}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            {loadingSearch && <ActivityIndicator style={{ marginTop: 6 }} />}
                            {!!searchError && <Text style={{ color: '#dc2626' }}>{searchError}</Text>}

                            <BottomSheetFlatList
                                data={results.slice(0, 2)}
                                keyExtractor={(it: SearchItem) => it.id}
                                showsVerticalScrollIndicator={true}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                style={{ flex: 1 }}
                                ListEmptyComponent={!loadingSearch ? <Text style={{ color: '#6b7280' }}>검색 결과가 없어요.</Text> : null}
                                renderItem={({ item }: { item: SearchItem }) => (
                                    <TouchableOpacity style={styles.card} onPress={() => focusOn(item.lat, item.lng)}>
                                        {!!item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />}
                                        <View style={styles.cardBody}>
                                            <Text style={styles.cardTitle}>{item.title}</Text>
                                            {!!item.address && (
                                                <Text style={styles.cardMeta} numberOfLines={1}>
                                                    {item.address}
                                                </Text>
                                            )}
                                            {!!item.rating && <Text style={styles.cardMeta}>⭐ {item.rating.toFixed(1)}</Text>}
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </>
                    )}

                    {active && (
                        <Text style={{ color: '#6b7280', marginTop: 6 }}>
                            {loadingPlaces
                                ? '주변 장소 불러오는 중…'
                                : `반경 ${RADIUS_KM}km 내 "${
                                    active === 'toilet'
                                        ? '화장실'
                                        : active === 'store'
                                            ? '편의점'
                                            : active === 'hospital'
                                                ? '병원'
                                                : '주유소'
                                }" 표시 중`}
                        </Text>
                    )}
                </BottomSheetView>
            </BottomSheet>

            {sheetIndex < 2 && (
                <View style={styles.footer}>
                    {/* TODO: 아래 경로들은 나중에 실제 스크린 구조 맞춰서 수정하면 됨 */}
                    <TouchableOpacity onPress={() => router.push('/(tabs)/translate')}>
                        <Text style={styles.footerText}>🌐</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
                        <Text style={styles.footerText}>📅</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(tabs)/go')}>
                        <View style={styles.go}>
                            <Text style={styles.goText}>Go!</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(tabs)/community')}>
                        <Text style={styles.footerText}>💬</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(tabs)/mypage')}>
                        <Text style={styles.footerText}>👤</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: { position: 'absolute', top: 44, left: 0, right: 0, paddingHorizontal: 12, paddingBottom: 6 },
    logo: { fontSize: 24, fontWeight: '800', marginLeft: 12, marginBottom: 6, textAlign: 'left' },
    chipsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' },
    chip: {
        backgroundColor: '#fff',
        borderColor: '#eee',
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        color: '#111',
    },
    chipActive: { backgroundColor: '#111', color: '#fff' },

    searchBox: {
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },

    sheetContent: {
        paddingHorizontal: 16,
        gap: 12,
        minHeight: SCREEN_HEIGHT * 0.9,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardImage: { width: '100%', height: 230, backgroundColor: '#f1f5f9' },
    cardBody: { paddingHorizontal: 12, paddingVertical: 10 },
    cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
    cardMeta: { fontSize: 13, color: '#6b7280' },

    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        paddingBottom: 18,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    footerText: { fontSize: 18 },
    go: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -30,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    goText: { color: '#fff', fontWeight: '700', fontSize: 22 },

    // 실시간 여행지 순위
    rankItem: {
        marginVertical: 6,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    rankText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111',
    },

    //현위치 받아오는 버튼
    recenterRow: {
        marginTop: 8,
        alignItems: 'flex-end',   // 오른쪽 정렬
        paddingRight: 30,         // 오른쪽 여백 12
    },
    recenterButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: '#111',
    },
    recenterText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});