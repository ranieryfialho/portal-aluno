# 🚀 Portal do Aluno

Uma aplicação web moderna e intuitiva desenvolvida para que os alunos possam consultar seu desempenho acadêmico e receber recomendações personalizadas de estudo com inteligência artificial.

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#️-configuração)
- [Execução](#-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)

## ✨ Funcionalidades

### 🔐 Autenticação
- **Login Seguro**: Acesso ao portal utilizando código de aluno único
- **Autenticação Firebase**: Sistema de autenticação robusto e seguro

### 📊 Dashboard
- **Interface Intuitiva**: Saudação personalizada e visão geral do status acadêmico
- **Design Responsivo**: Experiência otimizada para desktop e dispositivos móveis

### 📈 Boletim Acadêmico
- **Tabela Organizada**: Visualização clara das notas finais por disciplina
- **Feedback Visual**: Sistema de cores para identificação rápida do desempenho
- **Detalhamento de Notas**: Modal com breakdown das atividades e provas que compõem a média

### 📊 Visualização de Dados
- **Gráfico de Performance**: Representação visual do desempenho geral
- **Comparação entre Disciplinas**: Análise comparativa facilitada

### 🤖 Recomendações com IA
- **Análise Automática**: Identificação de disciplinas com potencial de melhoria (≤ 8.0)
- **Sugestões Personalizadas**: Recomendações de vídeos do YouTube em português
- **Busca Inteligente**: Conteúdo relevante baseado em tópicos específicos de cada matéria

## 🛠️ Tecnologias Utilizadas

### Frontend
- **[React](https://react.dev/)** - Biblioteca para construção de interfaces
- **[Vite](https://vitejs.dev/)** - Build tool moderna e rápida
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário

### Backend & Database
- **[Firebase](https://firebase.google.com/)** - Backend-as-a-Service
  - Firestore (NoSQL Database)
  - Authentication
  - Hosting

### APIs & Integrações
- **[Google Custom Search JSON API](https://developers.google.com/custom-search/v1/overview)** - Busca de vídeos no YouTube

### Bibliotecas Auxiliares
- **[Recharts](https://recharts.org/)** - Visualização de dados e gráficos
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- Conta no **Firebase**
- Conta no **Google Cloud Platform**

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone [URL-DO-SEU-REPOSITORIO]
cd portal-do-aluno
```

### 2. Instale as Dependências

```bash
npm install
```

ou

```bash
yarn install
```

## ⚙️ Configuração

### 1. Configuração do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative o **Firestore Database**
4. Configure as **regras de segurança** do Firestore
5. Ative a **Authentication** (método anônimo)

### 2. Configuração da Google Custom Search API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie uma nova **API Key** nas credenciais
3. Ative a **Custom Search JSON API**
4. Configure um **Programmable Search Engine** no [painel específico](https://programmablesearchengine.google.com/)

### 3. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY="sua_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="seu_projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu_project_id"
VITE_FIREBASE_STORAGE_BUCKET="seu_projeto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu_sender_id"
VITE_FIREBASE_APP_ID="seu_app_id"

# Google Custom Search API
VITE_GOOGLE_API_KEY="sua_google_api_key"
VITE_GOOGLE_SEARCH_ENGINE_ID="seu_search_engine_id"
```

> **⚠️ Importante**: Nunca commite o arquivo `.env` para o repositório. Adicione-o ao `.gitignore`.

## 🏃 Execução

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
portal-do-aluno/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Login/
│   │   ├── Boletim/
│   │   └── Recomendacoes/
│   ├── services/
│   │   ├── firebase.js
│   │   └── googleSearch.js
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
