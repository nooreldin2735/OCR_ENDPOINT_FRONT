import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Papa from "papaparse";
import { ChevronLeft, ChevronRight, Image as ImageIcon, FileText, FileSpreadsheet } from "lucide-react";
import type { Block, OCRResponse } from "../types/ocr";

interface OCRViewerProps {
    imageUrl: string;
    data: OCRResponse;
    hoveredBlockId: string | null;
    onHoverBlock: (id: string | null) => void;
    searchQuery: string;
}

export default function OCRViewer({
    imageUrl,
    data,
    hoveredBlockId,
    onHoverBlock,
    searchQuery,
}: OCRViewerProps) {
    const page = data.pages[0];
    const [viewMode, setViewMode] = useState<'image' | 'markdown' | 'csv'>('image');
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;

        const update = () => {
            setImgSize({ w: img.clientWidth, h: img.clientHeight });
        };

        if (img.complete) update();
        img.addEventListener("load", update);

        const observer = new ResizeObserver(update);
        observer.observe(img);

        return () => {
            img.removeEventListener("load", update);
            observer.disconnect();
        };
    }, [imageUrl]);

    const scaleX = imgSize.w / page.width;
    const scaleY = imgSize.h / page.height;

    const matchingBlockIds = useMemo(() => {
        if (!searchQuery.trim()) return new Set<string>();
        const q = searchQuery.toLowerCase();
        return new Set(
            page.blocks
                .filter((b) =>
                    b.lines?.some((l) => l.text.toLowerCase().includes(q))
                )
                .map((b) => b.id)
        );
    }, [searchQuery, page.blocks]);

    const availableViews = useMemo(() => {
        const views: { id: 'image' | 'markdown' | 'csv', label: string, icon: any }[] = [
            { id: 'image', label: 'Bounding Boxes', icon: ImageIcon }
        ];
        if (data.markdown) views.push({ id: 'markdown', label: 'Markdown', icon: FileText });
        if (data.csv) views.push({ id: 'csv', label: 'CSV Data', icon: FileSpreadsheet });
        return views;
    }, [data.markdown, data.csv]);

    const currentIndex = availableViews.findIndex(v => v.id === viewMode);

    useEffect(() => {
        if (currentIndex === -1) setViewMode('image');
    }, [currentIndex]);

    const handlePrev = () => setViewMode(availableViews[(currentIndex - 1 + availableViews.length) % availableViews.length].id as any);
    const handleNext = () => setViewMode(availableViews[(currentIndex + 1) % availableViews.length].id as any);
    const CurrentIcon = availableViews[currentIndex > -1 ? currentIndex : 0]?.icon || ImageIcon;

    return (
        <div ref={containerRef} className="relative flex-1 flex flex-col items-center justify-center w-full h-full glass-panel rounded-lg overflow-hidden group">
            {/* View Navigation Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-row items-center gap-4 p-2 rounded-2xl bg-secondary/80 backdrop-blur-md border border-glass-border shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handlePrev}
                    className="p-2 hover:bg-primary/20 rounded-xl transition-colors text-muted-foreground hover:text-primary disabled:opacity-50"
                    disabled={availableViews.length <= 1}
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 min-w-[140px] justify-center">
                    <CurrentIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">
                        {availableViews[currentIndex > -1 ? currentIndex : 0]?.label}
                    </span>
                </div>

                <button
                    onClick={handleNext}
                    className="p-2 hover:bg-primary/20 rounded-xl transition-colors text-muted-foreground hover:text-primary disabled:opacity-50"
                    disabled={availableViews.length <= 1}
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {viewMode === 'image' && (
                <div className="relative inline-block select-none max-w-full w-fit overflow-hidden rounded-xl shadow-2xl border border-glass-border">
                    <img
                        ref={imgRef}
                        src={imageUrl}
                        alt="Uploaded document"
                        className="max-h-[70vh] md:max-h-[80vh] w-full md:w-auto block object-contain"
                        draggable={false}
                    />

                    {imgSize.w > 0 && (
                        <svg
                            className="absolute top-0 left-0 pointer-events-none"
                            width={imgSize.w}
                            height={imgSize.h}
                            viewBox={`0 0 ${imgSize.w} ${imgSize.h}`}
                        >
                            {page.blocks.map((block) => {
                                const isHovered = hoveredBlockId === block.id;
                                const isSearchMatch = matchingBlockIds.has(block.id);
                                const x = block.bbox.x_min * scaleX;
                                const y = block.bbox.y_min * scaleY;
                                const w = (block.bbox.x_max - block.bbox.x_min) * scaleX;
                                const h = (block.bbox.y_max - block.bbox.y_min) * scaleY;

                                return (
                                    <rect
                                        key={block.id}
                                        x={x}
                                        y={y}
                                        width={w}
                                        height={h}
                                        rx={2}
                                        className="pointer-events-auto cursor-pointer transition-all duration-200"
                                        fill={
                                            isHovered
                                                ? "hsla(245, 58%, 61%, 0.25)"
                                                : isSearchMatch
                                                    ? "hsla(263, 55%, 58%, 0.2)"
                                                    : "transparent"
                                        }
                                        stroke={
                                            isHovered
                                                ? "hsl(245, 58%, 61%)"
                                                : isSearchMatch
                                                    ? "hsl(263, 55%, 58%)"
                                                    : "hsla(245, 58%, 61%, 0.3)"
                                        }
                                        strokeWidth={isHovered || isSearchMatch ? 2 : 1}
                                        onMouseEnter={() => onHoverBlock(block.id)}
                                        onMouseLeave={() => onHoverBlock(null)}
                                    />
                                );
                            })}
                        </svg>
                    )}

                    {/* Tooltip on hover */}
                    {hoveredBlockId && imgSize.w > 0 && (
                        <BlockTooltip
                            block={page.blocks.find((b) => b.id === hoveredBlockId)!}
                            scaleX={scaleX}
                            scaleY={scaleY}
                            containerWidth={imgSize.w}
                        />
                    )}
                </div>
            )}

            {viewMode === 'markdown' && data.markdown && (
                <div className="w-full max-h-[70vh] md:max-h-[80vh] overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-transparent text-sm text-foreground/90 flex justify-center custom-scrollbar">
                    <div className="max-w-4xl w-full text-left bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-glass-border prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {data.markdown}
                        </ReactMarkdown>
                    </div>
                </div>
            )}

            {viewMode === 'csv' && data.csv && (
                <div className="w-full max-h-[70vh] md:max-h-[80vh] overflow-y-auto overflow-x-auto p-4 md:p-8 bg-transparent text-sm text-foreground/90 flex justify-center custom-scrollbar">
                    <div className="min-w-max bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-glass-border inline-block">
                        {(() => {
                            const parsed = Papa.parse(data.csv!, { header: true });
                            if (parsed.data && parsed.data.length > 0) {
                                const headers = parsed.meta.fields || Object.keys(parsed.data[0] as any);
                                return (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {headers.map((h, i) => (
                                                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {parsed.data.map((row: any, i) => (
                                                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                    {headers.map((h, j) => (
                                                        <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {row[h]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                );
                            }
                            return <pre>{data.csv}</pre>;
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}

function BlockTooltip({
    block,
    scaleX,
    scaleY,
    containerWidth,
}: {
    block: Block;
    scaleX: number;
    scaleY: number;
    containerWidth: number;
}) {
    if (!block) return null;
    const text = block.lines?.map((l) => l.text).join(" ") ?? "";
    const x = block.bbox.x_min * scaleX;
    const y = block.bbox.y_min * scaleY;
    const boxW = (block.bbox.x_max - block.bbox.x_min) * scaleX;
    const showRight = x + boxW / 2 < containerWidth / 2;

    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-50 max-w-xs glass-panel-strong px-3 py-2 text-xs text-foreground shadow-lg border border-glass-border"
            style={{
                top: y - 8,
                left: showRight ? x + boxW + 8 : undefined,
                right: showRight ? undefined : containerWidth - x + 8,
                transform: "translateY(-100%)",
            }}
        >
            <p className="line-clamp-4 leading-relaxed font-medium">{text}</p>
        </motion.div>
    );
}
