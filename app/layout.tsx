import type { Metadata } from "next";
import { Archivo, Archivo_Black, Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { Header } from "@/components/Header";
import { getUserById } from "@/lib/service";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const themeInitScript = `
  (function () {
    try {
      var saved = window.localStorage.getItem("bekam-theme");
      var theme = saved === "light" || saved === "dark"
        ? saved
        : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      document.documentElement.dataset.theme = theme;
    } catch (e) {
      document.documentElement.dataset.theme = "dark";
    }
  })();
`;

export const metadata: Metadata = {
  title: "Bekam AI | Admin",
  description: "Curriculum Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_token")?.value;
  const user = userId ? await getUserById(userId) : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${archivoBlack.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Header user={user} />
        {children}
      </body>
    </html>
  );
}
