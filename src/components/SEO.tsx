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
    description = "Full Stack Developer Jun Ki Ahn's Portfolio. Expert in React, Tailwind CSS, FastAPI, Flask, Node.js, and Cloud Infrastructure (AWS, GCP, Cloudflare).",
    keywords = "Jun Ki Ahn, Full Stack Developer, React, Tailwind CSS, FastAPI, Flask, Node.js, AWS, GCP, Cloudflare, Portfolio, Web Developer",
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
