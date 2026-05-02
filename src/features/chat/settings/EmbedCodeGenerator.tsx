/**
 * Embed Code Generator Component
 * Generate embed code for the chat widget
 */

import { useState } from 'react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Copy, Download, Check } from 'lucide-react';
import { generateEmbedCode, copyToClipboard, downloadEmbedCode, widgetPresets, applyPreset } from '../lib/widget';
import type { ChatSettings } from '../types';

interface EmbedCodeGeneratorProps {
  organizationId: string;
  settings: Partial<ChatSettings>;
}

export function EmbedCodeGenerator({ organizationId, settings }: EmbedCodeGeneratorProps) {
  const [platform, setPlatform] = useState<'html' | 'react' | 'vue' | 'wordpress' | 'shopify' | 'squarespace' | 'wix'>('html');
  const [minified, setMinified] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedCode = generateEmbedCode(organizationId, settings, platform, { format: 'html', minified });

  const handleCopy = async () => {
    const success = await copyToClipboard(embedCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadEmbedCode(organizationId, settings, platform);
  };

  const handleApplyPreset = (preset: keyof typeof widgetPresets) => {
    // This would update the settings - in real implementation, you'd call onChange
    console.log('Apply preset:', preset);
  };

  return (
    <div className="space-y-6 rounded-lg border bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Embed Widget</h2>
        <p className="text-sm text-gray-600">
          Add the chat widget to your website
        </p>
      </div>

      {/* Platform Selection */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="platform">Platform</label>
          <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
            <SelectTrigger id="platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="html">HTML (Universal)</SelectItem>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="vue">Vue</SelectItem>
              <SelectItem value="wordpress">WordPress</SelectItem>
              <SelectItem value="shopify">Shopify</SelectItem>
              <SelectItem value="squarespace">Squarespace</SelectItem>
              <SelectItem value="wix">Wix</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-md border p-4">
          <div className="space-y-0.5">
            <label htmlFor="minified">Minified Code</label>
            <p className="text-sm text-gray-600">
              Use compressed version
            </p>
          </div>
          <Switch
            id="minified"
            checked={minified}
            onCheckedChange={setMinified}
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <label>Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          <ButtonUntitled
            variant="outline"
            size="sm"
            onClick={() => handleApplyPreset('minimal')}
          >
            Minimal
          </ButtonUntitled>
          <ButtonUntitled
            variant="outline"
            size="sm"
            onClick={() => handleApplyPreset('friendly')}
          >
            Friendly
          </ButtonUntitled>
          <ButtonUntitled
            variant="outline"
            size="sm"
            onClick={() => handleApplyPreset('professional')}
          >
            Professional
          </ButtonUntitled>
          <ButtonUntitled
            variant="outline"
            size="sm"
            onClick={() => handleApplyPreset('sales')}
          >
            Sales
          </ButtonUntitled>
        </div>
      </div>

      {/* Code Preview */}
      <div className="space-y-2">
        <label>Embed Code</label>
        <div className="relative rounded-md border bg-gray-50 p-4">
          <pre className="overflow-x-auto text-sm">
            <code>{embedCode}</code>
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <ButtonUntitled onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </>
          )}
        </ButtonUntitled>
        <ButtonUntitled variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </ButtonUntitled>
      </div>

      {/* Instructions */}
      <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-medium text-blue-900">Installation Instructions</h3>

        {platform === 'html' && (
          <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
            <li>Copy the embed code above</li>
            <li>Paste it into your website HTML, just before the closing &lt;/body&gt; tag</li>
            <li>Save and refresh your page</li>
          </ol>
        )}

        {platform === 'react' && (
          <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
            <li>Install the package: <code>npm install @flowstack/chat-widget</code></li>
            <li>Import and use the component in your app</li>
            <li>See code above for example usage</li>
          </ol>
        )}

        {platform === 'wordpress' && (
          <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
            <li>Go to your WordPress admin dashboard</li>
            <li>Navigate to Appearance &gt; Widgets or use a code injection plugin</li>
            <li>Add a new HTML/widget block and paste the code</li>
            <li>Alternatively, install our FlowStack Chat plugin from the WordPress plugin directory</li>
          </ol>
        )}

        {platform === 'shopify' && (
          <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
            <li>Go to your Shopify admin</li>
            <li>Navigate to Online Store &gt; Themes</li>
            <li>Click "Actions" &gt; "Edit code"</li>
            <li>Open theme.liquid and paste the code before &lt;/body&gt;</li>
          </ol>
        )}

        {(platform === 'squarespace' || platform === 'wix') && (
          <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
            <li>Go to your website settings</li>
            <li>Find the Code Injection or Custom Code section</li>
            <li>Paste the code in the Footer section</li>
            <li>Save and publish your changes</li>
          </ol>
        )}
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <label>Widget Preview</label>
        <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-500">
            Widget preview would appear here based on your settings
          </p>
        </div>
      </div>
    </div>
  );
}
