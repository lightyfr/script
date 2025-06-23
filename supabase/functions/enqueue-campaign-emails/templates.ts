
/**
 * Universal field mapping for different campaign types:
 * 
 * RESEARCH:
 * - interests: Research areas/topics
 * - universities: Target universities
 * 
 * INTERNSHIP: 
 * - interests: Internship roles/positions
 * - universities: Target companies
 * 
 * JOB:
 * - interests: Job roles/positions  
 * - universities: Target companies
 * 
 * CUSTOM:
 * - interests: Target audience/who you're reaching
 * - universities: Target organizations
 * - customPrompt: Details of purpose and email context
 */

export type CampaignType = "research" | "internship" | "job" | "custom";

interface PromptTemplate {
  type: CampaignType;
  generatePrompt: (data: {
    interests: string[];
    universities: string[];
    customPrompt?: string;
    maxEmails: number;
  }) => string;
}

export const promptTemplates: Record<CampaignType, PromptTemplate> = {  research: {
    type: "research",
    generatePrompt: ({ interests, universities, maxEmails }) => {
      const interestsStr = interests.join(", ");
      const universitiesStr = universities.length > 0 ? ` at ${universities.join(", ")}` : "";
      
      return `Find ${maxEmails} professors who research ${interestsStr}${universitiesStr}.
For each professor, provide:
- Full name
- Email address (from official university sources)
- University
- Department
- Research areas (3-5 key areas)

Return your response as a JSON array with this exact format:
[
  {
    "name": "Professor's Full Name",
    "email": "professor@university.edu",
    "university": "University Name",
    "department": "Department Name",
    "researchAreas": ["Area 1", "Area 2", "Area 3"]
  }
]

CRITICAL REQUIREMENTS:
- Output ONLY the JSON array, nothing else
- Only include professors with publicly available email addresses
- Do not make up or guess email addresses
- If you cannot find enough professors with verified emails, return fewer results
- Focus on quality over quantity`;
    }
  },internship: {
    type: "internship",
    generatePrompt: ({ interests, universities, maxEmails }) => {
      const rolesStr = interests.join(", ") || "various internship positions";
      const companiesStr = universities.length > 0 ? ` at ${universities.join(", ")}` : "";
      
      return `Find ${maxEmails} hiring managers, recruiters, or HR professionals who handle internship positions for ${rolesStr}${companiesStr}.
For each contact, provide:
- Full name
- Professional email address (from official company sources)
- Company name
- Their role/department
- Areas they recruit for

Return your response as a JSON array with this exact format:
[
  {
    "name": "Full Name",
    "email": "email@company.com",
    "university": "Company Name",
    "department": "Role/Department",
    "researchAreas": ["Area 1", "Area 2"]
  }
]

CRITICAL REQUIREMENTS:
- Output ONLY the JSON array, nothing else
- Only include contacts with publicly available email addresses
- Do not make up or guess email addresses
- Focus on people who commonly receive internship applications
- If you cannot find enough contacts, return fewer results`;
    }
  },  job: {
    type: "job",
    generatePrompt: ({ interests, universities, maxEmails }) => {
      const rolesStr = interests.join(", ") || "various job positions";
      const companiesStr = universities.length > 0 ? ` at ${universities.join(", ")}` : "";
      
      return `Find ${maxEmails} hiring managers, recruiters, or team leads who handle full-time job positions for ${rolesStr}${companiesStr}.
For each contact, provide:
- Full name
- Professional email address (from official company sources)
- Company name
- Their role/department
- Areas they recruit for

Return your response as a JSON array with this exact format:
[
  {
    "name": "Full Name",
    "email": "email@company.com",
    "university": "Company Name",
    "department": "Role/Department",
    "researchAreas": ["Area 1", "Area 2"]
  }
]

CRITICAL REQUIREMENTS:
- Output ONLY the JSON array, nothing else
- Only include contacts with publicly available email addresses
- Do not make up or guess email addresses
- Focus on people who commonly receive job applications
- If you cannot find enough contacts, return fewer results`;
    }
  },custom: {
    type: "custom",
    generatePrompt: ({ interests, universities, customPrompt, maxEmails }) => {
      if (!customPrompt) {
        throw new Error("Custom prompt is required for custom campaign type");
      }
      
      const audienceStr = interests.length > 0 ? ` targeting ${interests.join(", ")}` : "";
      const organizationsStr = universities.length > 0 ? ` at ${universities.join(", ")}` : "";
      
      // Cap the number for custom campaigns to be more reasonable
      const reasonableMax = Math.min(maxEmails, 15);
      
      return `You are helping a student find professional contacts for networking purposes. 

Based on this request: "${customPrompt}"

Find ${maxEmails} publicly listed professionals${audienceStr}${organizationsStr} who would be appropriate to contact for this purpose.

Focus on finding contacts who:
- Have publicly listed professional email addresses on company websites, department pages, or professional directories
- Are in positions where they commonly receive professional outreach
- Match the criteria described in the custom request

For each contact, provide:
- Full name
- Professional email address (from official sources only)
- Organization/Company name
- Their role/department
- 2-3 relevant areas of expertise

Return your response as a JSON array with this exact format:
[
  {
    "name": "Full Name",
    "email": "email@company.com",
    "university": "Organization Name",
    "department": "Role/Department",
    "researchAreas": ["Area 1", "Area 2"]
  }
]

CRITICAL REQUIREMENTS:
- Output ONLY the JSON array, nothing else
- Only include contacts with publicly available email addresses
- Do not make up or guess email addresses
- If you cannot find enough contacts with verified emails, return fewer results
- Focus on quality over quantity`;
    }
  }
};

export function getPromptForCampaign(
  type: CampaignType,
  data: {
    interests: string[];
    universities: string[];
    customPrompt?: string;
    maxEmails: number;
  }
): string {
  const template = promptTemplates[type];
  if (!template) {
    throw new Error(`Unknown campaign type: ${type}`);
  }
  
  return template.generatePrompt(data);
}

