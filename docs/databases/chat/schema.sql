--
--
--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.chat_sessions (
    chat_id character varying NOT NULL,
    occasion character varying,
    phase character varying DEFAULT 'interview'::character varying NOT NULL,
    pending_profile_data jsonb,
    save_profile_choice boolean,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    selected_listing_ids jsonb,
    selected_listings_context jsonb,
    refinement_count integer DEFAULT 0 NOT NULL
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
