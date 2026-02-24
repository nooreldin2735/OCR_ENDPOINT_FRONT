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
    const [maxPages, setMaxPages] = useState<number>(0);
    const [setupMode, setSetupMode] = useState<'single' | 'bulk' | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const handleFilesSelect = (files: File[]) => {
        if (setupMode === 'bulk') {
            const updatedPending = [...pendingFiles, ...files].slice(0, maxPages);
            setPendingFiles(updatedPending);
        } else {
            processFile(files[0]);
        }
    };

    const triggerBulkProcessing = () => {
        processBulkFiles(pendingFiles, maxPages);
    };

    const handleDownloadMergedCSV = () => {
        if (results.length === 0) return;

        let mergedCsv = "";
        results.forEach((res, idx) => {
            if (!res.csv) return;
            const lines = res.csv.trim().split("\n");
            if (lines.length === 0) return;

            if (idx === 0) {
                // Keep everything for the first file (header + data)
                mergedCsv += res.csv.trim() + "\n";
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
                                setMaxPages(0);
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
                                    setMaxPages(1);
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

                {setupMode === 'bulk' && maxPages === 0 && !loading && !result && (
                    <motion.div
                        key="config-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-white/40 backdrop-blur-xl p-12 rounded-[3rem] border border-glass-border shadow-2xl space-y-8 text-center"
                    >
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-accent tracking-tighter">Bulk Configuration</h3>
                            <p className="text-sm text-muted-foreground font-medium">How many images do you want to process?</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <input
                                type="number"
                                min="1"
                                max="10"
                                defaultValue="5"
                                id="max-pages-input"
                                className="w-full p-4 rounded-2xl bg-secondary border border-glass-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-center text-xl font-black text-accent"
                            />
                            <button
                                onClick={() => {
                                    const val = (document.getElementById('max-pages-input') as HTMLInputElement).value;
                                    setMaxPages(parseInt(val, 10) || 5);
                                }}
                                className="w-full py-4 rounded-2xl bg-primary text-white font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                            >
                                CONTINUE TO UPLOAD
                            </button>
                            <button
                                onClick={() => setSetupMode(null)}
                                className="text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-accent transition-colors"
                            >
                                Back to selection
                            </button>
                        </div>
                    </motion.div>
                )}

                {setupMode && (maxPages > 0 || setupMode === 'single') && !result && !loading && (
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
                                                {setupMode === 'bulk' ? `Bulk Processing (${pendingFiles.length}/${maxPages} Collected)` : "Single Document Analysis"}
                                            </h3>
                                        </div>
                                    </div>

                                    {setupMode === 'bulk' && pendingFiles.length < maxPages ? (
                                        <FileUpload
                                            onFilesSelect={handleFilesSelect}
                                            loading={loading}
                                            multiple={false}
                                        />
                                    ) : setupMode === 'single' ? (
                                        <FileUpload
                                            onFilesSelect={handleFilesSelect}
                                            loading={loading}
                                            multiple={false}
                                        />
                                    ) : (
                                        <div className="p-12 rounded-[2.5rem] bg-primary/5 border-2 border-dashed border-primary/20 flex flex-col items-center gap-4 text-center">
                                            <div className="p-4 bg-primary/10 rounded-full">
                                                <ScanText className="h-8 w-8 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-accent">All Images Collected</p>
                                                <p className="text-sm text-muted-foreground">You have uploaded {pendingFiles.length} files. Ready to analyze.</p>
                                            </div>
                                        </div>
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
                                        {Array.from({ length: maxPages }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${pendingFiles[i]
                                                    ? "bg-white border-primary/20 shadow-sm"
                                                    : "bg-secondary/30 border-glass-border opacity-50"
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${pendingFiles[i] ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-accent truncate">
                                                        {pendingFiles[i] ? pendingFiles[i].name : "Waiting for upload..."}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">
                                                        {pendingFiles[i] ? `${(pendingFiles[i].size / 1024).toFixed(1)} KB` : "Slot Empty"}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
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
