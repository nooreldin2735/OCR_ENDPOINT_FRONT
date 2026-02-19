import { useState, useCallback } from "react";
import type { OCRResponse } from "../types/ocr";

export function useOCR() {
    const [result, setResult] = useState<OCRResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const processFile = useCallback(async (uploadedFile: File) => {
        setFile(uploadedFile);
        setError(null);
        setResult(null);
        setLoading(true);

        // Create preview URL
        const url = URL.createObjectURL(uploadedFile);
        setImageUrl(url);

        try {
            const formData = new FormData();
            formData.append("file", uploadedFile);

            const response = await fetch("https://ocr.mohamed-rabiee.tech/ocr", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    // Note: Content-Type is intentionally omitted so the browser sets it with the boundary
                },
                body: formData,
                mode: "cors",
                referrerPolicy: "no-referrer",
            });

            if (!response.ok) {
                let errorBody = "";
                try {
                    errorBody = await response.text();
                } catch (e) {
                    errorBody = "Could not read error body";
                }

                console.error("OCR API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorBody
                });

                if (response.status === 502) {
                    throw new Error("Server Error (502). The API gateway is unable to reach the OCR backend. This may be temporary or due to a large file size.");
                }

                throw new Error(`OCR processing failed (${response.status}): ${errorBody.slice(0, 100)}`);
            }

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
        setFile(null);
        setImageUrl(null);
        setError(null);
        setLoading(false);
    }, [imageUrl]);

    return { result, loading, error, file, imageUrl, processFile, reset };
}
