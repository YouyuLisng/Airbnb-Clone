import { Barlow } from 'next/font/google'

import Navbar from '@/app/components/Navbar/Navbar';
import Footer from '@/app/components/Footer';
import LoginModal from '@/app/components/Modals/LoginModal';
import RegisterModal from '@/app/components/Modals/RegisterModal';
import RentModal from './components/Modals/RentModal';
import ClientOnly from './components/ClientOnly';
import ToasterProvider from '@/app/providers/ToastProvider';

import './globals.css'
import getCurrentUser from './actions/getCurrentUser';
import { cn } from "@/app/libs/utils";

import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const title = 'GearShare | 戶外裝備 P2P 租借市集';
const description = '不用買、不用囤——在 GearShare 直接向附近的人租借帳篷、睡袋、相機等戶外裝備，或把自己用不到的裝備租出去賺點外快。';

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: title,
        template: '%s | GearShare',
    },
    description,
    keywords: ['戶外裝備租借', '露營裝備', '帳篷出租', 'P2P 租賃', 'GearShare'],
    openGraph: {
        title,
        description,
        url: baseUrl,
        siteName: 'GearShare',
        locale: 'zh_TW',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
    },
    icons: {
        icon: '/favicon.ico',
    },
}

// Also exposed as the --font-sans CSS variable (see globals.css) so
// shadcn/ui components -- which reference font-sans via that variable,
// not a hardcoded font -- pick up the same Barlow typeface as the rest
// of the app instead of shadcn's own preset font (Geist).
const font = Barlow({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-sans',
});

export default async function RootLayout({
    children,
    }: {
    children: React.ReactNode
    }) {
    const currentUser = await getCurrentUser();

    return (
        <html lang="en" className={cn("font-sans", font.variable)}>
        <body className={cn(font.className, "flex min-h-screen flex-col")}>
            <ClientOnly>
                <ToasterProvider />
                <LoginModal />
                <RentModal />
                <RegisterModal />
                <Navbar currentUser={currentUser} />
            </ClientOnly>
            <div className="flex-1 pb-20 pt-28">
                {children}
            </div>
            <Footer />
        </body>
        </html>
    )
}