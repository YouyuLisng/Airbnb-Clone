import { Barlow } from 'next/font/google'

import Navbar from '@/app/components/Navbar/Navbar';
import LoginModal from '@/app/components/Modals/LoginModal';
import RegisterModal from '@/app/components/Modals/RegisterModal';
import RentModal from './components/Modals/RentModal';
import ClientOnly from './components/ClientOnly';
import ToasterProvider from '@/app/providers/ToastProvider';

import './globals.css'
import getCurrentUser from './actions/getCurrentUser';
import { cn } from "@/app/libs/utils";

export const metadata = {
    title: 'GearShare',
    description: '戶外裝備 P2P 租借市集',
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
        <body className={font.className}>
            <ClientOnly>
                <ToasterProvider />
                <LoginModal />
                <RentModal />
                <RegisterModal />
                <Navbar currentUser={currentUser} />
            </ClientOnly>
            <div className="pb-20 pt-28">
                {children}
            </div>
        </body>
        </html>
    )
}