// app/(tabs)/go/index.tsx
import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import AppInput from "@/components/AppInput";

type CalendarDay = {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
};

function QuestionTitle({
                           children,
                           style,
                       }: {
    children: React.ReactNode;
    style?: any;
}) {

    return <Text style={[styles.questionTitle, style]}>{children}</Text>;
}

function ChoiceButton({
                          label,
                          selected,
                          onPress,
                      }: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.choiceButton, selected && styles.choiceButtonSelected]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text
                style={[
                    styles.choiceButtonText,
                    selected && styles.choiceButtonTextSelected,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

export default function GoSurveyScreen() {
    const router = useRouter();
    // 1. 어디로 떠나십니까?
    const [destination, setDestination] = useState("");

    // 2. 여행 날짜
    const [startDate, setStartDate] = useState(""); // "2019-09-06"
    const [endDate, setEndDate] = useState("");

    // 달력 모달 상태
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [tempStartDate, setTempStartDate] = useState<string | null>(null);
    const [tempEndDate, setTempEndDate] = useState<string | null>(null);

    // 3. 승차권 예매 여부
    const [hasTicket, setHasTicket] = useState<"YES" | "NO" | null>(null);
    const [arrivalTime, setArrivalTime] = useState(""); // "10:00"
    const [returnTime, setReturnTime] = useState("");

    // 4. 여행 인원 (본인 포함)
    const [peopleCount, setPeopleCount] = useState("1");

    // 5. 여행 내 이동수단 (체크박스 느낌)
    const [transportTypes, setTransportTypes] = useState<string[]>([]);

    // 6-1. 여행 스타일 (최대 2개)
    const [travelStyles, setTravelStyles] = useState<string[]>([]);

    // 6-2. 여행 계획 스타일 (단일 선택)
    const [planStyle, setPlanStyle] = useState<"SLOW" | "TIGHT" | null>(null);

    // 7. 예산
    const [budget, setBudget] = useState("");

    // 8. 숙소 추천 여부
    const [needsHotel, setNeedsHotel] = useState<"YES" | "NO" | null>(null);
    const [hotelBudgetMin, setHotelBudgetMin] = useState("");
    const [hotelBudgetMax, setHotelBudgetMax] = useState("");

    // 체크박스 토글 공통 함수
    const toggleFromArray = (value: string, list: string[], limit?: number) => {
        const exists = list.includes(value);
        if (exists) return list.filter((v) => v !== value);
        if (limit && list.length >= limit) return list; // 최대 갯수 제한
        return [...list, value];
    };

    const handleGo = () => {
        // 1) 최소 입력 확인 (여행지, 날짜는 있어야 결과가 의미가 있으니까)
        if (!destination || !startDate || !endDate) {
            Alert.alert("입력 확인", "여행지와 여행 날짜를 입력해주세요.");
            return;
        }

        // 2) 나중에 백엔드에 보낼 값 (지금도 그대로 만듦)
        const payload = {
            destination,
            startDate,
            endDate,
            hasTicket,
            arrivalTime: hasTicket === "YES" ? arrivalTime : null,
            returnTime: hasTicket === "YES" ? returnTime : null,
            peopleCount: Number(peopleCount) || 0,
            transportTypes,
            travelStyles,
            planStyle,
            budget: Number(budget) || 0,
            needsHotel,
            hotelBudgetMin: needsHotel === "YES" ? hotelBudgetMin : null,
            hotelBudgetMax: needsHotel === "YES" ? hotelBudgetMax : null,
        };
        console.log("설문 값(백엔드 붙이기 전):", payload);

        // 3) 지금은 진짜 서버가 없으니까, 샘플 JSON을 직접 만들어서 넘겨줌
        const sampleJson = JSON.stringify({
            userName: "주미짱",
            cityName: destination || "여행지",
            startDate,
            endDate,
            days: [
                {
                    dayNumber: 1,
                    date: startDate,
                    items: [
                        { time: "08:00", description: "첫날 아침 일정 예시" },
                        { time: "13:00", description: "점심 & 카페" },
                    ],
                },
                {
                    dayNumber: 2,
                    date: endDate,
                    items: [{ time: "10:00", description: "둘째날 관광 일정 예시" }],
                },
            ],
        });

        // 4) 결과 화면으로 이동! (여기가 핵심)
        router.push({
            pathname: "/(tabs)/go/result",
            params: {
                text: "샘플 일정입니다.",
                json: sampleJson,
            },
        });
    };

    // 달력에서 날짜 클릭했을 때
    const handleDayPress = (day: CalendarDay) => {
        const selected = day.dateString; // "2024-11-24" 같은 형식

        if (!tempStartDate || (tempStartDate && tempEndDate)) {
            // 새로 시작
            setTempStartDate(selected);
            setTempEndDate(null);
        } else {
            // 두 번째 선택
            if (selected < tempStartDate) {
                setTempEndDate(tempStartDate);
                setTempStartDate(selected);
            } else {
                setTempEndDate(selected);
            }
        }
    };


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={80} // 헤더 높이에 맞춰서 필요하면 숫자 조금씩 조절
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
            {/* 헤더 */}
                <TouchableOpacity onPress={() => router.push("/(tabs)/home")} activeOpacity={0.8}>
                    <Text style={styles.logo}>WayGo</Text>
                </TouchableOpacity>

            {/* 1. 어디로 떠나십니까? */}
            <QuestionTitle>1 어디로 떠나십니까</QuestionTitle>
            <AppInput
                value={destination}
                onChangeText={setDestination}
                placeholder="검색"
            />

            {/* 2. 여행가는 날짜가 언제입니까? */}
            <QuestionTitle style={{ marginTop: 24 }}>
                2 여행가는 날짜가 언제입니까
            </QuestionTitle>

            {/* 텍스트 인풋 대신 달력 여는 터치 영역 (키보드 안 뜸) */}
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.fakeInput, { marginRight: 8 }]}
                    onPress={() => {
                        setTempStartDate(startDate || null);
                        setTempEndDate(endDate || null);
                        setCalendarVisible(true);
                    }}
                >
                    <Text
                        style={
                            startDate ? styles.fakeInputText : styles.fakeInputPlaceholder
                        }
                    >
                        {startDate || "시작일 (예: 2019-09-06)"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.fakeInput}
                    onPress={() => {
                        setTempStartDate(startDate || null);
                        setTempEndDate(endDate || null);
                        setCalendarVisible(true);
                    }}
                >
                    <Text
                        style={
                            endDate ? styles.fakeInputText : styles.fakeInputPlaceholder
                        }
                    >
                        {endDate || "끝나는 날"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 3. 승차권 예매하셨나요? */}
            <QuestionTitle style={{ marginTop: 24 }}>
                3. 여행지로 가는 이동 수단 승차권은 예매하셨나요?
            </QuestionTitle>

            <View style={styles.row}>
                <ChoiceButton
                    label="YES"
                    selected={hasTicket === "YES"}
                    onPress={() => setHasTicket("YES")}
                />
                <ChoiceButton
                    label="NO"
                    selected={hasTicket === "NO"}
                    onPress={() => setHasTicket("NO")}
                />
            </View>

            {/* YES일 때만 시간 질문 2개 */}
            {hasTicket === "YES" && (
                <View style={{ marginTop: 12 }}>
                    <Text style={styles.subQuestion}>
                        → 여행지에 몇 시 도착 예정인가요?
                    </Text>
                    <AppInput
                        value={arrivalTime}
                        onChangeText={setArrivalTime}
                        placeholder="예: 10:00"
                    />

                    <Text style={[styles.subQuestion, { marginTop: 16 }]}>
                        → 집으로 돌아가는 승차권은 몇 시인가요?
                    </Text>
                    <AppInput
                        value={returnTime}
                        onChangeText={setReturnTime}
                        placeholder="예: 20:00"
                    />
                </View>
            )}

            {/* 4. 여행 인원 */}
            <QuestionTitle style={{ marginTop: 24 }}>
                4. 여행을 함께 가는 인원이 본인 포함 몇 명입니까?
            </QuestionTitle>
            <AppInput
                value={peopleCount}
                onChangeText={setPeopleCount}
                keyboardType="number-pad"
                placeholder="인원 수"
            />

            {/* 5. 여행 내 이동수단 (복수 선택) */}
            <QuestionTitle style={{ marginTop: 24 }}>
                5. 여행지 내에서 어떤 이동수단을 이용하십니까? (복수 선택 가능)
            </QuestionTitle>
            <View style={styles.checkboxGroup}>
                {["버스", "지하철", "택시", "도보", "자차(렌트카)"].map((label) => (
                    <TouchableOpacity
                        key={label}
                        style={styles.checkboxRow}
                        onPress={() =>
                            setTransportTypes((prev) => toggleFromArray(label, prev))
                        }
                    >
                        <View
                            style={[
                                styles.checkbox,
                                transportTypes.includes(label) && styles.checkboxChecked,
                            ]}
                        />
                        <Text>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 6-1. 여행 스타일 (최대 2개) */}
            <QuestionTitle style={{ marginTop: 24 }}>
                6-1. 여행 스타일의 어떤 편이십니까? (최대 2개 선택)
            </QuestionTitle>
            <View style={styles.checkboxGroup}>
                {[
                    "활동적인 스타일",
                    "차분한 휴양 스타일",
                    "자연 탐방 스타일",
                    "문화/역사 탐방 스타일",
                    "도시 탐험 스타일",
                    "미식 여행 스타일",
                ].map((label) => (
                    <TouchableOpacity
                        key={label}
                        style={styles.checkboxRow}
                        onPress={() =>
                            setTravelStyles((prev) => toggleFromArray(label, prev, 2))
                        }
                    >
                        <View
                            style={[
                                styles.checkbox,
                                travelStyles.includes(label) && styles.checkboxChecked,
                            ]}
                        />
                        <Text>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 6-2. 여행 계획 스타일 (단일 선택) */}
            <QuestionTitle style={{ marginTop: 24 }}>
                6-2. 여행 계획 스타일이 어떤 편이십니까? (단일 선택)
            </QuestionTitle>
            <View style={styles.checkboxGroup}>
                {[
                    { key: "SLOW" as const, label: "느슨한 계획" },
                    { key: "TIGHT" as const, label: "세세한 계획" },
                ].map((item) => (
                    <TouchableOpacity
                        key={item.key}
                        style={styles.checkboxRow}
                        onPress={() => setPlanStyle(item.key)}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                planStyle === item.key && styles.checkboxChecked,
                            ]}
                        />
                        <Text>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 7. 예산 */}
            <QuestionTitle style={{ marginTop: 24 }}>
                7. 예산은 얼마입니까? (비행기값 제외)
            </QuestionTitle>
            <AppInput
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                placeholder="0원"
            />

            {/* 8. 숙소 추천 여부 */}
            <QuestionTitle style={{ marginTop: 24 }}>
                8. 숙소 추천도 원하십니까?
            </QuestionTitle>
            <View style={styles.row}>
                <ChoiceButton
                    label="YES"
                    selected={needsHotel === "YES"}
                    onPress={() => setNeedsHotel("YES")}
                />
                <ChoiceButton
                    label="NO"
                    selected={needsHotel === "NO"}
                    onPress={() => setNeedsHotel("NO")}
                />
            </View>

            {/* YES일 때만 숙소 예산 범위 */}
                {needsHotel === "YES" && (
                    <View style={{ marginTop: 12 }}>
                        <Text style={styles.subQuestion}>
                            • 숙소 예산은 어느 정도로 생각하고 계십니까?
                        </Text>
                        <View style={styles.priceRow}>
                            <AppInput
                                style={styles.priceInput}
                                value={hotelBudgetMin}
                                onChangeText={setHotelBudgetMin}
                                keyboardType="numeric"
                                placeholder="0원"
                            />
                            <Text style={styles.priceTilde}>~</Text>
                            <AppInput
                                style={styles.priceInput}
                                value={hotelBudgetMax}
                                onChangeText={setHotelBudgetMax}
                                keyboardType="numeric"
                                placeholder="0원"
                            />
                        </View>
                    </View>
                )}

            {/* 맨 아래 GO 버튼 */}
            <View style={styles.goWrapper}>
                <TouchableOpacity
                    style={styles.goButton}
                    onPress={handleGo}
                    activeOpacity={0.8}
                >
                    <Text style={styles.goButtonText}>GO!</Text>
                </TouchableOpacity>
            </View>

            {/* 날짜 선택 달력 모달 */}
            <Modal
                visible={calendarVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCalendarVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 8 }}>
                            여행 날짜를 선택해주세요
                        </Text>

                        <Calendar
                            onDayPress={handleDayPress}
                            markedDates={
                                {
                                    ...(tempStartDate
                                        ? {
                                            [tempStartDate]: {
                                                startingDay: true,
                                                selected: true,
                                                color: "#000",
                                                textColor: "#fff",
                                            },
                                        }
                                        : {}),
                                    ...(tempEndDate
                                        ? {
                                            [tempEndDate]: {
                                                endingDay: true,
                                                selected: true,
                                                color: "#000",
                                                textColor: "#fff",
                                            },
                                        }
                                        : {}),
                                } as any
                            }
                            markingType="period"
                        />

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                                marginTop: 12,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => setCalendarVisible(false)}
                                style={{ paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 }}
                            >
                                <Text>취소</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if (!tempStartDate) return;
                                    setStartDate(tempStartDate);
                                    setEndDate(tempEndDate || tempStartDate);
                                    setCalendarVisible(false);
                                }}
                                style={styles.modalConfirmBtn}
                            >
                                <Text style={{ color: "white", fontWeight: "600" }}>완료</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 60,
    },
    logo: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 24,
    },
    questionTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    subQuestion: {
        fontSize: 13,
        marginBottom: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    flex1: {
        flex: 1,
    },
    choiceButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#000",
        paddingVertical: 10,
        borderRadius: 999,
        alignItems: "center",
        marginRight: 8,
    },
    choiceButtonSelected: {
        backgroundColor: "#000",
    },
    choiceButtonText: {
        fontSize: 14,
        letterSpacing: 2,
    },
    choiceButtonTextSelected: {
        color: "#fff",
        fontWeight: "600",
    },
    checkboxGroup: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: "#007AFF",
        marginRight: 8,
    },
    checkboxChecked: {
        backgroundColor: "#007AFF",
    },
    fakeInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        justifyContent: "center",
        backgroundColor: "#fafafa",
    },
    fakeInputText: {
        fontSize: 14,
        color: "#111",
    },
    fakeInputPlaceholder: {
        fontSize: 14,
        color: "#bbb",
    },
    goWrapper: {
        marginTop: 32,
        alignItems: "center",
    },
    goButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    goButtonText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 20,
        letterSpacing: 2,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        padding: 24,
    },
    modalCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
    },
    modalConfirmBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#000",
        borderRadius: 999,
    },

    priceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
    },
    priceInput: {
        flex: 0.45, // 둘 다 45% 정도만 차지해서 한 화면에 다 들어오게
    },
    priceTilde: {
        fontSize: 16,
        marginHorizontal: 4,
    },

});
