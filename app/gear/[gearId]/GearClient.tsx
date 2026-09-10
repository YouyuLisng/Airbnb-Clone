'use client';

import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Range } from "react-date-range";
import { useRouter } from "next/navigation";
import { differenceInDays, eachDayOfInterval } from 'date-fns';

import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeGear, SafeRental, SafeUser } from "@/app/types";

import Container from "@/app/components/Container";
import { categories } from "@/app/components/Navbar/Categories";
import GearHead from "@/app/components/Gear/GearHead";
import GearInfo from "@/app/components/Gear/GearInfo";
import RentalBox from "@/app/components/Gear/RentalBox";

const initialDateRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
};

interface GearClientProps {
    rentals?: SafeRental[];
    gear: SafeGear & {
        user: SafeUser;
    };
    currentUser?: SafeUser | null;
}

const GearClient: React.FC<GearClientProps> = ({
    gear,
    rentals = [],
    currentUser
}) => {
    const loginModal = useLoginModal();
    const router = useRouter();

    const disabledDates = useMemo(() => {
        let dates: Date[] = [];

        rentals.forEach((rental) => {
        const range = eachDayOfInterval({
            start: new Date(rental.startDate),
            end: new Date(rental.endDate)
        });

        dates = [...dates, ...range];
        });

        return dates;
    }, [rentals]);

    const category = useMemo(() => {
        return categories.find((items) =>
        items.label === gear.category);
    }, [gear.category]);

    const [isLoading, setIsLoading] = useState(false);
    const [dateRange, setDateRange] = useState<Range>(initialDateRange);

    // Derived purely from dateRange/gear.pricePerDay, so it's computed
    // directly instead of mirrored into its own state via an effect.
    const totalPrice = useMemo(() => {
        if (dateRange.startDate && dateRange.endDate) {
            const dayCount = differenceInDays(
                dateRange.endDate,
                dateRange.startDate
            );

            if (dayCount && gear.pricePerDay) {
                return dayCount * gear.pricePerDay;
            }
        }

        return gear.pricePerDay;
    }, [dateRange, gear.pricePerDay]);

    const onCreateRental = useCallback(() => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        setIsLoading(true);

        axios.post('/api/rentals', {
            totalPrice,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            gearId: gear.id
        })
        .then(() => {
            toast.success('租借申請已送出！');
            setDateRange(initialDateRange);
            router.push('/renting');
        })
        .catch(() => {
            toast.error('Something went wrong.');
        })
        .finally(() => {
            setIsLoading(false);
        })
    },
    [
        totalPrice,
        dateRange,
        gear.id,
        router,
        currentUser,
        loginModal
    ]);

    return (
        <Container>
          <div className="max-w-screen-lg mx-auto">
            <div className="flex flex-col gap-6">
              <GearHead
                title={gear.title}
                imageSrc={gear.imageSrc}
                locationValue={gear.locationValue}
                id={gear.id}
                currentUser={currentUser}
              />
              <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
                <GearInfo
                  user={gear.user}
                  category={category}
                  description={gear.description}
                  condition={gear.condition}
                  depositAmount={gear.depositAmount}
                  locationValue={gear.locationValue}
                />
                <div
                  className="
                    order-first
                    mb-10
                    md:order-last
                    md:col-span-3
                  "
                >
                  <RentalBox
                    pricePerDay={gear.pricePerDay}
                    depositAmount={gear.depositAmount}
                    totalPrice={totalPrice}
                    onChangeDate={(value) => setDateRange(value)}
                    dateRange={dateRange}
                    onSubmit={onCreateRental}
                    disabled={isLoading}
                    disabledDates={disabledDates}
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      );
}

export default GearClient;
