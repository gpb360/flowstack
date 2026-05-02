// @ts-nocheck
/**
 * Chat Widget Embed Code Generator
 * Generates embed codes for integrating the chat widget into external websites
 */

import type { ChatSettings, EmbedConfig, EmbedCodeOptions } from '../types';

// =====================================================
// HTML Embed Code Generation
// =====================================================

export function generateHTMLEmbedCode(
  organizationId: string,
  settings: Partial<ChatSettings>,
  options: EmbedCodeOptions = { format: 'html' }
): string {
  const config = buildConfigObject(organizationId, settings);

  if (options.minified) {
    return `<script>window.FlowStackChat=${JSON.stringify(config)};</script><script src="https://cdn.flowstack.com/chat/widget.js" async defer></script>`;
  }

  return `<!-- FlowStack Chat Widget -->
<script>
  window.FlowStackChat = ${JSON.stringify(config, null, 2)};
</script>
<script src="https://cdn.flowstack.com/chat/widget.js" async defer></script>
<!-- End FlowStack Chat Widget -->`;
}

// =====================================================
// React Embed Code Generation
// =====================================================

export function generateReactEmbedCode(
  organizationId: string,
  settings: Partial<ChatSettings>,
  options: EmbedCodeOptions = { format: 'react' }
): string {
  const config = buildConfigObject(organizationId, settings);

  if (options.minified) {
    return `import { ChatWidget } from '@flowstack/chat-widget';<ChatWidget {...${JSON.stringify(config)}} />`;
  }

  return `// Install: npm install @flowstack/chat-widget
import { ChatWidget } from '@flowstack/chat-widget';

function App() {
  return (
    <>
      {/* Your app content */}

      <ChatWidget
        organizationId="${config.organizationId}"
        theme={{
          color: "${config.theme?.color || '#3B82F6'}",
          position: "${config.theme?.position || 'bottom-right'}",
          borderRadius: ${config.theme?.borderRadius || 8},
          fontSize: "${config.theme?.fontSize || 'md'}",
        }}
        welcomeMessage="${config.welcomeMessage || 'How can we help you?'}"
        agentInfo={${JSON.stringify(config.agentInfo || {}, null, 8)}}
        preChatFormEnabled={${config.preChatFormEnabled || false}}
      />
    </>
  );
}

export default App;`;
}

// =====================================================
// Vue Embed Code Generation
// =====================================================

export function generateVueEmbedCode(
  organizationId: string,
  settings: Partial<ChatSettings>,
  options: EmbedCodeOptions = { format: 'vue' }
): string {
  const config = buildConfigObject(organizationId, settings);

  if (options.minified) {
    return `<ChatWidget v-bind="${JSON.stringify(config).replace(/"/g, "'")}" />`;
  }

  return `<!-- Install: npm install @flowstack/chat-widget -->
<template>
  <div>
    <!-- Your app content -->

    <ChatWidget
      :organizationId="'${config.organizationId}'"
      :theme="{
        color: '${config.theme?.color || '#3B82F6'}',
        position: '${config.theme?.position || 'bottom-right'}',
        borderRadius: ${config.theme?.borderRadius || 8},
        fontSize: '${config.theme?.fontSize || 'md'}',
      }"
      :welcomeMessage="'${config.welcomeMessage || 'How can we help you?'}"
      :agentInfo="${JSON.stringify(config.agentInfo || {})}"
      :preChatFormEnabled="${config.preChatFormEnabled || false}"
    />
  </div>
</template>

<script setup>
import { ChatWidget } from '@flowstack/chat-widget';
</script>`;
}

// =====================================================
// WordPress Embed Code Generation
// =====================================================

export function generateWordPressEmbedCode(
  organizationId: string,
  settings: Partial<ChatSettings>
): string {
  const config = buildConfigObject(organizationId, settings);

  return `<!-- FlowStack Chat Widget for WordPress -->
<!-- Add this to your theme's functions.php or use a plugin like "Header and Footer Scripts" -->

<script>
  window.FlowStackChat = ${JSON.stringify(config)};
</script>
<script src="https://cdn.flowstack.com/chat/widget.js" async defer></script>

<!-- Alternatively, install our WordPress plugin:
     https://wordpress.org/plugins/flowstack-chat-widget/ -->`;
}

// =====================================================
// Shopify Embed Code Generation
// =====================================================

export function generateShopifyEmbedCode(
  organizationId: string,
  settings: Partial<ChatSettings>
): string {
  const config = buildConfigObject(organizationId, settings);

  return `<!-- FlowStack Chat Widget for Shopify -->
<!-- Add this to your theme.liquid file, just before the closing </body> tag -->

<script>
  window.FlowStackChat = ${JSON.stringify(config)};
</script>
<script src="https://cdn.flowstack.com/chat/widget.js" async defer></script>

<!-- Or add this in Online Store > Themes > Edit code > Snippets:
     Create a new snippet named 'flowstack-chat.liquid' and paste this code,
     then add {% render 'flowstack-chat' %} to theme.liquid -->`;
}

// =====================================================
// Squarespace Embed Code Generation
// =====================================================

export function generateSquarespaceEmbedCode(
  organizationId: string,
  settings: Partial<ChatSettings>
): string {
  const config = buildConfigObject(organizationId, settings);

  return `<!-- FlowStack Chat Widget for Squarespace -->
<!-- Go to Settings > Advanced > Code Injection and add this to Footer: -->

<script>
  window.FlowStackChat = ${JSON.stringify(config)};
</script>
<script src="https://cdn.flowstack.com/chat/widget.js" async defer></script>`;
}

// =====================================================
// Wix Embed Code Generation
// =====================================================

export function generateWixEmbedCode(
  organizationId: string,
  settings: Partial<ChatSettings>
): string {
  const config = buildConfigObject(organizationId, settings);

  return `<!-- FlowStack Chat Widget for Wix -->
<!-- Go to Settings > Custom Code and add this to the Body section: -->

<script>
  window.FlowStackChat = ${JSON.stringify(config)};
</script>
<script src="https://cdn.flowstack.com/chat/widget.js" async defer></script>`;
}

// =====================================================
// Helper Functions
// =====================================================

function buildConfigObject(
  organizationId: string,
  settings: Partial<ChatSettings>
): EmbedConfig {
  return {
    organizationId,
    theme: {
      color: settings.widget_color,
      position: settings.widget_position,
      borderRadius: 8,
      fontSize: 'md',
      customCss: settings.custom_css,
    },
    welcomeMessage: settings.welcome_message,
    agentInfo: {
      name: settings.header_title,
      status: 'online',
    },
    preChatFormEnabled: settings.pre_chat_form_enabled,
  };
}

export function generateEmbedCode(
  organizationId: string,
  settings: Partial<ChatSettings>,
  platform: 'html' | 'react' | 'vue' | 'wordpress' | 'shopify' | 'squarespace' | 'wix' = 'html',
  options: EmbedCodeOptions = { format: 'html' }
): string {
  switch (platform) {
    case 'react':
      return generateReactEmbedCode(organizationId, settings, options);
    case 'vue':
      return generateVueEmbedCode(organizationId, settings, options);
    case 'wordpress':
      return generateWordPressEmbedCode(organizationId, settings);
    case 'shopify':
      return generateShopifyEmbedCode(organizationId, settings);
    case 'squarespace':
      return generateSquarespaceEmbedCode(organizationId, settings);
    case 'wix':
      return generateWixEmbedCode(organizationId, settings);
    default:
      return generateHTMLEmbedCode(organizationId, settings, options);
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
}

export function downloadEmbedCode(
  organizationId: string,
  settings: Partial<ChatSettings>,
  platform: string
): void {
  const code = generateEmbedCode(organizationId, settings, platform as any);
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flowstack-chat-${platform}-embed.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateEmbedSettings(settings: Partial<ChatSettings>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!settings.widget_color || !/^#[0-9A-F]{6}$/i.test(settings.widget_color)) {
    errors.push('Widget color must be a valid hex color (e.g., #3B82F6)');
  }

  if (
    !settings.widget_position ||
    !['bottom-right', 'bottom-left'].includes(settings.widget_position)
  ) {
    errors.push('Widget position must be either bottom-right or bottom-left');
  }

  if (settings.file_upload_max_size && settings.file_upload_max_size > 50 * 1024 * 1024) {
    errors.push('Maximum file upload size is 50MB');
  }

  if (settings.rate_limit_max_messages && settings.rate_limit_max_messages > 1000) {
    errors.push('Rate limit maximum messages cannot exceed 1000');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =====================================================
// Widget Configuration Presets
// =====================================================

export const widgetPresets = {
  minimal: {
    widget_color: '#000000',
    widget_position: 'bottom-right' as const,
    header_title: 'Chat',
    show_agent_avatar: false,
    show_agent_name: false,
    show_agent_status: false,
    welcome_message: 'Start a conversation',
    emoji_picker_enabled: false,
    file_upload_enabled: false,
  },

  friendly: {
    widget_color: '#10B981',
    widget_position: 'bottom-right' as const,
    header_title: 'Chat with us!',
    show_agent_avatar: true,
    show_agent_name: true,
    show_agent_status: true,
    welcome_message: 'Hey there! 👋 How can we help you today?',
    emoji_picker_enabled: true,
    file_upload_enabled: true,
    rating_enabled: true,
  },

  professional: {
    widget_color: '#1E40AF',
    widget_position: 'bottom-right' as const,
    header_title: 'Support Chat',
    show_agent_avatar: true,
    show_agent_name: true,
    show_agent_status: false,
    welcome_message: 'Welcome to our support chat. How may we assist you?',
    emoji_picker_enabled: false,
    file_upload_enabled: true,
    collect_email: true,
    pre_chat_form_enabled: true,
  },

  sales: {
    widget_color: '#F59E0B',
    widget_position: 'bottom-left' as const,
    header_title: 'Talk to Sales',
    show_agent_avatar: true,
    show_agent_name: true,
    show_agent_status: true,
    welcome_message: 'Have questions? Our team is here to help!',
    emoji_picker_enabled: true,
    file_upload_enabled: false,
    rating_enabled: true,
    collect_email: true,
  },
};

export function applyPreset(
  preset: keyof typeof widgetPresets,
  currentSettings: Partial<ChatSettings>
): Partial<ChatSettings> {
  return {
    ...currentSettings,
    ...widgetPresets[preset],
  };
}
