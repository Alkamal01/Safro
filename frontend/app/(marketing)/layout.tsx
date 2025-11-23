'use client';

import { useEffect } from "react";
import Script from "next/script";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/ui/SmoothScroll";

export default function MarketingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <SmoothScroll />
            <Header />
            <main>
                {children}
            </main>
            <Footer />

            {/* Scroll to top button */}
            <button className="scrollToTopBtn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>arrow-up</title>
                    <path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"></path>
                </svg>
            </button>

            {/* Template Scripts - only for marketing pages */}
            <Script src="/template-assets/js/swiper-bundle.min.js" strategy="beforeInteractive" />
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/wow/1.1.2/wow.min.js" strategy="beforeInteractive" />
            <Script src="/template-assets/js/app.js" strategy="lazyOnload" />
        </>
    );
}

