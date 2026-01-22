import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ExperXtz - Prediction Markets built on Etherlink.",
  description: "Trade on the outcomes of future events",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {" "}
        <ThirdwebProvider>{children} </ThirdwebProvider>
      </body>
    </html>
  );
}
