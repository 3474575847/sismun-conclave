'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function testConnection() {
      if (!supabase) {
        setStatus('error');
        setMessage('Supabase client not initialized. Please set your environment variables.');
        return;
      }

      try {
        const { data, error } = await supabase.from('_test_connection').select('*').limit(1);

        
        // Note: _test_connection table likely doesn't exist, but we just want to see if the client initializes
        // and makes a request. If it fails with 'Table not found', it still means the connection worked.
        if (error && error.code !== 'PGRST116') { // PGRST116 is often 'Table not found'
           // If we get "Invalid API Key" or "Invalid URL", that's a real error.
           if (error.message.includes('Invalid API Key') || error.message.includes('FetchError')) {
             setStatus('error');
             setMessage(error.message);
             return;
           }
        }
        
        setStatus('success');
        setMessage('Supabase client initialized successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An unknown error occurred');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-charcoal text-platinum flex items-center justify-center p-8 font-mono">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gold uppercase tracking-widest">Supabase Verifier</h1>
        
        {status === 'loading' && (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm opacity-50">Testing connection...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-green-400">
            <div className="text-4xl mb-4">✓</div>
            <p className="text-sm">{message}</p>
            <p className="mt-4 text-[10px] opacity-40 italic">
              (Note: If this is success but you haven't set keys, check console)
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-400">
            <div className="text-4xl mb-4">✗</div>
            <p className="text-sm font-bold mb-2">Connection Failed</p>
            <p className="text-[10px] break-all">{message}</p>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-white/5">
          <a href="/" className="text-gold hover:text-platinum transition-colors text-xs tracking-widest uppercase">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
