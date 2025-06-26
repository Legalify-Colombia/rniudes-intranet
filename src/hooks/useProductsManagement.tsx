
import { supabase } from "@/integrations/supabase/client";
import type { Result } from "@/types/supabase";

export function useProductsManagement() {
  const fetchProducts = async (): Promise<Result<any[]>> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at");
    return { data, error };
  };

  const createProduct = async (product: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();
    return { data, error };
  };

  const updateProduct = async (id: string, updates: any): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  };

  const deleteProduct = async (id: string): Promise<Result<any>> => {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    return { data, error };
  };

  return {
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
}
