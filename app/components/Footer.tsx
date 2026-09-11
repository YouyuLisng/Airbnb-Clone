"use client";

import Link from "next/link";

import Container from "./Container";
import { categories } from "./Navbar/Categories";

const EXPLORE_CATEGORIES = categories.slice(0, 6);

const ACCOUNT_LINKS = [
    { label: "我的收藏", href: "/favorites" },
    { label: "我承租的裝備", href: "/renting" },
    { label: "我出租的裝備", href: "/my-gear" },
    { label: "別人租借我的裝備", href: "/lending" },
];

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t bg-muted/30">
            <Container>
                <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 md:grid-cols-3">
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="text-2xl font-bold text-primary">
                            GearShare
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            戶外裝備 P2P 租借市集，讓你不必為了一趟旅程添購整套裝備。
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-semibold">探索裝備</div>
                        <ul className="flex flex-col gap-2">
                            {EXPLORE_CATEGORIES.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={`/?category=${encodeURIComponent(item.label)}`}
                                        className="text-sm text-muted-foreground hover:text-foreground transition"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-semibold">我的帳戶</div>
                        <ul className="flex flex-col gap-2">
                            {ACCOUNT_LINKS.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="border-t py-6 text-center text-xs text-muted-foreground">
                    © {year} GearShare. All rights reserved.
                </div>
            </Container>
        </footer>
    );
}

export default Footer;
