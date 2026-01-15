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
      cardio_sessions: {
        Row: {
          avg_heart_rate: number | null
          avg_speed_kmh: number | null
          calories_burned: number | null
          cardio_type: Database["public"]["Enums"]["cardio_type"]
          distance_meters: number | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          max_heart_rate: number | null
          max_speed_kmh: number | null
          notes: string | null
          route_end_lat: number | null
          route_end_lng: number | null
          route_polyline: string | null
          route_start_lat: number | null
          route_start_lng: number | null
          started_at: string
          steps_count: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          avg_heart_rate?: number | null
          avg_speed_kmh?: number | null
          calories_burned?: number | null
          cardio_type: Database["public"]["Enums"]["cardio_type"]
          distance_meters?: number | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          max_heart_rate?: number | null
          max_speed_kmh?: number | null
          notes?: string | null
          route_end_lat?: number | null
          route_end_lng?: number | null
          route_polyline?: string | null
          route_start_lat?: number | null
          route_start_lng?: number | null
          started_at?: string
          steps_count?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          avg_heart_rate?: number | null
          avg_speed_kmh?: number | null
          calories_burned?: number | null
          cardio_type?: Database["public"]["Enums"]["cardio_type"]
          distance_meters?: number | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          max_heart_rate?: number | null
          max_speed_kmh?: number | null
          notes?: string | null
          route_end_lat?: number | null
          route_end_lng?: number | null
          route_polyline?: string | null
          route_start_lat?: number | null
          route_start_lng?: number | null
          started_at?: string
          steps_count?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      communities: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          status: Database["public"]["Enums"]["community_status"]
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          status?: Database["public"]["Enums"]["community_status"]
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          status?: Database["public"]["Enums"]["community_status"]
          updated_at?: string
        }
        Relationships: []
      }
      community_catalogs: {
        Row: {
          community_id: string
          created_at: string
          created_by: string
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          community_id: string
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          community_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_catalogs_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_catalogs_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["community_role"]
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["community_role"]
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["community_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          community_id: string
          content: string
          created_at: string
          id: string
          media_url: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          content: string
          created_at?: string
          id?: string
          media_url?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          media_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_tasks: {
        Row: {
          community_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          gold_reward: number
          id: string
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          community_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          gold_reward?: number
          id?: string
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          community_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          gold_reward?: number
          id?: string
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_tasks_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          best_friend_title: string | null
          created_at: string
          id: string
          is_best_friend: boolean
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          addressee_id: string
          best_friend_title?: string | null
          created_at?: string
          id?: string
          is_best_friend?: boolean
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          best_friend_title?: string | null
          created_at?: string
          id?: string
          is_best_friend?: boolean
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: []
      }
      global_catalogs: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "global_catalogs_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "global_catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      martial_arts_sessions: {
        Row: {
          duration_minutes: number | null
          ended_at: string | null
          id: string
          intensity: number | null
          notes: string | null
          rounds_completed: number | null
          sparring: boolean | null
          started_at: string
          style_id: string | null
          techniques_practiced: string[] | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          intensity?: number | null
          notes?: string | null
          rounds_completed?: number | null
          sparring?: boolean | null
          started_at?: string
          style_id?: string | null
          techniques_practiced?: string[] | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          intensity?: number | null
          notes?: string | null
          rounds_completed?: number | null
          sparring?: boolean | null
          started_at?: string
          style_id?: string | null
          techniques_practiced?: string[] | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "martial_arts_sessions_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "martial_arts_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      martial_arts_styles: {
        Row: {
          created_at: string
          description: string | null
          equipment: string[] | null
          id: string
          image_url: string | null
          name: string
          origin_country: string | null
          techniques: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          equipment?: string[] | null
          id?: string
          image_url?: string | null
          name: string
          origin_country?: string | null
          techniques?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          equipment?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          origin_country?: string | null
          techniques?: string[] | null
        }
        Relationships: []
      }
      media_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "media_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      media_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "media_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      media_posts: {
        Row: {
          catalog_id: string | null
          comments_count: number
          community_id: string | null
          created_at: string
          description: string | null
          id: string
          is_nsfw: boolean
          likes_count: number
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          catalog_id?: string | null
          comments_count?: number
          community_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_nsfw?: boolean
          likes_count?: number
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          catalog_id?: string | null
          comments_count?: number
          community_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_nsfw?: boolean
          likes_count?: number
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      other_exercise_sessions: {
        Row: {
          custom_name: string | null
          duration_minutes: number | null
          ended_at: string | null
          exercise_id: string | null
          id: string
          notes: string | null
          reps_completed: number | null
          sets_completed: number | null
          started_at: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          custom_name?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          started_at?: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          custom_name?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps_completed?: number | null
          sets_completed?: number | null
          started_at?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "other_exercise_sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "other_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      other_exercises: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: number | null
          equipment: string[] | null
          id: string
          image_url: string | null
          muscles_worked: string[] | null
          name: string
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty?: number | null
          equipment?: string[] | null
          id?: string
          image_url?: string | null
          muscles_worked?: string[] | null
          name: string
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: number | null
          equipment?: string[] | null
          id?: string
          image_url?: string | null
          muscles_worked?: string[] | null
          name?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cover_url: string | null
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
          cover_url?: string | null
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
          cover_url?: string | null
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
      shared_tasks: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          friendship_id: string
          gold_reward: number
          id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          friendship_id: string
          gold_reward?: number
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          friendship_id?: string
          gold_reward?: number
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "shared_tasks_friendship_id_fkey"
            columns: ["friendship_id"]
            isOneToOne: false
            referencedRelation: "friendships"
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
      strength_exercises: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: number | null
          equipment: string[] | null
          gif_url: string | null
          id: string
          is_custom: boolean | null
          muscle_primary: string
          muscles_secondary: string[] | null
          name: string
          video_url: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: number | null
          equipment?: string[] | null
          gif_url?: string | null
          id?: string
          is_custom?: boolean | null
          muscle_primary: string
          muscles_secondary?: string[] | null
          name: string
          video_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: number | null
          equipment?: string[] | null
          gif_url?: string | null
          id?: string
          is_custom?: boolean | null
          muscle_primary?: string
          muscles_secondary?: string[] | null
          name?: string
          video_url?: string | null
        }
        Relationships: []
      }
      strength_session_exercises: {
        Row: {
          completed_at: string
          custom_exercise_id: string | null
          exercise_id: string | null
          id: string
          notes: string | null
          reps_done: number
          session_id: string
          set_number: number
          weight_kg: number | null
        }
        Insert: {
          completed_at?: string
          custom_exercise_id?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps_done: number
          session_id: string
          set_number: number
          weight_kg?: number | null
        }
        Update: {
          completed_at?: string
          custom_exercise_id?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps_done?: number
          session_id?: string
          set_number?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "strength_session_exercises_custom_exercise_id_fkey"
            columns: ["custom_exercise_id"]
            isOneToOne: false
            referencedRelation: "user_custom_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strength_session_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "strength_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strength_session_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "strength_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      strength_sessions: {
        Row: {
          duration_minutes: number | null
          ended_at: string | null
          exercises_completed: number | null
          id: string
          notes: string | null
          plan_day_id: string | null
          started_at: string
          total_reps: number | null
          total_sets: number | null
          total_weight_kg: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          duration_minutes?: number | null
          ended_at?: string | null
          exercises_completed?: number | null
          id?: string
          notes?: string | null
          plan_day_id?: string | null
          started_at?: string
          total_reps?: number | null
          total_sets?: number | null
          total_weight_kg?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          duration_minutes?: number | null
          ended_at?: string | null
          exercises_completed?: number | null
          id?: string
          notes?: string | null
          plan_day_id?: string | null
          started_at?: string
          total_reps?: number | null
          total_sets?: number | null
          total_weight_kg?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "strength_sessions_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "workout_plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      swimming_sessions: {
        Row: {
          calories_burned: number | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          laps_completed: number | null
          notes: string | null
          pool_length_meters: number | null
          started_at: string
          style_id: string | null
          total_distance_meters: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          calories_burned?: number | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          laps_completed?: number | null
          notes?: string | null
          pool_length_meters?: number | null
          started_at?: string
          style_id?: string | null
          total_distance_meters?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          calories_burned?: number | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          laps_completed?: number | null
          notes?: string | null
          pool_length_meters?: number | null
          started_at?: string
          style_id?: string | null
          total_distance_meters?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "swimming_sessions_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "swimming_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      swimming_styles: {
        Row: {
          created_at: string
          description: string | null
          difficulty: number | null
          id: string
          image_url: string | null
          muscles_worked: string[] | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: number | null
          id?: string
          image_url?: string | null
          muscles_worked?: string[] | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: number | null
          id?: string
          image_url?: string | null
          muscles_worked?: string[] | null
          name?: string
        }
        Relationships: []
      }
      task_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "community_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_custom_exercises: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at: string
          description: string | null
          equipment: string[] | null
          gif_url: string | null
          id: string
          muscle_primary: string
          muscles_secondary: string[] | null
          name: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          description?: string | null
          equipment?: string[] | null
          gif_url?: string | null
          id?: string
          muscle_primary: string
          muscles_secondary?: string[] | null
          name: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          description?: string | null
          equipment?: string[] | null
          gif_url?: string | null
          id?: string
          muscle_primary?: string
          muscles_secondary?: string[] | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      workout_plan_days: {
        Row: {
          created_at: string
          day_of_week: Database["public"]["Enums"]["workout_day"]
          id: string
          name: string | null
          plan_id: string
          rest_seconds_between: number | null
          target_muscles:
            | Database["public"]["Enums"]["exercise_category"][]
            | null
        }
        Insert: {
          created_at?: string
          day_of_week: Database["public"]["Enums"]["workout_day"]
          id?: string
          name?: string | null
          plan_id: string
          rest_seconds_between?: number | null
          target_muscles?:
            | Database["public"]["Enums"]["exercise_category"][]
            | null
        }
        Update: {
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["workout_day"]
          id?: string
          name?: string | null
          plan_id?: string
          rest_seconds_between?: number | null
          target_muscles?:
            | Database["public"]["Enums"]["exercise_category"][]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_plan_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plan_exercises: {
        Row: {
          created_at: string
          custom_exercise_id: string | null
          exercise_id: string | null
          id: string
          notes: string | null
          order_index: number
          plan_day_id: string
          reps: number
          rest_seconds: number | null
          sets: number
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          custom_exercise_id?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          plan_day_id: string
          reps?: number
          rest_seconds?: number | null
          sets?: number
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          custom_exercise_id?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          plan_day_id?: string
          reps?: number
          rest_seconds?: number | null
          sets?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_plan_exercises_custom_exercise_id_fkey"
            columns: ["custom_exercise_id"]
            isOneToOne: false
            referencedRelation: "user_custom_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plan_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "strength_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plan_exercises_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "workout_plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      yoga_poses: {
        Row: {
          benefits: string[] | null
          category: string | null
          created_at: string
          description: string | null
          difficulty: number | null
          duration_seconds: number | null
          id: string
          image_url: string | null
          name: string
          name_sanskrit: string | null
          video_url: string | null
        }
        Insert: {
          benefits?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: number | null
          duration_seconds?: number | null
          id?: string
          image_url?: string | null
          name: string
          name_sanskrit?: string | null
          video_url?: string | null
        }
        Update: {
          benefits?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: number | null
          duration_seconds?: number | null
          id?: string
          image_url?: string | null
          name?: string
          name_sanskrit?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      yoga_session_poses: {
        Row: {
          completed_at: string
          duration_seconds: number | null
          id: string
          pose_id: string
          session_id: string
        }
        Insert: {
          completed_at?: string
          duration_seconds?: number | null
          id?: string
          pose_id: string
          session_id: string
        }
        Update: {
          completed_at?: string
          duration_seconds?: number | null
          id?: string
          pose_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yoga_session_poses_pose_id_fkey"
            columns: ["pose_id"]
            isOneToOne: false
            referencedRelation: "yoga_poses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yoga_session_poses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "yoga_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      yoga_sessions: {
        Row: {
          duration_minutes: number | null
          ended_at: string | null
          id: string
          notes: string | null
          poses_completed: number | null
          session_type: string | null
          started_at: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          poses_completed?: number | null
          session_type?: string | null
          started_at?: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          poses_completed?: number | null
          session_type?: string | null
          started_at?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_community_role: {
        Args: {
          _community_id: string
          _roles: Database["public"]["Enums"]["community_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      battle_result: "victory" | "defeat" | "abandoned"
      battle_type: "minion" | "boss"
      book_status: "active" | "paused" | "completed" | "dropped"
      cardio_type:
        | "treadmill"
        | "bike"
        | "elliptical"
        | "rowing"
        | "stairs"
        | "free_run"
        | "free_walk"
        | "free_cycle"
      community_role: "leader" | "vice_leader" | "member"
      community_status: "pending" | "approved" | "rejected"
      exercise_category:
        | "chest"
        | "back"
        | "shoulders"
        | "biceps"
        | "triceps"
        | "forearms"
        | "quadriceps"
        | "hamstrings"
        | "glutes"
        | "calves"
        | "abs"
        | "obliques"
        | "lower_back"
        | "traps"
        | "lats"
      friendship_status: "pending" | "accepted" | "rejected"
      media_type: "video" | "image"
      player_rank:
        | "adormecido"
        | "desperto"
        | "peregrino"
        | "soberano"
        | "arauto"
        | "singularidade"
      task_status: "pending" | "in_progress" | "completed"
      workout_day:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
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
      app_role: ["admin", "moderator", "user"],
      battle_result: ["victory", "defeat", "abandoned"],
      battle_type: ["minion", "boss"],
      book_status: ["active", "paused", "completed", "dropped"],
      cardio_type: [
        "treadmill",
        "bike",
        "elliptical",
        "rowing",
        "stairs",
        "free_run",
        "free_walk",
        "free_cycle",
      ],
      community_role: ["leader", "vice_leader", "member"],
      community_status: ["pending", "approved", "rejected"],
      exercise_category: [
        "chest",
        "back",
        "shoulders",
        "biceps",
        "triceps",
        "forearms",
        "quadriceps",
        "hamstrings",
        "glutes",
        "calves",
        "abs",
        "obliques",
        "lower_back",
        "traps",
        "lats",
      ],
      friendship_status: ["pending", "accepted", "rejected"],
      media_type: ["video", "image"],
      player_rank: [
        "adormecido",
        "desperto",
        "peregrino",
        "soberano",
        "arauto",
        "singularidade",
      ],
      task_status: ["pending", "in_progress", "completed"],
      workout_day: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
    },
  },
} as const
