

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AlertIcon, ArrowLeftIcon, CalendarIcon, CogIcon, PlusIcon, CheckCircleIcon, LeaseDurationIcon, TotalKilometerIcon } from './components/icons/CogIcon';
import SettingsModal from './components/SettingsModal';

// --- TYPE DEFINITIONS ---
type Theme = 'light' | 'dark';

interface LeaseDetails {
    vehicleNickname: string;
    startDate: string; // YYYY-MM-DD
    years: number;
    limit: number;
    startOdometer: number;
    unit: 'km' | 'mi';
}

interface MileageLog {
    date: string; // YYYY-MM-DD
    odometer: number;
}

// --- HELPER HOOKS ---
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(error);
        }
    }, [key, state]);

    return [state, setState];
}


// --- UI COMPONENTS ---

const Header: React.FC<{ title: string; onBack?: () => void; onSettings?: () => void; }> = ({ title, onBack, onSettings }) => (
    <header className="flex items-center justify-between px-4 pt-12 pb-4">
        {onBack ? (
            <button onClick={onBack} aria-label="Go back"><ArrowLeftIcon /></button>
        ) : <div className="w-6"></div>}
        <h1 className="text-lg font-semibold truncate" title={title}>{title}</h1>
        {onSettings ? (
            <button onClick={onSettings} aria-label="Settings"><CogIcon /></button>
        ) : <div className="w-6"></div>}
    </header>
);

const CircularProgress: React.FC<{ value: number; max: number; unit: 'km' | 'mi' }> = ({ value, max, unit }) => {
    const percentage = max > 0 ? ((max - value) / max) * 100 : 0;
    const circumference = 2 * Math.PI * 80;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-52 h-52">
            <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" className="stroke-gray-200 dark:stroke-[#1F2937]" strokeWidth="20" />
                <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="20"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <div className="absolute text-center mt-1">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString('en-US')}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{unit} Remaining</div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string; value: string | number; unit?: string; valueColor?: string }> = ({ label, value, unit, valueColor }) => (
    <div className="bg-white dark:bg-[#161B22] p-3 rounded-lg border border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <p className={`text-xl font-bold ${valueColor ? valueColor : 'text-gray-900 dark:text-white'}`}>
            {value}
            {unit && <span className="text-base font-normal text-gray-500 dark:text-gray-300 ml-1">{unit}</span>}
        </p>
    </div>
);


// --- SCREEN COMPONENTS ---

const SetupScreen: React.FC<{ onSave: (details: LeaseDetails) => void }> = ({ onSave }) => {
    const [details, setDetails] = useState<LeaseDetails>({
        vehicleNickname: '',
        startDate: new Date().toISOString().split('T')[0],
        years: 4,
        limit: 40000,
        startOdometer: 0,
        unit: 'km',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setDetails(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (details.years > 0 && details.limit > 0 && details.startDate) {
            onSave(details);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 pt-12 animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Set Up Your Lease</h1>

            <form onSubmit={handleSubmit} className="flex-grow flex flex-col space-y-6">
                <div>
                    <label htmlFor="vehicleNickname" className="text-gray-600 dark:text-gray-300">Vehicle Nickname (Optional)</label>
                    <input
                        id="vehicleNickname"
                        name="vehicleNickname"
                        type="text"
                        value={details.vehicleNickname}
                        onChange={handleChange}
                        placeholder="e.g., My Audi A3"
                        className="w-full bg-gray-100 dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="text-gray-600 dark:text-gray-300">Unit of Measurement</label>
                    <div className="flex mt-2 rounded-lg bg-gray-100 dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 p-1">
                        <button
                            type="button"
                            onClick={() => setDetails(prev => ({ ...prev, unit: 'km' }))}
                            className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${details.unit === 'km' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                        >
                            Kilometers
                        </button>
                        <button
                            type="button"
                            onClick={() => setDetails(prev => ({ ...prev, unit: 'mi' }))}
                            className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${details.unit === 'mi' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                        >
                            Miles
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <label htmlFor="startDate" className="text-gray-600 dark:text-gray-300">Lease Start Date</label>
                    <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={details.startDate}
                        onChange={handleChange}
                        className="w-full bg-gray-100 dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">When did your lease begin?</p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Lease Terms</h2>
                    <div className="bg-gray-100 dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg p-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
                        <TotalKilometerIcon />
                        <label htmlFor="startOdometer" className="truncate">Starting Odometer</label>
                        <div className="flex items-center justify-end">
                            <input
                                type="number"
                                id="startOdometer"
                                name="startOdometer"
                                value={details.startOdometer}
                                onChange={handleChange}
                                className="bg-transparent w-32 text-right font-semibold focus:outline-none"
                                step="1"
                                min="0"
                            />
                            <span className="text-gray-500 dark:text-gray-400 w-12 text-left pl-2">{details.unit}</span>
                        </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg p-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
                        <LeaseDurationIcon />
                        <label htmlFor="years" className="truncate">Lease Duration</label>
                        <div className="flex items-center justify-end">
                            <input
                                type="number"
                                id="years"
                                name="years"
                                value={details.years || ''}
                                onChange={handleChange}
                                className="bg-transparent w-32 text-right font-semibold focus:outline-none"
                                min="1"
                            />
                            <span className="text-gray-500 dark:text-gray-400 w-12 text-left pl-2">Years</span>
                        </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-[#161B22] border border-gray-300 dark:border-gray-700 rounded-lg p-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
                        <TotalKilometerIcon />
                        <label htmlFor="limit" className="truncate">Total {details.unit === 'km' ? 'Kilometer' : 'Mile'} Limit</label>
                        <div className="flex items-center justify-end">
                            <input
                                type="number"
                                id="limit"
                                name="limit"
                                value={details.limit || ''}
                                onChange={handleChange}
                                className="bg-transparent w-32 text-right font-semibold focus:outline-none"
                                step="1"
                                min="1"
                            />
                            <span className="text-gray-500 dark:text-gray-400 w-12 text-left pl-2">{details.unit}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-grow"></div>

                <button type="submit" className="w-full bg-blue-600 text-white font-semibold p-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Save & Start Tracking
                </button>
            </form>
        </div>
    );
};

const UpdateMileageScreen: React.FC<{ onSave: (odometer: number) => void; onBack: () => void; lastReading: number; unit: 'km' | 'mi'; }> = ({ onSave, onBack, lastReading, unit }) => {
    const [value, setValue] = useState('');

    const isLowerThanLast = useMemo(() => {
        if (value.trim() === '' || lastReading === 0) return false;
        const numericValue = parseInt(value, 10);
        return !isNaN(numericValue) && numericValue < lastReading;
    }, [value, lastReading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const odometer = parseInt(value);
        if (!isNaN(odometer) && value.trim() !== '') {
            onSave(odometer);
        }
    };

    return (
        <div className="h-full flex flex-col animate-fade-in">
            <Header title="Update Mileage" onBack={onBack} />
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col p-4 text-center">
                <h2 className="text-lg text-gray-600 dark:text-gray-300 mt-8">Odometer Reading</h2>
                <div className="relative">
                    <input
                        type="number"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder={lastReading > 0 ? lastReading.toLocaleString('en-US') : '35840'}
                        className="text-6xl font-bold bg-transparent text-center focus:outline-none my-2 appearance-none w-full"
                        autoFocus
                        required
                        step="1"
                    />
                    {isLowerThanLast && (
                        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-max max-w-[calc(100%-2rem)] bg-gray-700 text-white text-sm rounded-lg shadow-lg p-3 z-10 animate-fade-in">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-gray-700"></div>
                            <div className="flex items-start gap-2">
                                <AlertIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>Value is lower than your last reading. Submitting will correct the previous entry.</span>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-gray-500">Enter the total {unit === 'km' ? 'kilometers' : 'miles'} shown on your<br />dashboard.</p>
                <div className="flex-grow"></div>
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold p-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Update Mileage
                </button>
            </form>
        </div>
    )
};


const DashboardScreen: React.FC<{ lease: LeaseDetails; log: MileageLog[]; setView: (view: 'log') => void; setSettingsOpen: (open: boolean) => void; isSettingsOpen: boolean; theme: Theme; setTheme: (theme: Theme) => void; }> = ({ lease, log, setView, setSettingsOpen, isSettingsOpen, theme }) => {

    const calculations = useMemo(() => {
        if (!lease) return null;

        // Use local timezone for all date calculations to avoid UTC/local mismatch.
        const now = new Date();

        const startDateParts = lease.startDate.split('-').map(s => parseInt(s, 10));
        const leaseStartDate = new Date(startDateParts[0], startDateParts[1] - 1, startDateParts[2]);

        const leaseEndDate = new Date(leaseStartDate);
        leaseEndDate.setFullYear(leaseStartDate.getFullYear() + lease.years);

        const totalLeaseDays = Math.round((leaseEndDate.getTime() - leaseStartDate.getTime()) / (1000 * 60 * 60 * 24));
        // elapsedDays is the number of FULL days that have passed since the start date.
        const elapsedDays = Math.max(0, Math.floor((now.getTime() - leaseStartDate.getTime()) / (1000 * 60 * 60 * 24)));
        const remainingDays = Math.max(0, totalLeaseDays - elapsedDays);

        const allowedDailyAvg = totalLeaseDays > 0 ? lease.limit / totalLeaseDays : 0;

        const currentOdometer = log.length > 0 ? log[log.length - 1].odometer : lease.startOdometer;
        const totalUsed = Math.max(0, currentOdometer - lease.startOdometer);
        const kmRemaining = lease.limit - totalUsed;

        const timeRemainingMonths = Math.round(remainingDays / 30.44);

        const yourCurrentAvg = elapsedDays > 0 ? totalUsed / elapsedDays : 0;
        const projectionDiff = yourCurrentAvg - allowedDailyAvg;

        const onTrack = projectionDiff <= 0;

        const allowedMileageToDate = allowedDailyAvg * elapsedDays;
        const mileageBudgetDifference = allowedMileageToDate - totalUsed;

        return {
            kmRemaining,
            totalUsed,
            timeRemainingMonths,
            allowedDailyAvg,
            yourCurrentAvg,
            projectionDiff,
            onTrack,
            mileageBudgetDifference,
        };
    }, [lease, log]);

    if (!calculations) return null;

    if (log.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 animate-fade-in">
                <h1 className="text-2xl font-bold mb-2">Welcome, {lease.vehicleNickname || 'Driver'}!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Let's get started by logging your car's current odometer reading.</p>
                <button onClick={() => setView('log')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 flex items-center gap-2">
                    <PlusIcon />
                    Log First Mileage
                </button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col animate-fade-in">
            <Header title={lease.vehicleNickname || 'Mileage Dashboard'} onSettings={() => setSettingsOpen(true)} />
            <main className="flex-grow px-4 pt-0 pb-4 overflow-y-auto space-y-4">
                <div className="flex flex-col items-center">
                    <CircularProgress value={calculations.kmRemaining} max={lease.limit} unit={lease.unit} />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">out of {lease.limit.toLocaleString('en-US')} {lease.unit}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Total Used" value={calculations.totalUsed.toLocaleString('en-US')} unit={lease.unit} />
                    <StatCard label="Time Remaining" value={calculations.timeRemainingMonths} unit="Months" />
                    <StatCard label="Allowed Daily Avg" value={calculations.allowedDailyAvg.toFixed(1)} unit={lease.unit} />
                    <StatCard label="Your Current Avg" value={calculations.yourCurrentAvg.toFixed(1)} unit={lease.unit} />
                </div>

                <div className="bg-white dark:bg-[#161B22] p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold mb-2">Mileage Balance</h3>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-xl font-bold ${calculations.mileageBudgetDifference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(calculations.mileageBudgetDifference).toLocaleString('en-US', { maximumFractionDigits: 0 })} {lease.unit}
                        </p>
                        <p className={`text-sm font-semibold ${calculations.mileageBudgetDifference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {calculations.mileageBudgetDifference >= 0 ? 'ahead' : 'over budget'}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500">vs. allowed mileage to date</p>
                </div>
            </main>

            {!isSettingsOpen && (
                <div className="px-4 pb-4">
                    <button onClick={() => setView('log')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <PlusIcon />
                        Log New Mileage
                    </button>
                </div>
            )}
        </div>
    );
};


// --- MAIN APP ---

const App: React.FC = () => {
    const [leaseDetails, setLeaseDetails] = usePersistentState<LeaseDetails | null>('leaseDetails', null);
    const [mileageLog, setMileageLog] = usePersistentState<MileageLog[]>('mileageLog', []);
    const [view, setView] = useState<'setup' | 'dashboard' | 'log'>('dashboard');
    const [theme, setTheme] = usePersistentState<Theme>('theme', 'dark');
    const [isSettingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');

        if (theme === 'light') {
            root.classList.remove('dark');
            if (themeColorMeta) themeColorMeta.setAttribute('content', '#F9FAFB'); // bg-gray-50
        } else {
            root.classList.add('dark');
            if (themeColorMeta) themeColorMeta.setAttribute('content', '#0D1117');
        }
    }, [theme]);

    useEffect(() => {
        if (!leaseDetails) {
            setView('setup');
        } else {
            setView('dashboard');
        }
    }, [leaseDetails]);

    const handleSaveSetup = (details: LeaseDetails) => {
        setLeaseDetails(details);
        setMileageLog([]); // Clear log when settings change
        setView('dashboard');
    };

    const handleLogMileage = (odometer: number) => {
        const newLogEntry: MileageLog = {
            date: new Date().toISOString().split('T')[0],
            odometer: odometer
        };

        setMileageLog(prevLog => {
            if (prevLog.length === 0) {
                return [newLogEntry];
            }

            // Log is sorted by odometer, so last entry is the highest.
            const lastEntry = prevLog[prevLog.length - 1];

            if (odometer < lastEntry.odometer) {
                // This is a correction. Replace the highest reading.
                const logWithoutHighest = prevLog.slice(0, -1);
                const newLog = [...logWithoutHighest, newLogEntry];
                return newLog.sort((a, b) => a.odometer - b.odometer);
            } else {
                // This is a new, higher reading. Just add it.
                return [...prevLog, newLogEntry].sort((a, b) => a.odometer - b.odometer);
            }
        });
        setView('dashboard');
    };


    const lastReading = useMemo(() => {
        if (mileageLog.length > 0) {
            return mileageLog[mileageLog.length - 1].odometer;
        }
        return leaseDetails?.startOdometer ?? 0;
    }, [mileageLog, leaseDetails]);

    const renderView = () => {
        switch (view) {
            case 'setup':
                return <SetupScreen onSave={handleSaveSetup} />;
            case 'log':
                if (leaseDetails) {
                    return <UpdateMileageScreen onSave={handleLogMileage} onBack={() => setView('dashboard')} lastReading={lastReading} unit={leaseDetails.unit} />;
                }
                // Fallback to setup if details are missing
                return <SetupScreen onSave={handleSaveSetup} />;
            case 'dashboard':
                if (leaseDetails) {
                    return <DashboardScreen lease={leaseDetails} log={mileageLog} setView={setView} setSettingsOpen={setSettingsOpen} isSettingsOpen={isSettingsOpen} theme={theme} setTheme={setTheme} />;
                }
                // Fallback to setup if details are missing
                return <SetupScreen onSave={handleSaveSetup} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-gray-50 dark:bg-[#0D1117] min-h-screen flex flex-col text-gray-800 dark:text-gray-200 transition-colors duration-300">
            <div className="flex-grow">
                {renderView()}
            </div>
            {isSettingsOpen && leaseDetails && (
                <SettingsModal
                    currentSettings={leaseDetails}
                    onSave={(newSettings) => {
                        setLeaseDetails(newSettings);
                        setMileageLog([]);
                        setSettingsOpen(false);
                        setView('dashboard');
                    }}
                    onClose={() => setSettingsOpen(false)}
                    theme={theme}
                    setTheme={setTheme}
                />
            )}
        </div>
    );
};

export default App;