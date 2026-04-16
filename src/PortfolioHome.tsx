import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  GraduationCap,
  Mail,
  Linkedin,
  Github,
  MapPin,
  ExternalLink,
  Menu,
  X,
  Phone,
  BarChart3,
  Code2,
  Wrench,
  Megaphone,
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Loader2,
  Users,
  Sun,
  Moon,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { auth, db } from "./lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { trackClick, trackLoginAttempt } from "./lib/analytics";
import { useTheme } from "./lib/theme";
import { grantAdminSession } from "./lib/adminSession";

// ─── Translations ──────────────────────────────────────────────────────────

const translations = {
  pt: {
    nav: { home: "Início", projects: "Projetos", experience: "Experiência", about: "Sobre", contact: "Contato" },
    hero: {
      role: "Analista de Dados & BI",
      subtitle: "Transformando dados em decisões estratégicas através de dashboards e visualizações impactantes.",
      ctaProjects: "Ver Projetos",
      ctaContact: "Entrar em Contato",
      scroll: "Rolar para baixo",
    },
    experience: {
      label: "TRAJETÓRIA",
      title: "Experiência",
      subsection: "Profissional",
      roles: [
        { title: "Analista de Dados I", company: "ROQT Data & IA", period: "02/2026 — Presente", description: "" },
        { title: "Assistente de Dados e BI", company: "ROQT Data & IA", period: "06/2025 — 02/2026", description: "Desenvolvimento de dashboards em Power BI, análises e processos de ETL, apoiando a tomada de decisão e gerando insights estratégicos para os clientes" },
        { title: "Estagiário de Business Intelligence", company: "ROQT Data & AI", period: "02/2025 — 05/2025", description: "Apoio na criação de dashboards no Power BI e em processos de ETL com Power Query, utilizando M, DAX e Excel" },
        { title: "Consultoria de Marketing e Tráfego", company: "Lojas Mil", period: "01/2025 — 02/2025", description: "Consultoria em alavancar redes sociais, engajamento e tráfego" },
        { title: "Analista de Marketing", company: "Jucalli Calçados", period: "04/2024 — 01/2025", description: "Atuação focada em tráfego pago, design e comunicação visual, com experiência em Canva, Photoshop e gestão de mídias." },
        { title: "Assistente de Marketing", company: "Jucalli Calçados", period: "03/2023 — 03/2024", description: "" },
        { title: "Aprendiz de Social Media", company: "Jucalli Calçados", period: "06/2022 — 02/2023", description: "" }
      ]
    },
    education: {
      subsection: "Formação",
      items: [
        { degree: "Bacharelado em Engenharia de Software", institution: "Unicesumar", period: "2024 — 2028" },
        { degree: "Ensino Médio", institution: "Curso e Colégio Integral", period: "2021 — 2023" },
        { degree: "Ensino Fundamental", institution: "Colégio Santo Inácio", period: "" }
      ]
    },
    about: {
      label: "QUEM SOU?",
      title: "Sobre Mim",
      paragraphs: [
        "Atuo com foco em Power BI, no desenvolvimento de dashboards, análises visuais e comunicação estratégica de insights para apoiar a tomada de decisão.",
        "Trabalho na criação de soluções de Data Visualization e front-end analítico, com projetos entregues de ponta a ponta, incluindo conexões, ETL e modelagem de dados via Power Query.",
        "Minha bagagem em marketing fortalece a visão estratégica e a comunicação das entregas: atuei com tráfego pago, design e comunicação visual. Essa combinação entre dados e comunicação visual torna as soluções mais completas.",
        "Também tenho experiência com metodologias ágeis, como Scrum e Kanban, o que contribui para uma gestão de projetos mais estruturada e eficiente."
      ],
      skillsTitle: "Habilidades",
      skillCategories: [
        { title: "Data & BI", icon: <BarChart3 className="h-5 w-5" />, skills: ["Power BI", "DAX & M", "Power Query (ETL)", "Modelagem de Dados"] },
        { title: "Development", icon: <Code2 className="h-5 w-5" />, skills: ["Excel", "Figma", "Metodologias Ágeis", "SQL (básico)", "Git / GitHub", "Certificações Anthropic (IA)"] },
        { title: "Tools & Workflow", icon: <Wrench className="h-5 w-5" />, skills: ["ClickUp", "Canva", "Photoshop", "Notion", "Google Workspace", "Microsoft Teams"] },
        { title: "Marketing", icon: <Megaphone className="h-5 w-5" />, skills: ["Tráfego Pago", "Marketing Digital", "Meta Ads", "Google Ads", "Copywriting"] },
        { title: "Soft Skills", icon: <Users className="h-5 w-5" />, skills: ["Comunicação", "Trabalho em Equipe", "Adaptabilidade", "Gestão de Tempo", "Resolução de Problemas"] }
      ]
    },
    projects: {
      label: "PORTFÓLIO",
      title: "Projetos",
      viewDetails: "Ver Detalhes",
      items: [
        { id: "1", title: "Dashboard de Vendas", category: "Business Intelligence", description: "Análise completa de performance de vendas com Power BI.", image: "https://picsum.photos/seed/sales/800/600" },
        { id: "2", title: "Análise de Churn", category: "Data Analysis", description: "Identificação de padrões de cancelamento de clientes.", image: "https://picsum.photos/seed/data/800/600" },
        { id: "3", title: "Relatório de Marketing", category: "Marketing Analytics", description: "Acompanhamento de ROI e conversão de campanhas.", image: "https://picsum.photos/seed/marketing/800/600" }
      ]
    },
    contact: { label: "FALE COMIGO", title: "Contato", subtitle: "Tem um projeto em mente? Entre em contato nos canais abaixo.", email: "Enviar Email", linkedin: "LinkedIn", whatsapp: "WhatsApp" },
    footer: { tagline: "Dados & Business Intelligence", status: "Disponível, aceitando novos projetos", navTitle: "Navegação", contactTitle: "Contato", rights: "© 2026 Victor Hugo Pacchioni Sgobbi", location: "Maringá, PR — Brasil" }
  },
  en: {
    nav: { home: "Home", projects: "Projects", experience: "Experience", about: "About", contact: "Contact" },
    hero: {
      role: "Data Analyst & BI",
      subtitle: "Transforming data into strategic decisions through impactful dashboards and visualizations.",
      ctaProjects: "View Projects",
      ctaContact: "Get in Touch",
      scroll: "Scroll down",
    },
    experience: {
      label: "TRAJECTORY",
      title: "Experience",
      subsection: "Professional",
      roles: [
        { title: "Data Analyst I", company: "ROQT Data & AI", period: "02/2026 — Present", description: "" },
        { title: "Data & BI Assistant", company: "ROQT Data & AI", period: "06/2025 — 02/2026", description: "Development of dashboards in Power BI, analysis and ETL processes, supporting decision-making." },
        { title: "Business Intelligence Intern", company: "ROQT Data & AI", period: "02/2025 — 05/2025", description: "Support in creating dashboards in Power BI and ETL processes with Power Query." },
        { title: "Marketing & Traffic Consulting", company: "Lojas Mil", period: "", description: "Consulting on leveraging social networks, engagement and traffic" },
        { title: "Marketing Analyst", company: "Jucalli Calçados", period: "06/2022 — 01/2025", description: "Focused on paid traffic, design and visual communication." }
      ]
    },
    education: {
      subsection: "Education",
      items: [
        { degree: "Bachelor of Software Engineering", institution: "Unicesumar", period: "01/2024 — 12/2027" },
        { degree: "High School", institution: "Curso e Colégio Integral", period: "2021 — 2023" },
        { degree: "Elementary School", institution: "Colégio Santo Inácio", period: "" }
      ]
    },
    about: {
      label: "WHO I AM",
      title: "About Me",
      paragraphs: [
        "I focus on Power BI, developing dashboards, visual analysis and strategic communication of insights to support decision-making.",
        "I work on creating Data Visualization solutions and analytical front-end, with end-to-end projects delivered.",
        "My marketing background strengthens the strategic vision and communication of deliverables. This combination of data and visual communication makes solutions more complete.",
        "I also have experience with agile methodologies, such as Scrum and Kanban, which contributes to more structured and efficient project management."
      ],
      skillsTitle: "Skills",
      skillCategories: [
        { title: "Data & BI", icon: <BarChart3 className="h-5 w-5" />, skills: ["Power BI", "DAX & M", "Power Query (ETL)", "Data Modeling"] },
        { title: "Development", icon: <Code2 className="h-5 w-5" />, skills: ["Advanced Excel", "Figma", "Agile Methodologies"] },
        { title: "Tools & Workflow", icon: <Wrench className="h-5 w-5" />, skills: ["ClickUp", "Canva", "Photoshop"] },
        { title: "Marketing", icon: <Megaphone className="h-5 w-5" />, skills: ["Paid Traffic", "Digital Marketing", "Business Communication"] }
      ]
    },
    projects: {
      label: "PORTFOLIO",
      title: "Projects",
      viewDetails: "View Details",
      items: [
        { id: "1", title: "Sales Dashboard", category: "Business Intelligence", description: "Complete sales performance analysis with Power BI.", image: "https://picsum.photos/seed/sales/800/600" },
        { id: "2", title: "Churn Analysis", category: "Data Analysis", description: "Identification of customer cancellation patterns.", image: "https://picsum.photos/seed/data/800/600" },
        { id: "3", title: "Marketing Report", category: "Marketing Analytics", description: "Tracking ROI and campaign conversion.", image: "https://picsum.photos/seed/marketing/800/600" }
      ]
    },
    contact: { label: "TALK TO ME", title: "Contact", subtitle: "Interested in working together? Get in touch through any of the channels below.", email: "Send Email", linkedin: "LinkedIn", github: "GitHub" },
    footer: { tagline: "Data & Business Intelligence", status: "Available, accepting new projects", navTitle: "Navigation", contactTitle: "Contact", rights: "© 2026 Victor Hugo Pacchioni Sgobbi", location: "Maringá, PR — Brazil" }
  }
};

// ─── Component ────────────────────────────────────────────────────────────

export default function PortfolioHome() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackNome, setFeedbackNome] = useState("");
  const [feedbackContato, setFeedbackContato] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const t = translations.pt;
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // ── Scroll state ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Active section via IntersectionObserver ───────────────────────────────
  useEffect(() => {
    const sectionIds = ["inicio", "projetos", "experiencia", "sobre", "contato"];
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.35, rootMargin: "-60px 0px 0px 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, username, password);
      trackLoginAttempt(true);
      grantAdminSession();
      navigate("/admin");
    } catch {
      trackLoginAttempt(false);
      setLoginError("Email ou senha incorretos.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackLoading(true);
    try {
      const contato = feedbackContato.trim();
      const doc: Record<string, any> = {
        nome: feedbackNome.trim(),
        mensagem: feedbackMsg.trim(),
        timestamp: serverTimestamp(),
      };
      if (contato) doc.contato = contato;

      await addDoc(collection(db, "feedbacks"), doc);
      setFeedbackSent(true);
      setFeedbackNome("");
      setFeedbackContato("");
      setFeedbackMsg("");
    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
      alert("Erro ao enviar. Tente novamente.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const navLinks = [
    { name: t.nav.home, href: "#inicio", id: "inicio" },
    { name: t.nav.projects, href: "#projetos", id: "projetos" },
    { name: t.nav.experience, href: "#experiencia", id: "experiencia" },
    { name: t.nav.about, href: "#sobre", id: "sobre" },
    { name: t.nav.contact, href: "#contato", id: "contato" },
  ];

  const contactLinks = {
    email: "mailto:victorhugosgobbi@gmail.com",
    linkedin: "https://www.linkedin.com/in/victorsgobbi",
    github: "https://github.com/VictorSgobbi",
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/85 backdrop-blur-md border-b border-border/60 py-3" : "bg-transparent py-6"}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <a href="#inicio" className="text-2xl font-bold tracking-tighter">
            Victor<span className="text-primary">.</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  activeSection === link.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
                {activeSection === link.id && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </a>
            ))}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full" aria-label="Alternar tema">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { setFeedbackSent(false); setFeedbackOpen(true); }} className="rounded-full" aria-label="Feedback">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setLoginModalOpen(true)} className="rounded-full" aria-label="Admin login">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile burger */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background/95 backdrop-blur-md border-b border-border overflow-hidden"
            >
              <nav className="flex flex-col p-6 gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`text-base font-medium px-4 py-3 rounded-xl transition-colors ${
                      activeSection === link.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-base font-medium"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                  </button>
                  <button
                    onClick={() => { closeMobileMenu(); setFeedbackSent(false); setFeedbackOpen(true); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-base font-medium"
                  >
                    <MessageSquare className="h-4 w-4" /> Feedback & Sugestões
                  </button>
                  <button
                    onClick={() => { closeMobileMenu(); setLoginModalOpen(true); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-base font-medium"
                  >
                    <User className="h-4 w-4" /> Admin
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero ── */}
      <section id="inicio" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center flex flex-col items-center"
          >
            <Badge variant="secondary" className="mb-5 py-1.5 px-4 gap-2 bg-muted/50 border-border text-muted-foreground font-medium">
              <MapPin className="h-3 w-3 text-primary" /> Maringá, PR
            </Badge>

            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-4">{t.hero.role}</p>

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.08] mb-6 md:mb-8">
              Victor Hugo<br />
              <span className="text-primary">Pacchioni Sgobbi</span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-10 leading-relaxed max-w-2xl px-2">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto justify-center gap-3 px-4 sm:px-0">
              <Button asChild size="lg" className="rounded-full px-8 h-12 md:h-14 text-base font-semibold w-full sm:w-auto" onClick={() => trackClick("hero_projects")}>
                <a href="#projetos">{t.hero.ctaProjects}</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12 md:h-14 text-base font-semibold border-border hover:bg-muted/50 w-full sm:w-auto" onClick={() => trackClick("hero_contact")}>
                <a href="#contato">{t.hero.ctaContact}</a>
              </Button>
            </div>
          </motion.div>
        </div>

      </section>

      {/* ── Projects ── */}
      <section id="projetos" className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="mb-10 md:mb-16">
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">{t.projects.label}</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t.projects.title}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.projects.items.map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl mb-5 bg-gradient-to-br from-secondary via-secondary to-secondary/60 border border-border/40">
                  {/* Em construção placeholder */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="text-5xl"
                    >
                      ⚙️
                    </motion.div>
                    <div className="text-center px-4">
                      <p className="text-sm font-semibold text-foreground/70 tracking-wide">Em construção</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Em breve disponível</p>
                    </div>
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-border/60">
                      {project.category}
                    </span>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="flex flex-col flex-1 space-y-2">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-muted-foreground text-sm flex-1">{project.description}</p>
                  <div className="pt-3">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-full gap-2 border-border hover:border-primary hover:text-primary transition-colors"
                      onClick={() => trackClick(`project_view_${project.id}`, project.id)}
                    >
                      <Link to={`/projects/${project.id}`} target="_blank">
                        {t.projects.viewDetails} <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section id="experiencia" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="mb-10 md:mb-16">
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">{t.experience.label}</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t.experience.title}</h2>
          </div>
          <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-12">
            <div className="flex items-center gap-3 md:items-start">
              <div className="p-2 rounded-lg bg-primary/10 text-primary"><Briefcase className="h-5 w-5 md:h-6 md:w-6" /></div>
              <h3 className="text-xl md:text-2xl font-bold">{t.experience.subsection}</h3>
            </div>
            <div className="space-y-10 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
              {t.experience.roles.map((role, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative pl-10"
                >
                  <div className={`absolute left-0 top-2 w-4 h-4 rounded-full border-4 border-background z-10 transition-colors ${idx === 0 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h4 className="text-lg font-bold">{role.title}</h4>
                      {role.period && (
                        <span className="text-xs font-medium text-muted-foreground bg-muted/40 px-3 py-1 rounded-full shrink-0">{role.period}</span>
                      )}
                    </div>
                    <p className="text-primary font-semibold text-sm">{role.company}</p>
                    {role.description && (
                      <p className="text-muted-foreground leading-relaxed text-sm mt-2">{role.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Separator className="my-12 md:my-20 bg-border/50" />

          <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-12">
            <div className="flex items-center gap-3 md:items-start">
              <div className="p-2 rounded-lg bg-primary/10 text-primary"><GraduationCap className="h-5 w-5 md:h-6 md:w-6" /></div>
              <h3 className="text-xl md:text-2xl font-bold">{t.education.subsection}</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {t.education.items.map((item, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                  <Card className="h-full bg-secondary/50 border-border hover:border-primary/40 transition-colors duration-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base leading-tight">{item.degree}</CardTitle>
                      <CardDescription className="text-primary font-medium">{item.institution}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm text-muted-foreground">{item.period}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About & Skills ── */}
      <section id="sobre" className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="mb-10 md:mb-16">
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">{t.about.label}</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t.about.title}</h2>
          </div>
          {/* Foto + Texto */}
          <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-10 items-start mb-10 md:mb-14">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative w-48 sm:w-64 md:w-72 mx-auto md:mx-0 shrink-0"
            >
              <div className="absolute inset-0 rounded-3xl bg-primary/15 blur-2xl" />
              <img
                src="/victor.jpg"
                alt="Victor Sgobbi"
                className="relative w-full object-cover object-top rounded-3xl border border-border shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-5 pt-2"
            >
              {t.about.paragraphs.map((p, idx) => (
                <p key={idx} className="text-base md:text-lg text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </motion.div>
          </div>

          {/* Habilidades */}
          <div className="mb-8">
            <span className="text-primary font-bold tracking-widest text-xs uppercase">{t.about.skillsTitle}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {t.about.skillCategories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Card className="h-full bg-secondary/30 border-border hover:border-primary/50 hover:bg-secondary/60 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="p-2 rounded-lg bg-primary/10 text-primary"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        {cat.icon}
                      </motion.div>
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">{cat.title}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {cat.skills.map((skill, sIdx) => (
                      <Badge key={sIdx} variant="secondary" className="bg-background/50 border-border font-medium text-xs hover:border-primary/40 hover:text-primary transition-colors duration-200">
                        {skill}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contato" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">{t.contact.label}</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 md:mb-6">{t.contact.title}</h2>
            <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-12 mx-auto">{t.contact.subtitle}</p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 px-4 sm:px-0">
              <Button asChild size="lg" className="rounded-full px-8 h-12 md:h-14 gap-2.5 w-full sm:w-auto" onClick={() => trackClick("contact_email")}>
                <a href={contactLinks.email}>
                  <Mail className="h-4 w-4" /> {t.contact.email}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12 md:h-14 gap-2.5 border-border hover:border-primary hover:text-primary w-full sm:w-auto" onClick={() => trackClick("contact_linkedin")}>
                <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" /> {t.contact.linkedin}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12 md:h-14 gap-2.5 border-border hover:border-[#25D366] hover:text-[#25D366] w-full sm:w-auto" onClick={() => trackClick("contact_whatsapp")}>
                <a href="https://wa.me/5544991117878" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {t.contact.whatsapp}
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pt-12 md:pt-20 pb-10 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-10 md:mb-14">
            <div className="space-y-5">
              <a href="#inicio" className="text-2xl font-bold tracking-tighter">Victor<span className="text-primary">.</span></a>
              <p className="text-muted-foreground font-medium">{t.footer.tagline}</p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {t.footer.status}
              </div>
              <button
                onClick={() => { setFeedbackSent(false); setFeedbackOpen(true); }}
                className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" /> Feedback & Sugestões
              </button>
            </div>
            <div className="space-y-5">
              <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">{t.footer.navTitle}</h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-5">
              <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">{t.footer.contactTitle}</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <a href={contactLinks.email} className="hover:text-primary transition-colors">{contactLinks.email.replace("mailto:", "")}</a>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  +55 (44) 99111-7878
                </li>
                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Linkedin className="h-4 w-4 text-primary shrink-0" />
                  <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Github className="h-4 w-4 text-primary shrink-0" />
                  <a href={contactLinks.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="mb-8 bg-border/50" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
            <p>{t.footer.rights}</p>
            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{t.footer.location}</p>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp flutuante ── */}
      <motion.a
        href="https://wa.me/5544991117878"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full shadow-lg active:scale-95 transition-transform"
        style={{ backgroundColor: "#25D366" }}
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </motion.a>

      {/* ── Feedback Modal ── */}
      <AnimatePresence>
        {feedbackOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFeedbackOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-secondary/60 border border-border rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-bold">Feedback & Sugestões</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFeedbackOpen(false)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {feedbackSent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6 space-y-3"
                  >
                    <div className="text-4xl">🙌</div>
                    <p className="text-lg font-bold">Obrigado pelo feedback!</p>
                    <p className="text-muted-foreground text-sm">Sua mensagem foi enviada com sucesso.</p>
                    <Button className="mt-4 rounded-xl" onClick={() => setFeedbackOpen(false)}>Fechar</Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleFeedback}
                    className="space-y-5"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground ml-1">Nome <span className="text-primary">*</span></label>
                      <input
                        type="text"
                        value={feedbackNome}
                        onChange={(e) => setFeedbackNome(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        placeholder="Seu nome"
                        required
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground ml-1">Contato <span className="text-muted-foreground/50 text-xs">(opcional)</span></label>
                      <input
                        type="text"
                        value={feedbackContato}
                        onChange={(e) => setFeedbackContato(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        placeholder="Email, WhatsApp ou LinkedIn"
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground ml-1">Mensagem <span className="text-primary">*</span></label>
                      <textarea
                        value={feedbackMsg}
                        onChange={(e) => setFeedbackMsg(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
                        placeholder="Sua sugestão, feedback ou opinião..."
                        required
                        rows={4}
                        maxLength={1000}
                      />
                      <p className="text-xs text-muted-foreground/50 text-right">{feedbackMsg.length}/1000</p>
                    </div>

                    <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold gap-2" disabled={feedbackLoading}>
                      {feedbackLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                      ) : (
                        "Enviar Feedback"
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Login Modal ── */}
      <AnimatePresence>
        {loginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLoginModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-secondary/60 border border-border rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-bold">Admin Login</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setLoginModalOpen(false)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      placeholder="Digite seu email"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-destructive font-medium text-center bg-destructive/10 rounded-lg py-2 px-3"
                    >
                      {loginError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold gap-2" disabled={loginLoading}>
                  {loginLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Entrando...</>
                  ) : (
                    "Entrar no Painel"
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
