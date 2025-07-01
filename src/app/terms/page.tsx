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

const TermsOfServicePage: React.FC = () => {
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
        paddingTop="l" 
        fillWidth
      >
        <Text variant="display-default-l" onBackground="neutral-strong" align="center">
          Terms of Service
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
            <Heading variant="heading-strong-l">Agreement to Terms</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Welcome to Script! These Terms of Service ("Terms") govern your use of our AI-powered academic outreach platform ("Service") operated by Script AI ("we," "us," or "our"). By accessing or using our Service, you agree to be bound by these Terms.
            </Text>
            <Text variant="body-default-m" onBackground="neutral-medium">
              If you disagree with any part of these terms, then you may not access the Service.
            </Text>
          </Column>

          <Line />

          {/* Acceptance of Terms */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Acceptance of Terms</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              By creating an account or using our Service, you confirm that:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• You are at least 13 years old</Text>
              <Text variant="body-default-m">• You have the legal capacity to enter into this agreement</Text>
              <Text variant="body-default-m">• You will use the Service for lawful purposes only</Text>
              <Text variant="body-default-m">• You agree to comply with all applicable laws and regulations</Text>
            </Column>
          </Column>

          <Line />

          {/* Description of Service */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Description of Service</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Script is an AI-powered platform designed to help students and researchers:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Find and connect with professors and researchers</Text>
              <Text variant="body-default-m">• Generate personalized outreach emails using AI</Text>
              <Text variant="body-default-m">• Send emails through connected Gmail accounts</Text>
              <Text variant="body-default-m">• Track email performance and responses</Text>
              <Text variant="body-default-m">• Manage academic outreach campaigns</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-medium">
              We reserve the right to modify, suspend, or discontinue any part of our Service at any time.
            </Text>
          </Column>

          <Line />

          {/* User Accounts */}
          <Column gap="m">
            <Heading variant="heading-strong-l">User Accounts</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              To use certain features of our Service, you must create an account. You are responsible for:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Providing accurate and complete information</Text>
              <Text variant="body-default-m">• Maintaining the security of your account credentials</Text>
              <Text variant="body-default-m">• All activities that occur under your account</Text>
              <Text variant="body-default-m">• Notifying us immediately of any unauthorized use</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-strong">
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </Text>
          </Column>

          <Line />

          {/* Acceptable Use */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Acceptable Use Policy</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              You agree not to use our Service to:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Send spam, unsolicited, or bulk emails</Text>
              <Text variant="body-default-m">• Violate any applicable laws or regulations</Text>
              <Text variant="body-default-m">• Harass, abuse, or harm others</Text>
              <Text variant="body-default-m">• Impersonate any person or entity</Text>
              <Text variant="body-default-m">• Upload malicious code or attempt to hack our systems</Text>
              <Text variant="body-default-m">• Interfere with the proper functioning of the Service</Text>
              <Text variant="body-default-m">• Collect personal information without consent</Text>
              <Text variant="body-default-m">• Use the Service for commercial purposes without permission</Text>
            </Column>
          </Column>

          <Line />

          {/* Email Usage Guidelines */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Email Usage Guidelines</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              When using our email features, you must:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Only send emails to relevant recipients (professors in your field)</Text>
              <Text variant="body-default-m">• Ensure your emails are professional and respectful</Text>
              <Text variant="body-default-m">• Comply with CAN-SPAM Act and similar regulations</Text>
              <Text variant="body-default-m">• Respect recipients' preferences and unsubscribe requests</Text>
              <Text variant="body-default-m">• Not exceed reasonable sending limits</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-medium">
              We monitor usage patterns and may suspend accounts that violate these guidelines.
            </Text>
          </Column>

          <Line />

          {/* Subscription and Billing */}
          <Column gap="m">
            <Heading paddingBottom="m" variant="heading-strong-l">Subscription and Billing</Heading>
            
            <Column gap="s">
              <Heading variant="heading-default-m">Free and Paid Plans</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                We offer both free and paid subscription plans. Paid plans provide additional features and higher usage limits.
              </Text>
            </Column>

            <Column gap="s">
              <Heading variant="heading-default-m">Billing Terms</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                For paid subscriptions:
              </Text>
              <Column gap="2" paddingLeft="m">
                <Text variant="body-default-m">• Subscriptions are billed in advance on a monthly or annual basis</Text>
                <Text variant="body-default-m">• All fees are non-refundable unless required by law</Text>
                <Text variant="body-default-m">• We may change subscription fees with 30 days' notice</Text>
                <Text variant="body-default-m">• You can cancel your subscription at any time</Text>
                <Text variant="body-default-m">• Service continues until the end of your billing period</Text>
              </Column>
            </Column>

            <Column gap="s">
              <Heading variant="heading-default-m">Usage Limits</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                Each plan has specific usage limits. Exceeding these limits may result in service restrictions or additional charges.
              </Text>
            </Column>
          </Column>

          <Line />

          {/* Intellectual Property */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Intellectual Property Rights</Heading>
            
            <Column gap="s">
              <Heading variant="heading-default-m">Our Rights</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                The Service and its original content, features, and functionality are owned by Script AI and are protected by international copyright, trademark, and other intellectual property laws.
              </Text>
            </Column>

            <Column gap="s">
              <Heading variant="heading-default-m">Your Rights</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                You retain ownership of any content you upload or create using our Service. By using our Service, you grant us a limited license to use your content solely to provide the Service.
              </Text>
            </Column>

            <Column gap="s">
              <Heading variant="heading-default-m">AI-Generated Content</Heading>
              <Text variant="body-default-m" onBackground="neutral-strong">
                Content generated by our AI features is provided as-is. You are responsible for reviewing and modifying AI-generated content before use.
              </Text>
            </Column>
          </Column>

          <Line />

          {/* Privacy and Data */}
          <Column gap="m">
            <Heading paddingBottom="m" variant="heading-strong-l">Privacy and Data Protection</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using our Service, you consent to the collection and use of information as described in our Privacy Policy.
            </Text>
            <Text variant="body-default-m" onBackground="neutral-medium">
              You can access our Privacy Policy at /privacy.
            </Text>
          </Column>

          <Line />

          {/* Third-Party Integrations */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Third-Party Integrations</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Our Service integrates with third-party services (such as Gmail, LinkedIn). You are responsible for:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Complying with third-party terms of service</Text>
              <Text variant="body-default-m">• Managing your permissions and access tokens</Text>
              <Text variant="body-default-m">• Understanding how third-party services handle your data</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-medium">
              We are not responsible for the availability, accuracy, or content of third-party services.
            </Text>
          </Column>

          <Line />

          {/* Disclaimers */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Disclaimers</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Our Service is provided "as is" without warranties of any kind. We disclaim all warranties, including:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Merchantability and fitness for a particular purpose</Text>
              <Text variant="body-default-m">• Accuracy, reliability, or completeness of content</Text>
              <Text variant="body-default-m">• Uninterrupted or error-free operation</Text>
              <Text variant="body-default-m">• Security or virus-free operation</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-medium">
              We do not guarantee that our Service will meet your specific requirements or expectations.
            </Text>
          </Column>

          <Line />

          {/* Limitation of Liability */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Limitation of Liability</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              To the maximum extent permitted by law, Script AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Loss of profits, data, or other intangible losses</Text>
              <Text variant="body-default-m">• Damages resulting from your use or inability to use the Service</Text>
              <Text variant="body-default-m">• Damages resulting from third-party content or conduct</Text>
              <Text variant="body-default-m">• Damages resulting from unauthorized access to your account</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-medium">
              Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
            </Text>
          </Column>

          <Line />

          {/* Indemnification */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Indemnification</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              You agree to indemnify and hold harmless Script AI from any claims, damages, losses, or expenses arising from:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Your use of the Service in violation of these Terms</Text>
              <Text variant="body-default-m">• Your violation of any law or regulation</Text>
              <Text variant="body-default-m">• Your violation of any third-party rights</Text>
              <Text variant="body-default-m">• Content you submit or transmit through the Service</Text>
            </Column>
          </Column>

          <Line />

          {/* Termination */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Termination</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Either party may terminate this agreement at any time:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• You may delete your account through the settings page</Text>
              <Text variant="body-default-m">• We may suspend or terminate accounts that violate these Terms</Text>
              <Text variant="body-default-m">• We may discontinue the Service with reasonable notice</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Upon termination, your right to use the Service will cease immediately, but these Terms will remain in effect for applicable provisions.
            </Text>
          </Column>

          <Line />

          {/* Governing Law */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Governing Law and Disputes</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              These Terms are governed by and construed in accordance with the laws of [Jurisdiction], without regard to conflict of law principles.
            </Text>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Any disputes arising from these Terms or your use of the Service will be resolved through binding arbitration, except for small claims court matters.
            </Text>
          </Column>

          <Line />

          {/* Changes to Terms */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Changes to Terms</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• Posting updated Terms on our website</Text>
              <Text variant="body-default-m">• Sending email notifications to registered users</Text>
              <Text variant="body-default-m">• Displaying prominent notices in our application</Text>
            </Column>
            <Text variant="body-default-m" onBackground="neutral-strong">
              Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </Text>
          </Column>

          <Line />

          {/* Contact Information */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Contact Information</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              If you have any questions about these Terms, please contact us:
            </Text>
            <Column gap="2" paddingLeft="m">
              <Text variant="body-default-m">• <strong>Email:</strong> legal@scriptoutreach.com</Text>
            </Column>
          </Column>

          <Line />

          {/* Severability */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Severability</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
            </Text>
          </Column>

          <Line />

          {/* Entire Agreement */}
          <Column gap="m">
            <Heading variant="heading-strong-l">Entire Agreement</Heading>
            <Text variant="body-default-m" onBackground="neutral-strong">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Script AI regarding the use of our Service and supersede all prior agreements and understandings.
            </Text>
            <Text variant="body-default-m" onBackground="neutral-medium">
              Thank you for using Script responsibly and in accordance with these Terms.
            </Text>
          </Column>
        </Column>
      </Column>
    </Flex>
  );
};

export default TermsOfServicePage;
