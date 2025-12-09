--
--
--
-- Name: chat_sessions_interview_status_enum; Type: TYPE; Schema: public; Owner: -
--
CREATE TYPE public.chat_sessions_interview_status_enum AS ENUM('in_progress', 'completed', 'failed');

--
-- Name: chat_sessions_stalking_status_enum; Type: TYPE; Schema: public; Owner: -
--
CREATE TYPE public.chat_sessions_stalking_status_enum AS ENUM('in_progress', 'completed', 'failed');

--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.chat_sessions (
    chat_id character varying NOT NULL,
    stalking_status public.chat_sessions_stalking_status_enum DEFAULT 'in_progress'::public.chat_sessions_stalking_status_enum NOT NULL,
    interview_status public.chat_sessions_interview_status_enum DEFAULT 'in_progress'::public.chat_sessions_interview_status_enum NOT NULL,
    stalking_keywords jsonb,
    interview_profile jsonb,
    interview_keywords jsonb,
    gift_generation_triggered boolean DEFAULT false NOT NULL,
    save_profile boolean,
    profile_name character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    min_price numeric(10, 2),
    max_price numeric(10, 2)
);

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--
--
-- Name: chat_sessions PK_4fa058e8b874c96f8db9ba08423; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.chat_sessions
ADD CONSTRAINT "PK_4fa058e8b874c96f8db9ba08423" PRIMARY KEY (chat_id);

--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.chat_sessions
ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);

--
--
