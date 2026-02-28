import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import OCRModule from "./pages/OCRModule";
import LoginPage from "./pages/LoginPage";
import HistoryModal from "./components/HistoryModal";
import ProtectedRoute from "./components/ProtectedRoute";
import { OCRProvider, useOCRContext } from "./contexts/OCRContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import logo from "./assets/company_logo.png";

function AppContent() {
  const {
    isHistoryOpen, setIsHistoryOpen, history,
    restoreFromHistory, deleteHistoryItem,
    isSidebarOpen, setIsSidebarOpen
  } = useOCRContext();
  const { isAuthenticated } = useAuth();

  // Handle initial sidebar state and window resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarOpen]);

  return (
    <div className="min-h-screen flex bg-background font-sans relative overflow-x-hidden">
      {/* Mobile Header - Only visible on small screens when authenticated */}
      {isAuthenticated && (
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-accent border-b border-white/10 flex items-center justify-between px-4 z-[60] text-white">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-6 w-auto" />
            <span className="font-bold text-sm tracking-tight">ACME<span className="text-primary">SAICO</span></span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>
      )}

      {/* Fixed Side Navbar - Only show when authenticated */}
      {isAuthenticated && <Navbar />}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-300 ${isAuthenticated ? (isSidebarOpen ? "lg:ml-64" : "ml-0") : "ml-0"} ${isAuthenticated ? "pt-16 lg:pt-0" : ""}`}>
        <div className="flex-1 flex flex-col relative">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ocr"
              element={
                <ProtectedRoute>
                  <OCRModule />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Global Decorations */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </main>

      {/* Floating Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] left-[10%] w-[30%] h-[30%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] right-[-5%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      {/* Global History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={restoreFromHistory}
        onDelete={deleteHistoryItem}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <OCRProvider>
        <Router>
          <AppContent />
        </Router>
      </OCRProvider>
    </AuthProvider>
  );
}

export default App;
