'use client';
import useRegions from '@/app/hooks/useRegions';
import useSearchModal from '@/app/hooks/useSearchModal';
import { differenceInDays } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { BiCalendar, BiMapPin, BiSearch } from 'react-icons/bi'


const Search = () => {
    const searchModal = useSearchModal();
    const params = useSearchParams(); // 取網址參數
    const { getByValue } = useRegions();

    const locationValue = params?.get('locationValue');
    const startDate = params?.get('startDate');
    const endDate = params?.get('endDate');

    const locationLabel = useMemo(() => {

        if(locationValue) {
            return getByValue(locationValue as string)?.label;
        }

        return '任何地方'
    }, [locationValue, getByValue]);

    const durationLabel = useMemo(() => {
        if (startDate && endDate) {
            const start = new Date(startDate as string);
            const end = new Date(endDate as string);
            let diff = differenceInDays(end, start);

            if (diff === 0) {
                diff = 1;
            }

            return `${diff} 天`;
        }
        return '任何時間'
    }, [startDate, endDate]);

    return (
        <div
            onClick={searchModal.onOpen}
            className="border border-neutral-300 w-full md:w-auto rounded-md shadow-sm hover:border-emerald-700 hover:shadow-md transition cursor-pointer"
        >
            <div className="flex flex-row items-stretch">
                <div className="flex flex-row items-center gap-2 text-sm font-semibold px-4 py-2.5">
                    <BiMapPin size={16} className="text-emerald-700" />
                    {locationLabel}
                </div>
                <div className="hidden sm:flex flex-row items-center gap-2 text-sm font-semibold px-4 py-2.5 border-x border-neutral-200">
                    <BiCalendar size={16} className="text-emerald-700" />
                    {durationLabel}
                </div>
                <div className="flex flex-row items-center px-2">
                    <div className="p-2 bg-emerald-600 rounded text-white">
                        <BiSearch size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Search;
