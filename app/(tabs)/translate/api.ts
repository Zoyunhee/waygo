// app/(tabs)/translate/api.ts

export type TranslatePayload = {
    sourceLang: string;
    targetLang: string;
    text: string;
};

// 1) 텍스트 번역 -----------------------------------
export async function translateText(payload: TranslatePayload) {
    const res = await fetch('https://YOUR_BACKEND/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error('Translate failed');
    }
    return (await res.json()) as { translated: string };
}


// 2) 음성 → 텍스트 ----------------------------------
export async function transcribeAudio(fileUri: string, sourceLang: string) {
    const form = new FormData();

    // @ts-ignore
    form.append('file', {
        uri: fileUri,
        name: 'audio.m4a',
        type: 'audio/m4a',
    });

    form.append('sourceLang', sourceLang);

    const res = await fetch('https://YOUR_BACKEND/transcribe', {
        method: 'POST',
        body: form,
    });

    if (!res.ok) {
        throw new Error('Transcribe failed');
    }
    return (await res.json()) as { text: string };
}


// 3) 이미지 → 텍스트 + 번역 -------------------------
export async function extractTextFromImage(fileUri: string, sourceLang: string) {
    const form = new FormData();

    // @ts-ignore
    form.append('file', {
        uri: fileUri,
        name: 'image.jpg',
        type: 'image/jpeg',
    });

    form.append('sourceLang', sourceLang);

    const res = await fetch('https://YOUR_BACKEND/ocr', {
        method: 'POST',
        body: form,
    });

    if (!res.ok) {
        throw new Error('OCR failed');
    }

    return (await res.json()) as {
        text: string;
        translated: string;
    };
}
