import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource-variable/manrope";
import "./globals.css";
import PrivacyControls from "@/components/privacy/PrivacyControls";
import MotionController from "@/components/MotionController";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "HIRE Education | Career Resources for Peel and GTA Students",
  description:
    "Explore student jobs, volunteering, free courses, career credentials, interview practice and resume tools for high school students in Brampton, Peel and the Greater Toronto Area.",
  applicationName: "HIRE Education",
  keywords: [
    "Brampton high school students",
    "student jobs Brampton",
    "Peel youth opportunities",
    "GTA student jobs and volunteering",
    "volunteer hours Ontario",
    "student resume",
    "HIRE Education",
  ],
  openGraph: {
    title: "HIRE Education | Career support for Peel and GTA students",
    description:
      "Skills, experience and opportunities for Grades 9–12 in Brampton, Peel and the Greater Toronto Area.",
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
    description:
      "Career resources for high school students in Peel and the GTA.",
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
        <MotionController />
        <PrivacyControls />
        <Analytics />
      </body>
    </html>
  );
}
