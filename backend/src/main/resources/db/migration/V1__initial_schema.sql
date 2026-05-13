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

create table units (
    id uuid primary key,
    name varchar(140) not null,
    code varchar(40) not null unique,
    type varchar(40) not null,
    contact_name varchar(140),
    phone varchar(40),
    address varchar(240),
    city varchar(120),
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
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

create table occurrences (
    id uuid primary key,
    occurrence_code varchar(30) not null unique,
    vehicle_id uuid not null references vehicles(id),
    assigned_to_id uuid references users(id),
    unit_id uuid references units(id),
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
create index idx_occurrences_unit on occurrences(unit_id);

create table occurrence_images (
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

create table ai_analysis (
    id uuid primary key,
    occurrence_id uuid not null references occurrences(id) on delete cascade,
    photo_id uuid references occurrence_images(id) on delete set null,
    analysis_type varchar(60) not null,
    provider varchar(40) not null,
    model varchar(80) not null,
    confidence_score numeric(5,2),
    severity_suggestion varchar(30),
    detected_plate varchar(12),
    vehicle_type varchar(120),
    evidence text,
    operational_risk text,
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

create index idx_ai_analysis_occurrence_created on ai_analysis(occurrence_id, created_at desc);

create table alerts (
    id uuid primary key,
    occurrence_id uuid not null references occurrences(id) on delete cascade,
    previous_occurrence_id uuid references occurrences(id) on delete set null,
    vehicle_id uuid not null references vehicles(id),
    type varchar(60) not null,
    title varchar(180) not null,
    message text not null,
    previous_unit varchar(140),
    previous_date timestamptz,
    previous_type varchar(60),
    risk_level varchar(30),
    resolved_at timestamptz,
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);

create index idx_alerts_occurrence_created on alerts(occurrence_id, created_at desc);
create index idx_alerts_vehicle_created on alerts(vehicle_id, created_at desc);

create table audit_logs (
    id uuid primary key,
    user_id uuid references users(id) on delete set null,
    action varchar(80) not null,
    entity_name varchar(80) not null,
    entity_id uuid,
    metadata text,
    active boolean not null default true,
    created_at timestamptz not null,
    updated_at timestamptz not null
);
