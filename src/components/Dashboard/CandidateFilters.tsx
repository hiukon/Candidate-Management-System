// src/components/Dashboard/CandidateFilters.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FilterOptions } from '../../types';

interface CandidateFiltersProps {
    onFilterChange: (filters: FilterOptions) => void;
}

export const CandidateFilters: React.FC<CandidateFiltersProps> = ({ onFilterChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [position, setPosition] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [positions, setPositions] = useState<string[]>([]);

    useEffect(() => {
        loadPositions();
    }, []);

    useEffect(() => {
        onFilterChange({
            searchTerm,
            position: position || undefined,
            status: status || undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });
    }, [searchTerm, position, status, startDate, endDate]);

    const loadPositions = async () => {
        const { data } = await supabase
            .from('job_requirements')
            .select('position');

        if (data) {
            setPositions(['all', ...data.map(j => j.position)]);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                    type="text"
                    placeholder="Search by name, position, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
                >
                    {positions.map(pos => (
                        <option key={pos} value={pos === 'all' ? '' : pos}>
                            {pos === 'all' ? 'All Positions' : pos}
                        </option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
                >
                    <option value="">All Status</option>
                    <option value="New">New</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                </select>

                <input
                    type="date"
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
                />

                <input
                    type="date"
                    placeholder="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none"
                />
            </div>
        </div>
    );
};