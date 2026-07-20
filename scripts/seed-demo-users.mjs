import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const password = process.env.KOVE_DEMO_PASSWORD;
if (!url || !secretKey || !password || password.length < 12) {
  throw new Error("Set SUPABASE_SECRET_KEY and a KOVE_DEMO_PASSWORD of at least 12 characters in .env.local.");
}

const organizationId = "20000000-0000-4000-8000-000000000001";
const users = [
  ["owner", "Olivia", "Reed", "President"],
  ["administrator", "Adrian", "Cole", "Systems Administrator"],
  ["operations_manager", "Morgan", "Diaz", "Operations Manager"],
  ["order_coordinator", "Casey", "Nguyen", "Order Coordinator"],
  ["warehouse", "Wes", "Brooks", "Warehouse Lead"],
  ["finance", "Farah", "Patel", "Finance Manager"],
  ["viewer", "Victor", "Stone", "Executive Observer"],
];
const supabase = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: roles, error: rolesError } = await supabase.from("roles").select("id,key");
if (rolesError) throw rolesError;
const roleIds = new Map(roles.map((role) => [role.key, role.id]));
const { data: existing, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;

for (const [roleKey, firstName, lastName, jobTitle] of users) {
  const email = `demo.${roleKey}@koveops.example`;
  let user = existing.users.find((candidate) => candidate.email === email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, job_title: jobTitle },
      app_metadata: { organization_id: organizationId, role_key: roleKey },
    });
    if (error) throw error;
    user = data.user;
  }
  if (!user) throw new Error(`Unable to provision ${email}.`);
  const roleId = roleIds.get(roleKey);
  if (!roleId) throw new Error(`Missing role ${roleKey}.`);
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id, organization_id: organizationId, first_name: firstName,
    last_name: lastName, email, job_title: jobTitle,
  });
  if (profileError) throw profileError;

  const { data: existingMembership, error: membershipLookupError } = await supabase
    .from("organization_members")
    .select("invited_at")
    .eq("organization_id", organizationId)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (membershipLookupError) throw membershipLookupError;
  const invitedAt = existingMembership?.invited_at ?? new Date().toISOString();

  const { error: membershipError } = await supabase.from("organization_members").upsert({
    organization_id: organizationId, profile_id: user.id, role_id: roleId,
    invited_at: invitedAt, accepted_at: invitedAt, active: true,
  }, { onConflict: "organization_id,profile_id" });
  if (membershipError) throw membershipError;
  console.log(`Provisioned ${email} as ${roleKey}.`);
}
