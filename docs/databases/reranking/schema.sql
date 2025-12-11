--
--
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
WITH
    SCHEMA public;

--
--
COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

--
-- Name: gift_sessions_status_enum; Type: TYPE; Schema: public; Owner: -
--
CREATE TYPE public.gift_sessions_status_enum AS ENUM('active', 'completed', 'timeout');

--
-- Name: gift_session_products; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.gift_session_products (
    id uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    source_event_name character varying(128) NOT NULL,
    source_event_provider character varying(32) NOT NULL,
    source_event_success boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    session_event_id character varying
);

--
-- Name: gift_sessions; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.gift_sessions (
    event_id character varying NOT NULL,
    chat_id character varying NOT NULL,
    status public.gift_sessions_status_enum DEFAULT 'active'::public.gift_sessions_status_enum NOT NULL,
    completed_events integer DEFAULT 0 NOT NULL,
    total_events integer NOT NULL,
    loop_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    gift_context jsonb
);

--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    image text,
    title text NOT NULL,
    description text NOT NULL,
    link text NOT NULL,
    price_value double precision,
    price_label text,
    price_currency character varying(8),
    price_negotiable boolean,
    category text,
    provider character varying(50) DEFAULT 'unknown'::character varying NOT NULL,
    rating integer,
    reasoning text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    gift_session_product_id uuid
);

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--
--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.products
ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);

--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--
ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);

--
-- Name: gift_session_products PK_93412cb7bde00c774525def31db; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.gift_session_products
ADD CONSTRAINT "PK_93412cb7bde00c774525def31db" PRIMARY KEY (id);

--
-- Name: gift_sessions PK_ef64a9636de8d39c0653398929b; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.gift_sessions
ADD CONSTRAINT "PK_ef64a9636de8d39c0653398929b" PRIMARY KEY (event_id);

--
-- Name: products FK_5800de3a7c05607fd075ef21631; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.products
ADD CONSTRAINT "FK_5800de3a7c05607fd075ef21631" FOREIGN KEY (gift_session_product_id) REFERENCES public.gift_session_products (id) ON DELETE CASCADE;

--
-- Name: gift_session_products FK_5f69f7c77b3fd75ce80926e640e; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.gift_session_products
ADD CONSTRAINT "FK_5f69f7c77b3fd75ce80926e640e" FOREIGN KEY (session_event_id) REFERENCES public.gift_sessions (event_id) ON DELETE CASCADE;

--
--
