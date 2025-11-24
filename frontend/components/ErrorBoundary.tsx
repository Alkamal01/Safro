'use client';

import { useEffect, useState } from 'react';

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Capture all errors
        const handleError = (event: ErrorEvent) => {
            setError(`Error: ${event.message}\nFile: ${event.filename}\nLine: ${event.lineno}:${event.colno}`);
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            setError(`Promise Rejection: ${event.reason}`);
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    if (error) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#1a1f26',
                color: 'white',
                padding: '2rem',
                overflow: 'auto',
                zIndex: 9999,
            }}>
                <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error Detected!</h1>
                <pre style={{
                    backgroundColor: '#0f1419',
                    padding: '1rem',
                    borderRadius: '8px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                }}>
                    {error}
                </pre>
                <button
                    onClick={() => setError(null)}
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }}
                >
                    Dismiss
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
