// src/components/ui/cinema-selector.tsx
// Created: Tabbed selector for switching between cinema types at Supermal Karawaci

import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Star, Crown, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CINEMA_OPTIONS, type CinemaId, type CinemaOption } from '@/lib/types/cinema';

interface CinemaSelectorProps {
    selectedCinema: CinemaId;
    onSelect: (cinemaId: CinemaId) => void;
    className?: string;
    disabled?: boolean;
}

// Icon mapping for cinema types
const getCinemaIcon = (type: string) => {
    switch (type) {
        case 'PREMIERE':
            return Crown;
        case 'XXI':
            return Star;
        default:
            return Film;
    }
};

const CinemaSelector = memo(function CinemaSelector({
    selectedCinema,
    onSelect,
    className,
    disabled = false
}: CinemaSelectorProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row gap-3 p-2 rounded-xl',
                'bg-surface-secondary border border-border-primary',
                className
            )}
            role="tablist"
            aria-label="Select cinema type"
        >
            {CINEMA_OPTIONS.map((cinema: CinemaOption) => {
                const Icon = getCinemaIcon(cinema.type);
                const isSelected = selectedCinema === cinema.id;

                return (
                    <button
                        key={cinema.id}
                        onClick={() => !disabled && onSelect(cinema.id)}
                        disabled={disabled}
                        role="tab"
                        aria-selected={isSelected}
                        aria-controls={`cinema-panel-${cinema.id}`}
                        className={cn(
                            'relative flex-1 flex items-center gap-3 px-4 py-3 rounded-lg',
                            'transition-all duration-300 min-h-[56px]',
                            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-secondary',
                            isSelected
                                ? 'bg-accent text-text-inverse shadow-lg'
                                : 'bg-transparent text-text-secondary hover:bg-surface-tertiary hover:text-text-primary',
                            disabled && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        {/* Selection indicator animation */}
                        {isSelected && !shouldReduceMotion && (
                            <motion.div
                                layoutId="cinema-selector-indicator"
                                className="absolute inset-0 bg-accent rounded-lg"
                                initial={false}
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 35
                                }}
                            />
                        )}

                        <span className="relative z-10 flex items-center gap-3">
                            <Icon
                                className={cn(
                                    'w-5 h-5 flex-shrink-0',
                                    isSelected ? 'text-text-inverse' : 'text-accent'
                                )}
                            />

                            <div className="text-left">
                                <div className={cn(
                                    'font-semibold text-sm',
                                    isSelected ? 'text-text-inverse' : 'text-text-primary'
                                )}>
                                    {cinema.type}
                                </div>
                                <div className={cn(
                                    'text-xs hidden sm:block',
                                    isSelected ? 'text-text-inverse/80' : 'text-text-muted'
                                )}>
                                    {cinema.description}
                                </div>
                            </div>
                        </span>
                    </button>
                );
            })}
        </div>
    );
});

export default CinemaSelector;
export { CinemaSelector };