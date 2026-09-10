// @ts-ignore
import { Gear, Rental, Review, User } from "@prisma/client";

export type SafeGear = Omit<Gear, "createdAt"> & {
    createdAt: string;
};

export type SafeReview = Omit<Review, "createdAt"> & {
    createdAt: string;
    user: Pick<SafeUser, "id" | "name" | "image">;
};

export type SafeRental = Omit<
    Rental,
    "createdAt" | "startDate" | "endDate" | "gear"
> & {
    createdAt: string;
    startDate: string;
    endDate: string;
    gear: SafeGear;
    review?: SafeReview | null;
};

export type SafeUser = Omit<
    User,
    "createdAt" | "updatedAt" | "emailVerified"
    > & {
    createdAt: string;
    updatedAt: string;
    emailVerified: string | null;
};
