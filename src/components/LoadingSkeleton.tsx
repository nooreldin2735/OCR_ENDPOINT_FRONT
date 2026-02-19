import { motion } from "framer-motion";

export default function LoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-20 w-full">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="h-16 w-16 rounded-full border-3 border-primary/20 border-t-primary"
            />

            <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
    );
}
