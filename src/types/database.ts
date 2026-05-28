export type ContentRating = "pg13" | "adult";
export type MessageRole = "user" | "assistant" | "system";
export type PasscodeStatus = "pending" | "approved" | "expired" | "cancelled";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          city: string | null;
          country: string | null;
          content_rating: ContentRating;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          city?: string | null;
          country?: string | null;
          content_rating?: ContentRating;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          city?: string | null;
          country?: string | null;
          content_rating?: ContentRating;
          updated_at?: string;
        };
        Relationships: [];
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          character_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          character_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          character_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          role: MessageRole;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          user_id: string;
          role: MessageRole;
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };
      login_passcodes: {
        Row: {
          id: string;
          code: string;
          status: PasscodeStatus;
          approved_by: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          status?: PasscodeStatus;
          approved_by?: string | null;
          created_at?: string;
          expires_at: string;
        };
        Update: {
          status?: PasscodeStatus;
          approved_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
