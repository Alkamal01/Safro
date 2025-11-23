import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-provider";
import { IcpProvider } from "@/lib/context/IcpContext";
import "./dashboard.css";

export const metadata: Metadata = {
    title: "Safro - Dashboard",
    description: "Safro Dashboard - Manage your escrows and wallet",
};

export default function DashboardRootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="m-0 p-0">
                <AuthProvider>
                    <IcpProvider>
                        {children}
                    </IcpProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
