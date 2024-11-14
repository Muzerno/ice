'use client';
import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        longdo: any;
    }
}

interface LongdoMapProps {
    width?: string;
    height?: string;
}

const LongdoMap: React.FC<LongdoMapProps> = ({ width = '100%', height = '400px' }) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.longdo) {
            new window.longdo.Map({
                placeholder: mapRef.current,
            });
        }
    }, []);

    return <div ref={mapRef} style={{ width, height }} />;
};

export default LongdoMap;
