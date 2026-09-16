import "./globals.css";
import Decor from "@/components/Decor";
import Providers from "@/components/Providers";
import WelcomeGate from "@/components/WelcomeGate";
import SignInGate from "@/components/SignInGate";
import { getServerSession } from "@/lib/getServerSession";

export const metadata = {
  title: "Code Academy",
  description: "Learn to code with real instructors, live tracked lessons and exams.",
};

export default async function RootLayout({ children }) {
  const session = getServerSession();
  const skipGate = Boolean(session); // trainers/students already signed in skip the gate

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
        <Providers>
          <Decor />
          <SignInGate skipForSession={skipGate}>
            <WelcomeGate />
            {children}
          </SignInGate>
        </Providers>
      </body>
    </html>
  );
}
