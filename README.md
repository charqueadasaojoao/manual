# Manual de Processos — Charqueada São João (React + Vite + Tailwind)

Dashboard web com gerenciamento (CRUD) de processos via Supabase, hospedado na Vercel.

## Stack

- **Vite + React** — SPA leve, sem servidor próprio
- **React Router** — rotas: `/login`, `/`, `/processo/:codigo`, `/admin`, `/imprimir`
- **Tailwind CSS** — estilos utilitários, tokens de cor/fonte configurados em `tailwind.config.js`
- **Supabase** — banco de dados (Postgres) e autenticação (login por e-mail/senha)
- **Vercel** — hospedagem

## Estrutura

```
src/
├── App.jsx                      rotas da aplicação
├── main.jsx                     ponto de entrada
├── index.css                    estilos globais + regras de impressão
├── lib/supabaseClient.js        cliente Supabase (lê variáveis de ambiente)
├── hooks/
│   ├── useAuth.jsx              contexto de sessão/login
│   └── useProcessos.js          carrega/cria/edita/exclui processos
├── components/
│   ├── RotaProtegida.jsx        bloqueia acesso sem login
│   ├── Sidebar.jsx               menu lateral com busca
│   ├── ProcessoCard.jsx          exibição de um processo completo
│   ├── FormularioProcesso.jsx    formulário de criação/edição
│   └── EditorPassos.jsx          editor dinâmico dos passos do fluxo
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx              tela de leitura
    ├── Admin.jsx                  tela de gerenciamento (CRUD)
    └── Impressao.jsx              capa + sumário + processos para imprimir/PDF
```

## Passo 1 — Banco de dados (Supabase)

Se você já rodou o `supabase_setup.sql` da versão anterior (HTML puro), **não precisa rodar de novo** — é o mesmo banco, a estrutura de tabelas não mudou.

Se ainda não rodou: abra o SQL Editor do seu projeto Supabase e execute o arquivo `supabase_setup.sql` incluído aqui.

Lembre-se também de criar seu usuário em **Authentication → Users → Add user** (e-mail + senha), caso ainda não tenha.

## Passo 2 — Rodar localmente

```bash
npm install
npm run dev
```

O arquivo `.env` já está preenchido com a URL e a chave anônima do seu projeto Supabase. Se precisar trocar, edite:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Acesse `http://localhost:5173`, faça login com o usuário criado no Supabase.

## Passo 3 — Publicar na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório.
3. A Vercel detecta automaticamente que é um projeto Vite (build command `vite build`, output `dist`).
4. **Antes de clicar em Deploy**, configure as variáveis de ambiente em **Environment Variables**:
   - `VITE_SUPABASE_URL` → cole a Project URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` → cole a anon public key do Supabase
5. Clique em **Deploy**.

O arquivo `vercel.json` já está configurado para que todas as rotas (`/admin`, `/processo/...` etc) funcionem corretamente ao recarregar a página ou acessar o link direto.

> Sem configurar essas variáveis de ambiente na Vercel, o site builda mas a conexão com o banco falha — a tela ficará carregando indefinidamente ou mostrará erro de autenticação.

## Uso no dia a dia

- **Adicionar processo**: vá em "Gerenciar processos" (`/admin`) → "+ Novo processo" → preencha código (ex: `COM-01`), departamento, título, passos do fluxo → "Salvar processo".
- **Editar**: clique no processo na lista lateral do admin, altere, salve.
- **Excluir**: abra o processo no admin → "Excluir processo".
- **Buscar**: no dashboard, digite no campo de busca da barra lateral.
- **Imprimir/exportar PDF**: vá em "Versão para impressão" (`/imprimir`) → "Imprimir / Salvar como PDF" → escolha "Salvar como PDF" no destino de impressão do navegador.

## Adicionar novos departamentos

Direto no SQL Editor do Supabase:

```sql
insert into departamentos (id, nome, prefixo, cor, ordem) values
  ('rh', 'Recursos Humanos', 'RH', '#4a6b5c', 4);
```

O `id` deve ser único, em letras minúsculas, sem espaços.
