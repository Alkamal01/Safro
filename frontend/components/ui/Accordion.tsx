'use client';

import { useState } from 'react';

interface FAQ {
    question: string;
    answer: string;
}

interface AccordionProps {
    items: FAQ[];
}

export default function Accordion({ items }: AccordionProps) {
    return (
        <div className="accordion wow animate__animated custom-fadeInUp" id="accordion-parent">
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    id={index + 1}
                    question={item.question}
                    answer={item.answer}
                    defaultOpen={index === 0}
                />
            ))}
        </div>
    );
}

function AccordionItem({
    id,
    question,
    answer,
    defaultOpen = false
}: {
    id: number;
    question: string;
    answer: string;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(prev => !prev);
    };

    return (
        <div className={`accordion-item ${isOpen ? 'shown' : ''}`}>
            <h2 className="accordion-header" id={`accordion-heading-${id}`}>
                <button
                    className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
                    type="button"
                    onClick={handleToggle}
                    aria-expanded={isOpen}
                    aria-controls={`react-accordion-content-${id}`}
                >
                    <span className="title">{question}</span>
                    <div className="icon"></div>
                </button>
            </h2>
            <div
                id={`react-accordion-content-${id}`}
                className={`react-accordion-content ${isOpen ? 'show' : 'hide'}`}
                aria-labelledby={`accordion-heading-${id}`}
                style={{
                    maxHeight: isOpen ? '500px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-out'
                }}
            >
                <div className="accordion-body">
                    <p>{answer}</p>
                </div>
            </div>
        </div>
    );
}
