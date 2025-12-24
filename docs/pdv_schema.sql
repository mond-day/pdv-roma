--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+2)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg120+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY "public"."produtos_venda" DROP CONSTRAINT IF EXISTS "produtos_venda_venda_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."placas_transportadoras" DROP CONSTRAINT IF EXISTS "placas_transportadoras_transportadora_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."placas_transportadoras" DROP CONSTRAINT IF EXISTS "placas_transportadoras_placa_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."placas_motoristas" DROP CONSTRAINT IF EXISTS "placas_motoristas_placa_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."placas_motoristas" DROP CONSTRAINT IF EXISTS "placas_motoristas_placa_fk";
ALTER TABLE IF EXISTS ONLY "public"."placas_motoristas" DROP CONSTRAINT IF EXISTS "placas_motoristas_motorista_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."placas_motoristas" DROP CONSTRAINT IF EXISTS "placas_motoristas_motorista_fk";
ALTER TABLE IF EXISTS ONLY "public"."motoristas" DROP CONSTRAINT IF EXISTS "motoristas_transportadora_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."logs_acao" DROP CONSTRAINT IF EXISTS "logs_acao_usuario_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."carregamentos" DROP CONSTRAINT IF EXISTS "fk_carreg_venda";
DROP INDEX IF EXISTS "public"."uq_produtos_venda_venda_produto";
DROP INDEX IF EXISTS "public"."idx_placas_norm";
DROP INDEX IF EXISTS "public"."idx_carreg_venda_id";
DROP INDEX IF EXISTS "public"."idx_carreg_placa";
DROP INDEX IF EXISTS "public"."idx_carreg_idgc";
DROP INDEX IF EXISTS "public"."idx_carreg_id";
DROP INDEX IF EXISTS "public"."idx_carreg_aberto_venda_placa";
ALTER TABLE IF EXISTS ONLY "public"."vendas" DROP CONSTRAINT IF EXISTS "vendas_pkey";
ALTER TABLE IF EXISTS ONLY "public"."vendas" DROP CONSTRAINT IF EXISTS "vendas_idgc_unique";
ALTER TABLE IF EXISTS ONLY "public"."usuarios" DROP CONSTRAINT IF EXISTS "usuarios_pkey";
ALTER TABLE IF EXISTS ONLY "public"."usuarios" DROP CONSTRAINT IF EXISTS "usuarios_email_key";
ALTER TABLE IF EXISTS ONLY "public"."transportadoras" DROP CONSTRAINT IF EXISTS "transportadoras_pkey";
ALTER TABLE IF EXISTS ONLY "public"."produtos_venda" DROP CONSTRAINT IF EXISTS "produtos_venda_pkey";
ALTER TABLE IF EXISTS ONLY "public"."produtos_carregamento" DROP CONSTRAINT IF EXISTS "produtos_carregamento_pkey";
ALTER TABLE IF EXISTS ONLY "public"."placas_transportadoras" DROP CONSTRAINT IF EXISTS "placas_transportadoras_placa_transp_key";
ALTER TABLE IF EXISTS ONLY "public"."placas_transportadoras" DROP CONSTRAINT IF EXISTS "placas_transportadoras_pkey";
ALTER TABLE IF EXISTS ONLY "public"."placas" DROP CONSTRAINT IF EXISTS "placas_placa_key";
ALTER TABLE IF EXISTS ONLY "public"."placas" DROP CONSTRAINT IF EXISTS "placas_pkey";
ALTER TABLE IF EXISTS ONLY "public"."placas_motoristas" DROP CONSTRAINT IF EXISTS "placas_motoristas_placa_motorista_key";
ALTER TABLE IF EXISTS ONLY "public"."placas_motoristas" DROP CONSTRAINT IF EXISTS "placas_motoristas_pkey";
ALTER TABLE IF EXISTS ONLY "public"."pesagem_eixos" DROP CONSTRAINT IF EXISTS "pesagem_eixos_pkey";
ALTER TABLE IF EXISTS ONLY "public"."parametros_pesagem" DROP CONSTRAINT IF EXISTS "parametros_pesagem_pkey";
ALTER TABLE IF EXISTS ONLY "public"."motoristas" DROP CONSTRAINT IF EXISTS "motoristas_pkey";
ALTER TABLE IF EXISTS ONLY "public"."logs_acao" DROP CONSTRAINT IF EXISTS "logs_acao_pkey";
ALTER TABLE IF EXISTS ONLY "public"."carregamentos" DROP CONSTRAINT IF EXISTS "carregamentos_pkey";
ALTER TABLE IF EXISTS "public"."webhooks_config" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."usuarios" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."produtos_venda" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."produtos_carregamento" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."placas_transportadoras" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."placas_motoristas" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."placas" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."pesagem_eixos" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."parametros_pesagem" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."motoristas" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."logs_acao" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."carregamentos" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "public"."webhooks_config_id_seq";
DROP TABLE IF EXISTS "public"."webhooks_config";
DROP TABLE IF EXISTS "public"."vendas";
DROP SEQUENCE IF EXISTS "public"."usuarios_id_seq";
DROP TABLE IF EXISTS "public"."usuarios";
DROP TABLE IF EXISTS "public"."transportadoras";
DROP SEQUENCE IF EXISTS "public"."produtos_venda_id_seq";
DROP TABLE IF EXISTS "public"."produtos_venda";
DROP SEQUENCE IF EXISTS "public"."produtos_carregamento_id_seq";
DROP TABLE IF EXISTS "public"."produtos_carregamento";
DROP SEQUENCE IF EXISTS "public"."placas_transportadoras_id_seq";
DROP TABLE IF EXISTS "public"."placas_transportadoras";
DROP SEQUENCE IF EXISTS "public"."placas_motoristas_id_seq";
DROP TABLE IF EXISTS "public"."placas_motoristas";
DROP SEQUENCE IF EXISTS "public"."placas_id_seq";
DROP TABLE IF EXISTS "public"."placas";
DROP SEQUENCE IF EXISTS "public"."pesagem_eixos_id_seq";
DROP TABLE IF EXISTS "public"."pesagem_eixos";
DROP SEQUENCE IF EXISTS "public"."parametros_pesagem_id_seq";
DROP TABLE IF EXISTS "public"."parametros_pesagem";
DROP SEQUENCE IF EXISTS "public"."motoristas_id_seq";
DROP TABLE IF EXISTS "public"."motoristas";
DROP SEQUENCE IF EXISTS "public"."logs_acao_id_seq";
DROP TABLE IF EXISTS "public"."logs_acao";
DROP SEQUENCE IF EXISTS "public"."carregamentos_id_seq";
DROP TABLE IF EXISTS "public"."carregamentos";
DROP EXTENSION IF EXISTS "unaccent";
DROP EXTENSION IF EXISTS "pgcrypto";
--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";


--
-- Name: EXTENSION "pgcrypto"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "pgcrypto" IS 'cryptographic functions';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";


--
-- Name: EXTENSION "unaccent"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "unaccent" IS 'text search dictionary that removes accents';


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: carregamentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."carregamentos" (
    "id" bigint NOT NULL,
    "venda_id" "text" NOT NULL,
    "id_gc" "text",
    "placa" "text",
    "data_carregamento" timestamp without time zone,
    "status" "text",
    "tara_total" numeric(12,3),
    "eixos" smallint,
    "tara_eixos" "jsonb",
    "motorista_id" integer,
    "transportadora_id" bigint,
    "produto_venda_id" bigint,
    "finalizado_em" timestamp without time zone,
    "peso_final_total" numeric(12,3),
    "peso_final_eixos" "jsonb",
    "observacoes" "text",
    "detalhes_produto" "text",
    "qtd_desejada" "text",
    CONSTRAINT "chk_carreg_eixos_1_5" CHECK ((("eixos" IS NULL) OR (("eixos" >= 1) AND ("eixos" <= 5)))),
    CONSTRAINT "chk_carreg_status" CHECK ((("status" IS NULL) OR ("status" = ANY (ARRAY['pendente'::"text", 'stand-by'::"text", 'concluido'::"text", 'cancelado'::"text"]))))
);


--
-- Name: TABLE "carregamentos"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE "public"."carregamentos" IS 'Carregamentos vinculados a um contrato (venda_id) e, quando concluído, à venda gerada (id_gc).';


--
-- Name: COLUMN "carregamentos"."venda_id"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."carregamentos"."venda_id" IS 'Contrato original (vendas.id_gc) para faturamento parcial.';


--
-- Name: COLUMN "carregamentos"."id_gc"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."carregamentos"."id_gc" IS 'Venda gerada/entrega futura (vendas.id_gc) após concluir o carregamento. Nula até finalizar.';


--
-- Name: COLUMN "carregamentos"."data_carregamento"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."carregamentos"."data_carregamento" IS 'Timestamp de criação/início do carregamento (primeira pesagem / TARA).';


--
-- Name: COLUMN "carregamentos"."finalizado_em"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."carregamentos"."finalizado_em" IS 'Timestamp de término do carregamento (pesagem final).';


--
-- Name: COLUMN "carregamentos"."peso_final_total"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."carregamentos"."peso_final_total" IS 'Peso total na pesagem final (TON, 3 casas).';


--
-- Name: COLUMN "carregamentos"."peso_final_eixos"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."carregamentos"."peso_final_eixos" IS 'JSONB com pesos por eixo na pesagem final (array na ordem dos eixos).';


--
-- Name: carregamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."carregamentos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carregamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."carregamentos_id_seq" OWNED BY "public"."carregamentos"."id";


--
-- Name: logs_acao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."logs_acao" (
    "id" integer NOT NULL,
    "carregamento_id" integer,
    "usuario_id" integer,
    "acao" "text",
    "data" timestamp without time zone DEFAULT "now"(),
    "detalhes" "jsonb"
);


--
-- Name: logs_acao_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."logs_acao_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logs_acao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."logs_acao_id_seq" OWNED BY "public"."logs_acao"."id";


--
-- Name: motoristas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."motoristas" (
    "id" integer NOT NULL,
    "nome" "text" NOT NULL,
    "cpf" "text",
    "transportadora_id" "text"
);


--
-- Name: motoristas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."motoristas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: motoristas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."motoristas_id_seq" OWNED BY "public"."motoristas"."id";


--
-- Name: parametros_pesagem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."parametros_pesagem" (
    "id" integer NOT NULL,
    "peso_maximo_eixo" integer,
    "tolerancia_peso" integer,
    "permitir_excesso" boolean,
    "criado_em" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: parametros_pesagem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."parametros_pesagem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parametros_pesagem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."parametros_pesagem_id_seq" OWNED BY "public"."parametros_pesagem"."id";


--
-- Name: pesagem_eixos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."pesagem_eixos" (
    "id" integer NOT NULL,
    "carregamento_id" integer,
    "eixo_num" integer,
    "peso" numeric
);


--
-- Name: pesagem_eixos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."pesagem_eixos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pesagem_eixos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."pesagem_eixos_id_seq" OWNED BY "public"."pesagem_eixos"."id";


--
-- Name: placas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."placas" (
    "id" integer NOT NULL,
    "placa" "text" NOT NULL
);


--
-- Name: placas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."placas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: placas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."placas_id_seq" OWNED BY "public"."placas"."id";


--
-- Name: placas_motoristas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."placas_motoristas" (
    "id" integer NOT NULL,
    "placa_id" integer,
    "motorista_id" integer
);


--
-- Name: placas_motoristas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."placas_motoristas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: placas_motoristas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."placas_motoristas_id_seq" OWNED BY "public"."placas_motoristas"."id";


--
-- Name: placas_transportadoras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."placas_transportadoras" (
    "id" integer NOT NULL,
    "placa_id" integer,
    "transportadora_id" "text"
);


--
-- Name: placas_transportadoras_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."placas_transportadoras_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: placas_transportadoras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."placas_transportadoras_id_seq" OWNED BY "public"."placas_transportadoras"."id";


--
-- Name: produtos_carregamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."produtos_carregamento" (
    "id" integer NOT NULL,
    "carregamento_id" integer NOT NULL,
    "produto_id" "text" NOT NULL,
    "nome_produto" "text" NOT NULL,
    "quantidade" numeric NOT NULL,
    "unidade" "text" NOT NULL,
    "criado_em" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: produtos_carregamento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."produtos_carregamento_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: produtos_carregamento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."produtos_carregamento_id_seq" OWNED BY "public"."produtos_carregamento"."id";


--
-- Name: produtos_venda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."produtos_venda" (
    "id" integer NOT NULL,
    "venda_id" "text",
    "produto_id" "text",
    "nome_produto" "text",
    "quantidade" numeric,
    "valor_unitario" numeric,
    "valor_total" numeric
);


--
-- Name: produtos_venda_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."produtos_venda_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: produtos_venda_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."produtos_venda_id_seq" OWNED BY "public"."produtos_venda"."id";


--
-- Name: transportadoras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."transportadoras" (
    "id_gc" "text" NOT NULL,
    "nome" "text",
    "cpf_cnpj" "text",
    "tipo_pessoa" "text",
    "email" "text",
    "telefone" "text",
    "cadastrado_em" timestamp without time zone,
    "modificado_em" timestamp without time zone
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."usuarios" (
    "id" integer NOT NULL,
    "nome" "text" NOT NULL,
    "email" "text" NOT NULL,
    "senha_hash" "text" NOT NULL,
    "permissao" "text" NOT NULL,
    "ativo" boolean DEFAULT true,
    "pode_editar" boolean DEFAULT false,
    "pode_cancelar" boolean DEFAULT false,
    "pode_duplicar" boolean DEFAULT false,
    CONSTRAINT "usuarios_permissao_check" CHECK (("permissao" = ANY (ARRAY['operador'::"text", 'supervisor'::"text"])))
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."usuarios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."usuarios_id_seq" OWNED BY "public"."usuarios"."id";


--
-- Name: vendas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."vendas" (
    "id_gc" "text" NOT NULL,
    "codigo" "text",
    "cliente_id" "text",
    "nome_cliente" "text",
    "vendedor_id" "text",
    "nome_vendedor" "text",
    "data" "date",
    "situacao" "text",
    "valor_total" numeric,
    "observacoes" "text",
    "transportadora_id" "text",
    "forma_pagamento" "text",
    "status_financeiro" "text",
    "status_estoque" "text",
    "nota_fiscal_id" "text",
    "hash" "text",
    "modificado_em" timestamp without time zone,
    "data_cadastro" timestamp without time zone
);


--
-- Name: webhooks_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."webhooks_config" (
    "id" integer NOT NULL,
    "busca_placa" "text",
    "busca_codigo" "text",
    "confirmacao" "text",
    "cancelamento" "text",
    "ticket" "text",
    "duplicacao" "text"
);


--
-- Name: webhooks_config_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."webhooks_config_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: webhooks_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."webhooks_config_id_seq" OWNED BY "public"."webhooks_config"."id";


--
-- Name: carregamentos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."carregamentos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."carregamentos_id_seq"'::"regclass");


--
-- Name: logs_acao id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."logs_acao" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."logs_acao_id_seq"'::"regclass");


--
-- Name: motoristas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."motoristas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."motoristas_id_seq"'::"regclass");


--
-- Name: parametros_pesagem id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."parametros_pesagem" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."parametros_pesagem_id_seq"'::"regclass");


--
-- Name: pesagem_eixos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."pesagem_eixos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."pesagem_eixos_id_seq"'::"regclass");


--
-- Name: placas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."placas_id_seq"'::"regclass");


--
-- Name: placas_motoristas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_motoristas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."placas_motoristas_id_seq"'::"regclass");


--
-- Name: placas_transportadoras id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_transportadoras" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."placas_transportadoras_id_seq"'::"regclass");


--
-- Name: produtos_carregamento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."produtos_carregamento" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."produtos_carregamento_id_seq"'::"regclass");


--
-- Name: produtos_venda id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."produtos_venda" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."produtos_venda_id_seq"'::"regclass");


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."usuarios" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."usuarios_id_seq"'::"regclass");


--
-- Name: webhooks_config id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."webhooks_config" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."webhooks_config_id_seq"'::"regclass");


--
-- Name: carregamentos carregamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."carregamentos"
    ADD CONSTRAINT "carregamentos_pkey" PRIMARY KEY ("id");


--
-- Name: logs_acao logs_acao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."logs_acao"
    ADD CONSTRAINT "logs_acao_pkey" PRIMARY KEY ("id");


--
-- Name: motoristas motoristas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."motoristas"
    ADD CONSTRAINT "motoristas_pkey" PRIMARY KEY ("id");


--
-- Name: parametros_pesagem parametros_pesagem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."parametros_pesagem"
    ADD CONSTRAINT "parametros_pesagem_pkey" PRIMARY KEY ("id");


--
-- Name: pesagem_eixos pesagem_eixos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."pesagem_eixos"
    ADD CONSTRAINT "pesagem_eixos_pkey" PRIMARY KEY ("id");


--
-- Name: placas_motoristas placas_motoristas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_motoristas"
    ADD CONSTRAINT "placas_motoristas_pkey" PRIMARY KEY ("id");


--
-- Name: placas_motoristas placas_motoristas_placa_motorista_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_motoristas"
    ADD CONSTRAINT "placas_motoristas_placa_motorista_key" UNIQUE ("placa_id", "motorista_id");


--
-- Name: placas placas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas"
    ADD CONSTRAINT "placas_pkey" PRIMARY KEY ("id");


--
-- Name: placas placas_placa_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas"
    ADD CONSTRAINT "placas_placa_key" UNIQUE ("placa");


--
-- Name: placas_transportadoras placas_transportadoras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_transportadoras"
    ADD CONSTRAINT "placas_transportadoras_pkey" PRIMARY KEY ("id");


--
-- Name: placas_transportadoras placas_transportadoras_placa_transp_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_transportadoras"
    ADD CONSTRAINT "placas_transportadoras_placa_transp_key" UNIQUE ("placa_id", "transportadora_id");


--
-- Name: produtos_carregamento produtos_carregamento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."produtos_carregamento"
    ADD CONSTRAINT "produtos_carregamento_pkey" PRIMARY KEY ("id");


--
-- Name: produtos_venda produtos_venda_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."produtos_venda"
    ADD CONSTRAINT "produtos_venda_pkey" PRIMARY KEY ("id");


--
-- Name: transportadoras transportadoras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."transportadoras"
    ADD CONSTRAINT "transportadoras_pkey" PRIMARY KEY ("id_gc");


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_email_key" UNIQUE ("email");


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");


--
-- Name: vendas vendas_idgc_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."vendas"
    ADD CONSTRAINT "vendas_idgc_unique" UNIQUE ("id_gc");


--
-- Name: vendas vendas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."vendas"
    ADD CONSTRAINT "vendas_pkey" PRIMARY KEY ("id_gc");


--
-- Name: idx_carreg_aberto_venda_placa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_carreg_aberto_venda_placa" ON "public"."carregamentos" USING "btree" ("venda_id", "upper"("replace"("placa", '-'::"text", ''::"text"))) WHERE (("status" = 'pendente'::"text") AND ("finalizado_em" IS NULL));


--
-- Name: idx_carreg_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_carreg_id" ON "public"."carregamentos" USING "btree" ("id");


--
-- Name: idx_carreg_idgc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_carreg_idgc" ON "public"."carregamentos" USING "btree" ("id_gc");


--
-- Name: idx_carreg_placa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_carreg_placa" ON "public"."carregamentos" USING "btree" ("upper"("replace"("placa", '-'::"text", ''::"text")));


--
-- Name: idx_carreg_venda_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_carreg_venda_id" ON "public"."carregamentos" USING "btree" ("venda_id");


--
-- Name: idx_placas_norm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_placas_norm" ON "public"."placas" USING "btree" ("regexp_replace"("upper"("placa"), '[^A-Z0-9]'::"text", ''::"text", 'g'::"text"));


--
-- Name: uq_produtos_venda_venda_produto; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "uq_produtos_venda_venda_produto" ON "public"."produtos_venda" USING "btree" ("venda_id", "produto_id");


--
-- Name: carregamentos fk_carreg_venda; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."carregamentos"
    ADD CONSTRAINT "fk_carreg_venda" FOREIGN KEY ("venda_id") REFERENCES "public"."vendas"("id_gc") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: logs_acao logs_acao_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."logs_acao"
    ADD CONSTRAINT "logs_acao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id");


--
-- Name: motoristas motoristas_transportadora_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."motoristas"
    ADD CONSTRAINT "motoristas_transportadora_id_fkey" FOREIGN KEY ("transportadora_id") REFERENCES "public"."transportadoras"("id_gc");


--
-- Name: placas_motoristas placas_motoristas_motorista_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_motoristas"
    ADD CONSTRAINT "placas_motoristas_motorista_fk" FOREIGN KEY ("motorista_id") REFERENCES "public"."motoristas"("id") ON DELETE CASCADE;


--
-- Name: placas_motoristas placas_motoristas_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_motoristas"
    ADD CONSTRAINT "placas_motoristas_motorista_id_fkey" FOREIGN KEY ("motorista_id") REFERENCES "public"."motoristas"("id");


--
-- Name: placas_motoristas placas_motoristas_placa_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_motoristas"
    ADD CONSTRAINT "placas_motoristas_placa_fk" FOREIGN KEY ("placa_id") REFERENCES "public"."placas"("id") ON DELETE CASCADE;


--
-- Name: placas_motoristas placas_motoristas_placa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_motoristas"
    ADD CONSTRAINT "placas_motoristas_placa_id_fkey" FOREIGN KEY ("placa_id") REFERENCES "public"."placas"("id");


--
-- Name: placas_transportadoras placas_transportadoras_placa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_transportadoras"
    ADD CONSTRAINT "placas_transportadoras_placa_id_fkey" FOREIGN KEY ("placa_id") REFERENCES "public"."placas"("id");


--
-- Name: placas_transportadoras placas_transportadoras_transportadora_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."placas_transportadoras"
    ADD CONSTRAINT "placas_transportadoras_transportadora_id_fkey" FOREIGN KEY ("transportadora_id") REFERENCES "public"."transportadoras"("id_gc");


--
-- Name: produtos_venda produtos_venda_venda_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."produtos_venda"
    ADD CONSTRAINT "produtos_venda_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "public"."vendas"("id_gc");


--
-- PostgreSQL database dump complete
--

