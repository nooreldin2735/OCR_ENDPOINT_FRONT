import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { OCRResponse, OCRHistoryEntry } from "../types/ocr";

interface OCRContextType {
    result: OCRResponse | null;
    results: OCRResponse[];
    loading: boolean;
    error: string | null;
    imageUrl: string | null;
    imageUrls: string[];
    currentResultIndex: number;
    history: OCRHistoryEntry[];
    isHistoryOpen: boolean;
    activeFileName: string;
    processFile: (file: File) => Promise<void>;
    processBulkFiles: (files: File[], maxPages: number) => Promise<void>;
    setResultIndex: (index: number) => void;
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
    const [results, setResults] = useState<OCRResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [history, setHistory] = useState<OCRHistoryEntry[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [activeFileName, setActiveFileName] = useState<string>("");

    const result = results[currentResultIndex] || null;

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
        setResults([]);
        setImageUrls([]);
        setCurrentResultIndex(0);
        setLoading(true);

        const url = URL.createObjectURL(uploadedFile);
        setImageUrl(url);
        setImageUrls([url]);

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
            setResults([data]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    const processBulkFiles = useCallback(async (uploadedFiles: File[], maxPages: number) => {
        setActiveFileName(`${uploadedFiles.length} files`);
        setError(null);
        setResults([]);
        setImageUrls([]);
        setCurrentResultIndex(0);
        setLoading(true);

        const urls = uploadedFiles.map(file => URL.createObjectURL(file));
        setImageUrls(urls);
        setImageUrl(urls[0]);

        try {
            const formData = new FormData();
            uploadedFiles.forEach(file => {
                formData.append("files", file);
            });

            const response = await fetch(`https://ocr.mohamed-rabiee.tech/ocr/bulk?max_pages=${maxPages}`, {
                method: "POST",
                headers: { "Accept": "application/json" },
                body: formData,
                mode: "cors",
                referrerPolicy: "no-referrer",
            });

            if (!response.ok) throw new Error(`Bulk OCR processing failed (${response.status})`);

            const data: OCRResponse[] = await response.json();
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    const setResultIndex = useCallback((index: number) => {
        if (index >= 0 && index < results.length) {
            setCurrentResultIndex(index);
            setImageUrl(imageUrls[index] || null);
        }
    }, [results.length, imageUrls]);

    const reset = useCallback(() => {
        imageUrls.forEach(url => URL.revokeObjectURL(url));
        if (imageUrl && !imageUrls.includes(imageUrl)) URL.revokeObjectURL(imageUrl);
        setResults([]);
        setImageUrls([]);
        setImageUrl(null);
        setCurrentResultIndex(0);
        setError(null);
        setLoading(false);
        setActiveFileName("");
    }, [imageUrl, imageUrls]);

    const deleteHistoryItem = useCallback((id: string) => {
        const updated = history.filter(h => h.id !== id);
        setHistory(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }, [history]);

    const restoreFromHistory = useCallback((entry: OCRHistoryEntry) => {
        setResults([entry.data]);
        setImageUrls([entry.imageUrl]);
        setImageUrl(entry.imageUrl);
        setCurrentResultIndex(0);
        setActiveFileName(entry.fileName);
        setIsHistoryOpen(false);
    }, []);

    return (
        <OCRContext.Provider value={{
            result, results, loading, error, imageUrl, imageUrls, currentResultIndex,
            history, isHistoryOpen, activeFileName,
            processFile, processBulkFiles, setResultIndex, reset, setResult: (r) => setResults(r ? [r] : []),
            setImageUrl, setIsHistoryOpen, setHistory,
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
