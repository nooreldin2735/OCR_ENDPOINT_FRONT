import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "../components/FileUpload";
import OCRViewer from "../components/OCRViewer";
import TextPanel from "../components/TextPanel";
import LoadingSkeleton from "../components/LoadingSkeleton";
import {
    AlertCircle, RotateCcw, Sparkles, Brain,
    ScanText,
    Cpu, Clock, Download
} from "lucide-react";
import { useOCRContext } from "../contexts/OCRContext";

export default function OCRModule() {
    const {
        result, results, loading, error, imageUrl, currentResultIndex,
        processFile, processBulkFiles, setResultIndex, reset
    } = useOCRContext();

    const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [panelOpen, setPanelOpen] = useState(true);
    const [setupMode, setSetupMode] = useState<'single' | 'bulk' | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const handleFilesSelect = (files: File[]) => {
        if (setupMode === 'bulk') {
            // Use 50 as a reasonable upper bound for simultaneous file selections
            const updatedPending = [...pendingFiles, ...files].slice(0, 50);
            setPendingFiles(updatedPending);
        } else {
            processFile(files[0]);
        }
    };

    const triggerBulkProcessing = () => {
        processBulkFiles(pendingFiles, pendingFiles.length);
    };

    const handleDownloadMergedCSV = () => {
        if (results.length === 0) return;

        let mergedCsv = "";
        let headerAdded = false;

        results.forEach((res) => {
            if (!res.csv) return;
            const lines = res.csv.trim().split("\n");
            if (lines.length === 0) return;

            if (!headerAdded) {
                // Keep everything for the first file that has a CSV (header + data)
                mergedCsv += res.csv.trim() + "\n";
                headerAdded = true;
            } else {
                // Skip header for subsequent files
                if (lines.length > 1) {
                    mergedCsv += lines.slice(1).join("\n") + "\n";
                }
            }
        });

        if (!mergedCsv) return;

        const blob = new Blob([mergedCsv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bulk-ocr-merged-${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 overflow-hidden relative">
            {/* Module Header */}
            <div className="w-full max-w-6xl flex items-center justify-between mb-2 relative z-20 px-2 text-white">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                        <ScanText className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-accent tracking-tight"> ASCL</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                            ACME SAICO PRO MODULE
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {results.length > 1 && (
                        <>
                            <button
                                onClick={handleDownloadMergedCSV}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all text-sm font-bold shadow-lg shadow-emerald-500/20"
                            >
                                <Download className="h-4 w-4" />
                                Export Combined Excel
                            </button>
                            <div className="flex items-center gap-2 bg-accent/10 p-1.5 rounded-xl border border-accent/20">
                                {results.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setResultIndex(idx)}
                                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${currentResultIndex === idx
                                            ? "bg-accent text-white shadow-lg shadow-accent/20"
                                            : "text-accent hover:bg-accent/10"
                                            }`}
                                    >
                                        IMG {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    {(result || loading || setupMode) && (
                        <button
                            onClick={() => {
                                reset();
                                setSetupMode(null);
                                setPendingFiles([]);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent/90 transition-all text-sm font-bold shadow-lg shadow-accent/20"
                        >
                            <RotateCcw className="h-4 w-4" />
                            {(result || pendingFiles.length > 0) ? "Reset Analysis" : "Cancel"}
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!setupMode && !loading && !result && (
                    <motion.div
                        key="setup-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-2xl bg-white/40 backdrop-blur-xl p-12 rounded-[3rem] border border-glass-border shadow-2xl space-y-8 text-center"
                    >
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-accent tracking-tighter">Choose Your Intelligence Mode</h3>
                            <p className="text-muted-foreground font-medium">Select how you want to process your documents today.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => {
                                    setSetupMode('single');
                                }}
                                className="group p-8 rounded-[2rem] bg-secondary/50 border border-glass-border hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10 text-left"
                            >
                                <div className="p-4 bg-primary/10 rounded-2xl w-fit text-primary mb-6 group-hover:scale-110 transition-transform">
                                    <ScanText className="h-8 w-8" />
                                </div>
                                <h4 className="text-xl font-black text-accent mb-2">Single Document</h4>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">Fast neural extraction for single images or PDF pages.</p>
                            </button>

                            <button
                                onClick={() => setSetupMode('bulk')}
                                className="group p-8 rounded-[2rem] bg-secondary/50 border border-glass-border hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10 text-left"
                            >
                                <div className="p-4 bg-accent/10 rounded-2xl w-fit text-accent mb-6 group-hover:scale-110 transition-transform">
                                    <Cpu className="h-8 w-8" />
                                </div>
                                <h4 className="text-xl font-black text-accent mb-2">Bulk Processing</h4>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">Analyze multiple files simultaneously with spatial syncing.</p>
                            </button>
                        </div>
                    </motion.div>
                )}

                {setupMode && !result && !loading && (
                    <motion.div
                        key="upload-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-4xl relative z-10 space-y-8"
                    >
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1 space-y-8 w-full">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-accent">
                                                {setupMode === 'bulk' ? `Bulk Processing (${pendingFiles.length} Collected)` : "Single Document Analysis"}
                                            </h3>
                                        </div>
                                    </div>

                                    {setupMode === 'bulk' ? (
                                        <FileUpload
                                            onFilesSelect={handleFilesSelect}
                                            loading={loading}
                                            multiple={true}
                                            maxFiles={50 - pendingFiles.length}
                                        />
                                    ) : (
                                        <FileUpload
                                            onFilesSelect={handleFilesSelect}
                                            loading={loading}
                                            multiple={false}
                                        />
                                    )}
                                </div>

                                {setupMode === 'bulk' && pendingFiles.length > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={triggerBulkProcessing}
                                        className="w-full py-5 rounded-[2rem] bg-primary text-white font-black text-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
                                    >
                                        <Brain className="h-6 w-6" />
                                        TRIGGER NEURAL ANALYSIS ({pendingFiles.length} FILES)
                                    </motion.button>
                                )}
                            </div>

                            {setupMode === 'bulk' && (
                                <div className="w-full md:w-80 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Uploaded Queue</h4>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {pendingFiles.map((file, i) => (
                                            <div
                                                key={i}
                                                className="p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 bg-white border-primary/20 shadow-sm"
                                            >
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black bg-primary text-white">
                                                    {i + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-accent truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">
                                                        {(file.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {pendingFiles.length === 0 && (
                                            <div className="p-4 rounded-2xl border border-glass-border bg-secondary/30 text-center opacity-50 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black bg-secondary text-muted-foreground">
                                                    1
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-accent truncate text-left">
                                                        Waiting for upload...
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-bold text-left">
                                                        Empty Slot
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-6 p-6 rounded-3xl bg-red-500/5 border border-red-500/20 flex items-start gap-4 text-red-600 text-sm max-w-lg mx-auto shadow-xl backdrop-blur-md"
                            >
                                <div className="p-2 bg-red-500/10 rounded-xl">
                                    <AlertCircle className="h-6 w-6 shrink-0" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-base uppercase tracking-tight">Intelligence Blocked</p>
                                    <p className="leading-relaxed font-medium opacity-80">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        Initialize System Restart
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <div className="pt-8 text-center">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-40">
                                Protected by Enterprise Document Security
                            </p>
                        </div>
                    </motion.div>
                )}

                {loading && (
                    <motion.div
                        key="loading-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="w-full max-w-xl relative z-10"
                    >
                        <div className="text-center mb-8 space-y-2">
                            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                                <Cpu className="h-10 w-10 text-primary animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-accent tracking-tighter">Processing Document Intelligence</h3>
                            <p className="text-sm text-muted-foreground font-medium">Extracting spatial coordinates and semantic structure...</p>
                        </div>
                        <LoadingSkeleton />
                    </motion.div>
                )}

                {result && imageUrl && (
                    <motion.div
                        key="viewer-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`flex-1 flex flex-col items-center gap-6 overflow-hidden transition-all duration-700 w-full ${panelOpen ? 'pr-96' : ''}`}
                    >
                        <div className="flex-1 overflow-auto w-full flex items-center justify-center p-4 bg-secondary/20 rounded-[2.5rem] border border-glass-border shadow-inner">
                            <OCRViewer
                                imageUrl={imageUrl}
                                data={result}
                                hoveredBlockId={hoveredBlockId}
                                onHoverBlock={setHoveredBlockId}
                                searchQuery={searchQuery}
                            />
                        </div>

                        <TextPanel
                            data={result}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            hoveredBlockId={hoveredBlockId}
                            onHoverBlock={setHoveredBlockId}
                            open={panelOpen}
                            onToggle={() => setPanelOpen(!panelOpen)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
