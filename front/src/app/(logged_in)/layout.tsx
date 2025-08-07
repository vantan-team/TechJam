import { HomeNav } from "@/components/HomeNav";
import "leaflet/dist/leaflet.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        {children}
        <HomeNav />
    </>
  );
}
