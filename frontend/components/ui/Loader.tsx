'use client';

import styles from './Loader.module.css';

interface LoaderProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
    fullScreen?: boolean;
}

export default function Loader({ size = 'medium', text, fullScreen = false }: LoaderProps) {
    const sizeClass = {
        small: styles.small,
        medium: styles.medium,
        large: styles.large,
    }[size];

    const content = (
        <div className={styles.loaderContent}>
            <div className={`${styles.spinner} ${sizeClass}`}>
                <div className={styles.spinnerRing}></div>
                <div className={styles.spinnerRing}></div>
                <div className={styles.spinnerRing}></div>
                <div className={styles.logo}>S</div>
            </div>
            {text && <p className={styles.loadingText}>{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className={styles.fullScreenLoader}>
                {content}
            </div>
        );
    }

    return content;
}
