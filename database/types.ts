export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          metadata: Json
          occurred_at: string
          organization_id: string
          summary: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json
          occurred_at?: string
          organization_id: string
          summary: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          organization_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          approver_id: string
          comments: string | null
          created_at: string
          decision_at: string | null
          id: string
          organization_id: string
          revision_id: string
          sequence_number: number
          status: string
          updated_at: string
        }
        Insert: {
          approver_id: string
          comments?: string | null
          created_at?: string
          decision_at?: string | null
          id?: string
          organization_id: string
          revision_id: string
          sequence_number?: number
          status?: string
          updated_at?: string
        }
        Update: {
          approver_id?: string
          comments?: string | null
          created_at?: string
          decision_at?: string | null
          id?: string
          organization_id?: string
          revision_id?: string
          sequence_number?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "order_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          archived_at: string | null
          byte_size: number
          checksum: string | null
          content_type: string | null
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          id: string
          metadata: Json
          organization_id: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          archived_at?: string | null
          byte_size?: number
          checksum?: string | null
          content_type?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          id?: string
          metadata?: Json
          organization_id: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          archived_at?: string | null
          byte_size?: number
          checksum?: string | null
          content_type?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          id?: string
          metadata?: Json
          organization_id?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          id: string
          new_data: Json | null
          occurred_at: string
          old_data: Json | null
          organization_id: string
          record_id: string
          table_name: string
          transaction_id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          id?: string
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          organization_id: string
          record_id: string
          table_name: string
          transaction_id?: number
        }
        Update: {
          action?: string
          actor_id?: string | null
          id?: string
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          organization_id?: string
          record_id?: string
          table_name?: string
          transaction_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          archived_at: string | null
          body: string
          created_at: string
          created_by: string
          edited_at: string | null
          entity_id: string
          entity_type: string
          id: string
          organization_id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          body: string
          created_at?: string
          created_by: string
          edited_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          organization_id: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          body?: string
          created_at?: string
          created_by?: string
          edited_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          organization_id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          archived_at: string | null
          created_at: string
          customer_id: string
          email: string | null
          id: string
          is_primary: boolean
          name: string
          organization_id: string
          phone: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          customer_id: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          organization_id: string
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          customer_id?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          organization_id?: string
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          archived_at: string | null
          billing_address: Json
          billing_terms: string | null
          created_at: string
          created_by: string
          customer_code: string
          id: string
          name: string
          notes: string | null
          organization_id: string
          shipping_address: Json
          status: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          billing_address?: Json
          billing_terms?: string | null
          created_at?: string
          created_by: string
          customer_code: string
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          shipping_address?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          billing_address?: Json
          billing_terms?: string | null
          created_at?: string
          created_by?: string
          customer_code?: string
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          shipping_address?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          address: Json
          archived_at: string | null
          created_at: string
          facility_code: string
          facility_type: string
          id: string
          name: string
          organization_id: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: Json
          archived_at?: string | null
          created_at?: string
          facility_code: string
          facility_type?: string
          id?: string
          name: string
          organization_id: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: Json
          archived_at?: string | null
          created_at?: string
          facility_code?: string
          facility_type?: string
          id?: string
          name?: string
          organization_id?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          archived_at: string | null
          category: string | null
          cost: number
          created_at: string
          description: string
          id: string
          metadata: Json
          organization_id: string
          sku: string
          status: string
          unit: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          category?: string | null
          cost?: number
          created_at?: string
          description: string
          id?: string
          metadata?: Json
          organization_id: string
          sku: string
          status?: string
          unit: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          category?: string | null
          cost?: number
          created_at?: string
          description?: string
          id?: string
          metadata?: Json
          organization_id?: string
          sku?: string
          status?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string
          id: string
          line_number: number
          material_id: string | null
          notes: string | null
          order_id: string
          organization_id: string
          quantity: number
          unit: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description: string
          id?: string
          line_number: number
          material_id?: string | null
          notes?: string | null
          order_id: string
          organization_id: string
          quantity: number
          unit: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string
          id?: string
          line_number?: number
          material_id?: string | null
          notes?: string | null
          order_id?: string
          organization_id?: string
          quantity?: number
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_revisions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          id: string
          notes: string | null
          order_id: string
          organization_id: string
          reason: string
          release_date: string | null
          requested_ship_date: string | null
          revision_number: number
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          order_id: string
          organization_id: string
          reason: string
          release_date?: string | null
          requested_ship_date?: string | null
          revision_number: number
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          order_id?: string
          organization_id?: string
          reason?: string
          release_date?: string | null
          requested_ship_date?: string | null
          revision_number?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_revisions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_revisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_revisions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_revisions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          current_revision_number: number
          customer_id: string
          facility_id: string
          id: string
          notes: string | null
          order_number: string
          organization_id: string
          priority: string
          release_date: string | null
          requested_ship_date: string | null
          status: string
          updated_at: string
          vendor_id: string | null
          warehouse_status: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          current_revision_number?: number
          customer_id: string
          facility_id: string
          id?: string
          notes?: string | null
          order_number: string
          organization_id: string
          priority?: string
          release_date?: string | null
          requested_ship_date?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string | null
          warehouse_status?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          current_revision_number?: number
          customer_id?: string
          facility_id?: string
          id?: string
          notes?: string | null
          order_number?: string
          organization_id?: string
          priority?: string
          release_date?: string | null
          requested_ship_date?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string | null
          warehouse_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          active: boolean
          id: string
          invited_at: string
          invited_by: string | null
          organization_id: string
          profile_id: string
          role_id: string
        }
        Insert: {
          accepted_at?: string | null
          active?: boolean
          id?: string
          invited_at?: string
          invited_by?: string | null
          organization_id: string
          profile_id: string
          role_id: string
        }
        Update: {
          accepted_at?: string | null
          active?: boolean
          id?: string
          invited_at?: string
          invited_by?: string | null
          organization_id?: string
          profile_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          name: string
          slug: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          slug: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          slug?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          job_title: string | null
          last_name: string
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string
          id: string
          job_title?: string | null
          last_name?: string
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          job_title?: string | null
          last_name?: string
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_differences: {
        Row: {
          created_at: string
          current_value: Json | null
          difference_type: string
          field_name: string | null
          id: string
          line_number: number | null
          organization_id: string
          previous_value: Json | null
          revision_id: string
        }
        Insert: {
          created_at?: string
          current_value?: Json | null
          difference_type: string
          field_name?: string | null
          id?: string
          line_number?: number | null
          organization_id: string
          previous_value?: Json | null
          revision_id: string
        }
        Update: {
          created_at?: string
          current_value?: Json | null
          difference_type?: string
          field_name?: string | null
          id?: string
          line_number?: number | null
          organization_id?: string
          previous_value?: Json | null
          revision_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_differences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_differences_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "order_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          line_number: number
          material_id: string | null
          notes: string | null
          organization_id: string
          quantity: number
          revision_id: string
          source_order_item_id: string | null
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          line_number: number
          material_id?: string | null
          notes?: string | null
          organization_id: string
          quantity: number
          revision_id: string
          source_order_item_id?: string | null
          unit: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          line_number?: number
          material_id?: string | null
          notes?: string | null
          organization_id?: string
          quantity?: number
          revision_id?: string
          source_order_item_id?: string | null
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "revision_line_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_line_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_line_items_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "order_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_line_items_source_order_item_id_fkey"
            columns: ["source_order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_events: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          id: string
          order_id: string | null
          organization_id: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          revision_id: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          order_id?: string | null
          organization_id: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          revision_id?: string | null
          severity: string
          status?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          order_id?: string | null
          organization_id?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          revision_id?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_events_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_events_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "order_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string
          id: string
          key: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          key: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      vendor_contacts: {
        Row: {
          archived_at: string | null
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          name: string
          organization_id: string
          phone: string | null
          title: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          organization_id: string
          phone?: string | null
          title?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          organization_id?: string
          phone?: string | null
          title?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contacts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          notes: string | null
          organization_id: string
          status: string
          terms: string | null
          updated_at: string
          vendor_code: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          status?: string
          terms?: string | null
          updated_at?: string
          vendor_code: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          status?: string
          terms?: string | null
          updated_at?: string
          vendor_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_events: {
        Row: {
          created_at: string
          created_by: string
          event_type: string
          facility_id: string
          id: string
          notes: string | null
          occurred_at: string
          order_id: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_type: string
          facility_id: string
          id?: string
          notes?: string | null
          occurred_at?: string
          order_id: string
          organization_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_type?: string
          facility_id?: string
          id?: string
          notes?: string | null
          occurred_at?: string
          order_id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_events_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
