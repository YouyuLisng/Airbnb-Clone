"use client";

import qs from 'query-string'
import dynamic from "next/dynamic";
import Modal from "./Modal";
import RegionSelect, { RegionSelectValue } from "../Input/RegionSelect";

import useSearchModal from "@/app/hooks/useSearchModal";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Range } from "react-date-range";
import { formatISO } from 'date-fns';
import Heading from '../Navbar/Heading';
import Calendar from '@/app/components/Input/Calendar'

// Hoisted to module scope: dynamic() only needs to be called once, not
// re-created (even memoized) on every SearchModal render.
const Map = dynamic(() => import('../Map'), {
    ssr: false
});

const SearchModal = () => {
    const router = useRouter();
    const params = useSearchParams();
    const searchModal = useSearchModal();

    const [location, setLocation] = useState<RegionSelectValue>()
    const [dateRange, setDateRange] = useState<Range>({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    });

    // Location and date used to be two separate wizard steps, but they're
    // just two filters on one search -- not enough content to justify
    // making someone click through a multi-step flow for them, so this is
    // now a single panel instead.
    const onSubmit = useCallback(async () => {
        let currentQuery = {};

        if(params) {
            currentQuery = qs.parse(params.toString());
        }

        const updatedQuery: any = {
            ...currentQuery,
            locationValue: location?.value,
        };

        if(dateRange.startDate) {
            updatedQuery.startDate = formatISO(dateRange.startDate)
        }

        if(dateRange.endDate) {
            updatedQuery.endDate = formatISO(dateRange.endDate)
        }

        const url = qs.stringifyUrl({
            url: '/',
            query: updatedQuery
        }, { skipNull: true });

        searchModal.onClose();
        router.push(url);

    },
    [
        searchModal,
        location,
        router,
        dateRange,
        params
    ]);

    const bodyContent = (
        <div className='flex flex-col gap-6'>
            <Heading
                title="搜尋裝備"
                subtitle="選擇地區與租借日期"
            />
            <div className="flex flex-col gap-3">
                <RegionSelect
                    value={location}
                    onChang={(value) => setLocation(value as RegionSelectValue)}
                />
                <Map center={location?.latlng} />
            </div>
            <hr />
            <Calendar
                value={dateRange}
                onChange={(value) => setDateRange(value.selection)}
            />
        </div>
    );

    return (
        <Modal
            isOpen={searchModal.isOpen}
            onClose={searchModal.onClose}
            onSubmit={onSubmit}
            title="搜尋裝備"
            actionLabel="搜尋"
            body={bodyContent}
        />
    );
}

export default SearchModal;
