# Refatoração do Projeto - Sistema de Notícias e Gestão de Médicos

Este repositório contém a refatoração de um projeto anterior, com foco na criação de um **sistema informativo** sobre o **Hospital de Maracaí**, localizado em São Paulo. O sistema é dividido em duas áreas principais: o **site público** e o **dashboard de administração**. O back-end é feito em **Node.js** com **Express**, utilizando **Prisma** para manipulação de banco de dados e **JSON Web Tokens (JWT)** para autenticação.

## Estrutura do Projeto

O projeto é dividido em duas seções principais:

1. **Back-End**:
   - Construído com **Node.js** e **Express**.
   - **Prisma** é utilizado como ORM para interação com o banco de dados.
   - **JWT (JSON Web Token)** é usado para autenticação e controle de sessões de usuários.
   - A autenticação será feita manualmente com JWT.
2. **Front-End**:
   - Dividido entre duas áreas:
     - **Dashboard de Administração**: Onde os usuários com roles (funções) de `admin` e `root` poderão criar e editar notícias, bem como adicionar e gerenciar informações de médicos.
     - **Site Público**:
       - Exibe as **notícias** dinâmicas relacionadas ao hospital.
       - Exibe a **informação sobre os médicos** e seus horários de trabalho, com base nos dados armazenados no banco.
       - **Informações sobre o Hospital de Maracaí**:
       - Apresenta detalhes como:
         - **História** do hospital.
         - **Localização e endereço** completo.
         - **Contatos** (telefones, e-mails).
         - **Fotos do hospital**.
         - Qualquer outra informação relevante sobre a instituição.

## Funcionalidades

### Back-End

- **Criação de Usuários**:
  - O sistema possui diferentes **roles (funções)**: `journalist`, `admin`, `root`.
  - Cada role tem permissões diferentes para criação e edição de conteúdos no sistema.
- **Autenticação**:
  - O sistema implementa autenticação via **JWT** (JSON Web Token), onde os tokens serão gerados manualmente e utilizados para autenticar as requisições.
- **Gerenciamento de Notícias**:
  - Os usuários podem criar, editar e excluir notícias para o site informativo.
  - As notícias serão dinâmicas, permitindo que sejam publicadas ou ocultadas conforme necessário.
- **Gerenciamento de Médicos**:
  - É possível cadastrar médicos, incluindo seus dados, como **nome, especialidade, CRM, e horários de trabalho**.
  - Os horários são configurados de acordo com os **dias da semana** e o horário de atendimento.

### Front-End

- **Dashboard de Administração**:
  - Área restrita para administração, onde os usuários com permissões adequadas podem **gerenciar usuários**, **notícias**, e **médicos**.
- **Site Público**:
  - Exibe as **notícias** dinâmicas relacionadas ao hospital.
  - Exibe a **informação sobre os médicos** e seus horários de trabalho, com base nos dados armazenados no banco de dados.

## Tecnologias Utilizadas

- **Back-End**:
  - **Node.js** com **Express** para o servidor.
  - **Prisma** para interagir com o banco de dados PostgreSQL.
  - **JWT (JSON Web Token)** para autenticação de usuários.
- **Banco de Dados**:
  - **PostgreSQL** para armazenamento de dados.
- **Containerização**:
  - **Docker** e **Docker Compose** para ambiente de desenvolvimento e produção.
- **Front-End**:
  - (Descreva aqui as tecnologias do front-end que está usando, como React, Next.js, etc. Caso queira trabalhar somente com o back-end por enquanto, pode pular essa parte.)

## Como Rodar o Projeto

### Pré-requisitos

Certifique-se de ter os seguintes requisitos instalados:

- **Docker**: [Baixar Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Docker Compose**: Geralmente vem junto com o Docker Desktop
- **Node.js**: [Baixar Node.js](https://nodejs.org) (opcional, apenas para desenvolvimento local)

### 🐳 **Opção 1: Desenvolvimento com Docker (Recomendado)**

#### **Configuração Inicial:**

1. **Clone o repositório**:
```bash
git clone https://github.com/pedromaggot38/tcc-v2.git
cd tcc-v2
```

2. **Configure as variáveis de ambiente**:
```bash
# Copie o arquivo de exemplo
cp back/env.example ./.env

# Edite o arquivo .env com suas configurações
# IMPORTANTE: Nunca commite o arquivo .env no git!
```

3. **Inicie o projeto**:
```bash
# Iniciar todos os serviços
docker-compose up

# Para rodar em background
docker-compose up -d

# Para reconstruir após mudanças
docker-compose up --build
```

4. **Acesse a aplicação**:
- **Backend**: http://localhost:3000
- **Banco PostgreSQL**: localhost:5432

#### **Comandos úteis durante o desenvolvimento**:

```bash
# Parar o projeto
docker-compose down

# Ver logs em tempo real
docker-compose up -f

# Ver logs de um serviço específico
docker-compose logs back
docker-compose logs db

# Reiniciar apenas o backend
docker-compose restart back

# Executar comandos dentro do container
docker-compose exec back npx prisma studio
docker-compose exec back npx prisma migrate dev
docker-compose exec back npm run start

# Acessar o container interativamente
docker-compose exec back sh
```

### 💻 **Opção 2: Desenvolvimento Local (Sem Docker)**

#### **Configuração do Banco de Dados**:

1. **Instale o PostgreSQL** em sua máquina
2. **Crie um banco de dados** chamado `hospitaldb`

#### **Configuração da Aplicação**:

1. **Entre na pasta back**:
```bash
cd back
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
```

4. **Execute as migrações**:
```bash
npx prisma migrate dev
```

5. **Inicie o servidor**:
```bash
npm start
```

### 📋 **Configuração das Variáveis de Ambiente**

Crie um arquivo `.env` na pasta `back/` com as seguintes variáveis:

```env
# Configurações do Banco de Dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hospitaldb?schema=public"

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hospitaldb

# Configurações JWT
JWT_SECRET="sua_chave_secreta_muito_segura_aqui"
JWT_EXPIRES_IN="90d"
JWT_COOKIE_EXPIRES_IN=90

# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações de Email (Mailtrap)
MAILTRAP_TOKEN="seu_token_mailtrap"
MAILTRAP_INBOX_ID="seu_inbox_id"

# Configurações de Segurança
BCRYPT_SALT_ROUNDS=12
```

**⚠️ IMPORTANTE:**
- **NUNCA** commite o arquivo `.env` no git
- Altere as senhas e chaves secretas para valores seguros
- Para produção, use variáveis de ambiente do servidor

## Estrutura de Banco de Dados

O banco de dados está estruturado com as seguintes tabelas:

- **User**: Tabela de usuários com informações como `username`, `password`, `role` (journalist, admin, root), entre outros.
- **Article**: Tabela de notícias com informações como `title`, `subtitle`, `content`, `slug`, `author`, etc.
- **Doctor**: Tabela de médicos com `name`, `specialty`, `crm`, `phone`, `email`, `visibility` e os horários de trabalho.
- **Schedule**: Tabela para armazenar os horários de trabalho dos médicos, incluindo o **dia da semana** e **hora de início e fim**.

## 🔧 **Troubleshooting**

### **Problemas comuns do Docker**:

1. **Porta já em uso**:
   ```bash
   # Verifique se algo está usando a porta 3000
   netstat -ano | findstr :3000
   # Ou pare o serviço que está usando a porta
   ```

2. **Container não inicia**:
   ```bash
   # Verifique os logs
   docker-compose logs back
   docker-compose logs db
   ```

3. **Banco não conecta**:
   ```bash
   # Aguarde alguns segundos para o PostgreSQL inicializar
   # O script aguarda automaticamente a conexão
   ```

4. **Permissões de arquivo**:
   ```bash
   # No Windows, pode ser necessário executar como administrador
   # No Linux/Mac, verifique as permissões dos arquivos
   ```

## 📚 **Recursos Adicionais**

- **Prisma Studio**: `docker-compose exec back npx prisma studio`
- **Documentação Prisma**: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **Documentação Docker**: [https://docs.docker.com](https://docs.docker.com)

## Notas Finais

- Este projeto ainda está em processo de refatoração e pode sofrer alterações.
- **Contribuições são bem-vindas**! Sinta-se à vontade para fazer melhorias, correções ou sugerir novas funcionalidades.
- O ambiente Docker garante consistência entre diferentes máquinas de desenvolvimento.

## Licença

Este projeto é licenciado sob a [MIT License](LICENSE).
