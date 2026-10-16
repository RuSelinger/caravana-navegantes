-- =========================================================
-- CONFIGURAÇÃO DO BANCO DE DADOS SUPABASE (100% GRATUITO)
-- =========================================================
-- Como usar:
-- 1. Entre em https://supabase.com e faça login com seu GitHub (RuSelinger).
-- 2. Clique em "New project", dê o nome "caravana-navegantes" e defina uma senha de banco de dados.
-- 3. No menu lateral esquerdo, clique no ícone "SQL Editor" (ícone de terminal/código).
-- 4. Cole todo este código abaixo e clique no botão verde "Run".
-- 5. Vá em "Project Settings" (ícone de engrenagem) > "API" e copie:
--    - Project URL
--    - anon public key
-- 6. Cole esses 2 valores no arquivo js/config.js nos campos supabaseUrl e supabaseAnonKey.
-- =========================================================

-- Cria a tabela de inscrições da caravana
create table public.inscricoes (
  id text primary key,
  data_hora text,
  nome text not null,
  whatsapp text not null,
  categoria text not null,
  instrumento text default '-',
  responsavel text default '-',
  comum text not null,
  vagas integer default 1,
  valor_total text default 'R$ 90,00',
  status_pagamento text default 'Pendente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativa a segurança em nível de linha (Row Level Security)
alter table public.inscricoes enable row level security;

-- Permite leitura para qualquer pessoa (para carregar o contador e a lista)
create policy "Permitir leitura publica"
on public.inscricoes for select
using (true);

-- Permite que qualquer pessoa envie uma inscrição
create policy "Permitir insercao publica"
on public.inscricoes for insert
with check (true);

-- Permite que o organizador altere o status de pagamento
create policy "Permitir atualizacao publica"
on public.inscricoes for update
using (true)
with check (true);

-- Permite que o organizador exclua inscrições
create policy "Permitir exclusao publica"
on public.inscricoes for delete
using (true);

-- Habilita o canal de Realtime para atualizações instantâneas na tela
alter publication supabase_realtime add table public.inscricoes;
