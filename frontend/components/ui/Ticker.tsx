'use client';

import { useEffect, useRef } from 'react';

interface TickerProps {
    items?: Array<{
        symbol: string;
        pair: string;
        value: number;
    }>;
}

export default function Ticker({ items }: TickerProps) {
    const tickerRef = useRef<HTMLDivElement>(null);

    const defaultItems = items || [
        { symbol: 'BTC', pair: 'USD', value: 86000 },
        { symbol: 'BTC', pair: 'EUR', value: 79800 },
        { symbol: 'ckBTC', pair: 'USD', value: 85950 },
        { symbol: 'BTC', pair: 'CHF', value: 81992.25 },
        { symbol: 'ETH', pair: 'USD', value: 3200 },
    ];

    useEffect(() => {
        // Animate counter values
        const counters = tickerRef.current?.querySelectorAll('[data-value]');
        if (!counters) return;

        counters.forEach((counter) => {
            const element = counter as HTMLElement;
            const target = parseFloat(element.getAttribute('data-value') || '0');
            const duration = 2000;
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current).toLocaleString();
                }
            }, 16);

            return () => clearInterval(timer);
        });
    }, []);

    return (
        <div className="ticker-wrapper">
            <div className="ticker" ref={tickerRef}>
                {defaultItems.map((item, index) => (
                    <div className="item" key={index}>
                        <span>
                            {item.symbol}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path d="M16 160h441.4l-100.7 100.7c-6.25 6.25-6.25 16.38 0 22.62s16.38 6.25 22.62 0l128-128C510.4 152.2 512 148.1 512 144s-1.562-8.188-4.688-11.31l-128-128c-6.25-6.25-16.38-6.25-22.62 0s-6.25 16.38 0 22.62L457.4 128H16C7.156 128 0 135.2 0 144S7.156 160 16 160zM496 352H54.63l100.7-100.7c6.25-6.25 6.25-16.38 0-22.62s-16.38-6.25-22.62 0l-128 128C1.563 359.8 0 363.9 0 368s1.562 8.188 4.688 11.31l128 128c6.25 6.25 16.38 6.25 22.62 0s6.25-16.38 0-22.62L54.63 384H496c8.844 0 16-7.156 16-16S504.8 352 496 352z" />
                            </svg>
                            {item.pair}
                        </span>
                        <strong data-value={item.value}>0</strong>
                    </div>
                ))}
                {/* Duplicate for seamless loop */}
                {defaultItems.map((item, index) => (
                    <div className="item" key={`dup-${index}`}>
                        <span>
                            {item.symbol}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path d="M16 160h441.4l-100.7 100.7c-6.25 6.25-6.25 16.38 0 22.62s16.38 6.25 22.62 0l128-128C510.4 152.2 512 148.1 512 144s-1.562-8.188-4.688-11.31l-128-128c-6.25-6.25-16.38-6.25-22.62 0s-6.25 16.38 0 22.62L457.4 128H16C7.156 128 0 135.2 0 144S7.156 160 16 160zM496 352H54.63l100.7-100.7c6.25-6.25 6.25-16.38 0-22.62s-16.38-6.25-22.62 0l-128 128C1.563 359.8 0 363.9 0 368s1.562 8.188 4.688 11.31l128 128c6.25 6.25 16.38 6.25 22.62 0s6.25-16.38 0-22.62L54.63 384H496c8.844 0 16-7.156 16-16S504.8 352 496 352z" />
                            </svg>
                            {item.pair}
                        </span>
                        <strong data-value={item.value}>0</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}
