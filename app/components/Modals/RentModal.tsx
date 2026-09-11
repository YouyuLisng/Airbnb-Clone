"use client";

import useRentModal from "@/app/hooks/useRentModal";
import Modal from "./Modal";

import { useMemo, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import {
    AiFillStar,
    AiOutlineCheckCircle,
    AiOutlineMinusCircle,
    AiOutlineWarning
} from "react-icons/ai";

import Heading from "../Navbar/Heading";
import CategoryInput from "../Input/CategoryInput";

import { categories } from "../Navbar/Categories";
import RegionSelect from "../Input/RegionSelect";
import dynamic from "next/dynamic";
import ImageUpload from "../Input/ImageUpload";
import MultiImageUpload from "../Input/MultiImageUpload";
import Input from "../Input/Input";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

enum STEPS {
    CATEGORY = 0,
    LOCATION = 1,
    CONDITION = 2,
    IMAGES = 3,
    DESCRIPTION = 4,
    PRICE = 5
}

const CONDITIONS = [
    { label: '全新', icon: AiFillStar },
    { label: '良好', icon: AiOutlineCheckCircle },
    { label: '普通', icon: AiOutlineMinusCircle },
    { label: '需維修', icon: AiOutlineWarning },
];

// Hoisted to module scope: dynamic() only needs to be called once, not
// re-created (even memoized) on every RentModal render.
const Map = dynamic(() => import('../Map'), {
    ssr: false
});

const RentModal = () => {
    const rentModal = useRentModal();
    const router = useRouter();

    const [step, setStep] = useState(STEPS.CATEGORY);  // 上架裝備 順序
    const [isLoading, setIsLoading] = useState(false); // 執行Api時 Input = disable

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
        },
        reset,
    } = useForm<FieldValues>({
        defaultValues: {
            category: '',
            location: null,
            condition: '',
            imageSrc: '',
            imageSrcs: [] as string[],
            depositAmount: 1,
            pricePerDay: 1,
            title: '',
            description: '',
        }
    });
    const category = watch('category');
    const location = watch('location');
    const condition = watch('condition');
    const imageSrc = watch('imageSrc');
    const imageSrcs = watch('imageSrcs');

    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true
        })
    }

    const onBack = () => {
        setStep((value) => value - 1)
    };

    const onNext = () => {
        setStep((value) => value + 1)
    };

    const actionLabel = useMemo(() => {
        if(step === STEPS.PRICE) {
            return '建立'
        }

        return '下一步'
    }, [step]);

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if (step !== STEPS.PRICE) {
            return onNext();
        }

        setIsLoading(true);

        axios.post('/api/gear', data)
        .then(() => {
            toast.success('裝備上架成功！');
            router.refresh();
            reset();
            setStep(STEPS.CATEGORY)
            rentModal.onClose();
        })
        .catch(() => {
            toast.error('Something went wrong.');
        })
        .finally(() => {
            setIsLoading(false);
        })
    }

    const secondaryActionLabel = useMemo(() => {
        if(step === STEPS.CATEGORY) {
            return 'undefined'
        }

        return '上一步'
    }, [step]);

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
                title="裝備類別"
                subtitle="選擇下方最符合的類別"
            />
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                {categories.map((item) => (
                    <div key={item.label} className="col-span-1">
                        <CategoryInput
                            onClick={(category) => setCustomValue('category', category)}
                            selected={category === item.label}
                            label={item.label}
                            icon={item.icon}
                        />
                    </div>
                ))}
            </div>
        </div>
    )

    if(step === STEPS.LOCATION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                title="取件地點"
                subtitle="請告訴我們裝備的所在地區！"
                />
                <RegionSelect
                    value={location}
                    onChang={(value) => setCustomValue('location', value)}
                />
                <Map
                    center={location?.latlng}
                />
            </div>
        )
    }

    if(step === STEPS.CONDITION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="新舊狀況"
                    subtitle="請誠實描述裝備目前的狀況"
                />
                <div className=" grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CONDITIONS.map((item) => (
                        <div key={item.label} className="col-span-1">
                            <CategoryInput
                                onClick={(value) => setCustomValue('condition', value)}
                                selected={condition === item.label}
                                label={item.label}
                                icon={item.icon}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if(step === STEPS.IMAGES) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="圖片"
                    subtitle="請上傳一張代表裝備的的照片"
                />
                <ImageUpload
                    value={imageSrc}
                    onChange={(value) => setCustomValue('imageSrc', value)}
                />
                <div className="flex flex-col gap-3">
                    <Heading
                        title="更多照片（選填）"
                        subtitle="最多可以再上傳 6 張，讓租借者更了解裝備狀況"
                    />
                    <MultiImageUpload
                        value={imageSrcs}
                        onChange={(value) => setCustomValue('imageSrcs', value)}
                    />
                </div>
            </div>
        )
    }

    if(step === STEPS.DESCRIPTION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="裝備名稱"
                    subtitle="請填寫裝備名稱以及介紹"
                />
                <Input
                    id="title"
                    label="名稱"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <hr />
                <Input
                    id="description"
                    label="描述"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        )
    }

    if(step === STEPS.PRICE) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="租金與押金"
                    subtitle="請填寫每日租金，以及歸還後會退回的押金"
                />
                <Input
                    id="pricePerDay"
                    label="每日租金"
                    formatPrice
                    disabled={isLoading}
                    type="number"
                    register={register}
                    errors={errors}
                    required
                />
                <hr />
                <Input
                    id="depositAmount"
                    label="押金"
                    formatPrice
                    disabled={isLoading}
                    type="number"
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        )
    }

    return (
        <Modal
            isOpen={rentModal.isOpen}
            onClose={rentModal.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.CATEGORY ? undefined : onBack }
            title="上架你的裝備"
            body={bodyContent}
        />
    );
}

export default RentModal;
