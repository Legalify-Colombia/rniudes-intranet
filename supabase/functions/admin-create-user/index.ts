import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  document_number?: string;
  position: string;
  role: string;
  weekly_hours?: number;
  number_of_weeks?: number;
  total_hours?: number;
  campus_id?: string;
  faculty_id?: string;
  program_id?: string;
  managed_campus_ids?: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create client for current user validation
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Set the auth header for the client
    supabaseClient.auth.setAuth(authorization.replace('Bearer ', ''))

    // Verify the user is an administrator
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'Administrador') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const requestData: CreateUserRequest = await req.json()

    // Validate required fields
    if (!requestData.email || !requestData.password || !requestData.full_name || !requestData.position) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user using admin client
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: requestData.email,
      password: requestData.password,
      email_confirm: true,
      user_metadata: {
        full_name: requestData.full_name
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert profile data
    const profileData = {
      id: userData.user.id,
      full_name: requestData.full_name,
      document_number: requestData.document_number || null,
      position: requestData.position,
      role: requestData.role,
      weekly_hours: requestData.weekly_hours || null,
      number_of_weeks: requestData.number_of_weeks || 16,
      total_hours: requestData.total_hours || null,
      campus_id: requestData.campus_id || null,
      faculty_id: requestData.faculty_id || null,
      program_id: requestData.program_id || null,
      managed_campus_ids: requestData.role === 'Administrador' ? requestData.managed_campus_ids : null
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // If profile creation fails, delete the user
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If this is a Director de Programa, update the academic program
    if (requestData.position === 'Director de Programa' && requestData.program_id) {
      const { error: programError } = await supabaseAdmin
        .from('academic_programs')
        .update({ coordinador_id: userData.user.id })
        .eq('id', requestData.program_id)

      if (programError) {
        console.error('Error updating program coordinator:', programError)
        // Don't fail the user creation for this, just log the error
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData.user,
        message: 'User created successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})