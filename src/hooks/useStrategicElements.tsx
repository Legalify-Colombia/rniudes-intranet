
import { supabase } from "@/integrations/supabase/client";
import type { StrategicAxis, Action, Product, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useStrategicElements() {
  // Strategic Axes
  const fetchStrategicAxes = async (): Promise<Result<StrategicAxis[]>> => {
    const { data, error } = await supabase.from("strategic_axes").select("*").order("name");
    return { data, error };
  };

  const createStrategicAxis = async (axis: Database["public"]["Tables"]["strategic_axes"]["Insert"]): Promise<Result<StrategicAxis>> => {
    const { data, error } = await supabase.from("strategic_axes").insert(axis).select().single();
    return { data, error };
  };

  const updateStrategicAxis = async (id: string, updates: Database["public"]["Tables"]["strategic_axes"]["Update"]): Promise<Result<StrategicAxis>> => {
    const { data, error } = await supabase.from("strategic_axes").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteStrategicAxis = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("strategic_axes").delete().eq("id", id);
    return { data, error };
  };

  // Actions
  const fetchActions = async (): Promise<Result<Action[]>> => {
    const { data, error } = await supabase.from("actions").select("*").order("name");
    return { data, error };
  };

  const createAction = async (action: Database["public"]["Tables"]["actions"]["Insert"]): Promise<Result<Action>> => {
    const { data, error } = await supabase.from("actions").insert(action).select().single();
    return { data, error };
  };

  const updateAction = async (id: string, updates: Database["public"]["Tables"]["actions"]["Update"]): Promise<Result<Action>> => {
    const { data, error } = await supabase.from("actions").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteAction = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("actions").delete().eq("id", id);
    return { data, error };
  };

  // Products
  const fetchProducts = async (): Promise<Result<Product[]>> => {
    const { data, error } = await supabase.from("products").select("*").order("name");
    return { data, error };
  };

  const createProduct = async (product: Database["public"]["Tables"]["products"]["Insert"]): Promise<Result<Product>> => {
    const { data, error } = await supabase.from("products").insert(product).select().single();
    return { data, error };
  };

  const updateProduct = async (id: string, updates: Database["public"]["Tables"]["products"]["Update"]): Promise<Result<Product>> => {
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
    return { data, error };
  };

  const deleteProduct = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase.from("products").delete().eq("id", id);
    return { data, error };
  };

  return {
    // Strategic Axes
    fetchStrategicAxes,
    createStrategicAxis,
    updateStrategicAxis,
    deleteStrategicAxis,
    // Actions
    fetchActions,
    createAction,
    updateAction,
    deleteAction,
    // Products
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
