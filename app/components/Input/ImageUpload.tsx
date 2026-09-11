"use client"; // 上傳圖片
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import Image from "next/image";
import { useCallback } from "react";
import { TbPhotoPlus } from "react-icons/tb";

import { cn } from "@/app/libs/utils";

declare global {
    var cloudinary: any;
}

interface ImageUploadProps {
    onChange: (value: string) => void;
    value: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    onChange,
    value
}) => {

    const handleUpload = useCallback((result: CloudinaryUploadWidgetResults) => {
        if (typeof result.info === "object" && result.info?.secure_url) {
            onChange(result.info.secure_url);
        }
    }, [onChange]);

    return (
        <CldUploadWidget
            onUpload={handleUpload}
            uploadPreset="jf3yjihr"
            options={{
                maxFiles: 1
            }}
        >
        {({ open }) => {
            return(
                <button
                    type="button"
                    onClick={() => open?.()}
                    className={cn(
                        "relative flex w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-20 text-muted-foreground outline-none transition hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                >
                    <TbPhotoPlus size={50} />
                    <div className="font-semibold text-lg">
                        點擊上傳圖片
                    </div>
                    {value &&(
                        <div className="absolute inset-0 h-full w-full">
                            <Image
                                alt="Upload"
                                fill
                                style={{ objectFit: 'cover' }}
                                src={value}
                            />
                        </div>
                    )}
                </button>
            )
        }}
        </CldUploadWidget>
    );
}

export default ImageUpload;
