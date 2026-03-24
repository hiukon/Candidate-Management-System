// src/types/index.ts
export interface Candidate {
    id: string;
    user_id: string;
    full_name: string;
    applied_position: string;
    status: 'New' | 'Interviewing' | 'Hired' | 'Rejected';
    resume_url: string;
    skills: string[];
    matching_score: number;
    created_at: string;
    updated_at: string;
}

export interface JobRequirement {
    id: string;
    position: string;
    required_skills: string[];
    created_at: string;
}

export interface AnalyticsData {
    total_candidates: number;
    status_distribution: {
        New: number;
        Interviewing: number;
        Hired: number;
        Rejected: number;
    };
    top_positions: Array<{ position: string; count: number }>;
    new_candidates_last_7_days: number;
}

export interface FilterOptions {
    searchTerm?: string;
    position?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface CandidateFormData {
    full_name: string;
    applied_position: string;
    skills: string[];
    resume: File;
}