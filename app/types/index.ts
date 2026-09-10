// @ts-ignore
import { Gear, Rental, User } from "@prisma/client";

export type SafeGear = Omit<Gear, "createdAt"> & {
    createdAt: string;
};

export type SafeRental = Omit<
    Rental,
    "createdAt" | "startDate" | "endDate" | "gear"
> & {
    createdAt: string;
    startDate: string;
    endDate: string;
    gear: SafeGear;
};

export type SafeUser = Omit<
    User,
    "createdAt" | "updatedAt" | "emailVerified"
    > & {
    createdAt: string;
    updatedAt: string;
    emailVerified: string | null;
};
