import "./globals.css";
import Decor from "@/components/Decor";

export const metadata = {
  title: "Code Academy",
  description: "Learn to code with real instructors, live tracked lessons and exams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-text font-sans antialiased">
        <Decor />
        {children}
      </body>
    </html>
  );
}
