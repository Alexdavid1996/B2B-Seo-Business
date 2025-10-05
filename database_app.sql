--
-- PostgreSQL database dump
--

\restrict 3ChBPInDlRP0y9MAA0Y9gpF0Ouc2Tb74L1KHixMDaEUQUqcAgNLBCT5R9bOhEIe

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

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

ALTER TABLE IF EXISTS ONLY public.wallets DROP CONSTRAINT IF EXISTS wallets_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_processed_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_gateway_id_payment_gateways_id_fk;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_referred_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_summary_stats DROP CONSTRAINT IF EXISTS user_summary_stats_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_deposit_sessions DROP CONSTRAINT IF EXISTS user_deposit_sessions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_order_id_orders_id_fk;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_closed_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.support_notifications DROP CONSTRAINT IF EXISTS support_notifications_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.support_notifications DROP CONSTRAINT IF EXISTS support_notifications_ticket_id_support_tickets_id_fk;
ALTER TABLE IF EXISTS ONLY public.support_messages DROP CONSTRAINT IF EXISTS support_messages_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.sites DROP CONSTRAINT IF EXISTS sites_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.sites DROP CONSTRAINT IF EXISTS sites_processed_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.ref_commissions DROP CONSTRAINT IF EXISTS ref_commissions_referrer_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.ref_commissions DROP CONSTRAINT IF EXISTS ref_commissions_referred_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.ref_commissions DROP CONSTRAINT IF EXISTS ref_commissions_order_id_orders_id_fk;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_seller_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_listing_id_listings_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_buyer_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_read_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_order_id_orders_id_fk;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_exchange_id_exchanges_id_fk;
ALTER TABLE IF EXISTS ONLY public.listings DROP CONSTRAINT IF EXISTS listings_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.listings DROP CONSTRAINT IF EXISTS listings_site_id_sites_id_fk;
ALTER TABLE IF EXISTS ONLY public.exchanges DROP CONSTRAINT IF EXISTS exchanges_requester_site_id_sites_id_fk;
ALTER TABLE IF EXISTS ONLY public.exchanges DROP CONSTRAINT IF EXISTS exchanges_requester_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.exchanges DROP CONSTRAINT IF EXISTS exchanges_requested_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.exchanges DROP CONSTRAINT IF EXISTS exchanges_requested_site_id_sites_id_fk;
ALTER TABLE IF EXISTS ONLY public.exchanges DROP CONSTRAINT IF EXISTS exchanges_delivered_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.email_verification_tokens DROP CONSTRAINT IF EXISTS email_verification_tokens_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.email_reminders DROP CONSTRAINT IF EXISTS email_reminders_sent_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.crypto_txids DROP CONSTRAINT IF EXISTS crypto_txids_wallet_transaction_id_wallet_transactions_id_fk;
ALTER TABLE IF EXISTS ONLY public.crypto_txids DROP CONSTRAINT IF EXISTS crypto_txids_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.banned_ips DROP CONSTRAINT IF EXISTS banned_ips_banned_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.banned_emails DROP CONSTRAINT IF EXISTS banned_emails_banned_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.wallets DROP CONSTRAINT IF EXISTS wallets_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.wallets DROP CONSTRAINT IF EXISTS wallets_pkey;
ALTER TABLE IF EXISTS ONLY public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_transaction_id_unique;
ALTER TABLE IF EXISTS ONLY public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.user_summary_stats DROP CONSTRAINT IF EXISTS user_summary_stats_user_id_unique;
ALTER TABLE IF EXISTS ONLY public.user_summary_stats DROP CONSTRAINT IF EXISTS user_summary_stats_pkey;
ALTER TABLE IF EXISTS ONLY public.user_deposit_sessions DROP CONSTRAINT IF EXISTS user_deposit_sessions_session_id_unique;
ALTER TABLE IF EXISTS ONLY public.user_deposit_sessions DROP CONSTRAINT IF EXISTS user_deposit_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_transaction_id_unique;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_ticket_number_unique;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_pkey;
ALTER TABLE IF EXISTS ONLY public.support_notifications DROP CONSTRAINT IF EXISTS support_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.support_messages DROP CONSTRAINT IF EXISTS support_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.social_links DROP CONSTRAINT IF EXISTS social_links_pkey;
ALTER TABLE IF EXISTS ONLY public.smtp_system DROP CONSTRAINT IF EXISTS smtp_system_pkey;
ALTER TABLE IF EXISTS ONLY public.sites DROP CONSTRAINT IF EXISTS sites_pkey;
ALTER TABLE IF EXISTS ONLY public.site_categories DROP CONSTRAINT IF EXISTS site_categories_slug_unique;
ALTER TABLE IF EXISTS ONLY public.site_categories DROP CONSTRAINT IF EXISTS site_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.site_categories DROP CONSTRAINT IF EXISTS site_categories_name_unique;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_key_unique;
ALTER TABLE IF EXISTS ONLY public.security_login_access DROP CONSTRAINT IF EXISTS security_login_access_pkey;
ALTER TABLE IF EXISTS ONLY public.rejection_reasons DROP CONSTRAINT IF EXISTS rejection_reasons_pkey;
ALTER TABLE IF EXISTS ONLY public.ref_commissions DROP CONSTRAINT IF EXISTS ref_commissions_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_gateways DROP CONSTRAINT IF EXISTS payment_gateways_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_gateways DROP CONSTRAINT IF EXISTS payment_gateways_name_unique;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_order_id_unique;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.listings DROP CONSTRAINT IF EXISTS listings_pkey;
ALTER TABLE IF EXISTS ONLY public.global_notifications DROP CONSTRAINT IF EXISTS global_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.finance_settings DROP CONSTRAINT IF EXISTS finance_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.fee_records DROP CONSTRAINT IF EXISTS fee_records_pkey;
ALTER TABLE IF EXISTS ONLY public.exchanges DROP CONSTRAINT IF EXISTS exchanges_pkey;
ALTER TABLE IF EXISTS ONLY public.exchanges DROP CONSTRAINT IF EXISTS exchanges_order_id_unique;
ALTER TABLE IF EXISTS ONLY public.email_verification_tokens DROP CONSTRAINT IF EXISTS email_verification_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY public.email_verification_tokens DROP CONSTRAINT IF EXISTS email_verification_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.email_reminders DROP CONSTRAINT IF EXISTS email_reminders_pkey;
ALTER TABLE IF EXISTS ONLY public.crypto_txids DROP CONSTRAINT IF EXISTS crypto_txids_tx_id_unique;
ALTER TABLE IF EXISTS ONLY public.crypto_txids DROP CONSTRAINT IF EXISTS crypto_txids_pkey;
ALTER TABLE IF EXISTS ONLY public.banned_ips DROP CONSTRAINT IF EXISTS banned_ips_pkey;
ALTER TABLE IF EXISTS ONLY public.banned_ips DROP CONSTRAINT IF EXISTS banned_ips_ip_address_unique;
ALTER TABLE IF EXISTS ONLY public.banned_emails DROP CONSTRAINT IF EXISTS banned_emails_pkey;
ALTER TABLE IF EXISTS ONLY public.banned_emails DROP CONSTRAINT IF EXISTS banned_emails_email_unique;
ALTER TABLE IF EXISTS ONLY public.auth_session_store DROP CONSTRAINT IF EXISTS auth_session_store_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_recent_activity DROP CONSTRAINT IF EXISTS admin_recent_activity_pkey;
DROP TABLE IF EXISTS public.wallets;
DROP TABLE IF EXISTS public.wallet_transactions;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_summary_stats;
DROP TABLE IF EXISTS public.user_deposit_sessions;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.support_tickets;
DROP TABLE IF EXISTS public.support_notifications;
DROP TABLE IF EXISTS public.support_messages;
DROP TABLE IF EXISTS public.social_links;
DROP TABLE IF EXISTS public.smtp_system;
DROP TABLE IF EXISTS public.sites;
DROP TABLE IF EXISTS public.site_categories;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.security_login_access;
DROP TABLE IF EXISTS public.rejection_reasons;
DROP TABLE IF EXISTS public.ref_commissions;
DROP TABLE IF EXISTS public.payment_gateways;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.listings;
DROP TABLE IF EXISTS public.global_notifications;
DROP TABLE IF EXISTS public.finance_settings;
DROP TABLE IF EXISTS public.fee_records;
DROP TABLE IF EXISTS public.exchanges;
DROP TABLE IF EXISTS public.email_verification_tokens;
DROP TABLE IF EXISTS public.email_reminders;
DROP TABLE IF EXISTS public.crypto_txids;
DROP TABLE IF EXISTS public.banned_ips;
DROP TABLE IF EXISTS public.banned_emails;
DROP TABLE IF EXISTS public.auth_session_store;
DROP TABLE IF EXISTS public.admin_recent_activity;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_recent_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_recent_activity (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    data text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: auth_session_store; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_session_store (
    sid character varying NOT NULL,
    sess text NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: banned_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banned_emails (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    reason text,
    banned_by character varying,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: banned_ips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banned_ips (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ip_address text NOT NULL,
    reason text,
    banned_by character varying,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: crypto_txids; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crypto_txids (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tx_id text NOT NULL,
    username text NOT NULL,
    user_id character varying NOT NULL,
    wallet_transaction_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: email_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_reminders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    order_id character varying,
    exchange_id character varying,
    sent_by character varying NOT NULL,
    recipient_emails text NOT NULL,
    email_results text,
    created_at timestamp without time zone DEFAULT now(),
    status text NOT NULL
);


--
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_verification_tokens (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    email text NOT NULL,
    token character varying NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: exchanges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exchanges (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    requester_id character varying NOT NULL,
    requested_user_id character varying NOT NULL,
    requester_site_id character varying NOT NULL,
    requested_site_id character varying NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    message text,
    delivery_url text,
    requester_completed boolean DEFAULT false NOT NULL,
    requested_user_completed boolean DEFAULT false NOT NULL,
    delivered_by character varying,
    delivered_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    order_id character varying
);


--
-- Name: fee_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_records (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    fee_type text NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    amount integer NOT NULL,
    original_amount integer,
    date_time timestamp without time zone DEFAULT now(),
    reference_id text NOT NULL,
    status text DEFAULT 'success'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: finance_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    reason text NOT NULL,
    type text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: global_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_notifications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    message text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    notification_type character varying(50) DEFAULT 'announcement'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    duration_days integer DEFAULT 30,
    flash_time integer DEFAULT 10,
    cycle_time integer DEFAULT 8
);


--
-- Name: listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    site_id character varying NOT NULL,
    type text NOT NULL,
    price integer NOT NULL,
    service_fee integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    requirements text,
    turnaround_time integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    exchange_id character varying,
    sender_id character varying NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    order_id character varying,
    is_read boolean DEFAULT false NOT NULL,
    read_by character varying,
    read_at timestamp without time zone
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    related_entity_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    section text,
    sub_tab text,
    priority text DEFAULT 'normal'::text
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    buyer_id character varying NOT NULL,
    seller_id character varying NOT NULL,
    listing_id character varying NOT NULL,
    amount integer NOT NULL,
    service_fee integer NOT NULL,
    seller_amount integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    requirements text,
    delivery_url text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    order_id character varying,
    buyer_completed boolean DEFAULT false NOT NULL,
    seller_delivered boolean DEFAULT false NOT NULL,
    google_doc_link text,
    target_link text
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    email text NOT NULL,
    token character varying NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: payment_gateways; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_gateways (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    type text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    settings text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    min_deposit_amount integer DEFAULT 500 NOT NULL,
    max_deposit_amount integer DEFAULT 100000 NOT NULL,
    min_withdrawal_amount integer DEFAULT 500 NOT NULL,
    max_withdrawal_amount integer DEFAULT 100000 NOT NULL,
    wallet_address text,
    qr_code_image_path text,
    instructions text,
    qr_enabled boolean DEFAULT true NOT NULL
);


--
-- Name: ref_commissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ref_commissions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    referrer_id character varying NOT NULL,
    referred_user_id character varying NOT NULL,
    order_id character varying,
    referral_amount integer DEFAULT 300 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    referred_user_name text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: rejection_reasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rejection_reasons (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    reason_text text NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: security_login_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_login_access (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ip_address text NOT NULL,
    attempt_count integer DEFAULT 1 NOT NULL,
    last_attempt timestamp without time zone DEFAULT now(),
    locked_until timestamp without time zone,
    last_email text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: site_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sites (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    domain text NOT NULL,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    domain_authority integer NOT NULL,
    dr_score integer NOT NULL,
    monthly_traffic integer NOT NULL,
    language text DEFAULT 'English'::text NOT NULL,
    purpose text DEFAULT 'exchange'::text NOT NULL,
    price integer,
    delivery_time integer,
    status text DEFAULT 'pending'::text NOT NULL,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    purchase_count integer DEFAULT 0 NOT NULL,
    processed_by character varying,
    processed_at timestamp without time zone,
    approved_by text,
    rejected_by text,
    link_type text DEFAULT 'dofollow'::text NOT NULL,
    casino_allowed text DEFAULT 'N/A'::text
);


--
-- Name: smtp_system; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.smtp_system (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    smtp_host text,
    smtp_port integer,
    from_email text,
    from_name text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    require_email_verification boolean DEFAULT true NOT NULL
);


--
-- Name: social_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_links (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: support_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    message text NOT NULL,
    sender text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    ticket_id character varying NOT NULL,
    subject text
);


--
-- Name: support_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_notifications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    ticket_id character varying NOT NULL,
    type text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    metadata text
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ticket_number character varying NOT NULL,
    user_id character varying NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    closed_at timestamp without time zone,
    closed_by character varying
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type text NOT NULL,
    amount integer NOT NULL,
    description text NOT NULL,
    order_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    transaction_id character varying NOT NULL
);


--
-- Name: user_deposit_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_deposit_sessions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    session_id character varying NOT NULL,
    wallet_address character varying NOT NULL,
    qr_code_data text NOT NULL,
    instructions text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    amount integer NOT NULL
);


--
-- Name: user_summary_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_summary_stats (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    total_sales integer DEFAULT 0 NOT NULL,
    total_purchases integer DEFAULT 0 NOT NULL,
    total_exchanges integer DEFAULT 0 NOT NULL,
    active_domains integer DEFAULT 0 NOT NULL,
    wallet_balance integer DEFAULT 0 NOT NULL,
    last_updated timestamp without time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    company text,
    bio text,
    avatar text,
    status text DEFAULT 'active'::text,
    role text DEFAULT 'user'::text,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    registration_ip text,
    last_login_ip text,
    email_verified boolean DEFAULT false NOT NULL,
    referred_by character varying
);


--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet_transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    transaction_id character varying NOT NULL,
    user_id character varying NOT NULL,
    type text NOT NULL,
    amount integer NOT NULL,
    fee integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'processing'::text NOT NULL,
    payment_method text,
    withdrawal_method text,
    admin_note text,
    processed_by character varying,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    gateway_id character varying,
    rejection_reason text,
    approved_by text,
    rejected_by text,
    tx_id text
);


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Data for Name: admin_recent_activity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_recent_activity (id, type, data, created_at) FROM stdin;
27ccfcaa-41b8-493d-abc1-55c9c7d9993a	signup	{"email":"demo3@demo.com","firstName":"Demo123123","lastName":"demo","ipAddress":"119.92.14.196","timestamp":"2025-10-05T07:23:00.271Z","username":"Demo123123"}	2025-10-05 07:23:00.272455
2ed447e9-2a65-494e-9d42-a8d930fcd1fc	signup	{"email":"demo2@gmail.com","firstName":"Demo2","lastName":"demo2","ipAddress":"119.92.14.196","timestamp":"2025-10-05T07:34:31.952Z","username":"demo2"}	2025-10-05 07:34:31.952779
fb4436f7-ba58-4e68-803d-de55a382baf6	signup	{"email":"demo@demo.com","firstName":"demo","lastName":"demo","ipAddress":"119.92.14.196","timestamp":"2025-10-05T07:36:59.165Z","username":"demo"}	2025-10-05 07:36:59.165326
\.


--
-- Data for Name: auth_session_store; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_session_store (sid, sess, expire) FROM stdin;
_6Y0f4vX20t3l5SgDZCAd92Q0_QXoi4f	{"cookie":{"originalMaxAge":172800000,"expires":"2025-08-22T18:27:42.429Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"user":{"id":"24d6fc84-8ec2-4c05-88bb-99c0d8deb7a3","username":"admin","email":"admin@admin.com","password":"$2b$10$mZ5t3sH8fpSfNJD20437memuZEAGdwE09VrZ7Td1Lre6bJYNGiEHm","firstName":"Admin","lastName":"User","company":"Platform Administration","bio":"System administrator","avatar":null,"status":"active","role":"admin","emailVerified":true,"referredBy":null,"registrationIp":"192.168.1.100","lastLoginIp":"10.82.2.31","lastLoginAt":"2025-08-20T17:42:21.920Z","createdAt":"2025-08-04T19:44:33.358Z","updatedAt":"2025-08-20T17:42:21.920Z"}}	2025-08-22 18:42:12
ddgh3RLy-Gde3eeJ0jyesfFF88FkLFet	{"cookie":{"originalMaxAge":172800000,"expires":"2025-10-07T07:34:05.168Z","secure":true,"httpOnly":true,"domain":".alexdu1996sec485space.space","path":"/","sameSite":"lax"},"user":{"id":"24d6fc84-8ec2-4c05-88bb-99c0d8deb7a3","username":"admin","email":"admin@admin.com","password":"$2a$12$uC65ItLz/EKrcdsDJcBr7ehP5FhFzz.T7RIBg6ky2u/L0LLJ5L27W","firstName":"Admin","lastName":"User","company":"Platform Administration","bio":"System administrator","avatar":null,"status":"active","role":"admin","emailVerified":true,"referredBy":null,"registrationIp":"192.168.1.100","lastLoginIp":"10.82.6.111","lastLoginAt":"2025-08-20T18:27:42.365Z","createdAt":"2025-08-04T19:44:33.358Z","updatedAt":"2025-08-20T18:27:42.365Z"}}	2025-10-07 07:52:29
\.


--
-- Data for Name: banned_emails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banned_emails (id, email, reason, banned_by, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: banned_ips; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banned_ips (id, ip_address, reason, banned_by, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crypto_txids; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crypto_txids (id, tx_id, username, user_id, wallet_transaction_id, created_at) FROM stdin;
\.


--
-- Data for Name: email_reminders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_reminders (id, type, order_id, exchange_id, sent_by, recipient_emails, email_results, created_at, status) FROM stdin;
\.


--
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_verification_tokens (id, user_id, email, token, is_used, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: exchanges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exchanges (id, requester_id, requested_user_id, requester_site_id, requested_site_id, status, message, delivery_url, requester_completed, requested_user_completed, delivered_by, delivered_at, created_at, updated_at, order_id) FROM stdin;
\.


--
-- Data for Name: fee_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fee_records (id, fee_type, username, email, amount, original_amount, date_time, reference_id, status, created_at) FROM stdin;
\.


--
-- Data for Name: finance_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_settings (id, reason, type, is_active, created_at, updated_at) FROM stdin;
ccb50222-4e06-4790-bf5e-7f48b7faa3c9	Test	deposit	t	2025-08-03 06:14:34.76	2025-08-03 06:14:34.76
\.


--
-- Data for Name: global_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.global_notifications (id, message, is_active, notification_type, created_at, updated_at, duration_days, flash_time, cycle_time) FROM stdin;
532da5ae-c849-4d65-a3d7-aaa8d1f3ce4b	Test	t	announcement	2025-08-05 17:44:59.718833	2025-08-05 17:44:59.718833	30	8	8
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.listings (id, user_id, site_id, type, price, service_fee, is_active, requirements, turnaround_time, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, exchange_id, sender_id, content, created_at, order_id, is_read, read_by, read_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, message, is_read, related_entity_id, created_at, section, sub_tab, priority) FROM stdin;
8ae1ef18-5f43-453d-987b-1b6e2e0f32c2	51c56ba2-acc7-41c2-a335-78005235b4d5	site_approved	Site Approved	Your site "site3.com" has been approved and is now live on the platform	f	f905abfb-1375-4d8f-afee-383df29a1a03	2025-10-05 07:36:25.99744	sites	approved	high
afa7f364-0e7c-48cb-90cb-6aee20cf31fe	51c56ba2-acc7-41c2-a335-78005235b4d5	site_approved	Site Approved	Your site "site2.com" has been approved and is now live on the platform	f	01b24243-cda3-4f50-a17a-14fd70a2a2e6	2025-10-05 07:36:27.009	sites	approved	high
498a4e5b-122b-4e85-83a8-48b1f9d10589	51c56ba2-acc7-41c2-a335-78005235b4d5	site_approved	Site Approved	Your site "site.com" has been approved and is now live on the platform	f	3ed11a70-d70a-45b3-96ad-3c3acafc025b	2025-10-05 07:36:27.703844	sites	approved	high
21f60b2b-ad46-4165-88bc-ed07d00f291a	51c56ba2-acc7-41c2-a335-78005235b4d5	site_approved	Site Approved	Your site "site2.com" has been approved and is now live on the platform	f	bf0a4669-5d0c-4de3-accd-8268732614d0	2025-10-05 07:36:29.584331	sites	approved	high
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, buyer_id, seller_id, listing_id, amount, service_fee, seller_amount, status, requirements, delivery_url, created_at, updated_at, order_id, buyer_completed, seller_delivered, google_doc_link, target_link) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, user_id, email, token, is_used, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: payment_gateways; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_gateways (id, name, display_name, type, is_active, settings, created_at, updated_at, min_deposit_amount, max_deposit_amount, min_withdrawal_amount, max_withdrawal_amount, wallet_address, qr_code_image_path, instructions, qr_enabled) FROM stdin;
crypto-gateway-001	crypto	Cryptocurrency	crypto	t	{"supportedCurrencies": ["USDT", "BTC", "ETH"], "processingTime": "1-24 hours", "minimumAmount": 10}	2025-08-03 04:50:55.474151	2025-08-17 21:51:02.727	10	500	10	500	Test	qr-code/fd8f7498-4490-4d0d-aeef-ff1ebb542392.png	["Send USDT (TRC20) to the wallet address shown above","The minimum deposit amount is $5.00","Funds will be credited to your account within 10-15 minutes after blockchain confirmation","Make sure to send only USDT on the TRON network (TRC20)","Do not send any other cryptocurrency to this address"]	t
\.


--
-- Data for Name: ref_commissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ref_commissions (id, referrer_id, referred_user_id, order_id, referral_amount, status, referred_user_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rejection_reasons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rejection_reasons (id, reason_text, description, is_active, created_at, updated_at) FROM stdin;
c4f82903-f170-4c26-9376-51b46fcc454d	Insufficient documentation provided	Documents submitted are incomplete or unclear	t	2025-08-03 17:46:45.651428	2025-08-03 17:46:45.651428
c264776d-ce86-42d4-b284-1b919be360e4	Invalid payment method	Payment method does not meet platform requirements	t	2025-08-03 17:46:45.651428	2025-08-03 17:46:45.651428
1cf55440-1751-4d4d-868d-4e623b7a5bd7	Verification failed	Unable to verify provided information	t	2025-08-03 17:46:45.651428	2025-08-03 17:46:45.651428
368209d5-bd26-45e1-bce0-de16fce0801f	Suspicious activity detected	Activity patterns indicate potential fraud	t	2025-08-03 17:46:45.651428	2025-08-03 17:46:45.651428
fd0bfdd7-c34a-4923-8a4d-593dde2fc93e	Account restrictions apply	Account has active restrictions preventing this action	t	2025-08-03 17:46:45.651428	2025-08-03 17:46:45.651428
b64ef411-d650-43fd-bb56-aa73d95437da	Content does not meet guidelines	Submitted content violates platform guidelines	t	2025-08-03 17:46:45.651428	2025-08-03 17:46:45.651428
38a6e0d1-7066-4dcc-aafe-6ee1f03b1d89	Domain quality standards not met	Domain does not meet minimum quality requirements	t	2025-08-03 17:46:45.651428	2025-08-03 17:46:45.651428
e5b6ee4b-3349-48c5-b70b-517f5cfee3a0	Duplicate submission detected	This request has already been submitted	t	2025-08-03 17:46:45.651428	2025-08-03 17:46:45.651428
cc51febc-f58f-49a1-a1e1-17a89ec9de7c	Technical requirements not satisfied	Technical specifications are not met	t	2025-08-03 17:46:45.651428	2025-08-03 17:46:45.651428
9e727d82-002a-40ab-8004-ce27889f11c1	Policy violation identified	Request violates platform policies	t	2025-08-03 17:46:45.651428	2025-08-03 17:46:45.651428
5fb08d25-f066-4113-b180-60ae91285557	Domain contains prohibited content	The submitted domain hosts content that violates our terms of service including adult content, illegal activities, or spam.	t	2025-08-03 17:52:53.720116	2025-08-03 17:52:53.720116
6c46ba8d-16e1-40e0-91fd-449bd73d5adf	Insufficient domain authority	The domain does not meet our minimum authority requirements for link exchanges.	t	2025-08-03 17:52:53.720116	2025-08-03 17:52:53.720116
3b914018-7c3a-40da-bdee-79a7b2393282	Poor content quality	The website content is of poor quality, contains duplicate content, or lacks original value.	t	2025-08-03 17:52:53.720116	2025-08-03 17:52:53.720116
bf0242e9-d4ac-4e1f-9d9a-1c36db7a16a9	Unrelated niche	The domain content is not relevant to our marketplace or target audience.	t	2025-08-03 17:52:53.720116	2025-08-03 17:52:53.720116
051e403f-08cd-4eb1-b0bb-5f2960c79881	Suspicious account activity	Account shows signs of fraudulent or suspicious behavior requiring further verification.	t	2025-08-03 17:52:53.720116	2025-08-03 17:52:53.720116
\.


--
-- Data for Name: security_login_access; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.security_login_access (id, ip_address, attempt_count, last_attempt, locked_until, last_email, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, key, value, description, updated_at) FROM stdin;
c863ce66-4f0a-4694-bbce-4fd37571c5e6	platform_name	Alex APP	Display name for the platform	2025-08-08 10:39:22.539
36f3d3f2-5f7b-4c5a-90b6-063b88dbff9a	minimumSalesPrice	10	Minimum price required for sales listings (USD)	2025-08-03 15:19:21.454177
b88869a2-cf33-489d-afb3-769cc974aaed	Top_Up_Fee	5	Fee for wallet top-up in dollars (5 USDT)	2025-08-17 20:35:48.174542
c03a5e6d-a60e-4e18-bfa8-a5c10d6b507e	Withdrawal_Fee	2	Fee for wallet withdrawal in dollars (2 USDT)	2025-08-17 20:35:48.174542
setting-001	platformFee	5	Platform fee for guest post orders	2025-08-17 21:37:02.982
setting-005	topUpFee	2	Top up fee in cents	2025-08-17 21:37:03.868
setting-006	withdrawalFee	2	Withdrawal fee in dollars	2025-08-17 21:37:04.746
ab3ef47f-1d94-452f-8e0b-171014d7020c	Referral_Commission	5	Referral commission in cents	2025-08-17 22:37:18.813
setting-008	maintenanceMessage	We are currently performing maintenance. Please check back lsssater.	Message to show during maintenance mode	2025-08-04 15:18:26.083
setting-002	maintenanceMode	false	Whether the platform is in maintenance mode	2025-08-04 15:19:20.344
c921d3f2-73f5-4375-b85d-5b15bd59773f	appTimezone	UTC	Application timezone for displaying timestamps	2025-08-03 06:59:07.770062
70c59a6b-a681-4312-900c-eb5e7f321898	adminTimezone	UTC	Admin dashboard timezone setting	2025-08-03 04:24:49.031
79d8252b-01a1-435c-852e-4e1888e4e4e6	antiDdosEnabled	false	Enable/disable Anti-DDoS brute force protection for user login	2025-08-04 22:06:46.364
setting-007	platformFeeType	fixed	Platform fee type: "fixed" or "percentage"	2025-08-03 02:24:26.17
\.


--
-- Data for Name: site_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_categories (id, name, slug, created_at) FROM stdin;
c030ec46-0b03-4159-ac94-12a01b788ec8	Finance	finance	2025-08-03 03:23:50.777878
c39e01ca-d992-4ade-95e7-43ba7dc6ba4c	Healthcare	healthcare	2025-08-03 03:23:50.837751
eea2acdf-fe5d-40d4-8f3f-0fb6df79c688	E-commerce	e-commerce	2025-08-03 03:23:50.897222
53217e2b-2035-4176-b9ab-67d367bd32d7	Education	education	2025-08-03 03:23:50.956789
29a33c4d-7f6c-4a71-82c8-4d41f34c3629	Lifestyle	lifestyle	2025-08-03 03:23:51.017153
32b44059-24bc-4f6e-9e6d-bccea5fecc6f	Design	design	2025-08-03 03:23:51.077185
412923ac-649c-40f5-a5fb-66def1442846	Travel	travel	2025-08-03 03:26:30.594995
517dbadb-669f-4d30-9b96-c95d3351a0ee	Technology	technology	2025-08-07 08:34:55.955346
f7bc5072-58ea-4ba0-adc4-75ebc558a02b	Business	business	2025-08-07 08:34:56.045928
26cbd5da-8060-4788-b230-8e52ce12f472	General	general	2025-08-11 22:25:44.862173
\.


--
-- Data for Name: sites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sites (id, user_id, domain, title, description, category, domain_authority, dr_score, monthly_traffic, language, purpose, price, delivery_time, status, rejection_reason, created_at, updated_at, purchase_count, processed_by, processed_at, approved_by, rejected_by, link_type, casino_allowed) FROM stdin;
f905abfb-1375-4d8f-afee-383df29a1a03	51c56ba2-acc7-41c2-a335-78005235b4d5	site3.com	sample 3	this is a sample	Design	55	48	1545	English	sales	255	3	approved	\N	2025-10-05 07:35:49.537311	2025-10-05 07:36:25.995	0	\N	2025-10-05 07:36:25.995	Approved by admin	\N	dofollow	N/A
01b24243-cda3-4f50-a17a-14fd70a2a2e6	51c56ba2-acc7-41c2-a335-78005235b4d5	site2.com	Site 2	This is a sample only.	Education	55	25	1990	English	sales	15	1	approved	\N	2025-10-05 07:35:27.668301	2025-10-05 07:36:27.007	0	\N	2025-10-05 07:36:27.007	Approved by admin	\N	dofollow	N/A
3ed11a70-d70a-45b3-96ad-3c3acafc025b	51c56ba2-acc7-41c2-a335-78005235b4d5	site.com	Site	Sample	General	55	22	15555	English	sales	10	2	approved	\N	2025-10-05 07:35:01.126261	2025-10-05 07:36:27.702	0	\N	2025-10-05 07:36:27.702	Approved by admin	\N	dofollow	no
bf0a4669-5d0c-4de3-accd-8268732614d0	51c56ba2-acc7-41c2-a335-78005235b4d5	site2.com	My site	Open to Collab.	Lifestyle	25	45	1990	English	exchange	\N	\N	approved	\N	2025-10-05 07:36:14.377907	2025-10-05 07:36:29.582	0	\N	2025-10-05 07:36:29.582	Approved by admin	\N	dofollow	N/A
\.


--
-- Data for Name: smtp_system; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.smtp_system (id, enabled, smtp_host, smtp_port, from_email, from_name, created_at, updated_at, require_email_verification) FROM stdin;
89d6faab-cf0d-43d7-8046-1c647ad7d314	t	smtp.example.com	587	noreply@collabpro.com	CollabPro Team	2025-08-04 21:41:19.622308	2025-08-04 22:15:42.713	f
\.


--
-- Data for Name: social_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.social_links (id, name, url, is_active, created_at) FROM stdin;
fa0b591c-2dd1-4db9-9f17-1454481c8a94	https://www.facebook.com/	https://duteczone.net/	t	2025-08-05 17:43:02.711
\.


--
-- Data for Name: support_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_messages (id, user_id, message, sender, is_read, created_at, ticket_id, subject) FROM stdin;
\.


--
-- Data for Name: support_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_notifications (id, user_id, ticket_id, type, is_read, created_at, metadata) FROM stdin;
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_tickets (id, ticket_number, user_id, subject, description, status, priority, category, created_at, updated_at, closed_at, closed_by) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, user_id, type, amount, description, order_id, created_at, transaction_id) FROM stdin;
\.


--
-- Data for Name: user_deposit_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_deposit_sessions (id, user_id, session_id, wallet_address, qr_code_data, instructions, expires_at, is_active, created_at, updated_at, amount) FROM stdin;
\.


--
-- Data for Name: user_summary_stats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_summary_stats (id, user_id, total_sales, total_purchases, total_exchanges, active_domains, wallet_balance, last_updated) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password, first_name, last_name, company, bio, avatar, status, role, last_login_at, created_at, updated_at, registration_ip, last_login_ip, email_verified, referred_by) FROM stdin;
24d6fc84-8ec2-4c05-88bb-99c0d8deb7a3	admin	admin@admin.com	$2a$12$uC65ItLz/EKrcdsDJcBr7ehP5FhFzz.T7RIBg6ky2u/L0LLJ5L27W	Admin	User	Platform Administration	System administrator	\N	active	admin	2025-10-05 07:34:05.163	2025-08-04 19:44:33.358	2025-10-05 07:34:05.163	192.168.1.100	119.92.14.196	t	\N
7733ebc1-0ea6-4f16-9893-761dcb15c002	demo	demo@demo.com	$2b$12$UE6mWsE.gpIDbIl0DiJzUuux/.8z/WebaQCf5QtYpHYoRIOahYHNm	demo	demo	\N	\N	/uploads/avatars/avatar-unknown-1759650573740-processed.jpg	active	user	\N	2025-10-05 07:36:59.161	2025-10-05 07:49:33.749	119.92.14.196	\N	t	\N
51c56ba2-acc7-41c2-a335-78005235b4d5	demo2	demo2@gmail.com	$2b$12$tV3YavrQlGdw1WPtrjJjcuxHV4uVZRXPwa3ovLj15jvelUlPV6vNy	Demo2	demo2	\N	\N	/uploads/avatars/avatar-unknown-1759650772336-processed.jpg	active	user	2025-10-05 07:52:46.308	2025-10-05 07:34:31.948	2025-10-05 07:52:55.533	119.92.14.196	119.92.14.196	t	\N
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_transactions (id, transaction_id, user_id, type, amount, fee, status, payment_method, withdrawal_method, admin_note, processed_by, processed_at, created_at, updated_at, gateway_id, rejection_reason, approved_by, rejected_by, tx_id) FROM stdin;
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallets (id, user_id, balance, created_at, updated_at) FROM stdin;
d7df92b3-2017-4bae-b755-03770319cad7	51c56ba2-acc7-41c2-a335-78005235b4d5	0	2025-10-05 07:34:31.951353	2025-10-05 07:34:31.95
fe281871-2112-4349-8ecd-28303a9a5e65	7733ebc1-0ea6-4f16-9893-761dcb15c002	0	2025-10-05 07:36:59.163673	2025-10-05 07:36:59.163
\.


--
-- Name: admin_recent_activity admin_recent_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_recent_activity
    ADD CONSTRAINT admin_recent_activity_pkey PRIMARY KEY (id);


--
-- Name: auth_session_store auth_session_store_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_session_store
    ADD CONSTRAINT auth_session_store_pkey PRIMARY KEY (sid);


--
-- Name: banned_emails banned_emails_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banned_emails
    ADD CONSTRAINT banned_emails_email_unique UNIQUE (email);


--
-- Name: banned_emails banned_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banned_emails
    ADD CONSTRAINT banned_emails_pkey PRIMARY KEY (id);


--
-- Name: banned_ips banned_ips_ip_address_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banned_ips
    ADD CONSTRAINT banned_ips_ip_address_unique UNIQUE (ip_address);


--
-- Name: banned_ips banned_ips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banned_ips
    ADD CONSTRAINT banned_ips_pkey PRIMARY KEY (id);


--
-- Name: crypto_txids crypto_txids_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_txids
    ADD CONSTRAINT crypto_txids_pkey PRIMARY KEY (id);


--
-- Name: crypto_txids crypto_txids_tx_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_txids
    ADD CONSTRAINT crypto_txids_tx_id_unique UNIQUE (tx_id);


--
-- Name: email_reminders email_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_reminders
    ADD CONSTRAINT email_reminders_pkey PRIMARY KEY (id);


--
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: email_verification_tokens email_verification_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_token_unique UNIQUE (token);


--
-- Name: exchanges exchanges_order_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchanges
    ADD CONSTRAINT exchanges_order_id_unique UNIQUE (order_id);


--
-- Name: exchanges exchanges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchanges
    ADD CONSTRAINT exchanges_pkey PRIMARY KEY (id);


--
-- Name: fee_records fee_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_records
    ADD CONSTRAINT fee_records_pkey PRIMARY KEY (id);


--
-- Name: finance_settings finance_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_settings
    ADD CONSTRAINT finance_settings_pkey PRIMARY KEY (id);


--
-- Name: global_notifications global_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_notifications
    ADD CONSTRAINT global_notifications_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_id_unique UNIQUE (order_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_unique UNIQUE (token);


--
-- Name: payment_gateways payment_gateways_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateways
    ADD CONSTRAINT payment_gateways_name_unique UNIQUE (name);


--
-- Name: payment_gateways payment_gateways_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateways
    ADD CONSTRAINT payment_gateways_pkey PRIMARY KEY (id);


--
-- Name: ref_commissions ref_commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ref_commissions
    ADD CONSTRAINT ref_commissions_pkey PRIMARY KEY (id);


--
-- Name: rejection_reasons rejection_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rejection_reasons
    ADD CONSTRAINT rejection_reasons_pkey PRIMARY KEY (id);


--
-- Name: security_login_access security_login_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_login_access
    ADD CONSTRAINT security_login_access_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_unique UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: site_categories site_categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_categories
    ADD CONSTRAINT site_categories_name_unique UNIQUE (name);


--
-- Name: site_categories site_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_categories
    ADD CONSTRAINT site_categories_pkey PRIMARY KEY (id);


--
-- Name: site_categories site_categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_categories
    ADD CONSTRAINT site_categories_slug_unique UNIQUE (slug);


--
-- Name: sites sites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_pkey PRIMARY KEY (id);


--
-- Name: smtp_system smtp_system_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smtp_system
    ADD CONSTRAINT smtp_system_pkey PRIMARY KEY (id);


--
-- Name: social_links social_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_links
    ADD CONSTRAINT social_links_pkey PRIMARY KEY (id);


--
-- Name: support_messages support_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_pkey PRIMARY KEY (id);


--
-- Name: support_notifications support_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_notifications
    ADD CONSTRAINT support_notifications_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_ticket_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_ticket_number_unique UNIQUE (ticket_number);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_transaction_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_transaction_id_unique UNIQUE (transaction_id);


--
-- Name: user_deposit_sessions user_deposit_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_deposit_sessions
    ADD CONSTRAINT user_deposit_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_deposit_sessions user_deposit_sessions_session_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_deposit_sessions
    ADD CONSTRAINT user_deposit_sessions_session_id_unique UNIQUE (session_id);


--
-- Name: user_summary_stats user_summary_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_summary_stats
    ADD CONSTRAINT user_summary_stats_pkey PRIMARY KEY (id);


--
-- Name: user_summary_stats user_summary_stats_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_summary_stats
    ADD CONSTRAINT user_summary_stats_user_id_unique UNIQUE (user_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: wallet_transactions wallet_transactions_transaction_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_transaction_id_unique UNIQUE (transaction_id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_unique UNIQUE (user_id);


--
-- Name: banned_emails banned_emails_banned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banned_emails
    ADD CONSTRAINT banned_emails_banned_by_users_id_fk FOREIGN KEY (banned_by) REFERENCES public.users(id);


--
-- Name: banned_ips banned_ips_banned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banned_ips
    ADD CONSTRAINT banned_ips_banned_by_users_id_fk FOREIGN KEY (banned_by) REFERENCES public.users(id);


--
-- Name: crypto_txids crypto_txids_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_txids
    ADD CONSTRAINT crypto_txids_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: crypto_txids crypto_txids_wallet_transaction_id_wallet_transactions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crypto_txids
    ADD CONSTRAINT crypto_txids_wallet_transaction_id_wallet_transactions_id_fk FOREIGN KEY (wallet_transaction_id) REFERENCES public.wallet_transactions(id);


--
-- Name: email_reminders email_reminders_sent_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_reminders
    ADD CONSTRAINT email_reminders_sent_by_users_id_fk FOREIGN KEY (sent_by) REFERENCES public.users(id);


--
-- Name: email_verification_tokens email_verification_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: exchanges exchanges_delivered_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchanges
    ADD CONSTRAINT exchanges_delivered_by_users_id_fk FOREIGN KEY (delivered_by) REFERENCES public.users(id);


--
-- Name: exchanges exchanges_requested_site_id_sites_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchanges
    ADD CONSTRAINT exchanges_requested_site_id_sites_id_fk FOREIGN KEY (requested_site_id) REFERENCES public.sites(id);


--
-- Name: exchanges exchanges_requested_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchanges
    ADD CONSTRAINT exchanges_requested_user_id_users_id_fk FOREIGN KEY (requested_user_id) REFERENCES public.users(id);


--
-- Name: exchanges exchanges_requester_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchanges
    ADD CONSTRAINT exchanges_requester_id_users_id_fk FOREIGN KEY (requester_id) REFERENCES public.users(id);


--
-- Name: exchanges exchanges_requester_site_id_sites_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchanges
    ADD CONSTRAINT exchanges_requester_site_id_sites_id_fk FOREIGN KEY (requester_site_id) REFERENCES public.sites(id);


--
-- Name: listings listings_site_id_sites_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_site_id_sites_id_fk FOREIGN KEY (site_id) REFERENCES public.sites(id);


--
-- Name: listings listings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: messages messages_exchange_id_exchanges_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_exchange_id_exchanges_id_fk FOREIGN KEY (exchange_id) REFERENCES public.exchanges(id);


--
-- Name: messages messages_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: messages messages_read_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_read_by_users_id_fk FOREIGN KEY (read_by) REFERENCES public.users(id);


--
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: orders orders_buyer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_users_id_fk FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- Name: orders orders_listing_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_listing_id_listings_id_fk FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: orders orders_seller_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_seller_id_users_id_fk FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: password_reset_tokens password_reset_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ref_commissions ref_commissions_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ref_commissions
    ADD CONSTRAINT ref_commissions_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: ref_commissions ref_commissions_referred_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ref_commissions
    ADD CONSTRAINT ref_commissions_referred_user_id_users_id_fk FOREIGN KEY (referred_user_id) REFERENCES public.users(id);


--
-- Name: ref_commissions ref_commissions_referrer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ref_commissions
    ADD CONSTRAINT ref_commissions_referrer_id_users_id_fk FOREIGN KEY (referrer_id) REFERENCES public.users(id);


--
-- Name: sites sites_processed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_processed_by_users_id_fk FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: sites sites_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: support_messages support_messages_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: support_notifications support_notifications_ticket_id_support_tickets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_notifications
    ADD CONSTRAINT support_notifications_ticket_id_support_tickets_id_fk FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id);


--
-- Name: support_notifications support_notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_notifications
    ADD CONSTRAINT support_notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: support_tickets support_tickets_closed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_closed_by_users_id_fk FOREIGN KEY (closed_by) REFERENCES public.users(id);


--
-- Name: support_tickets support_tickets_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: transactions transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_deposit_sessions user_deposit_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_deposit_sessions
    ADD CONSTRAINT user_deposit_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_summary_stats user_summary_stats_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_summary_stats
    ADD CONSTRAINT user_summary_stats_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_referred_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referred_by_users_id_fk FOREIGN KEY (referred_by) REFERENCES public.users(id);


--
-- Name: wallet_transactions wallet_transactions_gateway_id_payment_gateways_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_gateway_id_payment_gateways_id_fk FOREIGN KEY (gateway_id) REFERENCES public.payment_gateways(id);


--
-- Name: wallet_transactions wallet_transactions_processed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_processed_by_users_id_fk FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: wallet_transactions wallet_transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: wallets wallets_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 3ChBPInDlRP0y9MAA0Y9gpF0Ouc2Tb74L1KHixMDaEUQUqcAgNLBCT5R9bOhEIe

