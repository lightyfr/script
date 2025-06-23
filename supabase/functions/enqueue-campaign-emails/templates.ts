export type CampaignType = "research" | "internship" | "job" | "custom";

interface PromptTemplate {
  type: CampaignType;
  generatePrompt: (data: {
    interests: string[];
    universities: string[];
    companies?: string[];
    roles?: string[];
    customPrompt?: string;
    maxEmails: number;
  }) => string;
}

export const promptTemplates: Record<CampaignType, PromptTemplate> = {
  research: {
    type: "research",
    generatePrompt: ({ interests, universities, maxEmails }) => {
      const interestsStr = interests.join(", ");
      const universitiesStr = universities.length > 0 ? ` at ${universities.join(", ")}` : "";
      
      return `Find ${maxEmails} professors who research ${interestsStr}${universitiesStr}.
For each professor, provide:
- Full name
- Email address (must be publicly available on their university website or department page)
- University
- Department
- Research areas (3-5 key areas)

Write it in a JSON array with these fields:
{
  "name": "Professor's full name",
  "email": "professor@university.edu",
  "university": "University name",
  "department": "Department name",
  "researchAreas": ["Area 1", "Area 2", ...]
}

IMPORTANT: Output ONLY the JSON array. Do NOT include any explanation, commentary, or text before or after the JSON. Do not say anything else. Do not leave any fields null. If you don't know the email address of a professor, don't include that professor in the list. Don't hallucinate and make up professors.
Only include professors with valid email addresses. If a professor's email is not publicly available, do not include them in the results.`;
    }
  },

  internship: {
    type: "internship",
    generatePrompt: ({ roles, companies, maxEmails }) => {
      const rolesStr = roles?.join(", ") || "various internship positions";
      const companiesStr = companies?.length ? ` at ${companies.join(", ")}` : "";
      
      return `Find ${maxEmails} hiring managers, recruiters, or HR professionals who handle internship positions for ${rolesStr}${companiesStr}.
For each contact, provide:
- Full name
- Email address (must be publicly available on company website, LinkedIn, or professional directories)
- Company
- Department/Role (e.g., "Human Resources", "Talent Acquisition", "Engineering Manager")
- Areas of focus (relevant to the internship roles)

Write it in a JSON array with these fields:
{
  "name": "Contact's full name",
  "email": "contact@company.com",
  "university": "Company name",
  "department": "Department/Role",
  "researchAreas": ["Area 1", "Area 2", ...]
}

IMPORTANT: Output ONLY the JSON array. Do NOT include any explanation, commentary, or text before or after the JSON. Do not say anything else. Do not leave any fields null. If you don't know the email address of a contact, don't include that contact in the list. Don't hallucinate and make up contacts.
Only include contacts with valid email addresses. Focus on people who are likely to handle internship applications or hiring decisions.`;
    }
  },

  job: {
    type: "job",
    generatePrompt: ({ roles, companies, maxEmails }) => {
      const rolesStr = roles?.join(", ") || "various job positions";
      const companiesStr = companies?.length ? ` at ${companies.join(", ")}` : "";
      
      return `Find ${maxEmails} hiring managers, recruiters, or team leads who handle full-time job positions for ${rolesStr}${companiesStr}.
For each contact, provide:
- Full name
- Email address (must be publicly available on company website, LinkedIn, or professional directories)
- Company
- Department/Role (e.g., "Engineering Manager", "Talent Acquisition", "VP of Engineering")
- Areas of focus (relevant to the job roles)

Write it in a JSON array with these fields:
{
  "name": "Contact's full name",
  "email": "contact@company.com",
  "university": "Company name",
  "department": "Department/Role",
  "researchAreas": ["Area 1", "Area 2", ...]
}

IMPORTANT: Output ONLY the JSON array. Do NOT include any explanation, commentary, or text before or after the JSON. Do not say anything else. Do not leave any fields null. If you don't know the email address of a contact, don't include that contact in the list. Don't hallucinate and make up contacts.
Only include contacts with valid email addresses. Focus on people who are likely to handle job applications or hiring decisions.`;
    }
  },

  custom: {
    type: "custom",
    generatePrompt: ({ customPrompt, maxEmails }) => {
      if (!customPrompt) {
        throw new Error("Custom prompt is required for custom campaign type");
      }
      
      return `Based on this custom request: "${customPrompt}"
Find ${maxEmails} relevant contacts who match this criteria.
For each contact, provide:
- Full name
- Email address (must be publicly available)
- Organization/Company
- Department/Role
- Areas of focus or expertise

Write it in a JSON array with these fields:
{
  "name": "Contact's full name",
  "email": "contact@organization.com",
  "university": "Organization name",
  "department": "Department/Role",
  "researchAreas": ["Area 1", "Area 2", ...]
}

IMPORTANT: Output ONLY the JSON array. Do NOT include any explanation, commentary, or text before or after the JSON. Do not say anything else. Do not leave any fields null. If you don't know the email address of a contact, don't include that contact in the list. Don't hallucinate and make up contacts.
Only include contacts with valid email addresses.`;
    }
  }
};

export function getPromptForCampaign(
  type: CampaignType,
  data: {
    interests: string[];
    universities: string[];
    companies?: string[];
    roles?: string[];
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

