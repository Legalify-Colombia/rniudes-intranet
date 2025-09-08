import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Admin client (service role)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Authenticated user client (uses caller's JWT via global header)
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify current user
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData?.user) {
      console.error("auth.getUser error", userError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure caller is Administrator
    const { data: callerProfile, error: callerProfileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (callerProfileError || !callerProfile || callerProfile.role !== "Administrador") {
      console.error("permission check failed", callerProfileError, callerProfile);
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse body
    const body: CreateUserRequest = await req.json();

    if (!body.email || !body.password || !body.full_name || !body.position) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { full_name: body.full_name },
    });

    if (createError || !created?.user) {
      console.error("createUser error", createError);
      return new Response(JSON.stringify({ error: createError?.message ?? "Failed to create user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert profile row
    const profileInsert = {
      id: created.user.id,
      full_name: body.full_name,
      document_number: body.document_number ?? null,
      email: body.email,
      position: body.position,
      role: body.role,
      weekly_hours: body.weekly_hours ?? null,
      number_of_weeks: body.number_of_weeks ?? 16,
      total_hours: body.total_hours ?? null,
      campus_id: body.campus_id ?? null,
      faculty_id: body.faculty_id ?? null,
      program_id: body.program_id ?? null,
      managed_campus_ids: body.role === "Administrador" ? body.managed_campus_ids ?? null : null,
    } as const;

    const { error: insertProfileError } = await supabaseAdmin.from("profiles").insert(profileInsert);
    if (insertProfileError) {
      console.error("profile insert error", insertProfileError);
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return new Response(JSON.stringify({ error: "Failed to create user profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update academic_programs.coordinador_id if program director
    if (body.position === "Director de Programa" && body.program_id) {
      const { error: updateProgramError } = await supabaseAdmin
        .from("academic_programs")
        .update({ coordinador_id: created.user.id })
        .eq("id", body.program_id);
      if (updateProgramError) {
        console.error("update program coordinator error", updateProgramError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, user: created.user, message: "User created successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error in admin-create-user:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});