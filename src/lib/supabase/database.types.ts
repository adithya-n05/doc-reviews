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
      feedback_submissions: {
        Row: {
          created_at: string
          id: string
          message: string
          page_path: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          page_path: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          page_path?: string
          user_id?: string | null
        }
        Relationships: []
      }
      module_leaders: {
        Row: {
          created_at: string
          id: string
          leader_name: string
          module_id: string
          photo_url: string | null
          profile_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          leader_name: string
          module_id: string
          photo_url?: string | null
          profile_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          leader_name?: string
          module_id?: string
          photo_url?: string | null
          profile_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_leaders_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_offerings: {
        Row: {
          academic_year_label: string
          created_at: string
          degree_path: string
          id: string
          module_id: string
          offering_type: string
          study_year: number
          term: string
          updated_at: string
        }
        Insert: {
          academic_year_label: string
          created_at?: string
          degree_path: string
          id?: string
          module_id: string
          offering_type: string
          study_year: number
          term: string
          updated_at?: string
        }
        Update: {
          academic_year_label?: string
          created_at?: string
          degree_path?: string
          id?: string
          module_id?: string
          offering_type?: string
          study_year?: number
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_offerings_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          source_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string
          id?: string
          source_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          source_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      module_review_insights: {
        Row: {
          generated_at: string
          module_id: string
          reviews_fingerprint: string
          sentiment: Json
          source: string
          summary: string
          top_keywords: Json
          updated_at: string
        }
        Insert: {
          generated_at?: string
          module_id: string
          reviews_fingerprint: string
          sentiment?: Json
          source: string
          summary: string
          top_keywords?: Json
          updated_at?: string
        }
        Update: {
          generated_at?: string
          module_id?: string
          reviews_fingerprint?: string
          sentiment?: Json
          source?: string
          summary?: string
          top_keywords?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_review_insights_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: true
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          degree_track: string | null
          email: string
          full_name: string
          id: string
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          degree_track?: string | null
          email: string
          full_name?: string
          id: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          degree_track?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          assessment_rating: number
          comment: string
          created_at: string
          difficulty_rating: number
          id: string
          module_id: string
          teaching_rating: number
          tips: string | null
          updated_at: string
          user_id: string
          workload_rating: number
        }
        Insert: {
          assessment_rating: number
          comment: string
          created_at?: string
          difficulty_rating: number
          id?: string
          module_id: string
          teaching_rating: number
          tips?: string | null
          updated_at?: string
          user_id: string
          workload_rating: number
        }
        Update: {
          assessment_rating?: number
          comment?: string
          created_at?: string
          difficulty_rating?: number
          id?: string
          module_id?: string
          teaching_rating?: number
          tips?: string | null
          updated_at?: string
          user_id?: string
          workload_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          body: string
          created_at: string
          id: string
          parent_reply_id: string | null
          review_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          parent_reply_id?: string | null
          review_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          parent_reply_id?: string | null
          review_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "review_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_helpful_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      user_modules: {
        Row: {
          created_at: string
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      module_review_aggregates: {
        Row: {
          avg_assessment: number | null
          avg_difficulty: number | null
          avg_overall: number | null
          avg_teaching: number | null
          avg_workload: number | null
          module_id: string | null
          review_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
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
