// app/(tabs)/home/index.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Keyboard, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import useCurrentRegion from '@/hooks/useCurrentRegion';

// ------------ 타입 -------------
type Category = 'toilet' | 'store' | 'hospital' | 'gas';
type Place = { id: string; name: string; lat: number; lng: number; address?: string; rating?: number; iconUrl?: string };
type CityRank = { rank: number; city: string };
type SearchItem = { id: string; title: string; address?: string; lat?: number; lng?: number; rating?: number; imageUrl?: string };

const RADIUS_KM = 1;
const DEFAULT_DELTA = 0.015;

// ============ 백엔드 스위치/설정 ============
const BACKEND_ENABLED = false; // ✅ 백엔드 준비되면 true로
const BASE_URL = 'https://YOUR-BACKEND.EXAMPLE.COM'; // ✅ TODO: 백엔드 베이스 URL

export default function HomeScreen() {
    const { region, setRegion } = useCurrentRegion();

    // 지도/시트 레퍼런스
    const mapRef = useRef<MapView>(null);
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['15%','45%','90%'], []);
    const [sheetIndex, setSheetIndex] = useState(1); // ✅ 기본: 반쯤(Top10 보이도록)

    // 줌 유지
    const zoomRef = useRef({ latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA });
    const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null);

    // 카테고리
    const [active, setActive] = useState<Category | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);

    // Top10
    const [ranks, setRanks] = useState<CityRank[]>([]);
    const [loadingTop10, setLoadingTop10] = useState(false);

    // 검색
    const [q, setQ] = useState('');
    const [results, setResults] = useState<SearchItem[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null); // ✅ 안정적 타입

    // ------------------ 백엔드 연동 지점들 ------------------

    // (1) 실시간 여행지 순위 Top10
    async function fetchCityTop10(): Promise<CityRank[]> {
        if (BACKEND_ENABLED) {
            // TODO: 실제 엔드포인트로 교체
            // 예: GET /api/destinations/top10
            const res = await fetch(`${BASE_URL}/api/destinations/top10`);
            const data = await res.json();
            return (data.items ?? data).map((v: any, i: number) => ({ rank: v.rank ?? i + 1, city: v.city ?? v.name }));
        }
        // ---- Mock ----
        return ['파리','도쿄','서울','양산','부산','속초','진주','여수','전주','대구'].map((city, i) => ({ rank: i+1, city }));
    }

    // (2) 카테고리: 반경 1km 내 장소
    async function fetchPlacesByCategory(cat: Category, center: { lat: number; lng: number }): Promise<Place[]> {
        if (BACKEND_ENABLED) {
            // TODO: 실제 엔드포인트로 교체
            // 예: GET /api/nearby?lat=..&lng=..&radius=1000&category=hospital
            const url = `${BASE_URL}/api/nearby?lat=${center.lat}&lng=${center.lng}&radius=${RADIUS_KM*1000}&category=${cat}`;
            const res = await fetch(url);
            const data = await res.json();
            return (data.items ?? data).map((v: any) => ({
                id: String(v.id ?? v.placeId),
                name: v.name,
                lat: v.lat, lng: v.lng,
                address: v.address,
                rating: v.rating,
                iconUrl: v.iconUrl,
            }));
        }
        // ---- Mock ----
        const labels: Record<Category, string[]> = {
            toilet:   ['공중화장실','역 화장실','공원 화장실','주차장 화장실','관공서 화장실'],
            store:    ['GS25','CU','세븐일레븐','이마트24','로손'],
            hospital: ['내과의원','치과의원','정형외과','응급의료','소아과'],
            gas:      ['GS칼텍스','SK주유소','현대오일뱅크','S-OIL','무인주유'],
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

    // (3) 검색: 도시/랜드마크
    async function fetchSearch(keyword: string): Promise<SearchItem[]> {
        if (BACKEND_ENABLED) {
            // TODO: 실제 엔드포인트로 교체
            // 예: GET /api/destinations/search?q=파리
            const res = await fetch(`${BASE_URL}/api/destinations/search?q=${encodeURIComponent(keyword)}&size=20`);
            const data = await res.json();
            return (data.items ?? data).map((v: any) => ({
                id: String(v.id ?? v.slug ?? v.placeId),
                title: v.title ?? v.name,
                address: v.address ?? v.countryName,
                lat: v.lat, lng: v.lng,
                rating: v.rating,
                imageUrl: v.imageUrl ?? v.coverUrl,
            }));
        }
        // ---- Mock ----
        const baseLat = region.latitude, baseLng = region.longitude;
        return Array.from({ length: 10 }).map((_, i) => ({
            id: `${keyword}-${i}`,
            title: `${keyword} 랜드마크 ${i+1}`,
            address: `${keyword} 중심가 ${100+i}번지`,
            lat: baseLat + 0.01 * Math.cos(i),
            lng: baseLng + 0.01 * Math.sin(i),
            rating: 4.0 - (i % 4) * 0.3,
            imageUrl: 'https://picsum.photos/seed/' + encodeURIComponent(keyword + i) + '/800/480',
        }));
    }

    // ------------------ 이펙트 ------------------

    // Top10 로드
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
        return () => { ignore = true; };
    }, []);

    // 카테고리 변경/위치 변경 시 장소 갱신
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
        return () => { ignore = true; };
    }, [active, region.latitude, region.longitude]);

    // GPS 위치 변동 시 카메라 이동(줌 유지)
    useEffect(() => {
        if (!mapRef.current) return;
        const THRESHOLD_DEG = 0.0003;
        const prev = prevCenterRef.current;
        if (prev && Math.abs(region.latitude - prev.lat) < THRESHOLD_DEG && Math.abs(region.longitude - prev.lng) < THRESHOLD_DEG) return;
        prevCenterRef.current = { lat: region.latitude, lng: region.longitude };

        mapRef.current.animateToRegion({
            latitude: region.latitude,
            longitude: region.longitude,
            latitudeDelta: zoomRef.current.latitudeDelta,
            longitudeDelta: zoomRef.current.longitudeDelta,
        }, 350);
    }, [region.latitude, region.longitude]);

    // ------------------ 핸들러 ------------------

    const onSubmitSearch = () => {
        const keyword = q.trim();
        if (!keyword) return;
        Keyboard.dismiss();
        sheetRef.current?.snapToIndex(2); // 최상단
    };

    const onChangeQuery = (text: string) => {
        setQ(text);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        const kw = text.trim();
        if (kw.length > 0) sheetRef.current?.snapToIndex(2); // 입력 시작 → 상단으로
        debounceTimer.current = setTimeout(async () => {
            if (!kw) { setResults([]); setSearchError(null); setLoadingSearch(false); return; }
            setLoadingSearch(true); setSearchError(null);
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

    // ------------------ 렌더 ------------------

    return (
        <View style={{ flex: 1 }}>
            {/* 지도 */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={{ ...region, latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA }}
                onRegionChangeComplete={(r: Region) => { setRegion(r); zoomRef.current = { latitudeDelta: r.latitudeDelta, longitudeDelta: r.longitudeDelta }; }}
                showsUserLocation
                showsMyLocationButton
                onMapReady={() => mapRef.current?.animateToRegion({ ...region, latitudeDelta: DEFAULT_DELTA, longitudeDelta: DEFAULT_DELTA }, 1)}
            >
                {active && (
                    <Circle
                        center={{ latitude: region.latitude, longitude: region.longitude }}
                        radius={RADIUS_KM * 1000}
                        strokeColor="rgba(0,0,0,0.25)"
                        fillColor="rgba(0,0,0,0.08)"
                    />
                )}
                {places.map(p => (
                    <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} title={p.name} description={p.address} />
                ))}
                <Marker
                    coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                    title="현재 중심"
                    description="지도의 중심 좌표"
                    pinColor="blue"
                />
            </MapView>

            {/* 상단 로고 + 카테고리 */}
            <View style={styles.header}>
                <Text style={styles.logo}>WayGo</Text>
                <View style={styles.chipsRow}>
                    {(['toilet','store','hospital','gas'] as Category[]).map(c => (
                        <Text
                            key={c}
                            onPress={() => setActive(prev => prev === c ? null : c)}
                            style={[styles.chip, active === c && styles.chipActive]}
                        >
                            {c==='toilet'?'🚻 화장실':c==='store'?'🏪 편의점':c==='hospital'?'🏥 병원':'⛽ 주유소'}
                        </Text>
                    ))}
                </View>
            </View>

            {/* 바텀시트: 기본(Top10) → 검색 시 결과 */}
            <BottomSheet ref={sheetRef} index={sheetIndex} snapPoints={snapPoints} enablePanDownToClose={false} onChange={setSheetIndex}>
                <BottomSheetView style={{ paddingHorizontal:16, gap:12 }}>
                    {/* 검색바 */}
                    <View style={styles.searchBox}>
                        <TextInput
                            value={q}
                            onChangeText={onChangeQuery}
                            placeholder="여행지/도시/랜드마크 검색"
                            onFocus={() => sheetRef.current?.snapToIndex(2)} // 눌렀을 때 상단으로 & 키보드
                            returnKeyType="search"
                            onSubmitEditing={onSubmitSearch}
                            style={{ fontSize:16, paddingVertical:10 }}
                        />
                    </View>

                    {/* ✅ q가 없으면: Top10 / 있으면: 검색 결과 */}
                    {q.trim().length === 0 ? (
                        <>
                            <Text style={{ fontWeight:'700' }}>실시간 여행지 순위</Text>
                            {loadingTop10 && <ActivityIndicator style={{ marginTop:6 }} />}
                            <FlatList
                                data={ranks}
                                keyExtractor={(i)=>String(i.rank)}
                                renderItem={({item}) => <Text style={{ paddingVertical:6 }}>{item.rank}. {item.city}</Text>}
                                showsVerticalScrollIndicator={false}
                            />
                        </>
                    ) : (
                        <>
                            {loadingSearch && <ActivityIndicator style={{ marginTop:6 }} />}
                            {!!searchError && <Text style={{ color:'#dc2626' }}>{searchError}</Text>}

                            {/* 🔥 검색 결과: 상위 3개만, 이미지 크게 */}
                            <FlatList
                                data={results.slice(0, 3)}
                                keyExtractor={(it) => it.id}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={!loadingSearch ? <Text style={{ color:'#6b7280' }}>검색 결과가 없어요.</Text> : null}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.card} onPress={() => focusOn(item.lat, item.lng)}>
                                        {!!item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />}
                                        <View style={styles.cardBody}>
                                            <Text style={styles.cardTitle}>{item.title}</Text>
                                            {!!item.address && <Text style={styles.cardMeta} numberOfLines={1}>{item.address}</Text>}
                                            {!!item.rating && <Text style={styles.cardMeta}>⭐ {item.rating.toFixed(1)}</Text>}
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </>
                    )}

                    {/* 카테고리 상태 안내 */}
                    {active && (
                        <Text style={{ color:'#6b7280', marginTop:6 }}>
                            {loadingPlaces ? '주변 장소 불러오는 중…' : `반경 ${RADIUS_KM}km 내 "${active==='toilet'?'화장실':active==='store'?'편의점':active==='hospital'?'병원':'주유소'}" 표시 중`}
                        </Text>
                    )}
                </BottomSheetView>
            </BottomSheet>

            {/* 풋바 */}
            {sheetIndex < 2 && (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>🌐</Text>
                    <Text style={styles.footerText}>📅</Text>
                    <View style={styles.go}><Text style={styles.goText}>Go!</Text></View>
                    <Text style={styles.footerText}>💬</Text>
                    <Text style={styles.footerText}>👤</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: { position:'absolute', top:44, left:0, right:0, paddingHorizontal:12, paddingBottom:6 },
    logo: { fontSize:24, fontWeight:'800', marginLeft:12, marginBottom:6, textAlign:'left' },
    chipsRow: { flexDirection:'row', gap:8, justifyContent:'center', alignItems:'center' },
    chip: { backgroundColor:'#fff', borderColor:'#eee', borderWidth:1, paddingHorizontal:12, paddingVertical:8, borderRadius:16, color:'#111' },
    chipActive: { backgroundColor:'#111', color:'#fff' },

    searchBox: { borderRadius:12, backgroundColor:'#f3f4f6', paddingHorizontal:12, borderWidth:1, borderColor:'#e5e7eb' },

    // 🔥 큰 카드 레이아웃(이미지 전체폭)
    card: {
        backgroundColor:'#fff',
        borderRadius:16,
        overflow:'hidden',            // 이미지 라운드 적용
        marginBottom:16,
        borderWidth:1,
        borderColor:'#e5e7eb',
        shadowColor:'#000',
        shadowOpacity:0.08,
        shadowRadius:8,
        elevation:3,
    },
    cardImage: { width:'100%', height:230, backgroundColor:'#f1f5f9' }, // ← 이미지 크게
    cardBody: { paddingHorizontal:12, paddingVertical:10 },
    cardTitle: { fontSize:18, fontWeight:'800', marginBottom:4 },
    cardMeta: { fontSize:13, color:'#6b7280' },

    // 풋바
    footer: { position:'absolute', left:0, right:0, bottom:0, backgroundColor:'#fff', paddingBottom:18, paddingTop:10,
        flexDirection:'row', justifyContent:'space-around', alignItems:'center', borderTopWidth:1, borderColor:'#eee' },
    footerText: { fontSize:18 },
    go: { width:64, height:64, borderRadius:32, backgroundColor:'#111', alignItems:'center', justifyContent:'center', marginTop:-30, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:6, elevation:5 },
    goText: { color:'#fff', fontWeight:'700', fontSize:22 },
});
