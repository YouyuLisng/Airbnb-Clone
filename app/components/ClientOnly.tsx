'use client';

import React, { useState, useEffect } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({ 
    children
}) => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        // Intentional: this can only flip after client-side hydration
        // completes, so there's no render-time equivalent (unlike
        // props-derived state, this isn't synchronizing with a prop).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasMounted(true);
    }, [])

    if (!hasMounted) return null;

    return (
        <>
        {children}
        </>
    );
};

export default ClientOnly;