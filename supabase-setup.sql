-- ============================================================
-- NEXUS PRIVATE DASHBOARD - FULL SUPABASE SETUP
-- Run this entire file in the Supabase SQL Editor (New query).
-- This is destructive - it drops and recreates everything.
-- Run in a fresh project or when you want a full reset.
-- ============================================================


-- ============================================================
-- 1. DROP EXISTING TABLES (clean slate)
-- ============================================================

drop table if exists streak_logs cascade;
drop table if exists streaks cascade;
drop table if exists health_nutrition cascade;
drop table if exists health_workouts cascade;
drop table if exists health_sections cascade;
drop table if exists notes cascade;
drop table if exists course_modules cascade;
drop table if exists config cascade;
drop table if exists assessments cascade;
drop table if exists modules cascade;
drop table if exists applications cascade;
drop table if exists vault cascade;
drop table if exists wishlist cascade;
drop table if exists diary cascade;
drop table if exists goals cascade;
drop table if exists inventory_items cascade;
drop table if exists tech_devices cascade;


-- ============================================================
-- 2. TABLES
-- ============================================================

-- Goals
create table goals (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  title       text not null,
  description text,
  category    text default 'Personal',
  status      text default 'not_started',
  target_date date,
  progress    int default 0
);

-- Modules
create table modules (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name       text not null,
  code       text,
  credits    int,
  year       int,
  semester   int,
  status     text default 'ongoing',
  summary    text,
  rules      text
);

-- Assessments
create table assessments (
  id             uuid primary key default gen_random_uuid(),
  module_id      uuid references modules(id) on delete cascade,
  name           text not null,
  type           text,
  weight_percent int,
  mark_achieved  numeric,
  mark_max       numeric default 100,
  target_mark    numeric,
  date           date,
  week           text,
  is_pass_fail   boolean default false,
  my_notes       text
);

-- Applications (combined internships, placements, jobs and scraped listings)
create table applications (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz default now(),
  company               text not null,
  role                  text not null,
  type                  text default 'internship',
  applied_date          date,
  deadline              date,
  status                text default 'scraped',
  notes                 text,
  url                   text,
  starred               boolean default false,
  salary_range          text,
  location              text,
  work_mode             text,
  source                text,
  opening_date          date,
  last_year_opening     date,
  housing_location      text,
  cv_required           text,
  cover_letter_required text,
  written_answers       text,
  sponsors_visa         text,
  category              text default 'Software Engineering'
);

-- Vault (Bitwarden-like password manager)
create table vault (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text not null,
  type        text default 'account',
  username    text,
  email       text,
  password    text,
  url         text,
  totp_secret text,
  card_number text,
  card_holder text,
  card_expiry text,
  phone       text,
  address     text,
  key_name    text,
  key_value   text,
  key_expiry  date,
  content     text,
  notes       text,
  fields      jsonb default '{}'
);

-- Wishlist
create table wishlist (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name       text not null,
  category   text not null,
  status     text default 'wanted',
  priority   text default 'medium',
  notes      text
);

-- Diary
create table diary (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title      text not null,
  content    text not null,
  mood       text
);

-- Notes (markdown, folders, tags, per-note lock)
create table notes (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title      text not null,
  content    text default '',
  folder     text default 'General',
  tags       text[] default '{}',
  pinned     boolean default false,
  locked     boolean default false,
  color      text
);

-- Streaks
create table streaks (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text not null,
  icon        text default '🔥',
  description text,
  color       text default '#6366f1',
  active      boolean default true,
  order_index int default 0
);

-- Streak logs (one row per streak per day)
create table streak_logs (
  id        uuid primary key default gen_random_uuid(),
  streak_id uuid references streaks(id) on delete cascade,
  date      date not null,
  completed boolean default true,
  unique(streak_id, date)
);

-- Health sections (Gym, Nutrition, Running, Cardio, etc.)
create table health_sections (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  name        text not null,
  type        text not null default 'gym',
  icon        text default '💪',
  color       text default '#6366f1',
  order_index int default 0,
  active      boolean default true
);

-- Health workouts (day cards within a section)
create table health_workouts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  section_id  uuid references health_sections(id) on delete cascade,
  day_label   text not null,
  exercises   jsonb default '[]',
  notes       text,
  order_index int default 0
);

-- Health nutrition (meal categories with items and rules)
create table health_nutrition (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  category    text not null,
  items       jsonb default '[]',
  rules       text[] default '{}',
  order_index int default 0
);

-- Config (flexible key-value store for editable page content)
create table config (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  value      jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Course modules (from programme spec, fully editable)
create table course_modules (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  stage          text not null,
  section        text,
  code           text not null,
  title          text not null,
  credits        int,
  level          int,
  core_or_option text default 'Core',
  condonable     boolean default false,
  prerequisites  text,
  order_index    int default 0
);

-- Inventory items (tech devices, equipment, gaming, instruments, etc.)
create table inventory_items (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz default now(),
  name           text not null,
  category       text not null default 'Tech and Devices',
  quantity       int default 1,
  description    text,
  purchase_date  date,
  price_paid     text,
  serial_number  text,
  notes          text,
  warranty_expiry date
);


-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

alter table goals            enable row level security;
alter table modules          enable row level security;
alter table assessments      enable row level security;
alter table applications     enable row level security;
alter table vault            enable row level security;
alter table wishlist         enable row level security;
alter table diary            enable row level security;
alter table notes            enable row level security;
alter table streaks          enable row level security;
alter table streak_logs      enable row level security;
alter table health_sections  enable row level security;
alter table health_workouts  enable row level security;
alter table health_nutrition enable row level security;
alter table config           enable row level security;
alter table course_modules   enable row level security;
alter table inventory_items  enable row level security;


-- ============================================================
-- 4. RLS POLICIES (allow all - single user, protected by NextAuth)
-- ============================================================

create policy "allow all" on goals            for all using (true);
create policy "allow all" on modules          for all using (true);
create policy "allow all" on assessments      for all using (true);
create policy "allow all" on applications     for all using (true);
create policy "allow all" on vault            for all using (true);
create policy "allow all" on wishlist         for all using (true);
create policy "allow all" on diary            for all using (true);
create policy "allow all" on notes            for all using (true);
create policy "allow all" on streaks          for all using (true);
create policy "allow all" on streak_logs      for all using (true);
create policy "allow all" on health_sections  for all using (true);
create policy "allow all" on health_workouts  for all using (true);
create policy "allow all" on health_nutrition for all using (true);
create policy "allow all" on config           for all using (true);
create policy "allow all" on course_modules   for all using (true);
create policy "allow all" on inventory_items  for all using (true);


-- ============================================================
-- 5. SEED - YEAR 1 MODULES AND ASSESSMENTS
-- ============================================================

with ins as (
  insert into modules (code, name, credits, year, semester, status, summary) values
    ('DG1AID', 'Foundations of AI and Data Science', 15, 1, 2, 'complete',
     'Introduces foundational concepts in AI and Data Science. Topics include mathematical foundations for AI, data science fundamentals, algorithmic problem solving and machine learning including artificial neural networks. Assessment is via 4 computer-based quizzes - each quiz must achieve 80% or more to pass.'),
    ('DG1IAD', 'Internet Applications and Database Design', 15, 1, 2, 'complete',
     'Teaches students to design, develop and deploy database-driven web applications. Topics include client-side development (HTML, CSS, JavaScript), database design and SQL and server-side development with PHP, Laravel and Node.js. Assessment: 3 quizzes (30% total) and 3 portfolios (70% total).'),
    ('DG1IPD', 'Introductory Programming and Development', 15, 1, 1, 'complete',
     'Introduces programming fundamentals using Python. Topics include data types, control structures, functions, file handling, exception handling and OOP basics. Assessment: 2 courseworks (50% each). Labs are for practice and do not count toward module mark but are shown in charts for tracking.'),
    ('EI1EL1', 'Electronics 1', 15, 1, 1, 'complete',
     'Provides foundational knowledge in electronic circuits and systems. Topics include circuit analysis, semiconductor devices, operational amplifiers and digital electronics. Assessment: 6 Lab Sessions (30% total, 5% each) and 2 Class Tests (70% total, 35% each). Attendance and practice do not count.'),
    ('EI1EL2', 'Electronics 2', 15, 1, 2, 'complete',
     'Builds on Electronics 1 covering advanced topics including audio amplifier design and signal processing. The major project involves designing and building an audio amplifier with a comprehensive technical report. Assessment: Project Report (70%) and 2 Quizzes (15% each).'),
    ('EI1IME', 'Introductory Mathematics for Engineers', 15, 1, 1, 'complete',
     'Covers essential mathematical foundations for engineering: complex numbers, vectors, matrices, differentiation, integration and differential equations. Assessment is via 5 Mobius quizzes (20% each). Only quizzes with 50% Extra Time in the name count toward module mark.'),
    ('EP1POS', 'Power Skills', 15, 1, 3, 'ongoing',
     'Develops essential professional skills including leadership, innovation and entrepreneurship, environmental sustainability and AI and digital literacy. Assessment: 4 Pass/Fail quizzes (must pass all - do not count toward module %) and Group work (50% report and 50% presentation).'),
    ('EP1IDP', 'Interdisciplinary Design Project', 15, 1, 3, 'ongoing',
     'EWB Engineering for People Design Challenge 2025-26 delivered in partnership with CIVIC SQUARE in Ladywood, Birmingham. Interdisciplinary teams design and pitch solutions to real community challenges. Assessment: Workshop Outputs x6 (10%), Security Quiz (10%), Portfolio/PDP (20%) and Group Project Poster and Video (60%).')
  returning id, code
)
insert into assessments (module_id, name, type, weight_percent, mark_achieved, mark_max, target_mark, week)
select m.id, a.name, a.type, a.w, a.mark, 100, 80, a.wk
from ins m
join (values
  ('DG1AID', 'Quiz 1 - Foundational and Mathematical Concepts', 'quiz',         25,    95,     'Week 6'),
  ('DG1AID', 'Quiz 2 - Data Science Fundamentals',             'quiz',         25,    95,     'Week 6'),
  ('DG1AID', 'Quiz 3 - Algorithmic Problem Solving',           'quiz',         25,    95,     'Week 11'),
  ('DG1AID', 'Quiz 4 - Machine Learning and ANNs',             'quiz',         25,   100,     'Week 11'),
  ('DG1IAD', 'Portfolio 1 - HTML/CSS/JS Landing Page',         'project',      20,  80.22,   'Week 2-6'),
  ('DG1IAD', 'Quiz 1 - HTML/CSS/JS',                          'quiz',         10,  84.25,   'Week 4'),
  ('DG1IAD', 'Portfolio 2 - Database and SQL Queries',         'project',      20,    85,     'Week 5-9'),
  ('DG1IAD', 'Quiz 2 - Databases',                            'quiz',         10,   100,     'Week 7'),
  ('DG1IAD', 'Portfolio 3 - Database-driven Website',          'project',      30,   100,     'Week 8-12'),
  ('DG1IAD', 'Quiz 3 - Server-side Development',              'quiz',         10,   100,     'Week 11'),
  ('DG1IPD', 'Coursework 1',                                  'coursework',   50,    86,     'Week 6'),
  ('DG1IPD', 'Coursework 2',                                  'coursework',   50,    96,     'Week 11'),
  ('EI1EL1', 'Lab Session 1',                                 'lab',           5,  88.88,   'Week 2'),
  ('EI1EL1', 'Lab Session 2',                                 'lab',           5,  95.83,   'Week 4'),
  ('EI1EL1', 'Lab Session 3',                                 'lab',           5,   100,     'Week 5'),
  ('EI1EL1', 'Class Test 1',                                  'exam',         35,  70.27,   'Week 6'),
  ('EI1EL1', 'Lab Session 4',                                 'lab',           5,   100,     'Week 8'),
  ('EI1EL1', 'Lab Session 5',                                 'lab',           5,   100,     'Week 10'),
  ('EI1EL1', 'Lab Session 6',                                 'lab',           5,   87.5,   'Week 11'),
  ('EI1EL1', 'Class Test 2',                                  'exam',         35,    85,     'Week 12'),
  ('EI1EL2', 'Audio Amplifier Project Report',                'report',       70,   94.6,   'Week 7'),
  ('EI1EL2', 'Blackboard Quiz',                               'quiz',         30,  51.72,   'Week 12'),
  ('EI1IME', 'Quiz 1 - Diagnostics (50% Extra Time)',         'quiz',         20,  97.34,   'Week 2'),
  ('EI1IME', 'Quiz 2 - Vectors and Complex Numbers (50% Extra Time)', 'quiz', 20,    96,     'Week 2'),
  ('EI1IME', 'Quiz 3 - Matrices (50% Extra Time)',            'quiz',         20,    96,     'Week 2'),
  ('EI1IME', 'Quiz 4 - Differentiation and Integration (50% Extra Time)', 'quiz', 20, 100,  'Week 7'),
  ('EI1IME', 'Quiz 5 - Differential Equations (50% Extra Time)', 'quiz',      20,    86,     'Week 12'),
  ('EP1POS', 'Group Report',                                  'report',       50,  null,    'Week 1-7'),
  ('EP1POS', 'Group Presentation',                            'presentation', 50,  null,    'Week 1-7'),
  ('EP1IDP', 'Workshop Outputs (x6)',                         'lab',          10,  null,    'Weeks 1-4'),
  ('EP1IDP', 'Security Quiz',                                 'quiz',         10,  null,    'Weeks 3-4'),
  ('EP1IDP', 'Portfolio / PDP',                               'portfolio',    20,  null,    'Week 7'),
  ('EP1IDP', 'Group Project (Poster and Video)',               'project',      60,  null,    'Week 6')
) as a(code, name, type, w, mark, wk)
on m.code = a.code;

-- Mark EP1POS quizzes as pass/fail (they do not count toward module percentage)
update assessments set is_pass_fail = true
where module_id = (select id from modules where code = 'EP1POS')
  and type = 'quiz';


-- ============================================================
-- 6. SEED - YEAR 2 MODULE SHELLS (no assessments yet)
-- ============================================================

insert into modules (code, name, credits, year, semester, status) values
  ('EI2APE', 'Analogue and Power Electronics',                            15, 2, 1, 'ongoing'),
  ('EI2DID', 'Digital Design',                                            15, 2, 1, 'ongoing'),
  ('DG2OOP', 'Data Structures, Algorithms and OOP',                       15, 2, 1, 'ongoing'),
  ('EI2ESC', 'Embedded Systems and C',                                    15, 2, 1, 'ongoing'),
  ('EI2ROC', 'Robot Control',                                             15, 2, 2, 'ongoing'),
  ('EI2ETP', 'Electronic Engineering Team Project',                       15, 2, 2, 'ongoing'),
  ('EI2COS', 'Communications Systems Ethics, EDI and Sustainability',     15, 2, 2, 'ongoing'),
  ('DG2IAI', 'Introduction to Artificial Intelligence and Robotics',      15, 2, 2, 'ongoing');


-- ============================================================
-- 7. SEED - FINAL YEAR MODULE SHELLS
-- year 3 is reserved for the optional Placement Year
-- year 4 = Final Year (Stage F, Level 6)
-- ============================================================

insert into modules (code, name, credits, year, semester, status) values
  ('EI3EFP', 'Final Year Project',              45, 4, 2, 'ongoing'),
  ('EI3PEP', 'Professional Engineering Practice', 15, 4, 2, 'ongoing'),
  ('EI3IOT', 'Internet of Things',              15, 4, 1, 'ongoing'),
  ('EI3DSD', 'Digital Systems Design',          15, 4, 1, 'ongoing');


-- ============================================================
-- 8. SEED - GOALS
-- ============================================================

insert into goals (title, description, category, status, progress) values
  ('Get into second year',                                        null,                                                                     'Academic', 'done',        100),
  ('Finish 1st year with good grades in all modules',             null,                                                                     'Academic', 'done',        100),
  ('Apply for placements and internships',                         null,                                                                     'Career',   'done',        100),
  ('Try to get a job close to university',                         null,                                                                     'Career',   'done',        100),
  ('Land placement opportunities',                                 null,                                                                     'Career',   'in_progress',  50),
  ('Hit the gym at least 4 times a week',                          null,                                                                     'Health',   'in_progress',  75),
  ('Lose 20-40kg of weight',                                       null,                                                                     'Health',   'in_progress',  20),
  ('Play football at least once a week',                           null,                                                                     'Health',   'in_progress',  60),
  ('Grow a beard',                                                 null,                                                                     'Health',   'done',        100),
  ('Grow long hair',                                               null,                                                                     'Health',   'in_progress',  50),
  ('Start long runs and walks',                                    null,                                                                     'Health',   'done',        100),
  ('Build a better relationship with God',                         'Daily quiet time, pray and fast on Tuesdays and Saturdays',              'Personal', 'in_progress',  70),
  ('Do quiet time every day',                                      null,                                                                     'Personal', 'in_progress',  70),
  ('Make mummy proud in all areas',                                null,                                                                     'Personal', 'in_progress',  80),
  ('Cut out bad energy, relationships and friendships',            null,                                                                     'Personal', 'done',        100),
  ('Stop being shy, network and communicate with the right people', null,                                                                    'Personal', 'in_progress',  60),
  ('Be myself in how I live, dress and present myself',            null,                                                                     'Personal', 'in_progress',  80),
  ('Learn to play the keyboard (beginner to amateur)',             null,                                                                     'Personal', 'in_progress',  30),
  ('Start streaming or create faceless content',                   'TikTok, YouTube, Instagram, Twitch, Kick',                               'Career',   'not_started',   0),
  ('Start some form of business',                                  null,                                                                     'Finance',  'in_progress',  20),
  ('Get into drop shipping or Stan Store',                         null,                                                                     'Finance',  'not_started',   0),
  ('Dress well and feel confident',                                null,                                                                     'Personal', 'done',        100),
  ('Smell good and improve self-presentation',                     null,                                                                     'Personal', 'done',        100),
  ('Travel',                                                       null,                                                                     'Personal', 'in_progress',  50),
  ('Eat better and maintain a healthy diet',                       null,                                                                     'Health',   'in_progress',  60),
  ('Make more money',                                              null,                                                                     'Finance',  'in_progress',  30),
  ('Save without touching it',                                     null,                                                                     'Finance',  'in_progress',  20);


-- ============================================================
-- 9. SEED - WISHLIST
-- ============================================================

insert into wishlist (name, category, status, priority, notes) values
  -- Stationery and Essentials
  ('Pens, highlighters, A4 notebooks',                              'Stationery and Essentials',  'wanted', 'medium', null),
  ('Command strips, hangers, storage boxes',                        'Stationery and Essentials',  'wanted', 'low',    null),
  ('Desk organisers',                                               'Stationery and Essentials',  'wanted', 'low',    null),
  -- Books and Learning
  ('Electronics and engineering textbooks',                         'Books and Learning',          'wanted', 'high',   null),
  ('Bible study materials (commentaries, devotionals)',             'Books and Learning',          'wanted', 'high',   null),
  ('Self-development books (discipline, finance, mindset)',         'Books and Learning',          'wanted', 'medium', null),
  ('Journals and notebooks for tracking goals',                     'Books and Learning',          'wanted', 'medium', null),
  -- Clothes and Style
  ('Hoodies (neutrals and statement)',                              'Clothes and Style',           'wanted', 'medium', null),
  ('Jeans (black/blue)',                                            'Clothes and Style',           'wanted', 'medium', null),
  ('Smart shirts and blazer',                                       'Clothes and Style',           'wanted', 'medium', null),
  ('Tracksuits and joggers (gym and casual)',                       'Clothes and Style',           'wanted', 'medium', null),
  ('Winter jacket (puffer/parka)',                                  'Clothes and Style',           'wanted', 'high',   null),
  ('Accessories (belts, caps, beanies)',                            'Clothes and Style',           'wanted', 'low',    null),
  -- Shoes
  ('White sneakers (Nike AF1, Adidas Forum)',                       'Shoes',                       'wanted', 'high',   null),
  ('Gym trainers',                                                  'Shoes',                       'wanted', 'high',   null),
  ('Running shoes',                                                 'Shoes',                       'wanted', 'high',   null),
  ('Smart casual shoes and boots',                                  'Shoes',                       'wanted', 'medium', null),
  ('Sliders and sandals',                                           'Shoes',                       'wanted', 'low',    null),
  -- Health and Fitness
  ('Resistance bands',                                              'Health and Fitness',          'wanted', 'medium', null),
  ('Lifting straps and gloves',                                     'Health and Fitness',          'wanted', 'medium', null),
  ('Foam roller',                                                   'Health and Fitness',          'wanted', 'low',    null),
  ('Large reusable water bottle (1L+)',                             'Health and Fitness',          'wanted', 'high',   null),
  ('Apple Watch straps and fitness tracker add-ons',                'Health and Fitness',          'wanted', 'low',    null),
  -- Grooming and Skincare
  ('Skincare set (cleanser, moisturiser, sunscreen)',               'Grooming and Skincare',       'wanted', 'high',   null),
  ('Beard oil and grooming kit',                                    'Grooming and Skincare',       'wanted', 'medium', null),
  ('Hair care products',                                            'Grooming and Skincare',       'wanted', 'medium', null),
  -- Perfumes - Everyday
  ('Hugo Boss Absolu',                                              'Perfumes and Scents',         'wanted', 'low',    'Budget-friendly, versatile everyday'),
  ('Hugo Boss Elixir',                                              'Perfumes and Scents',         'wanted', 'medium', 'Modern strong everyday'),
  ('YSL Myself',                                                    'Perfumes and Scents',         'wanted', 'medium', 'Affordable designer, new release'),
  ('Burberry Hero',                                                 'Perfumes and Scents',         'wanted', 'medium', 'Fresh and safe daily wear'),
  ('Versace Eros',                                                  'Perfumes and Scents',         'wanted', 'medium', 'Classic clubbing and youthful signature'),
  ('YSL Y Eau de Parfum',                                           'Perfumes and Scents',         'wanted', 'medium', 'Blue, fresh but mature'),
  ('Dior Sauvage',                                                  'Perfumes and Scents',         'wanted', 'high',   'Staple everyday signature'),
  ('Tom Ford Oud Wood',                                             'Perfumes and Scents',         'wanted', 'high',   'Luxury everyday, expensive but classy'),
  ('Valentino Gold',                                                'Perfumes and Scents',         'wanted', 'high',   'Luxury designer, dress-up vibe'),
  -- Perfumes - Fresh and Summer
  ('Rasasi Hawas',                                                  'Perfumes and Scents',         'wanted', 'medium', 'Cheap legendary summer freshie'),
  ('Borabora',                                                      'Perfumes and Scents',         'wanted', 'low',    'Budget tropical option'),
  ('Sungria',                                                       'Perfumes and Scents',         'wanted', 'low',    'Bright, fruity, fun'),
  ('Wave Child',                                                    'Perfumes and Scents',         'wanted', 'low',    'Unique, affordable niche'),
  ('Blue Talisman',                                                 'Perfumes and Scents',         'wanted', 'low',    'Niche but not overpriced'),
  ('Bois Imperial',                                                 'Perfumes and Scents',         'wanted', 'medium', 'Super versatile niche, reasonably priced'),
  ('Pacific Rock Moss',                                             'Perfumes and Scents',         'wanted', 'medium', 'Premium niche fresh, luxury summer vibe'),
  -- Perfumes - Niche
  ('French Defense (Mind Games)',                                   'Perfumes and Scents',         'wanted', 'medium', 'Game-inspired niche, premium'),
  ('Nasomatto Baraonda',                                            'Perfumes and Scents',         'wanted', 'medium', 'Cult niche, boozy powerhouse'),
  ('Janan Gold',                                                    'Perfumes and Scents',         'wanted', 'medium', 'Luxury Arabian'),
  -- Perfumes - Luxury
  ('Creed Aventus',                                                 'Perfumes and Scents',         'wanted', 'high',   'King of niche - save for'),
  ('Initio Musk Therapy',                                           'Perfumes and Scents',         'wanted', 'high',   'Smooth luxury musk'),
  ('Angel''s Share by Kilian',                                      'Perfumes and Scents',         'wanted', 'high',   'Luxury boozy party fragrance'),
  -- Gaming and Tech
  ('Samsung S25 Ultra',                                             'Gaming and Tech',             'wanted', 'high',   null),
  ('Costco gaming desk',                                            'Gaming and Tech',             'wanted', 'medium', null),
  ('Meta glasses',                                                  'Gaming and Tech',             'wanted', 'low',    null),
  ('Extra gaming monitor (144Hz+)',                                 'Gaming and Tech',             'wanted', 'medium', null),
  ('Mechanical keyboard',                                           'Gaming and Tech',             'wanted', 'medium', null),
  ('Gaming mouse',                                                  'Gaming and Tech',             'wanted', 'medium', null),
  ('Gaming chair',                                                  'Gaming and Tech',             'wanted', 'medium', null),
  -- Music and Instruments
  ('Trumpet',                                                       'Music and Instruments',       'wanted', 'medium', null),
  ('Guitar',                                                        'Music and Instruments',       'wanted', 'medium', null),
  ('Drum pad and Cajon',                                            'Music and Instruments',       'wanted', 'low',    null),
  ('Music accessories (tuner, picks, valve oil)',                   'Music and Instruments',       'wanted', 'low',    null),
  -- Productivity and Study
  ('Laptop stand',                                                  'Productivity and Study',      'wanted', 'high',   null),
  ('Noise-cancelling headphones',                                   'Productivity and Study',      'wanted', 'high',   null),
  ('External hard drive and cloud storage',                         'Productivity and Study',      'wanted', 'medium', null),
  ('Desk lamp (eye health, night study)',                           'Productivity and Study',      'wanted', 'medium', null),
  -- Room and Lifestyle
  ('Bedside table and shelves',                                     'Room and Lifestyle',          'wanted', 'medium', null),
  ('Weighted blanket or quality duvet',                             'Room and Lifestyle',          'wanted', 'medium', null),
  ('Room diffuser and candles',                                     'Room and Lifestyle',          'wanted', 'low',    null),
  ('Laundry basket (split gym and casual)',                         'Room and Lifestyle',          'wanted', 'low',    null),
  -- Mental Health and Growth
  ('Gratitude and prayer journal',                                  'Mental Health and Growth',    'wanted', 'high',   null),
  ('Planner (physical or digital)',                                 'Mental Health and Growth',    'wanted', 'high',   null),
  ('Meditation and quiet time tools',                               'Mental Health and Growth',    'wanted', 'medium', null),
  ('Stress ball or fidget tool',                                    'Mental Health and Growth',    'wanted', 'low',    null),
  -- Finance
  ('Savings account with good interest',                            'Finance',                     'wanted', 'high',   'Monzo, Revolut or Marcus'),
  ('Budgeting app (Monzo, Revolut, YNAB)',                          'Finance',                     'wanted', 'high',   null),
  ('Beginner investing book and app',                               'Finance',                     'wanted', 'medium', 'Freetrade, Trading 212'),
  -- Lifestyle and Travel
  ('Trip to Ghana',                                                 'Lifestyle and Travel',        'wanted', 'high',   null),
  ('Trip to America/Canada',                                        'Lifestyle and Travel',        'wanted', 'medium', null),
  ('Luggage and travel backpack',                                   'Lifestyle and Travel',        'wanted', 'medium', null),
  ('GoPro and portable camera',                                     'Lifestyle and Travel',        'wanted', 'medium', null),
  ('Noise-cancelling travel headphones',                            'Lifestyle and Travel',        'wanted', 'medium', null),
  ('Gym bag essentials (shaker, towels, straps, gloves)',           'Lifestyle and Travel',        'wanted', 'medium', null);


-- ============================================================
-- 10. SEED - DIARY (Ghana addresses entry)
-- ============================================================

insert into diary (title, content, mood) values (
  'My Ghana Addresses and Numbers',
  'Family House - Kwashieman, Hong Kong
GF-497-5934, Suku Street, Darkuman, Ablekuma North, Greater Accra
GPS: ghanapostgps.com/map?gps=GF4975934
Lived here from birth (25 June 2005) to December 2015. This was our family house left by my grandfather (dad''s dad) for him and his siblings. A shared compound with different houses inside. Lived here with both parents and siblings.

Dad''s House - Teiman
GE-051-4221, Teiman, Greater Accra
GPS: ghanapostgps.com/map?gps=GE0514221
Moved here with family from January 2016. This was the stucco house my dad built. Stayed here until I moved to the UK. Lost my dad on 1 August 2021 - after that it was just mum and siblings until we moved to the UK.

Adisadel College (Boarding)
CC-034-7377, Antem, Cape Coast, Central Region
GPS: ghanapostgps.com/map?gps=CC0347377
Attended September 2019 to March 2022. Lived in the boarding house during school term time - Green Track. Went home to Teiman in the holidays.

Ghana Phone Numbers
Ending 76
Ending 53
Ending 50
Ending 45',
  'reflective'
);


-- ============================================================
-- 11. SEED - STREAKS
-- ============================================================

insert into streaks (name, icon, description, color, order_index) values
  ('LeetCode',     '💻', 'Daily LeetCode problem solving',          '#f97316', 0),
  ('NeetCode',     '🧠', 'NeetCode roadmap progress',               '#8b5cf6', 1),
  ('GitHub',       '🐙', 'Daily GitHub contribution',               '#22c55e', 2),
  ('LinkedIn',     '💼', 'Daily LinkedIn engagement',               '#0ea5e9', 3),
  ('Puzzle Games', '🧩', 'Daily puzzle or brain game',              '#ec4899', 4),
  ('Bible',        '📖', 'Daily Bible reading and quiet time',      '#f59e0b', 5),
  ('Mimo',         '📱', 'Daily Mimo JavaScript lesson',            '#6366f1', 6),
  ('Python App',   '🐍', 'Daily Python learning session',           '#10b981', 7),
  ('Codeforces',   '⚔️',  'Codeforces problem or contest',           '#ef4444', 8);


-- ============================================================
-- 12. SEED - HEALTH SECTIONS, WORKOUTS AND NUTRITION
-- ============================================================

insert into health_sections (name, type, icon, color, order_index) values
  ('Gym',       'gym',       '🏋️', '#6366f1', 0),
  ('Nutrition', 'nutrition', '🥗', '#22c55e', 1),
  ('Running',   'running',   '🏃', '#f97316', 2),
  ('Cardio',    'cardio',    '❤️',  '#ef4444', 3);

-- Gym workout split (7 days)
with gym as (select id from health_sections where name = 'Gym' limit 1)
insert into health_workouts (section_id, day_label, exercises, order_index)
select gym.id, d.day, d.exercises::jsonb, d.idx
from gym, (values
  (0, 'Monday - Chest and Triceps (Push)',
   '[{"name":"Bench Press","sets":"4x8-10"},{"name":"Incline Dumbbell Press","sets":"3x10-12"},{"name":"Cable Fly","sets":"3x12-15"},{"name":"Tricep Pushdown","sets":"3x12-15"},{"name":"Skull Crushers","sets":"3x10-12"},{"name":"Dips","sets":"3x failure"}]'),
  (1, 'Tuesday - Back and Biceps (Pull)',
   '[{"name":"Deadlift","sets":"4x5-6"},{"name":"Pull-ups","sets":"4x failure"},{"name":"Barbell Row","sets":"3x8-10"},{"name":"Seated Cable Row","sets":"3x10-12"},{"name":"Barbell Curl","sets":"3x10-12"},{"name":"Hammer Curl","sets":"3x12-15"}]'),
  (2, 'Wednesday - Legs',
   '[{"name":"Squat","sets":"4x8-10"},{"name":"Romanian Deadlift","sets":"3x10-12"},{"name":"Leg Press","sets":"3x12-15"},{"name":"Leg Curl","sets":"3x12-15"},{"name":"Calf Raises","sets":"4x15-20"},{"name":"Walking Lunges","sets":"3x12 each leg"}]'),
  (3, 'Thursday - Cardio, Core and Mobility',
   '[{"name":"30 min steady-state cardio (treadmill/bike)","sets":"1x30min"},{"name":"Plank","sets":"3x60s"},{"name":"Russian Twists","sets":"3x20"},{"name":"Leg Raises","sets":"3x15"},{"name":"Ab Wheel","sets":"3x10"},{"name":"Hip flexor and hamstring stretches","sets":"10 min"}]'),
  (4, 'Friday - Shoulders and Arms',
   '[{"name":"Overhead Press","sets":"4x8-10"},{"name":"Lateral Raises","sets":"4x12-15"},{"name":"Front Raises","sets":"3x12"},{"name":"Face Pulls","sets":"3x15"},{"name":"Tricep Overhead Extension","sets":"3x12"},{"name":"Concentration Curl","sets":"3x12"}]'),
  (5, 'Saturday - Full-Body HIIT',
   '[{"name":"Burpees","sets":"4x20"},{"name":"Box Jumps","sets":"4x15"},{"name":"Kettlebell Swings","sets":"4x20"},{"name":"Battle Ropes","sets":"4x30s"},{"name":"Mountain Climbers","sets":"4x30s"},{"name":"Sprint intervals","sets":"8x30s on, 30s off"}]'),
  (6, 'Sunday - Rest and Recovery',
   '[{"name":"Light walk (20-30 min)","sets":"optional"},{"name":"Full body stretch","sets":"15-20 min"},{"name":"Foam rolling","sets":"10 min"},{"name":"Meal prep for the week","sets":""}]')
) as d(idx, day, exercises);

-- Nutrition
insert into health_nutrition (category, items, rules, order_index) values
  ('Breakfast',
   '["Oats with banana and peanut butter","Greek yoghurt with berries","Scrambled eggs on wholegrain toast","Protein shake (post-gym morning)","Overnight oats with chia seeds"]'::jsonb,
   '{"High protein start","No skipping breakfast on gym days","Eat within 30 min of waking"}',
   0),
  ('Lunch',
   '["Chicken rice and veg","Tuna pasta with sweetcorn","Turkey and avocado wrap","Salmon with sweet potato","Lentil soup with bread"]'::jsonb,
   '{"Lean protein with every meal","Complex carbs for energy","Colourful vegetables on the plate"}',
   1),
  ('Dinner',
   '["Grilled chicken with rice and broccoli","Beef stir fry with noodles","Baked salmon with quinoa","Turkey mince with pasta","Egg fried rice with veg"]'::jsonb,
   '{"Lighter than lunch","No heavy carbs after 8pm","Meal prep Sunday saves time"}',
   2),
  ('Snacks',
   '["Protein bar (Grenade, Fulfil)","Rice cakes with peanut butter","Boiled eggs","Cottage cheese","Mixed nuts","Apple or banana","Whey protein shake"]'::jsonb,
   '{"2 snacks max per day","Post-workout: shake within 30 min","Avoid processed snacks"}',
   3);


-- ============================================================
-- 13. SEED - INVENTORY (devices and equipment I own)
-- ============================================================

insert into inventory_items (name, category, description, serial_number, warranty_expiry, notes) values
  ('MacBook Air 13-inch (M5)',
   'Tech and Devices',
   'Apple M5, 24GB RAM, 512GB SSD, macOS Tahoe 26',
   'C02X9FXX9Y', '2027-03-15',
   'Model: Mac17,3 - Production year 2026'),
  ('Gaming PC (ZACCESS)',
   'Tech and Devices',
   'ASUS PRIME B760M-A WIFI D4, Intel i5-12400T, RTX 4060, 16GB RAM, Windows 11 Pro',
   null, null,
   'Custom build, dual monitor setup'),
  ('Lenovo ThinkPad P14s Gen 5 AMD (ZACCESS-LNV)',
   'Tech and Devices',
   'AMD Ryzen 7 PRO 8840HS, 16GB DDR5, 512GB NVMe, Windows 11 Home',
   null, null,
   'Model: 21MFS04A00'),
  ('iPhone 14 Pro Max',
   'Tech and Devices',
   'Apple iPhone 14 Pro Max, 512GB, iOS 18, Vodafone UK',
   'CWGYQCM2C9', null,
   'IMEI: 35 717334 120233 5'),
  ('iPad Pro 13-inch (M5)',
   'Tech and Devices',
   'Apple iPad Pro 13-inch M5, 256GB, iPadOS 26',
   'K0V9243YMX', '2026-12-17',
   'Model: ME7W4KN/A'),
  ('Apple Watch Series 5',
   'Tech and Devices',
   'watchOS 10.6.1',
   'G99Z600UMLDX', null, null),
  ('PlayStation 5 (Disc Edition)',
   'Gaming',
   'PS5 disc edition, 667GB usable storage',
   null, null,
   'Last storage check: 20GB free'),
  ('Lenovo R27fc-30',
   'Tech and Devices',
   '1920x1080, 239Hz, connected to Gaming PC',
   null, null,
   'Primary gaming monitor'),
  ('Samsung Odyssey G5',
   'Tech and Devices',
   '2560x1440, 165Hz, connected to Gaming PC',
   null, null,
   'Secondary gaming monitor'),
  ('LG 24-inch (Home)',
   'Tech and Devices',
   '24 inch, 120Hz, connected to Lenovo ThinkPad',
   null, null, null),
  ('VISIONKEY-100 Portable Digital Keyboard Piano',
   'Music and Instruments',
   '88-key full-size, 129 sounds, Bluetooth 5.0, USB-C power',
   null, null,
   'Product Ref: 236941 - includes stand, bench and headphones');


-- ============================================================
-- 14. SEED - COURSE MODULES (from programme spec)
-- ============================================================

insert into course_modules (stage, section, code, title, credits, level, core_or_option, condonable, prerequisites, order_index) values
  -- Stage 1 (Year 1, Level 4)
  ('1', 'core', 'EI1EL1', 'Electronics 1',                                                              15, 4, 'Core',   false, null,           0),
  ('1', 'core', 'EI1IME', 'Introductory Mathematics for Engineering, Digital and Physical Sciences',    15, 4, 'Core',   true,  null,           1),
  ('1', 'core', 'DG1IPE', 'Introductory Programming for Engineering and Physical Sciences',             15, 4, 'Core',   false, null,           2),
  ('1', 'core', 'EP1IDP', 'Interdisciplinary Design Project',                                           15, 4, 'Core',   false, null,           3),
  ('1', 'core', 'DG1AID', 'Foundations of AI and Data Science',                                        15, 4, 'Core',   true,  null,           4),
  ('1', 'core', 'EI1EL2', 'Electronics 2',                                                              15, 4, 'Core',   true,  '(C) EI1EL1',  5),
  ('1', 'core', 'DG1IAD', 'Internet Applications and Databases',                                       15, 4, 'Core',   true,  null,           6),
  ('1', 'core', 'EP1POS', 'Power Skills',                                                               15, 4, 'Core',   false, null,           7),
  -- Stage 2 (Year 2, Level 5)
  ('2', 'core', 'EI2APE', 'Analogue and Power Electronics',                                            15, 5, 'Core',   false, null,           0),
  ('2', 'core', 'EI2DID', 'Digital Design',                                                            15, 5, 'Core',   false, null,           1),
  ('2', 'core', 'DG2OOP', 'Data Structures, Algorithms and Object-Oriented Programming',               15, 5, 'Core',   false, null,           2),
  ('2', 'core', 'EI2ESC', 'Embedded Systems and C',                                                    15, 5, 'Core',   false, null,           3),
  ('2', 'core', 'EI2ROC', 'Robot Control',                                                             15, 5, 'Core',   false, null,           4),
  ('2', 'core', 'EI2ETP', 'Electronic Engineering Team Project',                                       15, 5, 'Core',   false, null,           5),
  ('2', 'core', 'EI2COS', 'Communications Systems Ethics, EDI and Sustainability',                     15, 5, 'Core',   false, null,           6),
  ('2', 'core', 'DG2IAI', 'Introduction to Artificial Intelligence and Robotics',                      15, 5, 'Core',   false, null,           7),
  -- Placement Year (Year 3, Level 5, optional)
  ('placement', 'core', 'EP3PYI', 'Professional Year Industrial Placement',                           120, 5, 'Option', false, null,           0),
  -- Final Year (Year 4 / Stage F, Level 6)
  ('final', 'core', 'EI3EFP', 'Final Year Project',                                                   45, 6, 'Core',   false, null,           0),
  ('final', 'core', 'EI3PEP', 'Professional Engineering Practice',                                    15, 6, 'Core',   false, null,           1),
  ('final', 'A',    'EI3IOT', 'Internet of Things',                                                   15, 6, 'Option', true,  null,           2),
  ('final', 'A',    'EI3DSD', 'Digital Systems Design',                                               15, 6, 'Option', true,  null,           3),
  ('final', 'A',    'EI3AML', 'Advanced Machine Learning',                                            15, 6, 'Option', true,  null,           4),
  ('final', 'A',    'EI3ROS', 'Robotic Operating Systems',                                            15, 6, 'Option', true,  null,           5),
  ('final', 'B',    'EI3COM', 'Communication Systems',                                                15, 6, 'Option', true,  null,           6),
  ('final', 'B',    'EI3POE', 'Power Electronics',                                                    15, 6, 'Option', true,  null,           7),
  ('final', 'B',    'EI3CVS', 'Computer Vision Systems',                                              15, 6, 'Option', true,  null,           8),
  ('final', 'B',    'EI3CPS', 'Cyber-Physical Systems Security',                                      15, 6, 'Option', true,  null,           9);


-- ============================================================
-- 15. SEED - CONFIG (Me page, course data and PIN placeholder)
-- ============================================================

insert into config (key, value) values
  ('me_profile', '{
    "name": "Isaac Adjei",
    "dob": "2005-06-25",
    "nationality": "Ghanaian",
    "location": "Birmingham, UK",
    "university": "Aston University",
    "course": "BEng Electronic Engineering and Computer Science",
    "year": 2,
    "student_number": "240191278",
    "faith": "Christian",
    "bio": "I am a second-year Electronic Engineering and Computer Science student at Aston University with a passion for building things that matter. I grew up in Ghana and moved to the UK in 2022. I am driven by my faith, my family and my desire to create technology that has real-world impact.",
    "values": ["Faith and purpose", "Family and loyalty", "Discipline and consistency", "Creativity and building", "Continuous learning"],
    "interests": ["Software development", "Electronics and embedded systems", "AI and machine learning", "Gaming and streaming", "Football", "Music and keyboard", "Fashion and style"],
    "personality": "Ambitious, creative and deeply driven. I work best when I have clear goals and creative freedom. I value authenticity and real relationships over surface-level connections.",
    "github": "zaccesss",
    "linkedin": "isaac-adjei",
    "website": "isaacadjei.me"
  }'),
  ('dashboard_pin_hash', '"unset"'),
  ('course_data', '{
    "programme": "BEng Electronic Engineering and Computer Science",
    "university": "Aston University",
    "accreditation": "IET accredited",
    "duration": "3 years (4 with placement)",
    "total_credits": 360,
    "grade_thresholds": {"First": 80, "2:1": 60, "2:2": 40, "Fail": 0},
    "iet_rules": [
      "Must pass all non-condonable modules",
      "Must achieve at least 40% overall",
      "No more than 30 credits condoned across the programme",
      "Any individual assessment worth more than 30% of a module must score at least 30%"
    ],
    "term_dates_2025_26": {
      "Term 1": "22 September - 12 December 2025",
      "Term 2": "5 January - 28 March 2026",
      "Term 3": "23 April - 6 June 2026"
    }
  }');


-- ============================================================
-- 16. POST-SETUP NOTES
-- ============================================================
-- After running this file:
--
-- 1. The dashboard_pin_hash is set to "unset" which means the PIN
--    gate falls back to the AUTH_SECONDARY_PIN Vercel env var on
--    first login, then auto-hashes and stores it here.
--
-- 2. The applications table includes the new columns added in
--    2026-05-21: opening_date, last_year_opening, housing_location,
--    cv_required, cover_letter_required, written_answers,
--    sponsors_visa, category. These are already in the table
--    definition above so no ALTER TABLE is needed.
--
-- 3. Module years: year 1 = Stage 1, year 2 = Stage 2,
--    year 3 = Placement Year (optional), year 4 = Final Year.
--
-- ============================================================
-- SESSION 2026-05-21: APPLIED MIGRATIONS
-- ============================================================
--
-- All columns listed below were added via ALTER TABLE and are now
-- included in the CREATE TABLE definition above. No need to run these
-- again on a fresh setup - they are here as a migration history only.
--
-- Migration applied 2026-05-21 (applications new columns):
--   ALTER TABLE applications
--     ADD COLUMN IF NOT EXISTS opening_date date,
--     ADD COLUMN IF NOT EXISTS last_year_opening date,
--     ADD COLUMN IF NOT EXISTS housing_location text,
--     ADD COLUMN IF NOT EXISTS cv_required text,
--     ADD COLUMN IF NOT EXISTS cover_letter_required text,
--     ADD COLUMN IF NOT EXISTS written_answers text,
--     ADD COLUMN IF NOT EXISTS sponsors_visa text,
--     ADD COLUMN IF NOT EXISTS category text DEFAULT 'Software Engineering';
--
-- One-time cleanup applied 2026-05-21 (clear bad scraped data before scraper fix):
--   DELETE FROM applications WHERE status = 'scraped';
--
-- After cleanup, trigger a fresh scraper run:
--   gh workflow run job-scraper.yml --ref main
--
-- ============================================================
