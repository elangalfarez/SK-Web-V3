// src/components/SEOInjector.tsx
// Fixed: Proper GTM/Analytics script injection without sanitization

import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchActiveSettingsByInjectionPoint, type SiteSetting } from '../lib/supabase/seo-settings';

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
 * - Custom HTML (noscript tags for GTM)
 *
 * SECURITY NOTE: Scripts and custom_html are NOT sanitized.
 * Only trusted admin users can add these through the admin panel.
 */
export default function SEOInjector({ pageMeta }: SEOInjectorProps) {
    const [headStartSettings, setHeadStartSettings] = useState<SiteSetting[]>([]);
    const [headEndSettings, setHeadEndSettings] = useState<SiteSetting[]>([]);
    const [bodyStartSettings, setBodyStartSettings] = useState<SiteSetting[]>([]);
    const [bodyEndSettings, setBodyEndSettings] = useState<SiteSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Track injected elements for cleanup
    const injectedElementsRef = useRef<Element[]>([]);

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
     * Inject body elements (scripts, noscript tags for GTM)
     */
    useEffect(() => {
        if (isLoading || hasError) return;

        const elementsToCleanup: Element[] = [];

        // Helper to inject content into body
        const injectIntoBody = (setting: SiteSetting, prepend: boolean) => {
            if (!setting.value) return;

            if (setting.setting_type === 'script') {
                // Create script element
                const script = document.createElement('script');
                script.setAttribute('data-seo-setting', setting.key);
                script.innerHTML = setting.value;

                if (prepend) {
                    // Insert after opening body tag
                    document.body.insertBefore(script, document.body.firstChild);
                } else {
                    document.body.appendChild(script);
                }

                elementsToCleanup.push(script);
            } else if (setting.setting_type === 'custom_html') {
                // For custom HTML (like GTM noscript), create a container and inject
                const container = document.createElement('div');
                container.setAttribute('data-seo-setting', setting.key);
                container.style.display = 'contents'; // Invisible wrapper
                container.innerHTML = setting.value;

                if (prepend) {
                    document.body.insertBefore(container, document.body.firstChild);
                } else {
                    document.body.appendChild(container);
                }

                elementsToCleanup.push(container);
            }
        };

        // Inject body_start elements (GTM noscript goes here)
        bodyStartSettings.forEach((setting) => injectIntoBody(setting, true));

        // Inject body_end elements
        bodyEndSettings.forEach((setting) => injectIntoBody(setting, false));

        injectedElementsRef.current = elementsToCleanup;

        // Cleanup on unmount
        return () => {
            injectedElementsRef.current.forEach((el) => {
                try {
                    el.remove();
                } catch {
                    // Element may already be removed
                }
            });
            injectedElementsRef.current = [];
        };
    }, [isLoading, hasError, bodyStartSettings, bodyEndSettings]);

    /**
     * Render a setting based on its type for Helmet (head injection)
     */
    const renderSetting = (setting: SiteSetting): React.ReactNode => {
        if (!setting.value) return null;

        switch (setting.setting_type) {
            case 'meta_tag':
                return renderMetaTag(setting.key, setting.value, setting.id);

            case 'script':
                // Scripts injected directly - NO SANITIZATION for analytics to work
                return (
                    <script
                        key={setting.id}
                        dangerouslySetInnerHTML={{ __html: setting.value }}
                    />
                );

            case 'link':
                return <link key={setting.id} rel="stylesheet" href={setting.value} />;

            case 'json_ld':
                // JSON-LD structured data
                return (
                    <script
                        key={setting.id}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: setting.value }}
                    />
                );

            case 'custom_html':
                // Custom HTML - NO SANITIZATION (admins only)
                // Use a script to inject the HTML into head
                return (
                    <script
                        key={setting.id}
                        dangerouslySetInnerHTML={{
                            __html: `(function(){
                                var d=document,t=d.createElement('div');
                                t.innerHTML=${JSON.stringify(setting.value)};
                                while(t.firstChild)d.head.appendChild(t.firstChild);
                            })();`
                        }}
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
        // Basic sanitization for meta content (remove HTML tags)
        const cleanValue = value.replace(/<[^>]*>/g, '').trim();

        switch (key) {
            case 'site_title':
                return <title key={id}>{pageMeta?.title || cleanValue}</title>;

            case 'site_description':
                return (
                    <React.Fragment key={id}>
                        <meta name="description" content={pageMeta?.description || cleanValue} />
                        <meta property="og:description" content={pageMeta?.description || cleanValue} />
                    </React.Fragment>
                );

            case 'og_image':
                return (
                    <React.Fragment key={id}>
                        <meta property="og:image" content={pageMeta?.ogImage || cleanValue} />
                        <meta name="twitter:image" content={pageMeta?.ogImage || cleanValue} />
                    </React.Fragment>
                );

            case 'robots_meta':
                return <meta key={id} name="robots" content={cleanValue} />;

            case 'canonical_base':
                return null;

            default:
                return <meta key={id} name={key.replace(/_/g, '-')} content={cleanValue} />;
        }
    };

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
                    {headStartSettings.map(renderSetting)}
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
