"use client";

import qs from 'query-string'
import dynamic from "next/dynamic";
import Modal from "./Modal";
import CountrySelect, { CountrySelectValue } from "../Input/CountrySelect";

import useSearchModal from "@/app/hooks/useSearchModal";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Range } from "react-date-range";
import { formatISO } from 'date-fns';
import Heading from '../Navbar/Heading';
import Calendar from '@/app/components/Input/Calendar'
import Counter from '../Input/Counter';

enum STEPS {
    LOCATION = 0,
    DATE = 1,
    INFO = 2
}

const SearchModal = () => {
    const router = useRouter();
    const params = useSearchParams();
    const searchModal = useSearchModal();

    const [location, setLocation] = useState<CountrySelectValue>()
    const [step, setStep] = useState(STEPS.LOCATION); // 步驟
    const [guestCount, setGuestCount] = useState(1); // 人數
    const [roomCount, setRoomCount] = useState(1);
    const [bathroomCount, setBothroomCount] = useState(1);
    const [dateRange, setDateRange] = useState<Range>({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
    });

    const Map = useMemo(() => dynamic(() => import('../Map'),{
        ssr: false
    }), [location]);

    const onBack = useCallback(() => {
        setStep((value) => value - 1)
    }, []);

    const onNext = useCallback(() => {
        setStep((value) => value + 1)
    }, []);

    const onSubmit = useCallback( async () => {
        if(step !== STEPS.INFO) {
            return onNext();
        }

        let currentQuery = {};

        if(params) {
            currentQuery = qs.parse(params.toString());
        }

        const updatedQuery: any = {
            ...currentQuery,
            locationValue: location?.value,
            guestCount,
            roomCount,
            bathroomCount
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
        guestCount,
        roomCount,
        bathroomCount,
        dateRange,
        onNext,
        params
    ]);

    const actionLabel = useMemo(() => {
        if(step === STEPS.INFO) {
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
                title="你想去哪裡呢"
                subtitle="選出你最想去的地方吧！"
            />
            <CountrySelect 
                value={location}
                onChang={(value) => setLocation(value as CountrySelectValue)}
            />
            <hr />
            <Map center={location?.latlng} />
        </div>
    );

    if(step === STEPS.DATE) {
        bodyContent= (
            <div className='flex flex-col gap-8'>
                <Heading
                    title="選擇日期"
                    subtitle="請問何時出發呢？"
                />
                <Calendar
                    value={dateRange}
                    onChange={(value) => setDateRange(value.selection)}
                />
            </div>
        )
    }

    if(step === STEPS.INFO) {
        bodyContent = (
            <div className='flex flex-col gap-8'>
                <Heading
                    title="詳細資訊"
                    subtitle="提供更詳細的資訊給我們吧！"
                />
                <Counter 
                    title="人數"
                    subtitle="請問人數有幾位呢？"
                    value={guestCount}
                    onChange={(vaule) => setGuestCount(vaule)}
                />
                <Counter 
                    title="房間"
                    subtitle="請問需要幾間房間呢？"
                    value={roomCount}
                    onChange={(vaule) => setRoomCount(vaule)}
                />
                <Counter 
                    title="浴室"
                    subtitle="請問需要幾間浴室呢？"
                    value={bathroomCount}
                    onChange={(vaule) => setBothroomCount(vaule)}
                />
            </div>
        )
    }

    return (
        <Modal 
            isOpen={searchModal.isOpen}
            onClose={searchModal.onClose}
            onSubmit={onSubmit}
            title="搜尋"
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step === STEPS.LOCATION ? undefined : onBack}
            body={bodyContent}
        />
    );
}

export default SearchModal;