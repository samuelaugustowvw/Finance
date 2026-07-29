# 💰 Finance

Gerenciador de finanças pessoais **full stack** com painel web, API própria e um **bot de WhatsApp** para registrar transações direto pela conversa.

🔗 **Demo:** [finance-three-snowy.vercel.app](https://finance-three-snowy.vercel.app)

![TypeScript](https://img.shields.io/badge/TypeScript-98%25-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma&logoColor=white)
![WhatsApp](https://img.shields.io/badge/Bot-Baileys-25D366?logo=whatsapp&logoColor=white)

---

## ✨ Funcionalidades

- **Autenticação** com registro e login via JWT (senhas com hash bcrypt).
- **Dashboard** com resumo de receitas, despesas e saldo do mês, além de gráficos (Recharts).
- **Transações** de receita e despesa, filtráveis por mês/ano, organizadas por categoria.
- **Categorias** personalizáveis com cores, e um conjunto padrão criado automaticamente no primeiro acesso.
- **Bot de WhatsApp** para lançar transações e consultar saldo sem sair da conversa.
- **Vinculação de número** de telefone à conta para que o bot reconheça o usuário.

---

## 🏗️ Arquitetura

O repositório é um monorepo com três aplicações independentes:

```
Finance/
├── finance-frontend/   # SPA em React + Vite (painel web)
├── finance-backend/    # API REST em Express + Prisma
└── finance-bot/        # Bot de WhatsApp com Baileys
```

O fluxo funciona assim: o **frontend** consome a **API**, que persiste os dados no **PostgreSQL** via Prisma. O **bot** conversa com a mesma API usando um token de serviço, identificando o usuário pelo número de telefone vinculado.

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  Frontend    │  HTTP  │   Backend    │ Prisma │  PostgreSQL  │
│ React + Vite │ ─────► │  Express API │ ─────► │   Database   │
└──────────────┘        └──────▲───────┘        └──────────────┘
                               │ HTTP + bot token
                        ┌──────┴───────┐
                        │  WhatsApp Bot│
                        │   (Baileys)  │
                        └──────────────┘
```

---

## 🛠️ Tecnologias

**Frontend**
- React 19, React Router 7, Vite
- TailwindCSS
- Recharts (gráficos)
- Axios

**Backend**
- Node.js + Express 5
- Prisma ORM + PostgreSQL
- JWT (`jsonwebtoken`) e `bcryptjs`
- Zod (validação)

**Bot**
- `@whiskeysockets/baileys` (WhatsApp)
- Express (servidor de QR code)
- Axios, `qrcode-terminal`

---

## 🗄️ Modelo de dados

| Modelo        | Campos principais                                                     |
| ------------- | --------------------------------------------------------------------- |
| `User`        | `name`, `email`, `password`, `phone` (opcional, único)               |
| `Transaction` | `title`, `amount`, `type` (`INCOME` / `EXPENSE`), `category`, `date`  |
| `Category`    | `name`, `color`                                                       |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18+
- Banco de dados PostgreSQL

### 1. Clone o repositório

```bash
git clone https://github.com/samuelaugustowvw/Finance.git
cd Finance
```

### 2. Backend (`finance-backend`)

```bash
cd finance-backend
npm install
```

Crie um arquivo `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/finance"
JWT_SECRET="sua_chave_secreta"
BOT_TOKEN="token_de_servico_do_bot"
```

Rode as migrações e inicie a API:

```bash
npx prisma migrate dev
npm run dev
```

A API sobe em `http://localhost:3333`.

### 3. Frontend (`finance-frontend`)

```bash
cd ../finance-frontend
npm install
npm run dev
```

O painel abre em `http://localhost:5173` (padrão do Vite) e consome a API local automaticamente em ambiente de desenvolvimento.

### 4. Bot de WhatsApp (`finance-bot`)

```bash
cd ../finance-bot
npm install
```

Crie um arquivo `.env`:

```env
FINANCE_API_URL="http://localhost:3333"
BOT_TOKEN="token_de_servico_do_bot"   # o mesmo do backend
```

Inicie o bot:

```bash
npm run dev
```

Acesse `http://localhost:8080/qr` e escaneie o QR code com o WhatsApp para conectar.

---

## 📡 Endpoints da API

| Método   | Rota                    | Descrição                                    | Auth        |
| -------- | ----------------------- | -------------------------------------------- | ----------- |
| `GET`    | `/health`               | Status da API                                | —           |
| `POST`   | `/auth/register`        | Cria um usuário                              | —           |
| `POST`   | `/auth/login`           | Autentica e retorna token                    | —           |
| `POST`   | `/auth/link-phone`      | Vincula um telefone à conta                  | JWT         |
| `GET`    | `/auth/by-phone/:phone` | Busca usuário pelo telefone                  | Bot token   |
| `GET`    | `/transactions`         | Lista transações (filtro `?month=&year=`)    | JWT         |
| `POST`   | `/transactions`         | Cria uma transação                           | JWT         |
| `DELETE` | `/transactions/:id`     | Remove uma transação                         | JWT         |
| `GET`    | `/categories`           | Lista categorias (cria as padrão se vazio)   | JWT         |
| `POST`   | `/categories`           | Cria uma categoria                           | JWT         |
| `DELETE` | `/categories/:id`       | Remove uma categoria                         | JWT         |

---

## 💬 Comandos do Bot

Depois de vincular seu número no painel, é só mandar mensagem para o bot:

**Registrar transações**

```
-120.00 Combustível :Transporte
+1500 Freelance :Receita
-89.90 Netflix :Lazer #23/05/2026
```

- `+` para receita, `-` para despesa
- `:Categoria` define a categoria
- `#DD/MM/AAAA` (opcional) define a data

**Consultas**

| Comando        | Ação                               |
| -------------- | ---------------------------------- |
| `!saldo`       | Saldo do mês (receitas × despesas) |
| `!transações`  | Últimas 5 transações               |
| `!help`        | Lista de comandos                  |

---

## ☁️ Deploy

- **Frontend:** [Vercel](https://vercel.com) — SPA com rewrites configurados em `vercel.json`.
- **Backend:** [Railway](https://railway.app) — com PostgreSQL gerenciado.
- **Bot:** pode ser hospedado em qualquer serviço com processo persistente (ex.: Railway/VPS), mantendo a sessão em `auth_info`.

---

## 📄 Licença

Distribuído sob a licença ISC.

---

Feito por [@samuelaugustowvw](https://github.com/samuelaugustowvw)
