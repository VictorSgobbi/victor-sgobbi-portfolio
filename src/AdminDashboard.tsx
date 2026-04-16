import { useState, useEffect, useMemo } from "react";
import { db, auth } from "./lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { isAdminSessionGranted, clearAdminSession } from "./lib/adminSession";
import {
  BarChart3, MousePointer2, Clock, Users, ArrowLeft, LogOut,
  LayoutDashboard, Projector, Mail, CalendarClock, ShieldAlert,
  TrendingUp, Activity, Sun, Moon, MessageSquare,
} from "lucide-react";
import { useTheme } from "./lib/theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];

const BUTTON_LABELS: Record<string, string> = {
  project_view_1:  "Ver Dashboard de Vendas",
  project_view_2:  "Ver Análise de Churn",
  project_view_3:  "Ver Rel. de Marketing",
  hero_projects:   "Hero → Projetos",
  hero_contact:    "Hero → Contato",
  contact_email:   "Contato → Email",
  contact_linkedin:"Contato → LinkedIn",
  contact_github:  "Contato → GitHub",
};

const PROJECT_LABELS: Record<string, string> = {
  "1": "Dashboard de Vendas",
  "2": "Análise de Churn",
  "3": "Rel. de Marketing",
};

const CLICK_CATEGORIES: Record<string, string> = {
  hero_projects:   "Hero",
  hero_contact:    "Hero",
  project_view_1:  "Projetos",
  project_view_2:  "Projetos",
  project_view_3:  "Projetos",
  contact_email:   "Contato",
  contact_linkedin:"Contato",
  contact_github:  "Contato",
};

const CONTACT_IDS = ["contact_email","contact_linkedin","contact_github"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.title = "Victor Sgobbi Admin";
    return () => { document.title = "Victor Sgobbi"; };
  }, []);

  // ── 1. Verificar autenticação + flag de sessão explícita ───────────────────
  useEffect(() => {
    if (!isAdminSessionGranted()) {
      // Acesso direto via URL — força sign-out síncrono e redireciona
      let redirected = false;
      signOut(auth).finally(() => {
        if (!redirected) {
          redirected = true;
          navigate("/", { replace: true });
        }
      });
      return;
    }

    let active = true;
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!active) return;
      if (!u) {
        navigate("/", { replace: true });
      } else {
        setAuthed(true);
      }
      setAuthChecked(true);
    });
    return () => {
      active = false;
      unsubAuth();
    };
  }, [navigate]);

  // ── 2. Só buscar dados após confirmar que está autenticado ──────────────────
  useEffect(() => {
    if (!authed) return;
    const qAnalytics = query(collection(db, "analytics"), orderBy("timestamp", "desc"));
    const unsubAnalytics = onSnapshot(qAnalytics, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    const qFeedbacks = query(collection(db, "feedbacks"), orderBy("timestamp", "desc"));
    const unsubFeedbacks = onSnapshot(qFeedbacks, (snap) => {
      setFeedbacks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubAnalytics(); unsubFeedbacks(); };
  }, [authed]);

  const handleLogout = async () => { clearAdminSession(); await signOut(auth); navigate("/"); };

  // ─── Filtered sets ────────────────────────────────────────────────────────

  const sessionEvents = useMemo(() => events.filter(e => e.type === "session" && e.timestamp), [events]);
  const clickEvents   = useMemo(() => events.filter(e => e.type === "click"), [events]);
  const loginAttempts = useMemo(() => events.filter(e => e.type === "login_attempt"), [events]);

  // ─── KPIs ────────────────────────────────────────────────────────────────

  const totalAccesses = useMemo(() =>
    new Set(sessionEvents.map(e => e.sessionId)).size, [sessionEvents]);

  const totalClicks = useMemo(() => clickEvents.length, [clickEvents]);

  const avgDuration = useMemo(() => {
    const d = events.filter(e => e.type === "duration").map(e => e.duration);
    return d.length > 0 ? (d.reduce((a, b) => a + b, 0) / d.length).toFixed(1) : "—";
  }, [events]);

  const engagementRate = useMemo(() => {
    if (totalAccesses === 0) return "—";
    const sessionsWithClicks = new Set(clickEvents.map(e => e.sessionId)).size;
    return Math.round((sessionsWithClicks / totalAccesses) * 100) + "%";
  }, [totalAccesses, clickEvents]);

  const totalContactClicks = useMemo(() =>
    clickEvents.filter(e => CONTACT_IDS.includes(e.elementId)).length, [clickEvents]);

  const totalProjectClicks = useMemo(() =>
    clickEvents.filter(e => e.projectId).length, [clickEvents]);

  const failedLogins  = useMemo(() => loginAttempts.filter(e => !e.success).length, [loginAttempts]);
  const successLogins = useMemo(() => loginAttempts.filter(e =>  e.success).length, [loginAttempts]);

  const lastAccessLabel = useMemo(() => {
    const last = sessionEvents[0];
    return last?.timestamp
      ? new Date(last.timestamp.toMillis()).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
      : "—";
  }, [sessionEvents]);

  // ─── Acessos por dia — últimos 30 dias ───────────────────────────────────

  const dailyAccessData = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return { name: `${d.getDate()}/${d.getMonth() + 1}`, date: d.toISOString().slice(0, 10) };
    });
    const sessMap: Record<string, Set<string>> = {};
    sessionEvents.forEach(e => {
      const key = new Date(e.timestamp.toMillis()).toISOString().slice(0, 10);
      if (!sessMap[key]) sessMap[key] = new Set();
      sessMap[key].add(e.sessionId);
    });
    return days.map(d => ({ name: d.name, acessos: sessMap[d.date]?.size ?? 0 }));
  }, [sessionEvents]);

  // ─── Trend (last 7 days) ──────────────────────────────────────────────────

  const trendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const label = `${weekdays[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
      return { name: label, date: d.toISOString().slice(0, 10), acessos: 0, cliques: 0 };
    });
    const sessMap: Record<string, Set<string>> = {};
    const clkMap:  Record<string, number> = {};
    sessionEvents.forEach(e => {
      const key = new Date(e.timestamp.toMillis()).toISOString().slice(0, 10);
      if (!sessMap[key]) sessMap[key] = new Set();
      sessMap[key].add(e.sessionId);
    });
    clickEvents.forEach(e => {
      if (!e.timestamp) return;
      const key = new Date(e.timestamp.toMillis()).toISOString().slice(0, 10);
      clkMap[key] = (clkMap[key] ?? 0) + 1;
    });
    return days.map(d => ({ name: d.name, acessos: sessMap[d.date]?.size ?? 0, cliques: clkMap[d.date] ?? 0 }));
  }, [sessionEvents, clickEvents]);

  // ─── Button clicks (horizontal) ───────────────────────────────────────────

  const buttonClicksData = useMemo(() => {
    const map: Record<string, number> = {};
    clickEvents.filter(e => e.elementId).forEach(e => {
      map[e.elementId] = (map[e.elementId] ?? 0) + 1;
    });
    return Object.keys(map)
      .map(id => ({ name: BUTTON_LABELS[id] ?? id, value: map[id] }))
      .sort((a, b) => b.value - a.value);
  }, [clickEvents]);

  // ─── Project donut ────────────────────────────────────────────────────────

  const projectClicksData = useMemo(() => {
    const map: Record<string, number> = {};
    clickEvents.filter(e => e.projectId).forEach(e => {
      map[e.projectId] = (map[e.projectId] ?? 0) + 1;
    });
    return Object.keys(map).map(id => ({ name: PROJECT_LABELS[id] ?? `Projeto ${id}`, value: map[id] }));
  }, [clickEvents]);

  // ─── Category bar ─────────────────────────────────────────────────────────

  const categoryData = useMemo(() => {
    const map: Record<string, number> = { Hero: 0, Projetos: 0, Contato: 0, Outros: 0 };
    clickEvents.filter(e => e.elementId).forEach(e => {
      const cat = CLICK_CATEGORIES[e.elementId] ?? "Outros";
      map[cat] = (map[cat] ?? 0) + 1;
    });
    return Object.keys(map).filter(k => map[k] > 0).map(k => ({ name: k, value: map[k] }));
  }, [clickEvents]);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!authChecked || !authed || loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-primary">
      {!authChecked || !authed ? null : "Carregando dados..."}
    </div>
  );

  const isDark = theme === "dark";
  const gridColor = isDark ? "#2a2a2a" : "#e2e8f0";

  const renderRoundedLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: 8 }}>
        {payload.map((entry: any, i: number) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#888" }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: entry.color, display: "inline-block", flexShrink: 0 }} />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: isDark ? "#111318" : "#ffffff",
      border: `1px solid ${isDark ? "#2a2d36" : "#e2e8f0"}`,
      borderRadius: "12px",
      boxShadow: isDark
        ? "0 8px 24px rgba(0,0,0,0.5)"
        : "0 8px 24px rgba(0,0,0,0.1)",
      padding: "10px 14px",
      color: isDark ? "#e5e7eb" : "#0f172a",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      fontSize: "13px",
    },
    labelStyle: {
      color: isDark ? "#94a3b8" : "#64748b",
      fontWeight: 600,
      marginBottom: "4px",
      fontSize: "12px",
      letterSpacing: "0.04em",
      textTransform: "uppercase" as const,
    },
    itemStyle: {
      color: isDark ? "#e5e7eb" : "#0f172a",
      fontWeight: 500,
      fontSize: "13px",
    },
    cursor: { fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Painel Administrativo</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Analytics Portfolio</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar ao Site
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Users className="h-4 w-4 text-primary" />,       label: "Total de Acessos",       value: totalAccesses,       sub: "sessões únicas" },
            { icon: <MousePointer2 className="h-4 w-4 text-primary" />,label: "Total de Cliques",       value: totalClicks,         sub: "interações" },
            { icon: <Clock className="h-4 w-4 text-primary" />,        label: "Tempo Médio",            value: avgDuration === "—" ? "—" : `${avgDuration}s`, sub: "por sessão" },
            { icon: <Activity className="h-4 w-4 text-primary" />,     label: "Taxa de Engajamento",    value: engagementRate,      sub: "sessões com clique" },
            { icon: <Projector className="h-4 w-4 text-primary" />,    label: "Cliques em Projetos",    value: totalProjectClicks,  sub: "visualizações" },
            { icon: <Mail className="h-4 w-4 text-primary" />,         label: "Cliques em Contato",     value: totalContactClicks,  sub: "email, LinkedIn, GitHub" },
            { icon: <ShieldAlert className="h-4 w-4 text-primary" />, label: "Tentativas Falhas",  value: failedLogins,        sub: `${successLogins} bem-sucedida${successLogins !== 1 ? "s" : ""}` },
            { icon: <CalendarClock className="h-4 w-4 text-primary" />,label: "Último Acesso",          value: lastAccessLabel,     sub: "sessão mais recente", small: true },
          ].map(({ icon, label, value, sub, small }) => (
            <Card key={label} className="bg-secondary/30 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {icon} {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`font-bold ${small ? "text-xl" : "text-3xl"}`}>{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Acessos por Dia — últimos 30 dias ── */}
        <Card className="bg-secondary/30 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Acessos por Dia — Últimos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyAccessData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke="#888" fontSize={11} interval={4} />
                <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                <Tooltip {...tooltipStyle} itemStyle={{ color: "#3b82f6" }} formatter={(v: any) => [v, "Acessos"]} />
                <Bar dataKey="acessos" fill="#3b82f6" radius={[4, 4, 0, 0]}
                  label={{ position: "top", fill: "#888", fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Tendência — últimos 7 dias ── */}
        <Card className="bg-secondary/30 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Tendência — Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gradAcessos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCliques" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke="#888" fontSize={11} interval={0} />
                <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="acessos" name="Acessos" stroke="#3b82f6" fill="url(#gradAcessos)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="cliques" name="Cliques" stroke="#10b981" fill="url(#gradCliques)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Cliques por Botão (horizontal, full width) ── */}
        <Card className="bg-secondary/30 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer2 className="h-5 w-5 text-primary" /> Cliques por Botão
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {buttonClicksData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buttonClicksData} layout="vertical" margin={{ left: 10, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" stroke="#888" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#888" fontSize={12} width={185} />
                  <Tooltip {...tooltipStyle} itemStyle={{ color: "#3b82f6" }} formatter={(v: any) => [v, "Cliques"]} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}
                    label={{ position: "right", fill: "#888", fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nenhum clique registrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Donut + Categoria ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Projector className="h-5 w-5 text-primary" /> Cliques por Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              {projectClicksData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectClicksData}
                      cx="50%"
                      cy="45%"
                      innerRadius={75}
                      outerRadius={115}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                      label={({ value, percent }: { value: number; percent: number }) =>
                        `${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={{ stroke: "#888" }}
                    >
                      {projectClicksData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} formatter={(v: any) => [v, "Cliques"]} />
                    <Legend content={renderRoundedLegend} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground">Nenhum dado de projeto ainda</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Cliques por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" stroke="#888" fontSize={13} />
                    <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} formatter={(v: any) => [v, "Cliques"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}
                      label={{ position: "top", fill: "#888", fontSize: 11 }}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Nenhum dado ainda
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Feedbacks ── */}
        <Card className="bg-secondary/30 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Feedbacks & Sugestões
              {feedbacks.length > 0 && (
                <span className="ml-auto text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {feedbacks.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedbacks.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">Nenhum feedback recebido ainda.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-widest">
                      <th className="text-left py-3 pr-4 font-semibold">Data</th>
                      <th className="text-left py-3 pr-4 font-semibold">Nome</th>
                      <th className="text-left py-3 pr-4 font-semibold">Contato</th>
                      <th className="text-left py-3 font-semibold">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((fb, i) => (
                      <tr key={fb.id} className={`border-b border-border/40 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                          {fb.timestamp
                            ? new Date(fb.timestamp.toMillis()).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                            : "—"}
                        </td>
                        <td className="py-3 pr-4 font-medium whitespace-nowrap">{fb.nome}</td>
                        <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{fb.contato || "—"}</td>
                        <td className="py-3 text-muted-foreground max-w-xs">{fb.mensagem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
