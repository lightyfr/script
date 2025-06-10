import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface Professor {
  name: string;
  email: string;
  university: string;
  department: string;
  researchAreas: string[];
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY;
  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${res.statusText} - ${errorText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function generateExampleEmail(
  researchInterests: string[],
  studentInfo: { name: string; email: string; phone?: string | null },
  hasSuper: boolean
): Promise<string> {
  // Create a sample professor based on research interests
  const sampleProfessor: Professor = {
    name: "Dr. Sarah Johnson",
    email: "s.johnson@university.edu",
    university: "Stanford University",
    department: "Computer Science",
    researchAreas: researchInterests.slice(0, 2) // Use first 2 research interests
  };

  // Use the same prompt structure as the edge function
  let promptText = `You are an AI assistant helping a student write a highly personalized, professional outreach email to a professor.

Student Information:
- Name: ${studentInfo.name}
- Email: ${studentInfo.email}${studentInfo.phone ? `\n- Phone: ${studentInfo.phone}` : ''}

Professor's Information:
- Name: ${sampleProfessor.name}
- University: ${sampleProfessor.university}
- Department: ${sampleProfessor.department}
- Research Areas: ${sampleProfessor.researchAreas.join(", ")}

Write the email as if the student is writing it themselves, in a natural, engaging, and professional tone.

Strict requirements:
- Do NOT leave any template language, placeholders, or instructions in the email.
- Fill in every field with real, specific details and the professor's research.
- Mention a specific publication, project, or research area of the professor if possible.
- The email must be ready to send as-is, with all details filled in.
- Do NOT include any commentary, instructions, or formatting outside the email body.
- End with the student's real name and contact information in the signature.
- Keep the email concise and focused (around 150-200 words).

${!hasSuper ? '\n- Add "Sent with Script" at the very end of the email after the signature.' : ''}

Return only the email content, nothing else.`;

  const email = await callGemini(promptText);
  return email;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { researchInterests, hasSuper } = body;

    if (!researchInterests || !Array.isArray(researchInterests) || researchInterests.length === 0) {
      return NextResponse.json({ error: 'Research interests are required' }, { status: 400 });
    }

    // Mock student info for preview (in real implementation, you'd fetch from database)
    const studentInfo = {
      name: "John Smith",
      email: "john.smith@student.edu",
      phone: "+1 (555) 123-4567"
    };

    const exampleEmail = await generateExampleEmail(researchInterests, studentInfo, hasSuper);

    return NextResponse.json({ 
      success: true, 
      email: exampleEmail,
      professor: {
        name: "Dr. Sarah Johnson",
        university: "Stanford University",
        department: "Computer Science"
      }
    });

  } catch (error) {
    console.error('Error generating example email:', error);
    return NextResponse.json(
      { error: 'Failed to generate example email' },
      { status: 500 }
    );
  }
}
