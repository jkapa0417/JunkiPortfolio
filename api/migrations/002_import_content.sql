-- Migration script to import data from info.json

-- 1. Contact Info
INSERT INTO contact_info (key, value, label, label_ko, sort_order) VALUES 
('email', 'jkapa0417@gmail.com', 'Email', '이메일', 1);

-- 2. Skill Categories
-- Frontend
INSERT INTO skill_categories (name, name_ko, sort_order) VALUES ('Frontend Development', '프론트엔드', 1);
-- Backend
INSERT INTO skill_categories (name, name_ko, sort_order) VALUES ('Backend Development', '백엔드', 2);
-- Data & LLM
INSERT INTO skill_categories (name, name_ko, sort_order) VALUES ('Data & LLM', '데이터 및 LLM', 3);
-- Cloud
INSERT INTO skill_categories (name, name_ko, sort_order) VALUES ('Cloud', '클라우드', 4);

-- 3. Skills
-- Frontend Skills (Cat ID 1 - standard assuming auto-increment starts at 1 but better to use subqueries if possible, but for D1/SQLite specific, I'll assume sequential IDs for this initial population or use variables effectively if I could, but standard inserts are safer if I know the order)
-- Actually, let's use a trick or just simple values since we customized the tables.
-- ID 1: Frontend
INSERT INTO skills (category_id, name, level, sort_order) VALUES 
(1, 'React.js', 90, 1),
(1, 'Svelte', 80, 2),
(1, 'HTML', 95, 3),
(1, 'CSS', 90, 4),
(1, 'TailwindCSS', 90, 5),
(1, 'TypeScript', 85, 6),
(1, 'Zustand', 80, 7);

-- ID 2: Backend
INSERT INTO skills (category_id, name, level, sort_order) VALUES 
(2, 'Node.js', 85, 1),
(2, 'FastAPI', 85, 2),
(2, 'Flask', 80, 3);

-- ID 3: Data & LLM
INSERT INTO skills (category_id, name, level, sort_order) VALUES 
(3, 'Python', 95, 1),
(3, 'Boto3', 80, 2),
(3, 'LangGraph', 75, 3),
(3, 'Pandas', 90, 4),
(3, 'Numpy', 85, 5),
(3, 'Selenium', 80, 6),
(3, 'MySQL', 80, 7),
(3, 'Elasticsearch', 75, 8),
(3, 'Kibana', 75, 9),
(3, 'Grafana', 70, 10),
(3, 'Airflow', 75, 11),
(3, 'Prometheus', 70, 12);

-- ID 4: Cloud
INSERT INTO skills (category_id, name, level, sort_order) VALUES 
(4, 'AWS', 80, 1),
(4, 'GCP', 80, 2),
(4, 'Cloudflare', 75, 3);

-- 4. Careers
INSERT INTO careers (company, company_ko, position, position_ko, start_date, end_date, is_current, description, description_ko, responsibilities, sort_order) VALUES 
(
    'LG Electronics', 'LG전자',
    'Full Stack Developer', '풀스택 개발자',
    '2025-01', NULL, 1,
    'MS Data/Cloud Development Team', 'MS 데이터/클라우드 개발팀',
    '["MS Data/Cloud Development Team, Data Solution Part", "Working as Full Stack Developer & Data Scientist", "Developed AI Agent Chatbot Service for LG Business Cloud", "Developed LG Business Cloud Chatbot UI/UX", "Developed Chatbot UI/UX for In-House System", "Team Development/Operational Server Administrator", "Hardware Virtual Product Development In-House System Administrator", "Developing chatbot service for LG Electronics Information Display Marketing"]',
    1
),
(
    'LG Electronics', 'LG전자',
    'Full Stack Developer', '풀스택 개발자',
    '2024-01', '2024-12', 0,
    'ID DX/Data Solution Team', 'ID DX/데이터 솔루션 팀',
    '["Working as Full Stack Developer and Data Scientist", "Developed Usage Report using Large Language Model for Pro:Centric Cloud", "Developed LLM and RAG based Chatbot for In-House System", "Developed LG Business Cloud Chatbot", "Developed Chatbot UI/UX for In-House System", "Team Development/Operational Server Administrator", "In-House VPD System Administrator", "In-House Department System Administrator", "Participated in Industry-Academia Project with Seoul National University of Science and Education"]',
    2
),
(
    'LG Electronics', 'LG전자',
    'Full Stack Developer', '풀스택 개발자',
    '2022-05', '2023-12', 0,
    'ID DX/VPD System Development Task Team', 'ID DX/VPD 시스템 개발 태스크 팀',
    '["Created In-House system for LED Outsourcing Team", "Developed LG In-House VPD Management System", "Team Development/Operation Server Maintenance Administrator", "Developed CX System Dashboard in In-House System", "ID In-House System Administrator"]',
    3
),
(
    'LG Electronics', 'LG전자',
    'Data Scientist', '데이터 과학자',
    '2022-04', '2022-12', 0,
    'BS Solution Task Team', 'BS ILO Task',
    '["Created BS ILO Process Quality Analysis Monitoring Automation System", "Participated in Dashboard Development/Operation", "ILO Data Collection Analysis and Preprocessing", "Managed GCP VM (Ubuntu OS) Server", "Development of common code for horizontal deployment of enterprise systems"]',
    4
),
(
    'LG Electronics', 'LG전자',
    'Research and Development Engineer', '연구개발 엔지니어',
    '2021-07', '2022-04', 0,
    'ID Advanced Convergence Solution Project Team', 'ID 첨단 융합 솔루션 프로젝트 팀',
    '["Embedded System Developer", "Computer Vision and AI", "Developed Gaze Tracking Mouse Control Service for KIOSK", "Developed Hand Mouse System for KIOSK"]',
    5
);

-- 5. Projects
INSERT INTO projects (slug, title, title_ko, description, description_ko, long_description, long_description_ko, demo_url, technologies, is_featured, sort_order) VALUES 
(
    'lg-business-cloud-chatbot',
    'LG Business Cloud Chatbot Development', 'LG 비즈니스 클라우드 챗봇 개발',
    'Developed a chatbot for LG Business Cloud with a focus on facilitating user access to information through a responsive and dynamic chat interface.',
    'RAG를 활용한 고객 경험 향상 및 Pain Point를 해결하기 위해 LG Business Cloud Chatbot을 개발',
    'User-centric chatbot development focusing on RAG integration and real-time communication via WebSockets.',
    '프론트엔드 1명, 백엔드 2명 팀 프로젝트. RAG 기반 정확한 답변 제공 및 WebSocket 실시간 통신 구현.',
    'https://lgbusinesscloud.com/home/',
    '["Vite", "React", "HTML", "CSS", "TailwindCSS", "TypeScript", "AWS Bedrock", "AWS Lambda", "API Gateway", "WebSocket", "Jenkins"]',
    1, 1
),
(
    'led-outsourcing-system',
    'In-house LED Outsourcing Team System Development', '사내 LED 아웃소싱 팀 시스템 개발',
    'Led the development of a comprehensive business system for data management and analysis, including visualization and ETL.',
    'LED 아웃소싱 팀을 지원하기 위해 데이터 관리 및 분석을 위한 사내 업무용 시스템을 개발',
    'Comprehensive ETL and visualization system using GCP BigQuery, FastAPI, and React.',
    '1인 개발 전담. 데이터 추출/전처리/시각화/ETL 전 과정 수행. GCP BigQuery 및 Elasticsearch 활용.',
    NULL,
    '["React", "JavaScript", "HTML", "CSS", "FastAPI", "Pandas", "Numpy", "GCP BigQuery", "MariaDB", "Elasticsearch", "Kibana", "Airflow", "Docker"]',
    0, 2
),
(
    'quality-monitoring-system',
    'In-house ILO Outsourcing Quality Monitoring System', '사내 ILO 아웃소싱 품질 모니터링 시스템',
    'Spearheaded the development of a system to extract data from various company systems, load it into GCP, and preprocess the data in BigQuery.',
    '공정 내 발생하는 품질 문제를 효과적으로 처리하고 해결하기 위한 사내 품질 모니터링 시스템을 개발',
    'Quality monitoring system with automated data pipelines and dashboard visualization.',
    '품질 모니터링 자동화 시스템. 데이터 수집/분석/전처리 및 대시보드 개발.',
    NULL,
    '["React", "JavaScript", "HTML", "CSS", "TailwindCSS", "FastAPI", "Pandas", "Numpy", "GCP BigQuery", "Airflow", "SQL", "Docker"]',
    0, 3
);
