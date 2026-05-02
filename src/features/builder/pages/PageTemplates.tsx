import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { supabase } from '../../../lib/supabase';
import { useBuilderStore } from '../stores/useBuilderStore';
import { useNavigate } from 'react-router-dom';
import type { Block } from '../types';
import { FileText, Megaphone, ShoppingBag, Package, Clock } from 'lucide-react';

// ============================================================================
// PAGE TEMPLATES - Pre-built page templates
// ============================================================================

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'basic' | 'marketing' | 'ecommerce';
  blocks: Block[];
}

interface Page {
  id: string;
  siteId?: string;
  organizationId?: string;
  title: string;
  path: string;
  content: Block[];
  isHome?: boolean;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const templates: Template[] = [
  {
    id: 'blank',
    name: 'Blank Page',
    description: 'Start from scratch with an empty canvas',
    icon: <FileText size={24} />,
    category: 'basic',
    blocks: [],
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'High-converting landing page with hero, features, and CTA',
    icon: <Megaphone size={24} />,
    category: 'marketing',
    blocks: [
      {
        id: 'hero-section',
        type: 'section',
        category: 'layout',
        parent: null,
        props: { fullWidth: true },
        styles: {
          desktop: {
            padding: '80px 20px',
            backgroundColor: '#f8fafc',
            textAlign: 'center',
          },
        },
        children: [],
      },
      {
        id: 'hero-heading',
        type: 'heading',
        category: 'content',
        parent: 'hero-section',
        props: { level: 1, content: 'Welcome to Our Amazing Product' },
        styles: {
          desktop: {
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '20px',
          },
        },
        children: [],
      },
      {
        id: 'hero-text',
        type: 'text',
        category: 'content',
        parent: 'hero-section',
        props: {
          content: 'Build something incredible with our platform. Start your free trial today.',
        },
        styles: {
          desktop: {
            fontSize: '18px',
            color: '#64748b',
            marginBottom: '30px',
          },
        },
        children: [],
      },
    ],
  },
  {
    id: 'blog',
    name: 'Blog Post',
    description: 'Clean blog post layout with article structure',
    icon: <FileText size={24} />,
    category: 'basic',
    blocks: [
      {
        id: 'blog-container',
        type: 'container',
        category: 'layout',
        parent: null,
        props: { maxWidth: 'lg', centerContent: true },
        styles: {
          desktop: { padding: '60px 20px' },
        },
        children: [],
      },
      {
        id: 'blog-title',
        type: 'heading',
        category: 'content',
        parent: 'blog-container',
        props: { level: 1, content: 'Your Blog Post Title' },
        styles: {
          desktop: {
            fontSize: '42px',
            fontWeight: 'bold',
            marginBottom: '20px',
          },
        },
        children: [],
      },
      {
        id: 'blog-meta',
        type: 'text',
        category: 'content',
        parent: 'blog-container',
        props: { content: 'Published on January 26, 2026' },
        styles: {
          desktop: { color: '#94a3b8', marginBottom: '40px' },
        },
        children: [],
      },
    ],
  },
  {
    id: 'product',
    name: 'Product Page',
    description: 'E-commerce product page with pricing and buy button',
    icon: <ShoppingBag size={24} />,
    category: 'ecommerce',
    blocks: [
      {
        id: 'product-container',
        type: 'container',
        category: 'layout',
        parent: null,
        props: { maxWidth: 'lg', centerContent: true },
        styles: {
          desktop: { padding: '60px 20px' },
        },
        children: [],
      },
      {
        id: 'product-title',
        type: 'heading',
        category: 'content',
        parent: 'product-container',
        props: { level: 1, content: 'Amazing Product' },
        styles: {
          desktop: {
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '20px',
          },
        },
        children: [],
      },
      {
        id: 'product-price',
        type: 'heading',
        category: 'content',
        parent: 'product-container',
        props: { level: 2, content: '$99.00' },
        styles: {
          desktop: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#10b981',
            marginBottom: '20px',
          },
        },
        children: [],
      },
      {
        id: 'product-description',
        type: 'text',
        category: 'content',
        parent: 'product-container',
        props: {
          content: 'This is an amazing product that will solve all your problems.',
        },
        styles: {
          desktop: { fontSize: '16px', marginBottom: '30px' },
        },
        children: [],
      },
    ],
  },
  {
    id: 'thank-you',
    name: 'Thank You Page',
    description: 'Post-purchase thank you page with next steps',
    icon: <Package size={24} />,
    category: 'marketing',
    blocks: [
      {
        id: 'ty-section',
        type: 'section',
        category: 'layout',
        parent: null,
        props: { fullWidth: true },
        styles: {
          desktop: {
            padding: '100px 20px',
            backgroundColor: '#f0fdf4',
            textAlign: 'center',
          },
        },
        children: [],
      },
      {
        id: 'ty-heading',
        type: 'heading',
        category: 'content',
        parent: 'ty-section',
        props: { level: 1, content: 'Thank You for Your Purchase!' },
        styles: {
          desktop: {
            fontSize: '42px',
            fontWeight: 'bold',
            marginBottom: '20px',
          },
        },
        children: [],
      },
      {
        id: 'ty-text',
        type: 'text',
        category: 'content',
        parent: 'ty-section',
        props: {
          content: 'We have received your order and will send you a confirmation email shortly.',
        },
        styles: {
          desktop: {
            fontSize: '18px',
            color: '#64748b',
            marginBottom: '30px',
          },
        },
        children: [],
      },
    ],
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    description: 'Countdown teaser page for upcoming launches',
    icon: <Clock size={24} />,
    category: 'marketing',
    blocks: [
      {
        id: 'cs-section',
        type: 'section',
        category: 'layout',
        parent: null,
        props: { fullWidth: true },
        styles: {
          desktop: {
            minHeight: '100vh',
            padding: '80px 20px',
            backgroundColor: '#1e293b',
            color: '#ffffff',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          },
        },
        children: [],
      },
      {
        id: 'cs-heading',
        type: 'heading',
        category: 'content',
        parent: 'cs-section',
        props: { level: 1, content: 'Coming Soon' },
        styles: {
          desktop: {
            fontSize: '64px',
            fontWeight: 'bold',
            marginBottom: '20px',
          },
        },
        children: [],
      },
      {
        id: 'cs-text',
        type: 'text',
        category: 'content',
        parent: 'cs-section',
        props: {
          content: 'We are working hard to launch something amazing. Stay tuned!',
        },
        styles: {
          desktop: {
            fontSize: '20px',
            color: '#94a3b8',
            marginBottom: '40px',
          },
        },
        children: [],
      },
      {
        id: 'cs-countdown',
        type: 'countdown',
        category: 'advanced',
        parent: 'cs-section',
        props: {
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          format: 'full',
        },
        styles: {
          desktop: {},
        },
        children: [],
      },
    ],
  },
];

interface PageTemplatesProps {
  onComplete?: (pageId: string) => void;
}

export const PageTemplates: React.FC<PageTemplatesProps> = ({ onComplete }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { currentSite } = useBuilderStore();

  // Create page from template mutation
  const createFromTemplateMutation = useMutation({
    mutationFn: async (template: Template) => {
      if (!currentSite?.id) throw new Error('No site selected');

      const path = `/${template.id}-${Date.now()}`;

      const { data, error } = await (supabase.from('pages') as any)
        .insert({
          site_id: currentSite.id,
          organization_id: currentSite.organizationId,
          title: template.name,
          path: path,
          content: template.blocks,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Page;
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      if (onComplete) {
        onComplete(page.id);
      } else {
        navigate(`/builder/pages/${page.id}`);
      }
    },
  });

  const groupedTemplates = {
    basic: templates.filter((t) => t.category === 'basic'),
    marketing: templates.filter((t) => t.category === 'marketing'),
    ecommerce: templates.filter((t) => t.category === 'ecommerce'),
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Choose a Template</h2>
        <p className="text-muted-foreground">
          Start with a pre-built template or create from scratch
        </p>
      </div>

      {/* Basic Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Pages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupedTemplates.basic.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => createFromTemplateMutation.mutate(template)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {template.icon}
                  </div>
                  <Badge variant="secondary">Basic</Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Marketing Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Marketing Pages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupedTemplates.marketing.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => createFromTemplateMutation.mutate(template)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    {template.icon}
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Marketing
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* E-commerce Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">E-commerce Pages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupedTemplates.ecommerce.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => createFromTemplateMutation.mutate(template)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    {template.icon}
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    E-commerce
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
