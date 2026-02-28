import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { OCRResponse, OCRHistoryEntry } from "../types/ocr";
import { convertPdfToImages } from "../utils/pdfUtils";
import { generateCsvFromLineItems } from "../utils/csvUtils";

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
    isSidebarOpen: boolean;
    activeFileName: string;
    processFile: (file: File) => Promise<void>;
    processBulkFiles: (files: File[], maxPages: number) => Promise<void>;
    setResultIndex: (index: number) => void;
    reset: () => void;
    setResult: (result: OCRResponse | null) => void;
    setImageUrl: (url: string | null) => void;
    setIsHistoryOpen: (open: boolean) => void;
    setIsSidebarOpen: (open: boolean) => void;
    setHistory: (history: OCRHistoryEntry[]) => void;
    setActiveFileName: (name: string) => void;
    deleteHistoryItem: (id: string) => void;
    restoreFromHistory: (entry: OCRHistoryEntry) => void;
}

const OCRContext = createContext<OCRContextType | undefined>(undefined);

const MAX_HISTORY = 10;

export function OCRProvider({ children }: { children: ReactNode }) {
    const [results, setResults] = useState<OCRResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [history, setHistory] = useState<OCRHistoryEntry[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeFileName, setActiveFileName] = useState<string>("");

    const result = results[currentResultIndex] || null;

    const addToHistory = useCallback((res: OCRResponse, url: string, fileName: string) => {
        setHistory(prev => {
            const exists = prev.some(h => JSON.stringify(h.data) === JSON.stringify(res));
            if (exists) return prev;

            const newEntry: OCRHistoryEntry = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                fileName: fileName || "Processed Document",
                imageUrl: url,
                data: res
            };
            return [newEntry, ...prev].slice(0, MAX_HISTORY);
        });
    }, []);

    const processBulkFiles = useCallback(async (uploadedFiles: File[], maxPages: number) => {
        const batchFileName = uploadedFiles.length > 1 ? `${uploadedFiles.length} files` : uploadedFiles[0].name;
        setActiveFileName(batchFileName);
        setError(null);
        setResults([]);
        setImageUrls([]);
        setCurrentResultIndex(0);
        setLoading(true);

        try {
            const filesToProcess: File[] = [];

            for (const file of uploadedFiles) {
                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    const pdfImages = await convertPdfToImages(file);
                    filesToProcess.push(...pdfImages);
                } else {
                    filesToProcess.push(file);
                }
            }

            const urls = filesToProcess.map(file => URL.createObjectURL(file));
            setImageUrls(urls);
            setImageUrl(urls[0]);

            const formData = new FormData();
            filesToProcess.forEach(file => {
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

            // Post-process to ensure CSV is present if line_items exists
            const processedData = data.map(res => {
                if (!res.csv && res.line_items && res.line_items.length > 0) {
                    return { ...res, csv: generateCsvFromLineItems(res.line_items) };
                }
                return res;
            });

            setResults(processedData);

            // Add the first result of the bulk set to history
            if (processedData.length > 0) {
                addToHistory(processedData[0], urls[0], batchFileName);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, [addToHistory]);

    const processFile = useCallback(async (uploadedFile: File) => {
        const fileName = uploadedFile.name;
        setActiveFileName(fileName);
        setError(null);
        setResults([]);
        setImageUrls([]);
        setCurrentResultIndex(0);
        setLoading(true);

        try {
            let filesToProcess: File[] = [uploadedFile];

            // Check if file is PDF
            if (uploadedFile.type === 'application/pdf' || uploadedFile.name.toLowerCase().endsWith('.pdf')) {
                filesToProcess = await convertPdfToImages(uploadedFile);
                if (filesToProcess.length === 0) throw new Error("Could not extract images from PDF");
            }

            const urls = filesToProcess.map(file => URL.createObjectURL(file));
            setImageUrls(urls);
            setImageUrl(urls[0]);

            if (filesToProcess.length > 1) {
                // If PDF has multiple pages, treat as bulk
                await processBulkFiles(filesToProcess, 50); // Default to 50 max pages
                return;
            }

            const fileToUpload = filesToProcess[0];
            const formData = new FormData();
            formData.append("file", fileToUpload);

            const response = await fetch("https://ocr.mohamed-rabiee.tech/ocr", {
                method: "POST",
                headers: { "Accept": "application/json" },
                body: formData,
                mode: "cors",
                referrerPolicy: "no-referrer",
            });

            if (!response.ok) throw new Error(`OCR processing failed (${response.status})`);

            const data: OCRResponse = await response.json();

            // Post-process to ensure CSV is present if line_items exists
            if (!data.csv && data.line_items && data.line_items.length > 0) {
                data.csv = generateCsvFromLineItems(data.line_items);
            }

            setResults([data]);
            addToHistory(data, urls[0], fileName);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }, [processBulkFiles, addToHistory]);

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
        setHistory(prev => prev.filter(h => h.id !== id));
    }, []);

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
            history, isHistoryOpen, isSidebarOpen, activeFileName,
            processFile, processBulkFiles, setResultIndex, reset, setResult: (r) => setResults(r ? [r] : []),
            setImageUrl, setIsHistoryOpen, setIsSidebarOpen, setHistory,
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
