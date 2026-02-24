import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, Home, FileText, ChevronRight, Clock, LogOut, User as UserIcon } from "lucide-react";
import logo from "../assets/Logo-Acme.png";
import { useOCRContext } from "../contexts/OCRContext";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
    const { history, setIsHistoryOpen } = useOCRContext();
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleOpenHistory = () => {
        if (location.pathname !== "/ocr") {
            navigate("/ocr");
        }
        setIsHistoryOpen(true);
    };

    return (
        <aside className="fixed top-0 left-0 h-full w-64 bg-accent border-r border-white/10 flex flex-col p-6 z-50 text-white shadow-2xl">
            {/* Brand Header */}
            <div className="flex flex-col gap-4 mb-10">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="ACME SAICO Logo" className="h-10 w-auto brightness-0 invert" />
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-white">
                            ACME<span className="text-primary">SAICO</span>
                        </span>
                    </div>
                </div>
                <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold leading-none border-l-2 border-primary pl-2">
                    Excellence in Engineering
                </span>
            </div>

            {/* User Info Section */}
            {user && (
                <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <UserIcon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate">{user.username}</span>
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-tighter truncate">{user.role}</span>
                    </div>
                </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col gap-2">
                <NavButton to="/" icon={<Home className="h-4 w-4" />} label="Home Dashboard" />
                <NavButton to="/ocr" icon={<Search className="h-4 w-4" />} label="OCR Intelligent Module" />

                {/* Global History Action */}
                <button
                    onClick={handleOpenHistory}
                    className="mt-4 flex items-center justify-between group px-4 py-3.5 rounded-xl transition-all duration-300 text-white/60 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/20"
                >
                    <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm tracking-tight">Process History</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        {history.length}
                    </span>
                </button>
            </nav>

            {/* Footer / Status */}
            <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20 group"
                >
                    <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-sm font-bold tracking-tight">System Logout</span>
                </button>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">System Active</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium text-white/40 px-1">
                    <FileText className="h-4 w-4" />
                    <span className="leading-tight">ASCL Platform v1.2</span>
                </div>
            </div>
        </aside>
    );
}

function NavButton({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `
        flex items-center justify-between group px-4 py-3.5 rounded-xl transition-all duration-300
        ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/40 scale-[1.02]"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }
      `}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span className="font-bold text-sm tracking-tight">{label}</span>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${label.includes("Home") ? "hidden" : "group-hover:translate-x-1"}`} />
        </NavLink>
    );
}
