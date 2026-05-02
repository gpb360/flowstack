import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { DealCard } from './DealCard';
import { Plus, MoreHorizontal } from 'lucide-react';

// Mock Data Types
interface Deal {
  id: string;
  title: string;
  value: number;
  contactName?: string;
}

interface Stage {
  id: string;
  name: string;
  deals: Deal[];
}

// Initial Mock Data
const INITIAL_DATA: Stage[] = [
  {
    id: 'stage-1',
    name: 'Lead In',
    deals: [
        { id: 'd1', title: 'Website Inquiry - Wayne Ent', value: 5000, contactName: 'Bruce Wayne' },
        { id: 'd2', title: 'Consultation Request', value: 1200, contactName: 'Clark Kent' }
    ]
  },
  {
    id: 'stage-2',
    name: 'Contact Made',
    deals: [
         { id: 'd3', title: 'Follow up needed', value: 0, contactName: 'Diana Prince' }
    ]
  },
  {
    id: 'stage-3',
    name: 'Proposal Sent',
    deals: [
         { id: 'd4', title: 'Enterprise Plan - Daily Planet', value: 15000, contactName: 'Perry White' }
    ]
  },
  {
    id: 'stage-4',
    name: 'Closed Won',
    deals: []
  }
];

export const PipelineBoard: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>(INITIAL_DATA);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const findStage = (id: string) => {
      // id could be a stage id or a deal id
      const stage = stages.find(s => s.id === id);
      if (stage) return stage;
      
      return stages.find(s => s.deals.some(d => d.id === id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const stage = findStage(active.id as string);
    const deal = stage?.deals.find(d => d.id === active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the containers
    const activeStage = findStage(activeId as string);
    const overStage = findStage(overId as string);

    if (!activeStage || !overStage || activeStage === overStage) {
      return;
    }

    setStages((prev) => {
      const activeStageIndex = prev.findIndex(s => s.id === activeStage.id);
      const overStageIndex = prev.findIndex(s => s.id === overStage.id);
      
      const newStages = [...prev];
      const activeDeals = [...newStages[activeStageIndex].deals];
      const overDeals = [...newStages[overStageIndex].deals];
      
      const activeDealIndex = activeDeals.findIndex(d => d.id === activeId);
      const movedDeal = activeDeals[activeDealIndex];
      
      // Remove from source
      activeDeals.splice(activeDealIndex, 1);
      // Add to target (simple append for drag over container)
      overDeals.push(movedDeal);

      newStages[activeStageIndex] = { ...newStages[activeStageIndex], deals: activeDeals };
      newStages[overStageIndex] = { ...newStages[overStageIndex], deals: overDeals };
      
      return newStages;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);
    
    // In a real app we'd trigger a React Query mutation here to persist the change
    console.log('Drag ended', active.id, over?.id);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full overflow-x-auto p-6 gap-6 align-start">
        {stages.map((stage) => (
          <div key={stage.id} className="w-80 flex-shrink-0 flex flex-col max-h-full bg-gray-50/50 rounded-lg border border-gray-200/60">
            {/* Column Header */}
            <div className="p-3 flex items-center justify-between border-b border-gray-200/60 bg-gray-100/50 rounded-t-lg">
               <div className="flex items-center gap-2">
                 <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">{stage.name}</h3>
                 <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{stage.deals.length}</span>
               </div>
               <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={16} />
               </button>
            </div>

            {/* Droppable Area */}
            <SortableContext 
                id={stage.id} 
                items={stage.deals.map(d => d.id)}
                strategy={verticalListSortingStrategy}
            >
              <div className="p-2 flex-1 overflow-y-auto space-y-2 min-h-[100px]">
                {stage.deals.map(deal => (
                   <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </SortableContext>

            {/* Footer Action */}
            <button className="m-2 p-2 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 rounded transition-colors">
               <Plus size={16} />
               <span>Add Deal</span>
            </button>
          </div>
        ))}

        {/* Add Stage Button */}
        <button className="w-80 flex-shrink-0 h-[50px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors">
            <Plus size={20} />
            <span className="ml-2 font-medium">Add Stage</span>
        </button>

      </div>

      <DragOverlay>
         {activeDeal ? (
            <div className="transform rotate-3 cursor-grabbing cursor-grab">
               <DealCard deal={activeDeal} />
            </div>
         ) : null}
      </DragOverlay>
    </DndContext>
  );
};
