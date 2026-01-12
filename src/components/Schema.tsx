import { Helmet } from 'react-helmet-async';

interface SchemaProps {
    type: 'Person' | 'WebSite' | 'BlogPosting';
    data: Record<string, any>;
}

const Schema = ({ type, data }: SchemaProps) => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': type,
        ...data,
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export const PersonSchema = () => (
    <Schema
        type="Person"
        data={{
            name: "Jun Ki Ahn",
            url: "https://junki-portfolio.com",
            logo: "https://junki-portfolio.com/favicon.svg",
            sameAs: [
                "https://github.com/jkapa0417", // Replace with actual profile
                "https://www.linkedin.com/in/junki-ahn-1b1b1b1b/" // Replace with actual profile if different
            ],
            jobTitle: ["Full Stack Developer", "Frontend Developer", "Software Engineer", "AI Engineer"],
            worksFor: {
                "@type": "Organization",
                "name": "LG Electronics"
            },
            description: "Full Stack Developer specializing in modern web technologies, cloud infrastructure, and AI solutions.",
            knowsAbout: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Artificial Intelligence", "LLM", "Generative AI", "RAG", "Cloud Computing", "Web Development"]
        }}
    />
);

export const WebSiteSchema = () => (
    <Schema
        type="WebSite"
        data={{
            name: "Jun Ki Ahn Portfolio",
            url: "https://junki-portfolio.com",
            potentialAction: {
                "@type": "SearchAction",
                target: "https://junki-portfolio.com/blog?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        }}
    />
);

export const BlogPostingSchema = ({
    title,
    description,
    datePublished,
    authorName = "Jun Ki Ahn",
    image
}: {
    title: string;
    description: string;
    datePublished: string;
    authorName?: string;
    image?: string;
}) => (
    <Schema
        type="BlogPosting"
        data={{
            headline: title,
            description: description,
            datePublished: datePublished,
            author: {
                "@type": "Person",
                name: authorName
            },
            image: image ? [image] : undefined,
            publisher: {
                "@type": "Organization",
                name: "Jun Ki Ahn",
                logo: {
                    "@type": "ImageObject",
                    url: "https://junki-portfolio.com/favicon.svg"
                }
            }
        }}
    />
);

export default Schema;
