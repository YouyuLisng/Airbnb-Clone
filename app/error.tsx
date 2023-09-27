'use client';

import { useEffect } from "react";
import EmptyState from "./components/EmptyState";

interface ErrorStateProps {
    error: Error
}

const ErrorState: React.FC<ErrorStateProps> = ({
    error
}) => {
    useEffect(() => {
        console.log(error);
    }, [error]);
    return (
        <EmptyState
            title="Uh Oh"
            subtitle="遇到了一點錯誤...."
        />
    );
}

export default ErrorState;