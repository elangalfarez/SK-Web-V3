// src/components/ui/movie-card.tsx
// Created: Reusable movie card component for cinema showtime display

import { useState, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock, Film, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { isShowtimeAvailable } from '@/lib/api/cinema';
import type { Movie } from '@/lib/types/cinema';

interface MovieCardProps {
    movie: Movie;
    variant?: 'default' | 'compact' | 'featured';
    onShowtimeClick?: (movie: Movie, time: string) => void;
    className?: string;
}

// Rating badge color mapping
const getRatingColor = (rating: string): string => {
    switch (rating.toUpperCase()) {
        case 'SU':
            return 'bg-green-600 text-white';
        case 'R13':
        case '13+':
            return 'bg-blue-600 text-white';
        case 'D17+':
        case '17+':
            return 'bg-orange-600 text-white';
        case 'D21+':
        case '21+':
            return 'bg-red-600 text-white';
        default:
            return 'bg-accent text-text-inverse';
    }
};

// Format duration for display
const formatDuration = (duration: string): string => {
    if (!duration) return '';

    // Extract minutes if in "X Minutes" format
    const match = duration.match(/(\d+)/);
    if (match) {
        const mins = parseInt(match[1]);
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;

        if (hours > 0) {
            return `${hours}h ${remainingMins}m`;
        }
        return `${mins}m`;
    }

    return duration;
};

const MovieCard = memo(function MovieCard({
    movie,
    variant = 'default',
    onShowtimeClick,
    className
}: MovieCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    const handleShowtimeClick = (time: string) => {
        if (onShowtimeClick && isShowtimeAvailable(time)) {
            onShowtimeClick(movie, time);
        }
    };

    // Fallback poster image
    const posterSrc = imageError
        ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop'
        : movie.poster;

    // Animation variants
    const cardVariants = {
        hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: shouldReduceMotion ? 0 : 0.4, ease: 'easeOut' as const }
        }
    };

    if (variant === 'compact') {
        return (
            <motion.article
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className={cn(
                    'flex gap-4 p-4 rounded-xl',
                    'bg-surface-secondary border border-border-primary',
                    'hover:border-accent hover:shadow-lg',
                    'transition-all duration-300',
                    className
                )}
            >
                {/* Compact Poster */}
                <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-surface-tertiary">
                    {!imageLoaded && (
                        <div className="absolute inset-0 animate-pulse bg-surface-tertiary" />
                    )}
                    <img
                        src={posterSrc}
                        alt={`${movie.title} poster`}
                        className={cn(
                            'w-full h-full object-cover',
                            'transition-opacity duration-300',
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />
                    <Badge
                        className={cn(
                            'absolute top-1 right-1 text-[10px] px-1.5 py-0.5',
                            getRatingColor(movie.rating)
                        )}
                    >
                        {movie.rating}
                    </Badge>
                </div>

                {/* Compact Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm line-clamp-2 mb-1">
                        {movie.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                        {movie.duration && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(movie.duration)}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Film className="w-3 h-3" />
                            {movie.type}
                        </span>
                    </div>

                    {/* Compact Showtimes */}
                    <div className="flex flex-wrap gap-1.5">
                        {movie.showtimes.slice(0, 4).map((time: string) => {
                            const available = isShowtimeAvailable(time);
                            return (
                                <button
                                    key={time}
                                    onClick={() => handleShowtimeClick(time)}
                                    disabled={!available}
                                    className={cn(
                                        'px-2 py-1 rounded text-xs font-medium',
                                        'transition-all duration-200',
                                        available
                                            ? 'bg-accent text-text-inverse hover:bg-accent-hover'
                                            : 'bg-surface-tertiary text-text-muted cursor-not-allowed line-through'
                                    )}
                                >
                                    {time}
                                </button>
                            );
                        })}
                        {movie.showtimes.length > 4 && (
                            <span className="px-2 py-1 text-xs text-text-muted">
                                +{movie.showtimes.length - 4} more
                            </span>
                        )}
                    </div>
                </div>
            </motion.article>
        );
    }

    if (variant === 'featured') {
        return (
            <motion.article
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className={cn(
                    'relative overflow-hidden rounded-2xl',
                    'bg-surface-secondary border border-border-primary',
                    'group cursor-pointer',
                    className
                )}
            >
                {/* Featured Poster with gradient overlay */}
                <div className="relative aspect-[2/3] overflow-hidden">
                    {!imageLoaded && (
                        <div className="absolute inset-0 animate-pulse bg-surface-tertiary" />
                    )}
                    <img
                        src={posterSrc}
                        alt={`${movie.title} poster`}
                        className={cn(
                            'w-full h-full object-cover',
                            'transition-all duration-500',
                            'group-hover:scale-105',
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        )}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Rating badge */}
                    <Badge
                        className={cn(
                            'absolute top-3 right-3 text-xs',
                            getRatingColor(movie.rating)
                        )}
                    >
                        {movie.rating}
                    </Badge>

                    {/* Movie type badge */}
                    <Badge
                        className="absolute top-3 left-3 text-xs bg-surface/80 backdrop-blur-sm text-text-primary border border-border-primary"
                    >
                        {movie.type}
                    </Badge>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 drop-shadow-lg">
                            {movie.title}
                        </h3>

                        {movie.duration && (
                            <div className="flex items-center gap-1 text-sm text-gray-300 mb-3">
                                <Clock className="w-4 h-4" />
                                {formatDuration(movie.duration)}
                            </div>
                        )}

                        {/* Featured Showtimes */}
                        <div className="flex flex-wrap gap-2">
                            {movie.showtimes.slice(0, 5).map((time: string) => {
                                const available = isShowtimeAvailable(time);
                                return (
                                    <button
                                        key={time}
                                        onClick={() => handleShowtimeClick(time)}
                                        disabled={!available}
                                        className={cn(
                                            'px-3 py-1.5 rounded-lg text-sm font-semibold',
                                            'transition-all duration-200',
                                            available
                                                ? 'bg-accent text-text-inverse hover:bg-accent-hover hover:scale-105'
                                                : 'bg-white/20 text-gray-400 cursor-not-allowed line-through'
                                        )}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.article>
        );
    }

    // Default variant
    return (
        <motion.article
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={cn(
                'overflow-hidden rounded-xl',
                'bg-surface-secondary border border-border-primary',
                'hover:border-accent hover:shadow-xl',
                'transition-all duration-300',
                'group',
                className
            )}
        >
            {/* Poster */}
            <div className="relative aspect-[2/3] overflow-hidden bg-surface-tertiary">
                {!imageLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-surface-tertiary" />
                )}
                <img
                    src={posterSrc}
                    alt={`${movie.title} poster`}
                    className={cn(
                        'w-full h-full object-cover',
                        'transition-all duration-500',
                        'group-hover:scale-105',
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />

                {/* Rating badge */}
                <Badge
                    className={cn(
                        'absolute top-3 right-3',
                        getRatingColor(movie.rating)
                    )}
                >
                    {movie.rating}
                </Badge>

                {/* Type badge */}
                <Badge
                    className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm text-text-primary border border-border-primary"
                >
                    {movie.type}
                </Badge>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <h3 className="font-bold text-text-primary text-base line-clamp-2 min-h-[3rem]">
                    {movie.title}
                </h3>

                {/* Meta info */}
                <div className="flex items-center gap-3 text-sm text-text-muted">
                    {movie.duration && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(movie.duration)}
                        </span>
                    )}
                </div>

                {/* Showtimes */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Today's Showtimes</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {movie.showtimes.map((time: string) => {
                            const available = isShowtimeAvailable(time);
                            return (
                                <button
                                    key={time}
                                    onClick={() => handleShowtimeClick(time)}
                                    disabled={!available}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-sm font-medium',
                                        'transition-all duration-200 min-w-[60px]',
                                        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-secondary',
                                        available
                                            ? 'bg-accent text-text-inverse hover:bg-accent-hover hover:shadow-md active:scale-95'
                                            : 'bg-surface-tertiary text-text-muted cursor-not-allowed opacity-50 line-through'
                                    )}
                                    aria-label={`${available ? 'Book' : 'Unavailable'} ${time} showing of ${movie.title}`}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>

                    {movie.showtimes.length === 0 && (
                        <p className="text-sm text-text-muted italic">No showtimes available</p>
                    )}
                </div>
            </div>
        </motion.article>
    );
});

export default MovieCard;
export { MovieCard };