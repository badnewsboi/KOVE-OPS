import type { SupabaseClient } from "@supabase/supabase-js"; import type { Database } from "@/database/types"; import { PlatformRepository } from "./platform-repository";
export const activityRepository = (client: SupabaseClient<Database>) => new PlatformRepository(client, "activity_events");
