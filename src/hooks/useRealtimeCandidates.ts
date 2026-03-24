// src/hooks/useRealtimeCandidates.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Candidate } from '../types';

export const useRealtimeCandidates = (userId: string | undefined) => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        // Initial load
        loadCandidates();

        // Realtime subscription
        const subscription = supabase
            .channel('candidates_channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'candidates',
                filter: `user_id=eq.${userId}`
            }, () => {
                loadCandidates();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [userId]);

    const loadCandidates = async () => {
        const { data, error } = await supabase
            .from('candidates')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setCandidates(data);
        }
        setLoading(false);
    };

    return { candidates, loading, refresh: loadCandidates };
};