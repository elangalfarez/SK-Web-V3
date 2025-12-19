// supabase/functions/cinema-schedule/index.ts
// Fixed: Correct HTML parsing for m.21cineplex.com structure

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

// Types
interface MovieData {
    id: string;
    title: string;
    poster: string;
    rating: string;
    type: string;
    duration: string;
    showtimes: string[];
}

interface CinemaScheduleData {
    cinemaId: string;
    cinemaName: string;
    cinemaType: string;
    address: string;
    phone: string;
    pricing: {
        weekday: string;
        preHoliday: string;
        weekend: string;
    };
    movies: MovieData[];
    lastUpdated: string;
}

interface ApiResponse {
    success: boolean;
    data: CinemaScheduleData | null;
    error?: string;
    cached: boolean;
    source?: string;
}

// In-memory cache
const cache = new Map<string, { data: CinemaScheduleData; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cinema metadata
const CINEMA_INFO: Record<string, { name: string; type: string }> = {
    TGRKARA: { name: "Supermal Karawaci XXI", type: "XXI" },
    TGRPRKA: { name: "Supermal Karawaci Premiere", type: "PREMIERE" },
    TGRLIKA: { name: "Supermal Karawaci 21", type: "21" },
};

// Pricing by cinema type
const PRICING: Record<string, { weekday: string; preHoliday: string; weekend: string }> = {
    XXI: { weekday: "Rp 35.000", preHoliday: "Rp 40.000", weekend: "Rp 50.000" },
    PREMIERE: { weekday: "Rp 75.000", preHoliday: "Rp 100.000", weekend: "Rp 150.000" },
    "21": { weekday: "Rp 30.000", preHoliday: "Rp 35.000", weekend: "Rp 40.000" },
};

// Fetch cinema page
async function fetchCinemaPage(cinemaId: string): Promise<string | null> {
    const url = `https://m.21cineplex.com/gui.schedule.php?sid=&find_by=1&cinema_id=${cinemaId}&movie_id=`;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
                "Cache-Control": "no-cache",
            },
        });

        if (response.ok) {
            return await response.text();
        }

        console.error(`Fetch failed with status: ${response.status}`);
        return null;
    } catch (error) {
        console.error(`Fetch error for ${cinemaId}:`, error);
        return null;
    }
}

// Parse HTML to extract movie schedule
function parseSchedule(html: string, cinemaId: string): CinemaScheduleData {
    const $ = cheerio.load(html);
    const info = CINEMA_INFO[cinemaId] || CINEMA_INFO.TGRKARA;
    const pricing = PRICING[info.type] || PRICING.XXI;

    const movies: MovieData[] = [];

    // Each movie is in a li.list-group-item
    $("li.list-group-item").each((_, el) => {
        const $movie = $(el);

        // Extract movie ID from link: gui.movie_details.php?sid=&movie_id=25AFAA
        const detailLink = $movie.find('a[href*="movie_id="]').attr("href") || "";
        const movieIdMatch = detailLink.match(/movie_id=([A-Z0-9]+)/i);
        const movieId = movieIdMatch ? movieIdMatch[1] : "";

        if (!movieId) return; // Skip if no movie ID

        // Extract poster URL
        const posterImg = $movie.find("img.img-responsive").attr("src") || "";
        const poster = posterImg || `https://nos.jkt-1.neo.id/media.cinema21.co.id/movie-images/${movieId}.jpg`;

        // Extract title - it's in an <a> tag after the image, with just text
        // The structure is: <a href="..."><img/></a> <a>TITLE</a>
        let title = "";
        $movie.find("a").each((_, aEl) => {
            const $a = $(aEl);
            const href = $a.attr("href") || "";
            // Skip if it's the image link or has onclick
            if (!href.includes("movie_id=") && !$a.attr("onclick")) {
                const text = $a.text().trim();
                if (text && text.length > 2 && !text.includes("Rp")) {
                    title = text;
                    return false; // break
                }
            }
        });

        // Fallback: get title from the second <a> tag
        if (!title) {
            const allLinks = $movie.find("a");
            if (allLinks.length >= 2) {
                title = $(allLinks[1]).text().trim();
            }
        }

        if (!title) return; // Skip if no title

        // Extract type and rating from span.btn-outline elements
        const badges = $movie.find("span.btn-outline, span.btn-default.btn-outline");
        let type = "2D";
        let rating = "SU";

        if (badges.length >= 1) {
            type = $(badges[0]).text().trim() || "2D";
        }
        if (badges.length >= 2) {
            rating = $(badges[1]).text().trim() || "SU";
        }

        // Extract duration: text after glyphicon-time
        let duration = "";
        const durationText = $movie.text();
        const durationMatch = durationText.match(/(\d+)\s*Minutes/i);
        if (durationMatch) {
            duration = `${durationMatch[1]} Minutes`;
        }

        // Extract showtimes from div_schedule buttons
        const showtimes: string[] = [];
        $movie.find("a.div_schedule, .div_schedule").each((_, timeEl) => {
            const timeText = $(timeEl).text().trim();
            // Match time format HH:MM
            if (/^\d{1,2}:\d{2}$/.test(timeText)) {
                if (!showtimes.includes(timeText)) {
                    showtimes.push(timeText);
                }
            }
        });

        // Only add movie if it has showtimes
        if (showtimes.length > 0) {
            movies.push({
                id: movieId,
                title,
                poster,
                rating,
                type,
                duration,
                showtimes: showtimes.sort(),
            });
        }
    });

    // Extract phone from page
    const pageText = $("body").text();
    const phoneMatch = pageText.match(/TELEPON:\s*\(?\d{3}\)?[\s.-]?\d{3,4}[\s.-]?\d{4}/i);
    const phone = phoneMatch ? phoneMatch[0].replace("TELEPON:", "").trim() : "(021) 5421 2354";

    return {
        cinemaId,
        cinemaName: info.name,
        cinemaType: info.type,
        address: "Supermal Karawaci, Jl. Bulevar Diponegoro, Tangerang",
        phone,
        pricing,
        movies,
        lastUpdated: new Date().toISOString(),
    };
}

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300, s-maxage=300",
};

// Main handler
serve(async (req: Request): Promise<Response> => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Only allow GET
    if (req.method !== "GET") {
        return new Response(
            JSON.stringify({ success: false, error: "Method not allowed" }),
            { status: 405, headers: corsHeaders }
        );
    }

    try {
        // Parse query params
        const url = new URL(req.url);
        const cinemaId = url.searchParams.get("cinema_id") || "TGRKARA";

        // Validate cinema ID
        if (!CINEMA_INFO[cinemaId]) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: `Invalid cinema_id. Valid: ${Object.keys(CINEMA_INFO).join(", ")}`,
                }),
                { status: 400, headers: corsHeaders }
            );
        }

        // Check cache
        const cacheKey = `schedule_${cinemaId}`;
        const cached = cache.get(cacheKey);

        if (cached && cached.expiry > Date.now()) {
            const response: ApiResponse = {
                success: true,
                data: cached.data,
                cached: true,
                source: "cache",
            };
            return new Response(JSON.stringify(response), { status: 200, headers: corsHeaders });
        }

        // Fetch live data
        const html = await fetchCinemaPage(cinemaId);

        if (!html) {
            return new Response(
                JSON.stringify({
                    success: false,
                    data: null,
                    error: "Failed to fetch cinema schedule from 21cineplex",
                    cached: false,
                    source: "error",
                }),
                { status: 502, headers: corsHeaders }
            );
        }

        // Parse schedule
        const scheduleData = parseSchedule(html, cinemaId);

        if (scheduleData.movies.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    data: scheduleData,
                    error: "No movies found - parsing may have failed",
                    cached: false,
                    source: "parse-error",
                }),
                { status: 200, headers: corsHeaders }
            );
        }

        // Update cache
        cache.set(cacheKey, {
            data: scheduleData,
            expiry: Date.now() + CACHE_TTL,
        });

        const response: ApiResponse = {
            success: true,
            data: scheduleData,
            cached: false,
            source: "live",
        };

        return new Response(JSON.stringify(response), { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error("Cinema schedule error:", error);

        return new Response(
            JSON.stringify({
                success: false,
                data: null,
                error: error instanceof Error ? error.message : "Unknown error",
                cached: false,
                source: "error",
            }),
            { status: 500, headers: corsHeaders }
        );
    }
});