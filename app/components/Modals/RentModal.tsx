"use client";

import useRentModal from "@/app/hooks/useRentModal";
import Modal from "./Modal";

import { useMemo, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import Heading from "../Navbar/Heading";
import CategoryInput from "../Input/CategoryInpit";

import { categories } from "../Navbar/Categories";
import CountrySelect from "../Input/CountrySelect";
import dynamic from "next/dynamic";
import Counter from "../Input/Counter";
import ImageUpload from "../Input/ImageUpload";
import Input from "../Input/Input";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

enum STEPS {
    CATEGORY = 0,
    LOCATION = 1,
    INFO = 2,
    IMAGES = 3,
    DESCRIPTION = 4,
    PRICE = 5
}

const RentModal = () => {
    const rentModal = useRentModal();
    const router = useRouter();

    const [step, setStep] = useState(STEPS.CATEGORY);  // 創建租屋物件 順序
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
            guestCount: 1,
            roomCount: 1,
            bathroomCount: 1,
            imageSrc: '',
            price: 1,
            title: '',
            description: '',
        }
    });
    const category = watch('category');
    const location = watch('location');

    const guestCount = watch('guestCount');
    const roomCount = watch('roomCount');
    const bathroomCount = watch('bathroomCount');
    const imageSrc = watch('imageSrc');

    // 引入地圖元件
    const Map = useMemo(() => dynamic(() => import('../Map'),{
        ssr: false
    }), []);

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
    
        axios.post('/api/listings', data)
        .then(() => {
            toast.success('Listing created!');
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
                title="描述"
                subtitle="選擇下方的一種特色"
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
                title="位置"
                subtitle="請告訴我們您的房源位置！"
                />
                <CountrySelect
                    value={location}
                    onChang={(value) => setCustomValue('location', value)}
                />
                <Map
                    center={location?.latlng}
                />
            </div>
        )
    }

    if(step === STEPS.INFO) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="詳細資訊"
                    subtitle="請填寫詳細的房屋資訊"
                />
                <Counter 
                    title="人數"
                    subtitle="請問人數有幾位呢？"
                    value={guestCount}
                    onChange={(vaule) => setCustomValue('guestCount', vaule)}
                />
                <hr />
                <Counter 
                    title="房間"
                    subtitle="請問需要幾間房間呢？"
                    value={roomCount}
                    onChange={(vaule) => setCustomValue('roomCount', vaule)}
                />
                <hr />
                <Counter 
                    title="浴室"
                    subtitle="請問需要幾間浴室呢？"
                    value={bathroomCount}
                    onChange={(vaule) => setCustomValue('bathroomCount', vaule)}
                />
            </div>
        )
    }

    if(step === STEPS.IMAGES) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="圖片"
                    subtitle="請上傳一張代表房源的的照片"
                />
                <ImageUpload 
                    value={imageSrc}
                    onChange={(value) => setCustomValue('imageSrc', value)}
                />
            </div>
        )
    }

    if(step === STEPS.DESCRIPTION) {
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="房源名稱"
                    subtitle="請填寫房源名稱以及介紹"
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
                    title="價格"
                    subtitle="請填寫一晚需收取的價格"
                />
                <Input 
                    id="price"
                    label="價格"
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
            title="向我們介紹你的房源"
            body={bodyContent}
        />
    );
}

export default RentModal;