import { Meta } from '@/once-ui/modules';
import { baseURL, meta } from '@/app/resources/config';

export async function generateMetadata() {
  return Meta.generate({
    title: meta.terms.title,
    description: meta.terms.description,
    baseURL: baseURL,
    path: meta.terms.path,
    canonical: meta.terms.canonical,
    image: meta.terms.image,
    robots: meta.terms.robots,
  });
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
