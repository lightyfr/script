"use client";

import React from 'react';
import {
  Column,
  Row,
  Text,
  Card,
  Button,
  Icon,
  Flex,
  Line,
  Table, // Added Table import
} from '@/once-ui/components';
import type { IconName } from '@/once-ui/icons'; // Assuming IconName is exported
import { Header } from '../Header';

interface PricingTier {
  name: string;
  price: string;
  priceDescription?: string;
  features: { text: string; icon?: IconName; included: boolean }[];
  buttonLabel: string;
  buttonVariant?: 'primary' | 'secondary' | 'tertiary';
  highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Basic',
    price: '$0',
    priceDescription: 'per month',
    features: [
      { text: 'Access to core features', icon: 'checkCircle', included: true },
      { text: 'Limited project creation', icon: 'checkCircle', included: true },
      { text: 'Community support', icon: 'checkCircle', included: true },
      { text: 'Email support', icon: 'xCircle', included: false },
      { text: 'Advanced analytics', icon: 'xCircle', included: false },
    ],
    buttonLabel: 'Get Started',
    buttonVariant: 'secondary',
  },
  {
    name: 'Pro',
    price: '$29',
    priceDescription: 'per month',
    features: [
      { text: 'Access to all core features', icon: 'checkCircle', included: true },
      { text: 'Unlimited project creation', icon: 'checkCircle', included: true },
      { text: 'Priority community support', icon: 'checkCircle', included: true },
      { text: 'Email support', icon: 'checkCircle', included: true },
      { text: 'Advanced analytics', icon: 'checkCircle', included: true },
    ],
    buttonLabel: 'Upgrade to Pro',
    buttonVariant: 'primary',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceDescription: 'for large teams',
    features: [
      { text: 'All Pro features', icon: 'checkCircle', included: true },
      { text: 'Dedicated account manager', icon: 'checkCircle', included: true },
      { text: 'Custom integrations', icon: 'checkCircle', included: true },
      { text: 'SLA & 24/7 support', icon: 'checkCircle', included: true },
      { text: 'On-premise deployment option', icon: 'checkCircle', included: true },
    ],
    buttonLabel: 'Contact Sales',
    buttonVariant: 'secondary',
  },
];

const PricingPage: React.FC = () => {
  // Data for the feature comparison table
  const featureComparisonData = {
    headers: [
      { content: 'Feature', key: 'feature', sortable: true },
      { content: 'Basic', key: 'basic', sortable: true },
      { content: 'Pro', key: 'pro', sortable: true },
      { content: 'Enterprise', key: 'enterprise', sortable: true },
    ],
    rows: [
      [
        'Core feature access',
        <Icon key="basic-core" name="checkCircle" size="s" onBackground="success-strong" />,
        <Icon key="pro-core" name="checkCircle" size="s" onBackground="success-strong" />,
        <Icon key="ent-core" name="checkCircle" size="s" onBackground="success-strong" />,
      ],
      [
        'Project creation limit',
        <Text key="basic-proj" onBackground="neutral-strong">Limited</Text>,
        <Text key="pro-proj" onBackground="neutral-strong">Unlimited</Text>,
        <Text key="ent-proj" onBackground="neutral-strong">Unlimited</Text>,
      ],
      [
        'Community support',
        <Icon key="basic-comm" name="checkCircle" size="s" onBackground="success-strong" />,
        <Icon key="pro-comm" name="checkCircle" size="s" onBackground="success-strong" />,
        <Icon key="ent-comm" name="checkCircle" size="s" onBackground="success-strong" />,
      ],
      [
        'Email support',
        <Icon key="basic-email" name="xCircle" size="s" onBackground="danger-strong" />,
        <Icon key="pro-email" name="checkCircle" size="s" onBackground="success-strong" />,
        <Icon key="ent-email" name="checkCircle" size="s" onBackground="success-strong" />,
      ],
      [
        'Advanced analytics',
        <Icon key="basic-analytics" name="xCircle" size="s" onBackground="danger-strong" />,
        <Icon key="pro-analytics" name="checkCircle" size="s" onBackground="success-strong" />,
        <Icon key="ent-analytics" name="checkCircle" size="s" onBackground="success-strong" />,
      ],
      [
        'Dedicated account manager',
        <Icon key="basic-manager" name="xCircle" size="s" onBackground="danger-strong" />,
        <Icon key="pro-manager" name="xCircle" size="s" onBackground="danger-strong" />,
        <Icon key="ent-manager" name="checkCircle" size="s" onBackground="success-strong" />,
      ],
      [
        'Custom integrations',
        <Icon key="basic-custom" name="xCircle" size="s" onBackground="danger-strong" />,
        <Icon key="pro-custom" name="xCircle" size="s" onBackground="danger-strong" />,
        <Icon key="ent-custom" name="checkCircle" size="s" onBackground="success-strong" />,
      ],
      [
        'SLA & 24/7 support',
        <Icon key="basic-sla" name="xCircle" size="s" onBackground="danger-strong" />,
        <Icon key="pro-sla" name="xCircle" size="s" onBackground="danger-strong" />,
        <Icon key="ent-sla" name="checkCircle" size="s" onBackground="success-strong" />,
      ],
      [
        'On-premise deployment',
        <Icon key="basic-deploy" name="xCircle" size="s" onBackground="danger-strong" />,
        <Icon key="pro-deploy" name="xCircle" size="s" onBackground="danger-strong" />,
        <Icon key="ent-deploy" name="checkCircle" size="s" onBackground="success-strong" />,
      ],
    ],
  };

  return (
    <Flex direction="column" horizontal='center' align="center" paddingY="xl" gap="xl" paddingX='l' background="neutral-weak">
      <Header/>
      <Column horizontal="center" gap="s" paddingTop='l'>
        <Text variant="display-default-l" onBackground="neutral-strong" align="center">
          Flexible Pricing for Every Team
        </Text>
        <Text variant="body-default-l" onBackground="neutral-medium" align="center"> {/* Removed maxWidth */}
          Choose the plan that’s right for you and unlock the full potential of our platform.
        </Text>
      </Column>

      <Row gap="m" horizontal="center" vertical="stretch" paddingX="m">
        {pricingTiers.map((tier) => (
          <Card 
            key={tier.name} 
            padding="l" 
            radius="l" 
            fillWidth
            background={tier.highlighted ? "brand-weak" : "neutral-weak"} // Adjusted background values
            border={tier.highlighted ? "brand-alpha-strong" : "neutral-alpha-medium"}
            shadow={tier.highlighted ? "l" : "m"}
          >
            <Column fill gap="l" vertical="space-between">
              <Column gap="m">
                <Text variant="heading-default-l" onBackground="neutral-strong">
                  {tier.name}
                </Text>
                <Row vertical="center" gap="2"> {/* Changed from baseline to center for better alignment with icons */}
                  <Text variant="display-default-m" onBackground="neutral-strong">
                    {tier.price}
                  </Text>
                  {tier.priceDescription && (
                    <Text variant="body-default-s" onBackground="neutral-medium">
                      {tier.priceDescription}
                    </Text>
                  )}
                </Row>
                <Line />
                <Column gap="s" paddingTop="s">
                  {tier.features.map((feature, index) => (
                    <Row key={index} gap="s" vertical="center">
                      <Icon
                        name={feature.icon || (feature.included ? 'checkCircle' : 'xCircle')}
                        size="s"
                        onBackground={feature.included ? 'success-strong' : 'danger-strong'} // Corrected onBackground
                      />
                      <Text variant="body-default-m" onBackground={feature.included ? 'neutral-strong' : 'neutral-medium'}> {/* Corrected onBackground */}
                        {feature.text}
                      </Text>
                    </Row>
                  ))}
                </Column>
              </Column>
              <Button
                label={tier.buttonLabel}
                variant={tier.buttonVariant || 'primary'}
                size="l"
                fillWidth // Corrected from fitWidth to fillWidth
              />
            </Column>
          </Card>
        ))}
      </Row>

      {/* Feature Comparison Table */}
      <Column horizontal="center" gap="m" paddingX="m" fillWidth>
        <Text variant="heading-default-xl" onBackground="neutral-strong" align="center">
          Compare Features
        </Text>
        <Table data={featureComparisonData} />
      </Column>
    </Flex>
  );
};

export default PricingPage;
