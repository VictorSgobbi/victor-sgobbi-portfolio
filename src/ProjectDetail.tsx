import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectData {
  id: string;
  title: string;
  description: string;
  longDescription: {
    about: string;
    methodology: string;
    results: string;
  };
  tags: string[];
}

const PROJECT_IDS = ["1", "2", "3"];

const projectsData: Record<string, ProjectData> = {
  "1": {
    id: "1",
    title: "Dashboard de Vendas",
    description: "Análise completa de performance de vendas com Power BI.",
    longDescription: {
      about: "Este projeto foi desenvolvido para uma empresa de varejo que precisava consolidar dados de múltiplas fontes para entender o desempenho de suas lojas em tempo real.",
      methodology: "Utilizei Power Query para o processo de ETL, conectando APIs de vendas e planilhas de metas. A modelagem seguiu o esquema estrela (Star Schema) para otimizar a performance das medidas DAX.",
      results: "O dashboard reduziu o tempo de geração de relatórios mensais em 80% e permitiu a identificação de produtos com baixa margem que foram posteriormente descontinuados."
    },
    tags: ["Power BI", "DAX", "ETL", "SQL"],
  },
  "2": {
    id: "2",
    title: "Análise de Churn",
    description: "Identificação de padrões de cancelamento de clientes.",
    longDescription: {
      about: "Análise exploratória de dados focada em entender por que os clientes de um serviço SaaS estavam cancelando suas assinaturas.",
      methodology: "Processamento de dados históricos de uso e suporte. Criação de modelos de segmentação para identificar grupos de alto risco.",
      results: "Identificamos que 40% do churn ocorria nos primeiros 30 dias devido a uma falha no processo de onboarding, resultando em uma reestruturação do fluxo de boas-vindas."
    },
    tags: ["Data Analysis", "Python", "Pandas", "Churn"],
  },
  "3": {
    id: "3",
    title: "Relatório de Marketing",
    description: "Acompanhamento de ROI e conversão de campanhas.",
    longDescription: {
      about: "Dashboard integrado para monitorar o investimento em tráfego pago (Google Ads e Meta Ads) e o retorno direto em vendas.",
      methodology: "Conexão direta com as plataformas de anúncios e integração com o CRM da empresa para rastrear a jornada do cliente do clique à conversão.",
      results: "Aumento de 25% na eficiência do gasto com mídia ao realocar orçamento para campanhas com melhor custo por aquisição (CPA)."
    },
    tags: ["Marketing Analytics", "Google Ads", "Meta Ads", "ROI"],
  }
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = id && PROJECT_IDS.includes(id) ? projectsData[id] : null;
  const currentIndex = PROJECT_IDS.indexOf(id ?? "");
  const prevId = currentIndex > 0 ? PROJECT_IDS[currentIndex - 1] : null;
  const nextId = currentIndex < PROJECT_IDS.length - 1 ? PROJECT_IDS[currentIndex + 1] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Projeto não encontrado</h1>
          <Button asChild variant="outline" className="rounded-full gap-2">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Voltar ao Portfólio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/60 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao Portfólio
          </Link>
          <div className="text-xl font-bold tracking-tighter">
            Victor<span className="text-primary">.</span>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-24">

        {/* ── Project Hero ── */}
        <section className="container mx-auto px-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Portfólio</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{project.title}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-5">
              {project.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-10">
              {project.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="py-1.5 px-3 text-sm font-medium bg-secondary/50 border-border">
                  {tag}
                </Badge>
              ))}
            </div>

          </motion.div>
        </section>

        {/* ── Em Construção placeholder ── */}
        <section className="container mx-auto px-6 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[16/6] overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-secondary to-secondary/60 border border-border/40 flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="text-6xl"
            >
              ⚙️
            </motion.div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground/70 tracking-wide">Em construção</p>
              <p className="text-sm text-muted-foreground mt-1">Imagens do projeto serão adicionadas em breve</p>
            </div>
          </motion.div>
        </section>

        {/* ── Detail Sections ── */}
        <section className="container mx-auto px-6 max-w-3xl">
          <div className="space-y-14">
            {[
              { title: "Sobre este projeto", content: project.longDescription.about },
              { title: "Metodologia e Ferramentas", content: project.longDescription.methodology },
              { title: "Resultados e Impacto", content: project.longDescription.results },
            ].map(({ title, content }, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <span className="text-primary font-mono text-sm">0{idx + 1}</span>
                  {title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{content}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Prev / Next navigation ── */}
        <section className="container mx-auto px-6 mt-20 max-w-3xl">
          <div className="border-t border-border pt-10 flex items-center justify-between gap-4">
            {prevId ? (
              <Button
                variant="outline"
                className="rounded-full gap-2 border-border hover:border-primary hover:text-primary h-12 px-6"
                onClick={() => navigate(`/projects/${prevId}`)}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{projectsData[prevId].title}</span>
                <span className="sm:hidden">Anterior</span>
              </Button>
            ) : <div />}

            {nextId ? (
              <Button
                variant="outline"
                className="rounded-full gap-2 border-border hover:border-primary hover:text-primary h-12 px-6"
                onClick={() => navigate(`/projects/${nextId}`)}
              >
                <span className="hidden sm:inline">{projectsData[nextId].title}</span>
                <span className="sm:hidden">Próximo</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="rounded-full gap-2 h-12 px-6 text-muted-foreground hover:text-primary"
              >
                <Link to="/">
                  Ver todos os projetos <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </section>

      </main>

    </div>
  );
}
