--
-- PostgreSQL database dump
--

\restrict Kujfa2WuhdQQG85RqRzgraDxxxUw7sdT2lqBqdVXEn3mgP6UGaT5h17FffXvQqF

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-08-11 10:25:53

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

--
-- TOC entry 5 (class 2615 OID 52749)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 865 (class 1247 OID 52765)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'USER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- TOC entry 868 (class 1247 OID 52770)
-- Name: StatusLaporan; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StatusLaporan" AS ENUM (
    'MENUNGGU',
    'DIPROSES',
    'SELESAI',
    'DITOLAK'
);


ALTER TYPE public."StatusLaporan" OWNER TO postgres;

--
-- TOC entry 871 (class 1247 OID 52780)
-- Name: StatusTransaksi; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StatusTransaksi" AS ENUM (
    'PENDING',
    'SELESAI',
    'BATAL'
);


ALTER TYPE public."StatusTransaksi" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 225 (class 1259 OID 53231)
-- Name: FotoSampah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FotoSampah" (
    id text NOT NULL,
    "laporanId" text NOT NULL,
    "urlFoto" text NOT NULL,
    deskripsi text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FotoSampah" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 52750)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 52805)
-- Name: jenis_sampah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jenis_sampah (
    id text NOT NULL,
    "namaJenis" character varying(50) NOT NULL,
    deskripsi text,
    "hargaPerKg" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "kategoriId" text
);


ALTER TABLE public.jenis_sampah OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 55714)
-- Name: kategori_sampah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kategori_sampah (
    id text NOT NULL,
    nama character varying(50) CONSTRAINT "kategori_sampah_namaKategori_not_null" NOT NULL,
    deskripsi text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.kategori_sampah OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 52831)
-- Name: laporan_sampah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.laporan_sampah (
    id text NOT NULL,
    "userId" text NOT NULL,
    "jenisSampahId" text NOT NULL,
    "wilayahId" text NOT NULL,
    berat double precision DEFAULT 0 NOT NULL,
    deskripsi text,
    "tanggalLapor" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."StatusLaporan" DEFAULT 'MENUNGGU'::public."StatusLaporan" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.laporan_sampah OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 55740)
-- Name: pengumuman; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pengumuman (
    id text NOT NULL,
    judul character varying(255) NOT NULL,
    isi text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pengumuman OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 55726)
-- Name: poin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.poin (
    id text NOT NULL,
    "userId" text NOT NULL,
    "jumlahPoin" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.poin OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 55753)
-- Name: riwayat_laporan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.riwayat_laporan (
    id text NOT NULL,
    "laporanId" text NOT NULL,
    "statusLama" public."StatusLaporan" NOT NULL,
    "statusBaru" public."StatusLaporan" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.riwayat_laporan OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 52864)
-- Name: transaksi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaksi (
    id text NOT NULL,
    "userId" text NOT NULL,
    "laporanId" text NOT NULL,
    "totalHarga" double precision NOT NULL,
    status public."StatusTransaksi" DEFAULT 'PENDING'::public."StatusTransaksi" NOT NULL,
    "tanggalTransaksi" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.transaksi OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 52787)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    nama character varying(100) NOT NULL,
    nik character varying(16) NOT NULL,
    email character varying(100) NOT NULL,
    "noHp" character varying(15) NOT NULL,
    password character varying(255) NOT NULL,
    "fotoProfil" character varying(255),
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    alamat text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 52819)
-- Name: wilayah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wilayah (
    id text NOT NULL,
    "namaWilayah" character varying(100) NOT NULL,
    "kodePos" character varying(10),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.wilayah OWNER TO postgres;

--
-- TOC entry 5121 (class 0 OID 53231)
-- Dependencies: 225
-- Data for Name: FotoSampah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FotoSampah" (id, "laporanId", "urlFoto", deskripsi, "createdAt", "updatedAt") FROM stdin;
1290a464-a39f-4f77-81bb-1934ab9554a4	c529ff19-4402-4746-84e7-3d391aec56b7	/uploads/1786374716293-t30m6zz.jpg	\N	2026-08-10 15:11:56.306	2026-08-10 15:11:56.306
\.


--
-- TOC entry 5115 (class 0 OID 52750)
-- Dependencies: 219
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
dec9f479-783b-4c4e-b53e-4d44f5db28f1	8290ed8852cde9ffe0d4c65c323bdcb0333cb0911c8a2a6ad1e9aa8585e0b11f	2026-08-10 21:13:39.354376+07	20260731015634_init	\N	\N	2026-08-10 21:13:39.282086+07	1
eca9ac09-79f4-4aef-8c9a-8e6ffdb9e313	0134e8be26734d6be8c99dc8df77a4ef18bda95d2b04884b4a7d0c3c6005189c	2026-08-10 21:13:54.059506+07	20260810141353_add_unique_laporan_id_foto	\N	\N	2026-08-10 21:13:54.011992+07	1
e0f5eb55-824b-4b5f-b89e-16a182f9bbfb	e2c6251c0585ac6540759e3795df66ab24be286b3bfdda631624aaabca83562e	2026-08-10 23:42:52.079211+07	20260810164251_add_tables_6_to_10	\N	\N	2026-08-10 23:42:51.910256+07	1
\.


--
-- TOC entry 5117 (class 0 OID 52805)
-- Dependencies: 221
-- Data for Name: jenis_sampah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jenis_sampah (id, "namaJenis", deskripsi, "hargaPerKg", "createdAt", "updatedAt", "kategoriId") FROM stdin;
dbc330c1-bef3-4335-a4d4-4234dbe95a7a	Plastik	Botol, kemasan, kantong plastik	5000	2026-08-10 14:37:39.405	2026-08-10 14:37:39.405	\N
b58d012c-64f5-448a-b634-cdc625973e7b	Kertas	Kertas koran, kardus, kertas kemasan	3000	2026-08-10 14:37:39.414	2026-08-10 14:37:39.414	\N
5ad18b1c-7eb2-4662-aec3-e3ed439e5f71	Logam	Kaleng, logam feris, aluminium	8000	2026-08-10 14:37:39.416	2026-08-10 14:37:39.416	\N
e19b23cc-14e0-4a87-81e0-646fc97980a3	Kaca	Botol kaca, pecahan kaca	4000	2026-08-10 14:37:39.417	2026-08-10 14:37:39.417	\N
af55cb40-1020-4aee-898f-aaaf2d631f49	Organik	Sisa makanan, kulit buah, daun	2000	2026-08-10 14:37:39.419	2026-08-10 14:37:39.419	\N
60d0e1b9-fd3f-437c-ba61-1e4b157e713e	Elektronik	Barang elektronik bekas	10000	2026-08-10 14:37:39.422	2026-08-10 14:37:39.422	\N
a626e3a4-a6ab-45de-9f12-436f156882cf	Nonorganik	Sampah tekstil, sepatu, mainan	1500	2026-08-10 14:37:39.424	2026-08-10 14:37:39.424	\N
49badeb0-1fdd-432f-9313-92507bc7e26c	Residu	Sampah tidak dapat didaur ulang	500	2026-08-10 14:37:39.425	2026-08-10 14:37:39.425	\N
cd37c60f-067f-4fa7-913a-3349b0708f1e	B3	Bahan berbahaya dan beracun	10000	2026-08-10 14:37:39.427	2026-08-10 14:37:39.427	\N
\.


--
-- TOC entry 5122 (class 0 OID 55714)
-- Dependencies: 226
-- Data for Name: kategori_sampah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kategori_sampah (id, nama, deskripsi, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5119 (class 0 OID 52831)
-- Dependencies: 223
-- Data for Name: laporan_sampah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.laporan_sampah (id, "userId", "jenisSampahId", "wilayahId", berat, deskripsi, "tanggalLapor", status, "createdAt", "updatedAt") FROM stdin;
c529ff19-4402-4746-84e7-3d391aec56b7	05fbe446-8000-4972-ab78-43e618dc4947	49badeb0-1fdd-432f-9313-92507bc7e26c	29ed1259-c238-4b18-a86a-99e23e564fff	11	popok & pembalut	2026-08-10 15:11:54.843	MENUNGGU	2026-08-10 15:11:54.843	2026-08-10 15:11:54.843
\.


--
-- TOC entry 5124 (class 0 OID 55740)
-- Dependencies: 228
-- Data for Name: pengumuman; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pengumuman (id, judul, isi, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5123 (class 0 OID 55726)
-- Dependencies: 227
-- Data for Name: poin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.poin (id, "userId", "jumlahPoin", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5125 (class 0 OID 55753)
-- Dependencies: 229
-- Data for Name: riwayat_laporan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.riwayat_laporan (id, "laporanId", "statusLama", "statusBaru", "createdAt", "userId") FROM stdin;
\.


--
-- TOC entry 5120 (class 0 OID 52864)
-- Dependencies: 224
-- Data for Name: transaksi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaksi (id, "userId", "laporanId", "totalHarga", status, "tanggalTransaksi", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5116 (class 0 OID 52787)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nama, nik, email, "noHp", password, "fotoProfil", role, alamat, "createdAt", "updatedAt") FROM stdin;
05fbe446-8000-4972-ab78-43e618dc4947	Adelia	3172406091004	adelias3409@gmail.com	081289916292	$2b$10$0U1OEivgl.BIwqPoVm8oJ.rXV0TUSkkDGB9tZZ6zC/.4Q2jzn9qAK	\N	USER	Rusunawa Penjaringan, Tower B, Jl. Tanah Merah, RT.08/RW.06, Jakarta Utara	2026-08-10 14:18:59.274	2026-08-10 14:18:59.274
7f60f7b7-9237-4ac0-9d1c-c8c32f79445a	Admin RecycleHub	0000000000000000	adminRecycleHub@gmail.com	081234567890	$2b$10$rk66u2si2cvVeA6dXCA9R.ZvUBIyl.s4jQy823D4HfuSAmrr9P8wi	\N	ADMIN	\N	2026-08-10 14:37:39.383	2026-08-10 14:37:39.383
\.


--
-- TOC entry 5118 (class 0 OID 52819)
-- Dependencies: 222
-- Data for Name: wilayah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wilayah (id, "namaWilayah", "kodePos", "createdAt", "updatedAt") FROM stdin;
146d3213-7acc-4f19-b3a0-ecce47639638	Jakarta Pusat	\N	2026-08-10 14:37:39.434	2026-08-10 14:37:39.434
e3637a2b-f453-4df8-80ca-b6cc2f966e48	Jakarta Barat	\N	2026-08-10 14:37:39.439	2026-08-10 14:37:39.439
a8881d30-6b99-4265-b9b9-5a62b62bcaeb	Jakarta Selatan	\N	2026-08-10 14:37:39.442	2026-08-10 14:37:39.442
f9d31bff-43aa-4aa4-906f-fc912e0a8103	Jakarta Timur	\N	2026-08-10 14:37:39.445	2026-08-10 14:37:39.445
24cb3ddc-d62c-4951-bb76-4bf57f3b1e50	Jakarta Utara	\N	2026-08-10 14:37:39.447	2026-08-10 14:37:39.447
dcfd03fc-ce46-4ced-9271-82160ca15409	Bandung	\N	2026-08-10 14:37:39.45	2026-08-10 14:37:39.45
79254dc9-c51f-4efb-9aab-f727f4df4675	Cirebon	\N	2026-08-10 14:37:39.453	2026-08-10 14:37:39.453
ccbdf60f-f09b-4fb1-98d7-2cf6534c43b4	Sumedang	\N	2026-08-10 14:37:39.456	2026-08-10 14:37:39.456
7d248b16-ae2e-4a1b-ad48-3c6959888a51	Sleman, D.I. Yogyakarta	\N	2026-08-10 14:37:39.46	2026-08-10 14:37:39.46
29ed1259-c238-4b18-a86a-99e23e564fff	Bantul, D.I. Yogyakarta	\N	2026-08-10 14:37:39.463	2026-08-10 14:37:39.463
e511558a-6bef-4666-8d76-ec22a4c26f0d	Surabaya	\N	2026-08-10 14:37:39.466	2026-08-10 14:37:39.466
d014e2b4-b997-4ebe-bc79-09b928d976a7	Bogor	\N	2026-08-10 14:37:39.47	2026-08-10 14:37:39.47
e25bcb75-7f25-4e65-b2ed-74040fb990e5	Depok	\N	2026-08-10 14:37:39.475	2026-08-10 14:37:39.475
\.


--
-- TOC entry 4945 (class 2606 OID 53243)
-- Name: FotoSampah FotoSampah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FotoSampah"
    ADD CONSTRAINT "FotoSampah_pkey" PRIMARY KEY (id);


--
-- TOC entry 4925 (class 2606 OID 52763)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4933 (class 2606 OID 52818)
-- Name: jenis_sampah jenis_sampah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jenis_sampah
    ADD CONSTRAINT jenis_sampah_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 56768)
-- Name: kategori_sampah kategori_sampah_nama_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategori_sampah
    ADD CONSTRAINT kategori_sampah_nama_key UNIQUE (nama);


--
-- TOC entry 4949 (class 2606 OID 55725)
-- Name: kategori_sampah kategori_sampah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategori_sampah
    ADD CONSTRAINT kategori_sampah_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 52850)
-- Name: laporan_sampah laporan_sampah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan_sampah
    ADD CONSTRAINT laporan_sampah_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 55752)
-- Name: pengumuman pengumuman_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pengumuman
    ADD CONSTRAINT pengumuman_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 55739)
-- Name: poin poin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poin
    ADD CONSTRAINT poin_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 56770)
-- Name: poin poin_userId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poin
    ADD CONSTRAINT "poin_userId_key" UNIQUE ("userId");


--
-- TOC entry 4957 (class 2606 OID 55765)
-- Name: riwayat_laporan riwayat_laporan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.riwayat_laporan
    ADD CONSTRAINT riwayat_laporan_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 56772)
-- Name: transaksi transaksi_laporanId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi
    ADD CONSTRAINT "transaksi_laporanId_key" UNIQUE ("laporanId");


--
-- TOC entry 4942 (class 2606 OID 52881)
-- Name: transaksi transaksi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi
    ADD CONSTRAINT transaksi_pkey PRIMARY KEY (id);


--
-- TOC entry 4930 (class 2606 OID 52804)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4936 (class 2606 OID 52830)
-- Name: wilayah wilayah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wilayah
    ADD CONSTRAINT wilayah_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 1259 OID 53244)
-- Name: FotoSampah_laporanId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FotoSampah_laporanId_key" ON public."FotoSampah" USING btree ("laporanId");


--
-- TOC entry 4931 (class 1259 OID 52885)
-- Name: jenis_sampah_namaJenis_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "jenis_sampah_namaJenis_key" ON public.jenis_sampah USING btree ("namaJenis");


--
-- TOC entry 4926 (class 1259 OID 52883)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 4927 (class 1259 OID 52882)
-- Name: users_nik_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_nik_key ON public.users USING btree (nik);


--
-- TOC entry 4928 (class 1259 OID 52884)
-- Name: users_noHp_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_noHp_key" ON public.users USING btree ("noHp");


--
-- TOC entry 4934 (class 1259 OID 52886)
-- Name: wilayah_namaWilayah_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "wilayah_namaWilayah_key" ON public.wilayah USING btree ("namaWilayah");


--
-- TOC entry 4964 (class 2606 OID 53245)
-- Name: FotoSampah FotoSampah_laporanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FotoSampah"
    ADD CONSTRAINT "FotoSampah_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES public.laporan_sampah(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4958 (class 2606 OID 55768)
-- Name: jenis_sampah jenis_sampah_kategoriId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jenis_sampah
    ADD CONSTRAINT "jenis_sampah_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES public.kategori_sampah(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4959 (class 2606 OID 52894)
-- Name: laporan_sampah laporan_sampah_jenisSampahId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan_sampah
    ADD CONSTRAINT "laporan_sampah_jenisSampahId_fkey" FOREIGN KEY ("jenisSampahId") REFERENCES public.jenis_sampah(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4960 (class 2606 OID 52889)
-- Name: laporan_sampah laporan_sampah_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan_sampah
    ADD CONSTRAINT "laporan_sampah_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4961 (class 2606 OID 52899)
-- Name: laporan_sampah laporan_sampah_wilayahId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan_sampah
    ADD CONSTRAINT "laporan_sampah_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES public.wilayah(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4965 (class 2606 OID 55773)
-- Name: poin poin_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.poin
    ADD CONSTRAINT "poin_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4966 (class 2606 OID 55778)
-- Name: riwayat_laporan riwayat_laporan_laporanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.riwayat_laporan
    ADD CONSTRAINT "riwayat_laporan_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES public.laporan_sampah(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4967 (class 2606 OID 56759)
-- Name: riwayat_laporan riwayat_laporan_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.riwayat_laporan
    ADD CONSTRAINT "riwayat_laporan_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4962 (class 2606 OID 52914)
-- Name: transaksi transaksi_laporanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi
    ADD CONSTRAINT "transaksi_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES public.laporan_sampah(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4963 (class 2606 OID 52909)
-- Name: transaksi transaksi_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaksi
    ADD CONSTRAINT "transaksi_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-08-11 10:25:54

--
-- PostgreSQL database dump complete
--

\unrestrict Kujfa2WuhdQQG85RqRzgraDxxxUw7sdT2lqBqdVXEn3mgP6UGaT5h17FffXvQqF

