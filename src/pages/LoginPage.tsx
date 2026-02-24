import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Lock, User, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import logo from "../assets/company_logo.png";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState(""); // Not used in mock but for UI
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        setIsSubmitting(true);
        await login(username);
        navigate(from, { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10 px-6"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-glass-border rounded-[2.5rem] p-10 shadow-2xl shadow-accent/5">
                    {/* Brand */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="p-4 bg-primary/10 rounded-3xl mb-4">
                            <img src={logo} alt="ACME SAICO" className="h-12 w-auto" />
                        </div>
                        <h2 className="text-3xl font-black text-accent tracking-tighter">Identity Portal</h2>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2 overflow-hidden flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3 text-primary" />
                            Secure Corporate Authentication
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-accent/60 pl-4">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your corporate ID"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/50 border border-glass-border focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-accent hover:bg-secondary"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-accent/60 pl-4">Security Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/50 border border-glass-border focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-accent hover:bg-secondary"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-2xl bg-accent text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all group"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Verify & Access
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-glass-border">
                        <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest leading-relaxed opacity-60">
                            Authorized personnel only. <br />
                            All access is logged for security auditing.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
