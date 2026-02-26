
import React, { useState } from 'react';

type Theme = 'light' | 'dark';

interface LeaseSettings {
    vehicleNickname: string;
    startDate: string; // YYYY-MM-DD
    years: number;
    limit: number;
    startOdometer: number;
    unit: 'km' | 'mi';
}

interface SettingsModalProps {
    currentSettings: LeaseSettings;
    onSave: (newSettings: LeaseSettings) => void;
    onClose: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ currentSettings, onSave, onClose, theme, setTheme }) => {
    const [settings, setSettings] = useState(currentSettings);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(settings);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999]"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
        >
            <div
                className="bg-white dark:bg-[#161B22] w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-fade-in my-auto max-h-[95vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <h2 id="settings-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    Lease Settings
                </h2>
                <form onSubmit={handleSave}>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="vehicleNickname" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Vehicle Nickname
                            </label>
                            <input
                                type="text"
                                id="vehicleNickname"
                                name="vehicleNickname"
                                value={settings.vehicleNickname}
                                onChange={handleChange}
                                placeholder="e.g., My Audi A3"
                                className="w-full p-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Theme</label>
                            <div className="flex mt-1 rounded-lg bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-gray-600 p-1">
                                <button
                                    type="button"
                                    onClick={() => setTheme('light')}
                                    className={`w-1/2 p-2 rounded-md font-semibold transition-colors text-sm ${theme === 'light' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                                >
                                    Light
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTheme('dark')}
                                    className={`w-1/2 p-2 rounded-md font-semibold transition-colors text-sm ${theme === 'dark' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Unit of Measurement</label>
                            <div className="flex mt-1 rounded-lg bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-gray-600 p-1">
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, unit: 'km' }))}
                                    className={`w-1/2 p-2 rounded-md font-semibold transition-colors text-sm ${settings.unit === 'km' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                                >
                                    Kilometers
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, unit: 'mi' }))}
                                    className={`w-1/2 p-2 rounded-md font-semibold transition-colors text-sm ${settings.unit === 'mi' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                                >
                                    Miles
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Lease Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                value={settings.startDate}
                                onChange={handleChange}
                                className="w-full p-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-right"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                                <label htmlFor="years" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                    Duration (years)
                                </label>
                                <input
                                    type="number"
                                    id="years"
                                    name="years"
                                    value={settings.years || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-right"
                                    required
                                    min="1"
                                    step="1"
                                />
                            </div>
                            <div>
                                <label htmlFor="limit" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 truncate">
                                    Total Limit
                                </label>
                                <input
                                    type="number"
                                    id="limit"
                                    name="limit"
                                    value={settings.limit || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-right"
                                    required
                                    min="1"
                                    step="1"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="startOdometer" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Starting Odometer ({settings.unit})
                            </label>
                            <input
                                type="number"
                                id="startOdometer"
                                name="startOdometer"
                                value={settings.startOdometer}
                                onChange={handleChange}
                                className="w-full p-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-right"
                                required
                                min="0"
                                step="1"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-500 font-medium ml-1">Version 1.1.2</span>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="py-2 px-5 font-semibold rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-transform transform hover:scale-105"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsModal;
