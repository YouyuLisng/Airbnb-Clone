"use client";

import { AiOutlineMenu } from 'react-icons/ai'
import Avatar from '../Avatar';

import { useCallback, useState } from 'react';

import MenuItem from './MenuItem';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import useRentModal from '@/app/hooks/useRentModal';
import { signOut } from 'next-auth/react';
import { SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';

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
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, []);

    const onRent = useCallback(() => {
        if(!currentUser) {
            return loginModal.onOpen();
        }

        // open Rent Modal
        rentModal.onOpen();
    }, [currentUser, loginModal, rentModal]);

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
                <div onClick={onRent} 
                    className="hidden md:block text-sm font-semibold py-3 px-3 rounded-full hover:bg-neutral-100 transition cursor-pointer">
                    在Airbnb發布房源
                </div>
                <div onClick={toggleOpen} className="p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition">
                    <div className='hidden md:block'>
                        <Avatar src={currentUser?.image} />
                    </div>
                    <AiOutlineMenu size={18} />
                </div>
            </div>
            {isOpen && (
                <div className="absolute rounded-xl shadow-md w-[40vw] md:w-3/4 bg-white overflow-hidden right-0 top-12 text-sm">
                    <div className=' flex flex-col cursor-pointer'>
                        {currentUser ? (
                            <>
                                <MenuItem onClick={() => router.push('/trips')} label='我的旅程' />
                                <MenuItem onClick={() => router.push('/favorites')} label='我的收藏' />
                                <MenuItem onClick={() => router.push('/reservations')} label='我的房源預訂' />
                                <MenuItem onClick={() => router.push('/properties')} label='我的房源' />
                                <MenuItem onClick={rentModal.onOpen} label='在Airbnb發布房源' />
                                <hr />
                                <MenuItem onClick={() => signOut()} label='登出' />
                            </>
                        ):(
                            <>
                                <MenuItem onClick={registerModal.onOpen} label='註冊' />
                                <MenuItem onClick={loginModal.onOpen} label='登入' />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserMenu;
