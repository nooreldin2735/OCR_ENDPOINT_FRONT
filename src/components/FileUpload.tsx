import { useCallback, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileImage, FileText } from "lucide-react";

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    loading: boolean;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/tiff", "application/pdf"];

export default function FileUpload({ onFileSelect, loading }: FileUploadProps) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(
        (file: File) => {
            if (ACCEPTED.includes(file.type)) {
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4"
        >
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !loading && inputRef.current?.click()}
                className={`
          relative w-full cursor-pointer rounded-2xl border-2 border-dashed p-12
          transition-all duration-300 group
          ${dragging
                        ? "border-primary bg-primary/10 glow-primary"
                        : "border-glass-border hover:border-primary/50 bg-glass/40 hover:bg-glass/60"
                    }
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED.join(",")}
                    className="hidden"
                    disabled={loading}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />

                <div className="flex flex-col items-center gap-4 text-center">
                    <motion.div
                        animate={dragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                        className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-4"
                    >
                        <Upload className="h-8 w-8 text-primary" />
                    </motion.div>

                    <div>
                        <p className="text-lg font-semibold text-foreground">
                            Drop your file here or{" "}
                            <span className="gradient-text">browse</span>
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Supports PNG, JPEG, WebP, TIFF, and PDF
                        </p>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <div className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5 text-xs text-secondary-foreground border border-glass-border">
                            <FileImage className="h-3.5 w-3.5" />
                            Images
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5 text-xs text-secondary-foreground border border-glass-border">
                            <FileText className="h-3.5 w-3.5" />
                            PDF
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
