# 🚀 Portal do Aluno

Bem-vindo ao Portal do Aluno! Uma aplicação web simples, moderna e intuitiva, desenvolvida para que os alunos possam consultar seu desempenho acadêmico, incluindo notas e frequência, de forma rápida e segura.

## ✨ Funcionalidades

* **Login Seguro:** Acesso ao portal utilizando um código de aluno único.
* **Dashboard Intuitivo:** Após o login, o aluno é recebido com uma saudação personalizada e tem uma visão geral do seu status.
* **Boletim Detalhado:** Uma tabela clara e organizada exibe as notas finais e a frequência em cada disciplina.
    * **Feedback Visual:** As notas são coloridas (verde para aprovado, vermelho para reprovado) para fácil identificação do desempenho.
    * **Notas Detalhadas:** Clique em uma nota para abrir um modal e ver as notas de atividades e provas que compõem a média final.
* **Gráfico de Desempenho:** Um gráfico visualmente agradável mostra o desempenho geral do aluno, facilitando a comparação entre as disciplinas.
* **Responsividade:** Interface adaptada para uma ótima experiência tanto em computadores quanto em dispositivos móveis.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias e ferramentas:

* **Frontend:**
    * [**React**](https://react.dev/) - Biblioteca para construir a interface de utilizador.
    * [**Vite**](https://vitejs.dev/) - Ferramenta de build para um desenvolvimento frontend moderno e rápido.
    * [**Tailwind CSS**](https://tailwindcss.com/) - Framework CSS para estilização rápida e utilitária.
* **Backend & Base de Dados:**
    * [**Firebase**](https://firebase.google.com/) - Utilizado para autenticação anónima e como base de dados NoSQL (Firestore) para armazenar os dados dos alunos e das turmas.
* **Visualização de Dados:**
    * [**Recharts**](https://recharts.org/) - Biblioteca de gráficos para exibir o desempenho do aluno.
* **Ícones:**
    * [**Lucide React**](https://lucide.dev/) - Biblioteca de ícones bonita e consistente.

## ⚙️ Instalação e Execução Local

Para executar este projeto no seu ambiente de desenvolvimento, siga os passos abaixo.

### Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)

### 1. Clonar o Repositório

```bash
git clone [https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git](https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git)
cd NOME-DO-REPOSITORIO
```

### 2. Instalar as Dependências
```bash
npm install
```

 ### 3. Configurar as Variáveis de Ambiente

Para conectar a aplicação ao Firebase, você precisa fornecer as suas chaves de API.

1. Crie um arquivo chamado .env na raiz do projeto.

2. Copie o conteúdo do arquivo .env.example (se existir) ou use o modelo abaixo e cole no seu novo arquivo .env.

```bash
# Arquivo: .env

# Credenciais do seu projeto Firebase
VITE_FIREBASE_API_KEY="SUA_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="SEU_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="SEU_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="SEU_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="SEU_SENDER_ID"
VITE_FIREBASE_APP_ID="SEU_APP_ID"
```

3. Substitua os valores (ex: "SUA_API_KEY") pelas credenciais reais do seu projeto no console do Firebase. Pode encontrá-las em:
Project Settings > General > Your apps > SDK setup and configuration.

### 4. Executar o Projeto

Com tudo configurado, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em http://localhost:5173 (ou outra porta indicada no seu terminal).