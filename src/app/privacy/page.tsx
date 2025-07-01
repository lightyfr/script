"use client";

import React from "react";
import {
  Column,
  Row,
  Text,
  Heading,
  Card,
  Line,
  Flex,
} from "@/once-ui/components";
import { Header } from "../Header";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Flex 
      direction="column" 
      horizontal="center" 
      align="center" 
      paddingY="xl" 
      gap="xl" 
      paddingX="l" 
      background="neutral-weak"
    >
      <Header />
      
      <Column 
        horizontal="center" 
        gap="s" 
        paddingTop="xl" 
      >
        <Text variant="display-default-l" onBackground="neutral-strong" align="center">
          Privacy Policy
        </Text>
        <Text variant="body-default-l" onBackground="neutral-medium" align="center">
          Last updated: June 30, 2025
        </Text>
      </Column>

      <Column 
        padding="xl" 
        radius="l" 
        background="surface" 
        border="neutral-alpha-weak"
        maxWidth="xl"
        fillWidth
      >
        <Column gap="xl">
          {/* Introduction */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Introduction</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Welcome to Script ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered academic outreach platform.
            </Text>
          </Column>

          <Line />

          {/* Information We Collect */}
          <Column gap="m">
            <Heading paddingBottom="s" variant="heading-strong-xl">Information We Collect</Heading>
            
            <Column gap="s">
              <Heading variant="heading-default-m">Personal Information</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                We collect information you provide directly to us, including:
              </Text>
              <Column gap="2" paddingLeft="m">
                <Text variant="body-default-m">• Name, email address, and contact information</Text>
                <Text variant="body-default-m">• Academic profile information (school, research interests, academic level)</Text>
                <Text variant="body-default-m">• Resume and CV files you upload</Text>
                <Text variant="body-default-m">• Account credentials and authentication information</Text>
                <Text variant="body-default-m">• Communication preferences and settings</Text>
              </Column>
            </Column>

            <Column gap="s">
              <Heading variant="heading-default-m">Usage Information</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                We automatically collect information about your use of our services:
              </Text>
              <Column gap="2" paddingLeft="m">
                <Text variant="body-default-m">• Campaign creation and email sending activity</Text>
                <Text variant="body-default-m">• Email open rates, click-through rates, and response data</Text>
                <Text variant="body-default-m">• Device information, IP address, and browser type</Text>
                <Text variant="body-default-m">• Usage patterns and feature interactions</Text>
              </Column>
            </Column>

            <Column gap="s">
              <Heading variant="heading-default-m">Third-Party Integrations</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                When you connect third-party services, we may collect:
              </Text>
              <Column gap="2" paddingLeft="m">
                <Text variant="body-default-m">• Gmail account information and email sending permissions</Text>
                <Text variant="body-default-m">• LinkedIn profile data (when available)</Text>
                <Text variant="body-default-m">• Calendar integration data (when available)</Text>
              </Column>
            </Column>
          </Column>

          <Line />

          {/* How We Use Your Information */}
          <Column gap="m">
            <Heading variant="heading-strong-l">How We Use Your Information</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              We use the information we collect to:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Provide, maintain, and improve our services</Text>
              <Text variant="body-default-m">• Generate personalized email content using AI</Text>
              <Text variant="body-default-m">• Find and connect you with relevant professors and researchers</Text>
              <Text variant="body-default-m">• Send emails on your behalf through connected accounts</Text>
              <Text variant="body-default-m">• Track email performance and provide analytics</Text>
              <Text variant="body-default-m">• Communicate with you about our services</Text>
              <Text variant="body-default-m">• Detect and prevent fraud or abuse</Text>
              <Text variant="body-default-m">• Comply with legal obligations</Text>
            </Column>
          </Column>

          <Line />

          {/* Information Sharing */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Information Sharing and Disclosure</Heading>
            <Text paddingBottom="l" variant="body-default-m" onBackground="neutral-strong">
              We do not sell your personal information. We may share your information in the following circumstances:
            </Text>
            
            <Column gap="s">
              <Heading variant="heading-default-m">With Your Consent</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                We share information when you explicitly authorize us to do so, such as when sending emails to professors on your behalf.
              </Text>
            </Column>

            <Column gap="s">
              <Heading variant="heading-default-m">Service Providers</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                We work with third-party service providers who help us operate our platform:
              </Text>
              <Column gap="2" paddingLeft="m">
                <Text variant="body-default-m">• Cloud hosting and storage providers (Supabase, Vercel)</Text>
                <Text variant="body-default-m">• AI services (Google Gemini, Anthropic Claude)</Text>
                <Text variant="body-default-m">• Email services (Gmail API)</Text>
                <Text variant="body-default-m">• Analytics and monitoring services</Text>
                <Text variant="body-default-m">• Authentication services (Clerk)</Text>
              </Column>
            </Column>

            <Column gap="s">
              <Heading variant="heading-default-m">Legal Requirements</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                We may disclose information if required by law or to protect our rights, users, or the public.
              </Text>
            </Column>
          </Column>

          <Line />

          {/* Data Security */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Data Security</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              We implement appropriate technical and organizational measures to protect your information:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Encryption of data in transit and at rest</Text>
              <Text variant="body-default-m">• Regular security audits and monitoring</Text>
              <Text variant="body-default-m">• Access controls and authentication</Text>
              <Text variant="body-default-m">• Secure cloud infrastructure</Text>
              <Text variant="body-default-m">• Employee training on data protection</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-medium">
              However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </Text>
          </Column>

          <Line />

          {/* Data Retention */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Data Retention</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              We retain your information for as long as necessary to provide our services and comply with legal obligations:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Account information: Until you delete your account</Text>
              <Text variant="body-default-m">• Campaign and email data: 3 years after last activity</Text>
              <Text variant="body-default-m">• Analytics data: 2 years from collection</Text>
              <Text variant="body-default-m">• Communication logs: 1 year from last communication</Text>
            </Column>
          </Column>

          <Line />

          {/* Your Rights */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Your Rights and Choices</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              You have the following rights regarding your personal information:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• <strong>Access:</strong> Request a copy of your personal data</Text>
              <Text variant="body-default-m">• <strong>Rectification:</strong> Update or correct inaccurate information</Text>
              <Text variant="body-default-m">• <strong>Erasure:</strong> Request deletion of your personal data</Text>
              <Text variant="body-default-m">• <strong>Portability:</strong> Export your data in a common format</Text>
              <Text variant="body-default-m">• <strong>Restriction:</strong> Limit how we process your information</Text>
              <Text variant="body-default-m">• <strong>Objection:</strong> Opt out of certain processing activities</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-strong">
              To exercise these rights, please contact us using the information provided below or use the data export feature in your account settings.
            </Text>
          </Column>

          <Line />

          {/* Cookies and Tracking */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Cookies and Tracking Technologies</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              We use cookies and similar technologies to:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Remember your preferences and settings</Text>
              <Text variant="body-default-m">• Authenticate your account</Text>
              <Text variant="body-default-m">• Analyze usage patterns and improve our services</Text>
              <Text variant="body-default-m">• Track email opens and clicks for analytics</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-strong">
              You can control cookie preferences through your browser settings, though this may affect some functionality.
            </Text>
          </Column>

          <Line />

          {/* Third-Party Services */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Third-Party Services</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Our platform integrates with third-party services that have their own privacy policies:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• <strong>Google:</strong> Gmail API and Gemini AI services</Text>
              <Text variant="body-default-m">• <strong>Anthropic:</strong> Claude AI services</Text>
              <Text variant="body-default-m">• <strong>Clerk:</strong> Authentication and user management</Text>
              <Text variant="body-default-m">• <strong>Supabase:</strong> Database and backend services</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-strong">
              We encourage you to review the privacy policies of these services.
            </Text>
          </Column>

          <Line />

          {/* International Transfers */}
          <Column gap="m">
            <Heading variant="heading-strong-l">International Data Transfers</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Adequacy decisions by relevant authorities</Text>
              <Text variant="body-default-m">• Standard contractual clauses</Text>
              <Text variant="body-default-m">• Certification schemes</Text>
            </Column>
          </Column>

          <Line />

          {/* Children's Privacy */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Children's Privacy</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Our services are intended for users who are at least 13 years old. We do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will take steps to delete it promptly.
            </Text>
          </Column>

          <Line />

          {/* Changes to Privacy Policy */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Changes to This Privacy Policy</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Posting the updated policy on our website</Text>
              <Text variant="body-default-m">• Sending you an email notification</Text>
              <Text variant="body-default-m">• Displaying a prominent notice in our application</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Your continued use of our services after any changes constitutes acceptance of the updated policy.
            </Text>
          </Column>

          <Line />

          {/* Contact Information */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Contact Us</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• <strong>Email:</strong> privacy@scriptoutreach.com</Text>
              <Text variant="body-default-m">• <strong>Website:</strong> Through our contact form or support chat</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-strong">
              We will respond to your inquiries within 30 days of receipt.
            </Text>
          </Column>

          <Line />

          {/* Additional Rights */}
          <Column gap="m">
            <Heading paddingBottom="s" variant="heading-strong-l">Additional Rights for Certain Jurisdictions</Heading>
            
            <Column gap="s">
              <Heading variant="heading-default-m">California Residents (CCPA)</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                California residents have additional rights including the right to know what personal information is collected, the right to delete personal information, and the right to opt-out of the sale of personal information. We do not sell personal information.
              </Text>
            </Column>

            <Column gap="s">
              <Heading variant="heading-default-m">European Residents (GDPR)</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                If you are located in the European Economic Area, you have additional rights under the General Data Protection Regulation, including the rights listed above and the right to lodge a complaint with a supervisory authority.
              </Text>
            </Column>
          </Column>
        </Column>
      </Column>
    </Flex>
  );
};

export default PrivacyPolicyPage;
