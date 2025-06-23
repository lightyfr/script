
/**
 * Email Generation Templates for Different Campaign Types
 * 
 * Universal field mapping:
 * - RESEARCH: research_interests = research topics, target_universities = universities
 * - INTERNSHIP: research_interests = internship roles, target_universities = companies  
 * - JOB: research_interests = job roles, target_universities = companies
 * - CUSTOM: research_interests = target audience, target_universities = organizations, custom_prompt = purpose
 */

export type CampaignType = "research" | "internship" | "job" | "custom";

interface Contact {
  name: string;
  email: string;
  university: string; // For non-research: company/organization name
  department: string; // For non-research: role/department
  researchAreas: string[]; // For non-research: areas of focus/expertise
}

interface StudentInfo {
  name: string;
  email: string;
}

interface Campaign {
  id: string;
  user_id: string;
  type: CampaignType;
  research_interests: string[]; // Universal field
  target_universities: string[]; // Universal field  
  custom_prompt?: string;
  max_emails: number;
  status: string;
}

interface EmailTemplate {
  type: CampaignType;
  generatePrompt: (data: {
    contact: Contact;
    studentInfo: StudentInfo;
    interests: string[]; // Maps to campaign.research_interests
    organizations: string[]; // Maps to campaign.target_universities
    customPrompt?: string; // Maps to campaign.custom_prompt
  }) => string;
  getSubjectLine: (data: {
    contact: Contact;
    interests: string[];
    studentInfo: StudentInfo;
  }) => string;
}

export const emailTemplates: Record<CampaignType, EmailTemplate> = {
  research: {
    type: "research",
    generatePrompt: ({ contact, studentInfo, interests }) => {
      return `You are an AI assistant helping a student write a highly personalized, professional outreach email to a professor.

Whatever you generate are final emails sent to professors, so you must be careful not to have any placeholders or instructions in the email.

Student Information:
- Name: ${studentInfo.name}
- Email: ${studentInfo.email}
- Research Interests: ${interests.join(", ")}

Professor's Information:
- Name: ${contact.name}
- University: ${contact.university}
- Department: ${contact.department}
- Research Areas: ${contact.researchAreas.join(", ")}

The student's resume is provided below. Use the resume to extract and include specific, relevant skills, projects, and experiences.

Write the email as if the student is writing it themselves, in a natural, engaging, and professional tone for academic research outreach.

Strict requirements:
- Email needs to be short and concise, clearly label the ask and what the student can offer
- Show genuine interest in the professor's research and mention specific work if possible
- Offer to contribute through data analysis, research assistance, or relevant skills
- Do NOT leave any template language, placeholders, or instructions in the email
- The recipient won't see the resume attached, so do not directly reference it
- Fill in every field with real, specific details from the resume and the professor's research
- Use clean whitespace and bullet points where appropriate
- Researchers are busy, so make your email short and to the point
- Mention a specific publication, project, or research area of the professor if possible
- Summarize 1-2 relevant skills and 1-2 relevant projects or experiences from the student's resume
- The email must be ready to send as-is, with all details filled in (no placeholders)
- Do NOT include any commentary, instructions, or formatting outside the email body
- Do NOT include any phrases insinuating you are a generated response
- End with the student's real name and contact information in the signature
- Markdown is not supported
- Do NOT include a subject line in your response
- Must not contain characters outside of the Latin1 range
- Focus on research collaboration and academic opportunities`;
    },
    getSubjectLine: ({ contact, interests }) => {
      const primaryInterest = interests[0] || "Research";
      return `Research Opportunity Inquiry - ${primaryInterest}`;
    }
  },

  internship: {
    type: "internship",
    generatePrompt: ({ contact, studentInfo, interests, organizations }) => {
      return `You are an AI assistant helping a student write a highly personalized, professional outreach email to a hiring manager or recruiter for internship opportunities.

Whatever you generate are final emails sent to industry professionals, so you must be careful not to have any placeholders or instructions in the email.

Student Information:
- Name: ${studentInfo.name}
- Email: ${studentInfo.email}
- Target Roles: ${interests.join(", ")}
- Target Companies: ${organizations.join(", ")}

Contact Information:
- Name: ${contact.name}
- Company: ${contact.university} 
- Role/Department: ${contact.department}
- Areas of Focus: ${contact.researchAreas.join(", ")}

The student's resume is provided below. Use the resume to extract and include specific, relevant skills, projects, and experiences.

Write the email as if the student is writing it themselves, in a natural, engaging, and professional tone for internship applications.

Strict requirements:
- Email needs to be short and concise, clearly state interest in internship opportunities
- Show genuine interest in the company and specific internship roles
- Highlight relevant skills, projects, and experiences from the resume
- Express enthusiasm for learning and contributing to the team
- Do NOT leave any template language, placeholders, or instructions in the email
- The recipient won't see the resume attached, so do not directly reference it
- Fill in every field with real, specific details from the resume and the contact's background
- Use clean whitespace and bullet points where appropriate
- Professionals are busy, so make your email short and to the point
- Mention specific company projects, values, or initiatives if possible
- Summarize 2-3 relevant skills and 1-2 relevant projects or experiences from the student's resume
- The email must be ready to send as-is, with all details filled in (no placeholders)
- Do NOT include any commentary, instructions, or formatting outside the email body
- Do NOT include any phrases insinuating you are a generated response
- End with the student's real name and contact information in the signature
- Markdown is not supported
- Do NOT include a subject line in your response
- Must not contain characters outside of the Latin1 range
- Focus on internship opportunities and professional development`;
    },
    getSubjectLine: ({ interests, studentInfo }) => {
      const primaryRole = interests[0] || "Internship";
      return `${primaryRole} Internship Application - ${studentInfo.name}`;
    }
  },

  job: {
    type: "job",
    generatePrompt: ({ contact, studentInfo, interests, organizations }) => {
      return `You are an AI assistant helping a student write a highly personalized, professional outreach email to a hiring manager or recruiter for full-time job opportunities.

Whatever you generate are final emails sent to industry professionals, so you must be careful not to have any placeholders or instructions in the email.

Student Information:
- Name: ${studentInfo.name}
- Email: ${studentInfo.email}
- Target Roles: ${interests.join(", ")}
- Target Companies: ${organizations.join(", ")}

Contact Information:
- Name: ${contact.name}
- Company: ${contact.university}
- Role/Department: ${contact.department}
- Areas of Focus: ${contact.researchAreas.join(", ")}

The student's resume is provided below. Use the resume to extract and include specific, relevant skills, projects, and experiences.

Write the email as if the student is writing it themselves, in a natural, engaging, and professional tone for full-time job applications.

Strict requirements:
- Email needs to be short and concise, clearly state interest in full-time job opportunities
- Show genuine interest in the company and specific job roles
- Highlight relevant skills, experiences, and achievements from the resume
- Demonstrate value you can bring to the organization immediately
- Do NOT leave any template language, placeholders, or instructions in the email
- The recipient won't see the resume attached, so do not directly reference it
- Fill in every field with real, specific details from the resume and the contact's background
- Use clean whitespace and bullet points where appropriate
- Professionals are busy, so make your email short and to the point
- Mention specific company projects, values, or initiatives if possible
- Summarize 2-3 relevant skills and 2-3 relevant projects or experiences from the student's resume
- The email must be ready to send as-is, with all details filled in (no placeholders)
- Do NOT include any commentary, instructions, or formatting outside the email body
- Do NOT include any phrases insinuating you are a generated response
- End with the student's real name and contact information in the signature
- Markdown is not supported
- Do NOT include a subject line in your response
- Must not contain characters outside of the Latin1 range
- Focus on full-time employment opportunities and career growth`;
    },
    getSubjectLine: ({ interests, studentInfo }) => {
      const primaryRole = interests[0] || "Position";
      return `${primaryRole} Application - ${studentInfo.name}`;
    }
  },

  custom: {
    type: "custom",
    generatePrompt: ({ contact, studentInfo, interests, organizations, customPrompt }) => {
      if (!customPrompt) {
        throw new Error("Custom prompt is required for custom campaign type");
      }

      return `You are an AI assistant helping a student write a highly personalized, professional outreach email for a custom purpose.

Whatever you generate are final emails sent to professionals, so you must be careful not to have any placeholders or instructions in the email.

Student Information:
- Name: ${studentInfo.name}
- Email: ${studentInfo.email}
- Target Audience: ${interests.join(", ")}
- Target Organizations: ${organizations.join(", ")}

Contact Information:
- Name: ${contact.name}
- Organization: ${contact.university}
- Role/Department: ${contact.department}
- Areas of Focus: ${contact.researchAreas.join(", ")}

Custom Outreach Purpose:
${customPrompt}

The student's resume is provided below. Use the resume to extract and include specific, relevant skills, projects, and experiences.

Write the email as if the student is writing it themselves, in a natural, engaging, and professional tone that aligns with the custom outreach purpose described above.

Strict requirements:
- Email needs to be short and concise, clearly state the purpose as described in the custom prompt
- Show genuine interest in the contact's work and align with the outreach purpose
- Highlight relevant skills and experiences from the resume that relate to the outreach purpose
- Do NOT leave any template language, placeholders, or instructions in the email
- The recipient won't see the resume attached, so do not directly reference it
- Fill in every field with real, specific details from the resume and the contact's background
- Use clean whitespace and bullet points where appropriate
- Professionals are busy, so make your email short and to the point
- Mention specific aspects of the contact's work that relate to your outreach purpose
- Summarize relevant skills and experiences from the student's resume that align with the purpose
- The email must be ready to send as-is, with all details filled in (no placeholders)
- Do NOT include any commentary, instructions, or formatting outside the email body
- Do NOT include any phrases insinuating you are a generated response
- End with the student's real name and contact information in the signature
- Markdown is not supported
- Do NOT include a subject line in your response
- Must not contain characters outside of the Latin1 range
- Focus on the specific purpose outlined in the custom prompt`;
    },
    getSubjectLine: ({ studentInfo }) => {
      return `Professional Outreach - ${studentInfo.name}`;
    }
  }
};

export function getEmailTemplate(campaignType: CampaignType): EmailTemplate {
  const template = emailTemplates[campaignType];
  if (!template) {
    throw new Error(`Unknown campaign type: ${campaignType}`);
  }
  return template;
}

export function generateEmailPrompt(
  campaignType: CampaignType,
  contact: Contact,
  studentInfo: StudentInfo,
  campaign: Campaign
): string {
  const template = getEmailTemplate(campaignType);
  
  return template.generatePrompt({
    contact,
    studentInfo,
    interests: campaign.research_interests, // Universal field
    organizations: campaign.target_universities, // Universal field
    customPrompt: campaign.custom_prompt
  });
}

export function generateSubjectLine(
  campaignType: CampaignType,
  contact: Contact,
  studentInfo: StudentInfo,
  campaign: Campaign
): string {
  const template = getEmailTemplate(campaignType);
  
  return template.getSubjectLine({
    contact,
    studentInfo,
    interests: campaign.research_interests // Universal field
  });
}
