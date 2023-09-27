'use client';

import axios from "axios";
import { AiFillGithub } from "react-icons/ai";
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

import Modal from "./Modal";
import Input from "../Input/Input";
import Heading from "../Navbar/Heading";
import Button from "../Button";
import { signIn } from "next-auth/react";
import useLoginModal from "@/app/hooks/useLoginModal";

const RegisterModal= () => {
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
        name: '',
        email: '',
        password: ''
        },
    });

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);

        axios.post('/api/register', data)
        .then(() => {
            toast.success('創建成功！');
            registerModal.onClose();
            loginModal.onOpen();
        })
        .catch((error) => {
            toast.error('發生了一點錯誤');
        })
        .finally(() => {
        setIsLoading(false);
        })
    }

    const toggle = useCallback(() => {
        registerModal.onClose();
        loginModal.onOpen();
    }, [loginModal, registerModal])

    const bodyContent = (
        <div className="flex flex-col gap-4">
        <Heading
            title="歡迎來到Airbnb"
            subtitle="創建帳號"
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
            id="name"
            label="Name"
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
            <div className="text-neutral-500 text-center mt-4 font-light">
                <div className="flex flex-row items-center justify-center gap-3">
                    <div>
                        已經有帳號了嗎?
                    </div>
                    <div onClick={toggle} className=" text-neutral-800 cursor-pointer hover:underline">
                        登入
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <Modal
            disabled={isLoading}
            isOpen={registerModal.isOpen}
            title="註冊"
            actionLabel="Continue"
            onClose={registerModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
            footer={footerContent}
        />
    );
}

export default RegisterModal;