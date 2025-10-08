import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Palette, 
  Database,
  Mail,
  Lock,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  Check
} from 'lucide-react';
import { User } from '../types';

interface SettingsProps {
  user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      systemName: 'ExcelHub',
      organizationName: 'Family Legacy',
      timezone: 'Africa/Lusaka',
      language: 'English',
      currency: 'ZMW',
      dateFormat: 'DD/MM/YYYY'
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90
      },
      sessionTimeout: 30,
      twoFactorAuth: false,
      loginAttempts: 5
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      allowanceReminders: true,
      taskDeadlines: true,
      systemUpdates: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#059669',
      sidebarCollapsed: false,
      compactMode: false
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      lastBackup: '2024-03-15T02:00:00Z'
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'backup', name: 'Backup & Data', icon: Database },
  ];

  const handleSave = () => {
    // Simulate saving settings
    console.log('Settings saved:', settings);
    // Show success message
  };

  const handleReset = () => {
    // Reset to default settings
    console.log('Settings reset to defaults');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gray-600 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-16 w-32 h-32 bg-blue-600 rounded-full animate-bounce" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gray-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="text-sm sm:text-base text-gray-600">Configure system preferences and security</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          System Name
                        </label>
                        <input
                          type="text"
                          value={settings.general.systemName}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, systemName: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          value={settings.general.organizationName}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, organizationName: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, timezone: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Africa/Lusaka">Africa/Lusaka</option>
                          <option value="Africa/Harare">Africa/Harare</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={settings.general.currency}
                          onChange={(e) => setSettings({
                            ...settings,
                            general: { ...settings.general, currency: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="ZMW">ZMW - Zambian Kwacha</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                          Changes to security settings will affect all users and require system restart.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Password Policy</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Length
                          </label>
                          <input
                            type="number"
                            value={settings.security.passwordPolicy.minLength}
                            onChange={(e) => setSettings({
                              ...settings,
                              security: {
                                ...settings.security,
                                passwordPolicy: {
                                  ...settings.security.passwordPolicy,
                                  minLength: parseInt(e.target.value)
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password Expiry (days)
                          </label>
                          <input
                            type="number"
                            value={settings.security.passwordPolicy.expiryDays}
                            onChange={(e) => setSettings({
                              ...settings,
                              security: {
                                ...settings.security,
                                passwordPolicy: {
                                  ...settings.security.passwordPolicy,
                                  expiryDays: parseInt(e.target.value)
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {[
                          { key: 'requireUppercase', label: 'Require Uppercase Letters' },
                          { key: 'requireLowercase', label: 'Require Lowercase Letters' },
                          { key: 'requireNumbers', label: 'Require Numbers' },
                          { key: 'requireSpecialChars', label: 'Require Special Characters' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={settings.security.passwordPolicy[item.key as keyof typeof settings.security.passwordPolicy] as boolean}
                              onChange={(e) => setSettings({
                                ...settings,
                                security: {
                                  ...settings.security,
                                  passwordPolicy: {
                                    ...settings.security.passwordPolicy,
                                    [item.key]: e.target.checked
                                  }
                                }
                              })}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Session & Access</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Session Timeout (minutes)
                          </label>
                          <input
                            type="number"
                            value={settings.security.sessionTimeout}
                            onChange={(e) => setSettings({
                              ...settings,
                              security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Login Attempts
                          </label>
                          <input
                            type="number"
                            value={settings.security.loginAttempts}
                            onChange={(e) => setSettings({
                              ...settings,
                              security: { ...settings.security, loginAttempts: parseInt(e.target.value) }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Notification Channels</h4>
                      <div className="space-y-3">
                        {[
                          { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
                          { key: 'smsNotifications', label: 'SMS Notifications', icon: Bell },
                          { key: 'pushNotifications', label: 'Push Notifications', icon: Bell }
                        ].map((item) => (
                          <label key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <item.icon className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                              onChange={(e) => setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, [item.key]: e.target.checked }
                              })}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Notification Types</h4>
                      <div className="space-y-3">
                        {[
                          { key: 'allowanceReminders', label: 'Allowance Reminders' },
                          { key: 'taskDeadlines', label: 'Task Deadlines' },
                          { key: 'systemUpdates', label: 'System Updates' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            <input
                              type="checkbox"
                              checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                              onChange={(e) => setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, [item.key]: e.target.checked }
                              })}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Appearance Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.appearance.theme}
                        onChange={(e) => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, theme: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={settings.appearance.primaryColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            appearance: { ...settings.appearance, primaryColor: e.target.value }
                          })}
                          className="w-12 h-10 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={settings.appearance.primaryColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            appearance: { ...settings.appearance, primaryColor: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'sidebarCollapsed', label: 'Collapse Sidebar by Default' },
                        { key: 'compactMode', label: 'Compact Mode' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={settings.appearance[item.key as keyof typeof settings.appearance] as boolean}
                            onChange={(e) => setSettings({
                              ...settings,
                              appearance: { ...settings.appearance, [item.key]: e.target.checked }
                            })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Backup Settings */}
              {activeTab === 'backup' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Backup & Data Settings</h3>
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-800">
                          Last backup completed successfully on {new Date(settings.backup.lastBackup).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Automatic Backup</span>
                          <p className="text-xs text-gray-500">Enable automatic daily backups</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.backup.autoBackup}
                          onChange={(e) => setSettings({
                            ...settings,
                            backup: { ...settings.backup, autoBackup: e.target.checked }
                          })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Backup Frequency
                        </label>
                        <select
                          value={settings.backup.backupFrequency}
                          onChange={(e) => setSettings({
                            ...settings,
                            backup: { ...settings.backup, backupFrequency: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Retention Period (days)
                        </label>
                        <input
                          type="number"
                          value={settings.backup.retentionDays}
                          onChange={(e) => setSettings({
                            ...settings,
                            backup: { ...settings.backup, retentionDays: parseInt(e.target.value) }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Database className="w-4 h-4" />
                        <span>Create Backup Now</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4" />
                        <span>Restore from Backup</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex justify-between">
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset to Defaults</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;