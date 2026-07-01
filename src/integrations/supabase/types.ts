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
      accounts: {
        Row: {
          brand_empty_message: string
          brand_footer_logo_url: string | null
          brand_logo_height_px: number
          brand_logo_url: string | null
          brand_subtitle: string
          brand_title: string
          brand_today_title: string
          card_accent_color: string | null
          card_field_size_px: number | null
          card_footer_size_px: number | null
          card_footer_text: string | null
          card_label_size_px: number | null
          card_logo_height_px: number | null
          card_logo_url: string | null
          card_title_size_px: number | null
          created_at: string
          cta_enabled: boolean
          cta_label: string
          current_plan: string | null
          plan_tier: string
          custom_slug: string | null
          donations_fixed_image_url: string | null
          force_show_type: boolean
          gallery_urls: Json
          hub_bio: string | null
          hub_cover_url: string | null
          hub_enabled: boolean
          hub_highlights: Json
          hub_show_agenda: boolean
          hub_show_all_locations: boolean
          hub_show_events: boolean
          hub_show_prayer: boolean
          hub_show_visitor: boolean
          hub_show_whatsapp: boolean
          hub_slides: Json
          hub_whatsapp: string | null
          id: string
          instagram_columns: number
          instagram_post_count: number
          live_url: string | null
          media_audio_url: string | null
          media_show_audio: boolean
          media_show_youtube: boolean
          media_youtube_url: string | null
          onboarded: boolean
          pix_key: string | null
          primary_color: string
          religion_profile: Database["public"]["Enums"]["religion_profile"]
          show_end_time: boolean
          show_live_fields: boolean
          site_id: string
          social_facebook: string | null
          social_instagram: string | null
          social_website: string | null
          social_youtube: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string
          updated_at: string
          visitor_welcome_message: string | null
          visitor_whatsapp: string | null
          weekly_message: string | null
          weekly_verse: string | null
          weekly_verse_ref: string | null
        }
        Insert: {
          brand_empty_message?: string
          brand_footer_logo_url?: string | null
          brand_logo_height_px?: number
          brand_logo_url?: string | null
          brand_subtitle?: string
          brand_title?: string
          brand_today_title?: string
          card_accent_color?: string | null
          card_field_size_px?: number | null
          card_footer_size_px?: number | null
          card_footer_text?: string | null
          card_label_size_px?: number | null
          card_logo_height_px?: number | null
          card_logo_url?: string | null
          card_title_size_px?: number | null
          created_at?: string
          cta_enabled?: boolean
          cta_label?: string
          current_plan?: string | null
          plan_tier?: string
          custom_slug?: string | null
          donations_fixed_image_url?: string | null
          force_show_type?: boolean
          gallery_urls?: Json
          hub_bio?: string | null
          hub_cover_url?: string | null
          hub_enabled?: boolean
          hub_highlights?: Json
          hub_show_agenda?: boolean
          hub_show_all_locations?: boolean
          hub_show_events?: boolean
          hub_show_prayer?: boolean
          hub_show_visitor?: boolean
          hub_show_whatsapp?: boolean
          hub_slides?: Json
          hub_whatsapp?: string | null
          id: string
          instagram_columns?: number
          instagram_post_count?: number
          live_url?: string | null
          media_audio_url?: string | null
          media_show_audio?: boolean
          media_show_youtube?: boolean
          media_youtube_url?: string | null
          onboarded?: boolean
          pix_key?: string | null
          primary_color?: string
          religion_profile?: Database["public"]["Enums"]["religion_profile"]
          show_end_time?: boolean
          show_live_fields?: boolean
          site_id?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_website?: string | null
          social_youtube?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string
          updated_at?: string
          visitor_welcome_message?: string | null
          visitor_whatsapp?: string | null
          weekly_message?: string | null
          weekly_verse?: string | null
          weekly_verse_ref?: string | null
        }
        Update: {
          brand_empty_message?: string
          brand_footer_logo_url?: string | null
          brand_logo_height_px?: number
          brand_logo_url?: string | null
          brand_subtitle?: string
          brand_title?: string
          brand_today_title?: string
          card_accent_color?: string | null
          card_field_size_px?: number | null
          card_footer_size_px?: number | null
          card_footer_text?: string | null
          card_label_size_px?: number | null
          card_logo_height_px?: number | null
          card_logo_url?: string | null
          card_title_size_px?: number | null
          created_at?: string
          cta_enabled?: boolean
          cta_label?: string
          current_plan?: string | null
          plan_tier?: string
          custom_slug?: string | null
          donations_fixed_image_url?: string | null
          force_show_type?: boolean
          gallery_urls?: Json
          hub_bio?: string | null
          hub_cover_url?: string | null
          hub_enabled?: boolean
          hub_highlights?: Json
          hub_show_agenda?: boolean
          hub_show_all_locations?: boolean
          hub_show_events?: boolean
          hub_show_prayer?: boolean
          hub_show_visitor?: boolean
          hub_show_whatsapp?: boolean
          hub_slides?: Json
          hub_whatsapp?: string | null
          id?: string
          instagram_columns?: number
          instagram_post_count?: number
          live_url?: string | null
          media_audio_url?: string | null
          media_show_audio?: boolean
          media_show_youtube?: boolean
          media_youtube_url?: string | null
          onboarded?: boolean
          pix_key?: string | null
          primary_color?: string
          religion_profile?: Database["public"]["Enums"]["religion_profile"]
          show_end_time?: boolean
          show_live_fields?: boolean
          site_id?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_website?: string | null
          social_youtube?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string
          updated_at?: string
          visitor_welcome_message?: string | null
          visitor_whatsapp?: string | null
          weekly_message?: string | null
          weekly_verse?: string | null
          weekly_verse_ref?: string | null
        }
        Relationships: []
      }
      celebration_types: {
        Row: {
          account_id: string
          active: boolean
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          account_id: string
          active?: boolean
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          active?: boolean
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "celebration_types_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_entries: {
        Row: {
          account_id: string
          checked_in_at: string
          id: string
          member_id: string | null
          session_id: string
          visitor_name: string | null
          visitor_phone: string | null
        }
        Insert: {
          account_id: string
          checked_in_at?: string
          id?: string
          member_id?: string | null
          session_id: string
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Update: {
          account_id?: string
          checked_in_at?: string
          id?: string
          member_id?: string | null
          session_id?: string
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Relationships: []
      }
      checkin_sessions: {
        Row: {
          account_id: string
          active: boolean
          created_at: string
          id: string
          notes: string | null
          session_date: string
          start_time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          account_id: string
          active?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          session_date?: string
          start_time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          active?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          session_date?: string
          start_time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      devotionals: {
        Row: {
          account_id: string
          created_at: string
          devotional_date: string
          id: string
          message: string | null
          published: boolean
          updated_at: string
          verse_ref: string
          verse_text: string
        }
        Insert: {
          account_id: string
          created_at?: string
          devotional_date?: string
          id?: string
          message?: string | null
          published?: boolean
          updated_at?: string
          verse_ref: string
          verse_text: string
        }
        Update: {
          account_id?: string
          created_at?: string
          devotional_date?: string
          id?: string
          message?: string | null
          published?: boolean
          updated_at?: string
          verse_ref?: string
          verse_text?: string
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          account_id: string | null
          active: boolean
          body: string
          created_at: string
          id: string
          is_global: boolean
          kind: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          active?: boolean
          body?: string
          created_at?: string
          id?: string
          is_global?: boolean
          kind: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          active?: boolean
          body?: string
          created_at?: string
          id?: string
          is_global?: boolean
          kind?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      donation_campaigns: {
        Row: {
          account_id: string
          active: boolean
          created_at: string
          description: string
          featured: boolean
          goal_cents: number | null
          id: string
          image_url: string | null
          pix_key: string
          pix_key_type: string
          recipient_city: string
          recipient_name: string
          sort_order: number
          suggested_amounts_cents: Json
          title: string
          updated_at: string
        }
        Insert: {
          account_id: string
          active?: boolean
          created_at?: string
          description?: string
          featured?: boolean
          goal_cents?: number | null
          id?: string
          image_url?: string | null
          pix_key: string
          pix_key_type?: string
          recipient_city?: string
          recipient_name: string
          sort_order?: number
          suggested_amounts_cents?: Json
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          active?: boolean
          created_at?: string
          description?: string
          featured?: boolean
          goal_cents?: number | null
          id?: string
          image_url?: string | null
          pix_key?: string
          pix_key_type?: string
          recipient_city?: string
          recipient_name?: string
          sort_order?: number
          suggested_amounts_cents?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          account_id: string
          amount_cents: number
          campaign_id: string | null
          copy_paste: string | null
          created_at: string
          donor_email: string | null
          donor_name: string | null
          donor_phone: string | null
          id: string
          member_id: string | null
          mercadopago_payment_id: string | null
          paid_at: string | null
          qr_code: string | null
          raw_response: Json | null
          status: string
          updated_at: string
          webhook_payload: Json | null
        }
        Insert: {
          account_id: string
          amount_cents: number
          campaign_id?: string | null
          copy_paste?: string | null
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          member_id?: string | null
          mercadopago_payment_id?: string | null
          paid_at?: string | null
          qr_code?: string | null
          raw_response?: Json | null
          status?: string
          updated_at?: string
          webhook_payload?: Json | null
        }
        Update: {
          account_id?: string
          amount_cents?: number
          campaign_id?: string | null
          copy_paste?: string | null
          created_at?: string
          donor_email?: string | null
          donor_name?: string | null
          donor_phone?: string | null
          id?: string
          member_id?: string | null
          mercadopago_payment_id?: string | null
          paid_at?: string | null
          qr_code?: string | null
          raw_response?: Json | null
          status?: string
          updated_at?: string
          webhook_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "donation_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      ebd_attendance: {
        Row: {
          account_id: string
          attendance_date: string
          class_id: string
          created_at: string
          id: string
          member_id: string
          present: boolean
        }
        Insert: {
          account_id: string
          attendance_date: string
          class_id: string
          created_at?: string
          id?: string
          member_id: string
          present?: boolean
        }
        Update: {
          account_id?: string
          attendance_date?: string
          class_id?: string
          created_at?: string
          id?: string
          member_id?: string
          present?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ebd_attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "ebd_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ebd_attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      ebd_classes: {
        Row: {
          account_id: string
          active: boolean
          age_range: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          start_time: string | null
          teacher_name: string | null
          updated_at: string
          weekday: number | null
        }
        Insert: {
          account_id: string
          active?: boolean
          age_range?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
          start_time?: string | null
          teacher_name?: string | null
          updated_at?: string
          weekday?: number | null
        }
        Update: {
          account_id?: string
          active?: boolean
          age_range?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          start_time?: string | null
          teacher_name?: string | null
          updated_at?: string
          weekday?: number | null
        }
        Relationships: []
      }
      ebd_enrollments: {
        Row: {
          account_id: string
          active: boolean
          class_id: string
          created_at: string
          enrolled_at: string
          id: string
          member_id: string
        }
        Insert: {
          account_id: string
          active?: boolean
          class_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          member_id: string
        }
        Update: {
          account_id?: string
          active?: boolean
          class_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ebd_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "ebd_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ebd_enrollments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      event_pages: {
        Row: {
          account_id: string
          active: boolean
          allow_free: boolean
          cover_image_url: string | null
          created_at: string
          description: string
          end_time: string | null
          event_date: string
          id: string
          location_address: string | null
          location_name: string
          max_attendees: number | null
          price_cents: number
          primary_color: string
          slug: string
          start_time: string
          title: string
          updated_at: string
          whatsapp_contact: string | null
        }
        Insert: {
          account_id: string
          active?: boolean
          allow_free?: boolean
          cover_image_url?: string | null
          created_at?: string
          description?: string
          end_time?: string | null
          event_date: string
          id?: string
          location_address?: string | null
          location_name?: string
          max_attendees?: number | null
          price_cents?: number
          primary_color?: string
          slug: string
          start_time: string
          title: string
          updated_at?: string
          whatsapp_contact?: string | null
        }
        Update: {
          account_id?: string
          active?: boolean
          allow_free?: boolean
          cover_image_url?: string | null
          created_at?: string
          description?: string
          end_time?: string | null
          event_date?: string
          id?: string
          location_address?: string | null
          location_name?: string
          max_attendees?: number | null
          price_cents?: number
          primary_color?: string
          slug?: string
          start_time?: string
          title?: string
          updated_at?: string
          whatsapp_contact?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          account_id: string
          amount_cents: number
          created_at: string
          email: string
          event_page_id: string
          id: string
          name: string
          notes: string | null
          paid_at: string | null
          phone: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          amount_cents?: number
          created_at?: string
          email: string
          event_page_id: string
          id?: string
          name: string
          notes?: string | null
          paid_at?: string | null
          phone?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount_cents?: number
          created_at?: string
          email?: string
          event_page_id?: string
          id?: string
          name?: string
          notes?: string | null
          paid_at?: string | null
          phone?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_page_id_fkey"
            columns: ["event_page_id"]
            isOneToOne: false
            referencedRelation: "event_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          account_id: string
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          is_live: boolean
          live_url: string | null
          location_id: string | null
          location_name: string
          show_type: boolean
          start_time: string
          type_id: string | null
          type_name: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          is_live?: boolean
          live_url?: string | null
          location_id?: string | null
          location_name: string
          show_type?: boolean
          start_time: string
          type_id?: string | null
          type_name: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          is_live?: boolean
          live_url?: string | null
          location_id?: string | null
          location_name?: string
          show_type?: boolean
          start_time?: string
          type_id?: string | null
          type_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "celebration_types"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_suggestions: {
        Row: {
          account_id: string | null
          created_at: string
          id: string
          message: string
          status: string
          title: string
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          id?: string
          message: string
          status?: string
          title: string
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string
          id?: string
          message?: string
          status?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_suggestions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_connections: {
        Row: {
          access_token: string
          account_id: string
          connected_at: string
          id: string
          ig_user_id: string
          token_expires_at: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          access_token: string
          account_id: string
          connected_at?: string
          id?: string
          ig_user_id: string
          token_expires_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          access_token?: string
          account_id?: string
          connected_at?: string
          id?: string
          ig_user_id?: string
          token_expires_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instagram_connections_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      live_stream_overrides: {
        Row: {
          account_id: string
          cancelled: boolean
          created_at: string
          event_date: string
          id: string
          live_stream_id: string
          live_url: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          cancelled?: boolean
          created_at?: string
          event_date: string
          id?: string
          live_stream_id: string
          live_url?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          cancelled?: boolean
          created_at?: string
          event_date?: string
          id?: string
          live_stream_id?: string
          live_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_stream_overrides_live_stream_id_fkey"
            columns: ["live_stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          account_id: string
          active: boolean
          created_at: string
          default_live_url: string | null
          duration_minutes: number
          event_date: string | null
          id: string
          minutes_before: number
          recurrence: string
          sort_order: number
          start_time: string
          title: string
          updated_at: string
          weekday: number | null
        }
        Insert: {
          account_id: string
          active?: boolean
          created_at?: string
          default_live_url?: string | null
          duration_minutes?: number
          event_date?: string | null
          id?: string
          minutes_before?: number
          recurrence?: string
          sort_order?: number
          start_time: string
          title: string
          updated_at?: string
          weekday?: number | null
        }
        Update: {
          account_id?: string
          active?: boolean
          created_at?: string
          default_live_url?: string | null
          duration_minutes?: number
          event_date?: string | null
          id?: string
          minutes_before?: number
          recurrence?: string
          sort_order?: number
          start_time?: string
          title?: string
          updated_at?: string
          weekday?: number | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          account_id: string
          active: boolean
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          is_main: boolean
          latitude: number | null
          longitude: number | null
          maps_url: string | null
          name: string
          neighborhood: string | null
          office_hours: string | null
          phone: string | null
          place_id: string | null
          postal_code: string | null
          sort_order: number
          state: string | null
          transport_info: string | null
          uber_url: string | null
          updated_at: string
          waze_url: string | null
          whatsapp: string | null
        }
        Insert: {
          account_id: string
          active?: boolean
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_main?: boolean
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          name: string
          neighborhood?: string | null
          office_hours?: string | null
          phone?: string | null
          place_id?: string | null
          postal_code?: string | null
          sort_order?: number
          state?: string | null
          transport_info?: string | null
          uber_url?: string | null
          updated_at?: string
          waze_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          account_id?: string
          active?: boolean
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_main?: boolean
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          name?: string
          neighborhood?: string | null
          office_hours?: string | null
          phone?: string | null
          place_id?: string | null
          postal_code?: string | null
          sort_order?: number
          state?: string | null
          transport_info?: string | null
          uber_url?: string | null
          updated_at?: string
          waze_url?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      member_documents: {
        Row: {
          account_id: string
          body: string
          created_at: string
          id: string
          issued_at: string
          member_id: string | null
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          account_id: string
          body?: string
          created_at?: string
          id?: string
          issued_at?: string
          member_id?: string | null
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          body?: string
          created_at?: string
          id?: string
          issued_at?: string
          member_id?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_documents_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          account_id: string
          address_city: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          birth_date: string | null
          congregation: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string
          gender: string | null
          id: string
          is_tither: boolean
          marital_status: string | null
          member_since: string | null
          notes: string | null
          phone: string | null
          photo_url: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          address_city?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          birth_date?: string | null
          congregation?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          is_tither?: boolean
          marital_status?: string | null
          member_since?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          address_city?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          birth_date?: string | null
          congregation?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          is_tither?: boolean
          marital_status?: string | null
          member_since?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      mercadopago_connections: {
        Row: {
          access_token: string
          account_id: string
          connected_at: string
          public_key: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          account_id: string
          connected_at?: string
          public_key?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          account_id?: string
          connected_at?: string
          public_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mercadopago_connections_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          account_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          published: boolean
          sort_order: number
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          account_id: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          subtitle?: string
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          sort_order?: number
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          account_id: string
          amount_cents: number
          ativopay_transaction_id: string | null
          copy_paste: string | null
          created_at: string
          expires_at: string | null
          id: string
          kind: string
          paid_at: string | null
          pay_url: string | null
          plan: string | null
          product_id: string | null
          qr_code: string | null
          raw_response: Json | null
          status: string
          updated_at: string
          webhook_payload: Json | null
        }
        Insert: {
          account_id: string
          amount_cents: number
          ativopay_transaction_id?: string | null
          copy_paste?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          kind?: string
          paid_at?: string | null
          pay_url?: string | null
          plan?: string | null
          product_id?: string | null
          qr_code?: string | null
          raw_response?: Json | null
          status?: string
          updated_at?: string
          webhook_payload?: Json | null
        }
        Update: {
          account_id?: string
          amount_cents?: number
          ativopay_transaction_id?: string | null
          copy_paste?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          kind?: string
          paid_at?: string | null
          pay_url?: string | null
          plan?: string | null
          product_id?: string | null
          qr_code?: string | null
          raw_response?: Json | null
          status?: string
          updated_at?: string
          webhook_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_branding: {
        Row: {
          brand_text: string
          created_at: string
          icon_text: string
          icon_url: string | null
          id: boolean
          logo_height_px: number
          logo_url: string | null
          subtitle: string
          updated_at: string
        }
        Insert: {
          brand_text?: string
          created_at?: string
          icon_text?: string
          icon_url?: string | null
          id?: boolean
          logo_height_px?: number
          logo_url?: string | null
          subtitle?: string
          updated_at?: string
        }
        Update: {
          brand_text?: string
          created_at?: string
          icon_text?: string
          icon_url?: string | null
          id?: boolean
          logo_height_px?: number
          logo_url?: string | null
          subtitle?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_payment_settings: {
        Row: {
          ativopay_api_key: string | null
          ativopay_webhook_secret: string | null
          id: boolean
          mercadopago_access_token: string | null
          updated_at: string
        }
        Insert: {
          ativopay_api_key?: string | null
          ativopay_webhook_secret?: string | null
          id?: boolean
          mercadopago_access_token?: string | null
          updated_at?: string
        }
        Update: {
          ativopay_api_key?: string | null
          ativopay_webhook_secret?: string | null
          id?: boolean
          mercadopago_access_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prayer_interactions: {
        Row: {
          created_at: string
          id: string
          prayer_request_id: string
          visitor_fingerprint: string
        }
        Insert: {
          created_at?: string
          id?: string
          prayer_request_id: string
          visitor_fingerprint: string
        }
        Update: {
          created_at?: string
          id?: string
          prayer_request_id?: string
          visitor_fingerprint?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_interactions_prayer_request_id_fkey"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          account_id: string
          created_at: string
          email: string | null
          id: string
          is_anonymous: boolean
          message: string
          name: string
          phone: string | null
          prayer_count: number
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_anonymous?: boolean
          message: string
          name: string
          phone?: string | null
          prayer_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_anonymous?: boolean
          message?: string
          name?: string
          phone?: string | null
          prayer_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_purchases: {
        Row: {
          account_id: string
          amount_cents: number
          created_at: string
          id: string
          product_id: string
          purchased_at: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          amount_cents?: number
          created_at?: string
          id?: string
          product_id: string
          purchased_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount_cents?: number
          created_at?: string
          id?: string
          product_id?: string
          purchased_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_purchases_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          badge: string | null
          created_at: string
          description: string
          external_url: string | null
          featured: boolean
          features: Json
          id: string
          image_url: string | null
          name: string
          price_cents: number
          slug: string
          sort_order: number
          tagline: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          created_at?: string
          description?: string
          external_url?: string | null
          featured?: boolean
          features?: Json
          id?: string
          image_url?: string | null
          name: string
          price_cents?: number
          slug: string
          sort_order?: number
          tagline?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          created_at?: string
          description?: string
          external_url?: string | null
          featured?: boolean
          features?: Json
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number
          slug?: string
          sort_order?: number
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      small_group_members: {
        Row: {
          account_id: string
          created_at: string
          group_id: string
          id: string
          joined_at: string
          member_id: string
          role: string
        }
        Insert: {
          account_id: string
          created_at?: string
          group_id: string
          id?: string
          joined_at?: string
          member_id: string
          role?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          group_id?: string
          id?: string
          joined_at?: string
          member_id?: string
          role?: string
        }
        Relationships: []
      }
      small_groups: {
        Row: {
          account_id: string
          active: boolean
          address: string | null
          capacity: number | null
          created_at: string
          description: string | null
          id: string
          leader_name: string | null
          leader_phone: string | null
          name: string
          neighborhood: string | null
          sort_order: number
          start_time: string | null
          updated_at: string
          weekday: number | null
        }
        Insert: {
          account_id: string
          active?: boolean
          address?: string | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          leader_name?: string | null
          leader_phone?: string | null
          name: string
          neighborhood?: string | null
          sort_order?: number
          start_time?: string | null
          updated_at?: string
          weekday?: number | null
        }
        Update: {
          account_id?: string
          active?: boolean
          address?: string | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          leader_name?: string | null
          leader_phone?: string | null
          name?: string
          neighborhood?: string | null
          sort_order?: number
          start_time?: string | null
          updated_at?: string
          weekday?: number | null
        }
        Relationships: []
      }
      system_updates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          title: string
          version: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          title: string
          version?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string
          version?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
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
      visitors: {
        Row: {
          account_id: string
          age_range: string | null
          allow_contact: boolean
          created_at: string
          email: string | null
          how_found: string | null
          id: string
          is_first_time: boolean
          name: string
          notes: string | null
          phone: string | null
          prayer_request: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          age_range?: string | null
          allow_contact?: boolean
          created_at?: string
          email?: string | null
          how_found?: string | null
          id?: string
          is_first_time?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          prayer_request?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          age_range?: string | null
          allow_contact?: boolean
          created_at?: string
          email?: string | null
          how_found?: string | null
          id?: string
          is_first_time?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          prayer_request?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_credit_purchases: {
        Row: {
          account_id: string
          amount_cents: number
          created_at: string
          id: string
          message_count: number
          package_id: string | null
          paid_at: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          amount_cents: number
          created_at?: string
          id?: string
          message_count: number
          package_id?: string | null
          paid_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount_cents?: number
          created_at?: string
          id?: string
          message_count?: number
          package_id?: string | null
          paid_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_credit_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          account_id: string
          content: string
          cost_credits: number
          created_at: string
          error_message: string | null
          id: string
          kind: string
          member_id: string | null
          phone: string
          provider_message_id: string | null
          recipient_name: string | null
          scheduled_date: string
          scheduled_for: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          content: string
          cost_credits?: number
          created_at?: string
          error_message?: string | null
          id?: string
          kind?: string
          member_id?: string | null
          phone: string
          provider_message_id?: string | null
          recipient_name?: string | null
          scheduled_date?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          content?: string
          cost_credits?: number
          created_at?: string
          error_message?: string | null
          id?: string
          kind?: string
          member_id?: string | null
          phone?: string
          provider_message_id?: string | null
          recipient_name?: string | null
          scheduled_date?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_packages: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          message_count: number
          name: string
          price_cents: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          message_count: number
          name: string
          price_cents: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          message_count?: number
          name?: string
          price_cents?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_settings: {
        Row: {
          account_id: string
          birthday_enabled: boolean
          birthday_template: string
          celula_reminder_enabled: boolean
          celula_reminder_template: string
          created_at: string
          credits_balance: number
          culto_reminder_enabled: boolean
          culto_reminder_template: string
          enabled: boolean
          newsletter_enabled: boolean
          newsletter_template: string
          prayer_request_enabled: boolean
          prayer_request_template: string
          send_hour_brt: number
          sender_name: string | null
          tithe_reminder_enabled: boolean
          tithe_reminder_template: string
          updated_at: string
          welcome_enabled: boolean
          welcome_template: string
        }
        Insert: {
          account_id: string
          birthday_enabled?: boolean
          birthday_template?: string
          celula_reminder_enabled?: boolean
          celula_reminder_template?: string
          created_at?: string
          credits_balance?: number
          culto_reminder_enabled?: boolean
          culto_reminder_template?: string
          enabled?: boolean
          newsletter_enabled?: boolean
          newsletter_template?: string
          prayer_request_enabled?: boolean
          prayer_request_template?: string
          send_hour_brt?: number
          sender_name?: string | null
          tithe_reminder_enabled?: boolean
          tithe_reminder_template?: string
          updated_at?: string
          welcome_enabled?: boolean
          welcome_template?: string
        }
        Update: {
          account_id?: string
          birthday_enabled?: boolean
          birthday_template?: string
          celula_reminder_enabled?: boolean
          celula_reminder_template?: string
          created_at?: string
          credits_balance?: number
          culto_reminder_enabled?: boolean
          culto_reminder_template?: string
          enabled?: boolean
          newsletter_enabled?: boolean
          newsletter_template?: string
          prayer_request_enabled?: boolean
          prayer_request_template?: string
          send_hour_brt?: number
          sender_name?: string | null
          tithe_reminder_enabled?: boolean
          tithe_reminder_template?: string
          updated_at?: string
          welcome_enabled?: boolean
          welcome_template?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_site_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      religion_profile:
        | "catolico"
        | "evangelico"
        | "adventista"
        | "batista"
        | "pentecostal"
        | "comunidade_crista"
      subscription_status: "trial" | "active" | "past_due" | "canceled"
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
      app_role: ["admin", "user"],
      religion_profile: [
        "catolico",
        "evangelico",
        "adventista",
        "batista",
        "pentecostal",
        "comunidade_crista",
      ],
      subscription_status: ["trial", "active", "past_due", "canceled"],
    },
  },
} as const
