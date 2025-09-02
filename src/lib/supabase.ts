import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// データベース型定義
export type Database = {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string
          name: string
          owner_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_email?: string | null
        }
        Update: {
          name?: string
          owner_email?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          shop_id: string | null
          email: string | null
          full_name: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          id: string
          shop_id?: string | null
          email?: string | null
          full_name?: string | null
          role?: string | null
        }
        Update: {
          shop_id?: string | null
          email?: string | null
          full_name?: string | null
          role?: string | null
        }
      }
      products: {
        Row: {
          id: string
          shop_id: string
          name: string
          brand: string | null
          category: string | null
          volume: string | null
          unit: string | null
          purchase_price: number | null
          selling_price: number | null
          supplier_name: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          shop_id: string
          name: string
          brand?: string | null
          category?: string | null
          volume?: string | null
          unit?: string | null
          purchase_price?: number | null
          selling_price?: number | null
          supplier_name?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          brand?: string | null
          category?: string | null
          volume?: string | null
          unit?: string | null
          purchase_price?: number | null
          selling_price?: number | null
          supplier_name?: string | null
          notes?: string | null
        }
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          current_quantity: number
          expiry_date: string | null
          batch_number: string | null
          last_updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          product_id: string
          current_quantity?: number
          expiry_date?: string | null
          batch_number?: string | null
          last_updated_by?: string | null
        }
        Update: {
          current_quantity?: number
          expiry_date?: string | null
          batch_number?: string | null
          last_updated_by?: string | null
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]