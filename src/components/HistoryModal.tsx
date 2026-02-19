import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, FileType, ExternalLink, Trash2, Clock } from "lucide-react";
import type { OCRHistoryEntry } from "../types/ocr";

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: OCRHistoryEntry[];
    onSelect: (entry: OCRHistoryEntry) => void;
    onDelete: (id: string) => void;
}

export default function HistoryModal({ isOpen, onClose, history, onSelect, onDelete }: HistoryModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-accent/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl glass-panel-strong rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-glass-border flex items-center justify-between bg-accent text-white">
                        <div className="flex items-center gap-3">
                            <Clock className="h-6 w-6 text-primary" />
                            <div>
                                <h3 className="text-xl font-bold">Analysis History</h3>
                                <p className="text-xs text-white/60 uppercase tracking-widest font-semibold">Your recent OCR processes</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="bg-secondary p-6 rounded-full">
                                    <Clock className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-accent">No History Yet</p>
                                    <p className="text-sm text-muted-foreground">Processed documents will appear here automatically.</p>
                                </div>
                            </div>
                        ) : (
                            history.map((entry, idx) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white border border-glass-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                                    onClick={() => onSelect(entry)}
                                >
                                    <div className="h-16 w-16 rounded-xl overflow-hidden border border-glass-border shrink-0 bg-secondary flex items-center justify-center">
                                        {entry.imageUrl ? (
                                            <img src={entry.imageUrl} alt={entry.fileName} className="w-full h-full object-cover" />
                                        ) : (
                                            <FileType className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <h4 className="font-bold text-accent truncate group-hover:text-primary transition-colors">
                                            {entry.fileName}
                                        </h4>
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(entry.timestamp).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ExternalLink className="h-3 w-3" />
                                                {entry.data.metadata.processed_pages} Page(s)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(entry.id);
                                            }}
                                            className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50/50 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-secondary/30 border-t border-glass-border text-center">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            History is stored locally in your browser
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function ChevronRight({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
