import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generatePersonalizedEmailWithClaude(
  template: string,
  professor: {
    name: string;
    university: string;
    department: string;
    researchAreas: string[];
  }
): Promise<string> {
  const prompt = `You are an AI assistant helping a student write a personalized email to a professor.

Professor's Information:
- Name: ${professor.name}
- University: ${professor.university}
- Department: ${professor.department}
- Research Areas: ${professor.researchAreas.join(', ')}

Email Template:
${template}

Please generate a personalized version of this email template, replacing the placeholders with the professor's information. Make sure to:
1. Keep the overall structure and tone of the template
2. Make the email feel personal and specific to the professor's research
3. Maintain professionalism
4. Keep the email concise and focused

Return only the personalized email text, without any additional commentary or formatting.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0].text;
    if (!content) {
      throw new Error('No response from Claude API');
    }

    return content;
  } catch (error) {
    console.error('Error generating personalized email with Claude:', error);
    throw new Error('Failed to generate personalized email. Please try again.');
  }
} 