import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/database/types";
import type { PlatformResource } from "@/lib/validation/platform";

export type ListOptions = { limit?: number; offset?: number; includeArchived?: boolean; filters?: Record<string, string> };
const archivable = new Set<PlatformResource>(["customers","customer_contacts","vendors","vendor_contacts","facilities","materials","orders","order_items","risk_events","attachments","comments"]);

export class PlatformRepository {
  constructor(private readonly client: SupabaseClient<Database>, readonly table: PlatformResource) {}
  async list(organizationId: string, options: ListOptions = {}) {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 200), offset = Math.max(options.offset ?? 0, 0);
    let query = this.client.from(this.table).select("*").eq("organization_id", organizationId).range(offset, offset + limit - 1);
    if (!options.includeArchived && archivable.has(this.table)) query = query.is("archived_at", null);
    for (const [column, value] of Object.entries(options.filters ?? {})) query = query.eq(column, value);
    const { data, error } = await query.order("created_at", { ascending: false }); if (error) throw error; return data;
  }
  async get(organizationId: string, id: string) { const { data, error } = await this.client.from(this.table).select("*").eq("organization_id", organizationId).eq("id", id).single(); if (error) throw error; return data; }
  async create(values: Record<string, unknown>) { const { data, error } = await this.client.from(this.table).insert(values as never).select("*").single(); if (error) throw error; return data; }
  async update(organizationId: string, id: string, values: Record<string, unknown>) { const { data, error } = await this.client.from(this.table).update(values as never).eq("organization_id", organizationId).eq("id", id).select("*").single(); if (error) throw error; return data; }
  async archive(organizationId: string, id: string) { return this.update(organizationId, id, { archived_at: new Date().toISOString() }); }
}
