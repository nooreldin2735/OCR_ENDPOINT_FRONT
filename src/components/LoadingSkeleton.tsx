import { motion } from "framer-motion";

export default function LoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center gap-8 py-20 w-full">
            <div className="relative">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="h-24 w-24 rounded-3xl border-4 border-primary/20 border-t-primary shadow-[0_0_30px_-5px_hsla(245,58%,61%,0.4)]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="h-4 w-4 rounded-full bg-accent shadow-[0_0_10px_hsla(263,55%,58%,0.5)]"
                    />
                </div>
            </div>

            <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold gradient-text">Processing Document</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">
                    Our AI is analyzing your files and extracting spatial text data.
                </p>
            </div>

            <div className="w-full max-w-sm space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                        <div
                            className="h-3 rounded-full bg-gradient-to-r from-secondary/50 via-primary/10 to-secondary/50 bg-[length:200%_100%] animate-shimmer border border-glass-border"
                            style={{ width: `${100 - i * 15}%` }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
