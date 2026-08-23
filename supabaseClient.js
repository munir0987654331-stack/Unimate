import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://canbdquqohdtvxuuwlyf.supabase.co";
const supabaseKey = "sb_publishable_FdqYE6p7zUaWInt8vJsnTw_ND0w9JN3";

export const supabase = createClient(supabaseUrl, supabaseKey);
