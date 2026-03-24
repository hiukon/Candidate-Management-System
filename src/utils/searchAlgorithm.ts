// src/utils/searchAlgorithm.ts
import { Candidate, FilterOptions } from '../types';

export function searchAndFilterCandidates(
    candidates: Candidate[],
    filters: FilterOptions
): Candidate[] {
    let filtered = [...candidates];

    // Full-text search
    if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchTerm = filters.searchTerm.toLowerCase().trim();
        filtered = filtered.filter(candidate => {
            // Calculate relevance score
            const nameMatch = candidate.full_name.toLowerCase().includes(searchTerm);
            const positionMatch = candidate.applied_position.toLowerCase().includes(searchTerm);
            const skillsMatch = candidate.skills.some(skill =>
                skill.toLowerCase().includes(searchTerm)
            );

            return nameMatch || positionMatch || skillsMatch;
        });
    }

    // Filter by position
    if (filters.position && filters.position !== 'all') {
        filtered = filtered.filter(c => c.applied_position === filters.position);
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(c => c.status === filters.status);
    }

    // Filter by date range
    if (filters.startDate) {
        filtered = filtered.filter(c => new Date(c.created_at) >= filters.startDate!);
    }
    if (filters.endDate) {
        filtered = filtered.filter(c => new Date(c.created_at) <= filters.endDate!);
    }

    // Sort by matching score (if available) or created date
    return filtered.sort((a, b) => {
        if (a.matching_score !== b.matching_score) {
            return b.matching_score - a.matching_score;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}