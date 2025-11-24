import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";

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
            <head>
                {/* Eruda - Mobile debugging console */}
                <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
                <script dangerouslySetInnerHTML={{ __html: `eruda.init();` }} />
            </head>
            <body className={inter.variable}>
                <ErrorBoundary>
                    <Providers>
                        {children}
                    </Providers>
                </ErrorBoundary>
            </body>
        </html>
    );
}

