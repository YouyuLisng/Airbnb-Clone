"use client";

import { useCallback, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    FieldValues,
    SubmitHandler,
    useForm
} from "react-hook-form";

import Container from "@/app/components/Container";
import Heading from "@/app/components/Navbar/Heading";
import Avatar from "@/app/components/Avatar";
import Input from "@/app/components/Input/Input";
import ImageUpload from "@/app/components/Input/ImageUpload";
import Button from "@/app/components/Button";
import { SafeUser } from "@/app/types";

interface ProfileClientProps {
    currentUser: SafeUser;
}

const ProfileClient: React.FC<ProfileClientProps> = ({
    currentUser
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<FieldValues>({
        defaultValues: {
            name: currentUser.name || '',
            image: currentUser.image || '',
        }
    });

    const image = watch('image');
    const name = watch('name');

    const setCustomValue = (id: string, value: string) => {
        setValue(id, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });
    };

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true);

        axios.patch('/api/profile', data)
            .then(() => {
                toast.success('個人資料已更新');
                router.refresh();
            })
            .catch(() => {
                toast.error('Something went wrong.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Container>
            <div className="max-w-screen-sm mx-auto flex flex-col gap-8">
                <Heading
                    title="個人資料"
                    subtitle="管理你的 GearShare 帳號資訊"
                />
                <div className="flex flex-row items-center gap-4">
                    <Avatar src={image} name={name} />
                    <div className="text-sm text-muted-foreground">
                        {currentUser.email}
                        <div>
                            加入時間：{format(new Date(currentUser.createdAt), 'PP')}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-sm font-semibold">大頭貼</div>
                    <ImageUpload
                        value={image}
                        onChange={(value) => setCustomValue('image', value)}
                    />
                </div>
                <Input
                    id="name"
                    label="姓名"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <div className="w-48">
                    <Button
                        disabled={isLoading}
                        label="儲存變更"
                        onClick={handleSubmit(onSubmit)}
                    />
                </div>
            </div>
        </Container>
    );
}

export default ProfileClient;
