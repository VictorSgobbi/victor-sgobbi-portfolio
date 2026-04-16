<div align="center">

# Victor Sgobbi — Portfolio

**Portfólio pessoal de Victor Hugo Pacchioni Sgobbi**  
Analista de Dados & BI · Maringá, PR — Brasil

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Sobre o Projeto

Portfólio desenvolvido do zero com foco em performance, design moderno e analytics real. Além de apresentar projetos, experiências e habilidades, conta com um **painel administrativo** completo para acompanhar métricas de acesso e engajamento em tempo real.

---

## Funcionalidades

- **Portfólio Completo** — Hero, Projetos, Experiência, Sobre e Contato
- **Tema Claro / Escuro** — alternância com persistência em `localStorage`
- **Admin Dashboard** — analytics em tempo real com gráficos interativos
- **Autenticação Segura** — Firebase Auth + bloqueio de acesso direto via URL
- **Lazy Loading** — carregamento sob demanda de páginas pesadas
- **Animações** — transições e interações com Framer Motion
- **Totalmente Responsivo** — mobile-first com Tailwind CSS
- **WhatsApp Flutuante** — botão de contato rápido

---

## Stack de Tecnologias

### Frontend

| Tecnologia | Versão | Uso |
|---|---|---|
| [React](https://react.dev) | 19 | Biblioteca principal de UI |
| [TypeScript](https://www.typescriptlang.org) | 5.8 | Tipagem estática |
| [Vite](https://vitejs.dev) | 6 | Build tool e dev server |
| [React Router](https://reactrouter.com) | 7 | Roteamento SPA |
| [Framer Motion](https://www.framer.com/motion) | 12 | Animações e transições |
| [Recharts](https://recharts.org) | 3 | Gráficos do dashboard |
| [Lucide React](https://lucide.dev) | — | Ícones |

### Estilização

| Tecnologia | Uso |
|---|---|
| [Tailwind CSS v4](https://tailwindcss.com) | Utilitários de estilo |
| [shadcn/ui](https://ui.shadcn.com) | Componentes de UI (Card, Button, Badge…) |
| [tw-animate-css](https://github.com/joe-bell/cva) | Animações CSS via Tailwind |

### Backend & Infraestrutura

| Tecnologia | Uso |
|---|---|
| [Firebase Auth](https://firebase.google.com/docs/auth) | Autenticação do admin |
| [Cloud Firestore](https://firebase.google.com/docs/firestore) | Banco de dados de analytics |
| [Firestore Rules](https://firebase.google.com/docs/firestore/security/get-started) | Segurança e validação de dados |

---

## Painel Administrativo

Acesso restrito via login + senha. Bloqueia acesso direto por URL — a sessão só é válida após login explícito pelo modal.

**KPIs disponíveis:**
- Total de Acessos e Cliques
- Tempo Médio de Sessão
- Taxa de Engajamento
- Cliques em Projetos e Contato
- Tentativas de Login (sucesso e falha)
- Último Acesso

**Gráficos:**
- Acessos por dia — últimos 30 dias
- Tendência — últimos 7 dias (acessos + cliques)
- Cliques por botão (ranking horizontal)
- Cliques por projeto (donut com % e valores)
- Cliques por categoria (Hero / Projetos / Contato / Outros)

---

## Segurança

- Credenciais Firebase em variáveis de ambiente (`.env`)
- `firebase-applet-config.json` no `.gitignore`
- Firestore Rules com validação de campos e tipos
- Rate limiting em eventos de analytics (1 clique/segundo por elemento)
- `sessionStorage` para session ID (zera ao fechar a aba)
- Acesso ao admin bloqueado via URL direta — exige login explícito

---

## Estrutura do Projeto

```
src/
├── lib/
│   ├── firebase.ts        # Configuração do Firebase
│   ├── analytics.ts       # Tracking de eventos com rate limiting
│   ├── adminSession.ts    # Controle de sessão do admin
│   └── theme.tsx          # Contexto de tema claro/escuro
├── components/
│   └── ui/                # Componentes shadcn/ui
├── App.tsx                # Rotas e ThemeProvider
├── PortfolioHome.tsx      # Página principal
├── AdminDashboard.tsx     # Painel administrativo
├── ProjectDetail.tsx      # Detalhe de projeto
└── vite-env.d.ts          # Tipos das variáveis de ambiente

scripts/
├── seed-analytics.ts      # Seed de dados fictícios (one-time)
└── clean-toggle-language.ts # Limpeza de dados legados

public/
├── favicon.svg            # Favicon com iniciais "VH"
└── victor.jpg             # Foto de perfil
```

---

## Como Rodar Localmente

**1. Clone o repositório**
```bash
git clone https://github.com/VictorSgobbi/victor-sgobbi-portfolio.git
cd victor-sgobbi-portfolio
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Preencha com suas credenciais do Firebase
```

**4. Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse em `http://localhost:3000`

---

## Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Verificação de tipos TypeScript
```

---

## Variáveis de Ambiente

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_ID=
```

---

<div align="center">

Desenvolvido por **Victor Hugo Pacchioni Sgobbi**

[LinkedIn](https://www.linkedin.com/in/victorsgobbi) · [GitHub](https://github.com/VictorSgobbi) · [WhatsApp](https://wa.me/5544991117878)

</div>
