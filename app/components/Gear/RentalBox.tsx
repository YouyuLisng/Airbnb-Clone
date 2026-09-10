"use client";

import { Range } from 'react-date-range'
import Calendar from '../Input/Calendar';
import Button from '../Button';

interface RentalBoxProps {
    pricePerDay: number,
    depositAmount: number,
    totalPrice: number,
    dateRange: Range,
    onChangeDate: (value: Range) => void,
    onSubmit: () => void,
    disabled?: boolean,
    disabledDates: Date[]
}

const RentalBox: React.FC<RentalBoxProps> = ({
    pricePerDay,
    depositAmount,
    totalPrice,
    dateRange,
    onChangeDate,
    onSubmit,
    disabled,
    disabledDates
}) => {
    return (
        <div className=' bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden'>
            <div className='flex flex-row items-center p-4'>
                <div className='text-2xl font-semibold'>
                    ${pricePerDay} TWD
                </div>
                <div className='font-light text-md text-neutral-600'>
                    天
                </div>
            </div>
            <hr />
                <Calendar
                    value={dateRange}
                    disabledDates={disabledDates}
                    onChange={(value) => onChangeDate(value.selection)}
                />
            <hr />
            <div className='p-4'>
                <Button
                    disabled={disabled}
                    label='送出租借申請'
                    onClick={onSubmit}
                />
            </div>
            <div className='p-4 flex flex-col gap-1 text-neutral-600'>
                <div className='flex flex-row items-center justify-between'>
                    <div>租金小計</div>
                    <div>${totalPrice} TWD</div>
                </div>
                <div className='flex flex-row items-center justify-between'>
                    <div>押金（歸還後退回）</div>
                    <div>${depositAmount} TWD</div>
                </div>
                <hr className='my-1' />
                <div className='flex flex-row items-center justify-between font-semibold text-lg text-black'>
                    <div>應付總額</div>
                    <div>${totalPrice + depositAmount} TWD</div>
                </div>
            </div>
        </div>
    );
}

export default RentalBox;
