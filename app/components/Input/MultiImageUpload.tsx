"use client";

import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import Image from "next/image";
import { useCallback } from "react";
import { TbPhotoPlus, TbX } from "react-icons/tb";

const MAX_GALLERY_IMAGES = 6;

interface MultiImageUploadProps {
    value: string[];
    onChange: (value: string[]) => void;
}

// Companion to ImageUpload -- that one manages the single cover photo
// (Gear.imageSrc), this one manages the optional gallery
// (Gear.imageSrcs). Kept as a separate component rather than an
// ImageUpload variant since the value shape (array vs single string)
// and the widget config (multiple: true) are different enough that
// sharing one component would need a branch on nearly every line.
const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
    value,
    onChange
}) => {
    // Cloudinary's widget fires onUpload once per file when multiple
    // files are picked in one session, not once with the whole batch --
    // append as each one lands.
    const handleUpload = useCallback((result: CloudinaryUploadWidgetResults) => {
        if (typeof result.info === "object" && result.info?.secure_url) {
            onChange([...value, result.info.secure_url]);
        }
    }, [value, onChange]);

    const handleRemove = useCallback((e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        onChange(value.filter((item) => item !== url));
    }, [value, onChange]);

    const remainingSlots = MAX_GALLERY_IMAGES - value.length;

    return (
        <div className="flex flex-wrap gap-3">
            {value.map((url) => (
                <div
                    key={url}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-border"
                >
                    <Image
                        alt="Gallery"
                        src={url}
                        fill
                        sizes="96px"
                        style={{ objectFit: 'cover' }}
                    />
                    <button
                        type="button"
                        onClick={(e) => handleRemove(e, url)}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition"
                        aria-label="移除照片"
                    >
                        <TbX size={14} />
                    </button>
                </div>
            ))}
            {remainingSlots > 0 && (
                <CldUploadWidget
                    onUpload={handleUpload}
                    uploadPreset="jf3yjihr"
                    options={{
                        multiple: true,
                        maxFiles: remainingSlots
                    }}
                >
                    {({ open }) => (
                        <button
                            type="button"
                            onClick={() => open?.()}
                            className="w-24 h-24 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground outline-none transition hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <TbPhotoPlus size={24} />
                            <span className="text-xs">新增照片</span>
                        </button>
                    )}
                </CldUploadWidget>
            )}
        </div>
    );
}

export default MultiImageUpload;
