// src/components/admin/SEOSettingsPage.tsx
// Created: Admin dashboard for managing SEO settings with full CRUD operations

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Save,
    X,
    AlertCircle,
    Code,
    FileText,
    LogIn,
    LogOut,
    Shield,
    Lock
} from 'lucide-react';
import {
    fetchSiteSettings,
    createSiteSetting,
    updateSiteSetting,
    deleteSiteSetting,
    toggleSiteSettingActive,
    type SiteSetting,
    type SiteSettingInsert,
    type InjectionPoint,
    type SettingType
} from '../../lib/supabase/seo-settings';
import { useAdminAuth } from '../../lib/hooks/useAdmin';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import toast from 'react-hot-toast';

interface FormData extends Omit<SiteSettingInsert, 'created_by'> {
    id?: string;
}

const INJECTION_POINTS: { value: InjectionPoint; label: string }[] = [
    { value: 'head_start', label: 'Head Start (<head> top)' },
    { value: 'head_end', label: 'Head End (before </head>)' },
    { value: 'body_start', label: 'Body Start (after <body>)' },
    { value: 'body_end', label: 'Body End (before </body>)' },
];

const SETTING_TYPES: { value: SettingType; label: string }[] = [
    { value: 'meta_tag', label: 'Meta Tag' },
    { value: 'script', label: 'Script' },
    { value: 'link', label: 'Link Tag' },
    { value: 'json_ld', label: 'JSON-LD Schema' },
    { value: 'custom_html', label: 'Custom HTML' },
];

// ============================================================================
// ADMIN LOGIN COMPONENT
// ============================================================================

interface AdminLoginProps {
    onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    isLoading: boolean;
    error: string | null;
}

function AdminLogin({ onLogin, isLoading, error }: AdminLoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await onLogin(email, password);
        if (result.success) {
            toast.success('Welcome back!');
        } else {
            toast.error(result.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-surface-secondary border border-border-primary rounded-2xl p-8 shadow-xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-accent" />
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary mb-2">
                            Admin Access Required
                        </h1>
                        <p className="text-text-secondary text-sm">
                            Sign in to manage SEO settings
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-border-primary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                placeholder="admin@example.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-border-primary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-accent hover:bg-accent/90 text-text-inverse font-medium flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-text-inverse border-t-transparent" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Sign In
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 pt-6 border-t border-border-primary">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                            <Lock className="w-3 h-3" />
                            <span>This is a protected admin area</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================================================
// MAIN SEO SETTINGS PAGE
// ============================================================================

export default function SEOSettingsPage() {
    const { session, isLoading: authLoading, error: authError, signIn, signOut, hasPermission } = useAdminAuth();

    const [settings, setSettings] = useState<SiteSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        key: '',
        display_name: '',
        description: null,
        value: null,
        injection_point: 'head_end',
        setting_type: 'script',
        is_active: true,
        sort_order: 0,
    });

    // Check if user can edit SEO settings
    const canEdit = hasPermission('seo_settings.edit') ||
                    hasPermission('seo_settings.view') ||
                    (session?.roles.some(r => r.name === 'super_admin' || r.name === 'content_manager') ?? false);

    // Fetch all settings
    const loadSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await fetchSiteSettings({ activeOnly: false });

            if (error) {
                toast.error('Failed to load SEO settings');
                console.error(error);
                return;
            }

            setSettings(data);
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Unexpected error loading settings');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session) {
            loadSettings();
        }
    }, [session, loadSettings]);

    // Show login screen if not authenticated
    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-surface">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
                    <p className="mt-4 text-text-secondary">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return <AdminLogin onLogin={signIn} isLoading={authLoading} error={authError} />;
    }

    // Open modal for creating or editing
    const openModal = (setting?: SiteSetting) => {
        if (setting) {
            setEditingId(setting.id);
            setFormData({
                id: setting.id,
                key: setting.key,
                display_name: setting.display_name,
                description: setting.description,
                value: setting.value,
                injection_point: setting.injection_point,
                setting_type: setting.setting_type,
                is_active: setting.is_active,
                sort_order: setting.sort_order,
            });
        } else {
            setEditingId(null);
            setFormData({
                key: '',
                display_name: '',
                description: null,
                value: null,
                injection_point: 'head_end',
                setting_type: 'script',
                is_active: true,
                sort_order: 0,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingId) {
                // Update existing setting
                const { error } = await updateSiteSetting(editingId, formData);
                if (error) throw error;
                toast.success('Setting updated successfully');
            } else {
                // Create new setting
                const { error } = await createSiteSetting(formData);
                if (error) throw error;
                toast.success('Setting created successfully');
            }

            closeModal();
            loadSettings();
        } catch (error) {
            console.error('Error saving setting:', error);
            toast.error('Failed to save setting');
        }
    };

    // Toggle active status
    const handleToggleActive = async (id: string) => {
        try {
            const { error } = await toggleSiteSettingActive(id);
            if (error) throw error;
            toast.success('Setting status updated');
            loadSettings();
        } catch (error) {
            console.error('Error toggling setting:', error);
            toast.error('Failed to update setting status');
        }
    };

    // Delete setting
    const handleDelete = async (id: string, displayName: string) => {
        if (!window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
            return;
        }

        try {
            const { error } = await deleteSiteSetting(id);
            if (error) throw error;
            toast.success('Setting deleted successfully');
            loadSettings();
        } catch (error) {
            console.error('Error deleting setting:', error);
            toast.error('Failed to delete setting');
        }
    };

    // Group settings by injection point
    const groupedSettings = settings.reduce((acc, setting) => {
        if (!acc[setting.injection_point]) {
            acc[setting.injection_point] = [];
        }
        acc[setting.injection_point].push(setting);
        return acc;
    }, {} as Record<InjectionPoint, SiteSetting[]>);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-surface">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
                    <p className="mt-4 text-text-secondary">Loading SEO settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-text-primary mb-2">
                            SEO Settings Manager
                        </h1>
                        <p className="text-text-secondary">
                            Manage meta tags, tracking scripts, and structured data
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* User Info */}
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-surface-secondary border border-border-primary rounded-lg">
                            <div className="text-right">
                                <p className="text-sm font-medium text-text-primary">
                                    {session.user.full_name}
                                </p>
                                <p className="text-xs text-text-muted">
                                    {session.roles[0]?.display_name || 'Admin'}
                                </p>
                            </div>
                            <button
                                onClick={signOut}
                                className="p-2 hover:bg-surface rounded-lg transition-colors"
                                title="Sign out"
                            >
                                <LogOut className="w-4 h-4 text-text-secondary" />
                            </button>
                        </div>

                        {canEdit && (
                            <Button
                                onClick={() => openModal()}
                                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-text-inverse"
                            >
                                <Plus className="w-5 h-5" />
                                Add Setting
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-surface-secondary border border-border-primary rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-text-secondary">
                        <p className="font-semibold text-text-primary mb-1">Important:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>All scripts are sanitized before injection to prevent XSS attacks</li>
                            <li>Only active settings will be rendered on the website</li>
                            <li>Use "head_end" for analytics scripts (Google Analytics, Meta Pixel)</li>
                            <li>Use "body_end" for tracking pixels that require bottom placement</li>
                        </ul>
                    </div>
                </div>

                {/* Settings List */}
                {INJECTION_POINTS.map(({ value, label }) => (
                    <div key={value} className="mb-8">
                        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <Code className="w-6 h-6 text-accent" />
                            {label}
                        </h2>

                        {groupedSettings[value]?.length > 0 ? (
                            <div className="grid gap-4">
                                {groupedSettings[value]
                                    .sort((a, b) => a.sort_order - b.sort_order)
                                    .map((setting) => (
                                        <SettingCard
                                            key={setting.id}
                                            setting={setting}
                                            canEdit={canEdit}
                                            onEdit={() => openModal(setting)}
                                            onToggle={() => handleToggleActive(setting.id)}
                                            onDelete={() => handleDelete(setting.id, setting.display_name)}
                                        />
                                    ))}
                            </div>
                        ) : (
                            <div className="bg-surface-secondary border border-border-primary rounded-xl p-8 text-center">
                                <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                                <p className="text-text-secondary">No settings for this injection point yet</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-surface-secondary border border-border-primary rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-text-primary">
                                    {editingId ? 'Edit Setting' : 'Add New Setting'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5 text-text-secondary" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Key */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Key (unique identifier) *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.key}
                                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                        className="w-full px-4 py-2 bg-surface border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                        required
                                        placeholder="e.g., google_analytics"
                                    />
                                </div>

                                {/* Display Name */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Display Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.display_name}
                                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                        className="w-full px-4 py-2 bg-surface border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                        required
                                        placeholder="e.g., Google Analytics 4"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-surface border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent min-h-[80px]"
                                        placeholder="Brief description of this setting"
                                    />
                                </div>

                                {/* Setting Type */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Setting Type *
                                    </label>
                                    <select
                                        value={formData.setting_type}
                                        onChange={(e) =>
                                            setFormData({ ...formData, setting_type: e.target.value as SettingType })
                                        }
                                        className="w-full px-4 py-2 bg-surface border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                        required
                                    >
                                        {SETTING_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Injection Point */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Injection Point *
                                    </label>
                                    <select
                                        value={formData.injection_point}
                                        onChange={(e) =>
                                            setFormData({ ...formData, injection_point: e.target.value as InjectionPoint })
                                        }
                                        className="w-full px-4 py-2 bg-surface border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                        required
                                    >
                                        {INJECTION_POINTS.map((point) => (
                                            <option key={point.value} value={point.value}>
                                                {point.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Value */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Value / Code
                                    </label>
                                    <textarea
                                        value={formData.value || ''}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-4 py-2 bg-surface border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent min-h-[200px] font-mono text-sm"
                                        placeholder={getValuePlaceholder(formData.setting_type)}
                                    />
                                </div>

                                {/* Sort Order */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) =>
                                            setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                                        }
                                        className="w-full px-4 py-2 bg-surface border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-5 h-5 text-accent bg-surface border-border-primary rounded focus:ring-2 focus:ring-accent"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-text-primary">
                                        Active (will be rendered on website)
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
                                    <Button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2 bg-surface-secondary hover:bg-surface text-text-primary border border-border-primary"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="px-6 py-2 bg-accent hover:bg-accent/90 text-text-inverse flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {editingId ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper function for textarea placeholders
function getValuePlaceholder(type: SettingType): string {
    switch (type) {
        case 'script':
            return '// Your JavaScript code here (no <script> tags needed)\ngtag("config", "G-XXXXXXXXXX");';
        case 'meta_tag':
            return 'Your meta content value here';
        case 'link':
            return 'https://example.com/stylesheet.css';
        case 'json_ld':
            return '{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Supermal Karawaci"\n}';
        case 'custom_html':
            return '<!-- Your custom HTML here -->';
        default:
            return '';
    }
}

// Setting Card Component
interface SettingCardProps {
    setting: SiteSetting;
    canEdit: boolean;
    onEdit: () => void;
    onToggle: () => void;
    onDelete: () => void;
}

function SettingCard({ setting, canEdit, onEdit, onToggle, onDelete }: SettingCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasValue = setting.value && setting.value.trim().length > 0;

    return (
        <div className="bg-surface-secondary border border-border-primary rounded-xl p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-text-primary">{setting.display_name}</h3>
                        {/* Clickable toggle badge */}
                        {canEdit ? (
                            <button
                                onClick={onToggle}
                                className="focus:outline-none focus:ring-2 focus:ring-accent rounded-full"
                                title={setting.is_active ? 'Click to deactivate' : 'Click to activate'}
                            >
                                <Badge
                                    variant={setting.is_active ? 'default' : 'secondary'}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    {setting.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </button>
                        ) : (
                            <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                                {setting.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                            {setting.setting_type}
                        </Badge>
                    </div>

                    {setting.description && (
                        <p className="text-sm text-text-secondary mb-2">{setting.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span>Key: {setting.key}</span>
                        <span>•</span>
                        <span>Order: {setting.sort_order}</span>
                    </div>

                    {/* Code preview - always show toggle if there's value */}
                    {hasValue && (
                        <div className="mt-3">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
                            >
                                {isExpanded ? (
                                    <>
                                        <EyeOff className="w-3 h-3" />
                                        Hide code
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-3 h-3" />
                                        Show code
                                    </>
                                )}
                            </button>

                            {isExpanded && (
                                <div className="mt-2 p-3 bg-surface rounded-lg border border-border-primary">
                                    <pre className="text-xs text-text-secondary overflow-x-auto whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                                        {setting.value}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action buttons - only Edit and Delete */}
                {canEdit && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={onEdit}
                            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
                            aria-label="Edit setting"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4 text-accent" />
                        </button>

                        <button
                            onClick={onDelete}
                            className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                            aria-label="Delete setting"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4 text-error" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
