// app/(tabs)/calendar/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";

const STORAGE_KEY = "WAYGO_SAVED_ITINERARIES";

type SavedItineraryMeta = {
    id: string;        // "2025-11-27_2025-11-29"
    startDate: string; // "YYYY-MM-DD"
    endDate: string;   // "YYYY-MM-DD"
    title: string;     // "광주 여행"
    json: string;      // 전체 일정 JSON (result.tsx에서 저장한 것)
};

// react-native-calendars가 export 안 해주는 markedDates 타입 직접 선언
type MarkedDatesType = {
    [date: string]: {
        selected?: boolean;
        marked?: boolean;
        dotColor?: string;
        selectedColor?: string;
        selectedTextColor?: string;
        disabled?: boolean;
        disableTouchEvent?: boolean;
    };
};

export default function CalendarScreen() {
    const router = useRouter();

    const [savedList, setSavedList] = useState<SavedItineraryMeta[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // 1) 저장된 일정 불러오기
    useEffect(() => {
        const loadSaved = async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (!raw) return;
                const list = JSON.parse(raw) as SavedItineraryMeta[];
                setSavedList(list);
            } catch (e) {
                console.warn("저장된 일정 불러오기 실패:", e);
            }
        };
        loadSaved();
    }, []);

    // 2) 캘린더에 표시할 markedDates 만들기 (형광펜 + 점)
    const markedDates: MarkedDatesType = useMemo(() => {
        const marks: MarkedDatesType = {};

        savedList.forEach((trip) => {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            const loop = new Date(start);

            while (loop <= end) {
                const key = loop.toISOString().slice(0, 10); // YYYY-MM-DD
                const prev = marks[key] ?? {};
                marks[key] = {
                    ...prev,
                    marked: true,
                    dotColor: "#2563EB",
                };
                loop.setDate(loop.getDate() + 1);
            }
        });

        // 선택한 날짜 스타일
        if (selectedDate) {
            const prev = marks[selectedDate] ?? {};
            marks[selectedDate] = {
                ...prev,
                selected: true,
                selectedColor: "#000",
                selectedTextColor: "#fff",
            };
        }

        return marks;
    }, [savedList, selectedDate]);

    // 3) 선택된 날짜에 해당하는 여행 목록 + 그날의 일정만 추려오기
    const selectedTrips = useMemo(() => {
        if (!selectedDate) return [];

        return savedList
            .map((trip) => {
                const s = new Date(trip.startDate);
                const e = new Date(trip.endDate);
                const d = new Date(selectedDate);

                const includes =
                    s.getTime() <= d.getTime() && d.getTime() <= e.getTime();
                if (!includes) return null;

                try {
                    const itinerary = JSON.parse(trip.json);
                    const dayPlan = itinerary.days?.find(
                        (d: any) => d.date === selectedDate
                    );
                    return { trip, dayPlan };
                } catch (err) {
                    console.warn("선택 날짜 일정 파싱 오류:", err);
                    return { trip, dayPlan: null };
                }
            })
            .filter(
                (x): x is { trip: SavedItineraryMeta; dayPlan: any } => !!x
            );
    }, [selectedDate, savedList]);

    // 4) 오른쪽 위 버튼 - 가장 가까운 여행 일정 result 화면으로 이동
    const goToNearestSchedule = () => {
        const today = new Date();
        const upcoming = savedList.filter(
            (meta) => new Date(meta.endDate) >= today
        );

        if (upcoming.length === 0) {
            alert("다가오는 여행 일정이 없습니다.");
            return;
        }

        upcoming.sort(
            (a, b) =>
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

        const nearest = upcoming[0];

        router.push({
            pathname: "/(tabs)/go/result",
            params: { json: nearest.json },
        });
    };

    return (
        <View style={styles.screen}>
            {/* 상단 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.push("/(tabs)/home")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.logo}>WayGo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.headerIcon}
                    onPress={goToNearestSchedule}
                    activeOpacity={0.8}
                >
                    <Ionicons name="calendar-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* 캘린더 */}
            <Calendar
                style={styles.calendar}
                markedDates={markedDates}
                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                theme={{
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 14,
                }}
            />

            {/* 아래 선택 날짜 일정 카드들 */}
            <ScrollView style={styles.bottomPanel}>
                {!selectedDate ? (
                    <Text style={styles.infoText}>날짜를 선택해 주세요.</Text>
                ) : selectedTrips.length === 0 ? (
                    <Text style={styles.infoText}>선택한 날짜의 일정이 없습니다.</Text>
                ) : (
                    selectedTrips.map(({ trip, dayPlan }, index) => {
                        const items = dayPlan?.items ?? [];
                        return (
                            <View key={index} style={styles.tripBox}>
                                <Text style={styles.tripTitle}>{trip.title}</Text>

                                {items.length === 0 ? (
                                    <Text style={styles.tripItemEmpty}>
                                        이 날에는 등록된 세부 일정이 없습니다.
                                    </Text>
                                ) : (
                                    items.slice(0, 4).map((item: any, idx: number) => (
                                        <Text key={idx} style={styles.tripItem}>
                                            {item.time ? `${item.time}  ` : ""}
                                            {item.description}
                                        </Text>
                                    ))
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

// ---------- 스타일 ----------
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "800",
    },
    headerIcon: {
        padding: 6,
    },
    logo: {
        fontSize: 24,
        fontWeight: "700",
        marginTop: -4,
    },
    calendar: {
        borderBottomWidth: 1,
        borderColor: "#E5E7EB",
    },
    bottomPanel: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 12,
    },
    infoText: {
        textAlign: "center",
        paddingVertical: 20,
        color: "#6B7280",
    },
    tripBox: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
    },
    tripTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },
    tripItem: {
        fontSize: 14,
        marginBottom: 4,
        color: "#111827",
    },
    tripItemEmpty: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 4,
    },
    viewFullButton: {
        marginTop: 10,
    },
    viewFullText: {
        color: "#2563EB",
        fontWeight: "600",
    },
});
