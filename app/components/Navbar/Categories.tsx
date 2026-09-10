"use client";

import Container from "../Container";
import { FaSkiing } from 'react-icons/fa';
import {
    GiBackpack,
    GiBinoculars,
    GiCampCookingPot,
    GiCampingTent,
    GiCanoe,
    GiFishingPole,
    GiHiking,
    GiIceCube,
    GiLantern,
    GiSleepingBag,
} from 'react-icons/gi';
import { IoCameraOutline } from 'react-icons/io5';
import CategoryBox from "../CategoryBox";
import { usePathname, useSearchParams } from "next/navigation";

export const categories = [
    {
        label: '帳篷',
        icon: GiCampingTent,
        description: '各式露營帳篷，適合各種天候與人數！',
    },
    {
        label: '睡袋',
        icon: GiSleepingBag,
        description: '保暖睡袋，四季款式皆有！',
    },
    {
        label: '登山包',
        icon: GiBackpack,
        description: '大容量登山背包，長短程皆適用！',
    },
    {
        label: '爐具炊具',
        icon: GiCampCookingPot,
        description: '露營爐具與鍋具，野炊必備！',
    },
    {
        label: '攝影器材',
        icon: IoCameraOutline,
        description: '相機、鏡頭與空拍機，記錄美好旅程！',
    },
    {
        label: '水上用具',
        icon: GiCanoe,
        description: '獨木舟、SUP 等水上運動裝備！',
    },
    {
        label: '登山健行',
        icon: GiHiking,
        description: '登山杖、頭燈等健行必需品！',
    },
    {
        label: '露營燈具',
        icon: GiLantern,
        description: '營燈與照明設備，夜晚不再黑暗！',
    },
    {
        label: '保冷用品',
        icon: GiIceCube,
        description: '行動冰箱與保冷袋，食材新鮮保存！',
    },
    {
        label: '釣具',
        icon: GiFishingPole,
        description: '釣竿與漁具，享受釣魚樂趣！',
    },
    {
        label: '滑雪用具',
        icon: FaSkiing,
        description: '雪板、雪杖等滑雪裝備！',
    },
    {
        label: '望遠鏡',
        icon: GiBinoculars,
        description: '賞鳥、觀星望遠鏡！',
    },
]



const Categories = () => {
    const params = useSearchParams();
    const category = params?.get('category');
    const pathname = usePathname();

    const isMainPage = pathname === '/';

    if(!isMainPage) {
        return null
    }

    return (
        <Container>
            <div className="py-4 flex flex-row items-center gap-3 overflow-x-auto">
                {categories.map((item) => (
                    <CategoryBox
                    key={item.label}
                    label={item.label}
                    selected={category === item.label}
                    description={item.description}
                    icon={item.icon}
                    />
                ))}
            </div>
        </Container>
    );
}

export default Categories;
