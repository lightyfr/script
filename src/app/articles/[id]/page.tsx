import { notFound } from 'next/navigation';
import { Column, Heading, Text, Card, Row, Button } from "@/once-ui/components";
import Link from "next/link";

// Mock article data - in a real app, this would come from a CMS or database
const articles = [
  {
    id: 1,
    title: "Getting Started with Script: A Student's Guide",
    content: [
      "Script is designed to help students like you connect with professors and find research opportunities. Whether you're an undergraduate looking for your first research experience or a graduate student seeking to collaborate, Script provides the tools you need to succeed.",
      "## Why Research Matters",
      "Engaging in research as a student can be a transformative experience. It allows you to apply classroom knowledge to real-world problems, develop critical thinking skills, and build relationships with faculty members who can mentor you throughout your academic and professional journey.",
      "## How to Get Started",
      "1. Complete your profile with your academic interests and research experience\n2. Browse through available research opportunities\n3. Connect with professors whose work aligns with your interests\n4. Send personalized messages to express your interest in their research",
      "## Making the Most of Script",
      "- Set up email notifications for new opportunities in your field\n- Save interesting professors to your favorites\n- Track your outreach and follow up when needed"
    ],
    category: "Getting Started",
    readTime: "5 min read",
    date: "May 15, 2025",
    author: "Script Team"
  },
  {
    id: 2,
    title: "Success Story: How I Landed My Dream Research Position",
    content: [
      "When I first started using Script, I was a second-year computer science student with a passion for machine learning but no research experience. I had reached out to several professors through traditional channels but hadn't heard back from any of them.",
      "## Discovering the Right Opportunity",
      "Using Script's advanced search features, I was able to find professors whose research aligned perfectly with my interests in natural language processing. The platform made it easy to see which professors were actively looking for undergraduate researchers.",
      "## The Application Process",
      "I used Script's email templates as a starting point and personalized each message to reference specific papers the professors had published. Within a week, I had three responses and two interview invitations.",
      "## The Result",
      "I'm now working in the lab of Dr. Smith, where I'm helping develop new NLP models. This experience has been invaluable for my academic and professional development, and it all started with Script.",
      "## My Tips for Success\n- Be specific about your interests and how they align with the professor's work\n- Highlight relevant coursework or projects\n- Follow up if you don't hear back within a week\n- Be persistent but professional"
    ],
    category: "Success Stories",
    readTime: "8 min read",
    date: "May 10, 2025",
    author: "Alex Johnson, Computer Science Student"
  },
  {
    id: 3,
    title: "Crafting the Perfect Outreach Email",
    content: [
      "One of the most challenging aspects of finding research opportunities is writing that first email to a professor. A well-crafted message can make all the difference in getting a response.",
      "## Subject Line Matters",
      "Your subject line should be clear and specific. Instead of 'Research Opportunity,' try 'Undergraduate Research Interest in [Specific Research Area]'.",
      "## The Email Structure",
      "1. **Introduction**: State your name, year, and major\n2. **Connection**: Mention how you found them and why you're interested in their work\n3. **Value**: Highlight what you can bring to their lab\n4. **Call to Action**: Suggest next steps (e.g., meeting to discuss opportunities)",
      "## Common Mistakes to Avoid\n- Generic messages that could be sent to any professor\n- Typos or grammatical errors\n- Being too casual or too formal\n- Writing more than a few short paragraphs",
      "## Example Template\n\nSubject: Undergraduate Research Interest in [Specific Research Area]\n\nDear Dr. [Last Name],\n\nI hope this message finds you well. My name is [Your Name], and I'm a [Year] [Major] student at [University]. I came across your work on [specific research topic] and was particularly interested in your paper on [specific paper/topic].\n\n[1-2 sentences about why their research interests you and how it aligns with your academic goals]\n\nI would love the opportunity to discuss potential research opportunities in your lab. Would you be available for a brief meeting next week?\n\nThank you for your time and consideration. I look forward to your response.\n\nBest regards,\n[Your Full Name]\n[Your Contact Information]"
    ],
    category: "Tips & Tricks",
    readTime: "6 min read",
    date: "May 5, 2025",
    author: "Dr. Sarah Williams, Research Advisor"
  },
];

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = articles.find(a => a.id.toString() === params.id);
  
  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <Column className="max-w-3xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8 gap-24">
        <Column gap="16" className="text-center">
          <div>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary-subtle text-primary inline-block mb-4">
              {article.category}
            </span>
            <Heading variant="display-strong-l" className="mb-6">
              {article.title}
            </Heading>
            <div className="flex items-center justify-center gap-4 text-sm text-neutral-weak">
              <span>{article.author}</span>
              <span>•</span>
              <span>{article.date}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>
          </div>
        </Column>

      <Card padding="24" radius="l">
        <Column gap="24">
          {article.content.map((paragraph, index) => (
            <Text key={index} onBackground="neutral-strong">
              {paragraph.startsWith('#') ? (
                <Heading variant={paragraph.startsWith('##') ? 'heading-strong-m' : 'heading-strong-l'} className="mt-8 mb-4">
                  {paragraph.replace(/^#+\s*/, '')}
                </Heading>
              ) : (
                <div className="whitespace-pre-line">{paragraph}</div>
              )}
            </Text>
          ))}
        </Column>
      </Card>

        <div style={{ borderTop: '1px solid var(--color-neutral-subtle)', paddingTop: '2rem' }}>
          <Link href="/articles">
            <Button variant="secondary">
              ← Back to All Articles
            </Button>
          </Link>
        </div>
      </Column>
    </div>
  );
}
