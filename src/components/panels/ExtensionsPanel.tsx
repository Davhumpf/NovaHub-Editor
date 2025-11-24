'use client';

import React, { useState } from 'react';
import {
  VscSearch,
  VscSettings,
  VscCheck,
  VscClose,
  VscLock,
  VscChevronDown,
  VscChevronRight,
} from 'react-icons/vsc';
import { useExtensionsStore } from '@/store/useExtensionsStore';
import { useUserStore } from '@/store/useUserStore';
import { useTheme } from '@/contexts/ThemeContext';
import { Extension, ExtensionCategory } from '@/types/extension';

interface ExtensionsPanelProps {
  theme?: 'dark' | 'light';
}

export default function ExtensionsPanel({ theme: legacyTheme = 'dark' }: ExtensionsPanelProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ExtensionCategory>('all');
  const [expandedExtension, setExpandedExtension] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPremiumExtension, setSelectedPremiumExtension] = useState<Extension | null>(null);

  const {
    extensions,
    installedExtensions,
    enabledExtensions,
    installExtension,
    uninstallExtension,
    toggleExtension,
  } = useExtensionsStore();

  const { user, checkPremiumStatus } = useUserStore();
  const isPremium = checkPremiumStatus();

  const categories: { id: ExtensionCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'formatters', label: 'Formatters' },
    { id: 'linters', label: 'Linters' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'git', label: 'Git' },
    { id: 'preview', label: 'Preview' },
    { id: 'themes', label: 'Themes' },
  ];

  const filteredExtensions = extensions.filter((ext) => {
    const matchesSearch =
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === 'all' || ext.category.includes(activeCategory);

    return matchesSearch && matchesCategory;
  });

  const handleToggleExtension = (ext: Extension) => {
    if (ext.isPremium && !isPremium) {
      setSelectedPremiumExtension(ext);
      setShowUpgradeModal(true);
      return;
    }

    if (!ext.isInstalled) {
      installExtension(ext.id);
      toggleExtension(ext.id);
    } else {
      toggleExtension(ext.id);
    }
  };

  const handleUninstall = (extId: string) => {
    uninstallExtension(extId);
    if (expandedExtension === extId) {
      setExpandedExtension(null);
    }
  };

  const toggleExpanded = (extId: string) => {
    setExpandedExtension(expandedExtension === extId ? null : extId);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Bar */}
      <div className="p-3 border-b" style={{ borderColor: theme.colors.border }}>
        <div className="relative">
          <VscSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: theme.colors.foregroundMuted }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extensions..."
            className="w-full pl-10 pr-4 py-2 rounded border focus:outline-none focus:ring-2 text-sm"
            style={{
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.inputForeground,
              borderColor: theme.colors.inputBorder,
            }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b overflow-x-auto"
        style={{ borderColor: theme.colors.border }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              backgroundColor:
                activeCategory === cat.id
                  ? theme.colors.buttonBackground
                  : 'transparent',
              color:
                activeCategory === cat.id
                  ? theme.colors.buttonForeground
                  : theme.colors.foregroundSecondary,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Extensions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredExtensions.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full p-8 text-center"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <p className="text-sm">No extensions found</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredExtensions.map((ext) => (
              <div
                key={ext.id}
                className="rounded-lg border overflow-hidden"
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.border,
                }}
              >
                {/* Extension Card */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: theme.colors.backgroundTertiary }}
                    >
                      {ext.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className="font-semibold text-sm"
                            style={{ color: theme.colors.foreground }}
                          >
                            {ext.name}
                          </h3>
                          {ext.isPremium && (
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
                              style={{
                                backgroundColor: '#7c3aed20',
                                color: '#a78bfa',
                                border: '1px solid #7c3aed',
                              }}
                            >
                              <VscLock className="w-3 h-3" />
                              PREMIUM
                            </span>
                          )}
                          {ext.isEnabled && (
                            <VscCheck
                              className="w-4 h-4"
                              style={{ color: theme.colors.success }}
                            />
                          )}
                        </div>

                        {/* Toggle Switch */}
                        <button
                          onClick={() => handleToggleExtension(ext)}
                          className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                          style={{
                            backgroundColor: ext.isEnabled
                              ? theme.colors.success
                              : theme.colors.backgroundTertiary,
                          }}
                        >
                          <div
                            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                            style={{
                              transform: ext.isEnabled
                                ? 'translateX(20px)'
                                : 'translateX(0)',
                            }}
                          />
                        </button>
                      </div>

                      <p
                        className="text-xs mb-2"
                        style={{ color: theme.colors.foregroundSecondary }}
                      >
                        {ext.description}
                      </p>

                      <div
                        className="flex items-center gap-3 text-xs"
                        style={{ color: theme.colors.foregroundMuted }}
                      >
                        <span>{ext.author}</span>
                        <span>•</span>
                        <span>{ext.version}</span>
                        {ext.downloads && (
                          <>
                            <span>•</span>
                            <span>{(ext.downloads / 1000000).toFixed(1)}M downloads</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {ext.isInstalled && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => toggleExpanded(ext.id)}
                        className="px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        style={{
                          backgroundColor: theme.colors.backgroundTertiary,
                          color: theme.colors.foregroundSecondary,
                        }}
                      >
                        {expandedExtension === ext.id ? (
                          <>
                            <VscChevronDown className="w-3 h-3" />
                            Hide Settings
                          </>
                        ) : (
                          <>
                            <VscChevronRight className="w-3 h-3" />
                            <VscSettings className="w-3 h-3" />
                            Settings
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleUninstall(ext.id)}
                        className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: `${theme.colors.error}20`,
                          color: theme.colors.error,
                        }}
                      >
                        Uninstall
                      </button>
                    </div>
                  )}
                </div>

                {/* Settings Panel (Expanded) */}
                {expandedExtension === ext.id && (
                  <div
                    className="px-4 py-3 border-t"
                    style={{
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <h4
                      className="text-xs font-semibold mb-3"
                      style={{ color: theme.colors.foregroundSecondary }}
                    >
                      Extension Settings
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
                        <span style={{ color: theme.colors.foreground }}>
                          Format on Save
                        </span>
                        <input type="checkbox" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
                        <span style={{ color: theme.colors.foreground }}>
                          Auto Fix on Save
                        </span>
                        <input type="checkbox" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPremiumExtension && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-lg shadow-2xl p-6"
            style={{
              backgroundColor: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold"
                style={{ color: theme.colors.foreground }}
              >
                Premium Feature
              </h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{ color: theme.colors.foregroundMuted }}
              >
                <VscClose className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div
                className="flex items-center gap-3 mb-4 p-3 rounded-lg"
                style={{ backgroundColor: theme.colors.background }}
              >
                <div className="text-3xl">{selectedPremiumExtension.icon}</div>
                <div>
                  <h4
                    className="font-semibold text-sm"
                    style={{ color: theme.colors.foreground }}
                  >
                    {selectedPremiumExtension.name}
                  </h4>
                  <p
                    className="text-xs"
                    style={{ color: theme.colors.foregroundSecondary }}
                  >
                    {selectedPremiumExtension.description}
                  </p>
                </div>
              </div>

              <p
                className="text-sm mb-4"
                style={{ color: theme.colors.foregroundSecondary }}
              >
                This extension is only available for Premium users. Upgrade now to unlock
                this and many other premium features!
              </p>

              <div
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: '#7c3aed20', border: '1px solid #7c3aed' }}
              >
                <h4 className="font-semibold text-sm mb-2" style={{ color: '#a78bfa' }}>
                  Premium Benefits:
                </h4>
                <ul className="text-xs space-y-1" style={{ color: '#a78bfa' }}>
                  <li>✓ AI-powered code completion</li>
                  <li>✓ Advanced Git features</li>
                  <li>✓ Multi-device preview</li>
                  <li>✓ Premium themes</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors"
                style={{
                  backgroundColor: theme.colors.backgroundTertiary,
                  color: theme.colors.foregroundSecondary,
                }}
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  // Handle upgrade logic here
                  setShowUpgradeModal(false);
                }}
                className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors"
                style={{
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                }}
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
