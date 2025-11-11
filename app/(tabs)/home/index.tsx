import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Keyboard, Platform } from 'react-native';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import useCurrentRegion from '@/hooks/useCurrentRegion';

type Category = 'toilet' | 'store' | 'hospital' | 'gas';
type Place = { id: string; name: string; lat: number; lng: number; address?: string };
type CityRank = { rank: number; city: string };

const RADIUS_KM = 2;

export default function HomeScreen() {
    const { region, setRegion } = useCurrentRegion(); // region은 내부 상태로만 사용
    const [active, setActive] = useState<Category | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [sheetIndex, setSheetIndex] = useState(0);
    const [q, setQ] = useState('');
    const sheetRef = useRef<BottomSheet>(null);
    const mapRef = useRef<MapView>(null);

    // ---------- 임시 데이터 ----------
    async function fetchCityTop10(): Promise<CityRank[]> {
        return ['파리','도쿄','서울','양산','부산','속초','진주','여수','전주','대구'].map((city, i) => ({ rank: i+1, city }));
    }
    async function fetchPlacesByCategory(cat: Category): Promise<Place[]> {
        const names: Record<Category, string[]> = {
            toilet: ['공중화장실','역 화장실','공원 화장실','주차장 화장실','관공서 화장실'],
            store: ['GS25','CU','세븐일레븐','이마트24','로손'],
            hospital: ['내과의원','치과의원','정형외과','응급의료','소아과'],
            gas: ['GS칼텍스','SK주유소','현대오일뱅크','S-OIL','무인주유'],
        };
        return names[cat].map((n, i) => {
            const km = 0.2 + (i + 1) * 0.3;
            const bearing = (i * 70) * Math.PI / 180;
            const dLat = (km / 110.574) * Math.cos(bearing);
            const dLng = (km / (111.32 * Math.cos(region.latitude * Math.PI / 180))) * Math.sin(bearing);
            return { id: `${cat}-${i}`, name: n, lat: region.latitude + dLat, lng: region.longitude + dLng, address: `${n} 주소` };
        });
    }
    // -------------------------------

    useEffect(() => {
        let ignore = false;
        (async () => {
            if (!active) return setPlaces([]);
            const data = await fetchPlacesByCategory(active);
            if (!ignore) setPlaces(data);
        })();
        return () => { ignore = true; };
    }, [active, region.latitude, region.longitude]);

    const [ranks, setRanks] = useState<CityRank[]>([]);
    useEffect(() => { fetchCityTop10().then(setRanks).catch(()=>{}); }, []);

    const onSubmitSearch = () => {
        const keyword = q.trim();
        if (!keyword) return;
        console.log('검색:', keyword);
        Keyboard.dismiss();
    };

    // ✅ 위치가 갱신되면 지도 카메라만 이동 (region prop으로 제어하지 않음)
    useEffect(() => {
        if (!mapRef.current) return;
        const r: Region = {
            latitude: region.latitude,
            longitude: region.longitude,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
        };
        mapRef.current.animateToRegion(r, 350);
    }, [region.latitude, region.longitude]);

    // snapPoints는 메모이제이션(성능)
    const snapPoints = useMemo(() => ['15%','45%','90%'], []);

    return (
        <View style={{ flex: 1 }}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                // ✅ 초기만 initialRegion; 이후 이동은 animateToRegion으로
                initialRegion={region as any}
                onRegionChangeComplete={(r: Region) => setRegion(r)}
                showsUserLocation
                showsMyLocationButton
                // 웹에서 타일 로딩 지연 시 기본 위치 점프 방지
                onMapReady={() => mapRef.current?.animateToRegion(region as Region, 1)}
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
                            {c==='toilet'?'화장실':c==='store'?'편의점':c==='hospital'?'병원':'주유소'}
                        </Text>
                    ))}
                </View>
            </View>

            {/* 바텀시트 */}
            <BottomSheet
                ref={sheetRef}
                index={1}
                snapPoints={snapPoints}
                enablePanDownToClose={false}
                onChange={setSheetIndex}
            >
                <BottomSheetView style={{ paddingHorizontal:16, gap:12 }}>
                    <View style={styles.searchBox}>
                        <TextInput
                            value={q}
                            onChangeText={setQ}
                            placeholder="여행지 검색"
                            onFocus={() => sheetRef.current?.expand()}
                            returnKeyType="search"
                            onSubmitEditing={onSubmitSearch}
                            style={{ fontSize:16, paddingVertical:10 }}
                        />
                    </View>

                    <Text style={{ fontWeight:'600' }}>실시간 여행지 순위</Text>
                    <FlatList
                        data={ranks}
                        keyExtractor={(i)=>String(i.rank)}
                        renderItem={({item}) => <Text style={{ paddingVertical:4 }}>{item.rank}. {item.city}</Text>}
                    />
                </BottomSheetView>
            </BottomSheet>

            {/* 풋바 */}
            {sheetIndex < 2 && (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>번역</Text>
                    <Text style={styles.footerText}>캘린더</Text>
                    <View style={styles.go}><Text style={{ color:'#fff', fontWeight:'700' }}>Go!</Text></View>
                    <Text style={styles.footerText}>커뮤니티</Text>
                    <Text style={styles.footerText}>마이</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: { position:'absolute', top:44, left:0, right:0, paddingHorizontal:12, paddingBottom:6 },
    logo: { fontSize:24, fontWeight:'800', marginLeft:12, marginBottom:6 },
    chipsRow: { flexDirection:'row', gap:8, paddingHorizontal:12, justifyContent:'center', alignItems:'center',},
    chip: { backgroundColor:'#fff', borderColor:'#eee', borderWidth:1, paddingHorizontal:12, paddingVertical:8, borderRadius:16, color:'#111' },
    chipActive: { backgroundColor:'#111', color:'#fff' },
    searchBox: { borderRadius:12, backgroundColor:'#f3f4f6', paddingHorizontal:12, borderWidth:1, borderColor:'#e5e7eb' },
    footer: { position:'absolute', left:0, right:0, bottom:0, backgroundColor:'#fff', paddingBottom:18, paddingTop:10,
        flexDirection:'row', justifyContent:'space-around', alignItems:'center', borderTopWidth:1, borderColor:'#eee' },
    footerText: { fontSize:12 },
    go: { width:64, height:64, borderRadius:32, backgroundColor:'#111',
        alignItems:'center', justifyContent:'center', marginTop:-30, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:6, elevation:5 },
});
