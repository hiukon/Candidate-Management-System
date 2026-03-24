import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log('=== add-candidate START ===')

        const authHeader = req.headers.get('Authorization')
        console.log('Auth header present:', !!authHeader)

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Get user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        console.log('User error:', userError)
        console.log('User found:', !!user)

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const candidateData = await req.json()
        console.log('Candidate data:', candidateData)

        // Validate input
        if (!candidateData.full_name || !candidateData.applied_position) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get job requirements
        const { data: jobReq, error: jobError } = await supabaseClient
            .from('job_requirements')
            .select('required_skills')
            .eq('position', candidateData.applied_position)
            .single()

        console.log('Job requirements:', jobReq)
        console.log('Job error:', jobError)

        // Calculate matching score
        let matchingScore = 0
        if (jobReq && candidateData.skills) {
            const requiredSkills = jobReq.required_skills
            const matchedSkills = candidateData.skills.filter((skill: string) =>
                requiredSkills.includes(skill)
            )
            matchingScore = Math.floor((matchedSkills.length / requiredSkills.length) * 100)
        }
        console.log('Matching score:', matchingScore)

        // Insert candidate
        const { data: candidate, error: insertError } = await supabaseClient
            .from('candidates')
            .insert({
                user_id: user.id,
                full_name: candidateData.full_name,
                applied_position: candidateData.applied_position,
                skills: candidateData.skills,
                resume_url: candidateData.resume_url,
                matching_score: matchingScore,
                status: 'New'
            })
            .select()
            .single()

        console.log('Insert error:', insertError)
        console.log('Inserted candidate:', candidate)

        if (insertError) {
            return new Response(
                JSON.stringify({ error: insertError.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('=== add-candidate SUCCESS ===')
        return new Response(
            JSON.stringify(candidate),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Function error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})