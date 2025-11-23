import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Safro - Decentralized Bitcoin Escrow",
    description: "Secure, AI-powered Bitcoin escrow platform built on the Internet Computer",
    keywords: ["bitcoin", "escrow", "cryptocurrency", "ICP", "decentralized"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.variable}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}

