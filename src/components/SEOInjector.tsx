// src/components/SEOInjector.tsx
// Created: Client-side SEO injection component using React Helmet Async

import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchActiveSettingsByInjectionPoint, type SiteSetting } from '../lib/supabase/seo-settings';
import DOMPurify from 'dompurify';

interface SEOInjectorProps {
    pageMeta?: {
        title?: string;
        description?: string;
        ogImage?: string;
        canonical?: string;
        keywords?: string[];
    };
}

/**
 * SEOInjector Component
 *
 * Fetches active site settings from Supabase and injects them into the document.
 * Supports:
 * - Meta tags in <head>
 * - Scripts (analytics, pixels, GTM)
 * - JSON-LD structured data
 * - Custom HTML in head or body
 *
 * IMPORTANT: Scripts are NOT sanitized to allow analytics code to run.
 * Only trusted admin users can add scripts through the admin panel.
 */
export default function SEOInjector({ pageMeta }: SEOInjectorProps) {
    const [headStartSettings, setHeadStartSettings] = useState<SiteSetting[]>([]);
    const [headEndSettings, setHeadEndSettings] = useState<SiteSetting[]>([]);
    const [bodyStartSettings, setBodyStartSettings] = useState<SiteSetting[]>([]);
    const [bodyEndSettings, setBodyEndSettings] = useState<SiteSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Track injected scripts for cleanup
    const injectedScriptsRef = useRef<HTMLScriptElement[]>([]);

    useEffect(() => {
        let mounted = true;

        async function loadSettings() {
            try {
                const { data, error } = await fetchActiveSettingsByInjectionPoint();

                if (!mounted) return;

                if (error) {
                    console.warn('Failed to load SEO settings:', error);
                    setHasError(true);
                    return;
                }

                setHeadStartSettings(data.head_start);
                setHeadEndSettings(data.head_end);
                setBodyStartSettings(data.body_start);
                setBodyEndSettings(data.body_end);
            } catch (error) {
                console.warn('Error in SEOInjector:', error);
                if (mounted) setHasError(true);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        loadSettings();

        return () => {
            mounted = false;
        };
    }, []);

    /**
     * Inject body scripts (for tracking pixels)
     */
    useEffect(() => {
        if (isLoading || hasError) return;

        const scriptsToCleanup: HTMLScriptElement[] = [];

        // Helper to create and inject script
        const injectScript = (setting: SiteSetting, prepend: boolean) => {
            if (!setting.value || setting.setting_type !== 'script') return;

            const script = document.createElement('script');
            script.setAttribute('data-seo-setting', setting.key);

            // Don't sanitize scripts - they need to run as-is for analytics
            // Security is ensured by admin-only access to create scripts
            script.innerHTML = setting.value;

            if (prepend) {
                document.body.prepend(script);
            } else {
                document.body.appendChild(script);
            }

            scriptsToCleanup.push(script);
        };

        // Inject body_start scripts
        bodyStartSettings.forEach((setting) => injectScript(setting, true));

        // Inject body_end scripts
        bodyEndSettings.forEach((setting) => injectScript(setting, false));

        injectedScriptsRef.current = scriptsToCleanup;

        // Cleanup on unmount
        return () => {
            injectedScriptsRef.current.forEach((script) => {
                try {
                    script.remove();
                } catch {
                    // Script may already be removed
                }
            });
            injectedScriptsRef.current = [];
        };
    }, [isLoading, hasError, bodyStartSettings, bodyEndSettings]);

    /**
     * Render a setting based on its type for Helmet
     */
    const renderSetting = (setting: SiteSetting): React.ReactNode => {
        if (!setting.value) return null;

        switch (setting.setting_type) {
            case 'meta_tag':
                return renderMetaTag(setting.key, setting.value, setting.id);

            case 'script':
                // Scripts are injected directly, not sanitized
                return (
                    <script
                        key={setting.id}
                        dangerouslySetInnerHTML={{ __html: setting.value }}
                    />
                );

            case 'link':
                // Parse link attributes from value (expected format: href or full URL)
                return <link key={setting.id} rel="stylesheet" href={setting.value} />;

            case 'json_ld':
                // JSON-LD should not be sanitized as it needs exact structure
                return (
                    <script
                        key={setting.id}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: setting.value }}
                    />
                );

            case 'custom_html':
                // Custom HTML in head - sanitize this one
                return (
                    <script
                        key={setting.id}
                        dangerouslySetInnerHTML={{ __html: `document.write(${JSON.stringify(DOMPurify.sanitize(setting.value))});` }}
                    />
                );

            default:
                return null;
        }
    };

    /**
     * Render meta tags with proper attributes
     */
    const renderMetaTag = (key: string, value: string, id: string): React.ReactNode => {
        // Sanitize meta content
        const sanitizedValue = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });

        switch (key) {
            case 'site_title':
                return <title key={id}>{pageMeta?.title || sanitizedValue}</title>;

            case 'site_description':
                return (
                    <React.Fragment key={id}>
                        <meta name="description" content={pageMeta?.description || sanitizedValue} />
                        <meta property="og:description" content={pageMeta?.description || sanitizedValue} />
                    </React.Fragment>
                );

            case 'og_image':
                return (
                    <React.Fragment key={id}>
                        <meta property="og:image" content={pageMeta?.ogImage || sanitizedValue} />
                        <meta name="twitter:image" content={pageMeta?.ogImage || sanitizedValue} />
                    </React.Fragment>
                );

            case 'robots_meta':
                return <meta key={id} name="robots" content={sanitizedValue} />;

            case 'canonical_base':
                // Don't render as meta - this is used for canonical URLs
                return null;

            default:
                return <meta key={id} name={key.replace(/_/g, '-')} content={sanitizedValue} />;
        }
    };

    // Don't block rendering if SEO settings fail to load
    // The site should still work without dynamic SEO

    return (
        <Helmet>
            {/* Default meta tags */}
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Open Graph defaults */}
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Supermal Karawaci" />
            <meta property="og:locale" content="id_ID" />

            {/* Twitter Card defaults */}
            <meta name="twitter:card" content="summary_large_image" />

            {/* Canonical URL */}
            {pageMeta?.canonical && <link rel="canonical" href={pageMeta.canonical} />}

            {/* Keywords */}
            {pageMeta?.keywords && pageMeta.keywords.length > 0 && (
                <meta name="keywords" content={pageMeta.keywords.join(', ')} />
            )}

            {/* Dynamic SEO settings from database */}
            {!isLoading && !hasError && (
                <>
                    {/* Inject head_start settings */}
                    {headStartSettings.map(renderSetting)}

                    {/* Inject head_end settings */}
                    {headEndSettings.map(renderSetting)}
                </>
            )}
        </Helmet>
    );
}

/**
 * HOC to wrap any page component with SEO injection
 */
export function withSEO<P extends object>(
    Component: React.ComponentType<P>,
    seoMeta?: SEOInjectorProps['pageMeta']
) {
    return function WithSEOComponent(props: P) {
        return (
            <>
                <SEOInjector pageMeta={seoMeta} />
                <Component {...props} />
            </>
        );
    };
}
