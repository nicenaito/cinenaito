export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ExpectationLevel = '絶対観る' | '時間が合えば' | '気にはなっている'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          discord_id: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          discord_id?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          discord_id?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      movie_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          release_date: string | null
          movie_url: string | null
          youtube_url: string | null
          comment: string | null
          expectation: ExpectationLevel
          target_month: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          release_date?: string | null
          movie_url?: string | null
          youtube_url?: string | null
          comment?: string | null
          expectation?: ExpectationLevel
          target_month: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          release_date?: string | null
          movie_url?: string | null
          youtube_url?: string | null
          comment?: string | null
          expectation?: ExpectationLevel
          target_month?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      plan_comments: {
        Row: {
          id: string
          plan_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          id: string
          plan_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      movie_plans_with_stats: {
        Row: {
          id: string
          user_id: string
          title: string
          release_date: string | null
          movie_url: string | null
          youtube_url: string | null
          comment: string | null
          expectation: ExpectationLevel
          target_month: string
          created_at: string
          updated_at: string
          username: string
          avatar_url: string | null
          reaction_count: number
          comment_count: number
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      expectation_level: ExpectationLevel
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type MoviePlan = Database['public']['Tables']['movie_plans']['Row']
export type PlanComment = Database['public']['Tables']['plan_comments']['Row']
export type Reaction = Database['public']['Tables']['reactions']['Row']
export type MoviePlanWithStats = Database['public']['Views']['movie_plans_with_stats']['Row']
