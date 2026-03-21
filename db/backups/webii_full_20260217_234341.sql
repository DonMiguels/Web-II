--
-- PostgreSQL database dump
--

\restrict 1i325fR1nsR1f3izj5PAsehxWekbRUHgwmi0dlhTZJOJcQjccb8dC6l5axYhLVn

-- Dumped from database version 16.12 (Debian 16.12-1.pgdg13+1)
-- Dumped by pg_dump version 16.12 (Debian 16.12-1.pgdg13+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.audit (
    audit_id integer NOT NULL,
    audit_table character varying(100),
    audit_action character varying(50),
    audit_date date,
    audit_time time without time zone,
    audit_details text,
    user_id integer
);


ALTER TABLE public.audit OWNER TO webii_user;

--
-- Name: audit_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.audit_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_audit_id_seq OWNER TO webii_user;

--
-- Name: audit_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.audit_audit_id_seq OWNED BY public.audit.audit_id;


--
-- Name: category; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.category (
    category_id integer NOT NULL,
    category_name character varying(100) NOT NULL,
    category_type_id integer
);


ALTER TABLE public.category OWNER TO webii_user;

--
-- Name: category_category_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.category_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.category_category_id_seq OWNER TO webii_user;

--
-- Name: category_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.category_category_id_seq OWNED BY public.category.category_id;


--
-- Name: category_type; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.category_type (
    category_type_id integer NOT NULL,
    category_type_name character varying(100) NOT NULL
);


ALTER TABLE public.category_type OWNER TO webii_user;

--
-- Name: category_type_category_type_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.category_type_category_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.category_type_category_type_id_seq OWNER TO webii_user;

--
-- Name: category_type_category_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.category_type_category_type_id_seq OWNED BY public.category_type.category_type_id;


--
-- Name: feature; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.feature (
    feature_id integer NOT NULL,
    feature_name character varying(100) NOT NULL
);


ALTER TABLE public.feature OWNER TO webii_user;

--
-- Name: feature_feature_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.feature_feature_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feature_feature_id_seq OWNER TO webii_user;

--
-- Name: feature_feature_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.feature_feature_id_seq OWNED BY public.feature.feature_id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.inventory (
    inventory_id integer NOT NULL,
    inventory_quantity integer NOT NULL,
    inventory_update_date timestamp without time zone,
    location_id integer,
    item_id integer
);


ALTER TABLE public.inventory OWNER TO webii_user;

--
-- Name: inventory_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.inventory_inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_inventory_id_seq OWNER TO webii_user;

--
-- Name: inventory_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.inventory_inventory_id_seq OWNED BY public.inventory.inventory_id;


--
-- Name: item; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.item (
    item_id integer NOT NULL,
    item_code character varying(50) NOT NULL,
    item_name character varying(100) NOT NULL,
    item_cost numeric(12,2),
    item_acquisition_date date,
    category_id integer
);


ALTER TABLE public.item OWNER TO webii_user;

--
-- Name: item_feature; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.item_feature (
    item_feature_id integer NOT NULL,
    item_feature_value character varying(100),
    feature_id integer,
    item_id integer
);


ALTER TABLE public.item_feature OWNER TO webii_user;

--
-- Name: item_feature_item_feature_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.item_feature_item_feature_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_feature_item_feature_id_seq OWNER TO webii_user;

--
-- Name: item_feature_item_feature_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.item_feature_item_feature_id_seq OWNED BY public.item_feature.item_feature_id;


--
-- Name: item_item_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.item_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_item_id_seq OWNER TO webii_user;

--
-- Name: item_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.item_item_id_seq OWNED BY public.item.item_id;


--
-- Name: location; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.location (
    location_id integer NOT NULL,
    location_name character varying(100) NOT NULL,
    location_building character varying(100),
    location_room character varying(100),
    location_shelf character varying(100),
    location_drawer character varying(100)
);


ALTER TABLE public.location OWNER TO webii_user;

--
-- Name: location_location_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.location_location_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_location_id_seq OWNER TO webii_user;

--
-- Name: location_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.location_location_id_seq OWNED BY public.location.location_id;


--
-- Name: movement; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.movement (
    movement_id integer NOT NULL,
    movement_start_date timestamp without time zone,
    movement_reserve_limit_date timestamp without time zone,
    movement_estimated_return_date timestamp without time zone,
    movement_actual_return_date timestamp without time zone,
    movement_observations text,
    user_id integer,
    movement_type_id integer,
    period_id integer
);


ALTER TABLE public.movement OWNER TO webii_user;

--
-- Name: movement_detail; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.movement_detail (
    movement_detail_id integer NOT NULL,
    movement_detail_quantity integer,
    movement_detail_observations text,
    movement_detail_fine numeric(12,2),
    inventory_id integer,
    movement_id integer
);


ALTER TABLE public.movement_detail OWNER TO webii_user;

--
-- Name: movement_detail_movement_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.movement_detail_movement_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movement_detail_movement_detail_id_seq OWNER TO webii_user;

--
-- Name: movement_detail_movement_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.movement_detail_movement_detail_id_seq OWNED BY public.movement_detail.movement_detail_id;


--
-- Name: movement_movement_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.movement_movement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movement_movement_id_seq OWNER TO webii_user;

--
-- Name: movement_movement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.movement_movement_id_seq OWNED BY public.movement.movement_id;


--
-- Name: movement_type; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.movement_type (
    movement_type_id integer NOT NULL,
    movement_type_name character varying(100) NOT NULL
);


ALTER TABLE public.movement_type OWNER TO webii_user;

--
-- Name: movement_type_movement_type_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.movement_type_movement_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movement_type_movement_type_id_seq OWNER TO webii_user;

--
-- Name: movement_type_movement_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.movement_type_movement_type_id_seq OWNED BY public.movement_type.movement_type_id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.notification (
    notification_id integer NOT NULL,
    notification_type character varying(50),
    notification_priority character varying(50),
    notification_title character varying(100),
    notification_message text,
    notification_date timestamp without time zone,
    user_id integer
);


ALTER TABLE public.notification OWNER TO webii_user;

--
-- Name: notification_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.notification_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_notification_id_seq OWNER TO webii_user;

--
-- Name: notification_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.notification_notification_id_seq OWNED BY public.notification.notification_id;


--
-- Name: period; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.period (
    period_id integer NOT NULL,
    period_name character varying(100) NOT NULL,
    period_active boolean
);


ALTER TABLE public.period OWNER TO webii_user;

--
-- Name: period_period_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.period_period_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.period_period_id_seq OWNER TO webii_user;

--
-- Name: period_period_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.period_period_id_seq OWNED BY public.period.period_id;


--
-- Name: person; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.person (
    person_id integer NOT NULL,
    person_id_number character varying(20) NOT NULL,
    person_first_name character varying(100) NOT NULL,
    person_last_name character varying(100) NOT NULL,
    person_email character varying(100),
    person_phone character varying(20),
    person_career character varying(100)
);


ALTER TABLE public.person OWNER TO webii_user;

--
-- Name: person_person_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.person_person_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.person_person_id_seq OWNER TO webii_user;

--
-- Name: person_person_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.person_person_id_seq OWNED BY public.person.person_id;


--
-- Name: return_status; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public.return_status (
    return_status_id integer NOT NULL,
    return_status_name character varying(100),
    return_status_date timestamp without time zone,
    return_status_observations text,
    movement_detail_id integer
);


ALTER TABLE public.return_status OWNER TO webii_user;

--
-- Name: return_status_return_status_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.return_status_return_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.return_status_return_status_id_seq OWNER TO webii_user;

--
-- Name: return_status_return_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.return_status_return_status_id_seq OWNED BY public.return_status.return_status_id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: webii_user
--

CREATE TABLE public."user" (
    user_id integer NOT NULL,
    user_name character varying(100) NOT NULL,
    user_password character varying(100) NOT NULL,
    person_id integer
);


ALTER TABLE public."user" OWNER TO webii_user;

--
-- Name: user_user_id_seq; Type: SEQUENCE; Schema: public; Owner: webii_user
--

CREATE SEQUENCE public.user_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_user_id_seq OWNER TO webii_user;

--
-- Name: user_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: webii_user
--

ALTER SEQUENCE public.user_user_id_seq OWNED BY public."user".user_id;


--
-- Name: audit audit_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.audit ALTER COLUMN audit_id SET DEFAULT nextval('public.audit_audit_id_seq'::regclass);


--
-- Name: category category_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.category ALTER COLUMN category_id SET DEFAULT nextval('public.category_category_id_seq'::regclass);


--
-- Name: category_type category_type_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.category_type ALTER COLUMN category_type_id SET DEFAULT nextval('public.category_type_category_type_id_seq'::regclass);


--
-- Name: feature feature_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.feature ALTER COLUMN feature_id SET DEFAULT nextval('public.feature_feature_id_seq'::regclass);


--
-- Name: inventory inventory_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.inventory ALTER COLUMN inventory_id SET DEFAULT nextval('public.inventory_inventory_id_seq'::regclass);


--
-- Name: item item_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.item ALTER COLUMN item_id SET DEFAULT nextval('public.item_item_id_seq'::regclass);


--
-- Name: item_feature item_feature_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.item_feature ALTER COLUMN item_feature_id SET DEFAULT nextval('public.item_feature_item_feature_id_seq'::regclass);


--
-- Name: location location_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.location ALTER COLUMN location_id SET DEFAULT nextval('public.location_location_id_seq'::regclass);


--
-- Name: movement movement_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.movement ALTER COLUMN movement_id SET DEFAULT nextval('public.movement_movement_id_seq'::regclass);


--
-- Name: movement_detail movement_detail_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.movement_detail ALTER COLUMN movement_detail_id SET DEFAULT nextval('public.movement_detail_movement_detail_id_seq'::regclass);


--
-- Name: movement_type movement_type_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.movement_type ALTER COLUMN movement_type_id SET DEFAULT nextval('public.movement_type_movement_type_id_seq'::regclass);


--
-- Name: notification notification_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.notification ALTER COLUMN notification_id SET DEFAULT nextval('public.notification_notification_id_seq'::regclass);


--
-- Name: period period_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.period ALTER COLUMN period_id SET DEFAULT nextval('public.period_period_id_seq'::regclass);


--
-- Name: person person_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.person ALTER COLUMN person_id SET DEFAULT nextval('public.person_person_id_seq'::regclass);


--
-- Name: return_status return_status_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.return_status ALTER COLUMN return_status_id SET DEFAULT nextval('public.return_status_return_status_id_seq'::regclass);


--
-- Name: user user_id; Type: DEFAULT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public."user" ALTER COLUMN user_id SET DEFAULT nextval('public.user_user_id_seq'::regclass);


--
-- Data for Name: audit; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.audit (audit_id, audit_table, audit_action, audit_date, audit_time, audit_details, user_id) FROM stdin;
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.category (category_id, category_name, category_type_id) FROM stdin;
1	Laptops	1
2	Desktops	1
3	Tablets	1
4	Monitors	1
5	Keyboards	3
6	Mouses	3
7	Textbooks	4
8	Reference Books	4
9	Software Licenses	5
\.


--
-- Data for Name: category_type; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.category_type (category_type_id, category_type_name) FROM stdin;
1	Equipment
2	Materials
3	Tools
4	Books
5	Software
\.


--
-- Data for Name: feature; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.feature (feature_id, feature_name) FROM stdin;
1	Brand
2	Model
3	Series
4	Color
5	Capacity
6	Speed
7	Condition
8	Warranty
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.inventory (inventory_id, inventory_quantity, inventory_update_date, location_id, item_id) FROM stdin;
1	10	2026-02-18 02:01:46.311571	1	1
2	15	2026-02-18 02:01:46.311571	1	2
3	8	2026-02-18 02:01:46.311571	2	3
4	20	2026-02-18 02:01:46.311571	1	4
5	5	2026-02-18 02:01:46.311571	5	5
\.


--
-- Data for Name: item; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.item (item_id, item_code, item_name, item_cost, item_acquisition_date, category_id) FROM stdin;
1	LAP001	Laptop Dell XPS 15	1500.00	2024-01-15	1
2	LAP002	Laptop HP Pavilion	800.00	2024-02-20	1
3	MON001	Monitor LG 27"	300.00	2024-01-10	4
4	KEY001	Mechanical Keyboard RGB	120.00	2024-03-01	5
5	LIB001	Differential Calculus	45.00	2024-01-05	7
\.


--
-- Data for Name: item_feature; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.item_feature (item_feature_id, item_feature_value, feature_id, item_id) FROM stdin;
1	Dell	1	1
2	XPS 15	2	1
3	HP	1	2
4	Pavilion	2	2
5	LG	1	3
6	27 inches	2	3
\.


--
-- Data for Name: location; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.location (location_id, location_name, location_building, location_room, location_shelf, location_drawer) FROM stdin;
1	Main Warehouse	Building A	101	A1	\N
2	Laboratory 1	Building B	201	B1	\N
3	Laboratory 2	Building B	202	B2	\N
4	Faculty Room	Building C	301	C1	\N
5	Library	Building D	401	D1	\N
\.


--
-- Data for Name: movement; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.movement (movement_id, movement_start_date, movement_reserve_limit_date, movement_estimated_return_date, movement_actual_return_date, movement_observations, user_id, movement_type_id, period_id) FROM stdin;
\.


--
-- Data for Name: movement_detail; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.movement_detail (movement_detail_id, movement_detail_quantity, movement_detail_observations, movement_detail_fine, inventory_id, movement_id) FROM stdin;
\.


--
-- Data for Name: movement_type; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.movement_type (movement_type_id, movement_type_name) FROM stdin;
1	Loan
2	Return
3	Maintenance
4	Transfer
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.notification (notification_id, notification_type, notification_priority, notification_title, notification_message, notification_date, user_id) FROM stdin;
\.


--
-- Data for Name: period; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.period (period_id, period_name, period_active) FROM stdin;
1	2024-1	t
2	2024-2	f
3	2025-1	f
4	2025-2	f
\.


--
-- Data for Name: person; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.person (person_id, person_id_number, person_first_name, person_last_name, person_email, person_phone, person_career) FROM stdin;
1	12345678	Juan	Pérez	juan.perez@universidad.edu	555-0101	Engineering
2	87654321	María	González	maria.gonzalez@universidad.edu	555-0102	Architecture
3	13579246	Carlos	Rodríguez	carlos.rodriguez@universidad.edu	555-0103	Medicine
\.


--
-- Data for Name: return_status; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public.return_status (return_status_id, return_status_name, return_status_date, return_status_observations, movement_detail_id) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: webii_user
--

COPY public."user" (user_id, user_name, user_password, person_id) FROM stdin;
1	jperez	\\\\\\.X.TjvhkYFFyWpMlhCsshrU5qC/yMqwW	1
3	crodriguez	\\\\\\/gX9X63jTnX7.QmnyeRL1pcYVVPKfSmdGA23cD/8plXG	3
\.


--
-- Name: audit_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.audit_audit_id_seq', 1, false);


--
-- Name: category_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.category_category_id_seq', 9, true);


--
-- Name: category_type_category_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.category_type_category_type_id_seq', 5, true);


--
-- Name: feature_feature_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.feature_feature_id_seq', 8, true);


--
-- Name: inventory_inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.inventory_inventory_id_seq', 5, true);


--
-- Name: item_feature_item_feature_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.item_feature_item_feature_id_seq', 6, true);


--
-- Name: item_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.item_item_id_seq', 5, true);


--
-- Name: location_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.location_location_id_seq', 5, true);


--
-- Name: movement_detail_movement_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.movement_detail_movement_detail_id_seq', 1, false);


--
-- Name: movement_movement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.movement_movement_id_seq', 1, false);


--
-- Name: movement_type_movement_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.movement_type_movement_type_id_seq', 4, true);


--
-- Name: notification_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.notification_notification_id_seq', 1, false);


--
-- Name: period_period_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.period_period_id_seq', 4, true);


--
-- Name: person_person_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.person_person_id_seq', 3, true);


--
-- Name: return_status_return_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.return_status_return_status_id_seq', 1, false);


--
-- Name: user_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: webii_user
--

SELECT pg_catalog.setval('public.user_user_id_seq', 3, true);


--
-- Name: audit audit_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.audit
    ADD CONSTRAINT audit_pkey PRIMARY KEY (audit_id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);


--
-- Name: category_type category_type_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.category_type
    ADD CONSTRAINT category_type_pkey PRIMARY KEY (category_type_id);


--
-- Name: feature feature_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.feature
    ADD CONSTRAINT feature_pkey PRIMARY KEY (feature_id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (inventory_id);


--
-- Name: item_feature item_feature_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.item_feature
    ADD CONSTRAINT item_feature_pkey PRIMARY KEY (item_feature_id);


--
-- Name: item item_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (item_id);


--
-- Name: location location_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (location_id);


--
-- Name: movement_detail movement_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.movement_detail
    ADD CONSTRAINT movement_detail_pkey PRIMARY KEY (movement_detail_id);


--
-- Name: movement movement_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.movement
    ADD CONSTRAINT movement_pkey PRIMARY KEY (movement_id);


--
-- Name: movement_type movement_type_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.movement_type
    ADD CONSTRAINT movement_type_pkey PRIMARY KEY (movement_type_id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (notification_id);


--
-- Name: period period_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.period
    ADD CONSTRAINT period_pkey PRIMARY KEY (period_id);


--
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (person_id);


--
-- Name: return_status return_status_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.return_status
    ADD CONSTRAINT return_status_pkey PRIMARY KEY (return_status_id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (user_id);


--
-- Name: audit audit_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.audit
    ADD CONSTRAINT audit_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id);


--
-- Name: category category_category_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_category_type_id_fkey FOREIGN KEY (category_type_id) REFERENCES public.category_type(category_type_id);


--
-- Name: inventory inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item(item_id);


--
-- Name: inventory inventory_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.location(location_id);


--
-- Name: item item_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(category_id);


--
-- Name: item_feature item_feature_feature_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.item_feature
    ADD CONSTRAINT item_feature_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.feature(feature_id);


--
-- Name: item_feature item_feature_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.item_feature
    ADD CONSTRAINT item_feature_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item(item_id);


--
-- Name: movement_detail movement_detail_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.movement_detail
    ADD CONSTRAINT movement_detail_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(inventory_id);


--
-- Name: movement_detail movement_detail_movement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.movement_detail
    ADD CONSTRAINT movement_detail_movement_id_fkey FOREIGN KEY (movement_id) REFERENCES public.movement(movement_id);


--
-- Name: movement movement_movement_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.movement
    ADD CONSTRAINT movement_movement_type_id_fkey FOREIGN KEY (movement_type_id) REFERENCES public.movement_type(movement_type_id);


--
-- Name: movement movement_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.movement
    ADD CONSTRAINT movement_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.period(period_id);


--
-- Name: movement movement_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.movement
    ADD CONSTRAINT movement_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id);


--
-- Name: notification notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(user_id);


--
-- Name: return_status return_status_movement_detail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public.return_status
    ADD CONSTRAINT return_status_movement_detail_id_fkey FOREIGN KEY (movement_detail_id) REFERENCES public.movement_detail(movement_detail_id);


--
-- Name: user user_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: webii_user
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.person(person_id);


--
-- PostgreSQL database dump complete
--

\unrestrict 1i325fR1nsR1f3izj5PAsehxWekbRUHgwmi0dlhTZJOJcQjccb8dC6l5axYhLVn

