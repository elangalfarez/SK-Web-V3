// src/components/MoviesPage.tsx
// Created: Movies showtime page for XXI Supermal Karawaci with real-time data fetching

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
    Film,
    MapPin,
    Phone,
    RefreshCw,
    AlertCircle,
    Search,
    X,
    Calendar,
    Ticket,
    ExternalLink
} from 'lucide-react';
import { Hero } from '@/components/ui/Hero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MovieCard from '@/components/ui/movie-card';
import CinemaSelector from '@/components/ui/cinema-selector';
import {
    fetchCinemaSchedule,
    FALLBACK_SCHEDULE
} from '@/lib/api/cinema';
import { SUPERMAL_CINEMAS, CINEMA_OPTIONS, type CinemaSchedule, type CinemaId, type Movie } from '@/lib/types/cinema';
import { cn } from '@/lib/utils';

// Constants
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes auto-refresh
const M_TIX_URL = 'https://m.21cineplex.com/';

interface MoviesPageState {
    schedule: CinemaSchedule | null;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
    usingFallback: boolean;
}

const MoviesPage: React.FC = () => {
    const shouldReduceMotion = useReducedMotion();

    // State
    const [selectedCinema, setSelectedCinema] = useState<CinemaId>(SUPERMAL_CINEMAS.XXI);
    const [state, setState] = useState<MoviesPageState>({
        schedule: null,
        loading: true,
        error: null,
        lastUpdated: null,
        usingFallback: false
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Set page title
    useEffect(() => {
        document.title = 'Movies Showtime at XXI — Supermal Karawaci';
    }, []);

    // Fetch schedule data
    const fetchSchedule = useCallback(async (cinemaId: CinemaId, isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setIsRefreshing(true);
            } else {
                setState(prev => ({ ...prev, loading: true, error: null }));
            }

            const response = await fetchCinemaSchedule(cinemaId);

            // Check if we got real live/cached data
            const isLiveData = response.success &&
                response.data &&
                response.data.movies.length > 0 &&
                (response.source === 'live' || response.source === 'cache');

            if (isLiveData && response.data) {
                setState({
                    schedule: response.data,
                    loading: false,
                    error: null,
                    lastUpdated: response.data.lastUpdated,
                    usingFallback: false
                });
            } else if (response.data && response.data.movies.length > 0) {
                // Data exists but from fallback/error source
                setState({
                    schedule: response.data,
                    loading: false,
                    error: response.error || 'Using cached data',
                    lastUpdated: response.data.lastUpdated,
                    usingFallback: response.source === 'fallback' || response.source === 'error-fallback'
                });
            } else {
                throw new Error(response.error || 'No movies found');
            }
        } catch (err) {
            console.warn('Failed to fetch cinema schedule, using fallback:', err);

            // Use local fallback data
            const cinemaOption = CINEMA_OPTIONS.find((opt) => opt.id === cinemaId);
            const fallback: CinemaSchedule = {
                ...FALLBACK_SCHEDULE,
                cinemaId,
                cinemaName: cinemaOption?.name || FALLBACK_SCHEDULE.cinemaName,
                cinemaType: cinemaOption?.type || 'XXI',
                lastUpdated: new Date().toISOString()
            };

            setState({
                schedule: fallback,
                loading: false,
                error: 'Showing sample data. Live schedule temporarily unavailable.',
                lastUpdated: fallback.lastUpdated,
                usingFallback: true
            });
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // Initial load and cinema change
    useEffect(() => {
        fetchSchedule(selectedCinema);
    }, [selectedCinema, fetchSchedule]);

    // Auto-refresh interval
    useEffect(() => {
        const interval = setInterval(() => {
            fetchSchedule(selectedCinema, true);
        }, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [selectedCinema, fetchSchedule]);

    // Filter movies by search query
    const filteredMovies = useMemo(() => {
        if (!state.schedule?.movies) return [];

        if (!searchQuery.trim()) {
            return state.schedule.movies;
        }

        const query = searchQuery.toLowerCase().trim();
        return state.schedule.movies.filter((movie: Movie) =>
            movie.title.toLowerCase().includes(query)
        );
    }, [state.schedule?.movies, searchQuery]);

    // Handle cinema selection
    const handleCinemaSelect = (cinemaId: CinemaId) => {
        setSelectedCinema(cinemaId);
        setSearchQuery(''); // Clear search on cinema change
    };

    // Handle manual refresh
    const handleRefresh = () => {
        fetchSchedule(selectedCinema, true);
    };

    // Handle showtime click (open M-TIX)
    const handleShowtimeClick = (_movie: Movie, _time: string) => {
        // Open M-TIX booking page
        window.open(M_TIX_URL, '_blank', 'noopener,noreferrer');
    };

    // Format last updated time
    const formatLastUpdated = (dateString: string | null) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch {
            return '';
        }
    };

    // Get current date formatted
    const currentDate = useMemo(() => {
        return new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: shouldReduceMotion ? 1 : 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-surface">
            {/* Hero Section */}
            <Hero
                title="Movies Showtime"
                subtitle="Discover what's playing at XXI Supermal Karawaci. Book your tickets now for the latest blockbusters and exciting new releases."
                variant="compact"
                center={true}
                visual={
                    <Film className="w-24 h-24 text-accent/10" aria-hidden="true" />
                }
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Cinema Info Header */}
                {state.schedule && (
                    <motion.section
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="bg-surface-secondary rounded-2xl border border-border-primary p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Cinema Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-accent text-text-inverse">
                                            {state.schedule.cinemaType}
                                        </Badge>
                                        <h2 className="text-xl font-bold text-text-primary">
                                            {state.schedule.cinemaName}
                                        </h2>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-accent" />
                                            {state.schedule.address}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="w-4 h-4 text-accent" />
                                            {state.schedule.phone}
                                        </span>
                                    </div>
                                </div>

                                {/* Pricing Info */}
                                <div className="flex flex-wrap gap-3">
                                    <div className="px-4 py-2 rounded-lg bg-surface-tertiary border border-border-secondary">
                                        <p className="text-xs text-text-muted">Weekday</p>
                                        <p className="font-semibold text-text-primary">{state.schedule.pricing.weekday}</p>
                                    </div>
                                    <div className="px-4 py-2 rounded-lg bg-surface-tertiary border border-border-secondary">
                                        <p className="text-xs text-text-muted">Pre-Holiday</p>
                                        <p className="font-semibold text-text-primary">{state.schedule.pricing.preHoliday}</p>
                                    </div>
                                    <div className="px-4 py-2 rounded-lg bg-surface-tertiary border border-border-secondary">
                                        <p className="text-xs text-text-muted">Weekend</p>
                                        <p className="font-semibold text-text-primary">{state.schedule.pricing.weekend}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Cinema Selector */}
                <section className="mb-8">
                    <CinemaSelector
                        selectedCinema={selectedCinema}
                        onSelect={handleCinemaSelect}
                        disabled={state.loading}
                    />
                </section>

                {/* Controls Bar */}
                <section className="mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            <input
                                type="search"
                                placeholder="Search movies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(
                                    'w-full pl-10 pr-10 py-3 rounded-xl',
                                    'bg-surface-secondary border border-border-primary',
                                    'text-text-primary placeholder:text-text-muted',
                                    'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
                                    'transition-all duration-200'
                                )}
                                aria-label="Search movies"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-tertiary transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4 text-text-muted" />
                                </button>
                            )}
                        </div>

                        {/* Date & Refresh */}
                        <div className="flex items-center gap-4">
                            {/* Current Date */}
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <Calendar className="w-4 h-4 text-accent" />
                                <span>{currentDate}</span>
                            </div>

                            {/* Last Updated & Refresh */}
                            <div className="flex items-center gap-2">
                                {state.lastUpdated && (
                                    <span className="text-xs text-text-muted">
                                        Updated {formatLastUpdated(state.lastUpdated)}
                                    </span>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRefresh}
                                    disabled={state.loading || isRefreshing}
                                    className="p-2"
                                    aria-label="Refresh schedule"
                                >
                                    <RefreshCw
                                        className={cn(
                                            'w-4 h-4',
                                            (state.loading || isRefreshing) && 'animate-spin'
                                        )}
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Error/Warning Banner */}
                <AnimatePresence>
                    {state.error && (
                        <motion.div
                            initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={cn(
                                'mb-8 p-4 rounded-xl flex items-start gap-3',
                                state.usingFallback
                                    ? 'bg-warning/10 border border-warning/30'
                                    : 'bg-error/10 border border-error/30'
                            )}
                            role="alert"
                        >
                            <AlertCircle className={cn(
                                'w-5 h-5 flex-shrink-0 mt-0.5',
                                state.usingFallback ? 'text-warning' : 'text-error'
                            )} />
                            <div>
                                <p className={cn(
                                    'font-medium',
                                    state.usingFallback ? 'text-warning' : 'text-error'
                                )}>
                                    {state.usingFallback ? 'Demo Mode' : 'Error'}
                                </p>
                                <p className="text-sm text-text-secondary mt-1">{state.error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading State */}
                {state.loading && (
                    <div className="py-16">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
                            <p className="text-text-secondary">Loading showtimes...</p>
                        </div>
                    </div>
                )}

                {/* Movies Grid */}
                {!state.loading && filteredMovies.length > 0 && (
                    <motion.section
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Results Count */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-text-secondary">
                                <span className="font-semibold text-text-primary">{filteredMovies.length}</span>
                                {' '}movie{filteredMovies.length !== 1 ? 's' : ''} showing
                                {searchQuery && (
                                    <span className="text-text-muted"> for "{searchQuery}"</span>
                                )}
                            </p>

                            {/* Book via M-TIX link */}
                            <a
                                href={M_TIX_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg',
                                    'bg-accent text-text-inverse font-medium text-sm',
                                    'hover:bg-accent-hover transition-colors',
                                    'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                                )}
                            >
                                <Ticket className="w-4 h-4" />
                                Book via M-TIX
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>

                        {/* Movie Cards Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                            {filteredMovies.map((movie: Movie, index: number) => (
                                <motion.div
                                    key={movie.id}
                                    initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: shouldReduceMotion ? 0 : index * 0.05 }}
                                >
                                    <MovieCard
                                        movie={movie}
                                        variant="default"
                                        onShowtimeClick={handleShowtimeClick}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Empty State */}
                {!state.loading && filteredMovies.length === 0 && (
                    <motion.div
                        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-16 text-center"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-secondary border border-border-primary flex items-center justify-center">
                            <Film className="w-10 h-10 text-text-muted" />
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">
                            No Movies Found
                        </h3>
                        <p className="text-text-secondary mb-6 max-w-md mx-auto">
                            {searchQuery
                                ? `No movies match "${searchQuery}". Try a different search term.`
                                : 'No movies are currently showing. Please check back later.'}
                        </p>
                        {searchQuery && (
                            <Button variant="outline" onClick={() => setSearchQuery('')}>
                                Clear Search
                            </Button>
                        )}
                    </motion.div>
                )}

                {/* Additional Info Section */}
                <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* About XXI */}
                    <div className="bg-surface-secondary rounded-xl border border-border-primary p-6">
                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <Film className="w-5 h-5 text-accent" />
                            About Cinema XXI
                        </h3>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            Cinema XXI at Supermal Karawaci offers a premium movie experience with state-of-the-art
                            Dolby Digital sound systems and comfortable seating. Enjoy the latest blockbusters,
                            Hollywood releases, and Indonesian films in our modern theaters.
                        </p>
                    </div>

                    {/* Booking Info */}
                    <div className="bg-surface-secondary rounded-xl border border-border-primary p-6">
                        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-accent" />
                            How to Book
                        </h3>
                        <ul className="text-text-secondary text-sm space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-accent text-text-inverse text-xs flex items-center justify-center flex-shrink-0">1</span>
                                Choose your movie and preferred showtime
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-accent text-text-inverse text-xs flex items-center justify-center flex-shrink-0">2</span>
                                Click "Book via M-TIX" or visit the cinema counter
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-accent text-text-inverse text-xs flex items-center justify-center flex-shrink-0">3</span>
                                Select your seats and complete payment
                            </li>
                        </ul>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MoviesPage;