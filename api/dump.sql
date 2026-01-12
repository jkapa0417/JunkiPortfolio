PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_ko TEXT,
  excerpt TEXT,
  excerpt_ko TEXT,
  content TEXT NOT NULL,
  content_ko TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  read_time INTEGER DEFAULT 5,
  published BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  parent_id INTEGER,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_id)
);
INSERT INTO "users" VALUES('u_214c4c79935d46e7','google','110920725668451404423','Jun Ki Ahn','jkapa0417@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocIJZ4yKz-CKj1NT02JyYcv89CV0oyvfbVuVxe_hq70rtpPbVA=s96-c',1,'2026-01-11 13:50:39');
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_ko TEXT,
    description TEXT,
    description_ko TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "categories" VALUES(1,'development','Development','개발',NULL,NULL,1,'2026-01-11 14:12:07');
INSERT INTO "categories" VALUES(2,'free','Free Writing','자유게시판',NULL,NULL,2,'2026-01-11 14:12:07');
INSERT INTO "categories" VALUES(3,'ai','AI & ML','AI & ML',NULL,NULL,3,'2026-01-11 14:12:07');
INSERT INTO "categories" VALUES(4,'career','Career','커리어',NULL,NULL,4,'2026-01-11 14:12:07');
CREATE TABLE page_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_key TEXT UNIQUE NOT NULL, -- e.g., 'career', 'skills', 'projects', 'contact'
    content_en TEXT NOT NULL,
    content_ko TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE careers (
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
INSERT INTO "careers" VALUES(1,'LG Electronics','LG전자','Full Stack Developer','풀스택 개발자','2025-01',NULL,1,'MS Data/Cloud Development Team','MS 데이터/클라우드 개발팀','["MS Data/Cloud Development Team, Data Solution Part", "Working as Full Stack Developer & Data Scientist", "Developed AI Agent Chatbot Service for LG Business Cloud", "Developed LG Business Cloud Chatbot UI/UX", "Developed Chatbot UI/UX for In-House System", "Team Development/Operational Server Administrator", "Hardware Virtual Product Development In-House System Administrator", "Developing chatbot service for LG Electronics Information Display Marketing"]',NULL,NULL,1,'2026-01-11 14:17:36');
INSERT INTO "careers" VALUES(2,'LG Electronics','LG전자','Full Stack Developer','풀스택 개발자','2024-01','2024-12',0,'ID DX/Data Solution Team','ID DX/데이터 솔루션 팀','["Working as Full Stack Developer and Data Scientist", "Developed Usage Report using Large Language Model for Pro:Centric Cloud", "Developed LLM and RAG based Chatbot for In-House System", "Developed LG Business Cloud Chatbot", "Developed Chatbot UI/UX for In-House System", "Team Development/Operational Server Administrator", "In-House VPD System Administrator", "In-House Department System Administrator", "Participated in Industry-Academia Project with Seoul National University of Science and Education"]',NULL,NULL,2,'2026-01-11 14:17:36');
INSERT INTO "careers" VALUES(3,'LG Electronics','LG전자','Full Stack Developer','풀스택 개발자','2022-05','2023-12',0,'ID DX/VPD System Development Task Team','ID DX/VPD 시스템 개발 태스크 팀','["Created In-House system for LED Outsourcing Team", "Developed LG In-House VPD Management System", "Team Development/Operation Server Maintenance Administrator", "Developed CX System Dashboard in In-House System", "ID In-House System Administrator"]',NULL,NULL,3,'2026-01-11 14:17:36');
INSERT INTO "careers" VALUES(4,'LG Electronics','LG전자','Data Scientist','데이터 과학자','2022-04','2022-12',0,'BS Solution Task Team','BS ILO Task','["Created BS ILO Process Quality Analysis Monitoring Automation System", "Participated in Dashboard Development/Operation", "ILO Data Collection Analysis and Preprocessing", "Managed GCP VM (Ubuntu OS) Server", "Development of common code for horizontal deployment of enterprise systems"]',NULL,NULL,4,'2026-01-11 14:17:36');
INSERT INTO "careers" VALUES(5,'LG Electronics','LG전자','Research and Development Engineer','연구개발 엔지니어','2021-07','2022-04',0,'ID Advanced Convergence Solution Project Team','ID 첨단 융합 솔루션 프로젝트 팀','["Embedded System Developer", "Computer Vision and AI", "Developed Gaze Tracking Mouse Control Service for KIOSK", "Developed Hand Mouse System for KIOSK"]',NULL,NULL,5,'2026-01-11 14:17:36');
CREATE TABLE skill_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_ko TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0
);
INSERT INTO "skill_categories" VALUES(1,'Frontend Development','프론트엔드',NULL,NULL,1);
INSERT INTO "skill_categories" VALUES(2,'Backend Development','백엔드',NULL,NULL,2);
INSERT INTO "skill_categories" VALUES(3,'Data & LLM','데이터 및 LLM',NULL,NULL,3);
INSERT INTO "skill_categories" VALUES(4,'Cloud','클라우드',NULL,NULL,4);
CREATE TABLE skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 80, -- 0-100 proficiency
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES skill_categories(id)
);
INSERT INTO "skills" VALUES(1,1,'React.js',90,1);
INSERT INTO "skills" VALUES(2,1,'Svelte',80,2);
INSERT INTO "skills" VALUES(3,1,'HTML',95,3);
INSERT INTO "skills" VALUES(4,1,'CSS',90,4);
INSERT INTO "skills" VALUES(5,1,'TailwindCSS',90,5);
INSERT INTO "skills" VALUES(6,1,'TypeScript',85,6);
INSERT INTO "skills" VALUES(7,1,'Zustand',80,7);
INSERT INTO "skills" VALUES(8,2,'Node.js',85,1);
INSERT INTO "skills" VALUES(9,2,'FastAPI',85,2);
INSERT INTO "skills" VALUES(11,3,'Python',95,1);
INSERT INTO "skills" VALUES(12,3,'Boto3',80,2);
INSERT INTO "skills" VALUES(13,3,'LangGraph',75,3);
INSERT INTO "skills" VALUES(14,3,'Pandas',90,4);
INSERT INTO "skills" VALUES(15,3,'Numpy',85,5);
INSERT INTO "skills" VALUES(16,3,'Selenium',80,6);
INSERT INTO "skills" VALUES(17,3,'MySQL',80,7);
INSERT INTO "skills" VALUES(18,3,'Elasticsearch',75,8);
INSERT INTO "skills" VALUES(19,3,'Kibana',75,9);
INSERT INTO "skills" VALUES(20,3,'Grafana',70,10);
INSERT INTO "skills" VALUES(21,3,'Airflow',75,11);
INSERT INTO "skills" VALUES(22,3,'Prometheus',70,12);
INSERT INTO "skills" VALUES(23,4,'AWS',80,1);
INSERT INTO "skills" VALUES(24,4,'GCP',80,2);
INSERT INTO "skills" VALUES(25,4,'Cloudflare',75,3);
INSERT INTO "skills" VALUES(26,2,'Flask',80,3);
INSERT INTO "skills" VALUES(27,2,'Kubernetes',80,4);
CREATE TABLE projects (
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
, process TEXT, process_ko TEXT, developed TEXT, developed_ko TEXT);
INSERT INTO "projects" VALUES(1,'lg-business-cloud-chatbot','LG Business Cloud Chatbot Development','LG 비즈니스 클라우드 챗봇 개발','Developed a chatbot for LG Business Cloud with a focus on facilitating user access to information through a responsive and dynamic chat interface.','RAG를 활용한 고객 경험 향상 및 Pain Point를 해결하기 위해 LG Business Cloud Chatbot을 개발','User-centric chatbot development focusing on RAG integration and real-time communication via WebSockets.','프론트엔드 1명, 백엔드 2명 팀 프로젝트. RAG 기반 정확한 답변 제공 및 WebSocket 실시간 통신 구현.',NULL,'https://lgbusinesscloud.com/home/',NULL,'["Vite", "React", "HTML", "CSS", "TailwindCSS", "TypeScript", "AWS Bedrock", "AWS Lambda", "API Gateway", "WebSocket", "Jenkins"]',NULL,1,1,'2026-01-11 14:17:36','["Developed in a small team consisting of 1 frontend developer (myself) and 2 backend developers", "Designed to allow LG Business Cloud solution users to easily access necessary information", "Provides answers to solution-related questions, troubleshooting guides, and a button-type UI for frequently asked questions", "Implemented RAG (Retrieval Augmented Generation) based on internal documents to provide accurate answers", "Vectorized technical documentation and FAQ data to build a search infrastructure", "Implemented document search and summarization functions tailored to the user''s question intent"]','["프론트엔드 개발자 1명(본인), 백엔드 개발자 2명으로 구성된 소규모 팀으로 개발 진행", "LG Business Cloud 솔루션 사용자들이 필요한 정보를 쉽게 얻을 수 있도록 설계", "솔루션 관련 질문 답변, 문제 해결 가이드, 자주 묻는 질문 버튼형 UI 제공", "사내 문서 기반 RAG(Retrieval Augmented Generation) 구현으로 정확한 답변 제공", "기술문서 및 FAQ 데이터를 벡터화하여 검색 인프라 구축", "사용자 질문 의도에 맞는 문서 검색 및 요약 기능 구현"]','["Directly implemented chat message display and input components (minimized use of external libraries)", "Real-time message streaming processing using WebSocket", "Implemented connection maintenance and reconnection logic with the server", "Rendering branching processing according to message type (text, HTML, buttons, etc.)", "Integrated interface for button-type quick responses and natural language question processing", "Dynamic generation function for recommended question buttons by situation", "Implemented customized recommendation logic based on user login count and license holdings", "Applied responsive design for mobile environment support", "Designed API interface and defined data structure with backend developers", "Defined interface for RESTful API and WebSocket communication", "Improved communication efficiency with message packet optimization", "Responsible for deploying final build files to S3 static hosting", "Led monitoring, bug fixing, and performance improvement work after launch"]','["채팅 메시지 표시 및 입력 컴포넌트 직접 구현 (외부 라이브러리 사용 최소화)", "WebSocket을 활용한 실시간 메시지 스트리밍 처리", "서버와의 연결 유지 및 재연결 로직 구현", "메시지 타입에 따른 렌더링 분기 처리 (텍스트, HTML, 버튼 등)", "버튼형 빠른 응답과 자연어 질문 처리를 위한 통합 인터페이스", "상황별 추천 질문 버튼 동적 생성 기능", "사용자 로그인 횟수 및 라이센스 보유 기반 맞춤형 추천 로직 구현", "모바일 환경 대응을 위한 반응형 디자인 적용", "백엔드 개발자들과 API 인터페이스 설계 및 데이터 구조 정의", "RESTful API와 WebSocket 통신을 위한 인터페이스 정의", "메시지 패킷 최적화로 통신 효율성 향상", "최종 빌드 파일 S3 정적 호스팅으로 배포 담당", "출시 후 모니터링 및 버그 수정, 성능 개선 작업 주도"]');
INSERT INTO "projects" VALUES(2,'led-outsourcing-system','In-house LED Outsourcing Team System Development','사내 LED 아웃소싱 팀 시스템 개발','Led the development of a comprehensive business system for data management and analysis, including visualization and ETL.','LED 아웃소싱 팀을 지원하기 위해 데이터 관리 및 분석을 위한 사내 업무용 시스템을 개발','Comprehensive ETL and visualization system using GCP BigQuery, FastAPI, and React.','1인 개발 전담. 데이터 추출/전처리/시각화/ETL 전 과정 수행. GCP BigQuery 및 Elasticsearch 활용.',NULL,NULL,NULL,'["React", "JavaScript", "HTML", "CSS", "FastAPI", "Pandas", "Numpy", "GCP BigQuery", "MariaDB", "Elasticsearch", "Kibana", "Airflow", "Docker"]',NULL,0,2,'2026-01-11 14:17:36',NULL,NULL,NULL,NULL);
INSERT INTO "projects" VALUES(3,'quality-monitoring-system','In-house ILO Outsourcing Quality Monitoring System','사내 ILO 아웃소싱 품질 모니터링 시스템','Spearheaded the development of a system to extract data from various company systems, load it into GCP, and preprocess the data in BigQuery.','공정 내 발생하는 품질 문제를 효과적으로 처리하고 해결하기 위한 사내 품질 모니터링 시스템을 개발','Quality monitoring system with automated data pipelines and dashboard visualization.','품질 모니터링 자동화 시스템. 데이터 수집/분석/전처리 및 대시보드 개발.',NULL,NULL,NULL,'["React", "JavaScript", "HTML", "CSS", "TailwindCSS", "FastAPI", "Pandas", "Numpy", "GCP BigQuery", "Airflow", "SQL", "Docker"]',NULL,0,3,'2026-01-11 14:17:36',NULL,NULL,NULL,NULL);
CREATE TABLE contact_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL, -- email, phone, github, linkedin, etc.
    value TEXT NOT NULL,
    label TEXT,
    label_ko TEXT,
    icon TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);
INSERT INTO "contact_info" VALUES(8,'email','jkapa0417@gmail.com','Email',NULL,'email',1,1);
INSERT INTO "contact_info" VALUES(9,'github','https://github.com/jkapa0417','Github',NULL,'github',1,2);
INSERT INTO "contact_info" VALUES(10,'linkedin','https://www.linkedin.com/in/jun-ki-ahn-ab77481a1','Linkedin',NULL,'linkedin',1,3);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('categories',4);
INSERT INTO "sqlite_sequence" VALUES('contact_info',10);
INSERT INTO "sqlite_sequence" VALUES('skill_categories',4);
INSERT INTO "sqlite_sequence" VALUES('skills',27);
INSERT INTO "sqlite_sequence" VALUES('careers',5);
INSERT INTO "sqlite_sequence" VALUES('projects',3);
INSERT INTO "sqlite_sequence" VALUES('posts',4);
INSERT INTO "sqlite_sequence" VALUES('comments',5);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
