import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { usePipelines, useMoveDeal } from '../hooks/useDeals';
import { KanbanBoard } from '@/components/ui/kanban-board';
import { DealCard } from './DealCard';
import { DealForm } from './DealForm';
import { Plus, Settings } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { DataCard } from '@/components/ui/data-card';
import { DollarSign } from 'lucide-react';
import type { Database } from '@/types/database.types';

type Deal = Database['public']['Tables']['deals']['Row'] & Record<string, any>;
type Stage = Database['public']['Tables']['stages']['Row'] & Record<string, any>;

interface PipelineBoardProps {
  pipelineId?: string;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ pipelineId }) => {
  const { data: pipelines, isLoading } = usePipelines();
  const moveDeal = useMoveDeal();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  // Get the first pipeline if none specified
  const pipeline = pipelineId
    ? pipelines?.find((p) => p.id === pipelineId)
    : pipelines?.[0];

  // Transform pipeline stages to kanban columns
  const columns = pipeline?.stages.map((stage) => ({
    id: stage.id,
    title: stage.name,
    dealIds: stage.deals?.map((d: any) => d.id) || [],
  })) || [];

  // Create a map of deals for easy lookup
  const dealsMap = new Map<string, Deal & { contacts: any; companies: any }>();
  pipeline?.stages.forEach((stage) => {
    stage.deals?.forEach((deal: any) => {
      dealsMap.set(deal.id, deal);
    });
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = dealsMap.get(active.id as string);
    if (deal) setActiveDeal(deal);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active) return;

    const dealId = active.id as string;
    const toStageId = over.id as string;

    // Don't do anything if dragging over the same stage
    const deal = dealsMap.get(dealId);
    if (deal?.stage_id === toStageId) return;

    // Optimistically update the UI
    // In a real implementation, you'd update the local state
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over || !active) return;

    const dealId = active.id as string;
    const toStageId = over.id as string;

    const deal = dealsMap.get(dealId);
    if (!deal) return;

    // Only move if the stage actually changed
    if (deal.stage_id !== toStageId) {
      try {
        await moveDeal.mutateAsync({
          dealId,
          fromStageId: deal.stage_id,
          toStageId,
        });
      } catch (error) {
        console.error('Failed to move deal:', error);
      }
    }
  };

  // Calculate pipeline metrics
  const totalDeals = pipeline?.stages?.reduce((sum, stage) => sum + (stage.deals?.length || 0), 0) || 0;
  const totalValue = pipeline?.stages?.reduce((sum, stage) => {
    return sum + (stage.deals?.reduce((stageSum: number, deal: any) => stageSum + (deal.value || 0), 0) || 0);
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Loading pipeline...</div>
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">No pipeline found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{pipeline.name}</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm text-text-secondary">
                {totalDeals} deals
              </span>
              <span className="text-sm text-green-600 font-semibold">
                ${totalValue.toLocaleString()} total value
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ButtonUntitled variant="secondary" size="sm" leftIcon={<Settings size={16} />}>
              Settings
            </ButtonUntitled>
            <ButtonUntitled variant="primary" onClick={() => setIsFormOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Add Deal
            </ButtonUntitled>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {pipeline.stages.map((stage) => (
              <div
                key={stage.id}
                className="w-80 flex-shrink-0 flex flex-col bg-gray-50 rounded-lg border border-gray-200"
              >
                {/* Stage Header */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold">{stage.name}</h3>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                    {stage.deals?.length || 0}
                  </span>
                </div>

                {/* Deals List */}
                <div className="p-2 flex-1 overflow-y-auto space-y-2">
                  {stage.deals?.map((deal: any) => (
                    <DealCard key={deal.id} deal={deal} stageId={stage.id} />
                  ))}
                </div>

                {/* Add Deal Button */}
                <button
                  onClick={() => {
                    setSelectedStageId(stage.id);
                    setIsFormOpen(true);
                  }}
                  className="m-2 p-2 flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary hover:bg-gray-200 rounded transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Deal</span>
                </button>
              </div>
            ))}

            {/* Add Stage Button */}
            <button className="w-80 flex-shrink-0 h-[50px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-text-muted hover:border-gray-300 hover:text-text-secondary transition-colors">
              <Plus size={20} />
              <span className="ml-2 font-medium">Add Stage</span>
            </button>
          </div>

          <DragOverlay>
            {activeDeal ? (
              <div className="transform rotate-3 shadow-xl">
                <DealCard deal={activeDeal} stageId={activeDeal.stage_id || ''} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Deal Form */}
      {isFormOpen && (
        <DealForm
          onClose={() => {
            setIsFormOpen(false);
            setSelectedStageId(null);
          }}
          defaultStageId={selectedStageId || undefined}
          defaultPipelineId={pipeline.id}
        />
      )}
    </div>
  );
};
