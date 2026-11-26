DROP TABLE IF EXISTS session, question_history, questions, comments, articles, users,
                    penalties, race_results, season_entries, races, circuits, drivers, teams CASCADE;

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    code CHAR(3)
);

CREATE TABLE circuits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    city VARCHAR(100),
    country VARCHAR(100)
);

CREATE TABLE races (
    id SERIAL PRIMARY KEY,
    season SMALLINT NOT NULL,
    round SMALLINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    race_day DATE, 
    circuit_id INTEGER REFERENCES circuits(id) ON DELETE SET NULL, 
    sprint BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
    UNIQUE (season, round)
);

CREATE TABLE season_entries (
    id SERIAL PRIMARY KEY,
    season SMALLINT NOT NULL,
    driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    position SMALLINT,
    points NUMERIC(5,1) NOT NULL DEFAULT 0,
    starts SMALLINT NOT NULL DEFAULT 0,
    wins SMALLINT NOT NULL DEFAULT 0,
    podiums SMALLINT NOT NULL DEFAULT 0,
    retirements SMALLINT NOT NULL DEFAULT 0,
    penalties SMALLINT NOT NULL DEFAULT 0,
    licence_points SMALLINT NOT NULL DEFAULT 0,
    disqualifications SMALLINT NOT NULL DEFAULT 0,
    UNIQUE (season, driver_id)
);

CREATE TABLE race_results (
    id SERIAL PRIMARY KEY,
    race_id INTEGER NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    finish SMALLINT, 
    grid SMALLINT,
    status VARCHAR(30) NOT NULL,
    race_points NUMERIC(5,1) NOT NULL DEFAULT 0,
    sprint_points NUMERIC(5,1) NOT NULL DEFAULT 0,
    licence_points SMALLINT NOT NULL DEFAULT 0,
    UNIQUE (race_id, driver_id)
);

CREATE TABLE penalties (
    id SERIAL PRIMARY KEY,
    race_id  INTEGER NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    penalty VARCHAR(100) NOT NULL,
    licence_points SMALLINT NOT NULL DEFAULT 0,
    reason TEXT,
    session VARCHAR(30),
    source VARCHAR(150)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'fan'
        CHECK (role IN ('admin', 'editor', 'fan')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    body TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    race_id INTEGER NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted'
            CHECK (status IN ('submitted', 'in_review', 'answered', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE question_history (
    id SERIAL PRIMARY KEY,
    question_iD INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL
            CHECK (status IN ('submitted', 'in_review', 'answered', 'closed')),
    note    TEXT,
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE session (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX idx_session_expire ON session (expire);