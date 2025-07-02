"use client";

import React, { useState } from 'react';
import {
  Column,
  Row,
  Text,
  Heading,
  Button,
  Icon,
  Input,
  Line,
  useToast,
  Fade,
  RevealFx,
  Badge,
  Flex,
} from '@/once-ui/components';
import { Header } from '../Header';
import { createClient } from '@supabase/supabase-js';
import { Testimonial2 } from '../components/Testimonial';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addToast } = useToast();

  // Add to waitlist function
  const addToWaitlist = async (email: string) => {
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email }])
      .select();
      
    console.log(data, error);
    if (error) throw error;
    return data?.[0];
  };

  // Check if email exists in waitlist
  const checkWaitlistEmail = async (email: string) => {
    const { data, error } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single();
      
    console.log(data, error);
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    return !!data; // returns true if email exists, false otherwise
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      addToast({
        variant: 'danger',
        message: 'Email is required',
      });
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast({
        variant: 'danger',
        message: 'Please enter a valid email address',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if email already exists
      const emailExists = await checkWaitlistEmail(email);
      
      if (emailExists) {
        addToast({
          variant: 'danger',
          message: 'This email is already on the waitlist!',
        });
        return;
      }
      
      // Add to waitlist
      await addToWaitlist(email);
      
      // Show success message and reset form
      setIsSubmitted(true);
      setEmail('');
      
      addToast({
        variant: 'success',
        message: 'You\'ve been added to the waitlist!',
      });
    } catch (error) {
      console.error('Waitlist error:', error);
      addToast({
        variant: 'danger',
        message: error instanceof Error ? error.message : 'Failed to join waitlist. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Column gap="xl" horizontal='center' align="center">
      <Header />
      
      <Column align="center" maxWidth="m" marginTop='xl' horizontal='center' paddingY="xl" paddingX="m" gap="xl">
        
          <Column gap="l">
          <Heading paddingTop='l' variant='display-default-l' align="center" wrap='balance'>
            Be the first to know when we launch
          </Heading>
          <Text size="l" wrap='balance' align="center"onBackground="neutral-weak">
            We're working hard to bring you an amazing experience. Join our waitlist to get early access and exclusive updates.
          </Text>
          </Column>
        
        
        {!isSubmitted && (
          <Column 
            padding="l"
            paddingY='xl' 
            background='surface'
            border='neutral-weak'
            horizontal='center'
            shadow="m"
            maxWidth="m"
            radius="l"
          >
            <form onSubmit={handleSubmit}>
              <Column gap="l">
                <Row gap="m" vertical='center' mobileDirection='column'>
                  <Input
                  size={29}
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required id={''}                  />
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="l" 
                  loading={isLoading}
                >
                  Join Waitlist
                </Button>
                </Row>
              </Column>
            </form>
          </Column>
        )}
        
        {isSubmitted && (
          <Fade>
            <Column 
              padding="xl" 
              background='surface'
              border='success-weak'
              horizontal='center'
              shadow="m"
              width="m"
              fillWidth
              radius="l"
            >
              <Column fill align="center" gap="m">
                <Row horizontal='center' gap="m" paddingBottom='l'>
                  <Icon name="checkCircle" size="xl" onBackground="success-strong" />
                  <Heading wrap='balance'>You're on the list!</Heading>
                </Row>
                <Text wrap='balance'>
                  Thanks for joining our waitlist. We'll keep you updated on our launch progress and let you know as soon as you can get started.
                </Text>
              </Column>
            </Column>
          </Fade>
        )}
        <Column fillWidth horizontal='start' align='start'>
        <Testimonial2 title="Opportunities start piling up" content="Script sends thousands of personalized emails to real proffessors for you with a couple clicks"
 src="/images/dashb.png"/>
        </Column>
        
        <RevealFx delay={0.6}>
          <Flex gap="m">
            <Flex gap="xs" align="center">
              <Icon name="zap" size="s" onBackground="accent-strong" />
              <Text>Early access</Text>
            </Flex>
            <Line vert/>
            <Flex gap="xs" align="center">
              <Icon name="gift" size="s" onBackground="accent-strong" />
              <Text>Exclusive updates</Text>
            </Flex>
            <Line vert />
            <Flex gap="xs" align="center">
              <Icon name="shield" size="s" onBackground="accent-strong" />
              <Text>No spam, ever</Text>
            </Flex>
          </Flex>
        </RevealFx>
      </Column>
    </Column>
  );
}
