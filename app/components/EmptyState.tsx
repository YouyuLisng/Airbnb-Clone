"use client";
import { useRouter } from "next/navigation";
import Heading from "./Navbar/Heading";
import Button from "./Button";

interface EmptyStateProps {
    title?: string,
    subtitle?: string,
    showReset?: boolean
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = '找不到符合的結果',
    subtitle = '試著調整或清除篩選條件。',
    showReset
}) => {
    const router = useRouter();
    return (
        <div className="h-[60vh] flex flex-col gap-2 justify-center items-center">
            <Heading
                center
                title={title}
                subtitle={subtitle}
            />
            <div className="w-48 mt-4">
                {showReset &&(
                    <Button
                        outline
                        label="清除篩選條件"
                        onClick={() => router.push('/') }
                    />
                )}
            </div>
        </div>
    );
}

export default EmptyState;
