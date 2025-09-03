# Back-End - Sistema de Gestão do Hospital de Maracaí

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Este diretório contém o back-end completo do sistema informativo do Hospital de Maracaí. Desenvolvido em **Node.js** com **Express**, a aplicação segue uma arquitetura em camadas robusta, projetada para ser segura, escalável e de fácil manutenção.

## ✨ Features Principais

### 🛡️ Autenticação e Gestão de Acesso

- **Sistema de Roles:** Controle de permissão granular com três níveis de acesso: `journalist`, `admin` e `root`.
- **Autenticação com JWT:** Sistema seguro de autenticação baseado em JSON Web Tokens, com tokens armazenados em cookies `httpOnly` para maior segurança.
- **Setup Inicial Seguro:** Rota para criação do primeiro usuário `root`, com bloqueio para impedir múltiplos superusuários.
- **Recuperação de Senha:** Fluxo completo de "esqueci minha senha" com envio de token seguro por e-mail (via Brevo).
- **Hierarquia de Permissões:** Middleware (`checkUserHierarchy`) que impede que administradores editem ou desativem contas de nível igual ou superior.

### 👤 Gestão de Usuários (Admin)

- **CRUD Completo:** Operações de criar, listar, ver, atualizar e deletar usuários.
- **Transferência de Root:** Rota segura para o `root` transferir sua função para outro administrador, exigindo confirmação por senha.
- **Ativação/Desativação de Contas:** Rotas para `root` ou `admin` gerenciarem o status das contas de usuários.
- **Gestão de Perfil Pessoal:** Rotas `/me` para que qualquer usuário autenticado possa gerenciar suas próprias informações.

### 📰 Gestão de Notícias (Articles)

- **CRUD Completo:** Gerenciamento total de notícias com permissões baseadas na role do usuário.
- **Controle de Status:** Ciclo de vida de notícias com os status `published`, `draft` ou `archived`.
- **Geração Automática de Slug:** URLs amigáveis (`slugs`) geradas automaticamente a partir do título para SEO.
- **Sanitização de HTML:** Proteção automática contra ataques de Cross-Site Scripting (XSS) no conteúdo das notícias.

### 🩺 Gestão de Médicos (Doctors)

- **CRUD Completo:** Gerenciamento de informações de médicos, incluindo especialidade, CRM e contatos.
- **Gestão de Agendas:** Sistema flexível para criar e atualizar os horários de atendimento de cada médico.
- **Controle de Visibilidade:** Rota dedicada para controlar quais médicos aparecem no site público.

### ⚙️ Qualidade de Código e Segurança

- **Arquitetura em Camadas:** Código organizado em `routes`, `controllers` e `services` para máxima separação de responsabilidades.
- **Validação com Zod:** Middleware de validação que garante a integridade dos dados em todas as rotas de entrada.
- **Tratamento de Erros Avançado:** Um `errorController` global captura e formata todos os erros, fornecendo mensagens amigáveis em produção e detalhes técnicos em desenvolvimento.
- **Prisma Middleware:** Hashing de senhas automatizado antes de qualquer operação de escrita no banco de dados.
- **Segurança HTTP:**
  - `helmet`: Adiciona cabeçalhos de segurança para proteger contra vulnerabilidades conhecidas.
  - `hpp`: Previne ataques de HTTP Parameter Pollution.
  - `express-rate-limit`: Mitiga ataques de força bruta limitando o número de requisições.

## 🛠️ Tecnologias Utilizadas

- **Framework:** Node.js com Express.js
- **ORM:** Prisma com PostgreSQL
- **Autenticação:** JSON Web Token (JWT) e `bcrypt.js`
- **Validação:** Zod
- **Segurança:** Helmet, HPP, Express Rate Limit
- **Envio de E-mail:** Brevo (anteriormente Sendinblue)
- **Containerização:** Docker e Docker Compose

## 📦 Pré-requisitos

- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- [Docker](https://www.docker.com/products/docker-desktop/) e Docker Compose
- Um cliente de API, como [Postman](https://www.postman.com/) ou [Insomnia](https://insomnia.rest/).

## 🚀 Como Executar

As instruções completas para executar o projeto (front-end e back-end) estão no `README.md` principal, na raiz do repositório.

### Executando Apenas o Back-End

1.  **Clone o repositório:**

    ```bash
    git clone <url_do_seu_repositorio>
    cd tcc-v2
    ```

2.  **Crie o arquivo de ambiente:**
    Navegue até a pasta `back` e crie uma cópia do arquivo `env.example`, renomeando-a para `.env`.

    ```bash
    cd back
    cp env.example .env
    ```

3.  **Preencha as variáveis de ambiente** no arquivo `.env` com suas configurações (banco de dados, JWT, etc.).

4.  **Inicie os containers Docker:**
    A partir da raiz do projeto (`tcc-v2`), execute:
    ```bash
    docker-compose up -d --build
    ```
    O servidor estará disponível em `http://localhost:3000`.

## 📂 Estrutura de Diretórios

```
back/
├── src/
│   ├── config/         # Configurações (DB, etc.)
│   ├── controllers/    # Lógica de requisição/resposta (req, res)
│   ├── middlewares/    # Funções que rodam entre a requisição e o controller
│   ├── models/         # Schemas de validação (Zod)
│   ├── routes/         # Definição dos endpoints da API
│   ├── services/       # Lógica de negócio e comunicação com o banco
│   └── utils/          # Funções utilitárias (tratamento de erro, etc.)
├── prisma/             # Schema do banco e migrações
└── server.js           # Ponto de entrada da aplicação
```

## 🗺️ Endpoints da API

A API é versionada (`/api/v1`) e dividida em duas áreas principais: `public` e `admin`.

---

### ` /api/v1/public`

- `GET /articles`: Lista artigos publicados.
- `GET /articles/:slug`: Retorna um artigo específico pelo seu slug.
- `GET /doctors`: Lista médicos com visibilidade ativa.

---

### ` /api/v1/admin/auth`

- `GET /check-root`: Verifica se o usuário root já existe.
- `POST /create-root`: Cria o primeiro usuário root do sistema.
- `POST /login`: Autentica um usuário e retorna um JWT em um cookie.
- `GET /logout`: Limpa o cookie de autenticação do usuário.
- `POST /forgot-password`: Inicia o fluxo de recuperação de senha.
- `PATCH /reset-password/:token`: Finaliza a redefinição de senha com um novo password.

---

### ` /api/v1/admin`

- **/users**: Gerenciamento completo de usuários.
- **/doctors**: Gerenciamento completo de médicos e suas agendas.
- **/articles**: Gerenciamento completo de notícias.

_(Para detalhes sobre cada rota, como `POST /users`, `PATCH /doctors/:id`, consulte o código-fonte em `src/routes/`)_

### Exemplo: Criando um Novo Médico

**Requisição:** `POST /api/v1/admin/doctors`

**Headers:**
`Cookie: jwt=<seu_token>`

**Corpo (Body):**

```json
{
  "name": "Dr. João da Silva",
  "specialty": "Cardiologia",
  "state": "SP",
  "crm": "123456",
  "schedules": [
    {
      "dayOfWeek": "segunda",
      "startTime": "08:00",
      "endTime": "12:00"
    },
    {
      "dayOfWeek": "quarta",
      "startTime": "14:00",
      "endTime": "18:00"
    }
  ]
}
```

**Resposta de Sucesso (Código 201):**

```json
{
  "status": "success",
  "message": "Médico criado com sucesso.",
  "data": {
    "doctor": {
      "id": 1,
      "name": "Dr. João da Silva",
      "specialty": "Cardiologia"
      // ... outros campos
    }
  }
}
```
