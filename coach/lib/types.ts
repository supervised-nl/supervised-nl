export type OrganizationSize = "1-5" | "5-15" | "15-50" | "50+";
export type UserRole = "super_admin" | "admin" | "member";
export type ChallengeStatus = "draft" | "active" | "completed";

export type Database = {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          sector: string | null;
          size: OrganizationSize | null;
          challenge_send_day: number | null;
          challenge_send_time: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sector?: string | null;
          size?: OrganizationSize | null;
          challenge_send_day?: number | null;
          challenge_send_time?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sector?: string | null;
          size?: OrganizationSize | null;
          challenge_send_day?: number | null;
          challenge_send_time?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          organization_id: string | null;
          role: UserRole;
          name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          role: UserRole;
          name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          role?: UserRole;
          name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workshop_contexts: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          processes: string | null;
          tools_used: string | null;
          use_cases: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          processes?: string | null;
          tools_used?: string | null;
          use_cases?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          processes?: string | null;
          tools_used?: string | null;
          use_cases?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          id: string;
          organization_id: string;
          workshop_context_id: string | null;
          week_number: number;
          title: string;
          description: string;
          expected_outcome: string | null;
          status: ChallengeStatus;
          send_at: string | null;
          emails_sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          workshop_context_id?: string | null;
          week_number: number;
          title: string;
          description: string;
          expected_outcome?: string | null;
          status?: ChallengeStatus;
          send_at?: string | null;
          emails_sent?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          workshop_context_id?: string | null;
          week_number?: number;
          title?: string;
          description?: string;
          expected_outcome?: string | null;
          status?: ChallengeStatus;
          send_at?: string | null;
          emails_sent?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      challenge_completions: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          organization_id: string;
          completed_at: string;
          shared_prompt: string | null;
          shared_result: string | null;
          time_saved_minutes: number | null;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          user_id: string;
          organization_id: string;
          completed_at?: string;
          shared_prompt?: string | null;
          shared_result?: string | null;
          time_saved_minutes?: number | null;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          user_id?: string;
          organization_id?: string;
          completed_at?: string;
          shared_prompt?: string | null;
          shared_result?: string | null;
          time_saved_minutes?: number | null;
        };
        Relationships: [];
      };
      qa_threads: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          question: string;
          answer: string | null;
          workshop_context_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          question: string;
          answer?: string | null;
          workshop_context_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          question?: string;
          answer?: string | null;
          workshop_context_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
  };
};

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type WorkshopContext = Database["public"]["Tables"]["workshop_contexts"]["Row"];
export type Challenge = Database["public"]["Tables"]["challenges"]["Row"];
export type ChallengeCompletion = Database["public"]["Tables"]["challenge_completions"]["Row"];
export type QaThread = Database["public"]["Tables"]["qa_threads"]["Row"];
