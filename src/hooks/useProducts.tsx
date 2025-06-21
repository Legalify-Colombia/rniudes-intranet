
import { supabase } from "@/integrations/supabase/client";
import type { Product, Result } from "@/types/supabase";
import type { Database } from "@/integrations/supabase/types";

export function useProducts() {
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
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
