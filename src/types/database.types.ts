export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // =====================================================
      // Core Tables
      // =====================================================
      user_profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          created_at: string
          name: string
          slug: string
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug: string
          owner_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          slug?: string
          owner_id?: string
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          id: string
          organization_id: string
          enabled_modules: Json
          default_timezone: string | null
          default_currency: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          enabled_modules?: Json
          default_timezone?: string | null
          default_currency?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          enabled_modules?: Json
          default_timezone?: string | null
          default_currency?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_settings_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: true
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      memberships: {
        Row: {
          id: string
          created_at: string
          user_id: string
          organization_id: string
          role: 'owner' | 'admin' | 'member'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          organization_id: string
          role?: 'owner' | 'admin' | 'member'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          organization_id?: string
          role?: 'owner' | 'admin' | 'member'
        }
        Relationships: []
      }

      // =====================================================
      // CRM Module
      // =====================================================
      activities: {
        Row: {
          id: string
          organization_id: string
          contact_id: string | null
          company_id: string | null
          deal_id: string | null
          user_id: string | null
          type: 'note' | 'email_sent' | 'email_received' | 'call' | 'meeting' | 'task' | 'deal_stage_change' | 'other'
          title: string
          description: string | null
          metadata: Json
          duration_minutes: number | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          user_id?: string | null
          type: 'note' | 'email_sent' | 'email_received' | 'call' | 'meeting' | 'task' | 'deal_stage_change' | 'other'
          title: string
          description?: string | null
          metadata?: Json
          duration_minutes?: number | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          user_id?: string | null
          type?: 'note' | 'email_sent' | 'email_received' | 'call' | 'meeting' | 'task' | 'deal_stage_change' | 'other'
          title?: string
          description?: string | null
          metadata?: Json
          duration_minutes?: number | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          organization_id: string
          name: string
          domain: string | null
          address: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          domain?: string | null
          address?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          domain?: string | null
          address?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          organization_id: string
          company_id: string | null
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          position: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          company_id?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          position?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          company_id?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          position?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // =====================================================
      // Workflows Module
      // =====================================================
      workflows: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          status: 'active' | 'paused' | 'draft'
          trigger_definitions: Json
          nodes: Json
          edges: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          status?: 'active' | 'paused' | 'draft'
          trigger_definitions?: Json
          nodes?: Json
          edges?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          status?: 'active' | 'paused' | 'draft'
          trigger_definitions?: Json
          nodes?: Json
          edges?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          id: string
          workflow_id: string
          organization_id: string
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying'
          started_at: string
          completed_at: string | null
          trigger_data: Json
          execution_log: Json
          error: Json | null
          input: Json
          output: Json | null
          current_node_id: string | null
          retry_count: number
          created_at: string
        }
        Insert: {
          id?: string
          workflow_id: string
          organization_id: string
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying'
          started_at?: string
          completed_at?: string | null
          trigger_data?: Json
          execution_log?: Json
          error?: Json | null
          input?: Json
          output?: Json | null
          current_node_id?: string | null
          retry_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          workflow_id?: string
          organization_id?: string
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying'
          started_at?: string
          completed_at?: string | null
          trigger_data?: Json
          execution_log?: Json
          error?: Json | null
          input?: Json
          output?: Json | null
          current_node_id?: string | null
          retry_count?: number
          created_at?: string
        }
        Relationships: []
      }

      // =====================================================
      // Site Builder Module
      // =====================================================
      sites: {
        Row: {
          id: string
          organization_id: string
          name: string
          subdomain: string | null
          custom_domain: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          subdomain?: string | null
          custom_domain?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          subdomain?: string | null
          custom_domain?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      funnels: {
        Row: {
          id: string
          organization_id: string
          site_id: string | null
          name: string
          steps: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          site_id?: string | null
          name: string
          steps?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          site_id?: string | null
          name?: string
          steps?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          id: string
          organization_id: string
          site_id: string
          funnel_id: string | null
          path: string
          title: string
          content: Json
          compiled_html: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          site_id: string
          funnel_id?: string | null
          path: string
          title: string
          content?: Json
          compiled_html?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          site_id?: string
          funnel_id?: string | null
          path?: string
          title?: string
          content?: Json
          compiled_html?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // =====================================================
      // Marketing Module
      // =====================================================
      marketing_templates: {
        Row: {
          id: string
          organization_id: string
          name: string
          type: 'email' | 'sms'
          subject: string | null
          content: string
          variables: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          type: 'email' | 'sms'
          subject?: string | null
          content: string
          variables?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          type?: 'email' | 'sms'
          subject?: string | null
          content?: string
          variables?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          id: string
          organization_id: string
          name: string
          type: 'email' | 'sms'
          status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled'
          template_id: string | null
          audience_filters: Json
          scheduled_at: string | null
          started_at: string | null
          completed_at: string | null
          total_recipients: number
          sent_count: number
          failed_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          type: 'email' | 'sms'
          status?: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled'
          template_id?: string | null
          audience_filters?: Json
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          total_recipients?: number
          sent_count?: number
          failed_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          type?: 'email' | 'sms'
          status?: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled'
          template_id?: string | null
          audience_filters?: Json
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          total_recipients?: number
          sent_count?: number
          failed_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_logs: {
        Row: {
          id: string
          organization_id: string
          campaign_id: string | null
          contact_id: string | null
          type: 'email' | 'sms'
          status: 'pending' | 'sent' | 'delivered' | 'failed' | 'clicked' | 'opened'
          provider_message_id: string | null
          error_message: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          campaign_id?: string | null
          contact_id?: string | null
          type: 'email' | 'sms'
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'clicked' | 'opened'
          provider_message_id?: string | null
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          campaign_id?: string | null
          contact_id?: string | null
          type?: 'email' | 'sms'
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'clicked' | 'opened'
          provider_message_id?: string | null
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Relationships: []
      }

      // =====================================================
      // Deals/Pipeline Module
      // =====================================================
      pipelines: {
        Row: {
          id: string
          organization_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      stages: {
        Row: {
          id: string
          organization_id: string
          pipeline_id: string
          name: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          pipeline_id: string
          name: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          pipeline_id?: string
          name?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          id: string
          organization_id: string
          pipeline_id: string | null
          stage_id: string | null
          title: string
          value: number | null
          currency: string
          contact_id: string | null
          company_id: string | null
          status: 'open' | 'won' | 'lost' | 'abandoned'
          expected_close_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          pipeline_id?: string | null
          stage_id?: string | null
          title: string
          value?: number | null
          currency?: string
          contact_id?: string | null
          company_id?: string | null
          status?: 'open' | 'won' | 'lost' | 'abandoned'
          expected_close_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          pipeline_id?: string | null
          stage_id?: string | null
          title?: string
          value?: number | null
          currency?: string
          contact_id?: string | null
          company_id?: string | null
          status?: 'open' | 'won' | 'lost' | 'abandoned'
          expected_close_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // =====================================================
      // Agents Module
      // =====================================================
      agent_executions: {
        Row: {
          id: string
          organization_id: string
          agent_id: string
          agent_type: 'orchestrator' | 'crm' | 'marketing' | 'analytics' | 'builder' | 'workflow'
          workflow_execution_id: string | null
          status: 'idle' | 'running' | 'completed' | 'failed' | 'timeout'
          input: Json
          output: Json | null
          error: string | null
          metadata: Json
          started_at: string
          completed_at: string | null
          duration_ms: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          agent_id: string
          agent_type: 'orchestrator' | 'crm' | 'marketing' | 'analytics' | 'builder' | 'workflow'
          workflow_execution_id?: string | null
          status?: 'idle' | 'running' | 'completed' | 'failed' | 'timeout'
          input?: Json
          output?: Json | null
          error?: string | null
          metadata?: Json
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          agent_id?: string
          agent_type?: 'orchestrator' | 'crm' | 'marketing' | 'analytics' | 'builder' | 'workflow'
          workflow_execution_id?: string | null
          status?: 'idle' | 'running' | 'completed' | 'failed' | 'timeout'
          input?: Json
          output?: Json | null
          error?: string | null
          metadata?: Json
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orchestrator_tasks: {
        Row: {
          id: string
          organization_id: string
          workflow_id: string | null
          task_definition: Json
          status: 'idle' | 'running' | 'completed' | 'failed' | 'timeout'
          execution_log: Json
          context: Json
          started_at: string
          completed_at: string | null
          duration_ms: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          workflow_id?: string | null
          task_definition?: Json
          status?: 'idle' | 'running' | 'completed' | 'failed' | 'timeout'
          execution_log?: Json
          context?: Json
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          workflow_id?: string | null
          task_definition?: Json
          status?: 'idle' | 'running' | 'completed' | 'failed' | 'timeout'
          execution_log?: Json
          context?: Json
          started_at?: string
          completed_at?: string | null
          duration_ms?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_capabilities: {
        Row: {
          agent_id: string
          capabilities: string[]
          version: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          capabilities: string[]
          version?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          capabilities?: string[]
          version?: number
          updated_at?: string
        }
        Relationships: []
      }

      // =====================================================
      // Forms Module
      // =====================================================
      forms: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          status: 'draft' | 'active' | 'archived'
          settings: Json
          thank_you_message: string | null
          redirect_url: string | null
          create_contact: boolean
          create_company: boolean
          add_tags: string[] | null
          send_email_notification: boolean
          notification_emails: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          status?: 'draft' | 'active' | 'archived'
          settings?: Json
          thank_you_message?: string | null
          redirect_url?: string | null
          create_contact?: boolean
          create_company?: boolean
          add_tags?: string[] | null
          send_email_notification?: boolean
          notification_emails?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          status?: 'draft' | 'active' | 'archived'
          settings?: Json
          thank_you_message?: string | null
          redirect_url?: string | null
          create_contact?: boolean
          create_company?: boolean
          add_tags?: string[] | null
          send_email_notification?: boolean
          notification_emails?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          id: string
          organization_id: string
          form_id: string
          field_type: string
          label: string
          placeholder: string | null
          help_text: string | null
          default_value: string | null
          required: boolean
          validation_rules: Json
          options: Json
          conditional_logic: Json | null
          order_index: number
          column_width: number
          crm_field_mapping: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          form_id: string
          field_type: string
          label: string
          placeholder?: string | null
          help_text?: string | null
          default_value?: string | null
          required?: boolean
          validation_rules?: Json
          options?: Json
          conditional_logic?: Json | null
          order_index?: number
          column_width?: number
          crm_field_mapping?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          form_id?: string
          field_type?: string
          label?: string
          placeholder?: string | null
          help_text?: string | null
          default_value?: string | null
          required?: boolean
          validation_rules?: Json
          options?: Json
          conditional_logic?: Json | null
          order_index?: number
          column_width?: number
          crm_field_mapping?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          id: string
          organization_id: string
          form_id: string
          contact_id: string | null
          email: string | null
          phone: string | null
          data: Json
          files: Json
          status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_term: string | null
          utm_content: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          submitted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          form_id: string
          contact_id?: string | null
          email?: string | null
          phone?: string | null
          data?: Json
          files?: Json
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          submitted_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          form_id?: string
          contact_id?: string | null
          email?: string | null
          phone?: string | null
          data?: Json
          files?: Json
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_term?: string | null
          utm_content?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          submitted_at?: string
          created_at?: string
        }
        Relationships: []
      }
      form_notifications: {
        Row: {
          id: string
          organization_id: string
          form_id: string
          type: 'email' | 'webhook' | 'sms'
          trigger_conditions: Json
          email_to: string[] | null
          email_template_id: string | null
          email_subject: string | null
          email_body: string | null
          webhook_url: string | null
          webhook_method: 'POST' | 'PUT' | 'PATCH'
          webhook_headers: Json
          sms_to: string[] | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          form_id: string
          type: 'email' | 'webhook' | 'sms'
          trigger_conditions?: Json
          email_to?: string[] | null
          email_template_id?: string | null
          email_subject?: string | null
          email_body?: string | null
          webhook_url?: string | null
          webhook_method?: 'POST' | 'PUT' | 'PATCH'
          webhook_headers?: Json
          sms_to?: string[] | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          form_id?: string
          type?: 'email' | 'webhook' | 'sms'
          trigger_conditions?: Json
          email_to?: string[] | null
          email_template_id?: string | null
          email_subject?: string | null
          email_body?: string | null
          webhook_url?: string | null
          webhook_method?: 'POST' | 'PUT' | 'PATCH'
          webhook_headers?: Json
          sms_to?: string[] | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // =====================================================
      // Calendar/Appointments Module
      // =====================================================
      calendars: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          color: string
          owner_id: string | null
          timezone: string
          buffer_minutes: number
          min_notice_hours: number
          max_booking_days_ahead: number
          business_hours: Json
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          color?: string
          owner_id?: string | null
          timezone?: string
          buffer_minutes?: number
          min_notice_hours?: number
          max_booking_days_ahead?: number
          business_hours?: Json
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          color?: string
          owner_id?: string | null
          timezone?: string
          buffer_minutes?: number
          min_notice_hours?: number
          max_booking_days_ahead?: number
          business_hours?: Json
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointment_types: {
        Row: {
          id: string
          organization_id: string
          calendar_id: string
          name: string
          description: string | null
          duration_minutes: number
          price: number
          location_type: 'in_person' | 'phone' | 'video' | 'custom'
          location_details: string | null
          availability: Json
          require_payment: boolean
          require_deposit: boolean
          deposit_amount: number | null
          max_advance_days: number
          min_notice_hours: number
          active: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          calendar_id: string
          name: string
          description?: string | null
          duration_minutes?: number
          price?: number
          location_type?: 'in_person' | 'phone' | 'video' | 'custom'
          location_details?: string | null
          availability?: Json
          require_payment?: boolean
          require_deposit?: boolean
          deposit_amount?: number | null
          max_advance_days?: number
          min_notice_hours?: number
          active?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          calendar_id?: string
          name?: string
          description?: string | null
          duration_minutes?: number
          price?: number
          location_type?: 'in_person' | 'phone' | 'video' | 'custom'
          location_details?: string | null
          availability?: Json
          require_payment?: boolean
          require_deposit?: boolean
          deposit_amount?: number | null
          max_advance_days?: number
          min_notice_hours?: number
          active?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          id: string
          organization_id: string
          calendar_id: string
          start_time: string
          end_time: string
          max_bookings: number
          current_bookings: number
          status: 'available' | 'booked' | 'blocked' | 'cancelled'
          is_recurring: boolean
          recurring_pattern: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          calendar_id: string
          start_time: string
          end_time: string
          max_bookings?: number
          current_bookings?: number
          status?: 'available' | 'booked' | 'blocked' | 'cancelled'
          is_recurring?: boolean
          recurring_pattern?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          calendar_id?: string
          start_time?: string
          end_time?: string
          max_bookings?: number
          current_bookings?: number
          status?: 'available' | 'booked' | 'blocked' | 'cancelled'
          is_recurring?: boolean
          recurring_pattern?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          organization_id: string
          calendar_id: string | null
          appointment_type_id: string | null
          contact_id: string | null
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          title: string
          description: string | null
          location: string | null
          start_time: string
          end_time: string
          duration_minutes: number | null
          timezone: string
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
          payment_status: 'pending' | 'paid' | 'refunded' | 'cancelled' | null
          meeting_link: string | null
          meeting_id: string | null
          meeting_password: string | null
          internal_notes: string | null
          customer_notes: string | null
          calendar_event_id: string | null
          synced_to_external_cal: boolean
          booking_source: 'manual' | 'widget' | 'api' | 'email'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          calendar_id?: string | null
          appointment_type_id?: string | null
          contact_id?: string | null
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          title: string
          description?: string | null
          location?: string | null
          start_time: string
          end_time: string
          duration_minutes?: number | null
          timezone?: string
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
          payment_status?: 'pending' | 'paid' | 'refunded' | 'cancelled' | null
          meeting_link?: string | null
          meeting_id?: string | null
          meeting_password?: string | null
          internal_notes?: string | null
          customer_notes?: string | null
          calendar_event_id?: string | null
          synced_to_external_cal?: boolean
          booking_source?: 'manual' | 'widget' | 'api' | 'email'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          calendar_id?: string | null
          appointment_type_id?: string | null
          contact_id?: string | null
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          title?: string
          description?: string | null
          location?: string | null
          start_time?: string
          end_time?: string
          duration_minutes?: number | null
          timezone?: string
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
          payment_status?: 'pending' | 'paid' | 'refunded' | 'cancelled' | null
          meeting_link?: string | null
          meeting_id?: string | null
          meeting_password?: string | null
          internal_notes?: string | null
          customer_notes?: string | null
          calendar_event_id?: string | null
          synced_to_external_cal?: boolean
          booking_source?: 'manual' | 'widget' | 'api' | 'email'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointment_reminders: {
        Row: {
          id: string
          organization_id: string
          appointment_id: string
          remind_before_hours: number
          type: 'email' | 'sms'
          status: 'pending' | 'sent' | 'failed'
          sent_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          appointment_id: string
          remind_before_hours: number
          type: 'email' | 'sms'
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          appointment_id?: string
          remind_before_hours?: number
          type?: 'email' | 'sms'
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      appointment_history: {
        Row: {
          id: string
          organization_id: string
          appointment_id: string
          action: string
          changed_by_user_id: string | null
          previous_values: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          appointment_id: string
          action: string
          changed_by_user_id?: string | null
          previous_values?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          appointment_id?: string
          action?: string
          changed_by_user_id?: string | null
          previous_values?: Json | null
          created_at?: string
        }
        Relationships: []
      }

      // =====================================================
      // Phone/VoIP Module (abbreviated for space - full structure follows same pattern)
      // =====================================================
      phone_numbers: {
        Row: {
          id: string
          organization_id: string
          phone_number: string
          country_code: string
          type: 'local' | 'toll_free' | 'mobile'
          provider: string
          provider_phone_id: string | null
          forward_to: string | null
          sip_trunk_id: string | null
          webhook_url: string | null
          status: 'active' | 'suspended' | 'cancelled'
          tracking_source: string | null
          call_tracking_enabled: boolean
          recording_enabled: boolean
          voicemail_enabled: boolean
          sms_enabled: boolean
          purchased_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          phone_number: string
          country_code?: string
          type?: 'local' | 'toll_free' | 'mobile'
          provider: string
          provider_phone_id?: string | null
          forward_to?: string | null
          sip_trunk_id?: string | null
          webhook_url?: string | null
          status?: 'active' | 'suspended' | 'cancelled'
          tracking_source?: string | null
          call_tracking_enabled?: boolean
          recording_enabled?: boolean
          voicemail_enabled?: boolean
          sms_enabled?: boolean
          purchased_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          phone_number?: string
          country_code?: string
          type?: 'local' | 'toll_free' | 'mobile'
          provider?: string
          provider_phone_id?: string | null
          forward_to?: string | null
          sip_trunk_id?: string | null
          webhook_url?: string | null
          status?: 'active' | 'suspended' | 'cancelled'
          tracking_source?: string | null
          call_tracking_enabled?: boolean
          recording_enabled?: boolean
          voicemail_enabled?: boolean
          sms_enabled?: boolean
          purchased_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // Additional phone module tables follow same pattern: phone_calls, phone_recordings, voicemails, sms_threads, sms_messages

      // =====================================================
      // Membership Module (abbreviated)
      // =====================================================
      membership_plans: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          slug: string
          price: number
          currency: string
          billing_interval: 'one_time' | 'monthly' | 'yearly' | null
          trial_days: number
          max_members: number | null
          storage_quota_mb: number | null
          features: Json
          content_tiers: string[] | null
          stripe_price_id: string | null
          status: 'draft' | 'active' | 'archived'
          public: boolean
          order_index: number
          featured: boolean
          badge: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          slug: string
          price: number
          currency?: string
          billing_interval?: 'one_time' | 'monthly' | 'yearly' | null
          trial_days?: number
          max_members?: number | null
          storage_quota_mb?: number | null
          features?: Json
          content_tiers?: string[] | null
          stripe_price_id?: string | null
          status?: 'draft' | 'active' | 'archived'
          public?: boolean
          order_index?: number
          featured?: boolean
          badge?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          slug?: string
          price?: number
          currency?: string
          billing_interval?: 'one_time' | 'monthly' | 'yearly' | null
          trial_days?: number
          max_members?: number | null
          storage_quota_mb?: number | null
          features?: Json
          content_tiers?: string[] | null
          stripe_price_id?: string | null
          status?: 'draft' | 'active' | 'archived'
          public?: boolean
          order_index?: number
          featured?: boolean
          badge?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // Additional membership tables: membership_subscriptions, membership_content, membership_access, membership_progress, membership_certificates

      // =====================================================
      // Social Media Module (abbreviated)
      // =====================================================
      social_accounts: {
        Row: {
          id: string
          organization_id: string
          platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'pinterest' | 'youtube'
          account_name: string
          account_id: string | null
          username: string | null
          profile_url: string | null
          profile_image_url: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          page_name: string | null
          page_id: string | null
          status: 'active' | 'expired' | 'error' | 'disconnected'
          last_synced_at: string | null
          error_message: string | null
          can_post: boolean
          can_schedule: boolean
          can_analytics: boolean
          auto_post: boolean
          default_hashtags: string[] | null
          connected_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'pinterest' | 'youtube'
          account_name: string
          account_id?: string | null
          username?: string | null
          profile_url?: string | null
          profile_image_url?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          page_name?: string | null
          page_id?: string | null
          status?: 'active' | 'expired' | 'error' | 'disconnected'
          last_synced_at?: string | null
          error_message?: string | null
          can_post?: boolean
          can_schedule?: boolean
          can_analytics?: boolean
          auto_post?: boolean
          default_hashtags?: string[] | null
          connected_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          platform?: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'pinterest' | 'youtube'
          account_name?: string
          account_id?: string | null
          username?: string | null
          profile_url?: string | null
          profile_image_url?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          page_name?: string | null
          page_id?: string | null
          status?: 'active' | 'expired' | 'error' | 'disconnected'
          last_synced_at?: string | null
          error_message?: string | null
          can_post?: boolean
          can_schedule?: boolean
          can_analytics?: boolean
          auto_post?: boolean
          default_hashtags?: string[] | null
          connected_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // Additional social tables: social_posts, social_scheduled_posts, social_analytics, social_comments, social_comment_replies, social_media_library

      // =====================================================
      // Reputation Management Module (abbreviated)
      // =====================================================
      review_sources: {
        Row: {
          id: string
          organization_id: string
          platform: 'google' | 'yelp' | 'facebook' | 'tripadvisor' | 'trustpilot' | 'zomato' | 'opentable'
          business_name: string
          business_location: string | null
          business_id: string | null
          platform_url: string | null
          review_page_url: string | null
          api_key: string | null
          api_secret: string | null
          sync_enabled: boolean
          sync_frequency_hours: number
          last_synced_at: string | null
          next_sync_at: string | null
          auto_response_enabled: boolean
          auto_response_template_id: string | null
          auto_response_delay_hours: number
          status: 'active' | 'error' | 'disconnected'
          error_message: string | null
          average_rating: number | null
          total_reviews: number
          connected_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          platform: 'google' | 'yelp' | 'facebook' | 'tripadvisor' | 'trustpilot' | 'zomato' | 'opentable'
          business_name: string
          business_location?: string | null
          business_id?: string | null
          platform_url?: string | null
          review_page_url?: string | null
          api_key?: string | null
          api_secret?: string | null
          sync_enabled?: boolean
          sync_frequency_hours?: number
          last_synced_at?: string | null
          next_sync_at?: string | null
          auto_response_enabled?: boolean
          auto_response_template_id?: string | null
          auto_response_delay_hours?: number
          status?: 'active' | 'error' | 'disconnected'
          error_message?: string | null
          average_rating?: number | null
          total_reviews?: number
          connected_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          platform?: 'google' | 'yelp' | 'facebook' | 'tripadvisor' | 'trustpilot' | 'zomato' | 'opentable'
          business_name?: string
          business_location?: string | null
          business_id?: string | null
          platform_url?: string | null
          review_page_url?: string | null
          api_key?: string | null
          api_secret?: string | null
          sync_enabled?: boolean
          sync_frequency_hours?: number
          last_synced_at?: string | null
          next_sync_at?: string | null
          auto_response_enabled?: boolean
          auto_response_template_id?: string | null
          auto_response_delay_hours?: number
          status?: 'active' | 'error' | 'disconnected'
          error_message?: string | null
          average_rating?: number | null
          total_reviews?: number
          connected_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // Additional reputation tables: reviews, review_responses, review_flags, review_notifications, review_analytics

      // =====================================================
      // AI Memory & Preferences Module
      // =====================================================
      conversation_memories: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          messages: Json
          context_data: Json
          summary: string | null
          token_count: number
          module: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          messages: Json
          context_data: Json
          summary?: string | null
          token_count?: number
          module?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          messages?: Json
          context_data?: Json
          summary?: string | null
          token_count?: number
          module?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          user_id: string
          organization_id: string
          ai_assistance_enabled: boolean
          command_bar_suggestions: boolean
          smart_notifications: boolean
          auto_suggestions: boolean
          theme: 'light' | 'dark' | 'auto'
          density: 'compact' | 'comfortable' | 'spacious'
          shortcuts: Json
          notification_email: boolean
          notification_push: boolean
          notification_summary_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
          updated_at: string
          created_at: string
        }
        Insert: {
          user_id: string
          organization_id: string
          ai_assistance_enabled?: boolean
          command_bar_suggestions?: boolean
          smart_notifications?: boolean
          auto_suggestions?: boolean
          theme?: 'light' | 'dark' | 'auto'
          density?: 'compact' | 'comfortable' | 'spacious'
          shortcuts?: Json
          notification_email?: boolean
          notification_push?: boolean
          notification_summary_frequency?: 'realtime' | 'hourly' | 'daily' | 'weekly'
          updated_at?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          organization_id?: string
          ai_assistance_enabled?: boolean
          command_bar_suggestions?: boolean
          smart_notifications?: boolean
          auto_suggestions?: boolean
          theme?: 'light' | 'dark' | 'auto'
          density?: 'compact' | 'comfortable' | 'spacious'
          shortcuts?: Json
          notification_email?: boolean
          notification_push?: boolean
          notification_summary_frequency?: 'realtime' | 'hourly' | 'daily' | 'weekly'
          updated_at?: string
          created_at?: string
        }
        Relationships: []
      }

      // =====================================================
      // Integrations Module
      // =====================================================
      integration_connections: {
        Row: {
          id: string
          organization_id: string
          integration_id: string
          name: string | null
          status: 'active' | 'error' | 'disabled' | 'expired'
          credentials: Json
          config: Json
          last_synced_at: string | null
          last_error: string | null
          error_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          integration_id: string
          name?: string | null
          status?: 'active' | 'error' | 'disabled' | 'expired'
          credentials: Json
          config?: Json
          last_synced_at?: string | null
          last_error?: string | null
          error_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          integration_id?: string
          name?: string | null
          status?: 'active' | 'error' | 'disabled' | 'expired'
          credentials?: Json
          config?: Json
          last_synced_at?: string | null
          last_error?: string | null
          error_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_webhooks: {
        Row: {
          id: string
          organization_id: string
          connection_id: string | null
          integration_id: string
          webhook_id: string | null
          event_type: string
          endpoint_url: string | null
          secret: string | null
          config: Json
          active: boolean
          status: 'active' | 'paused' | 'error'
          total_received: number
          last_received_at: string | null
          last_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          connection_id?: string | null
          integration_id: string
          webhook_id?: string | null
          event_type: string
          endpoint_url?: string | null
          secret?: string | null
          config?: Json
          active?: boolean
          status?: 'active' | 'paused' | 'error'
          total_received?: number
          last_received_at?: string | null
          last_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          connection_id?: string | null
          integration_id?: string
          webhook_id?: string | null
          event_type?: string
          endpoint_url?: string | null
          secret?: string | null
          config?: Json
          active?: boolean
          status?: 'active' | 'paused' | 'error'
          total_received?: number
          last_received_at?: string | null
          last_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_sync_logs: {
        Row: {
          id: string
          connection_id: string
          sync_type: string
          sync_direction: 'pull' | 'push' | 'bidirectional' | null
          status: 'running' | 'completed' | 'failed' | 'cancelled'
          records_processed: number
          records_created: number
          records_updated: number
          records_failed: number
          errors: Json | null
          started_at: string
          completed_at: string | null
          duration_seconds: number | null
          triggered_by: 'manual' | 'scheduled' | 'webhook' | 'automation' | null
          triggered_by_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          sync_type: string
          sync_direction?: 'pull' | 'push' | 'bidirectional' | null
          status?: 'running' | 'completed' | 'failed' | 'cancelled'
          records_processed?: number
          records_created?: number
          records_updated?: number
          records_failed?: number
          errors?: Json | null
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
          triggered_by?: 'manual' | 'scheduled' | 'webhook' | 'automation' | null
          triggered_by_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          connection_id?: string
          sync_type?: string
          sync_direction?: 'pull' | 'push' | 'bidirectional' | null
          status?: 'running' | 'completed' | 'failed' | 'cancelled'
          records_processed?: number
          records_created?: number
          records_updated?: number
          records_failed?: number
          errors?: Json | null
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
          triggered_by?: 'manual' | 'scheduled' | 'webhook' | 'automation' | null
          triggered_by_user_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      integration_webhook_events: {
        Row: {
          id: string
          webhook_id: string
          connection_id: string | null
          event_type: string
          event_id: string | null
          payload: Json
          headers: Json | null
          status: 'received' | 'processing' | 'processed' | 'failed'
          processed_at: string | null
          error_message: string | null
          retry_count: number
          max_reached: boolean
          triggered_workflow_execution_id: string | null
          received_at: string
          created_at: string
        }
        Insert: {
          id?: string
          webhook_id: string
          connection_id?: string | null
          event_type: string
          event_id?: string | null
          payload: Json
          headers?: Json | null
          status?: 'received' | 'processing' | 'processed' | 'failed'
          processed_at?: string | null
          error_message?: string | null
          retry_count?: number
          max_reached?: boolean
          triggered_workflow_execution_id?: string | null
          received_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          webhook_id?: string
          connection_id?: string | null
          event_type?: string
          event_id?: string | null
          payload?: Json
          headers?: Json | null
          status?: 'received' | 'processing' | 'processed' | 'failed'
          processed_at?: string | null
          error_message?: string | null
          retry_count?: number
          max_reached?: boolean
          triggered_workflow_execution_id?: string | null
          received_at?: string
          created_at?: string
        }
        Relationships: []
      }
      // =====================================================
      // Activities Module - Missing Tables
      // =====================================================
      deal_history: {
        Row: {
          id: string
          organization_id: string
          deal_id: string
          from_stage_id: string | null
          to_stage_id: string | null
          from_stage_name: string | null
          to_stage_name: string | null
          from_status: string | null
          to_status: string | null
          changed_by_user_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          deal_id: string
          from_stage_id?: string | null
          to_stage_id?: string | null
          from_stage_name?: string | null
          to_stage_name?: string | null
          from_status?: string | null
          to_status?: string | null
          changed_by_user_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          deal_id?: string
          from_stage_id?: string | null
          to_stage_id?: string | null
          from_stage_name?: string | null
          to_stage_name?: string | null
          from_status?: string | null
          to_status?: string | null
          changed_by_user_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          organization_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      contact_tags: {
        Row: {
          contact_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          contact_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          contact_id?: string
          tag_id?: string
          created_at?: string
        }
        Relationships: []
      }
      lead_scores: {
        Row: {
          id: string
          organization_id: string
          contact_id: string
          score: number
          grade: 'A' | 'B' | 'C' | 'D' | 'F' | null
          factors: Json
          last_calculated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          contact_id: string
          score?: number
          grade?: 'A' | 'B' | 'C' | 'D' | 'F' | null
          factors?: Json
          last_calculated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          contact_id?: string
          score?: number
          grade?: 'A' | 'B' | 'C' | 'D' | 'F' | null
          factors?: Json
          last_calculated_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      // =====================================================
      // Phone Module - Missing Tables
      // =====================================================
      phone_calls: {
        Row: {
          id: string
          organization_id: string
          phone_number_id: string | null
          direction: 'inbound' | 'outbound'
          from_number: string
          to_number: string
          contact_id: string | null
          status: 'ringing' | 'in_progress' | 'completed' | 'failed' | 'busy' | 'no_answer' | 'cancelled' | 'voicemail'
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          provider_call_id: string | null
          provider: string
          recording_id: string | null
          recording_enabled: boolean
          voicemail_id: string | null
          call_flow: Json | null
          quality_score: number | null
          hangup_reason: string | null
          agent_id: string | null
          tags: string[] | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          phone_number_id?: string | null
          direction: 'inbound' | 'outbound'
          from_number: string
          to_number: string
          contact_id?: string | null
          status?: 'ringing' | 'in_progress' | 'completed' | 'failed' | 'busy' | 'no_answer' | 'cancelled' | 'voicemail'
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          provider_call_id?: string | null
          provider: string
          recording_id?: string | null
          recording_enabled?: boolean
          voicemail_id?: string | null
          call_flow?: Json | null
          quality_score?: number | null
          hangup_reason?: string | null
          agent_id?: string | null
          tags?: string[] | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          phone_number_id?: string | null
          direction?: 'inbound' | 'outbound'
          from_number?: string
          to_number?: string
          contact_id?: string | null
          status?: 'ringing' | 'in_progress' | 'completed' | 'failed' | 'busy' | 'no_answer' | 'cancelled' | 'voicemail'
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          provider_call_id?: string | null
          provider?: string
          recording_id?: string | null
          recording_enabled?: boolean
          voicemail_id?: string | null
          call_flow?: Json | null
          quality_score?: number | null
          hangup_reason?: string | null
          agent_id?: string | null
          tags?: string[] | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      phone_recordings: {
        Row: {
          id: string
          organization_id: string
          call_id: string
          storage_path: string
          storage_provider: string
          duration_seconds: number | null
          file_size_bytes: number | null
          format: string
          url: string | null
          transcript: string | null
          transcription_status: 'pending' | 'processing' | 'completed' | 'failed' | null
          transcribed_at: string | null
          sentiment: 'positive' | 'neutral' | 'negative' | null
          sentiment_score: number | null
          keywords: string[] | null
          summary: string | null
          consent_obtained: boolean
          consent_obtained_at: string | null
          accessible_by_roles: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          call_id: string
          storage_path: string
          storage_provider?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          format?: string
          url?: string | null
          transcript?: string | null
          transcription_status?: 'pending' | 'processing' | 'completed' | 'failed' | null
          transcribed_at?: string | null
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          sentiment_score?: number | null
          keywords?: string[] | null
          summary?: string | null
          consent_obtained?: boolean
          consent_obtained_at?: string | null
          accessible_by_roles?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          call_id?: string
          storage_path?: string
          storage_provider?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          format?: string
          url?: string | null
          transcript?: string | null
          transcription_status?: 'pending' | 'processing' | 'completed' | 'failed' | null
          transcribed_at?: string | null
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          sentiment_score?: number | null
          keywords?: string[] | null
          summary?: string | null
          consent_obtained?: boolean
          consent_obtained_at?: string | null
          accessible_by_roles?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
      voicemails: {
        Row: {
          id: string
          organization_id: string
          phone_number_id: string | null
          call_id: string | null
          from_number: string
          caller_name: string | null
          duration_seconds: number | null
          transcription: string | null
          transcription_status: 'pending' | 'processing' | 'completed' | 'failed'
          storage_path: string
          storage_provider: string
          url: string | null
          file_size_bytes: number | null
          status: 'new' | 'listened' | 'archived' | 'deleted'
          notification_sent: boolean
          notification_sent_at: string | null
          received_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          phone_number_id?: string | null
          call_id?: string | null
          from_number: string
          caller_name?: string | null
          duration_seconds?: number | null
          transcription?: string | null
          transcription_status?: 'pending' | 'processing' | 'completed' | 'failed'
          storage_path: string
          storage_provider?: string
          url?: string | null
          file_size_bytes?: number | null
          status?: 'new' | 'listened' | 'archived' | 'deleted'
          notification_sent?: boolean
          notification_sent_at?: string | null
          received_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          phone_number_id?: string | null
          call_id?: string | null
          from_number?: string
          caller_name?: string | null
          duration_seconds?: number | null
          transcription?: string | null
          transcription_status?: 'pending' | 'processing' | 'completed' | 'failed'
          storage_path?: string
          storage_provider?: string
          url?: string | null
          file_size_bytes?: number | null
          status?: 'new' | 'listened' | 'archived' | 'deleted'
          notification_sent?: boolean
          notification_sent_at?: string | null
          received_at?: string
          created_at?: string
        }
        Relationships: []
      }
      sms_threads: {
        Row: {
          id: string
          organization_id: string
          phone_number_id: string | null
          contact_id: string | null
          participant_phone: string
          status: 'active' | 'archived' | 'closed'
          assigned_to: string | null
          last_message_at: string | null
          last_message_preview: string | null
          unread_count: number
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          phone_number_id?: string | null
          contact_id?: string | null
          participant_phone: string
          status?: 'active' | 'archived' | 'closed'
          assigned_to?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          unread_count?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          phone_number_id?: string | null
          contact_id?: string | null
          participant_phone?: string
          status?: 'active' | 'archived' | 'closed'
          assigned_to?: string | null
          last_message_at?: string | null
          last_message_preview?: string | null
          unread_count?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_messages: {
        Row: {
          id: string
          organization_id: string
          thread_id: string
          phone_number_id: string | null
          direction: 'inbound' | 'outbound'
          from_number: string
          to_number: string
          body: string
          media_urls: string[] | null
          status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered' | 'received' | 'read'
          provider_message_id: string | null
          provider: string
          error_code: string | null
          error_message: string | null
          read_at: string | null
          sent_by: string | null
          sent_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          thread_id: string
          phone_number_id?: string | null
          direction: 'inbound' | 'outbound'
          from_number: string
          to_number: string
          body: string
          media_urls?: string[] | null
          status?: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered' | 'received' | 'read'
          provider_message_id?: string | null
          provider: string
          error_code?: string | null
          error_message?: string | null
          read_at?: string | null
          sent_by?: string | null
          sent_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          thread_id?: string
          phone_number_id?: string | null
          direction?: 'inbound' | 'outbound'
          from_number?: string
          to_number?: string
          body?: string
          media_urls?: string[] | null
          status?: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered' | 'received' | 'read'
          provider_message_id?: string | null
          provider?: string
          error_code?: string | null
          error_message?: string | null
          read_at?: string | null
          sent_by?: string | null
          sent_at?: string
          created_at?: string
        }
        Relationships: []
      }
      // =====================================================
      // Membership Module - Missing Tables
      // =====================================================
      membership_subscriptions: {
        Row: {
          id: string
          organization_id: string
          plan_id: string
          user_id: string
          contact_id: string | null
          status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'incomplete' | 'incomplete_expired'
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          cancel_at_period_end: boolean
          cancelled_at: string | null
          cancel_at: string | null
          price: number | null
          currency: string
          billing_interval: string | null
          max_team_members: number | null
          current_team_members: number
          started_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          plan_id: string
          user_id: string
          contact_id?: string | null
          status?: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'incomplete' | 'incomplete_expired'
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          cancel_at?: string | null
          price?: number | null
          currency?: string
          billing_interval?: string | null
          max_team_members?: number | null
          current_team_members?: number
          started_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          plan_id?: string
          user_id?: string
          contact_id?: string | null
          status?: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'incomplete' | 'incomplete_expired'
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          cancel_at?: string | null
          price?: number | null
          currency?: string
          billing_interval?: string | null
          max_team_members?: number | null
          current_team_members?: number
          started_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_content: {
        Row: {
          id: string
          organization_id: string
          parent_content_id: string | null
          content_type: 'course' | 'video' | 'document' | 'resource' | 'live_event'
          title: string
          slug: string
          description: string | null
          content_body: string | null
          thumbnail_url: string | null
          video_url: string | null
          video_duration_seconds: number | null
          file_url: string | null
          file_size_bytes: number | null
          order_index: number
          is_published: boolean
          access_tier: string
          require_subscription: boolean
          drip_delay_days: number
          meta_title: string | null
          meta_description: string | null
          views: number
          likes: number
          settings: Json
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          parent_content_id?: string | null
          content_type: 'course' | 'video' | 'document' | 'resource' | 'live_event'
          title: string
          slug: string
          description?: string | null
          content_body?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          video_duration_seconds?: number | null
          file_url?: string | null
          file_size_bytes?: number | null
          order_index?: number
          is_published?: boolean
          access_tier: string
          require_subscription?: boolean
          drip_delay_days?: number
          meta_title?: string | null
          meta_description?: string | null
          views?: number
          likes?: number
          settings?: Json
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          parent_content_id?: string | null
          content_type?: 'course' | 'video' | 'document' | 'resource' | 'live_event'
          title?: string
          slug?: string
          description?: string | null
          content_body?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          video_duration_seconds?: number | null
          file_url?: string | null
          file_size_bytes?: number | null
          order_index?: number
          is_published?: boolean
          access_tier?: string
          require_subscription?: boolean
          drip_delay_days?: number
          meta_title?: string | null
          meta_description?: string | null
          views?: number
          likes?: number
          settings?: Json
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_access: {
        Row: {
          id: string
          organization_id: string
          subscription_id: string
          content_id: string
          access_type: 'full' | 'preview' | 'none'
          progress_percent: number
          is_completed: boolean
          completed_at: string | null
          last_accessed_at: string | null
          total_time_spent_seconds: number
          notes: string | null
          bookmarked_at: string | null
          granted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          subscription_id: string
          content_id: string
          access_type?: 'full' | 'preview' | 'none'
          progress_percent?: number
          is_completed?: boolean
          completed_at?: string | null
          last_accessed_at?: string | null
          total_time_spent_seconds?: number
          notes?: string | null
          bookmarked_at?: string | null
          granted_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          subscription_id?: string
          content_id?: string
          access_type?: 'full' | 'preview' | 'none'
          progress_percent?: number
          is_completed?: boolean
          completed_at?: string | null
          last_accessed_at?: string | null
          total_time_spent_seconds?: number
          notes?: string | null
          bookmarked_at?: string | null
          granted_at?: string
          created_at?: string
        }
        Relationships: []
      }
      membership_progress: {
        Row: {
          id: string
          organization_id: string
          access_id: string
          lesson_id: string
          status: 'not_started' | 'in_progress' | 'completed'
          last_position_seconds: number
          time_spent_seconds: number
          quiz_score: number | null
          quiz_completed_at: string | null
          notes: string | null
          started_at: string | null
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          access_id: string
          lesson_id: string
          status?: 'not_started' | 'in_progress' | 'completed'
          last_position_seconds?: number
          time_spent_seconds?: number
          quiz_score?: number | null
          quiz_completed_at?: string | null
          notes?: string | null
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          access_id?: string
          lesson_id?: string
          status?: 'not_started' | 'in_progress' | 'completed'
          last_position_seconds?: number
          time_spent_seconds?: number
          quiz_score?: number | null
          quiz_completed_at?: string | null
          notes?: string | null
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      membership_certificates: {
        Row: {
          id: string
          organization_id: string
          subscription_id: string
          content_id: string
          user_id: string
          certificate_number: string
          recipient_name: string
          course_name: string
          completed_at: string
          certificate_url: string | null
          certificate_pdf_url: string | null
          verification_token: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          subscription_id: string
          content_id: string
          user_id: string
          certificate_number: string
          recipient_name: string
          course_name: string
          completed_at: string
          certificate_url?: string | null
          certificate_pdf_url?: string | null
          verification_token: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          subscription_id?: string
          content_id?: string
          user_id?: string
          certificate_number?: string
          recipient_name?: string
          course_name?: string
          completed_at?: string
          certificate_url?: string | null
          certificate_pdf_url?: string | null
          verification_token?: string
          created_at?: string
        }
        Relationships: []
      }
      // =====================================================
      // Social Media Module - Missing Tables
      // =====================================================
      social_posts: {
        Row: {
          id: string
          organization_id: string
          content: string
          media_urls: string[] | null
          media_type: 'text' | 'image' | 'video' | 'link' | 'carousel' | null
          link_url: string | null
          link_title: string | null
          link_description: string | null
          link_image_url: string | null
          hashtags: string[] | null
          mentions: string[] | null
          post_type: 'post' | 'story' | 'reel' | 'article'
          campaign_id: string | null
          internal_notes: string | null
          status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled'
          published_at: string | null
          platform_post_ids: Json
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          content: string
          media_urls?: string[] | null
          media_type?: 'text' | 'image' | 'video' | 'link' | 'carousel' | null
          link_url?: string | null
          link_title?: string | null
          link_description?: string | null
          link_image_url?: string | null
          hashtags?: string[] | null
          mentions?: string[] | null
          post_type?: 'post' | 'story' | 'reel' | 'article'
          campaign_id?: string | null
          internal_notes?: string | null
          status?: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled'
          published_at?: string | null
          platform_post_ids?: Json
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          content?: string
          media_urls?: string[] | null
          media_type?: 'text' | 'image' | 'video' | 'link' | 'carousel' | null
          link_url?: string | null
          link_title?: string | null
          link_description?: string | null
          link_image_url?: string | null
          hashtags?: string[] | null
          mentions?: string[] | null
          post_type?: 'post' | 'story' | 'reel' | 'article'
          campaign_id?: string | null
          internal_notes?: string | null
          status?: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled'
          published_at?: string | null
          platform_post_ids?: Json
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_scheduled_posts: {
        Row: {
          id: string
          organization_id: string
          post_id: string
          account_id: string
          scheduled_for: string
          timezone: string
          platform_content: string | null
          platform_media_urls: string[] | null
          status: 'pending' | 'processing' | 'posted' | 'failed' | 'cancelled'
          retry_count: number
          max_retries: number
          retry_after: string | null
          posted_at: string | null
          platform_post_id: string | null
          post_url: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          post_id: string
          account_id: string
          scheduled_for: string
          timezone?: string
          platform_content?: string | null
          platform_media_urls?: string[] | null
          status?: 'pending' | 'processing' | 'posted' | 'failed' | 'cancelled'
          retry_count?: number
          max_retries?: number
          retry_after?: string | null
          posted_at?: string | null
          platform_post_id?: string | null
          post_url?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          post_id?: string
          account_id?: string
          scheduled_for?: string
          timezone?: string
          platform_content?: string | null
          platform_media_urls?: string[] | null
          status?: 'pending' | 'processing' | 'posted' | 'failed' | 'cancelled'
          retry_count?: number
          max_retries?: number
          retry_after?: string | null
          posted_at?: string | null
          platform_post_id?: string | null
          post_url?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_analytics: {
        Row: {
          id: string
          organization_id: string
          post_id: string | null
          account_id: string
          metric_date: string
          impressions: number
          reach: number
          likes: number
          comments: number
          shares: number
          clicks: number
          saves: number
          views: number
          view_duration_seconds: number | null
          video_completion_rate: number | null
          exits: number | null
          replies: number | null
          profile_visits: number
          follows: number
          unfollows: number
          raw_data: Json | null
          fetched_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          post_id?: string | null
          account_id: string
          metric_date: string
          impressions?: number
          reach?: number
          likes?: number
          comments?: number
          shares?: number
          clicks?: number
          saves?: number
          views?: number
          view_duration_seconds?: number | null
          video_completion_rate?: number | null
          exits?: number | null
          replies?: number | null
          profile_visits?: number
          follows?: number
          unfollows?: number
          raw_data?: Json | null
          fetched_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          post_id?: string | null
          account_id?: string
          metric_date?: string
          impressions?: number
          reach?: number
          likes?: number
          comments?: number
          shares?: number
          clicks?: number
          saves?: number
          views?: number
          view_duration_seconds?: number | null
          video_completion_rate?: number | null
          exits?: number | null
          replies?: number | null
          profile_visits?: number
          follows?: number
          unfollows?: number
          raw_data?: Json | null
          fetched_at?: string
          created_at?: string
        }
        Relationships: []
      }
      social_comments: {
        Row: {
          id: string
          organization_id: string
          post_id: string
          account_id: string | null
          platform: string
          platform_comment_id: string
          parent_comment_id: string | null
          commenter_name: string | null
          commenter_username: string | null
          commenter_profile_url: string | null
          content: string
          status: 'new' | 'read' | 'replied' | 'hidden' | 'reported'
          hidden: boolean
          flagged: boolean
          auto_replied: boolean
          auto_reply_template_id: string | null
          commented_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          post_id: string
          account_id?: string | null
          platform: string
          platform_comment_id: string
          parent_comment_id?: string | null
          commenter_name?: string | null
          commenter_username?: string | null
          commenter_profile_url?: string | null
          content: string
          status?: 'new' | 'read' | 'replied' | 'hidden' | 'reported'
          hidden?: boolean
          flagged?: boolean
          auto_replied?: boolean
          auto_reply_template_id?: string | null
          commented_at: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          post_id?: string
          account_id?: string | null
          platform?: string
          platform_comment_id?: string
          parent_comment_id?: string | null
          commenter_name?: string | null
          commenter_username?: string | null
          commenter_profile_url?: string | null
          content?: string
          status?: 'new' | 'read' | 'replied' | 'hidden' | 'reported'
          hidden?: boolean
          flagged?: boolean
          auto_replied?: boolean
          auto_reply_template_id?: string | null
          commented_at?: string
          created_at?: string
        }
        Relationships: []
      }
      social_comment_replies: {
        Row: {
          id: string
          organization_id: string
          comment_id: string
          content: string
          platform_reply_id: string | null
          posted_on_platform: boolean
          replied_by: string | null
          replied_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          comment_id: string
          content: string
          platform_reply_id?: string | null
          posted_on_platform?: boolean
          replied_by?: string | null
          replied_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          comment_id?: string
          content?: string
          platform_reply_id?: string | null
          posted_on_platform?: boolean
          replied_by?: string | null
          replied_at?: string
          created_at?: string
        }
        Relationships: []
      }
      social_media_library: {
        Row: {
          id: string
          organization_id: string
          file_name: string
          file_url: string
          file_type: 'image' | 'video' | 'gif' | null
          file_size_bytes: number | null
          width: number | null
          height: number | null
          duration_seconds: number | null
          thumbnail_url: string | null
          folder: string
          tags: string[] | null
          alt_text: string | null
          usage_count: number
          last_used_at: string | null
          uploaded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          file_name: string
          file_url: string
          file_type?: 'image' | 'video' | 'gif' | null
          file_size_bytes?: number | null
          width?: number | null
          height?: number | null
          duration_seconds?: number | null
          thumbnail_url?: string | null
          folder?: string
          tags?: string[] | null
          alt_text?: string | null
          usage_count?: number
          last_used_at?: string | null
          uploaded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          file_name?: string
          file_url?: string
          file_type?: 'image' | 'video' | 'gif' | null
          file_size_bytes?: number | null
          width?: number | null
          height?: number | null
          duration_seconds?: number | null
          thumbnail_url?: string | null
          folder?: string
          tags?: string[] | null
          alt_text?: string | null
          usage_count?: number
          last_used_at?: string | null
          uploaded_at?: string
          created_at?: string
        }
        Relationships: []
      }
      // =====================================================
      // Reputation Module - Missing Tables
      // =====================================================
      reviews: {
        Row: {
          id: string
          organization_id: string
          source_id: string
          platform_review_id: string
          reviewer_name: string | null
          reviewer_username: string | null
          reviewer_profile_url: string | null
          reviewer_image_url: string | null
          is_verified_purchase: boolean
          rating: number
          title: string | null
          content: string | null
          images: string[] | null
          videos: string[] | null
          review_date: string
          raw_data: Json | null
          status: 'new' | 'read' | 'flagged' | 'hidden'
          sentiment: 'positive' | 'neutral' | 'negative' | null
          sentiment_score: number | null
          tags: string[] | null
          assigned_to: string | null
          fetched_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          source_id: string
          platform_review_id: string
          reviewer_name?: string | null
          reviewer_username?: string | null
          reviewer_profile_url?: string | null
          reviewer_image_url?: string | null
          is_verified_purchase?: boolean
          rating: number
          title?: string | null
          content?: string | null
          images?: string[] | null
          videos?: string[] | null
          review_date: string
          raw_data?: Json | null
          status?: 'new' | 'read' | 'flagged' | 'hidden'
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          sentiment_score?: number | null
          tags?: string[] | null
          assigned_to?: string | null
          fetched_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          source_id?: string
          platform_review_id?: string
          reviewer_name?: string | null
          reviewer_username?: string | null
          reviewer_profile_url?: string | null
          reviewer_image_url?: string | null
          is_verified_purchase?: boolean
          rating?: number
          title?: string | null
          content?: string | null
          images?: string[] | null
          videos?: string[] | null
          review_date?: string
          raw_data?: Json | null
          status?: 'new' | 'read' | 'flagged' | 'hidden'
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          sentiment_score?: number | null
          tags?: string[] | null
          assigned_to?: string | null
          fetched_at?: string
          created_at?: string
        }
        Relationships: []
      }
      review_responses: {
        Row: {
          id: string
          organization_id: string
          review_id: string
          content: string
          author_id: string | null
          author_name: string | null
          status: 'draft' | 'posted' | 'failed'
          platform_response_id: string | null
          posted_at: string | null
          posted_on_platform: boolean
          error_message: string | null
          response_type: 'public' | 'private' | 'both'
          template_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          review_id: string
          content: string
          author_id?: string | null
          author_name?: string | null
          status?: 'draft' | 'posted' | 'failed'
          platform_response_id?: string | null
          posted_at?: string | null
          posted_on_platform?: boolean
          error_message?: string | null
          response_type?: 'public' | 'private' | 'both'
          template_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          review_id?: string
          content?: string
          author_id?: string | null
          author_name?: string | null
          status?: 'draft' | 'posted' | 'failed'
          platform_response_id?: string | null
          posted_at?: string | null
          posted_on_platform?: boolean
          error_message?: string | null
          response_type?: 'public' | 'private' | 'both'
          template_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_flags: {
        Row: {
          id: string
          organization_id: string
          review_id: string
          flag_reason: 'spam' | 'fake_review' | 'inappropriate_content' | 'competitor' | 'off_topic' | 'other'
          notes: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          resolution_notes: string | null
          action_taken: 'none' | 'hidden' | 'reported' | 'removed' | null
          flagged_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          review_id: string
          flag_reason: 'spam' | 'fake_review' | 'inappropriate_content' | 'competitor' | 'off_topic' | 'other'
          notes?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          action_taken?: 'none' | 'hidden' | 'reported' | 'removed' | null
          flagged_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          review_id?: string
          flag_reason?: 'spam' | 'fake_review' | 'inappropriate_content' | 'competitor' | 'off_topic' | 'other'
          notes?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          action_taken?: 'none' | 'hidden' | 'reported' | 'removed' | null
          flagged_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      review_notifications: {
        Row: {
          id: string
          organization_id: string
          source_id: string
          notify_on_new_review: boolean
          notify_on_rating_change: boolean
          notify_on_negative_review: boolean
          negative_threshold: number
          email_enabled: boolean
          email_recipients: string[] | null
          sms_enabled: boolean
          sms_recipients: string[] | null
          slack_enabled: boolean
          slack_webhook_url: string | null
          send_digest: boolean
          digest_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
          active: boolean
          last_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          source_id: string
          notify_on_new_review?: boolean
          notify_on_rating_change?: boolean
          notify_on_negative_review?: boolean
          negative_threshold?: number
          email_enabled?: boolean
          email_recipients?: string[] | null
          sms_enabled?: boolean
          sms_recipients?: string[] | null
          slack_enabled?: boolean
          slack_webhook_url?: string | null
          send_digest?: boolean
          digest_frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly'
          active?: boolean
          last_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          source_id?: string
          notify_on_new_review?: boolean
          notify_on_rating_change?: boolean
          notify_on_negative_review?: boolean
          negative_threshold?: number
          email_enabled?: boolean
          email_recipients?: string[] | null
          sms_enabled?: boolean
          sms_recipients?: string[] | null
          slack_enabled?: boolean
          slack_webhook_url?: string | null
          send_digest?: boolean
          digest_frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly'
          active?: boolean
          last_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      review_analytics: {
        Row: {
          id: string
          organization_id: string
          source_id: string
          period_start: string
          period_end: string
          total_reviews: number
          average_rating: number
          rating_1_count: number
          rating_2_count: number
          rating_3_count: number
          rating_4_count: number
          rating_5_count: number
          responded_count: number
          response_rate: number
          avg_response_time_hours: number | null
          positive_count: number
          neutral_count: number
          negative_count: number
          rating_change: number | null
          review_count_change: number | null
          calculated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          source_id: string
          period_start: string
          period_end: string
          total_reviews?: number
          average_rating?: number
          rating_1_count?: number
          rating_2_count?: number
          rating_3_count?: number
          rating_4_count?: number
          rating_5_count?: number
          responded_count?: number
          response_rate?: number
          avg_response_time_hours?: number | null
          positive_count?: number
          neutral_count?: number
          negative_count?: number
          rating_change?: number | null
          review_count_change?: number | null
          calculated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          source_id?: string
          period_start?: string
          period_end?: string
          total_reviews?: number
          average_rating?: number
          rating_1_count?: number
          rating_2_count?: number
          rating_3_count?: number
          rating_4_count?: number
          rating_5_count?: number
          responded_count?: number
          response_rate?: number
          avg_response_time_hours?: number | null
          positive_count?: number
          neutral_count?: number
          negative_count?: number
          rating_change?: number | null
          review_count_change?: number | null
          calculated_at?: string
          created_at?: string
        }
        Relationships: []
      }
      workflow_queue: {
        Row: {
          id: string
          workflow_id: string
          execution_id: string
          organization_id: string
          priority: number
          scheduled_at: string
          status: 'queued' | 'processing' | 'failed' | 'completed'
          attempt_count: number
          max_attempts: number
          error: Json | null
        }
        Insert: {
          id?: string
          workflow_id: string
          execution_id: string
          organization_id: string
          priority?: number
          scheduled_at?: string
          status?: 'queued' | 'processing' | 'failed' | 'completed'
          attempt_count?: number
          max_attempts?: number
          error?: Json | null
        }
        Update: {
          id?: string
          workflow_id?: string
          execution_id?: string
          organization_id?: string
          priority?: number
          scheduled_at?: string
          status?: 'queued' | 'processing' | 'failed' | 'completed'
          attempt_count?: number
          max_attempts?: number
          error?: Json | null
        }
        Relationships: []
      }
      workflow_dead_letter_queue: {
        Row: {
          id: string
          original_queue_id: string
          workflow_id: string
          organization_id: string
          priority: number
          attempt_count: number
          error: Json
          created_at: string
        }
        Insert: {
          id?: string
          original_queue_id: string
          workflow_id: string
          organization_id: string
          priority?: number
          attempt_count?: number
          error?: Json
          created_at?: string
        }
        Update: {
          id?: string
          original_queue_id?: string
          workflow_id?: string
          organization_id?: string
          priority?: number
          attempt_count?: number
          error?: Json
          created_at?: string
        }
        Relationships: []
      }
      scheduled_triggers: {
        Row: {
          id: string
          workflow_id: string
          trigger_id: string
          cron_expression: string
          timezone: string
          next_run: string
          status: 'active' | 'paused' | 'disabled'
        }
        Insert: {
          id?: string
          workflow_id: string
          trigger_id: string
          cron_expression?: string
          timezone?: string
          next_run?: string
          status?: 'active' | 'paused' | 'disabled'
        }
        Update: {
          id?: string
          workflow_id?: string
          trigger_id?: string
          cron_expression?: string
          timezone?: string
          next_run?: string
          status?: 'active' | 'paused' | 'disabled'
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          id: string
          workflow_id: string
          trigger_id: string
          organization_id: string
          payload: Json
          headers: Json
          received_at: string
          processed: boolean
        }
        Insert: {
          id?: string
          workflow_id: string
          trigger_id: string
          organization_id: string
          payload?: Json
          headers?: Json
          received_at?: string
          processed?: boolean
        }
        Update: {
          id?: string
          workflow_id?: string
          trigger_id?: string
          organization_id?: string
          payload?: Json
          headers?: Json
          received_at?: string
          processed?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_: string]: never
    }
    Functions: {
      [_: string]: never
    }
    Enums: {
      [_: string]: never
    }
  }
}
