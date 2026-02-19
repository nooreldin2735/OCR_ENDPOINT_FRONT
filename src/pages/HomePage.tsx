import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Globe, Cpu, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero_home.jpg";

export default function HomePage() {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full max-w-6xl px-6 py-20 flex flex-col md:flex-row items-center gap-12">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                        <Zap className="h-3 w-3" />
                        Empowering Modern Engineering
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-accent leading-tight">
                        Next-Gen <br />
                        <span className="text-primary italic">Intelligence</span> <br />
                        for ACME SAICO
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                        Harness the power of AI-driven spatial analysis and document intelligence.
                        Automate your workflows with our custom OCR solutions tailored for precision.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <Link
                            to="/ocr"
                            className="px-8 py-4 rounded-2xl bg-primary text-white font-bold flex items-center gap-2 shadow-xl shadow-primary/30 hover:scale-105 transition-all"
                        >
                            Launch OCR Module
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <button className="px-8 py-4 rounded-2xl bg-white border border-glass-border text-accent font-bold hover:bg-secondary transition-all">
                            Learn More
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 relative"
                >
                    <div className="relative z-10 glass-panel-strong rounded-[3rem] shadow-2xl border-2 border-primary/10 overflow-hidden aspect-video flex items-center justify-center">
                        <img src={heroImage} alt="ACME SAICO Hero" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full -z-0 transform translate-x-10 translate-y-10" />
                </motion.div>
            </section>

            {/* Grid Features */}
            <section className="w-full bg-secondary/50 py-20 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Shield className="h-8 w-8 text-primary" />}
                        title="Secure Processing"
                        description="Enterprise-grade security for all your sensitive engineering documents."
                    />
                    <FeatureCard
                        icon={<Globe className="h-8 w-8 text-primary" />}
                        title="Global Access"
                        description="Access your analysis tools from anywhere in the world on any device."
                    />
                    <FeatureCard
                        icon={<Cpu className="h-8 w-8 text-primary" />}
                        title="AI Powered"
                        description="Utilizing the latest Gemini models for high-precision text detection."
                    />
                </div>
            </section>

            {/* Footer Section */}
            <footer className="w-full bg-white border-t border-glass-border pt-20 pb-10 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                        {/* Contact Details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-accent">Contact Details</h4>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Please call us from Sunday to Thursday <br />
                                    from 9 am till 5 pm
                                </p>
                                <p className="text-lg font-bold text-accent">
                                    +202 24179160 <span className="text-muted-foreground/30 mx-2">/</span> +202 22910281
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-accent">Email</h4>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Feel free to send us an email <br />
                                    at anytime
                                </p>
                                <a
                                    href="mailto:info@acmesaico.com"
                                    className="text-lg font-bold text-primary hover:underline underline-offset-4"
                                >
                                    info@acmesaico.com
                                </a>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-accent">Location</h4>
                            </div>
                            <div className="space-y-4">
                                <p className="text-base font-bold text-accent leading-relaxed">
                                    37a Galal ElDin El Desouky St, <br />
                                    Helioplis, Cairo, Egypt
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-glass-border flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-muted-foreground font-medium">
                            © {new Date().getFullYear()} ACME SAICO. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                                Engineering Excellence Since 1970
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-8 rounded-3xl bg-white border border-glass-border shadow-xl space-y-4"
        >
            <div className="bg-secondary p-4 rounded-2xl inline-block">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-accent">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}
