"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { IconType } from "react-icons";
import qs from 'query-string';

interface CategoryBoxProps {
    icon: IconType,
    label: string,
    selected?: boolean,
    description: string,
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
    icon: Icon,
    label,
    description,
    selected
}) => {
    const router = useRouter();
    const params = useSearchParams();
    const handleClick = useCallback(() => { // 點擊前往該參數的Url 
        let currentQuery = {}; // 當前網址參數 Query String

        if(params) {
            currentQuery = qs.parse(params.toString());
        }

        const updatedQuery: any = {
            ...currentQuery,
            category: label
        }

        if(params?.get('category') === label) {
            delete updatedQuery.category
        }

        const url = qs.stringifyUrl({
            url: '/',
            query: updatedQuery
        }, { skipNull: true });

        router.push(url);

    }, [label, params, router]);
    return (
        <div
        onClick={handleClick}
        className={`
        flex
        flex-row
        items-center
        gap-2
        px-4
        py-2
        rounded-full
        border
        whitespace-nowrap
        transition
        cursor-pointer
        ${selected
            ? 'bg-emerald-700 border-emerald-700 text-white'
            : 'bg-white border-neutral-300 text-neutral-600 hover:border-emerald-700 hover:text-emerald-700'
        }
        `}>
            <Icon size={18} />
            <div className="font-medium text-sm">
                {label}
            </div>
        </div>
    );
}

export default CategoryBox;