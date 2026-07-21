export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  _realtime: {
    Tables: {
      extensions: {
        Row: {
          id: string
          inserted_at: string
          settings: Json | null
          tenant_external_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          id: string
          inserted_at: string
          settings?: Json | null
          tenant_external_id?: string | null
          type?: string | null
          updated_at: string
        }
        Update: {
          id?: string
          inserted_at?: string
          settings?: Json | null
          tenant_external_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extensions_tenant_external_id_fkey"
            columns: ["tenant_external_id"]
            referencedRelation: "tenants"
            referencedColumns: ["external_id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          enabled: boolean
          id: string
          inserted_at: string
          name: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          id: string
          inserted_at: string
          name: string
          updated_at: string
        }
        Update: {
          enabled?: boolean
          id?: string
          inserted_at?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          inserted_at: string | null
          version: number
        }
        Insert: {
          inserted_at?: string | null
          version: number
        }
        Update: {
          inserted_at?: string | null
          version?: number
        }
        Relationships: []
      }
      tenants: {
        Row: {
          broadcast_adapter: string | null
          client_presence_window_ms: number | null
          external_id: string | null
          feature_flags: Json
          id: string
          inserted_at: string
          jwt_jwks: Json | null
          jwt_secret: string | null
          max_bytes_per_second: number
          max_channels_per_client: number
          max_client_presence_events_per_window: number | null
          max_concurrent_users: number
          max_events_per_second: number
          max_joins_per_second: number
          max_payload_size_in_kb: number | null
          max_presence_events_per_second: number | null
          migrations_ran: number | null
          name: string | null
          notify_private_alpha: boolean | null
          postgres_cdc_default: string | null
          presence_enabled: boolean
          private_only: boolean
          suspend: boolean | null
          updated_at: string
        }
        Insert: {
          broadcast_adapter?: string | null
          client_presence_window_ms?: number | null
          external_id?: string | null
          feature_flags?: Json
          id: string
          inserted_at: string
          jwt_jwks?: Json | null
          jwt_secret?: string | null
          max_bytes_per_second?: number
          max_channels_per_client?: number
          max_client_presence_events_per_window?: number | null
          max_concurrent_users?: number
          max_events_per_second?: number
          max_joins_per_second?: number
          max_payload_size_in_kb?: number | null
          max_presence_events_per_second?: number | null
          migrations_ran?: number | null
          name?: string | null
          notify_private_alpha?: boolean | null
          postgres_cdc_default?: string | null
          presence_enabled?: boolean
          private_only?: boolean
          suspend?: boolean | null
          updated_at: string
        }
        Update: {
          broadcast_adapter?: string | null
          client_presence_window_ms?: number | null
          external_id?: string | null
          feature_flags?: Json
          id?: string
          inserted_at?: string
          jwt_jwks?: Json | null
          jwt_secret?: string | null
          max_bytes_per_second?: number
          max_channels_per_client?: number
          max_client_presence_events_per_window?: number | null
          max_concurrent_users?: number
          max_events_per_second?: number
          max_joins_per_second?: number
          max_payload_size_in_kb?: number | null
          max_presence_events_per_second?: number | null
          migrations_ran?: number | null
          name?: string | null
          notify_private_alpha?: boolean | null
          postgres_cdc_default?: string | null
          presence_enabled?: boolean
          private_only?: boolean
          suspend?: boolean | null
          updated_at?: string
        }
        Relationships: []
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
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Relationships: []
      }
      custom_oauth_providers: {
        Row: {
          acceptable_client_ids: string[]
          attribute_mapping: Json
          authorization_params: Json
          authorization_url: string | null
          cached_discovery: Json | null
          client_id: string
          client_secret: string
          created_at: string
          discovery_cached_at: string | null
          discovery_url: string | null
          email_optional: boolean
          enabled: boolean
          id: string
          identifier: string
          issuer: string | null
          jwks_uri: string | null
          name: string
          pkce_enabled: boolean
          provider_type: string
          scopes: string[]
          skip_nonce_check: boolean
          token_url: string | null
          updated_at: string
          userinfo_url: string | null
        }
        Insert: {
          acceptable_client_ids?: string[]
          attribute_mapping?: Json
          authorization_params?: Json
          authorization_url?: string | null
          cached_discovery?: Json | null
          client_id: string
          client_secret: string
          created_at?: string
          discovery_cached_at?: string | null
          discovery_url?: string | null
          email_optional?: boolean
          enabled?: boolean
          id?: string
          identifier: string
          issuer?: string | null
          jwks_uri?: string | null
          name: string
          pkce_enabled?: boolean
          provider_type: string
          scopes?: string[]
          skip_nonce_check?: boolean
          token_url?: string | null
          updated_at?: string
          userinfo_url?: string | null
        }
        Update: {
          acceptable_client_ids?: string[]
          attribute_mapping?: Json
          authorization_params?: Json
          authorization_url?: string | null
          cached_discovery?: Json | null
          client_id?: string
          client_secret?: string
          created_at?: string
          discovery_cached_at?: string | null
          discovery_url?: string | null
          email_optional?: boolean
          enabled?: boolean
          id?: string
          identifier?: string
          issuer?: string | null
          jwks_uri?: string | null
          name?: string
          pkce_enabled?: boolean
          provider_type?: string
          scopes?: string[]
          skip_nonce_check?: boolean
          token_url?: string | null
          updated_at?: string
          userinfo_url?: string | null
        }
        Relationships: []
      }
      flow_state: {
        Row: {
          auth_code: string | null
          auth_code_issued_at: string | null
          authentication_method: string
          code_challenge: string | null
          code_challenge_method:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at: string | null
          email_optional: boolean
          id: string
          invite_token: string | null
          linking_target_id: string | null
          oauth_client_state_id: string | null
          provider_access_token: string | null
          provider_refresh_token: string | null
          provider_type: string
          referrer: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_code?: string | null
          auth_code_issued_at?: string | null
          authentication_method: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string | null
          email_optional?: boolean
          id: string
          invite_token?: string | null
          linking_target_id?: string | null
          oauth_client_state_id?: string | null
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type: string
          referrer?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_code?: string | null
          auth_code_issued_at?: string | null
          authentication_method?: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string | null
          email_optional?: boolean
          id?: string
          invite_token?: string | null
          linking_target_id?: string | null
          oauth_client_state_id?: string | null
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type?: string
          referrer?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      identities: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          identity_data: Json
          last_sign_in_at: string | null
          provider: string
          provider_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data: Json
          last_sign_in_at?: string | null
          provider: string
          provider_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data?: Json
          last_sign_in_at?: string | null
          provider?: string
          provider_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instances: {
        Row: {
          created_at: string | null
          id: string
          raw_base_config: string | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      mfa_amr_claims: {
        Row: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Update: {
          authentication_method?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_challenges: {
        Row: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code: string | null
          verified_at: string | null
          web_authn_session_data: Json | null
        }
        Insert: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Update: {
          created_at?: string
          factor_id?: string
          id?: string
          ip_address?: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
            columns: ["factor_id"]
            referencedRelation: "mfa_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_factors: {
        Row: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name: string | null
          id: string
          last_challenged_at: string | null
          last_webauthn_challenge_data: Json | null
          phone: string | null
          secret: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid: string | null
          web_authn_credential: Json | null
        }
        Insert: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id: string
          last_challenged_at?: string | null
          last_webauthn_challenge_data?: Json | null
          phone?: string | null
          secret?: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Update: {
          created_at?: string
          factor_type?: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id?: string
          last_challenged_at?: string | null
          last_webauthn_challenge_data?: Json | null
          phone?: string | null
          secret?: string | null
          status?: Database["auth"]["Enums"]["factor_status"]
          updated_at?: string
          user_id?: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_authorizations: {
        Row: {
          approved_at: string | null
          authorization_code: string | null
          authorization_id: string
          client_id: string
          code_challenge: string | null
          code_challenge_method:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at: string
          expires_at: string
          id: string
          nonce: string | null
          redirect_uri: string
          resource: string | null
          response_type: Database["auth"]["Enums"]["oauth_response_type"]
          scope: string
          state: string | null
          status: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          authorization_code?: string | null
          authorization_id: string
          client_id: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string
          expires_at?: string
          id: string
          nonce?: string | null
          redirect_uri: string
          resource?: string | null
          response_type?: Database["auth"]["Enums"]["oauth_response_type"]
          scope: string
          state?: string | null
          status?: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          authorization_code?: string | null
          authorization_id?: string
          client_id?: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string
          expires_at?: string
          id?: string
          nonce?: string | null
          redirect_uri?: string
          resource?: string | null
          response_type?: Database["auth"]["Enums"]["oauth_response_type"]
          scope?: string
          state?: string | null
          status?: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oauth_authorizations_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_authorizations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_client_states: {
        Row: {
          code_verifier: string | null
          created_at: string
          id: string
          provider_type: string
        }
        Insert: {
          code_verifier?: string | null
          created_at: string
          id: string
          provider_type: string
        }
        Update: {
          code_verifier?: string | null
          created_at?: string
          id?: string
          provider_type?: string
        }
        Relationships: []
      }
      oauth_clients: {
        Row: {
          client_name: string | null
          client_secret_hash: string | null
          client_type: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri: string | null
          created_at: string
          deleted_at: string | null
          grant_types: string
          id: string
          logo_uri: string | null
          redirect_uris: string
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"]
          token_endpoint_auth_method: string
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          client_secret_hash?: string | null
          client_type?: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri?: string | null
          created_at?: string
          deleted_at?: string | null
          grant_types: string
          id: string
          logo_uri?: string | null
          redirect_uris: string
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"]
          token_endpoint_auth_method: string
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          client_secret_hash?: string | null
          client_type?: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri?: string | null
          created_at?: string
          deleted_at?: string | null
          grant_types?: string
          id?: string
          logo_uri?: string | null
          redirect_uris?: string
          registration_type?: Database["auth"]["Enums"]["oauth_registration_type"]
          token_endpoint_auth_method?: string
          updated_at?: string
        }
        Relationships: []
      }
      oauth_consents: {
        Row: {
          client_id: string
          granted_at: string
          id: string
          revoked_at: string | null
          scopes: string
          user_id: string
        }
        Insert: {
          client_id: string
          granted_at?: string
          id: string
          revoked_at?: string | null
          scopes: string
          user_id: string
        }
        Update: {
          client_id?: string
          granted_at?: string
          id?: string
          revoked_at?: string | null
          scopes?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_consents_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_consents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      one_time_tokens: {
        Row: {
          created_at: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relates_to?: string
          token_hash?: string
          token_type?: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          id: number
          instance_id: string | null
          parent: string | null
          revoked: boolean | null
          session_id: string | null
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_providers: {
        Row: {
          attribute_mapping: Json | null
          created_at: string | null
          entity_id: string
          id: string
          metadata_url: string | null
          metadata_xml: string
          name_id_format: string | null
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id: string
          id: string
          metadata_url?: string | null
          metadata_xml: string
          name_id_format?: string | null
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id?: string
          id?: string
          metadata_url?: string | null
          metadata_xml?: string
          name_id_format?: string | null
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_relay_states: {
        Row: {
          created_at: string | null
          flow_state_id: string | null
          for_email: string | null
          id: string
          redirect_to: string | null
          request_id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id: string
          redirect_to?: string | null
          request_id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id?: string
          redirect_to?: string | null
          request_id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey"
            columns: ["flow_state_id"]
            referencedRelation: "flow_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          version: string
        }
        Insert: {
          version: string
        }
        Update: {
          version?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null
          created_at: string | null
          factor_id: string | null
          id: string
          ip: unknown
          not_after: string | null
          oauth_client_id: string | null
          refresh_token_counter: number | null
          refresh_token_hmac_key: string | null
          refreshed_at: string | null
          scopes: string | null
          tag: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id: string
          ip?: unknown
          not_after?: string | null
          oauth_client_id?: string | null
          refresh_token_counter?: number | null
          refresh_token_hmac_key?: string | null
          refreshed_at?: string | null
          scopes?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id?: string
          ip?: unknown
          not_after?: string | null
          oauth_client_id?: string | null
          refresh_token_counter?: number | null
          refresh_token_hmac_key?: string | null
          refreshed_at?: string | null
          scopes?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_oauth_client_id_fkey"
            columns: ["oauth_client_id"]
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_providers: {
        Row: {
          created_at: string | null
          disabled: boolean | null
          id: string
          resource_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          disabled?: boolean | null
          id: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          disabled?: boolean | null
          id?: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      webauthn_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          expires_at: string
          id: string
          session_data: Json
          user_id: string | null
        }
        Insert: {
          challenge_type: string
          created_at?: string
          expires_at: string
          id?: string
          session_data: Json
          user_id?: string | null
        }
        Update: {
          challenge_type?: string
          created_at?: string
          expires_at?: string
          id?: string
          session_data?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webauthn_challenges_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      webauthn_credentials: {
        Row: {
          aaguid: string | null
          attestation_type: string
          backed_up: boolean
          backup_eligible: boolean
          created_at: string
          credential_id: string
          friendly_name: string
          id: string
          last_used_at: string | null
          public_key: string
          sign_count: number
          transports: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          aaguid?: string | null
          attestation_type?: string
          backed_up?: boolean
          backup_eligible?: boolean
          created_at?: string
          credential_id: string
          friendly_name?: string
          id?: string
          last_used_at?: string | null
          public_key: string
          sign_count?: number
          transports?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          aaguid?: string | null
          attestation_type?: string
          backed_up?: boolean
          backup_eligible?: boolean
          created_at?: string
          credential_id?: string
          friendly_name?: string
          id?: string
          last_used_at?: string | null
          public_key?: string
          sign_count?: number
          transports?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webauthn_credentials_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email: { Args: never; Returns: string }
      jwt: { Args: never; Returns: Json }
      role: { Args: never; Returns: string }
      uid: { Args: never; Returns: string }
    }
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3"
      code_challenge_method: "s256" | "plain"
      factor_status: "unverified" | "verified"
      factor_type: "totp" | "webauthn" | "phone"
      oauth_authorization_status: "pending" | "approved" | "denied" | "expired"
      oauth_client_type: "public" | "confidential"
      oauth_registration_type: "dynamic" | "manual"
      oauth_response_type: "code"
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  extensions: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      pg_stat_statements: {
        Row: {
          blk_read_time: number | null
          blk_write_time: number | null
          calls: number | null
          dbid: unknown
          jit_emission_count: number | null
          jit_emission_time: number | null
          jit_functions: number | null
          jit_generation_time: number | null
          jit_inlining_count: number | null
          jit_inlining_time: number | null
          jit_optimization_count: number | null
          jit_optimization_time: number | null
          local_blks_dirtied: number | null
          local_blks_hit: number | null
          local_blks_read: number | null
          local_blks_written: number | null
          max_exec_time: number | null
          max_plan_time: number | null
          mean_exec_time: number | null
          mean_plan_time: number | null
          min_exec_time: number | null
          min_plan_time: number | null
          plans: number | null
          query: string | null
          queryid: number | null
          rows: number | null
          shared_blks_dirtied: number | null
          shared_blks_hit: number | null
          shared_blks_read: number | null
          shared_blks_written: number | null
          stddev_exec_time: number | null
          stddev_plan_time: number | null
          temp_blk_read_time: number | null
          temp_blk_write_time: number | null
          temp_blks_read: number | null
          temp_blks_written: number | null
          toplevel: boolean | null
          total_exec_time: number | null
          total_plan_time: number | null
          userid: unknown
          wal_bytes: number | null
          wal_fpi: number | null
          wal_records: number | null
        }
        Relationships: []
      }
      pg_stat_statements_info: {
        Row: {
          dealloc: number | null
          stats_reset: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      algorithm_sign: {
        Args: { algorithm: string; secret: string; signables: string }
        Returns: string
      }
      dearmor: { Args: { "": string }; Returns: string }
      gen_random_uuid: { Args: never; Returns: string }
      gen_salt: { Args: { "": string }; Returns: string }
      pg_stat_statements: {
        Args: { showtext: boolean }
        Returns: Record<string, unknown>[]
      }
      pg_stat_statements_info: { Args: never; Returns: Record<string, unknown> }
      pg_stat_statements_reset: {
        Args: { dbid?: unknown; queryid?: number; userid?: unknown }
        Returns: undefined
      }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      sign: {
        Args: { algorithm?: string; payload: Json; secret: string }
        Returns: string
      }
      try_cast_double: { Args: { inp: string }; Returns: number }
      url_decode: { Args: { data: string }; Returns: string }
      url_encode: { Args: { data: string }; Returns: string }
      uuid_generate_v1: { Args: never; Returns: string }
      uuid_generate_v1mc: { Args: never; Returns: string }
      uuid_generate_v3: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_generate_v4: { Args: never; Returns: string }
      uuid_generate_v5: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_nil: { Args: never; Returns: string }
      uuid_ns_dns: { Args: never; Returns: string }
      uuid_ns_oid: { Args: never; Returns: string }
      uuid_ns_url: { Args: never; Returns: string }
      uuid_ns_x500: { Args: never; Returns: string }
      verify: {
        Args: { algorithm?: string; secret: string; token: string }
        Returns: {
          header: Json
          payload: Json
          valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _internal_resolve: {
        Args: {
          extensions?: Json
          operationName?: string
          query: string
          variables?: Json
        }
        Returns: Json
      }
      comment_directive: { Args: { comment_: string }; Returns: Json }
      exception: { Args: { message: string }; Returns: string }
      get_schema_version: { Args: never; Returns: number }
      resolve: {
        Args: {
          extensions?: Json
          operationName?: string
          query: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  net: {
    Tables: {
      _http_response: {
        Row: {
          content: string | null
          content_type: string | null
          created: string
          error_msg: string | null
          headers: Json | null
          id: number | null
          status_code: number | null
          timed_out: boolean | null
        }
        Insert: {
          content?: string | null
          content_type?: string | null
          created?: string
          error_msg?: string | null
          headers?: Json | null
          id?: number | null
          status_code?: number | null
          timed_out?: boolean | null
        }
        Update: {
          content?: string | null
          content_type?: string | null
          created?: string
          error_msg?: string | null
          headers?: Json | null
          id?: number | null
          status_code?: number | null
          timed_out?: boolean | null
        }
        Relationships: []
      }
      http_request_queue: {
        Row: {
          body: string | null
          headers: Json
          id: number
          method: string
          timeout_milliseconds: number
          url: string
        }
        Insert: {
          body?: string | null
          headers: Json
          id?: number
          method: string
          timeout_milliseconds: number
          url: string
        }
        Update: {
          body?: string | null
          headers?: Json
          id?: number
          method?: string
          timeout_milliseconds?: number
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _await_response: { Args: { request_id: number }; Returns: boolean }
      _encode_url_with_params_array: {
        Args: { params_array: string[]; url: string }
        Returns: string
      }
      _http_collect_response: {
        Args: { async?: boolean; request_id: number }
        Returns: Database["net"]["CompositeTypes"]["http_response_result"]
        SetofOptions: {
          from: "*"
          to: "http_response_result"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _urlencode_string: { Args: { string: string }; Returns: string }
      check_worker_is_up: { Args: never; Returns: undefined }
      http_collect_response: {
        Args: { async?: boolean; request_id: number }
        Returns: Database["net"]["CompositeTypes"]["http_response_result"]
        SetofOptions: {
          from: "*"
          to: "http_response_result"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete: {
        Args: {
          headers?: Json
          params?: Json
          timeout_milliseconds?: number
          url: string
        }
        Returns: number
      }
      http_get: {
        Args: {
          headers?: Json
          params?: Json
          timeout_milliseconds?: number
          url: string
        }
        Returns: number
      }
      http_post: {
        Args: {
          body?: Json
          headers?: Json
          params?: Json
          timeout_milliseconds?: number
          url: string
        }
        Returns: number
      }
      worker_restart: { Args: never; Returns: boolean }
    }
    Enums: {
      request_status: "PENDING" | "SUCCESS" | "ERROR"
    }
    CompositeTypes: {
      http_response: {
        status_code: number | null
        headers: Json | null
        body: string | null
      }
      http_response_result: {
        status: Database["net"]["Enums"]["request_status"] | null
        message: string | null
        response: Database["net"]["CompositeTypes"]["http_response"] | null
      }
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: { p_usename: string }
        Returns: {
          password: string
          username: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_feature_overrides: {
        Row: {
          account_id: string
          enabled: boolean
          feature_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          enabled?: boolean
          feature_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          enabled?: boolean
          feature_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_feature_overrides_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_members: {
        Row: {
          account_id: string
          created_at: string
          id: string
          invited_by: string | null
          invited_email: string | null
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          invited_email?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          invited_email?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_members_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_role_permissions: {
        Row: {
          account_id: string
          permissions: Json
          role: string
          updated_at: string
        }
        Insert: {
          account_id: string
          permissions?: Json
          role: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          permissions?: Json
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_role_permissions_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
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
          custom_domain: string | null
          custom_domain_error: string | null
          custom_domain_last_checked_at: string | null
          custom_domain_status: string
          custom_domain_verification_token: string | null
          custom_domain_verified_at: string | null
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
          managed_domain_holder_address: string | null
          managed_domain_holder_document: string | null
          managed_domain_holder_email: string | null
          managed_domain_holder_name: string | null
          managed_domain_holder_phone: string | null
          managed_domain_notes: string | null
          managed_domain_requested_at: string | null
          managed_domain_requested_name: string | null
          managed_domain_status: string
          managed_domain_updated_at: string | null
          media_audio_url: string | null
          media_show_audio: boolean
          media_show_youtube: boolean
          media_youtube_url: string | null
          onboarded: boolean
          owner_name: string | null
          owner_phone: string | null
          pix_key: string | null
          plan_tier: string
          primary_color: string
          religion_profile: Database["public"]["Enums"]["religion_profile"]
          religion_terms: Json
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
          custom_domain?: string | null
          custom_domain_error?: string | null
          custom_domain_last_checked_at?: string | null
          custom_domain_status?: string
          custom_domain_verification_token?: string | null
          custom_domain_verified_at?: string | null
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
          managed_domain_holder_address?: string | null
          managed_domain_holder_document?: string | null
          managed_domain_holder_email?: string | null
          managed_domain_holder_name?: string | null
          managed_domain_holder_phone?: string | null
          managed_domain_notes?: string | null
          managed_domain_requested_at?: string | null
          managed_domain_requested_name?: string | null
          managed_domain_status?: string
          managed_domain_updated_at?: string | null
          media_audio_url?: string | null
          media_show_audio?: boolean
          media_show_youtube?: boolean
          media_youtube_url?: string | null
          onboarded?: boolean
          owner_name?: string | null
          owner_phone?: string | null
          pix_key?: string | null
          plan_tier?: string
          primary_color?: string
          religion_profile?: Database["public"]["Enums"]["religion_profile"]
          religion_terms?: Json
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
          custom_domain?: string | null
          custom_domain_error?: string | null
          custom_domain_last_checked_at?: string | null
          custom_domain_status?: string
          custom_domain_verification_token?: string | null
          custom_domain_verified_at?: string | null
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
          managed_domain_holder_address?: string | null
          managed_domain_holder_document?: string | null
          managed_domain_holder_email?: string | null
          managed_domain_holder_name?: string | null
          managed_domain_holder_phone?: string | null
          managed_domain_notes?: string | null
          managed_domain_requested_at?: string | null
          managed_domain_requested_name?: string | null
          managed_domain_status?: string
          managed_domain_updated_at?: string | null
          media_audio_url?: string | null
          media_show_audio?: boolean
          media_show_youtube?: boolean
          media_youtube_url?: string | null
          onboarded?: boolean
          owner_name?: string | null
          owner_phone?: string | null
          pix_key?: string | null
          plan_tier?: string
          primary_color?: string
          religion_profile?: Database["public"]["Enums"]["religion_profile"]
          religion_terms?: Json
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
      assets: {
        Row: {
          account_id: string
          acquired_at: string | null
          category: string
          created_at: string
          holder_member_id: string | null
          id: string
          loaned_at: string | null
          location_id: string | null
          name: string
          notes: string | null
          photo_url: string | null
          serial_or_invoice: string | null
          status: string
          updated_at: string
          value_cents: number | null
        }
        Insert: {
          account_id: string
          acquired_at?: string | null
          category?: string
          created_at?: string
          holder_member_id?: string | null
          id?: string
          loaned_at?: string | null
          location_id?: string | null
          name: string
          notes?: string | null
          photo_url?: string | null
          serial_or_invoice?: string | null
          status?: string
          updated_at?: string
          value_cents?: number | null
        }
        Update: {
          account_id?: string
          acquired_at?: string | null
          category?: string
          created_at?: string
          holder_member_id?: string | null
          id?: string
          loaned_at?: string | null
          location_id?: string | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          serial_or_invoice?: string | null
          status?: string
          updated_at?: string
          value_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_holder_member_id_fkey"
            columns: ["holder_member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_location_id_fkey"
            columns: ["location_id"]
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_id: string
          account_kind: string
          account_number: string | null
          active: boolean
          agency: string | null
          bank_name: string | null
          created_at: string
          holder_name: string | null
          id: string
          is_primary: boolean
          label: string
          notes: string | null
          pix_key: string | null
          pix_key_type: string | null
          updated_at: string
          visible_to_members: boolean
        }
        Insert: {
          account_id: string
          account_kind?: string
          account_number?: string | null
          active?: boolean
          agency?: string | null
          bank_name?: string | null
          created_at?: string
          holder_name?: string | null
          id?: string
          is_primary?: boolean
          label: string
          notes?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          updated_at?: string
          visible_to_members?: boolean
        }
        Update: {
          account_id?: string
          account_kind?: string
          account_number?: string | null
          active?: boolean
          agency?: string | null
          bank_name?: string | null
          created_at?: string
          holder_name?: string | null
          id?: string
          is_primary?: boolean
          label?: string
          notes?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          updated_at?: string
          visible_to_members?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          account_id: string
          created_at: string
          current_amount_cents: number
          description: string | null
          end_date: string | null
          goal_amount_cents: number
          id: string
          is_active: boolean
          name: string
          pix_key: string | null
          sort_order: number
          start_date: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          current_amount_cents?: number
          description?: string | null
          end_date?: string | null
          goal_amount_cents: number
          id?: string
          is_active?: boolean
          name: string
          pix_key?: string | null
          sort_order?: number
          start_date?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          current_amount_cents?: number
          description?: string | null
          end_date?: string | null
          goal_amount_cents?: number
          id?: string
          is_active?: boolean
          name?: string
          pix_key?: string | null
          sort_order?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
      child_checkin_entries: {
        Row: {
          account_id: string
          checked_in_at: string
          checked_out_at: string | null
          checked_out_by: string | null
          child_id: string
          created_at: string
          id: string
          incident_notes: string | null
          pickup_code_hash: string
          pickup_person: string | null
          session_id: string | null
        }
        Insert: {
          account_id: string
          checked_in_at?: string
          checked_out_at?: string | null
          checked_out_by?: string | null
          child_id: string
          created_at?: string
          id?: string
          incident_notes?: string | null
          pickup_code_hash: string
          pickup_person?: string | null
          session_id?: string | null
        }
        Update: {
          account_id?: string
          checked_in_at?: string
          checked_out_at?: string | null
          checked_out_by?: string | null
          child_id?: string
          created_at?: string
          id?: string
          incident_notes?: string | null
          pickup_code_hash?: string
          pickup_person?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_checkin_entries_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_checkin_entries_child_id_fkey"
            columns: ["child_id"]
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_checkin_entries_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "checkin_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          account_id: string
          active: boolean
          allergies: string | null
          authorized_pickups: string | null
          birth_date: string | null
          created_at: string
          full_name: string
          guardian_name: string
          guardian_phone: string
          id: string
          medical_notes: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          active?: boolean
          allergies?: string | null
          authorized_pickups?: string | null
          birth_date?: string | null
          created_at?: string
          full_name: string
          guardian_name: string
          guardian_phone: string
          id?: string
          medical_notes?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          active?: boolean
          allergies?: string | null
          authorized_pickups?: string | null
          birth_date?: string | null
          created_at?: string
          full_name?: string
          guardian_name?: string
          guardian_phone?: string
          id?: string
          medical_notes?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_profiles_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      congregations: {
        Row: {
          account_id: string
          active: boolean
          address: string | null
          city: string | null
          code: string | null
          created_at: string
          id: string
          leader_name: string | null
          leader_phone: string | null
          name: string
          notes: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          active?: boolean
          address?: string | null
          city?: string | null
          code?: string | null
          created_at?: string
          id?: string
          leader_name?: string | null
          leader_phone?: string | null
          name: string
          notes?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          active?: boolean
          address?: string | null
          city?: string | null
          code?: string | null
          created_at?: string
          id?: string
          leader_name?: string | null
          leader_phone?: string | null
          name?: string
          notes?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "congregations_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      data_subject_requests: {
        Row: {
          account_id: string
          completed_at: string | null
          created_at: string
          description: string
          id: string
          received_at: string
          request_type: string
          status: string
          user_id: string | null
        }
        Insert: {
          account_id: string
          completed_at?: string | null
          created_at?: string
          description: string
          id?: string
          received_at?: string
          request_type: string
          status?: string
          user_id?: string | null
        }
        Update: {
          account_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          received_at?: string
          request_type?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_subject_requests_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          account_id: string
          assignee_note: string | null
          created_at: string
          email: string | null
          id: string
          kind: string
          message: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          assignee_note?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kind: string
          message?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          assignee_note?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
          is_test_data: boolean
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
          is_test_data?: boolean
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
          is_test_data?: boolean
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
            foreignKeyName: "donations_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            referencedRelation: "donation_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_member_id_fkey"
            columns: ["member_id"]
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
          is_test_data: boolean
          member_id: string
          present: boolean
        }
        Insert: {
          account_id: string
          attendance_date: string
          class_id: string
          created_at?: string
          id?: string
          is_test_data?: boolean
          member_id: string
          present?: boolean
        }
        Update: {
          account_id?: string
          attendance_date?: string
          class_id?: string
          created_at?: string
          id?: string
          is_test_data?: boolean
          member_id?: string
          present?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ebd_attendance_class_id_fkey"
            columns: ["class_id"]
            referencedRelation: "ebd_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ebd_attendance_member_id_fkey"
            columns: ["member_id"]
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
          is_test_data: boolean
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
          is_test_data?: boolean
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
          is_test_data?: boolean
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
          is_test_data: boolean
          member_id: string
        }
        Insert: {
          account_id: string
          active?: boolean
          class_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_test_data?: boolean
          member_id: string
        }
        Update: {
          account_id?: string
          active?: boolean
          class_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_test_data?: boolean
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ebd_enrollments_class_id_fkey"
            columns: ["class_id"]
            referencedRelation: "ebd_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ebd_enrollments_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendance: {
        Row: {
          account_id: string
          attended: boolean
          checked_in_at: string | null
          created_at: string
          event_id: string
          id: string
          member_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          attended?: boolean
          checked_in_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          member_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          attended?: boolean
          checked_in_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      event_certificates: {
        Row: {
          account_id: string
          certificate_number: string
          created_at: string
          event_id: string
          file_url: string | null
          id: string
          inscription_id: string
          issued_at: string
          participant_name: string
          updated_at: string
        }
        Insert: {
          account_id: string
          certificate_number: string
          created_at?: string
          event_id: string
          file_url?: string | null
          id?: string
          inscription_id: string
          issued_at?: string
          participant_name: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          certificate_number?: string
          created_at?: string
          event_id?: string
          file_url?: string | null
          id?: string
          inscription_id?: string
          issued_at?: string
          participant_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_certificates_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_certificates_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_certificates_inscription_id_fkey"
            columns: ["inscription_id"]
            referencedRelation: "event_inscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_inscriptions: {
        Row: {
          account_id: string
          attendance_count: number
          checked_in: boolean | null
          checked_in_at: string | null
          created_at: string
          email: string
          event_id: string
          full_name: string
          id: string
          inscribed_at: string
          phone: string
          status: string
          total_price_cents: number
          updated_at: string
        }
        Insert: {
          account_id: string
          attendance_count?: number
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string
          email: string
          event_id: string
          full_name: string
          id?: string
          inscribed_at?: string
          phone: string
          status?: string
          total_price_cents?: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          attendance_count?: number
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string
          email?: string
          event_id?: string
          full_name?: string
          id?: string
          inscribed_at?: string
          phone?: string
          status?: string
          total_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_inscriptions_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_inscriptions_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
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
      event_promo_codes: {
        Row: {
          account_id: string
          code: string
          created_at: string
          discount_fixed_cents: number | null
          discount_percent: number | null
          event_id: string
          id: string
          is_active: boolean | null
          max_uses: number | null
          updated_at: string
          used_count: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          account_id: string
          code: string
          created_at?: string
          discount_fixed_cents?: number | null
          discount_percent?: number | null
          event_id: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string
          used_count?: number | null
          valid_from?: string
          valid_until: string
        }
        Update: {
          account_id?: string
          code?: string
          created_at?: string
          discount_fixed_cents?: number | null
          discount_percent?: number | null
          event_id?: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string
          used_count?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_promo_codes_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_promo_codes_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "event_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          account_id: string
          certificate_template: string | null
          created_at: string
          current_inscriptions: number | null
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          is_live: boolean
          is_test_data: boolean
          live_url: string | null
          location_id: string | null
          location_name: string
          max_inscriptions: number | null
          price_cents: number | null
          promotional_price_cents: number | null
          promotional_until: string | null
          requires_checkin: boolean | null
          show_type: boolean
          start_time: string
          type_id: string | null
          type_name: string
          updated_at: string
        }
        Insert: {
          account_id: string
          certificate_template?: string | null
          created_at?: string
          current_inscriptions?: number | null
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          is_live?: boolean
          is_test_data?: boolean
          live_url?: string | null
          location_id?: string | null
          location_name: string
          max_inscriptions?: number | null
          price_cents?: number | null
          promotional_price_cents?: number | null
          promotional_until?: string | null
          requires_checkin?: boolean | null
          show_type?: boolean
          start_time: string
          type_id?: string | null
          type_name: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          certificate_template?: string | null
          created_at?: string
          current_inscriptions?: number | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          is_live?: boolean
          is_test_data?: boolean
          live_url?: string | null
          location_id?: string | null
          location_name?: string
          max_inscriptions?: number | null
          price_cents?: number | null
          promotional_price_cents?: number | null
          promotional_until?: string | null
          requires_checkin?: boolean | null
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
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_location_id_fkey"
            columns: ["location_id"]
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_type_id_fkey"
            columns: ["type_id"]
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
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_events: {
        Row: {
          account_id: string
          created_at: string
          ends_at: string | null
          event_page_id: string | null
          id: string
          name: string
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          ends_at?: string | null
          event_page_id?: string | null
          id?: string
          name: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          ends_at?: string | null
          event_page_id?: string | null
          id?: string
          name?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "festa_events_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festa_events_event_page_id_fkey"
            columns: ["event_page_id"]
            referencedRelation: "event_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          total_cents: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "festa_order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "festa_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festa_order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "festa_products"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_orders: {
        Row: {
          created_at: string
          festa_event_id: string
          id: string
          operator_user_id: string | null
          order_code: string
          payment_method: string
          stall_id: string | null
          status: string
          total_cents: number
        }
        Insert: {
          created_at?: string
          festa_event_id: string
          id?: string
          operator_user_id?: string | null
          order_code: string
          payment_method: string
          stall_id?: string | null
          status?: string
          total_cents: number
        }
        Update: {
          created_at?: string
          festa_event_id?: string
          id?: string
          operator_user_id?: string | null
          order_code?: string
          payment_method?: string
          stall_id?: string | null
          status?: string
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "festa_orders_festa_event_id_fkey"
            columns: ["festa_event_id"]
            referencedRelation: "festa_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festa_orders_stall_id_fkey"
            columns: ["stall_id"]
            referencedRelation: "festa_stalls"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_products: {
        Row: {
          active: boolean
          created_at: string
          festa_stall_id: string
          id: string
          name: string
          price_cents: number
          stock_quantity: number | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          festa_stall_id: string
          id?: string
          name: string
          price_cents: number
          stock_quantity?: number | null
        }
        Update: {
          active?: boolean
          created_at?: string
          festa_stall_id?: string
          id?: string
          name?: string
          price_cents?: number
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "festa_products_festa_stall_id_fkey"
            columns: ["festa_stall_id"]
            referencedRelation: "festa_stalls"
            referencedColumns: ["id"]
          },
        ]
      }
      festa_stalls: {
        Row: {
          active: boolean
          created_at: string
          festa_event_id: string
          id: string
          name: string
          responsible_name: string | null
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          festa_event_id: string
          id?: string
          name: string
          responsible_name?: string | null
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          festa_event_id?: string
          id?: string
          name?: string
          responsible_name?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "festa_stalls_festa_event_id_fkey"
            columns: ["festa_event_id"]
            referencedRelation: "festa_events"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_entries: {
        Row: {
          account_id: string
          amount_cents: number
          category: string
          congregation_id: string | null
          contributor_name: string | null
          created_at: string
          description: string | null
          entry_date: string
          entry_type: string
          id: string
          notes: string | null
          payment_method: string | null
          reconciled_at: string | null
          reconciliation_notes: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          amount_cents: number
          category: string
          congregation_id?: string | null
          contributor_name?: string | null
          created_at?: string
          description?: string | null
          entry_date?: string
          entry_type: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          reconciled_at?: string | null
          reconciliation_notes?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount_cents?: number
          category?: string
          congregation_id?: string | null
          contributor_name?: string | null
          created_at?: string
          description?: string | null
          entry_date?: string
          entry_type?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          reconciled_at?: string | null
          reconciliation_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_entries_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_congregation_id_fkey"
            columns: ["congregation_id"]
            referencedRelation: "congregations"
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
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_audit_logs: {
        Row: {
          account_id: string
          action: string
          description: string | null
          id: string
          resource_id: string | null
          resource_type: string
          timestamp: string
          user_id: string
        }
        Insert: {
          account_id: string
          action: string
          description?: string | null
          id?: string
          resource_id?: string | null
          resource_type: string
          timestamp?: string
          user_id: string
        }
        Update: {
          account_id?: string
          action?: string
          description?: string | null
          id?: string
          resource_id?: string | null
          resource_type?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lgpd_audit_logs_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_consent_records: {
        Row: {
          accepted: boolean
          account_id: string
          consent_type: string
          created_at: string
          id: string
          ip_address: string | null
          recorded_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted: boolean
          account_id: string
          consent_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          recorded_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted?: boolean
          account_id?: string
          consent_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          recorded_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lgpd_consent_records_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_deletion_requests: {
        Row: {
          account_id: string
          created_at: string
          id: string
          processed_at: string | null
          reason: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          processed_at?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          processed_at?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lgpd_deletion_requests_account_id_fkey"
            columns: ["account_id"]
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
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      member_documents: {
        Row: {
          account_id: string
          body: string
          certificate_number: string | null
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
          certificate_number?: string | null
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
          certificate_number?: string | null
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
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_documents_template_id_fkey"
            columns: ["template_id"]
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      member_talents: {
        Row: {
          account_id: string
          availability: string | null
          contact_visible: boolean
          created_at: string
          id: string
          languages: string[]
          member_id: string
          notes: string | null
          profession: string | null
          skills: string[]
          updated_at: string
        }
        Insert: {
          account_id: string
          availability?: string | null
          contact_visible?: boolean
          created_at?: string
          id?: string
          languages?: string[]
          member_id: string
          notes?: string | null
          profession?: string | null
          skills?: string[]
          updated_at?: string
        }
        Update: {
          account_id?: string
          availability?: string | null
          contact_visible?: boolean
          created_at?: string
          id?: string
          languages?: string[]
          member_id?: string
          notes?: string | null
          profession?: string | null
          skills?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_talents_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_talents_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
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
          congregation_id: string | null
          cpf: string | null
          created_at: string
          email: string | null
          family_head_id: string | null
          full_name: string
          gender: string | null
          id: string
          is_test_data: boolean
          is_tither: boolean
          last_event_attendance: string | null
          marital_status: string | null
          member_since: string | null
          ministry: string | null
          neighborhood: string | null
          notes: string | null
          pastoral: string | null
          phone: string | null
          photo_url: string | null
          role: string
          spiritual_stage: string | null
          status: string
          updated_at: string
          whatsapp_consent: boolean
        }
        Insert: {
          account_id: string
          address_city?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          birth_date?: string | null
          congregation?: string | null
          congregation_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          family_head_id?: string | null
          full_name: string
          gender?: string | null
          id?: string
          is_test_data?: boolean
          is_tither?: boolean
          last_event_attendance?: string | null
          marital_status?: string | null
          member_since?: string | null
          ministry?: string | null
          neighborhood?: string | null
          notes?: string | null
          pastoral?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string
          spiritual_stage?: string | null
          status?: string
          updated_at?: string
          whatsapp_consent?: boolean
        }
        Update: {
          account_id?: string
          address_city?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          birth_date?: string | null
          congregation?: string | null
          congregation_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          family_head_id?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          is_test_data?: boolean
          is_tither?: boolean
          last_event_attendance?: string | null
          marital_status?: string | null
          member_since?: string | null
          ministry?: string | null
          neighborhood?: string | null
          notes?: string | null
          pastoral?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string
          spiritual_stage?: string | null
          status?: string
          updated_at?: string
          whatsapp_consent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "members_congregation_id_fkey"
            columns: ["congregation_id"]
            referencedRelation: "congregations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_family_head_id_fkey"
            columns: ["family_head_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ministry_assignments: {
        Row: {
          account_id: string
          active: boolean
          created_at: string
          end_date: string | null
          id: string
          member_id: string
          ministry: string
          role: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          account_id: string
          active?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          member_id: string
          ministry: string
          role?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          active?: boolean
          created_at?: string
          end_date?: string | null
          id?: string
          member_id?: string
          ministry?: string
          role?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministry_assignments_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ministry_assignments_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      module_rollouts: {
        Row: {
          feature_id: string
          status: string
          updated_at: string
        }
        Insert: {
          feature_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          feature_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
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
      pastoral_followup_events: {
        Row: {
          account_id: string
          actor_user_id: string
          created_at: string
          followup_id: string
          id: string
          next_contact_at: string | null
          note: string | null
          status: string
        }
        Insert: {
          account_id: string
          actor_user_id: string
          created_at?: string
          followup_id: string
          id?: string
          next_contact_at?: string | null
          note?: string | null
          status: string
        }
        Update: {
          account_id?: string
          actor_user_id?: string
          created_at?: string
          followup_id?: string
          id?: string
          next_contact_at?: string | null
          note?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pastoral_followup_events_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pastoral_followup_events_followup_account_fkey"
            columns: ["account_id", "followup_id"]
            referencedRelation: "pastoral_followups"
            referencedColumns: ["account_id", "id"]
          },
        ]
      }
      pastoral_followups: {
        Row: {
          account_id: string
          assignee_user_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          next_contact_at: string | null
          notes: string | null
          outcome: string | null
          source_id: string
          source_type: string
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          assignee_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          next_contact_at?: string | null
          notes?: string | null
          outcome?: string | null
          source_id: string
          source_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          assignee_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          next_contact_at?: string | null
          notes?: string | null
          outcome?: string | null
          source_id?: string
          source_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pastoral_followups_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          account_id: string
          amount_cents: number
          copy_paste: string | null
          created_at: string
          expires_at: string | null
          id: string
          kind: string
          mercadopago_payment_id: string | null
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
          copy_paste?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          kind?: string
          mercadopago_payment_id?: string | null
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
          copy_paste?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          kind?: string
          mercadopago_payment_id?: string | null
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_feature_flags: {
        Row: {
          enabled: boolean
          feature_id: string
          plan_tier: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          feature_id: string
          plan_tier: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          feature_id?: string
          plan_tier?: string
          updated_at?: string
        }
        Relationships: []
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
      platform_legal_acceptances: {
        Row: {
          accepted_at: string
          document_key: string
          document_version: string
          id: string
          source: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          document_key: string
          document_version: string
          id?: string
          source?: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          document_key?: string
          document_version?: string
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_payment_settings: {
        Row: {
          id: boolean
          mercadopago_access_token: string | null
          updated_at: string
        }
        Insert: {
          id?: boolean
          mercadopago_access_token?: string | null
          updated_at?: string
        }
        Update: {
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
      privacy_policies: {
        Row: {
          account_id: string
          content: string
          created_at: string
          effective_date: string
          id: string
          is_current: boolean
          version: string
        }
        Insert: {
          account_id: string
          content: string
          created_at?: string
          effective_date: string
          id?: string
          is_current?: boolean
          version: string
        }
        Update: {
          account_id?: string
          content?: string
          created_at?: string
          effective_date?: string
          id?: string
          is_current?: boolean
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_policies_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_purchases_transaction_id_fkey"
            columns: ["transaction_id"]
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
      room_reservations: {
        Row: {
          account_id: string
          created_at: string
          end_at: string
          id: string
          location_id: string | null
          member_id: string | null
          notes: string | null
          requester_name: string
          requester_phone: string | null
          start_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          end_at: string
          id?: string
          location_id?: string | null
          member_id?: string | null
          notes?: string | null
          requester_name: string
          requester_phone?: string | null
          start_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          end_at?: string
          id?: string
          location_id?: string | null
          member_id?: string | null
          notes?: string | null
          requester_name?: string
          requester_phone?: string | null
          start_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_reservations_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_reservations_location_id_fkey"
            columns: ["location_id"]
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_reservations_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      secretaria_request_attachments: {
        Row: {
          account_id: string
          content_type: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          request_id: string
        }
        Insert: {
          account_id: string
          content_type?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number
          id?: string
          request_id: string
        }
        Update: {
          account_id?: string
          content_type?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "secretaria_request_attachments_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secretaria_request_attachments_request_id_fkey"
            columns: ["request_id"]
            referencedRelation: "secretaria_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      secretaria_request_events: {
        Row: {
          account_id: string
          actor_id: string | null
          created_at: string
          event_type: string
          from_status: string | null
          id: string
          metadata: Json
          request_id: string | null
          to_status: string | null
        }
        Insert: {
          account_id: string
          actor_id?: string | null
          created_at?: string
          event_type: string
          from_status?: string | null
          id?: string
          metadata?: Json
          request_id?: string | null
          to_status?: string | null
        }
        Update: {
          account_id?: string
          actor_id?: string | null
          created_at?: string
          event_type?: string
          from_status?: string | null
          id?: string
          metadata?: Json
          request_id?: string | null
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secretaria_request_events_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      secretaria_requests: {
        Row: {
          account_id: string
          assignee_name: string | null
          created_at: string
          details: string | null
          due_date: string | null
          id: string
          internal_notes: string | null
          member_id: string | null
          preferred_date: string | null
          priority: string
          request_type: string
          requester_email: string | null
          requester_name: string
          requester_phone: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          assignee_name?: string | null
          created_at?: string
          details?: string | null
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          member_id?: string | null
          preferred_date?: string | null
          priority?: string
          request_type: string
          requester_email?: string | null
          requester_name: string
          requester_phone?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          assignee_name?: string | null
          created_at?: string
          details?: string | null
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          member_id?: string | null
          preferred_date?: string | null
          priority?: string
          request_type?: string
          requester_email?: string | null
          requester_name?: string
          requester_phone?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "secretaria_requests_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secretaria_requests_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "small_group_members_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "small_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "small_group_members_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
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
      social_deliveries: {
        Row: {
          account_id: string
          created_at: string
          delivered_at: string
          delivered_by: string | null
          family_id: string
          id: string
          items: string
          notes: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          delivered_at?: string
          delivered_by?: string | null
          family_id: string
          id?: string
          items: string
          notes?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          delivered_at?: string
          delivered_by?: string | null
          family_id?: string
          id?: string
          items?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_deliveries_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_deliveries_family_id_fkey"
            columns: ["family_id"]
            referencedRelation: "social_families"
            referencedColumns: ["id"]
          },
        ]
      }
      social_families: {
        Row: {
          account_id: string
          address: string | null
          created_at: string
          family_name: string
          family_size: number | null
          id: string
          needs: string | null
          notes: string | null
          phone: string | null
          responsible_name: string
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          address?: string | null
          created_at?: string
          family_name: string
          family_size?: number | null
          id?: string
          needs?: string | null
          notes?: string | null
          phone?: string | null
          responsible_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          address?: string | null
          created_at?: string
          family_name?: string
          family_size?: number | null
          id?: string
          needs?: string | null
          notes?: string | null
          phone?: string | null
          responsible_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_families_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
      tithes: {
        Row: {
          account_id: string
          amount_cents: number
          contributed_at: string
          created_at: string
          id: string
          member_id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          amount_cents: number
          contributed_at?: string
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount_cents?: number
          contributed_at?: string
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tithes_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tithes_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
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
          status_changed_at: string
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
          status_changed_at?: string
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
          status_changed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      volunteer_schedules: {
        Row: {
          account_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          updated_at: string
          volunteer_type: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          updated_at?: string
          volunteer_type: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          updated_at?: string
          volunteer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_schedules_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_shifts: {
        Row: {
          account_id: string
          confirmed: boolean
          confirmed_at: string | null
          created_at: string
          id: string
          member_id: string
          notes: string | null
          schedule_id: string
          shift_date: string
          shift_end_time: string | null
          shift_start_time: string
          updated_at: string
        }
        Insert: {
          account_id: string
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
          schedule_id: string
          shift_date: string
          shift_end_time?: string | null
          shift_start_time: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          schedule_id?: string
          shift_date?: string
          shift_end_time?: string | null
          shift_start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_shifts_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_shifts_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_shifts_schedule_id_fkey"
            columns: ["schedule_id"]
            referencedRelation: "volunteer_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_unavailability: {
        Row: {
          account_id: string
          created_at: string
          end_date: string
          id: string
          member_id: string
          reason: string | null
          start_date: string
        }
        Insert: {
          account_id: string
          created_at?: string
          end_date: string
          id?: string
          member_id: string
          reason?: string | null
          start_date: string
        }
        Update: {
          account_id?: string
          created_at?: string
          end_date?: string
          id?: string
          member_id?: string
          reason?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_unavailability_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_unavailability_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_automation_rules: {
        Row: {
          account_id: string
          created_at: string
          custom_content: string | null
          days_offset: number | null
          filters: Json | null
          id: string
          is_active: boolean
          name: string
          send_hour_brt: number | null
          template_id: string | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          custom_content?: string | null
          days_offset?: number | null
          filters?: Json | null
          id?: string
          is_active?: boolean
          name: string
          send_hour_brt?: number | null
          template_id?: string | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          custom_content?: string | null
          days_offset?: number | null
          filters?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          send_hour_brt?: number | null
          template_id?: string | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_automation_rules_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_automation_rules_template_id_fkey"
            columns: ["template_id"]
            referencedRelation: "whatsapp_template_library"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_campaigns: {
        Row: {
          account_id: string
          content: string
          created_at: string
          filters: Json
          id: string
          queued_count: number
          requested_count: number
          title: string
          updated_at: string
        }
        Insert: {
          account_id: string
          content: string
          created_at?: string
          filters?: Json
          id?: string
          queued_count?: number
          requested_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          content?: string
          created_at?: string
          filters?: Json
          id?: string
          queued_count?: number
          requested_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_campaigns_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversations: {
        Row: {
          account_id: string
          assigned_user_id: string | null
          contact_name: string | null
          contact_phone: string
          created_at: string
          id: string
          last_message_at: string
          provider: string
          provider_conversation_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          assigned_user_id?: string | null
          contact_name?: string | null
          contact_phone: string
          created_at?: string
          id?: string
          last_message_at?: string
          provider: string
          provider_conversation_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          assigned_user_id?: string | null
          contact_name?: string | null
          contact_phone?: string
          created_at?: string
          id?: string
          last_message_at?: string
          provider?: string
          provider_conversation_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_credit_ledger: {
        Row: {
          account_id: string
          balance_after: number
          created_at: string
          credits_delta: number
          entry_type: string
          id: string
          idempotency_key: string
          message_id: string | null
          metadata: Json
          purchase_id: string | null
        }
        Insert: {
          account_id: string
          balance_after: number
          created_at?: string
          credits_delta: number
          entry_type: string
          id?: string
          idempotency_key: string
          message_id?: string | null
          metadata?: Json
          purchase_id?: string | null
        }
        Update: {
          account_id?: string
          balance_after?: number
          created_at?: string
          credits_delta?: number
          entry_type?: string
          id?: string
          idempotency_key?: string
          message_id?: string | null
          metadata?: Json
          purchase_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_credit_ledger_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_credit_ledger_purchase_id_fkey"
            columns: ["purchase_id"]
            referencedRelation: "whatsapp_credit_purchases"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "whatsapp_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_delivery_events: {
        Row: {
          account_id: string | null
          created_at: string
          id: string
          message_id: string | null
          occurred_at: string
          provider: string
          provider_message_id: string | null
          provider_status: string
          raw_payload: Json
          recipient_phone: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          occurred_at?: string
          provider: string
          provider_message_id?: string | null
          provider_status: string
          raw_payload?: Json
          recipient_phone?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          occurred_at?: string
          provider?: string
          provider_message_id?: string | null
          provider_status?: string
          raw_payload?: Json
          recipient_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_delivery_events_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_delivery_events_message_id_fkey"
            columns: ["message_id"]
            referencedRelation: "whatsapp_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_inbound_messages: {
        Row: {
          account_id: string
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          provider: string
          provider_message_id: string
          raw_payload: Json
          received_at: string
          sender_phone: string
        }
        Insert: {
          account_id: string
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          provider: string
          provider_message_id: string
          raw_payload?: Json
          received_at: string
          sender_phone: string
        }
        Update: {
          account_id?: string
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          provider?: string
          provider_message_id?: string
          raw_payload?: Json
          received_at?: string
          sender_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_inbound_messages_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_inbound_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          account_id: string
          campaign_id: string | null
          content: string
          cost_credits: number
          created_at: string
          credit_refunded_at: string | null
          credit_reserved_at: string | null
          delivered_at: string | null
          delivery_attempts: number
          error_message: string | null
          id: string
          kind: string
          locked_until: string | null
          member_id: string | null
          phone: string
          provider: string | null
          provider_delivery_status: string | null
          provider_message_id: string | null
          provider_payload: Json
          provider_status_at: string | null
          read_at: string | null
          recipient_name: string | null
          scheduled_date: string
          scheduled_for: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          campaign_id?: string | null
          content: string
          cost_credits?: number
          created_at?: string
          credit_refunded_at?: string | null
          credit_reserved_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number
          error_message?: string | null
          id?: string
          kind?: string
          locked_until?: string | null
          member_id?: string | null
          phone: string
          provider?: string | null
          provider_delivery_status?: string | null
          provider_message_id?: string | null
          provider_payload?: Json
          provider_status_at?: string | null
          read_at?: string | null
          recipient_name?: string | null
          scheduled_date?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          campaign_id?: string | null
          content?: string
          cost_credits?: number
          created_at?: string
          credit_refunded_at?: string | null
          credit_reserved_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number
          error_message?: string | null
          id?: string
          kind?: string
          locked_until?: string | null
          member_id?: string | null
          phone?: string
          provider?: string | null
          provider_delivery_status?: string | null
          provider_message_id?: string | null
          provider_payload?: Json
          provider_status_at?: string | null
          read_at?: string | null
          recipient_name?: string | null
          scheduled_date?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_campaign_account_fkey"
            columns: ["account_id", "campaign_id"]
            referencedRelation: "whatsapp_campaigns"
            referencedColumns: ["account_id", "id"]
          },
        ]
      }
      whatsapp_opt_outs: {
        Row: {
          account_id: string
          created_at: string
          id: string
          member_id: string | null
          message_id: string | null
          metadata: Json
          phone_normalized: string
          reason: string | null
          source: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          member_id?: string | null
          message_id?: string | null
          metadata?: Json
          phone_normalized: string
          reason?: string | null
          source?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          member_id?: string | null
          message_id?: string | null
          metadata?: Json
          phone_normalized?: string
          reason?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_opt_outs_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_opt_outs_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
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
      whatsapp_provider_connections: {
        Row: {
          access_token_secret_name: string
          account_id: string
          active: boolean
          api_base_url: string | null
          business_account_id: string | null
          created_at: string
          instance_id: string | null
          last_checked_at: string | null
          last_error: string | null
          phone_number_id: string | null
          provider: string
          sender_phone: string | null
          updated_at: string
          webhook_secret_name: string | null
        }
        Insert: {
          access_token_secret_name: string
          account_id: string
          active?: boolean
          api_base_url?: string | null
          business_account_id?: string | null
          created_at?: string
          instance_id?: string | null
          last_checked_at?: string | null
          last_error?: string | null
          phone_number_id?: string | null
          provider: string
          sender_phone?: string | null
          updated_at?: string
          webhook_secret_name?: string | null
        }
        Update: {
          access_token_secret_name?: string
          account_id?: string
          active?: boolean
          api_base_url?: string | null
          business_account_id?: string | null
          created_at?: string
          instance_id?: string | null
          last_checked_at?: string | null
          last_error?: string | null
          phone_number_id?: string | null
          provider?: string
          sender_phone?: string | null
          updated_at?: string
          webhook_secret_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_provider_connections_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_settings: {
        Row: {
          account_id: string
          birthday_enabled: boolean
          birthday_template: string
          campaign_update_enabled: boolean | null
          campaign_update_template: string | null
          celula_reminder_enabled: boolean
          celula_reminder_template: string
          created_at: string
          credits_balance: number
          culto_reminder_enabled: boolean
          culto_reminder_template: string
          enabled: boolean
          event_confirmation_enabled: boolean | null
          event_confirmation_template: string | null
          event_reminder_enabled: boolean | null
          event_reminder_template: string | null
          new_visitor_enabled: boolean | null
          new_visitor_template: string | null
          newsletter_enabled: boolean
          newsletter_template: string
          prayer_request_enabled: boolean
          prayer_request_template: string
          schedule_change_enabled: boolean | null
          schedule_change_template: string | null
          send_hour_brt: number
          sender_name: string | null
          tithe_reminder_enabled: boolean
          tithe_reminder_template: string
          updated_at: string
          volunteer_confirmation_enabled: boolean | null
          volunteer_confirmation_template: string | null
          weekly_bulletin_enabled: boolean | null
          weekly_bulletin_template: string | null
          welcome_enabled: boolean
          welcome_template: string
        }
        Insert: {
          account_id: string
          birthday_enabled?: boolean
          birthday_template?: string
          campaign_update_enabled?: boolean | null
          campaign_update_template?: string | null
          celula_reminder_enabled?: boolean
          celula_reminder_template?: string
          created_at?: string
          credits_balance?: number
          culto_reminder_enabled?: boolean
          culto_reminder_template?: string
          enabled?: boolean
          event_confirmation_enabled?: boolean | null
          event_confirmation_template?: string | null
          event_reminder_enabled?: boolean | null
          event_reminder_template?: string | null
          new_visitor_enabled?: boolean | null
          new_visitor_template?: string | null
          newsletter_enabled?: boolean
          newsletter_template?: string
          prayer_request_enabled?: boolean
          prayer_request_template?: string
          schedule_change_enabled?: boolean | null
          schedule_change_template?: string | null
          send_hour_brt?: number
          sender_name?: string | null
          tithe_reminder_enabled?: boolean
          tithe_reminder_template?: string
          updated_at?: string
          volunteer_confirmation_enabled?: boolean | null
          volunteer_confirmation_template?: string | null
          weekly_bulletin_enabled?: boolean | null
          weekly_bulletin_template?: string | null
          welcome_enabled?: boolean
          welcome_template?: string
        }
        Update: {
          account_id?: string
          birthday_enabled?: boolean
          birthday_template?: string
          campaign_update_enabled?: boolean | null
          campaign_update_template?: string | null
          celula_reminder_enabled?: boolean
          celula_reminder_template?: string
          created_at?: string
          credits_balance?: number
          culto_reminder_enabled?: boolean
          culto_reminder_template?: string
          enabled?: boolean
          event_confirmation_enabled?: boolean | null
          event_confirmation_template?: string | null
          event_reminder_enabled?: boolean | null
          event_reminder_template?: string | null
          new_visitor_enabled?: boolean | null
          new_visitor_template?: string | null
          newsletter_enabled?: boolean
          newsletter_template?: string
          prayer_request_enabled?: boolean
          prayer_request_template?: string
          schedule_change_enabled?: boolean | null
          schedule_change_template?: string | null
          send_hour_brt?: number
          sender_name?: string | null
          tithe_reminder_enabled?: boolean
          tithe_reminder_template?: string
          updated_at?: string
          volunteer_confirmation_enabled?: boolean | null
          volunteer_confirmation_template?: string | null
          weekly_bulletin_enabled?: boolean | null
          weekly_bulletin_template?: string | null
          welcome_enabled?: boolean
          welcome_template?: string
        }
        Relationships: []
      }
      whatsapp_template_library: {
        Row: {
          account_id: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          kind: string
          name: string
          preview: string | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          account_id: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          kind: string
          name: string
          preview?: string | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          account_id?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          name?: string
          preview?: string | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_template_library_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_grant_whatsapp_credits: {
        Args: {
          p_account_id: string
          p_amount_cents?: number
          p_credits: number
          p_metadata?: Json
        }
        Returns: {
          balance: number
          ledger_id: string
          purchase_id: string
        }[]
      }
      claim_whatsapp_messages: {
        Args: { p_limit?: number; p_lock_seconds?: number }
        Returns: {
          account_id: string
          content: string
          cost_credits: number
          delivery_attempts: number
          id: string
          member_id: string
          phone: string
        }[]
      }
      complete_whatsapp_credit_purchase: {
        Args: { p_metadata?: Json; p_purchase_id: string }
        Returns: {
          balance: number
          ledger_id: string
          reason: string
        }[]
      }
      generate_site_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_account_member: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      is_account_owner: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      normalize_whatsapp_phone: { Args: { p_phone: string }; Returns: string }
      record_festa_sale: {
        Args: { p_items: Json; p_payment_method: string; p_stall_id: string }
        Returns: {
          order_code: string
          order_id: string
          total_cents: number
        }[]
      }
      record_whatsapp_opt_out: {
        Args: {
          p_account_id: string
          p_member_id?: string
          p_message_id?: string
          p_metadata?: Json
          p_phone: string
          p_reason?: string
          p_source?: string
        }
        Returns: {
          opt_out_id: string
          phone_normalized: string
        }[]
      }
      refund_whatsapp_message_credits: {
        Args: {
          p_account_id: string
          p_idempotency_key: string
          p_message_id: string
          p_metadata?: Json
        }
        Returns: {
          balance: number
          ledger_id: string
          ok: boolean
          reason: string
        }[]
      }
      reserve_whatsapp_credits: {
        Args: {
          p_account_id: string
          p_cost: number
          p_idempotency_key: string
          p_message_id: string
          p_metadata?: Json
        }
        Returns: {
          balance: number
          ledger_id: string
          ok: boolean
          reason: string
        }[]
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
  realtime: {
    Tables: {
      messages: {
        Row: {
          binary_payload: string | null
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          binary_payload?: string | null
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          binary_payload?: string | null
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_06_18: {
        Row: {
          binary_payload: string | null
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          binary_payload?: string | null
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          binary_payload?: string | null
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_06_19: {
        Row: {
          binary_payload: string | null
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          binary_payload?: string | null
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          binary_payload?: string | null
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_06_20: {
        Row: {
          binary_payload: string | null
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          binary_payload?: string | null
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          binary_payload?: string | null
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_06_21: {
        Row: {
          binary_payload: string | null
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          binary_payload?: string | null
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          binary_payload?: string | null
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_06_22: {
        Row: {
          binary_payload: string | null
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          binary_payload?: string | null
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          binary_payload?: string | null
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_06_23: {
        Row: {
          binary_payload: string | null
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          binary_payload?: string | null
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          binary_payload?: string | null
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages_2026_06_24: {
        Row: {
          binary_payload: string | null
          event: string | null
          extension: string
          id: string
          inserted_at: string
          payload: Json | null
          private: boolean | null
          topic: string
          updated_at: string
        }
        Insert: {
          binary_payload?: string | null
          event?: string | null
          extension: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic: string
          updated_at?: string
        }
        Update: {
          binary_payload?: string | null
          event?: string | null
          extension?: string
          id?: string
          inserted_at?: string
          payload?: Json | null
          private?: boolean | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          inserted_at: string | null
          version: number
        }
        Insert: {
          inserted_at?: string | null
          version: number
        }
        Update: {
          inserted_at?: string | null
          version?: number
        }
        Relationships: []
      }
      subscription: {
        Row: {
          action_filter: string | null
          claims: Json
          claims_role: unknown
          created_at: string
          entity: unknown
          filters: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id: number
          selected_columns: string[] | null
          subscription_id: string
        }
        Insert: {
          action_filter?: string | null
          claims: Json
          claims_role?: unknown
          created_at?: string
          entity: unknown
          filters?: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id?: never
          selected_columns?: string[] | null
          subscription_id: string
        }
        Update: {
          action_filter?: string | null
          claims?: Json
          claims_role?: unknown
          created_at?: string
          entity?: unknown
          filters?: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
          id?: never
          selected_columns?: string[] | null
          subscription_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_rls: {
        Args: { max_record_bytes?: number; wal: Json }
        Returns: Database["realtime"]["CompositeTypes"]["wal_rls"][]
        SetofOptions: {
          from: "*"
          to: "wal_rls"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      broadcast_changes: {
        Args: {
          event_name: string
          level?: string
          new: Record<string, unknown>
          old: Record<string, unknown>
          operation: string
          table_name: string
          table_schema: string
          topic_name: string
        }
        Returns: undefined
      }
      build_prepared_statement_sql: {
        Args: {
          columns: Database["realtime"]["CompositeTypes"]["wal_column"][]
          entity: unknown
          prepared_statement_name: string
        }
        Returns: string
      }
      cast: { Args: { type_: unknown; val: string }; Returns: Json }
      check_equality_op: {
        Args: {
          op: Database["realtime"]["Enums"]["equality_op"]
          type_: unknown
          val_1: string
          val_2: string
        }
        Returns: boolean
      }
      is_visible_through_filters: {
        Args: {
          columns: Database["realtime"]["CompositeTypes"]["wal_column"][]
          filters: Database["realtime"]["CompositeTypes"]["user_defined_filter"][]
        }
        Returns: boolean
      }
      list_changes: {
        Args: {
          max_changes: number
          max_record_bytes: number
          publication: unknown
          slot_name: unknown
        }
        Returns: {
          errors: string[]
          is_rls_enabled: boolean
          slot_changes_count: number
          subscription_ids: string[]
          wal: Json
        }[]
      }
      quote_wal2json: { Args: { entity: unknown }; Returns: string }
      send:
        | {
            Args: {
              event: string
              payload: string
              private?: boolean
              topic: string
            }
            Returns: undefined
          }
        | {
            Args: {
              event: string
              payload: Json
              private?: boolean
              topic: string
            }
            Returns: undefined
          }
      to_regrole: { Args: { role_name: string }; Returns: unknown }
      topic: { Args: never; Returns: string }
      wal2json_escape_identifier: { Args: { name: string }; Returns: string }
    }
    Enums: {
      action: "INSERT" | "UPDATE" | "DELETE" | "TRUNCATE" | "ERROR"
      equality_op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "in"
    }
    CompositeTypes: {
      user_defined_filter: {
        column_name: string | null
        op: Database["realtime"]["Enums"]["equality_op"] | null
        value: string | null
      }
      wal_column: {
        name: string | null
        type_name: string | null
        type_oid: unknown
        value: Json | null
        is_pkey: boolean | null
        is_selectable: boolean | null
      }
      wal_rls: {
        wal: Json | null
        is_rls_enabled: boolean | null
        subscription_ids: string[] | null
        errors: string[] | null
      }
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  supabase_functions: {
    Tables: {
      hooks: {
        Row: {
          created_at: string
          hook_name: string
          hook_table_id: number
          id: number
          request_id: number | null
        }
        Insert: {
          created_at?: string
          hook_name: string
          hook_table_id: number
          id?: number
          request_id?: number | null
        }
        Update: {
          created_at?: string
          hook_name?: string
          hook_table_id?: number
          id?: number
          request_id?: number | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          inserted_at: string
          version: string
        }
        Insert: {
          inserted_at?: string
          version: string
        }
        Update: {
          inserted_at?: string
          version?: string
        }
        Relationships: []
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
  vault: {
    Tables: {
      secrets: {
        Row: {
          created_at: string
          description: string
          id: string
          key_id: string | null
          name: string | null
          nonce: string | null
          secret: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      decrypted_secrets: {
        Row: {
          created_at: string | null
          decrypted_secret: string | null
          description: string | null
          id: string | null
          key_id: string | null
          name: string | null
          nonce: string | null
          secret: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          decrypted_secret?: never
          description?: string | null
          id?: string | null
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          decrypted_secret?: never
          description?: string | null
          id?: string | null
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _crypto_aead_det_decrypt: {
        Args: {
          additional: string
          context?: string
          key_id: number
          message: string
          nonce?: string
        }
        Returns: string
      }
      _crypto_aead_det_encrypt: {
        Args: {
          additional: string
          context?: string
          key_id: number
          message: string
          nonce?: string
        }
        Returns: string
      }
      _crypto_aead_det_noncegen: { Args: never; Returns: string }
      create_secret: {
        Args: {
          new_description?: string
          new_key_id?: string
          new_name?: string
          new_secret: string
        }
        Returns: string
      }
      update_secret: {
        Args: {
          new_description?: string
          new_key_id?: string
          new_name?: string
          new_secret?: string
          secret_id: string
        }
        Returns: undefined
      }
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
  _realtime: {
    Enums: {},
  },
  auth: {
    Enums: {
      aal_level: ["aal1", "aal2", "aal3"],
      code_challenge_method: ["s256", "plain"],
      factor_status: ["unverified", "verified"],
      factor_type: ["totp", "webauthn", "phone"],
      oauth_authorization_status: ["pending", "approved", "denied", "expired"],
      oauth_client_type: ["public", "confidential"],
      oauth_registration_type: ["dynamic", "manual"],
      oauth_response_type: ["code"],
      one_time_token_type: [
        "confirmation_token",
        "reauthentication_token",
        "recovery_token",
        "email_change_token_new",
        "email_change_token_current",
        "phone_change_token",
      ],
    },
  },
  extensions: {
    Enums: {},
  },
  graphql: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  net: {
    Enums: {
      request_status: ["PENDING", "SUCCESS", "ERROR"],
    },
  },
  pgbouncer: {
    Enums: {},
  },
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
  realtime: {
    Enums: {
      action: ["INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR"],
      equality_op: ["eq", "neq", "lt", "lte", "gt", "gte", "in"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
  supabase_functions: {
    Enums: {},
  },
  vault: {
    Enums: {},
  },
} as const
