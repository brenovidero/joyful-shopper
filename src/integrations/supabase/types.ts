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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      battle_sessions: {
        Row: {
          battle_type: Database["public"]["Enums"]["battle_type"]
          duration_minutes: number
          ended_at: string | null
          gold_earned: number
          grimoire_audio_url: string | null
          grimoire_text: string | null
          id: string
          interruptions: number
          result: Database["public"]["Enums"]["battle_result"]
          started_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          battle_type: Database["public"]["Enums"]["battle_type"]
          duration_minutes: number
          ended_at?: string | null
          gold_earned?: number
          grimoire_audio_url?: string | null
          grimoire_text?: string | null
          id?: string
          interruptions?: number
          result?: Database["public"]["Enums"]["battle_result"]
          started_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          battle_type?: Database["public"]["Enums"]["battle_type"]
          duration_minutes?: number
          ended_at?: string | null
          gold_earned?: number
          grimoire_audio_url?: string | null
          grimoire_text?: string | null
          id?: string
          interruptions?: number
          result?: Database["public"]["Enums"]["battle_result"]
          started_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          pages_read: number
          status: Database["public"]["Enums"]["book_status"]
          target_date: string | null
          title: string
          total_pages: number
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          pages_read?: number
          status?: Database["public"]["Enums"]["book_status"]
          target_date?: string | null
          title: string
          total_pages: number
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          pages_read?: number
          status?: Database["public"]["Enums"]["book_status"]
          target_date?: string | null
          title?: string
          total_pages?: number
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "books_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          gold: number
          id: string
          last_active_date: string | null
          level: number
          rank: Database["public"]["Enums"]["player_rank"]
          streak_days: number
          total_battles_won: number
          total_pages_read: number
          total_water_ml: number
          updated_at: string
          xp_discipline: number
          xp_intelligence: number
          xp_vitality: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          gold?: number
          id: string
          last_active_date?: string | null
          level?: number
          rank?: Database["public"]["Enums"]["player_rank"]
          streak_days?: number
          total_battles_won?: number
          total_pages_read?: number
          total_water_ml?: number
          updated_at?: string
          xp_discipline?: number
          xp_intelligence?: number
          xp_vitality?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          gold?: number
          id?: string
          last_active_date?: string | null
          level?: number
          rank?: Database["public"]["Enums"]["player_rank"]
          streak_days?: number
          total_battles_won?: number
          total_pages_read?: number
          total_water_ml?: number
          updated_at?: string
          xp_discipline?: number
          xp_intelligence?: number
          xp_vitality?: number
        }
        Relationships: []
      }
      purchases: {
        Row: {
          gold_spent: number
          id: string
          item_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          gold_spent: number
          id?: string
          item_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          gold_spent?: number
          id?: string
          item_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_sessions: {
        Row: {
          book_id: string
          created_at: string
          id: string
          notes: string | null
          pages_read: number
          reading_speed: number | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          notes?: string | null
          pages_read: number
          reading_speed?: number | null
          user_id: string
          xp_earned?: number
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          pages_read?: number
          reading_speed?: number | null
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "reading_sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_items: {
        Row: {
          cost_gold: number
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_consumable: boolean
          name: string
        }
        Insert: {
          cost_gold: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_consumable?: boolean
          name: string
        }
        Update: {
          cost_gold?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_consumable?: boolean
          name?: string
        }
        Relationships: []
      }
      vitality_logs: {
        Row: {
          id: string
          logged_at: string
          user_id: string
          water_ml: number
          workout_completed: boolean
          workout_type: string | null
          xp_earned: number
        }
        Insert: {
          id?: string
          logged_at?: string
          user_id: string
          water_ml?: number
          workout_completed?: boolean
          workout_type?: string | null
          xp_earned?: number
        }
        Update: {
          id?: string
          logged_at?: string
          user_id?: string
          water_ml?: number
          workout_completed?: boolean
          workout_type?: string | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "vitality_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      battle_result: "victory" | "defeat" | "abandoned"
      battle_type: "minion" | "boss"
      book_status: "active" | "paused" | "completed" | "dropped"
      player_rank:
        | "adormecido"
        | "desperto"
        | "peregrino"
        | "soberano"
        | "arauto"
        | "singularidade"
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
    Enums: {
      battle_result: ["victory", "defeat", "abandoned"],
      battle_type: ["minion", "boss"],
      book_status: ["active", "paused", "completed", "dropped"],
      player_rank: [
        "adormecido",
        "desperto",
        "peregrino",
        "soberano",
        "arauto",
        "singularidade",
      ],
    },
  },
} as const
