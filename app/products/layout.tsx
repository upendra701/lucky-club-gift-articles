import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personalized Gifts & Custom Gifts in India",
  description: "Explore Lucky Club's collection of personalized gifts for birthdays, anniversaries, couples, family and special occasions. Find a thoughtful gift and customize it through WhatsApp.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Personalized Gifts & Custom Gifts in India | Lucky Club",
    description: "Explore thoughtful personalized gifts for every special occasion.",
    url: "/products",
    type: "website",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
