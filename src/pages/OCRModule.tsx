import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "../components/FileUpload";
import OCRViewer from "../components/OCRViewer";
import TextPanel from "../components/TextPanel";
import LoadingSkeleton from "../components/LoadingSkeleton";
import {
    RotateCcw, Sparkles, ScanText,
    Cpu, Clock, Download, ChevronLeft, ChevronRight, FileText, Layers, Upload
} from "lucide-react";
import { useOCRContext } from "../contexts/OCRContext";

export default function OCRModule() {
    const {
        result, results, loading, imageUrl, currentResultIndex,
        processFile, processBulkFiles, setResultIndex, reset, activeFileName
    } = useOCRContext();

    const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [panelOpen, setPanelOpen] = useState(true);
    const [setupMode, setSetupMode] = useState<'single' | 'bulk' | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const handleFilesSelect = (files: File[]) => {
        if (setupMode === 'bulk') {
            const updatedPending = [...pendingFiles, ...files].slice(0, 50);
            setPendingFiles(updatedPending);
        } else {
            processFile(files[0]);
        }
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
                mergedCsv += res.csv.trim() + "\n";
                headerAdded = true;
            } else {
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
        <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-6 gap-6 md:gap-8 overflow-hidden relative">
            {/* Module Header - Hidden on small screens if result is shown (using App.tsx header instead) */}
            {!result && (
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
                        {setupMode && (
                            <button
                                onClick={() => {
                                    setSetupMode(null);
                                    setPendingFiles([]);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent/90 transition-all text-sm font-bold shadow-lg shadow-accent/20"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {!setupMode && !loading && !result && (
                    <motion.div
                        key="setup-mode"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 p-4"
                    >
                        <button
                            onClick={() => setSetupMode('single')}
                            className="group p-8 md:p-12 rounded-[3rem] bg-white/40 backdrop-blur-xl border border-glass-border hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10 text-center"
                        >
                            <div className="p-6 bg-primary/10 rounded-3xl w-fit mx-auto text-primary mb-8 group-hover:scale-110 transition-transform">
                                <ScanText className="h-12 w-12" />
                            </div>
                            <h3 className="text-3xl font-black text-accent mb-3 tracking-tighter">Single Analysis</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">Instant spatial extraction for single images or PDF pages.</p>
                        </button>

                        <button
                            onClick={() => setSetupMode('bulk')}
                            className="group p-8 md:p-12 rounded-[3rem] bg-white/40 backdrop-blur-xl border border-glass-border hover:border-accent/50 transition-all hover:shadow-2xl hover:shadow-accent/10 text-center"
                        >
                            <div className="p-6 bg-accent/10 rounded-3xl w-fit mx-auto text-accent mb-8 group-hover:scale-110 transition-transform">
                                <Cpu className="h-12 w-12" />
                            </div>
                            <h3 className="text-3xl font-black text-accent mb-3 tracking-tighter">Bulk Processing</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">Synchronized multi-file analysis dengan document set handling.</p>
                        </button>
                    </motion.div>
                )}

                {setupMode && !result && !loading && (
                    <motion.div
                        key="upload-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-4xl space-y-8"
                    >
                        <div className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-glass-border shadow-2xl">
                            <div className="text-center mb-10 space-y-4">
                                <h2 className="text-4xl md:text-5xl font-black text-accent tracking-tighter leading-none">
                                    {setupMode === 'bulk' ? "Bulk Data Collection" : "Document Intake"}
                                </h2>
                                <p className="text-muted-foreground font-medium max-w-xl mx-auto">
                                    {setupMode === 'bulk'
                                        ? "Select multiple files to process them as a single synchronized dataset."
                                        : "Upload your technical document for high-precision spatial analysis."}
                                </p>
                            </div>

                            <FileUpload
                                onFilesSelect={handleFilesSelect}
                                loading={loading}
                                multiple={setupMode === 'bulk'}
                            />

                            {setupMode === 'bulk' && pendingFiles.length > 0 && (
                                <div className="mt-8 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Collected Queue ({pendingFiles.length}/50)</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {pendingFiles.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 p-3 bg-white/50 rounded-xl border border-glass-border">
                                                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                                                <span className="text-xs font-bold text-accent truncate">{f.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => processBulkFiles(pendingFiles, 50)}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black tracking-tight hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        <Layers className="h-5 w-5" />
                                        TRIGGER NEURAL ANALYSIS
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {loading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-xl text-center space-y-8 px-4"
                    >
                        <div className="inline-block p-6 bg-primary/10 rounded-full">
                            <Cpu className="h-12 w-12 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-accent tracking-tighter">Processing Intelligence</h3>
                            <p className="text-muted-foreground font-medium">Extracting spatial coordinates and semantic structure...</p>
                        </div>
                        <LoadingSkeleton />
                    </motion.div>
                )}

                {result && !loading && (
                    <div className="w-full h-full flex flex-col relative overflow-hidden">
                        {/* Result Header */}
                        <div className="w-full bg-background/80 backdrop-blur-md border-b border-glass-border p-4 sticky top-0 z-40 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={reset}
                                    className="p-3 bg-secondary/50 hover:bg-secondary rounded-2xl transition-all border border-glass-border group"
                                >
                                    <ChevronLeft className="h-5 w-5 text-accent group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                                <div className="min-w-0">
                                    <h2 className="text-sm md:text-base font-black text-accent truncate max-w-[200px] md:max-w-md">
                                        {activeFileName || "Analysis Result"}
                                    </h2>
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                                        <FileText className="h-3 w-3 text-primary" />
                                        <span>Spatial Layer: {currentResultIndex + 1} of {results.length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                {results.length > 1 && (
                                    <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-glass-border mr-2">
                                        <button
                                            onClick={() => setResultIndex(currentResultIndex - 1)}
                                            disabled={currentResultIndex === 0}
                                            className="p-1.5 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="text-[10px] font-black px-2 tabular-nums">
                                            {currentResultIndex + 1} / {results.length}
                                        </span>
                                        <button
                                            onClick={() => setResultIndex(currentResultIndex + 1)}
                                            disabled={currentResultIndex === results.length - 1}
                                            className="p-1.5 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={handleDownloadMergedCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all"
                                >
                                    <Download className="h-4 w-4" />
                                    Combined Excel
                                </button>
                                <button
                                    onClick={reset}
                                    className="p-2 bg-white border border-glass-border hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Viewer & Panel Container */}
                        <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
                            <div className={`flex-1 transition-all duration-500 ${panelOpen ? 'md:mr-96' : ''}`}>
                                <div className="h-full overflow-auto p-4 md:p-8 flex items-start justify-center">
                                    {imageUrl && (
                                        <OCRViewer
                                            imageUrl={imageUrl}
                                            data={result}
                                            hoveredBlockId={hoveredBlockId}
                                            onHoverBlock={setHoveredBlockId}
                                            searchQuery={searchQuery}
                                        />
                                    )}
                                </div>
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
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
