"use client";

import { useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Heart,
    LogOut,
    Package,
    PackagePlus,
    Tent,
    Users
} from 'lucide-react';

import Avatar from '../Avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/app/components/ui/dropdown-menu';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import useRentModal from '@/app/hooks/useRentModal';
import { SafeUser } from '@/app/types';

interface UserMenuProps {
    currentUser?: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({
    currentUser
}) => {
    const router = useRouter();
    const registerModal = useRegisterModal();
    const loginModal = useLoginModal();
    const rentModal = useRentModal();

    const onRent = useCallback(() => {
        if(!currentUser) {
            return loginModal.onOpen();
        }

        rentModal.onOpen();
    }, [currentUser, loginModal, rentModal]);

    if (!currentUser) {
        return (
            <div className="flex flex-row items-center gap-2">
                <div
                    onClick={onRent}
                    className="hidden md:block text-sm font-semibold py-3 px-3 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                >
                    在 GearShare 上架裝備
                </div>
                <div
                    onClick={loginModal.onOpen}
                    className="text-sm font-semibold py-2 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                >
                    登入
                </div>
                <div
                    onClick={registerModal.onOpen}
                    className="text-sm font-semibold py-2 px-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
                >
                    註冊
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-row items-center gap-3">
            <div
                onClick={onRent}
                className="hidden md:block text-sm font-semibold py-3 px-3 rounded-full hover:bg-neutral-100 transition cursor-pointer"
            >
                在 GearShare 上架裝備
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger className="block rounded-full border-0 bg-transparent p-0 outline-none ring-offset-2 transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar src={currentUser.image} name={currentUser.name} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-neutral-500 font-normal">
                        {currentUser.name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/renting')}>
                        <Package className="text-neutral-500" size={16} />
                        我承租的裝備
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/favorites')}>
                        <Heart className="text-neutral-500" size={16} />
                        我的收藏
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/lending')}>
                        <Users className="text-neutral-500" size={16} />
                        別人租借我的裝備
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/my-gear')}>
                        <Tent className="text-neutral-500" size={16} />
                        我出租的裝備
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={rentModal.onOpen}>
                        <PackagePlus className="text-neutral-500" size={16} />
                        在 GearShare 上架裝備
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="text-neutral-500" size={16} />
                        登出
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default UserMenu;
