import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./store-header-overrides.css";

const SITE_URL = "https://lucky-club-gift-articles.vercel.app";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Lucky Club Gift Articles | Personalized Gifts in India", template: "%s | Lucky Club Gift Articles" },
  description: "Shop thoughtful personalized gifts for birthdays, anniversaries, couples, family and special occasions. Customize your gift with Lucky Club through WhatsApp.",
  keywords: ["personalized gifts", "personalised gifts India", "custom gifts India", "birthday gifts", "anniversary gifts", "couple gifts", "photo gifts", "customized gifts", "gift articles", "Lucky Club Gift Articles"],
  applicationName: "Lucky Club Gift Articles",
  authors: [{ name: "Lucky Club Gift Articles" }], creator: "Lucky Club Gift Articles", publisher: "Lucky Club Gift Articles",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "en_IN", url: SITE_URL, siteName: "Lucky Club Gift Articles", title: "Lucky Club Gift Articles | Personalized Gifts in India", description: "Thoughtful personalized gifts made for the people and moments that matter most.", images: [{ url: "/lcc.jpg.jpeg", width: 1200, height: 630, alt: "Lucky Club Gift Articles" }] },
  twitter: { card: "summary_large_image", title: "Lucky Club Gift Articles | Personalized Gifts in India", description: "Thoughtful personalized gifts made for the people and moments that matter most.", images: ["/lcc.jpg.jpeg"] },
  icons: { icon: "/favicon.ico" },
};

const organizationSchema = { "@context": "https://schema.org", "@type": "Organization", name: "Lucky Club Gift Articles", url: SITE_URL, logo: `${SITE_URL}/lcc.jpg.jpeg`, sameAs: ["https://www.instagram.com/luckyclubgiftarticles"], contactPoint: { "@type": "ContactPoint", telephone: "+91-7032785547", contactType: "customer service", availableLanguage: ["English", "Telugu"] } };
const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "Lucky Club Gift Articles", url: SITE_URL, description: "Personalized gifts for birthdays, anniversaries, couples, family and special occasions." };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><body className="min-h-full flex flex-col">{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} /></body></html>;
}
