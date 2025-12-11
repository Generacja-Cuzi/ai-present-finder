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
-- Name: chats_status_enum; Type: TYPE; Schema: public; Owner: -
--
CREATE TYPE public.chats_status_enum AS ENUM('interview', 'searching', 'completed');

--
-- Name: messages_role_enum; Type: TYPE; Schema: public; Owner: -
--
CREATE TYPE public.messages_role_enum AS ENUM('user', 'assistant', 'system');

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: -
--
CREATE TYPE public.users_role_enum AS ENUM('user', 'admin');

--
-- Name: chats; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.chats (
    id uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    chat_id character varying NOT NULL,
    chat_name character varying NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_interview_completed boolean DEFAULT false NOT NULL,
    reasoning_summary jsonb,
    status public.chats_status_enum DEFAULT 'interview'::public.chats_status_enum NOT NULL,
    current_round integer DEFAULT 0 NOT NULL
);

--
-- Name: feedback_images; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.feedback_images (
    id uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    feedback_id uuid NOT NULL,
    image_data bytea NOT NULL,
    mime_type character varying(100) NOT NULL,
    file_size integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.feedbacks (
    id uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    chat_id character varying NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    product_id character varying,
    is_general_feedback boolean DEFAULT false NOT NULL
);

--
-- Name: listings; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.listings (
    id uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    chat_id character varying,
    image character varying,
    title character varying NOT NULL,
    description text NOT NULL,
    link character varying NOT NULL,
    price_value numeric(10, 2),
    price_label character varying,
    price_currency character varying,
    price_negotiable boolean DEFAULT false NOT NULL,
    category character varying,
    provider character varying DEFAULT 'unknown'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    round integer DEFAULT 1 NOT NULL
);

--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.messages (
    id uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    chat_id character varying NOT NULL,
    role public.messages_role_enum DEFAULT 'user'::public.messages_role_enum NOT NULL,
    content text NOT NULL,
    "proposedAnswers" json,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: user_favorite_listings; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.user_favorite_listings (listing_id uuid NOT NULL, user_id uuid NOT NULL);

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.user_profiles (
    id uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    user_id uuid NOT NULL,
    person_name character varying NOT NULL,
    chat_id character varying NOT NULL,
    profile jsonb NOT NULL,
    key_themes jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4 () NOT NULL,
    email character varying NOT NULL,
    google_id character varying,
    name character varying,
    access_token text,
    refresh_token text,
    role public.users_role_enum DEFAULT 'user'::public.users_role_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    given_name character varying,
    family_name character varying,
    picture text
);

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--
--
-- Name: chats PK_0117647b3c4a4e5ff198aeb6206; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.chats
ADD CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY (id);

--
-- Name: messages PK_18325f38ae6de43878487eff986; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.messages
ADD CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY (id);

--
-- Name: user_profiles PK_1ec6662219f4605723f1e41b6cb; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.user_profiles
ADD CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY (id);

--
-- Name: listings PK_520ecac6c99ec90bcf5a603cdcb; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.listings
ADD CONSTRAINT "PK_520ecac6c99ec90bcf5a603cdcb" PRIMARY KEY (id);

--
-- Name: feedback_images PK_54810ac65b7995b0b19fad6c5a7; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.feedback_images
ADD CONSTRAINT "PK_54810ac65b7995b0b19fad6c5a7" PRIMARY KEY (id);

--
-- Name: feedbacks PK_79affc530fdd838a9f1e0cc30be; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.feedbacks
ADD CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY (id);

--
-- Name: user_favorite_listings PK_80c9472c0001605419c3ab870a9; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.user_favorite_listings
ADD CONSTRAINT "PK_80c9472c0001605419c3ab870a9" PRIMARY KEY (listing_id, user_id);

--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.user_profiles
ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);

--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.users
ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);

--
-- Name: users UQ_0bd5012aeb82628e07f6a1be53b; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.users
ADD CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE (google_id);

--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.users
ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);

--
-- Name: chats UQ_cb573d310bde330521e7715db2a; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.chats
ADD CONSTRAINT "UQ_cb573d310bde330521e7715db2a" UNIQUE (chat_id);

--
-- Name: IDX_366ea02dc46f24c57d225cbd79; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX "IDX_366ea02dc46f24c57d225cbd79" ON public.messages USING btree (chat_id, created_at);

--
-- Name: IDX_542ba6e673fd64ead050990cd0; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX "IDX_542ba6e673fd64ead050990cd0" ON public.user_favorite_listings USING btree (user_id);

--
-- Name: IDX_6ca9503d77ae39b4b5a6cc3ba8; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX "IDX_6ca9503d77ae39b4b5a6cc3ba8" ON public.user_profiles USING btree (user_id);

--
-- Name: IDX_b6c92d818d42e3e298e84d9441; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX "IDX_b6c92d818d42e3e298e84d9441" ON public.chats USING btree (user_id);

--
-- Name: IDX_bc249e7e802ebc065b4e89827e; Type: INDEX; Schema: public; Owner: -
--
CREATE UNIQUE INDEX "IDX_bc249e7e802ebc065b4e89827e" ON public.feedbacks USING btree (chat_id, product_id);

--
-- Name: IDX_d396c706f07df3bbb194e98b6e; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX "IDX_d396c706f07df3bbb194e98b6e" ON public.user_favorite_listings USING btree (listing_id);

--
-- Name: IDX_d7cf2d293836a0b8ff9a546918; Type: INDEX; Schema: public; Owner: -
--
CREATE INDEX "IDX_d7cf2d293836a0b8ff9a546918" ON public.listings USING btree (chat_id);

--
-- Name: feedbacks FK_40819d53448766adc4b1339a111; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.feedbacks
ADD CONSTRAINT "FK_40819d53448766adc4b1339a111" FOREIGN KEY (chat_id) REFERENCES public.chats (chat_id) ON DELETE CASCADE;

--
-- Name: feedbacks FK_4334f6be2d7d841a9d5205a100e; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.feedbacks
ADD CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e" FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

--
-- Name: user_favorite_listings FK_542ba6e673fd64ead050990cd06; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.user_favorite_listings
ADD CONSTRAINT "FK_542ba6e673fd64ead050990cd06" FOREIGN KEY (user_id) REFERENCES public.users (id);

--
-- Name: user_profiles FK_6ca9503d77ae39b4b5a6cc3ba88; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.user_profiles
ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

--
-- Name: messages FK_7540635fef1922f0b156b9ef74f; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.messages
ADD CONSTRAINT "FK_7540635fef1922f0b156b9ef74f" FOREIGN KEY (chat_id) REFERENCES public.chats (chat_id) ON DELETE CASCADE;

--
-- Name: feedback_images FK_83a317528dae2b39aa028cbe2be; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.feedback_images
ADD CONSTRAINT "FK_83a317528dae2b39aa028cbe2be" FOREIGN KEY (feedback_id) REFERENCES public.feedbacks (id) ON DELETE CASCADE;

--
-- Name: chats FK_b6c92d818d42e3e298e84d94414; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.chats
ADD CONSTRAINT "FK_b6c92d818d42e3e298e84d94414" FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

--
-- Name: user_favorite_listings FK_d396c706f07df3bbb194e98b6e5; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.user_favorite_listings
ADD CONSTRAINT "FK_d396c706f07df3bbb194e98b6e5" FOREIGN KEY (listing_id) REFERENCES public.listings (id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: listings FK_d7cf2d293836a0b8ff9a5469182; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.listings
ADD CONSTRAINT "FK_d7cf2d293836a0b8ff9a5469182" FOREIGN KEY (chat_id) REFERENCES public.chats (chat_id) ON DELETE SET NULL;

--
--
