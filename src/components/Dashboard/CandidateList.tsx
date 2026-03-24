import React from 'react';
import { Candidate } from '../../types';

interface CandidateListProps {
    candidates: Candidate[];
    onUpdateStatus: (id: string, status: string) => void;
    onDelete: (id: string) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({
    candidates,
    onUpdateStatus,
    onDelete
}) => {
    // console.log('CandidateList received:', candidates);
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-800';
            case 'Interviewing': return 'bg-yellow-100 text-yellow-800';
            case 'Hired': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (candidates.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No candidates found
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Skills
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Match Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resume
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {candidates.map((candidate) => (
                            <tr key={candidate.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {candidate.full_name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {candidate.applied_position}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {candidate.skills?.slice(0, 3).map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {candidate.skills?.length > 3 && (
                                            <span className="px-2 py-1 text-xs text-gray-500">
                                                +{candidate.skills.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold">
                                        <span className={`px-2 py-1 rounded ${candidate.matching_score >= 80 ? 'bg-green-100 text-green-800' :
                                            candidate.matching_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {candidate.matching_score}%
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={candidate.status}
                                        onChange={(e) => onUpdateStatus(candidate.id, e.target.value)}
                                        className={`px-2 py-1 text-xs rounded border ${getStatusColor(candidate.status)}`}
                                    >
                                        <option value="New">New</option>
                                        <option value="Interviewing">Interviewing</option>
                                        <option value="Hired">Hired</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {candidate.resume_url && (
                                        <a
                                            href={candidate.resume_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            View CV
                                        </a>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => onDelete(candidate.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};