'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Override console methods
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            setLogs(prev => [...prev, `[LOG] ${args.join(' ')}`]);
            originalLog(...args);
        };

        console.error = (...args) => {
            setLogs(prev => [...prev, `[ERROR] ${args.join(' ')}`]);
            originalError(...args);
        };

        console.warn = (...args) => {
            setLogs(prev => [...prev, `[WARN] ${args.join(' ')}`]);
            originalWarn(...args);
        };

        // Capture errors
        const handleError = (event: ErrorEvent) => {
            setLogs(prev => [...prev, `[ERROR] ${event.message} at ${event.filename}:${event.lineno}`]);
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            setLogs(prev => [...prev, `[PROMISE REJECTION] ${event.reason}`]);
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    return (
        <div style={{ padding: '1rem', backgroundColor: '#0f1419', minHeight: '100vh', color: 'white' }}>
            <h1 style={{ marginBottom: '1rem' }}>Debug Console</h1>
            <button
                onClick={() => setLogs([])}
                style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                }}
            >
                Clear Logs
            </button>
            <div style={{
                backgroundColor: '#1a1f26',
                padding: '1rem',
                borderRadius: '8px',
                maxHeight: '80vh',
                overflow: 'auto',
            }}>
                {logs.length === 0 ? (
                    <p style={{ color: '#8b92a7' }}>No logs yet...</p>
                ) : (
                    logs.map((log, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '0.5rem',
                                borderBottom: '1px solid #2d3748',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                color: log.includes('[ERROR]') ? '#ef4444' : log.includes('[WARN]') ? '#f59e0b' : '#10b981',
                            }}
                        >
                            {log}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
