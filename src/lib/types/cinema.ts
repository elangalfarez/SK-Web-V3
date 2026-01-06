// src/lib/types/cinema.ts
// Created: Type definitions for XXI Cinema movie showtime data

export interface MovieShowtime {
    time: string;
    isAvailable: boolean;
}

export interface Movie {
    id: string;
    title: string;
    poster: string;
    rating: string;
    type: string; // 2D, IMAX, etc.
    duration: string;
    genre?: string[];
    showtimes: string[];
}

export interface CinemaSchedule {
    cinemaId: string;
    cinemaName: string;
    cinemaType: 'XXI' | 'PREMIERE';
    address: string;
    phone: string;
    pricing: {
        weekday: string;
        preHoliday: string;
        weekend: string;
    };
    movies: Movie[];
    lastUpdated: string;
}

export interface CinemaAPIResponse {
    success: boolean;
    data: CinemaSchedule | null;
    error?: string;
    cached: boolean;
    cacheExpiry?: string;
    source?: 'live' | 'cache' | 'fallback' | 'error' | 'error-fallback' | 'parse-error';
}

// Cinema IDs for Supermal Karawaci
export const SUPERMAL_CINEMAS = {
    XXI: 'TGRKARA',      // Supermal Karawaci XXI
    PREMIERE: 'TGRPRKA', // Supermal Karawaci Premiere
} as const;

export type CinemaId = typeof SUPERMAL_CINEMAS[keyof typeof SUPERMAL_CINEMAS];

export interface CinemaOption {
    id: CinemaId;
    name: string;
    type: 'XXI' | 'PREMIERE';
    description: string;
}

export const CINEMA_OPTIONS: CinemaOption[] = [
    {
        id: 'TGRKARA',
        name: 'Supermal Karawaci XXI',
        type: 'XXI',
        description: 'Premium cinema experience with Dolby sound'
    },
    {
        id: 'TGRPRKA',
        name: 'Supermal Karawaci Premiere',
        type: 'PREMIERE',
        description: 'Luxury seating with exclusive amenities'
    }
];