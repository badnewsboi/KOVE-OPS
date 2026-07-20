import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./server";

export type RoleKey = "owner" | "administrator" | "operations_manager" | "order_coordinator" | "warehouse" | "finance" | "viewer";

export async function isOrganizationMember(organizationId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("organization_members").select("id")
    .eq("organization_id", organizationId).eq("profile_id", user.sub)
    .eq("active", true).not("accepted_at", "is", null).maybeSingle();
  return Boolean(data);
}

export async function hasRole(organizationId: string, roles: RoleKey[]) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: membership } = await supabase.from("organization_members").select("role_id")
    .eq("organization_id", organizationId).eq("profile_id", user.sub)
    .eq("active", true).not("accepted_at", "is", null).maybeSingle();
  if (!membership) return false;
  const { data: role } = await supabase.from("roles").select("key")
    .eq("id", membership.role_id).maybeSingle();
  return Boolean(role?.key && roles.includes(role.key as RoleKey));
}

export const isOwner = (organizationId: string) => hasRole(organizationId, ["owner"]);
export const isAdministrator = (organizationId: string) => hasRole(organizationId, ["owner", "administrator"]);
export const canManageUsers = isAdministrator;
