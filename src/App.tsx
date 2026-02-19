import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import OCRModule from "./pages/OCRModule";
import LoginPage from "./pages/LoginPage";
import HistoryModal from "./components/HistoryModal";
import ProtectedRoute from "./components/ProtectedRoute";
import { OCRProvider, useOCRContext } from "./contexts/OCRContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppContent() {
  const {
    isHistoryOpen, setIsHistoryOpen, history,
    restoreFromHistory, deleteHistoryItem
  } = useOCRContext();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex bg-background font-sans relative overflow-x-hidden">
      {/* Fixed Side Navbar - Only show when authenticated */}
      {isAuthenticated && <Navbar />}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-300 ${isAuthenticated ? "ml-64" : "ml-0"}`}>
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
