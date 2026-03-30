import type { Metadata } from "next";
import "~/styles/globals.css";

export const metadata: Metadata = {
  title: "Electron + Next.js App",
  description: "Built with Tailwind CSS and TypeScript",
};

import { LayoutWrapper } from "~/components/layout/sidebar/layout-wrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}

