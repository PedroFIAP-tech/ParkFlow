create table roles (
    id uuid primary key,
    name varchar(60) not null unique,
    description varchar(160),
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table users (
    id uuid primary key,
    full_name varchar(160) not null,
    email varchar(180) not null unique,
    password_hash varchar(255) not null,
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table user_roles (
    user_id uuid not null references users(id) on delete cascade,
    role_id uuid not null references roles(id) on delete cascade,
    primary key (user_id, role_id)
);

create table vehicles (
    id uuid primary key,
    plate varchar(12) not null unique,
    chassis varchar(40),
    brand varchar(80),
    model varchar(120),
    color varchar(60),
    model_year integer,
    owner_name varchar(160),
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table yards (
    id uuid primary key,
    name varchar(140) not null,
    type varchar(40) not null,
    contact_name varchar(140),
    phone varchar(40),
    address varchar(240),
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table occurrences (
    id uuid primary key,
    occurrence_code varchar(30) not null unique,
    vehicle_id uuid not null references vehicles(id),
    assigned_to_id uuid references users(id),
    yard_id uuid references yards(id),
    type varchar(60) not null,
    status varchar(60) not null,
    priority varchar(30) not null,
    location varchar(180) not null,
    description text,
    reported_at timestamptz not null,
    stopped_since timestamptz not null,
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create index idx_occurrences_status on occurrences(status);
create index idx_occurrences_priority on occurrences(priority);
create index idx_occurrences_vehicle on occurrences(vehicle_id);

create table occurrence_photos (
    id uuid primary key,
    occurrence_id uuid not null references occurrences(id) on delete cascade,
    url text not null,
    public_id varchar(220),
    original_filename varchar(180),
    content_type varchar(80),
    size_bytes bigint,
    ai_processed boolean not null default false,
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table occurrence_documents (
    id uuid primary key,
    occurrence_id uuid not null references occurrences(id) on delete cascade,
    url text not null,
    public_id varchar(220),
    original_filename varchar(180),
    document_type varchar(80),
    content_type varchar(80),
    size_bytes bigint,
    ocr_text text,
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table occurrence_timeline (
    id uuid primary key,
    occurrence_id uuid not null references occurrences(id) on delete cascade,
    created_by_id uuid references users(id),
    event_type varchar(60) not null,
    title varchar(140) not null,
    description text,
    previous_status varchar(60),
    new_status varchar(60),
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create index idx_timeline_occurrence_created on occurrence_timeline(occurrence_id, created_at desc);

create table inspections (
    id uuid primary key,
    occurrence_id uuid not null references occurrences(id) on delete cascade,
    inspector_id uuid references users(id),
    status varchar(60) not null,
    notes text,
    scheduled_at timestamptz,
    completed_at timestamptz,
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create table ai_analyses (
    id uuid primary key,
    occurrence_id uuid not null references occurrences(id) on delete cascade,
    photo_id uuid references occurrence_photos(id) on delete set null,
    analysis_type varchar(60) not null,
    provider varchar(40) not null,
    model varchar(80) not null,
    confidence_score numeric(5,2),
    severity_suggestion varchar(30),
    detected_plate varchar(12),
    plate_divergence boolean,
    summary text,
    next_step text,
    raw_json text,
    reviewed boolean not null default false,
    reviewed_by_id uuid references users(id),
    reviewed_at timestamptz,
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create index idx_ai_analyses_occurrence_created on ai_analyses(occurrence_id, created_at desc);

create table notifications (
    id uuid primary key,
    user_id uuid references users(id) on delete cascade,
    occurrence_id uuid references occurrences(id) on delete cascade,
    type varchar(60) not null,
    title varchar(140) not null,
    message text,
    read_at timestamptz,
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

