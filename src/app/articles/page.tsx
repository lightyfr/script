"use client";

import { useState } from 'react';
import { Column, Heading, Text, Card, Row, Button } from "@/once-ui/components";
import Link from "next/link";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
}

interface ArticleCardProps {
  article: Article;
}

const containerStyle = {
  maxWidth: '64rem',
  margin: '0 auto',
  padding: '3rem 1rem',
};

const articleCardStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease-in-out'
};

const metaStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  color: 'var(--color-neutral-weak)'
};

const categoryTagStyle = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 500,
  backgroundColor: 'var(--color-primary-subtle)',
  color: 'var(--color-primary)'
};

const articles = [
  {
    id: 1,
    title: "Getting Started with Script: A Student's Guide",
    excerpt: "Learn how to make the most of Script's features to connect with professors and land research opportunities.",
    category: "Getting Started",
    readTime: "5 min read",
    date: "May 15, 2025"
  },
  {
    id: 2,
    title: "Success Story: How I Landed My Dream Research Position",
    excerpt: "John shares his journey of using Script to connect with professors and secure a research position at his top-choice lab.",
    category: "Success Stories",
    readTime: "8 min read",
    date: "May 10, 2025"
  },
  {
    id: 3,
    title: "Crafting the Perfect Outreach Email",
    excerpt: "Tips and templates for writing professional and effective emails to professors that get responses.",
    category: "Tips & Tricks",
    readTime: "6 min read",
    date: "May 5, 2025"
  },
];

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div key={article.id} style={{ height: '100%' }}>
      <Link 
        href={`/articles/${article.id}`} 
        style={{ textDecoration: 'none', height: '100%', display: 'block' }}
      >
        <Card 
          padding="24" 
          radius="l" 
          style={{
            ...articleCardStyle,
            opacity: isHovered ? 0.9 : 1
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: '16px',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={metaStyle}>
              <span style={categoryTagStyle}>
                {article.category}
              </span>
              <span>•</span>
              <Text variant="body-default-s">{article.readTime}</Text>
            </div>
            <Heading 
              variant="heading-strong-l" 
              style={{ 
                flex: '1 0 auto',
                width: '100%',
                margin: '8px 0'
              }}
            >
              {article.title}
            </Heading>
            <Text onBackground="neutral-weak" style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '8px',
              minHeight: '4.5em' // Ensure consistent height for 3 lines of text
            }}>
              {article.excerpt}
            </Text>
            <Text 
              variant="body-default-s" 
              onBackground="neutral-weak" 
              style={{ 
                marginTop: 'auto', 
                paddingTop: '8px',
                color: 'var(--color-neutral-weak)'
              }}
            >
              {article.date}
            </Text>
          </div>
        </Card>
      </Link>
    </div>
  );
};

export default function ArticlesPage() {
  return (
    <div style={containerStyle}>
      <Column gap="32">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button 
              variant="secondary" 
              size="s" 
              style={{ 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ← Back to Home
            </Button>
          </Link>
        </div>
        <Column gap="16">
          <Heading variant="display-strong-l">Articles & Resources</Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Discover helpful guides, success stories, and tips to enhance your research journey.
          </Text>
        </Column>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
          width: '100%'
        }}>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </Column>
    </div>
  );
}
