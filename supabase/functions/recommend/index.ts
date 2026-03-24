// supabase/functions/recommend/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('No authorization header', { status: 401 });
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { position } = await req.json();

        // Get job requirements
        const { data: jobReq } = await supabaseClient
            .from('job_requirements')
            .select('required_skills')
            .eq('position', position)
            .single();

        if (!jobReq) {
            return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
        }

        // Get all candidates
        const { data: candidates } = await supabaseClient
            .from('candidates')
            .select('*');

        // Calculate matching score and sort
        const recommended = candidates
            ?.map(candidate => {
                const matchedSkills = candidate.skills.filter((skill: string) =>
                    jobReq.required_skills.includes(skill)
                );
                const score = Math.floor((matchedSkills.length / jobReq.required_skills.length) * 100);
                return { ...candidate, matching_score: score };
            })
            .sort((a, b) => b.matching_score - a.matching_score)
            .slice(0, 3);

        return new Response(
            JSON.stringify(recommended),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});