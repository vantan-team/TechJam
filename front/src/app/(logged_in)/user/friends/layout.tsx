import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HomeNav } from "@/components/HomeNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Michelin",
  description: "心に刻まれた至極の体験を、世界に",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
      <HomeNav />
    </div>
  );
}
