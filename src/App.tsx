import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOCR } from "./hooks/useOCR";
import FileUpload from "./components/FileUpload";
import OCRViewer from "./components/OCRViewer";
import TextPanel from "./components/TextPanel";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { AlertCircle, RotateCcw, Search as SearchIcon } from "lucide-react";

function App() {
  const { result, loading, error, imageUrl, processFile, reset } = useOCR();
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 p-6 flex items-center justify-between border-b border-glass-border glass-panel"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/30">
            <SearchIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              OCR<span className="text-primary">Bbox</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Spatial Intelligence
            </p>
          </div>
        </div>

        {result && (
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary border border-glass-border transition-all text-sm font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </button>
        )}
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 gap-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl"
            >
              <div className="text-center space-y-4 mb-12">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-black gradient-text"
                >
                  Visual OCR Intelligence
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground max-w-lg mx-auto"
                >
                  Upload your documents and see exactly where the text lives.
                  High-precision bounding box detection powered by Gemini.
                </motion.p>
              </div>
              <FileUpload onFileSelect={processFile} loading={loading} />

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-4 text-red-400 text-sm max-w-lg mx-auto shadow-lg backdrop-blur-sm"
                >
                  <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-base">API Request Failed</p>
                    <p className="leading-relaxed opacity-90">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 text-xs underline hover:text-red-300 transition-colors"
                    >
                      Refresh page and try again
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-xl"
            >
              <LoadingSkeleton />
            </motion.div>
          )}

          {result && imageUrl && (
            <motion.div
              key="viewer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex-1 flex flex-col items-center gap-6 overflow-hidden transition-all duration-500 ${panelOpen ? 'pr-96' : ''}`}
            >
              <div className="flex-1 overflow-auto w-full flex items-center justify-center p-4">
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
      </main>

      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
    </div>
  );
}

export default App;
