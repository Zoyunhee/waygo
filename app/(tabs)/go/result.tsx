// app/(tabs)/go/result.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

// 일정 JSON 형식 정의
type DayItem = {
    time: string;
    description: string;
};

type DayPlan = {
    dayNumber: number;
    date: string;
    items: DayItem[];
};

type ParsedItineraryJson = {
    userName?: string;
    cityName?: string;
    startDate?: string;
    endDate?: string;
    days: DayPlan[];
};

// 로컬에 저장할 일정 메타 정보
type SavedItineraryMeta = {
    id: string; // startDate_endDate
    startDate: string;
    endDate: string;
    title: string; // 예: "부산 여행"
    json: string; // 전체 일정 JSON 문자열
};

const STORAGE_KEY = "WAYGO_SAVED_ITINERARIES";

// 샘플 일정 데이터 (백엔드 붙이기 전용)
const SAMPLE_ITINERARY: ParsedItineraryJson = {
    userName: "주미짱",
    cityName: "고양시",
    startDate: "2024-11-01",
    endDate: "2024-11-03",
    days: [
        {
            dayNumber: 1,
            date: "2024-11-01",
            items: [
                { time: "08:00", description: "aaaaaaaaaaaaaaaaaaaaaa" },
                { time: "10:00", description: "bbbbbbbbbbbbbbbbbbbb" },
                { time: "12:00", description: "lunch 드세요" },
            ],
        },
        {
            dayNumber: 2,
            date: "2024-11-02",
            items: [
                { time: "09:00", description: "카페에서 여유로운 아침" },
                { time: "14:00", description: "공원 산책" },
            ],
        },
        {
            dayNumber: 3,
            date: "2024-11-03",
            items: [],
        },
    ],
};

export default function ItineraryResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [openDay, setOpenDay] = useState<number | null>(1);
    const [savedList, setSavedList] = useState<SavedItineraryMeta[]>([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [pendingSave, setPendingSave] = useState<SavedItineraryMeta | null>(
        null
    );
    const [saving, setSaving] = useState(false);

    // text / json 파라미터 꺼내기 (지금은 거의 안 씀)
    const textParam =
        typeof params.text === "string" ? params.text : "샘플 일정입니다.";
    const jsonParam = typeof params.json === "string" ? params.json : null;

    // jsonParam 이 있으면 그걸, 없으면 SAMPLE_ITINERARY 사용
    const itinerary = useMemo<ParsedItineraryJson>(() => {
        if (!jsonParam) {
            return SAMPLE_ITINERARY;
        }
        try {
            return JSON.parse(jsonParam) as ParsedItineraryJson;
        } catch (e) {
            console.warn("일정 JSON 파싱 오류, 샘플 사용", e);
            return SAMPLE_ITINERARY;
        }
    }, [jsonParam]);

    const { userName, cityName, startDate, endDate, days } = itinerary;

    // 앱 시작 시, 로컬에 저장된 일정 목록 불러오기
    useEffect(() => {
        const loadSaved = async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (!raw) return;
                const parsed = JSON.parse(raw) as SavedItineraryMeta[];
                setSavedList(parsed);
            } catch (e) {
                console.warn("저장된 일정 불러오기 실패:", e);
            }
        };
        loadSaved();
    }, []);

    // 저장 버튼 눌렀을 때
    const handleSave = async () => {
        if (!startDate || !endDate) {
            Alert.alert("저장 불가", "여행 날짜 정보가 없습니다.");
            return;
        }

        const meta: SavedItineraryMeta = {
            id: `${startDate}_${endDate}`,
            startDate,
            endDate,
            title: `${cityName ?? "여행지"} 여행`,
            json: JSON.stringify(itinerary),
        };

        // 같은 날짜 범위 일정 있는지 확인
        const existed = savedList.find(
            (item) => item.startDate === startDate && item.endDate === endDate
        );

        if (existed) {
            // 이미 있으면 다이얼로그 열기
            setPendingSave(meta);
            setDialogVisible(true);
        } else {
            // 없으면 바로 저장
            try {
                setSaving(true);
                const next = [...savedList, meta];
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                setSavedList(next);
                Alert.alert("저장 완료", "여행 일정이 저장되었습니다.");
            } catch (e) {
                console.warn("저장 실패:", e);
                Alert.alert("오류", "일정을 저장하는 중 문제가 발생했습니다.");
            } finally {
                setSaving(false);
            }
        }
    };

    // 다이얼로그 - Cancel (이번 일정 버림)
    const handleCancelUpdate = () => {
        setDialogVisible(false);
        setPendingSave(null);
        Alert.alert("저장 취소", "새로 생성한 일정은 저장되지 않았습니다.");
    };

    // 다이얼로그 - UPDATE (덮어쓰기)
    const handleConfirmUpdate = async () => {
        if (!pendingSave) return;
        try {
            setSaving(true);
            const filtered = savedList.filter(
                (item) =>
                    !(
                        item.startDate === pendingSave.startDate &&
                        item.endDate === pendingSave.endDate
                    )
            );
            const next = [...filtered, pendingSave];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            setSavedList(next);
            Alert.alert("업데이트 완료", "기존 일정이 새 일정으로 업데이트되었습니다.");
        } catch (e) {
            console.warn("업데이트 실패:", e);
            Alert.alert("오류", "일정을 업데이트하는 중 문제가 발생했습니다.");
        } finally {
            setSaving(false);
            setDialogVisible(false);
            setPendingSave(null);
        }
    };

    return (
        <View style={styles.screen}>
            {/* 위쪽: 스크롤되는 내용 */}
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* 헤더 - 로고를 누르면 홈으로 */}
                {/* 상단 바: 왼쪽 WayGo, 오른쪽 캘린더 아이콘 */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        onPress={() => router.push("/(tabs)/home")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.logo}>WayGo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push("/(tabs)/calendar")}
                        activeOpacity={0.8}
                        style={styles.iconButton}
                    >
                        <Ionicons name="calendar-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>


                <View style={{ alignItems: "center", marginBottom: 16 }}>
                    <Text style={styles.titleLine}>
                        ( {userName ?? "고객"} ) 님의 ( {cityName ?? "여행지"} ) 여행
                    </Text>
                    <Text style={styles.dateLine}>
                        {startDate ?? "시작일"} ~ {endDate ?? "종료일"} 일정
                    </Text>
                </View>

                {/* Day 드롭다운들 */}
                {days.map((day) => (
                    <View key={day.dayNumber} style={{ marginBottom: 12 }}>
                        <TouchableOpacity
                            style={styles.dayHeader}
                            onPress={() =>
                                setOpenDay((prev) =>
                                    prev === day.dayNumber ? null : day.dayNumber
                                )
                            }
                            activeOpacity={0.8}
                        >
                            <Text>{day.dayNumber}일 차</Text>
                            <Text>▼</Text>
                        </TouchableOpacity>

                        {openDay === day.dayNumber && (
                            <View style={styles.dayBody}>
                                <ScrollView
                                    style={{ maxHeight: 260 }} // 박스 안 최대 높이
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={true}
                                >
                                    {day.items.length === 0 ? (
                                        <Text style={styles.dayBodyEmpty}>
                                            등록된 일정이 없습니다.
                                        </Text>
                                    ) : (
                                        day.items.map((item, idx) => (
                                            <Text key={idx} style={styles.dayBodyLine}>
                                                {item.time ? `${item.time}  ` : ""}
                                                {item.description}
                                            </Text>
                                        ))
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                ))}

                {/* 필요하면 AI가 만들어준 raw text를 아래처럼 보여줄 수도 있음 */}
                {/*
        <Text style={styles.rawText} selectable>
          {textParam}
        </Text>
        */}
            </ScrollView>

            {/* 아래쪽: 고정된 풋터 버튼 영역 */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    activeOpacity={0.8}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>
                        {saving ? "저장 중..." : "저장"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("/(tabs)/go")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backButtonText}>설문으로 돌아가기</Text>
                </TouchableOpacity>
            </View>

            {/* Schedule Update 다이얼로그 */}
            <Modal
                visible={dialogVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCancelUpdate}
            >
                <View style={styles.dialogBackdrop}>
                    <View style={styles.dialogCard}>
                        <Text style={styles.dialogTitle}>Schedule Update</Text>
                        <Text style={styles.dialogMessage}>
                            이미 같은 날짜에 예정된 여행 일정이 있습니다.
                            {"\n"}
                            일정을 업데이트 하시겠습니까?
                        </Text>

                        <View style={styles.dialogButtonsRow}>
                            <TouchableOpacity
                                style={[styles.dialogButton, styles.dialogButtonCancel]}
                                onPress={handleCancelUpdate}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.dialogButtonCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.dialogButton, styles.dialogButtonConfirm]}
                                onPress={handleConfirmUpdate}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.dialogButtonConfirmText}>UPDATE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 24,
    },
    logo: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 16,
    },
    titleLine: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    dateLine: {
        fontSize: 14,
        color: "#4B5563",
    },
    dayHeader: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dayBody: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 12,
        minHeight: 180,
    },
    dayBodyLine: {
        fontSize: 13,
        marginBottom: 4,
        lineHeight: 18,
    },
    dayBodyEmpty: {
        fontSize: 13,
        color: "#9CA3AF",
    },
    rawText: {
        marginTop: 16,
        fontSize: 13,
        lineHeight: 18,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 12,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 8,
        borderTopWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
    },
    saveButton: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#F3F4F6",
        paddingVertical: 12,
        alignItems: "center",
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
    backButton: {
        marginTop: 12,
        alignSelf: "center",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#000",
    },
    backButtonText: {
        fontSize: 14,
    },
    dialogBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    dialogCard: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    dialogTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },
    dialogMessage: {
        fontSize: 13,
        color: "#4B5563",
        marginBottom: 16,
    },
    dialogButtonsRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    dialogButton: {
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 8,
        marginLeft: 8,
    },
    dialogButtonCancel: {
        backgroundColor: "#E5E7EB",
    },
    dialogButtonConfirm: {
        backgroundColor: "#2563EB",
    },
    dialogButtonCancelText: {
        fontSize: 14,
        color: "#111827",
    },
    dialogButtonConfirmText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    iconButton: {
        padding: 4,
    },

});
