import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { OCRResponse, OCRHistoryEntry } from "../types/ocr";

interface OCRContextType {
    result: OCRResponse | null;
    loading: boolean;
    error: string | null;
    imageUrl: string | null;
    history: OCRHistoryEntry[];
    isHistoryOpen: boolean;
    activeFileName: string;
    processFile: (file: File) => Promise<void>;
    reset: () => void;
    setResult: (result: OCRResponse | null) => void;
    setImageUrl: (url: string | null) => void;
    setIsHistoryOpen: (open: boolean) => void;
    setHistory: (history: OCRHistoryEntry[]) => void;
    setActiveFileName: (name: string) => void;
    deleteHistoryItem: (id: string) => void;
    restoreFromHistory: (entry: OCRHistoryEntry) => void;
}

const OCRContext = createContext<OCRContextType | undefined>(undefined);

const MAX_HISTORY = 10;
const STORAGE_KEY = "acme_saico_ocr_history";

export function OCRProvider({ children }: { children: ReactNode }) {
    const [result, setResult] = useState<OCRResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [history, setHistory] = useState<OCRHistoryEntry[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [activeFileName, setActiveFileName] = useState<string>("");

    // Load History
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setHistory(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }, []);

    // Save to History
    useEffect(() => {
        if (result && imageUrl) {
            const exists = history.some(h => JSON.stringify(h.data) === JSON.stringify(result));
            if (!exists) {
                const newEntry: OCRHistoryEntry = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    fileName: activeFileName || "Processed Document",
                    imageUrl: imageUrl,
                    data: result
                };
                const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
                setHistory(updated);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            }
        }
    }, [result, imageUrl, history, activeFileName]);

    const processFile = useCallback(async (uploadedFile: File) => {
        setActiveFileName(uploadedFile.name);
        setError(null);
        setResult(null);
        setLoading(true);

        const url = URL.createObjectURL(uploadedFile);
        setImageUrl(url);

        try {
            const formData = new FormData();
            formData.append("file", uploadedFile);

            const response = await fetch("https://ocr.mohamed-rabiee.tech/ocr", {
                method: "POST",
                headers: { "Accept": "application/json" },
                body: formData,
                mode: "cors",
                referrerPolicy: "no-referrer",
            });

            if (!response.ok) throw new Error(`OCR processing failed (${response.status})`);

            const data: OCRResponse = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setResult(null);
        setImageUrl(null);
        setError(null);
        setLoading(false);
        setActiveFileName("");
    }, [imageUrl]);

    const deleteHistoryItem = useCallback((id: string) => {
        const updated = history.filter(h => h.id !== id);
        setHistory(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }, [history]);

    const restoreFromHistory = useCallback((entry: OCRHistoryEntry) => {
        setResult(entry.data);
        setImageUrl(entry.imageUrl);
        setActiveFileName(entry.fileName);
        setIsHistoryOpen(false);
    }, []);

    return (
        <OCRContext.Provider value={{
            result, loading, error, imageUrl, history, isHistoryOpen, activeFileName,
            processFile, reset, setResult, setImageUrl, setIsHistoryOpen, setHistory,
            setActiveFileName, deleteHistoryItem, restoreFromHistory
        }}>
            {children}
        </OCRContext.Provider>
    );
}

export function useOCRContext() {
    const context = useContext(OCRContext);
    if (context === undefined) {
        throw new Error("useOCRContext must be used within an OCRProvider");
    }
    return context;
}
