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
- **Front-End**:
  - (Descreva aqui as tecnologias do front-end que está usando, como React, Next.js, etc. Caso queira trabalhar somente com o back-end por enquanto, pode pular essa parte.)

## Como Rodar o Projeto

### Pré-requisitos

Certifique-se de ter os seguintes requisitos instalados:

- **Node.js**: [Baixar Node.js](https://nodejs.org)
- **PostgreSQL**: Certifique-se de que o PostgreSQL esteja instalado e configurado corretamente em sua máquina.

### Passos para Rodar o Back-End

1. **Clone o repositório**:

```bash
git clone https://github.com/seu-usuario/nome-do-repositorio.git
cd nome-do-repositorio
```

2. **Instale as dependências**:

```bash
npm install
```

3. **Configuração do Banco de Dados**:

Crie um arquivo `.env` na raiz do projeto com a variável de ambiente `DATABASE_URL`, que contém a URL de conexão com seu banco de dados PostgreSQL. Exemplo:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
```

4. **Executando as Migrações do Prisma**:

Após configurar o banco de dados, rode as migrações para configurar as tabelas no banco.

```bash
npx prisma migrate dev
```

5. **Rodando o Servidor**:

Para rodar o servidor back-end:

```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`.

### Passos para Rodar o Front-End

()

## Estrutura de Banco de Dados

O banco de dados está estruturado com as seguintes tabelas:

- **User**: Tabela de usuários com informações como `username`, `password`, `role` (journalist, admin, root), entre outros.
- **Article**: Tabela de notícias com informações como `title`, `subtitle`, `content`, `slug`, `author`, etc.
- **Doctor**: Tabela de médicos com `name`, `specialty`, `crm`, `phone`, `email`, `visibility` e os horários de trabalho.
- **Schedule**: Tabela para armazenar os horários de trabalho dos médicos, incluindo o **dia da semana** e **hora de início e fim**.

## Notas Finais

- Este projeto ainda está em processo de refatoração e pode sofrer alterações.
- **Contribuições são bem-vindas**! Sinta-se à vontade para fazer melhorias, correções ou sugerir novas funcionalidades.

## Licença

Este projeto é licenciado sob a [MIT License](LICENSE).
