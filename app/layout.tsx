import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import PrivacyControls from "@/components/privacy/PrivacyControls";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "HIRE Education | Career Resources for Brampton High School Students",
  description:
    "Your next step starts here. Explore student jobs, volunteering, free learning, resume tools and career skills for high school students in Brampton, Ontario, Canada.",
  applicationName: "HIRE Education",
  keywords: [
    "Brampton high school students",
    "student jobs Brampton",
    "volunteer hours Ontario",
    "student resume",
    "HIRE Education",
  ],
  openGraph: {
    title: "HIRE Education | Career support for Brampton students",
    description:
      "Skills, experience and opportunities for Grades 9–12 in Brampton, Ontario.",
    type: "website",
    locale: "en_CA",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "HIRE Education: Career resources for Brampton high school students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HIRE Education",
    description: "Career resources for Brampton high school students.",
    images: ["/opengraph-image.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/brand/hire-education.png" },
};
export const viewport: Viewport = { themeColor: "#071322" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA">
      <body>
        {children}
        <PrivacyControls />
      </body>
    </html>
  );
}
