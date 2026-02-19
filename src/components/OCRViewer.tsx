import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import type { Page, Block } from "../types/ocr";

interface OCRViewerProps {
    imageUrl: string;
    page: Page;
    hoveredBlockId: string | null;
    onHoverBlock: (id: string | null) => void;
    searchQuery: string;
}

export default function OCRViewer({
    imageUrl,
    page,
    hoveredBlockId,
    onHoverBlock,
    searchQuery,
}: OCRViewerProps) {
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

    return (
        <div ref={containerRef} className="relative inline-block select-none glass-panel rounded-lg overflow-hidden">
            <img
                ref={imgRef}
                src={imageUrl}
                alt="Uploaded document"
                className="max-h-[80vh] w-auto block"
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
