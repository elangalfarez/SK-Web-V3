// src/lib/api/cinema.ts
// Created: API client for fetching XXI Cinema showtime data from Supabase Edge Function

import type { CinemaSchedule, CinemaAPIResponse, CinemaId, Movie, CinemaOption } from '@/lib/types/cinema';
import { CINEMA_OPTIONS, SUPERMAL_CINEMAS } from '@/lib/types/cinema';

// Get Supabase project URL from environment or fallback
const getSupabaseUrl = (): string => {
    // Vite environment variable
    if (import.meta.env.VITE_SUPABASE_URL) {
        return import.meta.env.VITE_SUPABASE_URL;
    }

    // Fallback - replace with your actual Supabase project URL
    console.warn('[Cinema API] VITE_SUPABASE_URL not set, using fallback');
    return 'https://your-project.supabase.co';
};

// Get Supabase anon key from environment
const getSupabaseAnonKey = (): string => {
    if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
        return import.meta.env.VITE_SUPABASE_ANON_KEY;
    }

    console.warn('[Cinema API] VITE_SUPABASE_ANON_KEY not set');
    return '';
};

/**
 * Build the Edge Function URL
 */
const getEdgeFunctionUrl = (cinemaId: CinemaId): string => {
    const baseUrl = getSupabaseUrl();
    return `${baseUrl}/functions/v1/cinema-schedule?cinema_id=${cinemaId}`;
};

/**
 * Fetch cinema schedule from Supabase Edge Function
 * @param cinemaId - The cinema ID to fetch schedule for
 * @returns Promise<CinemaAPIResponse>
 */
export async function fetchCinemaSchedule(cinemaId: CinemaId = SUPERMAL_CINEMAS.XXI): Promise<CinemaAPIResponse> {
    try {
        const url = getEdgeFunctionUrl(cinemaId);
        const anonKey = getSupabaseAnonKey();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Add authorization header if anon key is available
        if (anonKey) {
            headers['Authorization'] = `Bearer ${anonKey}`;
            headers['apikey'] = anonKey;
        }

        console.log('[Cinema API] Fetching:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        const data = await response.json();

        console.log('[Cinema API] Response:', {
            success: data.success,
            source: data.source,
            movieCount: data.data?.movies?.length || 0,
            cached: data.cached
        });

        // Return the response as-is (includes source: 'live' | 'cache' | 'error')
        return data as CinemaAPIResponse;

    } catch (error) {
        console.error('[Cinema API] Network error:', error);

        // Only return error structure on network failure
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Network error - failed to reach API',
            cached: false
        };
    }
}

/**
 * Fetch schedules for all Supermal Karawaci cinemas
 * @returns Promise with all cinema schedules
 */
export async function fetchAllCinemaSchedules(): Promise<{
    success: boolean;
    schedules: CinemaSchedule[];
    errors: string[];
}> {
    const results = await Promise.allSettled(
        Object.values(SUPERMAL_CINEMAS).map(cinemaId => fetchCinemaSchedule(cinemaId))
    );

    const schedules: CinemaSchedule[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
        const cinemaId = Object.values(SUPERMAL_CINEMAS)[index];

        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
            schedules.push(result.value.data);
        } else if (result.status === 'fulfilled' && result.value.error) {
            errors.push(`${cinemaId}: ${result.value.error}`);
        } else if (result.status === 'rejected') {
            errors.push(`${cinemaId}: ${result.reason}`);
        }
    });

    return {
        success: schedules.length > 0,
        schedules,
        errors
    };
}

/**
 * Get unique movies across all cinemas (deduped by title)
 */
export function getUniqueMovies(schedules: CinemaSchedule[]): Movie[] {
    const movieMap = new Map<string, Movie & { cinemas: string[] }>();

    schedules.forEach((schedule: CinemaSchedule) => {
        schedule.movies.forEach((movie: Movie) => {
            const key = movie.title.toLowerCase().trim();

            if (movieMap.has(key)) {
                const existing = movieMap.get(key)!;
                // Merge showtimes and add cinema
                existing.showtimes = [...new Set([...existing.showtimes, ...movie.showtimes])].sort();
                if (!existing.cinemas.includes(schedule.cinemaType)) {
                    existing.cinemas.push(schedule.cinemaType);
                }
            } else {
                movieMap.set(key, {
                    ...movie,
                    cinemas: [schedule.cinemaType]
                });
            }
        });
    });

    return Array.from(movieMap.values());
}

/**
 * Get cinema info by ID
 */
export function getCinemaInfo(cinemaId: CinemaId): CinemaOption | undefined {
    return CINEMA_OPTIONS.find((c: CinemaOption) => c.id === cinemaId);
}

/**
 * Format showtime for display (24h to 12h conversion)
 */
export function formatShowtime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);

    if (hours > 12) {
        return `${hours - 12}:${minutes.toString().padStart(2, '0')} PM`;
    } else if (hours === 12) {
        return `${hours}:${minutes.toString().padStart(2, '0')} PM`;
    } else if (hours === 0) {
        return `12:${minutes.toString().padStart(2, '0')} AM`;
    } else {
        return `${hours}:${minutes.toString().padStart(2, '0')} AM`;
    }
}

/**
 * Check if a showtime is still available (not passed)
 */
export function isShowtimeAvailable(time: string): boolean {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    const showtimeDate = new Date();
    showtimeDate.setHours(hours, minutes, 0, 0);

    // Add 15 minutes buffer (can't buy tickets last minute)
    showtimeDate.setMinutes(showtimeDate.getMinutes() - 15);

    return showtimeDate > now;
}

/**
 * Group showtimes by time of day
 */
export function groupShowtimesByPeriod(showtimes: string[]): {
    morning: string[];
    afternoon: string[];
    evening: string[];
    night: string[];
} {
    return {
        morning: showtimes.filter(t => {
            const hour = parseInt(t.split(':')[0]);
            return hour >= 6 && hour < 12;
        }),
        afternoon: showtimes.filter(t => {
            const hour = parseInt(t.split(':')[0]);
            return hour >= 12 && hour < 17;
        }),
        evening: showtimes.filter(t => {
            const hour = parseInt(t.split(':')[0]);
            return hour >= 17 && hour < 21;
        }),
        night: showtimes.filter(t => {
            const hour = parseInt(t.split(':')[0]);
            return hour >= 21 || hour < 6;
        })
    };
}

// Fallback sample data for development/demo
export const FALLBACK_MOVIES: Movie[] = [
    {
        id: '24MFNE',
        title: 'MUFASA: THE LION KING',
        poster: 'https://web3.21cineplex.com/movie-images/24MFNE.jpg',
        rating: 'SU',
        type: '2D',
        duration: '118 Minutes',
        showtimes: ['12:00', '14:15', '16:30', '18:45', '21:00']
    },
    {
        id: '24SCOR',
        title: 'SONIC THE HEDGEHOG 3',
        poster: 'https://web3.21cineplex.com/movie-images/24SCOR.jpg',
        rating: 'SU',
        type: '2D',
        duration: '110 Minutes',
        showtimes: ['12:15', '14:20', '16:25', '18:30', '20:35']
    },
    {
        id: '24KRAM',
        title: 'KRAVEN THE HUNTER',
        poster: 'https://web3.21cineplex.com/movie-images/24KRAM.jpg',
        rating: 'D17+',
        type: '2D',
        duration: '127 Minutes',
        showtimes: ['12:30', '15:15', '18:00', '20:45']
    },
    {
        id: '24NOSR',
        title: 'NOSFERATU',
        poster: 'https://web3.21cineplex.com/movie-images/24NOSR.jpg',
        rating: 'D17+',
        type: '2D',
        duration: '132 Minutes',
        showtimes: ['13:00', '15:45', '18:30', '21:15']
    },
    {
        id: '24MON2',
        title: 'MOANA 2',
        poster: 'https://web3.21cineplex.com/movie-images/24MON2.jpg',
        rating: 'SU',
        type: '2D',
        duration: '100 Minutes',
        showtimes: ['12:50', '14:45', '16:40', '18:35', '20:30']
    },
    {
        id: '24WKED',
        title: 'WICKED',
        poster: 'https://web3.21cineplex.com/movie-images/24WKED.jpg',
        rating: 'SU',
        type: '2D',
        duration: '160 Minutes',
        showtimes: ['12:00', '15:00', '18:00', '21:00']
    }
];

export const FALLBACK_SCHEDULE: CinemaSchedule = {
    cinemaId: 'TGRKARA',
    cinemaName: 'Supermal Karawaci XXI',
    cinemaType: 'XXI',
    address: 'Supermal Karawaci, Jl. Bulevar Diponegoro, Tangerang',
    phone: '(021) 5421 2354',
    pricing: {
        weekday: 'Rp 35.000',
        preHoliday: 'Rp 40.000',
        weekend: 'Rp 50.000'
    },
    movies: FALLBACK_MOVIES,
    lastUpdated: new Date().toISOString()
};