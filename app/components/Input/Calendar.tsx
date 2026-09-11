'use client';

import { addYears } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { DateRange as DayPickerRange } from 'react-day-picker';

import { Calendar as ShadcnCalendar } from '@/app/components/ui/calendar';

// Kept shaped like react-date-range's Range/RangeKeyDict (which this
// replaces) so RentalBox.tsx and GearClient.tsx -- both of which pass
// this value around and read startDate/endDate off it -- didn't need
// to change beyond their import source.
export interface DateRangeValue {
    startDate?: Date;
    endDate?: Date;
    key?: string;
}

export interface RangeKeyDict {
    [key: string]: DateRangeValue;
}

interface DatePickerProps {
    value: DateRangeValue,
    onChange: (value: RangeKeyDict) => void;
    disabledDates?: Date[];
}

const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    disabledDates = []
}) => {
    const selected: DayPickerRange = {
        from: value.startDate,
        to: value.endDate,
    };

    const handleSelect = (range: DayPickerRange | undefined) => {
        onChange({
            selection: {
                // A single click gives a from-only range (to is still
                // undefined) -- treat that as a one-day booking instead
                // of leaving endDate undefined, matching how this picker
                // starts out (initialDateRange has startDate === endDate).
                startDate: range?.from,
                endDate: range?.to ?? range?.from,
                key: value.key ?? 'selection',
            }
        });
    };

    return (
        <ShadcnCalendar
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            disabled={[{ before: new Date() }, ...disabledDates]}
            locale={zhTW}
            captionLayout="dropdown"
            startMonth={new Date()}
            endMonth={addYears(new Date(), 1)}
            numberOfMonths={1}
            className="w-full"
        />
    );
}

export default DatePicker;
