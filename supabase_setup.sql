-- ============================================================
-- MANUAL DE PROCESSOS — CHARQUEADA SÃO JOÃO
-- Script de configuração do banco no Supabase
-- Cole este script completo no SQL Editor do seu projeto
-- (Supabase Dashboard → SQL Editor → New query → Run)
-- ============================================================

-- ---------- TABELA: departamentos ----------
create table if not exists departamentos (
  id text primary key,              -- ex: 'financeiro'
  nome text not null,               -- ex: 'Financeiro'
  prefixo text not null,            -- ex: 'FIN'
  cor text default '#b5472a',
  ordem int default 0,
  criado_em timestamptz default now()
);

-- ---------- TABELA: processos ----------
create table if not exists processos (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,             -- ex: 'FIN-01'
  departamento_id text references departamentos(id) on delete set null,
  titulo text not null,
  resumo text,
  local_armazenamento text,
  fluxograma_imagem_url text,
  planilhas_google_urls text,
  responsaveis text[] default '{}',        -- ex: {"Eva","João","Pedro"}
  campos text[] default '{}',              -- campos da planilha
  passos jsonb default '[]',                -- [{ "responsavel": "...", "acao": "..." }]
  observacoes text,
  ordem int default 0,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

alter table if exists processos
  add column if not exists fluxograma_imagem_url text;

alter table if exists processos
  add column if not exists planilhas_google_urls text;

-- ---------- TABELA: rotina_diaria ----------
create table if not exists rotina_diaria (
  dia date primary key,
  empregados text[] default '{}',
  selecionado text,
  por_funcionario jsonb default '{}'::jsonb,
  atualizado_em timestamptz default now()
);

create or replace function atualizar_timestamp_rotina_diaria()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_rotina_diaria_atualizado on rotina_diaria;
create trigger trg_rotina_diaria_atualizado
  before update on rotina_diaria
  for each row execute function atualizar_timestamp_rotina_diaria();

-- mantém atualizado_em sempre fresco
create or replace function atualizar_timestamp()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_processos_atualizado on processos;
create trigger trg_processos_atualizado
  before update on processos
  for each row execute function atualizar_timestamp();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Só usuários autenticados (login feito) podem ler ou alterar.
-- Sem login = nenhum acesso, mesmo conhecendo a URL/chave pública.
-- ============================================================

alter table departamentos enable row level security;
alter table processos enable row level security;
alter table rotina_diaria enable row level security;

-- limpa políticas antigas (caso rode o script de novo)
drop policy if exists "autenticados podem ler departamentos" on departamentos;
drop policy if exists "autenticados podem alterar departamentos" on departamentos;
drop policy if exists "autenticados podem ler processos" on processos;
drop policy if exists "autenticados podem alterar processos" on processos;
drop policy if exists "autenticados podem ler rotina diaria" on rotina_diaria;
drop policy if exists "autenticados podem alterar rotina diaria" on rotina_diaria;
drop policy if exists "autenticados podem inserir rotina diaria" on rotina_diaria;
drop policy if exists "autenticados podem atualizar rotina diaria" on rotina_diaria;

-- DEPARTAMENTOS: qualquer usuário logado pode ler e gerenciar
create policy "autenticados podem ler departamentos"
  on departamentos for select
  to authenticated
  using (true);

create policy "autenticados podem alterar departamentos"
  on departamentos for all
  to authenticated
  using (true)
  with check (true);

-- PROCESSOS: qualquer usuário logado pode ler e gerenciar
create policy "autenticados podem ler processos"
  on processos for select
  to authenticated
  using (true);

create policy "autenticados podem alterar processos"
  on processos for all
  to authenticated
  using (true)
  with check (true);

create policy "autenticados podem ler rotina diaria"
  on rotina_diaria for select
  to authenticated
  using (true);

create policy "autenticados podem inserir rotina diaria"
  on rotina_diaria for insert
  to authenticated
  using (true)
  with check (true);

create policy "autenticados podem atualizar rotina diaria"
  on rotina_diaria for update
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- DADOS INICIAIS (os 5 exemplos do financeiro já levantados)
-- ============================================================

insert into departamentos (id, nome, prefixo, cor, ordem) values
  ('financeiro', 'Financeiro', 'FIN', '#b5472a', 1),
  ('comercial',  'Comercial',  'COM', '#5c6b4f', 2),
  ('operacoes',  'Operações',  'OPE', '#8a6d3b', 3)
on conflict (id) do nothing;

insert into processos (codigo, departamento_id, titulo, resumo, local_armazenamento, responsaveis, campos, passos, observacoes, ordem) values

('FIN-01', 'financeiro', 'Controle de Recebimentos de Clientes via Banco',
 'Registro e conferência dos pagamentos recebidos por transferência ou depósito bancário.',
 'C:\Users\MARCELO\Documents\a Financeiro\a aa PLANILHAS DE CONTROLE',
 array['Eva','João','Pedro'],
 array['Parte/Quitação','Data evento','Data recebimento','Tipo','Cliente','Pagador','Valor','Aberto/Fechado'],
 '[
   {"responsavel":"Cliente","acao":"Envia o comprovante de pagamento para Eva / CSJ."},
   {"responsavel":"Eva","acao":"Envia o comprovante para o grupo do WhatsApp \u201cCSJ Comprovantes\u201d."},
   {"responsavel":"Eva","acao":"Registra a informação na agenda do dia do evento e na linha do tempo do Ploomes."},
   {"responsavel":"João / Pedro","acao":"Baixa o comprovante no computador e salva no Drive."},
   {"responsavel":"João / Pedro","acao":"Anexa o comprovante na agenda (na data do evento) e no negócio correspondente no Ploomes."},
   {"responsavel":"João / Pedro","acao":"Preenche a planilha \u201cControle de Recebimentos via Bancos\u201d no Drive."},
   {"responsavel":"João / Pedro","acao":"Lança o recebimento no Bling."},
   {"responsavel":"João / Pedro","acao":"Marca a mensagem original no grupo do WhatsApp com 👍 para indicar que o processo foi concluído."}
 ]'::jsonb,
 'O 👍 no WhatsApp funciona como sinalizador de que o comprovante já foi totalmente processado — evita retrabalho e duplicidade de lançamento.',
 1),

('FIN-02', 'financeiro', 'Controle de Recebimento de Notas Fiscais (NFs)',
 'Fluxo de solicitação, emissão, envio e registro de notas fiscais para clientes.',
 'Drive — Planilhas de Controle Financeiro',
 array['Eva','João','Pedro','Contador'],
 array['Data solicitação Contador','Data da emissão da NF','Data do envio ao Cliente','Data do Evento','Cliente','Pagador','Produto','NF de','Nº NF','Valor'],
 '[
   {"responsavel":"Cliente","acao":"Solicita a emissão da nota fiscal para Eva."},
   {"responsavel":"Eva","acao":"Solicita o preenchimento do formulário de dados ao cliente."},
   {"responsavel":"João / Pedro","acao":"Encaminha o formulário para o cliente."},
   {"responsavel":"Cliente","acao":"Preenche o formulário; o Ploomes atualiza automaticamente o cadastro com as informações necessárias para a NF."},
   {"responsavel":"João / Pedro","acao":"Encaminha a solicitação ao contador (via Ploomes), que retorna com a nota fiscal emitida."},
   {"responsavel":"João / Pedro","acao":"Baixa a NF no computador e salva no Drive."},
   {"responsavel":"João / Pedro","acao":"Anexa a NF ao negócio no Ploomes e também na agenda."},
   {"responsavel":"João / Pedro","acao":"Envia a NF ao cliente pelo WhatsApp via Ploomes."},
   {"responsavel":"João / Pedro","acao":"Preenche a planilha de controle de NFs."},
   {"responsavel":"João / Pedro","acao":"Avisa Eva pelo WhatsApp: \u201cNota fiscal {nome do colégio} enviada para o cliente\u201d."}
 ]'::jsonb,
 'A confirmação final para Eva fecha o ciclo e serve como checkpoint de qualidade — qualquer pendência some daqui.',
 2),

('FIN-03', 'financeiro', 'Controle de Comissão de Guias',
 'Apuração e pagamento de comissões devidas a guias por evento realizado.',
 'Drive — Planilhas de Controle Financeiro',
 array['Eva','Marcelo'],
 array['Guia','Data Evento','Cliente','Valor Total','Comissão','Data Pgt.'],
 '[
   {"responsavel":"Eva","acao":"Preenche a planilha de comissão de guias com os dados do evento."},
   {"responsavel":"Eva","acao":"Adiciona na descrição do evento, na agenda, a informação de que há comissão de guia a pagar."},
   {"responsavel":"Marcelo","acao":"Realiza o pagamento da comissão."},
   {"responsavel":"Marcelo","acao":"Atualiza a planilha com a Data de Pagamento."}
 ]'::jsonb,
 'A marcação na agenda evita que comissões fiquem esquecidas entre o evento e o fechamento financeiro do mês.',
 3),

('FIN-04', 'financeiro', 'Controle de Pagamentos Recorrentes (por Mês)',
 'Acompanhamento de contas e boletos recorrentes (ex: energia, água) por mês de competência.',
 'Drive — Financeiro › Boletos',
 array['João','Pedro'],
 array['Boleto','Data Chegada','Data Vencimento','Data Pagamento','Onde chega o boleto','Valor','Valor Pago'],
 '[
   {"responsavel":"Sistema","acao":"A conta chega no e-mail da Charqueada."},
   {"responsavel":"João / Pedro","acao":"Baixa o arquivo e salva em Financeiro › Boletos › [Nome do fornecedor, ex: \u201cCEEE\u201d]."},
   {"responsavel":"João / Pedro","acao":"Salva o boleto em anexo na agenda do Google."},
   {"responsavel":"João / Pedro","acao":"Preenche a planilha \u201cControle de Pagamentos Recorrentes\u201d com os dados (chegada, vencimento, valor)."},
   {"responsavel":"João / Pedro","acao":"No dia do pagamento, paga a conta e atualiza a planilha com Data de Pagamento e Valor Pago."},
   {"responsavel":"João / Pedro","acao":"Mantém a planilha sempre atualizada com datas de chegada, vencimento e pagamento."}
 ]'::jsonb,
 'Esta planilha dá visão por mês — útil para fluxo de caixa. Ver também FIN-05 para visão por fornecedor.',
 4),

('FIN-05', 'financeiro', 'Controle de Pagamentos Recorrentes (por Conta)',
 'Histórico de pagamentos recorrentes organizado por fornecedor/conta, com controle de juros.',
 'Drive — Financeiro › Boletos',
 array['João','Pedro'],
 array['Boleto','Referente (Mês/Ano)','Data Vencimento','Data Pagamento','Valor','Valor Pago','Juros'],
 '[
   {"responsavel":"Sistema","acao":"O comprovante de pagamento chega no e-mail do financeiro."},
   {"responsavel":"João / Pedro","acao":"Lança o comprovante na planilha de controle por conta (ex: CEEE), identificando o mês/ano de referência."},
   {"responsavel":"João / Pedro","acao":"Lança o pagamento no Bling."}
 ]'::jsonb,
 'Esta visão facilita identificar contas com histórico de atraso/juros recorrentes por fornecedor.',
 5)

on conflict (codigo) do nothing;

-- ============================================================
-- FIM DO SCRIPT
-- Depois de rodar: vá em Authentication → Users → Add user
-- e crie seu login (email + senha) manualmente.
-- ============================================================
