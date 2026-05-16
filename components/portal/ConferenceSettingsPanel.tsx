'use client';

import { useState, useTransition } from 'react';
import { updateConferenceSettings } from '@/lib/actions/resolutions';

interface ConferenceSettings {
    accepting_submissions: boolean;
    accepting_amendments: boolean;
}

interface Props {
    settings: ConferenceSettings;
}

interface ToggleState {
    loading: boolean;
    error: string | null;
}

export default function ConferenceSettingsPanel({ settings }: Props) {
    const [values, setValues] = useState<ConferenceSettings>(settings);
    const [submissionsState, setSubmissionsState] = useState<ToggleState>({ loading: false, error: null });
    const [amendmentsState, setAmendmentsState] = useState<ToggleState>({ loading: false, error: null });
    const [, startTransition] = useTransition();

    const handleToggle = (
        field: 'accepting_submissions' | 'accepting_amendments',
        newValue: boolean,
        setState: React.Dispatch<React.SetStateAction<ToggleState>>
    ) => {
        setState({ loading: true, error: null });
        startTransition(async () => {
            try {
                await updateConferenceSettings(field, newValue);
                setValues(prev => ({ ...prev, [field]: newValue }));
                setState({ loading: false, error: null });
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to update setting';
                setState({ loading: false, error: message });
            }
        });
    };

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-1.5 h-5 rounded-full bg-amber-400/60" />
                <h2 className="text-sm font-mono font-semibold text-white/80 tracking-wider uppercase">
                    Conference Settings
                </h2>
            </div>

            <div className="space-y-4">
                {/* Accepting Submissions Toggle */}
                <ToggleRow
                    label="Accepting Submissions"
                    description="Allow delegates to submit new resolutions"
                    value={values.accepting_submissions}
                    state={submissionsState}
                    onToggle={(v) => handleToggle('accepting_submissions', v, setSubmissionsState)}
                />

                {/* Accepting Amendments Toggle */}
                <ToggleRow
                    label="Accepting Amendments"
                    description="Allow delegates to propose amendments to floor resolutions"
                    value={values.accepting_amendments}
                    state={amendmentsState}
                    onToggle={(v) => handleToggle('accepting_amendments', v, setAmendmentsState)}
                />
            </div>
        </div>
    );
}

interface ToggleRowProps {
    label: string;
    description: string;
    value: boolean;
    state: ToggleState;
    onToggle: (newValue: boolean) => void;
}

function ToggleRow({ label, description, value, state, onToggle }: ToggleRowProps) {
    return (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-white/70 tracking-wide">{label}</p>
                <p className="text-xs text-white/30 mt-0.5">{description}</p>
                {state.error && (
                    <p className="text-xs text-red-400/80 font-mono mt-1.5">{state.error}</p>
                )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {state.loading && (
                    <span className="text-xs font-mono text-white/30 animate-pulse">saving…</span>
                )}
                <button
                    role="switch"
                    aria-checked={value}
                    aria-label={label}
                    disabled={state.loading}
                    onClick={() => onToggle(!value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                        value
                            ? 'bg-amber-400/80'
                            : 'bg-white/10 border border-white/20'
                    }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
                <span
                    className={`text-xs font-mono w-6 ${
                        value ? 'text-amber-400' : 'text-white/25'
                    }`}
                >
                    {value ? 'ON' : 'OFF'}
                </span>
            </div>
        </div>
    );
}
