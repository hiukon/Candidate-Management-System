// supabase/functions/analytics/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Log request info
    console.log('Method:', req.method)
    console.log('URL:', req.url)
    console.log('Headers:', Object.fromEntries(req.headers.entries()))

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        console.log('Auth header present:', !!authHeader)

        if (!authHeader) {
            console.log('No auth header')
            return new Response(
                JSON.stringify({ error: 'No authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Log token (chỉ log 20 ký tự đầu)
        const token = authHeader.replace('Bearer ', '')
        console.log('Token (first 20 chars):', token.substring(0, 20))

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Verify user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError) {
            console.log('User error:', userError)
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

        // Get analytics data
        const { count: totalCandidates } = await supabaseClient
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        const { data: statusData } = await supabaseClient
            .from('candidates')
            .select('status')
            .eq('user_id', user.id)

        const statusDistribution = { New: 0, Interviewing: 0, Hired: 0, Rejected: 0 }
        statusData?.forEach(c => {
            statusDistribution[c.status as keyof typeof statusDistribution]++
        })

        const { data: positionsData } = await supabaseClient
            .from('candidates')
            .select('applied_position')
            .eq('user_id', user.id)

        const positionCount: Record<string, number> = {}
        positionsData?.forEach(p => {
            positionCount[p.applied_position] = (positionCount[p.applied_position] || 0) + 1
        })

        const topPositions = Object.entries(positionCount)
            .map(([position, count]) => ({ position, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { count: newCandidates } = await supabaseClient
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', sevenDaysAgo.toISOString())

        const result = {
            total_candidates: totalCandidates || 0,
            status_distribution: statusDistribution,
            top_positions: topPositions,
            new_candidates_last_7_days: newCandidates || 0
        }

        console.log('Returning result:', result)

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})