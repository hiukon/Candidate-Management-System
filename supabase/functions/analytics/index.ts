import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log('=== Analytics Function Started ===')

        // Get authorization header
        const authHeader = req.headers.get('Authorization')
        console.log('Auth header present:', !!authHeader)

        if (!authHeader) {
            console.log('No auth header')
            return new Response(
                JSON.stringify({ error: 'No authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        console.log('Supabase URL exists:', !!supabaseUrl)
        console.log('Anon key exists:', !!supabaseAnonKey)

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        // Get authenticated user
        console.log('Getting user...')
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError) {
            console.error('User error:', userError)
            return new Response(
                JSON.stringify({ error: 'Unauthorized', details: userError.message }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!user) {
            console.log('No user found')
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('User authenticated:', user.id)

        // Fetch all candidates for this user
        console.log('Fetching candidates...')
        const { data: candidates, error: candidatesError } = await supabaseClient
            .from('candidates')
            .select('status, applied_position, created_at, matching_score')
            .eq('user_id', user.id)

        if (candidatesError) {
            console.error('Error fetching candidates:', candidatesError)
            return new Response(
                JSON.stringify({ error: candidatesError.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('Candidates found:', candidates?.length || 0)

        // Calculate analytics
        const totalCandidates = candidates?.length || 0

        // Status distribution
        const statusDistribution = {
            New: 0,
            Interviewing: 0,
            Hired: 0,
            Rejected: 0
        }

        // Position count
        const positionCount: Record<string, number> = {}

        // New candidates in last 7 days
        let newCandidatesLast7Days = 0
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        candidates?.forEach(candidate => {
            // Count by status
            if (candidate.status === 'New') statusDistribution.New++
            else if (candidate.status === 'Interviewing') statusDistribution.Interviewing++
            else if (candidate.status === 'Hired') statusDistribution.Hired++
            else if (candidate.status === 'Rejected') statusDistribution.Rejected++

            // Count by position
            positionCount[candidate.applied_position] = (positionCount[candidate.applied_position] || 0) + 1

            // Count new candidates in last 7 days
            const createdAt = new Date(candidate.created_at)
            if (createdAt >= sevenDaysAgo) {
                newCandidatesLast7Days++
            }
        })

        // Get top 3 positions
        const topPositions = Object.entries(positionCount)
            .map(([position, count]) => ({ position, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)

        // Calculate hired rate
        const hiredRate = totalCandidates > 0
            ? Math.round((statusDistribution.Hired / totalCandidates) * 100)
            : 0

        const result = {
            total_candidates: totalCandidates,
            status_distribution: statusDistribution,
            top_positions: topPositions,
            new_candidates_last_7_days: newCandidatesLast7Days,
            hired_rate: hiredRate
        }

        console.log('Analytics result:', result)

        return new Response(
            JSON.stringify(result),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Function error:', error)
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                details: error.message
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})