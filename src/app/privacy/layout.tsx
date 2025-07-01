import { Meta } from '@/once-ui/modules';
import { baseURL, meta } from '@/app/resources/config';

export async function generateMetadata() {
  return Meta.generate({
    title: meta.privacy.title,
    description: meta.privacy.description,
    baseURL: baseURL,
    path: meta.privacy.path,
    canonical: meta.privacy.canonical,
    image: meta.privacy.image,
    robots: meta.privacy.robots,
  });
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
