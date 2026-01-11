-- Categories table for blog
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ko TEXT,
    description TEXT,
    description_ko TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Page content table for dynamic pages
CREATE TABLE IF NOT EXISTS page_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_key TEXT UNIQUE NOT NULL, -- e.g., 'career', 'skills', 'projects', 'contact'
    content_en TEXT NOT NULL,
    content_ko TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Career entries
CREATE TABLE IF NOT EXISTS careers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    company_ko TEXT,
    position TEXT NOT NULL,
    position_ko TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    description_ko TEXT,
    responsibilities TEXT, -- JSON array
    technologies TEXT, -- JSON array
    logo_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Skills categories and items
CREATE TABLE IF NOT EXISTS skill_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_ko TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 80, -- 0-100 proficiency
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES skill_categories(id)
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_ko TEXT,
    description TEXT,
    description_ko TEXT,
    long_description TEXT,
    long_description_ko TEXT,
    image_url TEXT,
    demo_url TEXT,
    github_url TEXT,
    technologies TEXT, -- JSON array
    category TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contact info
CREATE TABLE IF NOT EXISTS contact_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL, -- email, phone, github, linkedin, etc.
    value TEXT NOT NULL,
    label TEXT,
    label_ko TEXT,
    icon TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- Insert default categories
INSERT OR IGNORE INTO categories (slug, name, name_ko, sort_order) VALUES
    ('development', 'Development', '개발', 1),
    ('free', 'Free Writing', '자유게시판', 2),
    ('ai', 'AI & ML', 'AI & ML', 3),
    ('career', 'Career', '커리어', 4);
