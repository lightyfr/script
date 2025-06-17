export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_key_usage: {
        Row: {
          api: Database["public"]["Enums"]["api_type"] | null
          api_key: string
          created_at: string | null
          id: number
          last_used_at: string | null
          recent_requests: string[] | null
          service: Database["public"]["Enums"]["api"] | null
        }
        Insert: {
          api?: Database["public"]["Enums"]["api_type"] | null
          api_key: string
          created_at?: string | null
          id?: number
          last_used_at?: string | null
          recent_requests?: string[] | null
          service?: Database["public"]["Enums"]["api"] | null
        }
        Update: {
          api?: Database["public"]["Enums"]["api_type"] | null
          api_key?: string
          created_at?: string | null
          id?: number
          last_used_at?: string | null
          recent_requests?: string[] | null
          service?: Database["public"]["Enums"]["api"] | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          max_emails: number
          research_interests: string[]
          status: string
          target_universities: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          max_emails: number
          research_interests: string[]
          status?: string
          target_universities: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          max_emails?: number
          research_interests?: string[]
          status?: string
          target_universities?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          message: string | null
          professor_id: string
          status: Database["public"]["Enums"]["connection_status"] | null
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          professor_id: string
          status?: Database["public"]["Enums"]["connection_status"] | null
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          professor_id?: string
          status?: Database["public"]["Enums"]["connection_status"] | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          campaign_id: string | null
          created_at: string
          gmail_thread_id: string | null
          id: string
          open_count: number | null
          pending_email_id: string | null
          replied_at: string | null
          sent_at: string
          status: Database["public"]["Enums"]["email_status"] | null   
          student_id: string
          tracking_id: string | null
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          gmail_thread_id?: string | null
          id?: string
          open_count?: number | null
          pending_email_id?: string | null
          replied_at?: string | null
          sent_at?: string
          status?: Database["public"]["Enums"]["email_status"] | null  
          student_id: string
          tracking_id?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          gmail_thread_id?: string | null
          id?: string
          open_count?: number | null
          pending_email_id?: string | null
          replied_at?: string | null
          sent_at?: string
          status?: Database["public"]["Enums"]["email_status"] | null  
          student_id?: string
          tracking_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_pending_email_id_fkey"
            columns: ["pending_email_id"]
            isOneToOne: false
            referencedRelation: "pending_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          subject: string
          template_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          subject: string
          template_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          subject?: string
          template_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_emails: {
        Row: {
          campaign_id: string
          created_at: string
          department: string | null
          error_message: string | null
          id: string
          professor_email: string
          professor_name: string
          research_areas: string[] | null
          sent_at: string | null
          status: string
          university: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          department?: string | null
          error_message?: string | null
          id?: string
          professor_email: string
          professor_name: string
          research_areas?: string[] | null
          sent_at?: string | null
          status?: string
          university?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          department?: string | null
          error_message?: string | null
          id?: string
          professor_email?: string
          professor_name?: string
          research_areas?: string[] | null
          sent_at?: string | null
          status?: string
          university?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_emails_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      professor_profiles: {
        Row: {
          bio: string | null
          created_at: string
          department: string | null
          interests: string[] | null
          lab_website: string | null
          open_to_students: boolean | null
          university: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          department?: string | null
          interests?: string[] | null
          lab_website?: string | null
          open_to_students?: boolean | null
          university?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          department?: string | null
          interests?: string[] | null
          lab_website?: string | null
          open_to_students?: boolean | null
          university?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scraped_professors: {
        Row: {
          department: string | null
          email: string
          name: string | null
          research_topics: string[] | null
          summary: string | null
          university: string | null
          vector: string | null
        }
        Insert: {
          department?: string | null
          email: string
          name?: string | null
          research_topics?: string[] | null
          summary?: string | null
          university?: string | null
          vector?: string | null
        }
        Update: {
          department?: string | null
          email?: string
          name?: string | null
          research_topics?: string[] | null
          summary?: string | null
          university?: string | null
          vector?: string | null
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          bio: string | null
          created_at: string
          interests: string[] | null
          resume_url: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          interests?: string[] | null
          resume_url?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          interests?: string[] | null
          resume_url?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      user_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_oauth_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          firstName: string | null
          id: string
          lastName: string | null
          role: Database["public"]["Enums"]["user_role"] | null        
          school: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          firstName?: string | null
          id: string
          lastName?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null       
          school?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          firstName?: string | null
          id?: string
          lastName?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null       
          school?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string | null
          id: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_rate_limited_api_key: {
        Args: { rpm_limit?: number }
        Returns: {
          key_to_use: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }       
        Returns: unknown
      }
      query_scraped_professors: {
        Args: {
          embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          department: string | null
          email: string
          name: string | null
          research_topics: string[] | null
          summary: string | null
          university: string | null
          vector: string | null
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      api: "email" | "write" | "scrape"
      api_type: "gemini" | "perplexity"
      connection_status: "pending" | "accepted" | "rejected"
      email_status:
        | "sent"
        | "delivered"
        | "opened"
        | "replied"
        | "bounced"
        | "legacy"
      user_role: "student" | "professor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]       

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])  
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database } 
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &   
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database } 
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database } 
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }  
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { 
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      api: ["email", "write", "scrape"],
      api_type: ["gemini", "perplexity"],
      connection_status: ["pending", "accepted", "rejected"],
      email_status: [
        "sent",
        "delivered",
        "opened",
        "replied",
        "bounced",
        "legacy",
      ],
      user_role: ["student", "professor"],
    },
  },
} as const