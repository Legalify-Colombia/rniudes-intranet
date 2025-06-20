

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Campus, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useCampus() {
  const fetchCampus = async (): Promise<Result<Campus[]>> => {
    const { data, error } = await supabase.from("campus").select("*").order("name");
    return { data, error };
  };

  const createCampus = async (campus: Database["public"]["Tables"]["campus"]["Insert"]): Promise<Result<Campus>> => {
    const { data, error } = await supabase.from("campus").insert(campus).select().single();
    return { data, error };
  };

  const updateCampus = async (id: string, updates: Database["public"]["Tables"]["campus"]["Update"]): Promise<Result<Campus>> => {
    const { data, error } = await supabase.from("campus").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteCampus = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("campus").delete().eq("id", id);
    return { data, error };
  };

  const getUserManagedCampus = async (userId: string): Promise<Result<any>> => {
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("managed_campus_ids, campus_id")
      .eq("id", userId)
      .single();

    if (profileError) return { data: null, error: profileError };

    return { 
      data: {
        managed_campus_ids: userProfile.managed_campus_ids || [],
        campus_id: userProfile.campus_id
      }, 
      error: null 
    };
  };

  return {
    fetchCampus,
    createCampus,
    updateCampus,
    deleteCampus,
    getUserManagedCampus,
  };
}

