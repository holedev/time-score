import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./client";

let supabase: SupabaseClient | null = null;

const getSingletonSupbaseClient = () => {
  if (supabase) {
    return supabase;
  }

  supabase = createClient();
  return supabase;
};

export { getSingletonSupbaseClient };
