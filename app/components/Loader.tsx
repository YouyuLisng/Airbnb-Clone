"use client";

import { Loader2 } from "lucide-react";

const Loader = () => {
    return (
        <div className="h-[70vh] flex flex-col justify-center items-center">
            <Loader2 size={64} className="animate-spin text-primary" />
        </div>
    );
}

export default Loader;
