"use client";

import qs from 'query-string'
import dynamic from "next/dynamic";
import Modal from "./Modal";
import RegionSelect, { RegionSelectValue } from "../Input/RegionSelect";

import useSearchModal from "@/app/hooks/useSearchModal";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Range } from "react-date-range";
import { formatISO } from 'date-fns';
import Heading from '../Navbar/Heading';
import Calendar from '@/app/components/Input/Calendar'

enum STEPS {
    LOCATION = 0,
    DATE = 1
}

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
    const [step, setStep] = useState(STEPS.LOCATION); // 步驟
    const [dateRange, setDateRange] = useState<Range>({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    });

    const onBack = useCallback(() => {
        setStep((value) => value - 1)
    }, []);

    const onNext = useCallback(() => {
        setStep((value) => value + 1)
    }, []);

    const onSubmit = useCallback( async () => {
        if(step !== STEPS.DATE) {
            return onNext();
        }

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

        setStep(STEPS.LOCATION);
        searchModal.onClose();
        router.push(url);

    },
    [
        step,
        searchModal,
        location,
        router,
        dateRange,
        onNext,
        params
    ]);

    const actionLabel = useMemo(() => {
        if(step === STEPS.DATE) {
            return '搜尋'
        }

        return '下一步'
    }, [step]);

    const secondaryActionLabel = useMemo(() => {
        if(step === STEPS.LOCATION) {
            return 'undefined'
        }

        return '上一步'
    }, [step]);

    let bodyContent = (
        <div className='flex flex-col gap-8'>
            <Heading
                title="想在哪個地區取件呢"
                subtitle="選出你想租借裝備的地區吧！"
            />
            <RegionSelect
                value={location}
                onChang={(value) => setLocation(value as RegionSelectValue)}
            />
            <hr />
            <Map center={location?.latlng} />
        </div>
    );

    if(step === STEPS.DATE) {
        bodyContent= (
            <div className='flex flex-col gap-8'>
                <Heading
                    title="選擇租借日期"
                    subtitle="請問什麼時候需要用到裝備呢？"
                />
                <Calendar
                    value={dateRange}
                    onChange={(value) => setDateRange(value.selection)}
                />
            </div>
        )
    }

    return (
        <Modal
            isOpen={searchModal.isOpen}
            onClose={searchModal.onClose}
            onSubmit={onSubmit}
            title="搜尋裝備"
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.LOCATION ? undefined : onBack}
            body={bodyContent}
        />
    );
}

export default SearchModal;
