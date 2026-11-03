const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const readTextFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    return new TextDecoder('utf-8').decode(arrayBuffer);
};

export const extractTextFromFile = async (file) => {
    if (!file || !isBrowser()) return '';

    const fileName = file.name?.toLowerCase() || '';

    try {
        if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
            let extractedText = '';

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                const page = await pdf.getPage(pageNumber);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item) => item.str).join(' ');
                extractedText += `${pageText}\n`;
            }

            return extractedText.trim();
        }

        if (file.type.includes('word') || fileName.endsWith('.docx')) {
            const mammoth = await import('mammoth');
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return (result?.value || '').trim();
        }

        if (file.type.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
            return await readTextFile(file);
        }
    } catch (error) {
        console.error('File extraction failed:', error);
    }

    try {
        return await readTextFile(file);
    } catch (error) {
        console.error('Fallback file read failed:', error);
        return '';
    }
};

export const calculatePlagiarismScore = (text) => {
    if (!text || !text.trim()) return 0;

    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const words = normalized.split(/\s+/).filter(Boolean);

    if (words.length < 10) return 0;

    const uniqueWords = new Set(words);
    const repetitionRatio = 1 - uniqueWords.size / words.length;

    const sentences = normalized
        .split(/[.!?]+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);

    let repeatedSentenceCount = 0;
    for (let i = 1; i < sentences.length; i += 1) {
        if (sentences[i] === sentences[i - 1]) {
            repeatedSentenceCount += 1;
        }
    }

    const sentenceRepeatRatio = sentences.length > 1
        ? repeatedSentenceCount / (sentences.length - 1)
        : 0;

    const score = Math.min(
        0.98,
        Math.max(0.08, repetitionRatio * 0.6 + sentenceRepeatRatio * 0.4 + (words.length > 80 ? 0.1 : 0.05))
    );

    return Number(score.toFixed(2));
};
