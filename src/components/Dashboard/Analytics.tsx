import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AnalyticsData, Candidate } from '../../types';

interface AnalyticsProps {
    candidates: Candidate[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ candidates }) => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [candidates]);

    const loadAnalytics = async () => {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('analytics');

        if (error) {
            console.error('Error loading analytics:', error);
        } else {
            setAnalytics(data);
        }
        setLoading(false);
    };

    if (loading || !analytics) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Candidates</h3>
                <p className="text-3xl font-bold text-gray-900">{analytics.total_candidates}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">New (7 days)</h3>
                <p className="text-3xl font-bold text-green-600">{analytics.new_candidates_last_7_days}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Hired Rate</h3>
                <p className="text-3xl font-bold text-blue-600">
                    {analytics.total_candidates > 0
                        ? Math.round((analytics.status_distribution.Hired / analytics.total_candidates) * 100)
                        : 0}%
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Interviewing</h3>
                <p className="text-3xl font-bold text-yellow-600">{analytics.status_distribution.Interviewing}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Top Positions</h3>
                <div className="space-y-2">
                    {analytics.top_positions.map((pos, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">{pos.position}</span>
                            <span className="text-sm font-semibold text-gray-900">{pos.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status Distribution</h3>
                <div className="space-y-2">
                    {Object.entries(analytics.status_distribution).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">{status}</span>
                            <div className="flex-1 mx-4">
                                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded"
                                        style={{ width: `${analytics.total_candidates > 0 ? (count / analytics.total_candidates) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};