import { Meta } from '@/once-ui/modules';
import { baseURL, meta } from '@/app/resources/config';

export async function generateMetadata() {
  return Meta.generate({
    title: meta.pricing.title,
    description: meta.pricing.description,
    baseURL: baseURL,
    path: meta.pricing.path,
    canonical: meta.pricing.canonical,
    image: meta.pricing.image,
    robots: meta.pricing.robots,
  });
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
