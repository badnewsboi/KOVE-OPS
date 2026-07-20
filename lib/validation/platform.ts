export type PlatformResource = keyof typeof resourceRules;
type Rule = { required: readonly string[]; writable: readonly string[]; immutable?: boolean };

export const resourceRules = {
  customers: { required: ["organization_id", "customer_code", "name", "created_by"], writable: ["organization_id","customer_code","name","status","billing_address","shipping_address","billing_terms","notes","archived_at","created_by"] },
  customer_contacts: { required: ["organization_id", "customer_id", "name"], writable: ["organization_id","customer_id","name","title","email","phone","is_primary","archived_at"] },
  vendors: { required: ["organization_id", "vendor_code", "name", "created_by"], writable: ["organization_id","vendor_code","name","terms","status","notes","archived_at","created_by"] },
  vendor_contacts: { required: ["organization_id", "vendor_id", "name"], writable: ["organization_id","vendor_id","name","title","email","phone","is_primary","archived_at"] },
  facilities: { required: ["organization_id", "facility_code", "name"], writable: ["organization_id","facility_code","name","facility_type","address","timezone","status","archived_at"] },
  materials: { required: ["organization_id", "sku", "description", "unit"], writable: ["organization_id","sku","description","category","unit","cost","status","metadata","archived_at"] },
  orders: { required: ["organization_id","order_number","customer_id","facility_id","created_by"], writable: ["organization_id","order_number","customer_id","vendor_id","facility_id","created_by","priority","status","warehouse_status","requested_ship_date","release_date","notes","current_revision_number","archived_at"] },
  order_items: { required: ["organization_id","order_id","line_number","description","quantity","unit"], writable: ["organization_id","order_id","line_number","material_id","description","quantity","unit","unit_price","notes","archived_at"] },
  order_revisions: { required: ["organization_id","order_id","revision_number","reason","created_by"], writable: ["organization_id","order_id","revision_number","reason","requested_ship_date","release_date","notes","created_by","approved_by","approved_at","status"], immutable: true },
  revision_line_items: { required: ["organization_id","revision_id","line_number","description","quantity","unit"], writable: ["organization_id","revision_id","source_order_item_id","line_number","material_id","description","quantity","unit","unit_price","notes"], immutable: true },
  revision_differences: { required: ["organization_id","revision_id","difference_type"], writable: ["organization_id","revision_id","difference_type","line_number","field_name","previous_value","current_value"], immutable: true },
  approvals: { required: ["organization_id","revision_id","approver_id"], writable: ["organization_id","revision_id","approver_id","sequence_number","status","decision_at","comments"] },
  warehouse_events: { required: ["organization_id","order_id","facility_id","event_type","created_by"], writable: ["organization_id","order_id","facility_id","event_type","notes","occurred_at","created_by"], immutable: true },
  risk_events: { required: ["organization_id","severity","reason","created_by"], writable: ["organization_id","order_id","revision_id","severity","reason","status","resolution","resolved_by","resolved_at","created_by","archived_at"] },
  attachments: { required: ["organization_id","entity_type","entity_id","file_name","storage_path","uploaded_by"], writable: ["organization_id","entity_type","entity_id","file_name","storage_path","content_type","byte_size","checksum","metadata","uploaded_by","archived_at"] },
  comments: { required: ["organization_id","entity_type","entity_id","body","created_by"], writable: ["organization_id","entity_type","entity_id","parent_id","body","created_by","edited_at","archived_at"] },
  activity_events: { required: ["organization_id","entity_type","entity_id","event_type","summary"], writable: ["organization_id","entity_type","entity_id","event_type","summary","actor_id","metadata","occurred_at"], immutable: true },
  audit_logs: { required: [], writable: [], immutable: true },
} as const satisfies Record<string, Rule>;

function validationError(message: string, details?: unknown): never {
  throw Object.assign(new Error(message), { code: "VALIDATION_ERROR", details });
}

export function isPlatformResource(value: string): value is PlatformResource { return value in resourceRules; }

export function validatePayload(resource: PlatformResource, input: unknown, mode: "create" | "update") {
  if (!input || typeof input !== "object" || Array.isArray(input)) validationError("Request body must be a JSON object.");
  const record = input as Record<string, unknown>;
  const rule = resourceRules[resource];
  const unknown = Object.keys(record).filter((key) => !(rule.writable as readonly string[]).includes(key));
  if (unknown.length) validationError("Request contains unsupported fields.", { fields: unknown });
  if (mode === "create") {
    const missing = (rule.required as readonly string[]).filter((key) => record[key] === undefined || record[key] === null || record[key] === "");
    if (missing.length) validationError("Request is missing required fields.", { fields: missing });
  }
  if (mode === "update" && Object.keys(record).length === 0) validationError("At least one field is required.");
  return record;
}
