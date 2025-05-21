import {
  Background,
  Column,
  Fade,
  type Flex,
  Heading,
  Row,
  Media,
  SmartLink,
  Text,
  User,
} from "@/once-ui/components";
import type { ReactNode } from "react";

interface Testimonial extends Omit<React.ComponentProps<typeof Flex>, "title" | "content"> {
  title?: ReactNode;
  content?: ReactNode;
  children?: ReactNode;
  src?: string;
  alt?: string;
  name?: string;
  company?: string;
  link?: string;
  avatar?: string;
  role?: string;
}

export const Testimonial2: React.FC<Testimonial> = ({
  title,
  content,
  children,
  src,
  alt,
  name,
  company,
  link,
  avatar,
  role,
  ...rest
}) => (
  <Row
    fillWidth
    fitHeight
    vertical="center"
    overflow="hidden"
    radius="xl"
    border="neutral-alpha-weak"
    tabletDirection="column"
    {...rest}
  >
    {src && (
      <Row fill position="absolute">
        <Background mask={{ x: 100, y: 50, radius: 150 }} position="absolute" fill>
          <Media fill sizes="(max-width: 1024px) 90vw, 960px" src={src} alt={alt} />
        </Background>
        <Fade
          leftRadius="xl"
          position="absolute"
          left="0"
          to="right"
          fill
          pattern={{ display: true, size: "4" }}
        />
      </Row>
    )}
    <Column gap="16" maxWidth={40} padding="xl">
      {title && <Heading variant="display-strong-m">{title}</Heading>}
      {content && (
        <Text wrap="balance" variant="body-default-m" onBackground="neutral-medium">
          {content}
        </Text>
      )}
      {children}
      {(name || company) && (
        <Row marginTop="40">
          <User
            avatarProps={{ src: avatar }}
            name={name}
            subline={
              <>
                {role}{" "}
                {link && company && (
                  <SmartLink unstyled href={link}>
                    {company}
                  </SmartLink>
                )}
              </>
            }
          />
        </Row>
      )}
    </Column>
  </Row>
);
