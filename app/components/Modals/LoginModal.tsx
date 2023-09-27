'use client';
"登入Modal"
import { signIn } from "next-auth/react";
import axios from "axios";
import { AiFillGithub, AiFillApple } from "react-icons/ai";
// import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { 
    FieldValues, 
    SubmitHandler,
    useForm
} from "react-hook-form";

// import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";

import Modal from "./Modal";
import Input from "../Input/Input";
import Heading from "../Navbar/Heading";
import Button from "../Button";
import { useRouter } from "next/navigation";

const LoginModal = () => {
    const router = useRouter();
    const registerModal = useRegisterModal();
    const loginModal = useLoginModal();
    const [isLoading, setIsLoading] = useState(false);

    const { 
        register, 
        handleSubmit,
        formState: {
            errors,
        },
    } = useForm<FieldValues>({
        defaultValues: {
            email: '',
            password: ''
        },
    });

    const onSubmit: SubmitHandler<FieldValues> = 
    (data) => {
        setIsLoading(true);

        signIn('credentials', { 
        ...data, 
        redirect: false,
        })
        .then((callback) => {
        setIsLoading(false);

        if (callback?.ok) {
            toast.success('Logged in');
            loginModal.onClose();
            router.refresh();
        }
        
        if (callback?.error) {
            toast.error(callback.error);
        }
        });
    }

    const toggle = useCallback(() => {
        loginModal.onClose();
        registerModal.onOpen();
    }, [loginModal, registerModal])

    const bodyContent = (
        <div className="flex flex-col gap-4">
            <Heading
                title="歡迎回來"
                subtitle="登入您的帳號！"
            />
            <Input
                id="email"
                label="Email"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
            <Input
                id="password"
                label="Password"
                type="password"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
        </div>
    )

    const footerContent = (
        <div className="flex flex-col gap-4 mt-3">
            <hr />
            <Button
            outline
            label="使用Google登入"
            icon={FcGoogle}
            onClick={() => signIn('google')}
            />
            <Button
            outline
            label="使用GitHub登入"
            icon={AiFillGithub}
            onClick={() => signIn('github')}
            />
            <Button
            outline
            label="使用Apple登入"
            icon={AiFillApple}
            onClick={() => signIn('apple')}
            />
            <div className="text-neutral-500 text-center mt-4 font-light">
                <div className="flex flex-row items-center justify-center gap-3">
                    <div>
                        第一次使用Airbnb?
                    </div>
                    <div onClick={toggle} className=" text-neutral-800 cursor-pointer hover:underline">
                        建立帳號
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <Modal
            disabled={isLoading}
            isOpen={loginModal.isOpen}
            title="登入"
            actionLabel="Continue"
            onClose={loginModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
        />
    );
}

export default LoginModal;