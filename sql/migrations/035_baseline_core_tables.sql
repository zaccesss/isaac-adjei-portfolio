-- Baseline migration: core tables that previously lived only in sql/schema.sql.
-- schema.sql was removed because it embedded real seed data (grades, diary, etc.).
-- Generated from the live database with pg_dump --schema-only (structure only, no data).

--
-- PostgreSQL database dump
--

\restrict XpYOJsSnvNLG315mQ6NbOSfj0jOtyHSnYsw9JtNNHWXAaBaFau1dt1SQTNrYhYf

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    company text NOT NULL,
    role text NOT NULL,
    type text DEFAULT 'internship'::text,
    applied_date date,
    deadline date,
    status text DEFAULT 'scraped'::text,
    notes text,
    url text,
    starred boolean DEFAULT false,
    salary_range text,
    location text,
    work_mode text,
    source text,
    opening_date date,
    last_year_opening date,
    housing_location text,
    cv_required text,
    cover_letter_required text,
    written_answers text,
    sponsors_visa text,
    category text DEFAULT 'Software Engineering'::text,
    last_scraped_at timestamp with time zone,
    linear_issue_id text,
    archived boolean DEFAULT false NOT NULL,
    interview_prep jsonb
);


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_id uuid,
    name text NOT NULL,
    type text,
    weight_percent integer,
    mark_achieved numeric,
    mark_max numeric DEFAULT 100,
    target_mark numeric,
    date date,
    week text,
    is_pass_fail boolean DEFAULT false,
    my_notes text
);


--
-- Name: config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: course_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    stage text NOT NULL,
    section text,
    code text NOT NULL,
    title text NOT NULL,
    credits integer,
    level integer,
    core_or_option text DEFAULT 'Core'::text,
    condonable boolean DEFAULT false,
    prerequisites text,
    order_index integer DEFAULT 0
);


--
-- Name: diary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    title text NOT NULL,
    content text NOT NULL,
    mood text,
    hidden boolean DEFAULT false,
    pinned boolean DEFAULT false,
    locked boolean DEFAULT false
);


--
-- Name: goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    title text NOT NULL,
    description text,
    category text DEFAULT 'Personal'::text,
    status text DEFAULT 'not_started'::text,
    target_date date,
    progress integer DEFAULT 0
);


--
-- Name: health_nutrition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_nutrition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    category text NOT NULL,
    items jsonb DEFAULT '[]'::jsonb,
    rules text[] DEFAULT '{}'::text[],
    order_index integer DEFAULT 0
);


--
-- Name: health_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    type text DEFAULT 'gym'::text NOT NULL,
    icon text DEFAULT '💪'::text,
    color text DEFAULT '#6366f1'::text,
    order_index integer DEFAULT 0,
    active boolean DEFAULT true,
    subtype text,
    metadata jsonb
);


--
-- Name: health_workouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_workouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    section_id uuid,
    day_label text NOT NULL,
    exercises jsonb DEFAULT '[]'::jsonb,
    notes text,
    order_index integer DEFAULT 0
);


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    category text DEFAULT 'Tech and Devices'::text NOT NULL,
    quantity integer DEFAULT 1,
    description text,
    purchase_date date,
    price_paid text,
    serial_number text,
    notes text,
    warranty_expiry date,
    url text
);


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    code text,
    credits integer,
    year integer,
    semester integer,
    status text DEFAULT 'ongoing'::text,
    summary text,
    rules text
);


--
-- Name: notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    title text NOT NULL,
    content text DEFAULT ''::text,
    folder text DEFAULT 'General'::text,
    tags text[] DEFAULT '{}'::text[],
    pinned boolean DEFAULT false,
    locked boolean DEFAULT false,
    hidden boolean DEFAULT false,
    color text
);


--
-- Name: streak_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.streak_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    streak_id uuid,
    date date NOT NULL,
    completed boolean DEFAULT true
);


--
-- Name: streaks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.streaks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    icon text DEFAULT '🔥'::text,
    description text,
    color text DEFAULT '#6366f1'::text,
    active boolean DEFAULT true,
    order_index integer DEFAULT 0
);


--
-- Name: vault; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vault (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    type text DEFAULT 'account'::text,
    username text,
    email text,
    password text,
    url text,
    totp_secret text,
    card_number text,
    card_holder text,
    card_expiry text,
    phone text,
    address text,
    key_name text,
    key_value text,
    key_expiry date,
    content text,
    notes text,
    fields jsonb DEFAULT '{}'::jsonb,
    hidden boolean DEFAULT false,
    locked boolean DEFAULT false
);


--
-- Name: wishlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    category text NOT NULL,
    status text DEFAULT 'wanted'::text,
    priority text DEFAULT 'medium'::text,
    notes text
);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: config config_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_key_key UNIQUE (key);


--
-- Name: config config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_pkey PRIMARY KEY (id);


--
-- Name: course_modules course_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_pkey PRIMARY KEY (id);


--
-- Name: diary diary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diary
    ADD CONSTRAINT diary_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: health_nutrition health_nutrition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_nutrition
    ADD CONSTRAINT health_nutrition_pkey PRIMARY KEY (id);


--
-- Name: health_sections health_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_sections
    ADD CONSTRAINT health_sections_pkey PRIMARY KEY (id);


--
-- Name: health_workouts health_workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_workouts
    ADD CONSTRAINT health_workouts_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: streak_logs streak_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streak_logs
    ADD CONSTRAINT streak_logs_pkey PRIMARY KEY (id);


--
-- Name: streak_logs streak_logs_streak_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streak_logs
    ADD CONSTRAINT streak_logs_streak_id_date_key UNIQUE (streak_id, date);


--
-- Name: streaks streaks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streaks
    ADD CONSTRAINT streaks_pkey PRIMARY KEY (id);


--
-- Name: vault vault_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vault
    ADD CONSTRAINT vault_pkey PRIMARY KEY (id);


--
-- Name: wishlist wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);


--
-- Name: applications_archived_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX applications_archived_idx ON public.applications USING btree (archived);


--
-- Name: applications_url_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX applications_url_unique ON public.applications USING btree (url);


--
-- Name: assessments assessments_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: health_workouts health_workouts_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_workouts
    ADD CONSTRAINT health_workouts_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.health_sections(id) ON DELETE CASCADE;


--
-- Name: streak_logs streak_logs_streak_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streak_logs
    ADD CONSTRAINT streak_logs_streak_id_fkey FOREIGN KEY (streak_id) REFERENCES public.streaks(id) ON DELETE CASCADE;


--
-- Name: applications allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.applications USING (true);


--
-- Name: assessments allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.assessments USING (true);


--
-- Name: config allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.config USING (true);


--
-- Name: course_modules allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.course_modules USING (true);


--
-- Name: diary allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.diary USING (true);


--
-- Name: goals allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.goals USING (true);


--
-- Name: health_nutrition allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.health_nutrition USING (true);


--
-- Name: health_sections allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.health_sections USING (true);


--
-- Name: health_workouts allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.health_workouts USING (true);


--
-- Name: inventory_items allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.inventory_items USING (true);


--
-- Name: modules allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.modules USING (true);


--
-- Name: notes allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.notes USING (true);


--
-- Name: streak_logs allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.streak_logs USING (true);


--
-- Name: streaks allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.streaks USING (true);


--
-- Name: vault allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.vault USING (true);


--
-- Name: wishlist allow all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "allow all" ON public.wishlist USING (true);


--
-- Name: applications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

--
-- Name: assessments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

--
-- Name: config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

--
-- Name: course_modules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

--
-- Name: diary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.diary ENABLE ROW LEVEL SECURITY;

--
-- Name: goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

--
-- Name: health_nutrition; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_nutrition ENABLE ROW LEVEL SECURITY;

--
-- Name: health_sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: health_workouts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_workouts ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

--
-- Name: modules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

--
-- Name: notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

--
-- Name: streak_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.streak_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: streaks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

--
-- Name: vault; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vault ENABLE ROW LEVEL SECURITY;

--
-- Name: wishlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict XpYOJsSnvNLG315mQ6NbOSfj0jOtyHSnYsw9JtNNHWXAaBaFau1dt1SQTNrYhYf

