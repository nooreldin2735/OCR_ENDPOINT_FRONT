import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    PanelRightClose,
    PanelRightOpen,
    Cpu,
    FileStack,
    Type,
    FileDown,
    FileText,
} from "lucide-react";
import type { OCRResponse } from "../types/ocr";
import { marked } from "marked";
// @ts-ignore - html2pdf doesn't have official types
import html2pdf from "html2pdf.js";

interface TextPanelProps {
    data: OCRResponse;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    hoveredBlockId: string | null;
    onHoverBlock: (id: string | null) => void;
    open: boolean;
    onToggle: () => void;
}

const handleDownloadMarkdown = (content: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-result-${new Date().getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const handleDownloadCSV = (content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-result-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const handleDownloadPDF = async (content: string) => {
    const htmlContent = await marked.parse(content);
    const element = document.createElement("div");
    element.innerHTML = `<div style="padding: 40px; font-family: sans-serif; line-height: 1.6; color: #333; direction: rtl;">${htmlContent}</div>`;

    // Add some styling to tables to make them look good in PDF
    const style = document.createElement("style");
    style.innerHTML = `
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
        th { bg-color: #f8f8f8; font-weight: bold; }
        h1, h2, h3 { color: #2563eb; }
        p { margin: 10px 0; }
    `;
    element.appendChild(style);

    const opt = {
        margin: 10,
        filename: `ocr-result-${new Date().getTime()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    } as const;

    // @ts-ignore
    html2pdf().from(element).set(opt).save();
};

export default function TextPanel({
    data,
    searchQuery,
    onSearchChange,
    hoveredBlockId,
    onHoverBlock,
    open,
    onToggle,
}: TextPanelProps) {
    const page = data.pages[0];

    const filteredBlocks = useMemo(() => {
        if (!searchQuery.trim()) return page?.blocks ?? [];
        const q = searchQuery.toLowerCase();
        return (page?.blocks ?? []).filter((b) =>
            b.lines?.some((l) => l.text.toLowerCase().includes(q))
        );
    }, [page, searchQuery]);

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={onToggle}
                className="fixed top-4 right-4 z-50 glass-panel p-2.5 rounded-xl hover:bg-secondary/80 transition-all border border-glass-border shadow-lg"
            >
                {open ? (
                    <PanelRightClose className="h-5 w-5 text-primary" />
                ) : (
                    <PanelRightOpen className="h-5 w-5 text-primary" />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-0 right-0 z-40 h-full w-96 glass-panel-strong border-l border-glass-border flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-glass-border space-y-4 pt-16">
                            <h2 className="text-xl font-bold gradient-text">
                                OCR Analysis
                            </h2>

                            {/* Search */}
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search detected text…"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="w-full rounded-xl bg-secondary/40 border border-glass-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                />
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-3 gap-2">

                                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary/30 border border-glass-border">
                                    <FileStack className="h-4 w-4 text-accent" />
                                    <span className="text-[10px] text-muted-foreground uppercase">Pages</span>
                                    <span className="text-[10px] font-semibold">{data.metadata.processed_pages}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary/30 border border-glass-border">
                                    <Type className="h-4 w-4 text-primary" />
                                    <span className="text-[10px] text-muted-foreground uppercase">Blocks</span>
                                    <span className="text-[10px] font-semibold">{page?.blocks.length ?? 0}</span>
                                </div>
                            </div>

                            {/* Download Buttons */}
                            <div className="flex flex-col gap-2">
                                {data.markdown && (
                                    <>
                                        <motion.button
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => handleDownloadMarkdown(data.markdown!)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary transition-all group"
                                        >
                                            <FileDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-semibold">Download Markdown</span>
                                        </motion.button>

                                        <motion.button
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            onClick={() => handleDownloadPDF(data.markdown!)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/30 text-accent transition-all group"
                                        >
                                            <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-semibold">Download PDF</span>
                                        </motion.button>
                                    </>
                                )}
                                {data.csv && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        onClick={() => handleDownloadCSV(data.csv!)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-500 transition-all group"
                                    >
                                        <FileDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-semibold">Download CSV</span>
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
                            {filteredBlocks.map((block, idx) => {
                                const isHovered = hoveredBlockId === block.id;
                                const text = block.lines?.map((l) => l.text).join("\n") ?? "";

                                return (
                                    <motion.div
                                        key={block.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        onMouseEnter={() => onHoverBlock(block.id)}
                                        onMouseLeave={() => onHoverBlock(null)}
                                        className={`rounded-xl border p-4 text-sm cursor-pointer transition-all duration-300 ${isHovered
                                            ? "border-primary/60 bg-primary/10 glow-primary scale-[1.02]"
                                            : "border-glass-border bg-secondary/20 hover:border-primary/30 hover:bg-secondary/30"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-mono tracking-tighter">
                                                {block.id}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {block.lines?.length ?? 0} line(s)
                                            </span>
                                        </div>
                                        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-xs">
                                            {highlightText(text, searchQuery)}
                                        </p>
                                    </motion.div>
                                );
                            })}

                            {filteredBlocks.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
                                    <Search className="h-10 w-10 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">No matching blocks found.</p>
                                </div>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}

function highlightText(text: string, query: string) {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${escapeRegex(query)})`, "gi"));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark
                        key={i}
                        className="bg-primary/30 text-primary-foreground rounded px-0.5"
                    >
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
}

function escapeRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
