import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

const SEO = ({
    title,
    description = "Full Stack Developer Portfolio. Specializing in Frontend (React, TypeScript) and Backend (Node.js, Python) development. View my projects and skills.",
    keywords = "Full Stack Developer, Frontend Developer, Backend Developer, Software Engineer, Web Developer, React Developer, Node.js Developer, Python Developer, AI Engineer, Artificial Intelligence, LLM, Large Language Models, Generative AI, RAG, Prompt Engineering, JavaScript, TypeScript, React.js, FastAPI, Flask, Cloud Computing, AWS, GCP, Cloudflare, UI/UX, Responsive Web Design, Portfolio, Hire Developer, Web Application, Single Page Application, SPA, Modern Web Development, Seoul Developer, Remote Developer, 풀스택 개발자, 프론트엔드 개발자, 백엔드 개발자, AI 엔지니어, 인공지능, LLM, 대규모 언어 모델, 생성형 AI, RAG, 프롬프트 엔지니어링, 웹 개발자, 소프트웨어 엔지니어, 리액트 개발자, 자바스크립트, 타입스크립트, 노드JS, 파이썬, 클라우드 컴퓨팅, 웹사이트 제작, 포트폴리오, 개발자 채용, 앱 개발",
    image = "/favicon.svg",
    url = "https://junki-portfolio.com",
    type = "website"
}: SEOProps) => {
    const siteTitle = title ? `${title} | Jun Ki Ahn` : "Jun Ki Ahn - Full Stack Developer Portfolio";

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
