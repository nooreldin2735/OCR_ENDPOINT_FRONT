import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "../components/FileUpload";
import OCRViewer from "../components/OCRViewer";
import TextPanel from "../components/TextPanel";
import LoadingSkeleton from "../components/LoadingSkeleton";
import {
    AlertCircle, RotateCcw, Sparkles, Brain,
    ScanText, MousePointer2,
    Cpu, Clock, Download
} from "lucide-react";
import { useOCRContext } from "../contexts/OCRContext";

export default function OCRModule() {
    const {
        result, loading, error, imageUrl, processFile,
        reset
    } = useOCRContext();

    const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [panelOpen, setPanelOpen] = useState(true);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 overflow-hidden relative">
            {/* Module Header */}
            <div className="w-full max-w-6xl flex items-center justify-between mb-2 relative z-20 px-2 text-white">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                        <ScanText className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-accent tracking-tight">Spatial Intelligence</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                            ACME SAICO PRO MODULE
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {result && (
                        <button
                            onClick={reset}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent/90 transition-all text-sm font-bold shadow-lg shadow-accent/20"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset Analysis
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!result && !loading && (
                    <motion.div
                        key="upload-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-4xl relative z-10 space-y-8"
                    >
                        <div className="space-y-6 mb-8">
                            <div className="flex items-center gap-3 px-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-accent">How to use this AI Module</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <GuideStep
                                    icon={<ScanText className="h-4 w-4" />}
                                    step="01"
                                    title="Upload"
                                    desc="Upload JPEG, PNG or PDF files"
                                    delay={0.1}
                                />
                                <GuideStep
                                    icon={<Brain className="h-4 w-4" />}
                                    step="02"
                                    title="Analyze"
                                    desc="Neural spatial processing"
                                    delay={0.2}
                                />
                                <GuideStep
                                    icon={<MousePointer2 className="h-4 w-4" />}
                                    step="03"
                                    title="Interact"
                                    desc="Hover & sync visualization"
                                    delay={0.3}
                                />
                                <GuideStep
                                    icon={<Download className="h-4 w-4" />}
                                    step="04"
                                    title="Export"
                                    desc="Save as Markdown or PDF"
                                    delay={0.4}
                                />
                            </div>
                        </div>

                        <FileUpload onFileSelect={processFile} loading={loading} />

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
                                page={result.pages[0]}
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

function GuideStep({ icon, step, title, desc, delay }: { icon: React.ReactNode; step: string; title: string; desc: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="p-4 rounded-2xl bg-white border border-glass-border shadow-sm flex flex-col gap-3 hover:border-primary/20 hover:shadow-md transition-all group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-2 transition-opacity">
                <span className="text-4xl font-black italic tracking-tighter text-black">
                    {step}
                </span>
            </div>
            <div className="p-2 rounded-lg bg-secondary w-fit text-primary group-hover:bg-primary group-hover:text-white transition-colors relative z-10">
                {icon}
            </div>
            <div className="relative z-10">
                <h4 className="font-black text-accent text-xs tracking-tight uppercase mb-0.5">{title}</h4>
                <p className="text-[10px] text-muted-foreground font-bold leading-tight opacity-80">{desc}</p>
            </div>
        </motion.div>
    );
}
