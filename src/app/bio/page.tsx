"use client";

import React from "react";
import {
  Column,
  Row,
  Avatar,
  Text,
  Media,
  IconButton,
  Fade,
  Heading,
  OgCard,
  Card,
} from "@once-ui-system/core";
import { content } from "./resources/content";
import { socials } from "./../resources/config"
import { SmartImage } from "@/once-ui/components";


interface LinkItem {
  title?: string;
  description?: string;
  media?: string;
  direction?: "row" | "column";
  url: string;
}

export default function Home() {
  return (
    <Column fillWidth horizontal="center" padding="16" data-theme="dark">
      <Column maxWidth="m" aspectRatio="2/1" marginBottom="40">
        {content.cover && (
          <Row fill position="absolute" left="0" top="0" radius="xl" overflow="hidden" border="neutral-alpha-weak">
            <Media priority fill src={content.cover} alt={content.name}/>
            <Fade fill position="absolute" to="top" bottom="0" left="0" pattern={{ display: true, size: "2" }}/>
          </Row>
        )}
        <Column fill center padding="l" gap="4">
          {content.avatar && (
            <Avatar src={content.avatar} size="xl" />
          )}
          {content.name && (
            <Heading variant="heading-strong-xl" marginTop={content.avatar ? "24" : undefined}>
              {content.name}
            </Heading>
          )}
          {content.bio && (
            <Text variant="body-default-l" onBackground="neutral-weak">
              {content.bio}
            </Text>
          )}
          {socials?.length > 0 && (
            <Row gap="16" paddingX="l" paddingY="24" horizontal="center" fillWidth wrap>
              {socials.map((item: any, index: any) => (
                <IconButton
                  key={index}
                  href={item.link}
                  icon={item.icon}
                  variant="ghost"
                  size="m"
                  tooltipPosition="bottom"
                  tooltip={item.name}
                />
              ))}
            </Row>
          )}
        </Column>
      </Column>
      
      <Column maxWidth="s" gap="24">
                    <Card
      fillWidth
      gap="4"
      direction="column"
      radius="l"
      href="https://scriptoutreach.com/waitlist"
      background="surface"
      border="neutral-alpha-medium"
    >
        <SmartImage
          radius="l"
          fill
          aspectRatio="16/9"
          border="neutral-alpha-weak"
          src="/images/home.jpg"
        />
      <Column fillWidth paddingX="12" paddingY="12" gap="8">
          <Row fillWidth gap="8" vertical="center">
            <SmartImage src={"/images/script-logo-main.png"} width={1.5} height={1.5}/>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  scriptoutreach.com/waitlist
                </Text>
          </Row>
        
        <Column fillWidth gap="2">
            <Text variant="label-default-s">
             Script Waitlist
            </Text>
              <Text variant="label-default-s" onBackground="neutral-weak">
                The waitlist to join Script AI, the ultimate research discovery tool
              </Text>
        </Column>
      </Column>
    </Card></Column>
      
      <Column maxWidth="s" gap="24">
        {content.links?.length > 0 && (
          <>

            {(content.links as LinkItem[]).map((link, index) => (
              <OgCard
                key={index}
                url={link.url}
                href={link.url}
                direction={link.direction}
              />
            ))}
          </>
        )}
        <Row fillWidth padding="l" horizontal="center" textVariant="label-default-s">
          <Text onBackground="neutral-weak">
            {new Date().getFullYear()}
            <Text marginLeft="8" marginRight="8">
              /
            </Text>
            <Text onBackground="neutral-strong">
              {content.name}
            </Text>
          </Text>
        </Row>
      </Column>
    </Column>
  );
}