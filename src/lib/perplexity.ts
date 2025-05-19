import { Perplexity } from '@perplexity/api';

const perplexity = new Perplexity({
  apiKey: process.env.PERPLEXITY_API_KEY!,
});

export async function findProfessorsWithPerplexity(
  interests: string[],
  universities: string[] = []
): Promise<Array<{
  name: string;
  email: string;
  university: string;
  department: string;
  researchAreas: string[];
}>> {
  const interestsStr = interests.join(', ');
  const universitiesStr = universities.length > 0 ? ` at ${universities.join(', ')}` : '';

  const prompt = `Find professors who research ${interestsStr}${universitiesStr}. For each professor, provide:
1. Full name
2. Email address
3. University
4. Department
5. Research areas

Format the response as a JSON array of objects with these fields:
{
  "name": "Professor's full name",
  "email": "professor@university.edu",
  "university": "University name",
  "department": "Department name",
  "researchAreas": ["Area 1", "Area 2", ...]
}

Only include professors whose email addresses are publicly available on their university website or department page.`;

  try {
    const response = await perplexity.chat.completions.create({
      model: 'sonar-medium-online',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that finds information about professors and their research interests.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from Perplexity API');
    }

    // Parse the JSON response
    const professors = JSON.parse(content);
    return professors;
  } catch (error) {
    console.error('Error finding professors with Perplexity:', error);
    throw new Error('Failed to find professors. Please try again.');
  }
} 