'use client';

import { createClient } from '@/lib/supabase-browser';
import { useEffect, useState } from 'react';

export default function EBStats({ profile }: { profile: any }) {
    const [stats, setStats] = useState({
        total_resolutions: 0,
        floor_resolutions: 0,
        total_amendments: 0,
        pending_amendments: 0,
    });
    const supabase = createClient();

    useEffect(() => {
        const fetchStats = async () => {
            const committeeFilter = profile.committee_slug;
            
            const [resAll, resFloor, amdAll, amdPending] = await Promise.all([
                supabase.from('resolutions').select('*', { count: 'exact', head: true }).eq('is_deleted', false).filter('committee_slug', committeeFilter ? 'eq' : 'neq', committeeFilter ?? ''),
                supabase.from('resolutions').select('*', { count: 'exact', head: true }).eq('status', 'floor').eq('is_deleted', false).filter('committee_slug', committeeFilter ? 'eq' : 'neq', committeeFilter ?? ''),
                supabase.from('amendments').select('*', { count: 'exact', head: true }).eq('is_deleted', false).filter('committee_slug', committeeFilter ? 'eq' : 'neq', committeeFilter ?? ''),
                supabase.from('amendments').select('*', { count: 'exact', head: true }).eq('vote_status', 'pending').eq('is_deleted', false).filter('committee_slug', committeeFilter ? 'eq' : 'neq', committeeFilter ?? ''),
            ]);

            setStats({
                total_resolutions: resAll.count ?? 0,
                floor_resolutions: resFloor.count ?? 0,
                total_amendments: amdAll.count ?? 0,
                pending_amendments: amdPending.count ?? 0,
            });
        };

        fetchStats();

        // Subscribe to changes
        const resChannel = supabase.channel('stats-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'resolutions' }, () => fetchStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'amendments' }, () => fetchStats())
            .subscribe();

        return () => {
            supabase.removeChannel(resChannel);
        };
    }, [profile.committee_slug]);

    const cards = [
        { label: 'Total Resolutions', value: stats.total_resolutions, color: 'text-white' },
        { label: 'On Floor', value: stats.floor_resolutions, color: 'text-emerald-400' },
        { label: 'Total Amendments', value: stats.total_amendments, color: 'text-white' },
        { label: 'Pending Review', value: stats.pending_amendments, color: stats.pending_amendments > 0 ? 'text-amber-400' : 'text-white/40' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 shadow-sm">
                    <div className="text-[10px] font-mono text-white/25 tracking-widest uppercase mb-1">
                        {card.label}
                    </div>
                    <div className={`text-2xl font-bold font-mono ${card.color}`}>
                        {card.value.toString().padStart(2, '0')}
                    </div>
                </div>
            ))}
        </div>
    );
}
