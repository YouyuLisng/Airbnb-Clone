"use client";

import { Range } from 'react-date-range'
import Calendar from '../Input/Calendar';
import Button from '../Button';

interface ListingReservtionProps {
    price: number,
    totalPrice: number,
    dateRange: Range,
    onChangeDate: (value: Range) => void,
    onSubmit: () => void,
    disabled?: boolean,
    disabledDates: Date[]
}

const ListingReservtion: React.FC<ListingReservtionProps> = ({
    price,
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
                    ${price} TWD
                </div>
                <div className='font-light text-md text-neutral-600'>
                    晚
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
                    label='預訂'
                    onClick={onSubmit}
                />
            </div>
            <div className='p-4 flex flex-row items-center justify-between font-semibold text-lg'>
                <div>
                    總價
                </div>
                <div>
                    ${totalPrice} TWD
                </div>
            </div>
        </div>
    );
}

export default ListingReservtion;