'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function SetupPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const runSetup = async () => {
        setStatus('loading');
        try {
            const supabase = createClient();
            
            // 1. Check if we can sign up (might be disabled in Supabase)
            const email = 'admin@sismun.org';
            const password = 'password123';

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name: 'Secretary General' }
                }
            });

            if (error) throw error;

            setMessage('User created in Auth! Now please go to your Supabase SQL Editor and run the following command to make this user an SG:');
            setStatus('success');
            
            // Log the UUID for the user
            console.log('USER_ID:', data.user?.id);
        } catch (err: any) {
            setMessage(err.message);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-mono">
            <h1 className="text-xl font-bold mb-4 text-[#c9a84c]">EB Setup Utility</h1>
            <p className="text-sm text-zinc-400 mb-6">
                This utility will attempt to create the first admin account (`admin@sismun.org`).
            </p>

            {status === 'idle' && (
                <button
                    onClick={runSetup}
                    className="w-full py-2 bg-[#c9a84c] text-black font-bold rounded hover:bg-[#b89740] transition-colors"
                >
                    INITIALIZE ADMIN
                </button>
            )}

            {status === 'loading' && <p className="animate-pulse">Running setup...</p>}

            {status === 'success' && (
                <div className="space-y-4">
                    <p className="text-emerald-400">{message}</p>
                    <div className="p-4 bg-black rounded text-[10px] overflow-auto">
                        <pre>{`INSERT INTO public.eb_profiles (id, name, role) 
VALUES ('Check Browser Console for ID', 'SG', 'sg');`}</pre>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div>
                    <p className="text-red-400">Error: {message}</p>
                    <p className="mt-4 text-xs text-zinc-500">
                        If signups are disabled, you must create the user manually in the Supabase Dashboard > Auth tab.
                    </p>
                </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-zinc-800">
                <a href="/portal/login" className="text-xs text-[#c9a84c] hover:underline">← Back to Login</a>
            </div>
        </div>
    );
}
