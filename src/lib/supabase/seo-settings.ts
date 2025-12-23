// src/lib/supabase/seo-settings.ts
// Created: SEO settings CRUD operations and TypeScript types

import { supabase } from '../supabase';

export type InjectionPoint = 'head_start' | 'head_end' | 'body_start' | 'body_end';
export type SettingType = 'meta_tag' | 'script' | 'link' | 'json_ld' | 'custom_html';

export interface SiteSetting {
    id: string;
    key: string;
    display_name: string;
    description: string | null;
    value: string | null;
    injection_point: InjectionPoint;
    is_active: boolean;
    setting_type: SettingType;
    sort_order: number;
    created_at: string;
    updated_at: string;
    created_by: string | null;
}

export interface SiteSettingInsert {
    key: string;
    display_name: string;
    description?: string | null;
    value?: string | null;
    injection_point: InjectionPoint;
    is_active?: boolean;
    setting_type: SettingType;
    sort_order?: number;
    created_by?: string | null;
}

export interface SiteSettingUpdate {
    key?: string;
    display_name?: string;
    description?: string | null;
    value?: string | null;
    injection_point?: InjectionPoint;
    is_active?: boolean;
    setting_type?: SettingType;
    sort_order?: number;
}

export interface SiteSettingFetchParams {
    injectionPoint?: InjectionPoint;
    settingType?: SettingType;
    activeOnly?: boolean;
}

/**
 * Fetch all site settings with optional filters
 */
export async function fetchSiteSettings(
    params: SiteSettingFetchParams = {}
): Promise<{ data: SiteSetting[]; error: Error | null }> {
    try {
        let query = supabase
            .from('site_settings')
            .select('*')
            .order('injection_point')
            .order('sort_order');

        if (params.activeOnly !== false) {
            query = query.eq('is_active', true);
        }

        if (params.injectionPoint) {
            query = query.eq('injection_point', params.injectionPoint);
        }

        if (params.settingType) {
            query = query.eq('setting_type', params.settingType);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { data: data as SiteSetting[], error: null };
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return { data: [], error: error as Error };
    }
}

/**
 * Fetch active settings grouped by injection point for rendering
 */
export async function fetchActiveSettingsByInjectionPoint(): Promise<{
    data: Record<InjectionPoint, SiteSetting[]>;
    error: Error | null;
}> {
    try {
        const { data, error } = await fetchSiteSettings({ activeOnly: true });

        if (error) throw error;

        const grouped: Record<InjectionPoint, SiteSetting[]> = {
            head_start: [],
            head_end: [],
            body_start: [],
            body_end: [],
        };

        data.forEach((setting) => {
            grouped[setting.injection_point].push(setting);
        });

        return { data: grouped, error: null };
    } catch (error) {
        console.error('Error fetching settings by injection point:', error);
        return {
            data: {
                head_start: [],
                head_end: [],
                body_start: [],
                body_end: [],
            },
            error: error as Error,
        };
    }
}

/**
 * Fetch a single site setting by key
 */
export async function fetchSiteSettingByKey(
    key: string
): Promise<{ data: SiteSetting | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('key', key)
            .single();

        if (error) throw error;

        return { data: data as SiteSetting, error: null };
    } catch (error) {
        console.error(`Error fetching setting with key ${key}:`, error);
        return { data: null, error: error as Error };
    }
}

/**
 * Create a new site setting
 */
export async function createSiteSetting(
    setting: SiteSettingInsert
): Promise<{ data: SiteSetting | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .insert([setting])
            .select()
            .single();

        if (error) throw error;

        return { data: data as SiteSetting, error: null };
    } catch (error) {
        console.error('Error creating site setting:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Update an existing site setting
 */
export async function updateSiteSetting(
    id: string,
    updates: SiteSettingUpdate
): Promise<{ data: SiteSetting | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return { data: data as SiteSetting, error: null };
    } catch (error) {
        console.error(`Error updating setting ${id}:`, error);
        return { data: null, error: error as Error };
    }
}

/**
 * Toggle active status of a site setting
 */
export async function toggleSiteSettingActive(
    id: string
): Promise<{ data: SiteSetting | null; error: Error | null }> {
    try {
        // First fetch current status
        const { data: current, error: fetchError } = await supabase
            .from('site_settings')
            .select('is_active')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // Toggle the status
        const { data, error } = await supabase
            .from('site_settings')
            .update({ is_active: !current.is_active })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return { data: data as SiteSetting, error: null };
    } catch (error) {
        console.error(`Error toggling setting ${id}:`, error);
        return { data: null, error: error as Error };
    }
}

/**
 * Delete a site setting
 */
export async function deleteSiteSetting(
    id: string
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('site_settings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return { error: null };
    } catch (error) {
        console.error(`Error deleting setting ${id}:`, error);
        return { error: error as Error };
    }
}

/**
 * Bulk update sort orders
 */
export async function updateSettingSortOrders(
    updates: { id: string; sort_order: number }[]
): Promise<{ error: Error | null }> {
    try {
        const promises = updates.map((update) =>
            supabase
                .from('site_settings')
                .update({ sort_order: update.sort_order })
                .eq('id', update.id)
        );

        await Promise.all(promises);

        return { error: null };
    } catch (error) {
        console.error('Error updating sort orders:', error);
        return { error: error as Error };
    }
}