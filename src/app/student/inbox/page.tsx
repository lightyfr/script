'use client';

import { useState, useEffect } from 'react';
import {
  Column,
  Row,
  Card,
  Heading,
  Text,
  Button,
  useToast,
  Spinner,
  Badge,
  Accordion,
  Tag,
  Input,
} from '@/once-ui/components';
import { Icon } from '@once-ui-system/core';
import { getInboxEmails, InboxEmail } from './actions';

export default function InboxPage() {
  const { addToast } = useToast();
  const [emails, setEmails] = useState<InboxEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const emailData = await getInboxEmails();
        setEmails(emailData);
      } catch (error) {
        console.error('Error fetching inbox emails:', error);
        addToast({ variant: 'danger', message: 'Failed to load inbox' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, [addToast]);

  const handleEmailClick = (email: InboxEmail) => {
    if (email.gmail_thread_id) {
      console.log('Opening Gmail with thread ID:', email.gmail_thread_id);
      const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${email.gmail_thread_id}`;
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return 'checkCircle';
      case 'delivered': return 'checkCircle';
      case 'opened': return 'eye';
      case 'replied': return 'arrowLeft';
      case 'bounced': return 'alertTriangle';
      case 'failed': return 'x';
      default: return 'mail';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'info';
      case 'delivered': return 'success';
      case 'opened': return 'warning';
      case 'replied': return 'success';
      case 'bounced': return 'danger';
      case 'failed': return 'danger';
      default: return 'neutral';
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = searchQuery === '' || 
      email.professor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.professor_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.university.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || email.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <Column fillWidth vertical="center" horizontal="center" padding="l" gap="16">
        <Spinner size="xl" />
        <Text>Loading inbox...</Text>
      </Column>
    );
  }
  return (
    <>
      {/* Add CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
      
      <Column fillWidth paddingX="l" paddingY="l" gap="24">
      {/* Header */}
      <Row fillWidth horizontal="space-between" vertical="center">
        <Column gap="8">
          <Heading variant="display-strong-m">Inbox</Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {filteredEmails.length} {filteredEmails.length === 1 ? 'email' : 'emails'}
          </Text>
        </Column>        <Button 
          href="/student/campaigns" 
          variant="secondary" 
          label="View Campaigns"
        />
      </Row>

      {/* Filters */}
      <Row fillWidth gap="16" vertical="center" wrap>        <Input
          id="search"
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        
        <Row gap="8" wrap>
          <Button
            variant={selectedStatus === 'all' ? 'primary' : 'tertiary'}
            size="s"
            label="All"
            onClick={() => setSelectedStatus('all')}
          />
          <Button
            variant={selectedStatus === 'sent' ? 'primary' : 'tertiary'}
            size="s"
            label="Sent"
            onClick={() => setSelectedStatus('sent')}
          />
          <Button
            variant={selectedStatus === 'delivered' ? 'primary' : 'tertiary'}
            size="s"
            label="Delivered"
            onClick={() => setSelectedStatus('delivered')}
          />
          <Button
            variant={selectedStatus === 'opened' ? 'primary' : 'tertiary'}
            size="s"
            label="Opened"
            onClick={() => setSelectedStatus('opened')}
          />
          <Button
            variant={selectedStatus === 'replied' ? 'primary' : 'tertiary'}
            size="s"
            label="Replied"
            onClick={() => setSelectedStatus('replied')}
          />
        </Row>
      </Row>

      {/* Email List */}
      {filteredEmails.length > 0 ? (
        <Column fillWidth gap="8">
          {filteredEmails.map((email) => (
            <Card
              key={email.id}
              fillWidth
              background={email.status === 'replied' ? undefined : "neutral-alpha-weak"}
              padding="16"
              radius="m"
              border="neutral-alpha-weak"              style={{
                cursor: email.gmail_thread_id ? 'pointer' : 'default',
                transition: email.gmail_thread_id ? 'all 0.2s ease' : 'none',
                // Special styling for replied emails to make them pop
                ...(email.status === 'replied' && {
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%)',
                  border: '2px solid rgba(34, 197, 94, 0.3)',
                  boxShadow: '0 4px 20px rgba(34, 197, 94, 0.15)',
                  transform: 'scale(1.02)',
                })
              }}
              onMouseEnter={(e) => {
                if (email.gmail_thread_id) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (email.gmail_thread_id) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }
              }}
              onClick={() => handleEmailClick(email)}
            >
              <Row fillWidth horizontal="space-between" vertical="center" gap="16">                {/* Email Info */}
                <Row gap="16" vertical="center" style={{ flex: 1 }}>
                  {/* Status Icon */}
                  <Icon
                    name={getStatusIcon(email.status)}
                    size="m"
                    onBackground={getStatusColor(email.status) as any}
                  />
                  
                  {/* Email Details */}
                  <Column gap="4" style={{ flex: 1 }}>
                    <Row gap="8" vertical="center">
                      <Text 
                        variant="body-strong-s"
                        style={{
                          // Make professor name bold and green if replied
                          ...(email.status === 'replied' && {
                            color: '#16a34a',
                            fontWeight: 'bold'
                          })
                        }}
                      >
                        {email.professor_name}
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {email.professor_email}
                      </Text>
                    </Row>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {email.university} • {email.department}
                    </Text>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      Campaign: {email.campaign_type} #{email.campaign_number}
                    </Text>
                  </Column>
                </Row>

                {/* Status and Actions */}
                <Column gap="8" horizontal="end">
                  <Row gap="8" vertical="center">
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {new Date(email.sent_at).toLocaleDateString()}
                    </Text>
                  </Row>
                  
                  {email.gmail_thread_id && (
                    <Row
                      vertical="center"
                      paddingX="8"
                      paddingY="4"
                      radius="s"
                      background="brand-alpha-weak"
                      gap="4"
                      style={{ fontSize: '11px' }}
                    >
                      <Text variant="label-default-s" onBackground="brand-weak">
                        Open in Gmail
                      </Text>
                      <Icon onBackground="brand-weak" name="chevronRight" size="xs" />
                    </Row>
                  )}

                  {email.open_count && email.open_count > 0 && (
                    <Text variant="label-default-s" onBackground="warning-weak">
                      Opened {email.open_count} {email.open_count === 1 ? 'time' : 'times'}
                    </Text>
                  )}
                </Column>
              </Row>
            </Card>
          ))}
        </Column>
      ) : (
        <Column fillWidth vertical="center" horizontal="center" padding="32" gap="16">
          <Icon name="inbox" size="xl" onBackground="neutral-weak" />
          <Text variant="body-default-m" onBackground="neutral-weak">
            {searchQuery || selectedStatus !== 'all' 
              ? 'No emails match your filters' 
              : 'Your inbox is empty'
            }
          </Text>
          {(searchQuery || selectedStatus !== 'all') && (
            <Button
              variant="secondary"
              size="s"
              label="Clear filters"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
              }}
            />
          )}        </Column>
      )}
    </Column>
    </>
  );
}
