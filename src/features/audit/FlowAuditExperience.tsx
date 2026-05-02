import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  FileText,
  Folder,
  GitBranch,
  MessageSquare,
  Monitor,
  Network,
  PhoneCall,
  ShieldCheck,
  Users,
  WalletCards,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ExperienceStepId = 'raw' | 'layer' | 'path';

interface FlowNode {
  label: string;
  detail: string;
  icon: LucideIcon;
  step: ExperienceStepId;
}

const experienceSteps: Array<{ id: ExperienceStepId; label: string; description: string }> = [
  {
    id: 'raw',
    label: 'Raw material',
    description: 'Tools, teams, websites, folders, SQL, agents, calls, content, and business context.',
  },
  {
    id: 'layer',
    label: 'FlowStack layer',
    description: 'A communication map that shows what exists, what depends on what, and where useful handoffs belong.',
  },
  {
    id: 'path',
    label: 'Quote path',
    description: 'A Flow Brief, provider options, no-change calls, owned slices, and a practical implementation scope.',
  },
];

const rawNodes: FlowNode[] = [
  { label: 'Marketing', detail: 'HubSpot, campaigns, content, social', icon: MessageSquare, step: 'raw' },
  { label: 'Website', detail: 'Wix, Webflow, forms, pages', icon: Monitor, step: 'raw' },
  { label: 'Data', detail: 'SQL, CRM records, spreadsheets', icon: Database, step: 'raw' },
  { label: 'Projects', detail: 'Repos, folders, prototypes', icon: Folder, step: 'raw' },
  { label: 'Agents', detail: 'AI, voice, call, coding, support', icon: Bot, step: 'raw' },
  { label: 'Teams', detail: 'Design, dev, sales, operations', icon: Users, step: 'raw' },
];

const layerNodes: FlowNode[] = [
  { label: 'Registry', detail: 'What exists and who owns it', icon: GitBranch, step: 'layer' },
  { label: 'Handoff map', detail: 'How work moves between tools', icon: Workflow, step: 'layer' },
  { label: 'Communication layer', detail: 'The connective logic between lanes', icon: Network, step: 'layer' },
  { label: 'Permission boundary', detail: 'Only what you submit or approve', icon: ShieldCheck, step: 'layer' },
];

const pathNodes: FlowNode[] = [
  { label: 'Flow Brief', detail: 'Plain-language map and findings', icon: FileText, step: 'path' },
  { label: 'Quote', detail: 'A scoped next move, not a vague retainer', icon: WalletCards, step: 'path' },
  { label: 'Provider option', detail: 'Voice, automation, or another fit-based path', icon: PhoneCall, step: 'path' },
  { label: 'Owned slice', detail: 'Build only what should be owned', icon: CheckCircle2, step: 'path' },
];

const flowPrinciples = [
  'We accept the current reality as the input.',
  'We organize it into a flow instead of a pile of tools.',
  'We quote the next practical move after the map exists.',
];

const organizationSignals: FlowNode[] = [
  {
    label: 'Approved work devices',
    detail: 'Company-owned machines and scoped business folders',
    icon: ShieldCheck,
    step: 'layer',
  },
  {
    label: 'Actual tool adoption',
    detail: 'What teams use, not just what the company pays for',
    icon: Users,
    step: 'layer',
  },
  {
    label: 'Empty lanes',
    detail: 'Folders, repos, and tools with little or no useful activity',
    icon: Folder,
    step: 'layer',
  },
  {
    label: 'Spend clarity',
    detail: 'Subscriptions compared against visible business flow',
    icon: WalletCards,
    step: 'path',
  },
];

export const FlowAuditExperience = () => {
  const [activeStep, setActiveStep] = useState<ExperienceStepId>('layer');

  const activeCopy = experienceSteps.find(step => step.id === activeStep) ?? experienceSteps[1];

  return (
    <section className="mb-12 border border-[#1a1c20] bg-[#0a0b0d]">
      <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="border-b border-[#1a1c20] p-6 lg:border-b-0 lg:border-r lg:p-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">
            What the audit does
          </p>
          <h2 className="mb-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            FlowStack makes the current business legible before anything changes.
          </h2>
          <p className="mb-6 text-sm leading-7 text-[#8a8f9a]">
            Bring the raw material: tools, folders, agents, databases, websites, teams, and the places
            work slows down or loses context. FlowStack turns that into a communication layer, then
            shows the next useful move and the value behind it. Sometimes that is a provider path.
            Sometimes it is an owned feature. Sometimes it is simply: keep what you have and connect
            it better.
          </p>

          <div className="mb-6 grid gap-2">
            {experienceSteps.map(step => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  'flex items-center justify-between border px-4 py-3 text-left transition-colors',
                  activeStep === step.id
                    ? 'border-[#d4af37] bg-[#d4af37]/10 text-white'
                    : 'border-[#24272f] text-[#8a8f9a] hover:border-[#d4af37]/40 hover:text-white'
                )}
              >
                <span className="text-sm font-semibold">{step.label}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ))}
          </div>

          <motion.div
            key={activeCopy.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l-2 border-[#d4af37] pl-4"
          >
            <p className="text-sm font-semibold text-white">{activeCopy.label}</p>
            <p className="mt-1 text-sm leading-6 text-[#8a8f9a]">{activeCopy.description}</p>
          </motion.div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="relative min-h-[520px] overflow-hidden border border-[#1a1c20] bg-[#08090a] p-4 md:min-h-[440px] md:p-6">
            <div className="absolute left-1/2 top-0 hidden h-full w-px bg-[#d4af37]/20 md:block" />
            <div className="absolute left-[26%] top-0 hidden h-full w-px bg-[#24272f] md:block" />
            <div className="absolute left-[74%] top-0 hidden h-full w-px bg-[#24272f] md:block" />

            <div className="grid gap-5 md:grid-cols-[1fr_0.86fr_1fr]">
              <FlowColumn
                title="What you have"
                subtitle="The raw operating reality"
                nodes={rawNodes}
                activeStep={activeStep}
                onSelectStep={setActiveStep}
              />
              <div className="flex flex-col justify-center">
                <motion.div
                  animate={{ scale: activeStep === 'layer' ? 1.02 : 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'relative border p-5 text-center',
                    activeStep === 'layer'
                      ? 'border-[#d4af37] bg-[#d4af37]/10'
                      : 'border-[#24272f] bg-[#0d0f12]'
                  )}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-[#d4af37]/30 bg-[#d4af37]/10">
                    <Network className="h-6 w-6 text-[#d4af37]" />
                  </div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37]">
                    FlowStack
                  </p>
                  <h3 className="mb-3 text-xl font-semibold text-white">Communication layer</h3>
                  <p className="text-sm leading-6 text-[#8a8f9a]">
                    Not an OS. Not a forced migration. A clear map of how the business should talk to itself.
                  </p>
                </motion.div>
                <div className="mt-5 grid gap-3">
                  {layerNodes.map(node => (
                    <FlowNodeButton
                      key={node.label}
                      node={node}
                      active={activeStep === node.step}
                      onSelect={() => setActiveStep(node.step)}
                    />
                  ))}
                </div>
              </div>
              <FlowColumn
                title="What you can do"
                subtitle="The quote-ready next path"
                nodes={pathNodes}
                activeStep={activeStep}
                onSelectStep={setActiveStep}
              />
            </div>

            <div className="mt-6 grid gap-3 border-t border-[#1a1c20] pt-5 md:grid-cols-3">
              {flowPrinciples.map((principle, index) => (
                <div key={principle} className="text-xs leading-5 text-[#6b7280]">
                  <span className="font-semibold text-[#c4c7cf]">{index + 1}. </span>
                  {principle}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#1a1c20] p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#d4af37]">
              Future enterprise layer
            </p>
            <h3 className="mb-4 text-2xl font-semibold tracking-tight text-white">
              One flow map can become an organization-wide understanding.
            </h3>
            <p className="text-sm leading-7 text-[#8a8f9a]">
              If FlowStack is approved on company work devices, the same folder-and-tool idea scales
              across the team. You can see where work actually happens, which paid tools are active,
              which lanes sit empty, and where people are solving the same problem in different places.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {organizationSignals.map(signal => {
              const Icon = signal.icon;

              return (
                <div key={signal.label} className="border border-[#24272f] bg-[#08090a] p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center border border-[#d4af37]/30 bg-[#d4af37]/10">
                    <Icon className="h-4 w-4 text-[#d4af37]" />
                  </div>
                  <p className="text-sm font-semibold text-white">{signal.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[#8a8f9a]">{signal.detail}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 border-l-2 border-[#d4af37]/60 pl-4 text-xs leading-6 text-[#8a8f9a]">
          This is not a personal surveillance pitch. The product value is scoped business context:
          approved directories, approved tools, declared systems, and work-device policies that the
          organization controls and explains.
        </div>
      </div>
    </section>
  );
};

const FlowColumn = ({
  title,
  subtitle,
  nodes,
  activeStep,
  onSelectStep,
}: {
  title: string;
  subtitle: string;
  nodes: FlowNode[];
  activeStep: ExperienceStepId;
  onSelectStep: (step: ExperienceStepId) => void;
}) => (
  <div>
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b7280]">{subtitle}</p>
      <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="grid gap-3">
      {nodes.map(node => (
        <FlowNodeButton
          key={node.label}
          node={node}
          active={activeStep === node.step}
          onSelect={() => onSelectStep(node.step)}
        />
      ))}
    </div>
  </div>
);

const FlowNodeButton = ({
  node,
  active,
  onSelect,
}: {
  node: FlowNode;
  active: boolean;
  onSelect: () => void;
}) => {
  const Icon = node.icon;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      animate={{ opacity: active ? 1 : 0.72 }}
      whileHover={{ opacity: 1 }}
      className={cn(
        'flex min-h-20 items-start gap-3 border p-3 text-left transition-colors',
        active ? 'border-[#d4af37]/70 bg-[#d4af37]/10' : 'border-[#24272f] bg-[#0d0f12]'
      )}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-[#24272f] bg-[#08090a]">
        <Icon className="h-4 w-4 text-[#d4af37]" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-white">{node.label}</span>
        <span className="mt-1 block text-xs leading-5 text-[#8a8f9a]">{node.detail}</span>
      </span>
    </motion.button>
  );
};
