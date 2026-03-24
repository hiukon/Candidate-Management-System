import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { JobRequirement } from '../../types';

interface CandidateFormProps {
    onSubmit: (data: any) => Promise<void>;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        applied_position: '',
        skills: '',
        resume: null as File | null
    });
    const [positions, setPositions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPositions();
    }, []);

    const loadPositions = async () => {
        const { data } = await supabase
            .from('job_requirements')
            .select('position');

        if (data) {
            setPositions(data.map(j => j.position));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.resume) {
            alert('Please upload a resume');
            return;
        }

        setLoading(true);
        await onSubmit(formData);
        setLoading(false);

        // Reset form
        setFormData({
            full_name: '',
            applied_position: '',
            skills: '',
            resume: null
        });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Add New Candidate</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Applied Position *
                    </label>
                    <select
                        value={formData.applied_position}
                        onChange={(e) => setFormData({ ...formData, applied_position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select a position</option>
                        {positions.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Skills (comma separated)
                    </label>
                    <input
                        type="text"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        placeholder="React, TypeScript, Node.js"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Resume (PDF) *
                    </label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFormData({ ...formData, resume: e.target.files?.[0] || null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {loading ? 'Adding...' : 'Add Candidate'}
                </button>
            </form>
        </div>
    );
};