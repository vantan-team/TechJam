import { HomeNav } from "@/components/HomeNav";
import "leaflet/dist/leaflet.css";
import { Suspense } from "react";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div></div>}>
        {children}
        <HomeNav />
    </Suspense>
  );
}
