# Refatoração do Projeto - Sistema de Notícias e Gestão de Médicos para o Hospital de Maracaí

Este repositório contém a refatoração de um projeto focado na criação de um **sistema informativo** para o **Hospital de Maracaí**, localizado em São Paulo. O sistema é dividido em duas áreas principais: o **site público** e o **dashboard de administração**.

O back-end é construído em **Node.js** com **Express**, utilizando **Prisma** como ORM para manipulação do banco de dados PostgreSQL e **JSON Web Tokens (JWT)** para um sistema de autenticação robusto e seguro.

## Estrutura do Projeto

O projeto é dividido em duas seções principais:

1.  **Back-End**:

    - Construído com **Node.js** e **Express**.
    - **Prisma** é utilizado como ORM para interação com o banco de dados PostgreSQL.
    - **JWT (JSON Web Token)** é usado para autenticação e controle de sessões de usuários.
    - A autenticação é implementada manualmente com JWT, incluindo funcionalidades como expiração de token e cookies seguros (`httpOnly`).

2.  **Front-End**:
    - **Dashboard de Administração**: Área restrita onde usuários com as funções `admin` e `root` podem gerenciar notícias, médicos e outros usuários do sistema.
    - **Site Público**: Exibe notícias publicadas, informações sobre os médicos e seus horários de atendimento, além de detalhes institucionais do hospital (história, localização, contatos, etc.).

## Funcionalidades

### Back-End

- **Gerenciamento de Usuários com Níveis de Acesso**:

  - O sistema possui três **funções (roles)**: `journalist`, `admin` e `root`.
  - `root`: Controle total do sistema, incluindo a capacidade de transferir sua função para outro administrador.
  - `admin`: Pode gerenciar notícias, médicos e usuários com a função `journalist`.
  - `journalist`: Pode criar e gerenciar notícias.

- **Autenticação Segura**:

  - Sistema de login com JWT, incluindo a criação do primeiro usuário `root` se não existir nenhum.
  - Funcionalidades de "Esqueci minha senha" com envio de e-mail (via Brevo) e redefinição de senha com token seguro.
  - Validação de hierarquia para impedir que administradores editem outros administradores ou o `root`.

- **Gerenciamento de Notícias (Articles)**:

  - Criação, leitura, atualização e exclusão (CRUD) de notícias.
  - As notícias possuem status (`published`, `draft`, `archived`) que controlam sua visibilidade.
  - Geração automática de `slugs` únicos para URLs amigáveis.
  - Sanitização do conteúdo HTML das notícias para evitar ataques XSS.

- **Gerenciamento de Médicos (Doctors)**:

  - CRUD completo para informações de médicos, incluindo nome, especialidade, CRM, estado e contatos.
  - Gerenciamento de horários de atendimento (`schedules`) por dia da semana.
  - Controle de visibilidade para exibir ou ocultar médicos no site público.

- **Validação e Segurança**:
  - Validação de dados de entrada usando **Zod** para garantir a integridade dos dados.
  - Middlewares para tratamento de erros, CORS, limitação de requisições (`rate-limit`) e proteção contra ataques como HPP (HTTP Parameter Pollution).

## Tecnologias Utilizadas

- **Back-End**:

  - **Node.js** com **Express** para o servidor.
  - **Prisma** como ORM para interagir com o banco de dados PostgreSQL.
  - **JWT (JSON Web Token)** para autenticação de usuários.
  - **Zod** para validação de esquemas de dados.
  - **Bcrypt.js** para hashing de senhas.
  - **Brevo (anteriormente Sendinblue)** para envio de e-mails transacionais.

- **Banco de Dados**:

  - **PostgreSQL** para armazenamento de dados.

- **Containerização**:
  - **Docker** e **Docker Compose** para criar ambientes de desenvolvimento e produção consistentes e isolados.

## Como Rodar o Projeto

### Pré-requisitos

Certifique-se de ter os seguintes requisitos instalados:

- **Docker**: [Baixar Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Docker Compose**: Geralmente vem junto com o Docker Desktop.

### 🐳 **Opção 1: Desenvolvimento com Docker (Recomendado)**

#### **Configuração Inicial:**

1.  **Clone o repositório**:

    ```bash
    git clone [https://github.com/pedromaggot38/tcc-v2.git](https://github.com/pedromaggot38/tcc-v2.git)
    cd tcc-v2
    ```

2.  **Configure as variáveis de ambiente**:

    ```bash
    # Copie o arquivo de exemplo para a raiz do diretório 'tcc-v2-dev'
    cp back/env.example ./.env
    ```

    Edite o arquivo `.env` com as configurações do banco de dados, JWT e chaves da API Brevo.

3.  **Inicie o projeto**:

    ```bash
    # Iniciar todos os serviços em modo de desenvolvimento (com hot-reload)
    docker compose up

    # Para rodar em background
    docker compose up -d

    # Para reconstruir as imagens após mudanças nos Dockerfiles
    docker compose up --build
    ```

4.  **Acesse a aplicação**:
    - **Backend**: `http://localhost:3000`
    - **Banco PostgreSQL**: `localhost:5432`
    - **Prisma Studio**: `http://localhost:5555` (disponível no ambiente de desenvolvimento)

#### **Comandos úteis durante o desenvolvimento**:

```bash
# Parar os containers
docker compose down

# Executar comandos dentro do container do back-end
docker compose exec back npx prisma studio
docker compose exec back npx prisma migrate dev
```

### 📋 **Configuração das Variáveis de Ambiente**

Crie um arquivo `.env` na pasta raiz (`tcc-v2-dev`) com as seguintes variáveis, ajustando os valores conforme necessário:

```env
# Configurações do Banco de Dados
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hospitaldb
DATABASE_URL="postgresql://postgres:postgres@db:5432/hospitaldb?schema=public"

# Configurações JWT
JWT_SECRET="change_me_super_secret"
JWT_EXPIRES_IN="90d"
JWT_COOKIE_EXPIRES_IN=90

# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Brevo Email Sender (para recuperação de senha)
BREVO_API_KEY="sua_chave_de_api_da_brevo"
BREVO_SENDER_EMAIL="seu_email_verificado_na_brevo@exemplo.com"
```

**⚠️ IMPORTANTE:**

- **NUNCA** adicione o arquivo `.env` ao controle de versão (Git). Ele já está incluído no `.gitignore`).
- Altere as senhas e chaves secretas para valores seguros, especialmente em produção.

## Estrutura de Banco de Dados

O banco de dados, gerenciado pelo Prisma, está estruturado com as seguintes tabelas principais:

- **User**: Armazena informações dos usuários, como `username`, `password` (hashed), `email`, `role` (`root`, `admin`, `journalist`) e status (`active`).
- **Article**: Contém os dados das notícias, incluindo `title`, `content`, `slug`, `author`, `status` (`published`, `draft`, `archived`) e relacionamentos com o usuário que a criou e atualizou.
- **Doctor**: Guarda informações dos médicos, como `name`, `specialty`, `crm`, `state`, e um campo `visible` para controlar sua exibição no site público.
- **Schedule**: Tabela para armazenar os horários de trabalho dos médicos, relacionada à tabela `Doctor` e contendo `dayOfWeek`, `startTime` e `endTime`.
