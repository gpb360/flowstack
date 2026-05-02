/**
 * Workflow Canvas Component
 * Main visual editor with XyFlow integration
 */

import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode, ActionNode, ConditionNode, DelayNode, ParallelNode, EndNode, AgentNode } from './nodes';
import { NodePalette } from '../components/NodePalette';
import { NodePropertiesPanel } from '../properties/NodePropertiesPanel';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';

// Register all custom node types
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  parallel: ParallelNode,
  end: EndNode,
  agentNode: AgentNode,
};

interface WorkflowCanvasProps {
  workflowId?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onPublish?: (nodes: Node[], edges: Edge[]) => void;
}

const WorkflowCanvasContent = ({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  onPublish,
}: WorkflowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');

      if (!type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Determine node type based on action/trigger type
      let nodeType = 'action';
      if (type.startsWith('crm:') && type.includes('contact')) {
        nodeType = 'trigger';
      } else if (type === 'form:submission' || type === 'schedule:cron' || type === 'webhook:incoming') {
        nodeType = 'trigger';
      } else if (type === 'logic:condition') {
        nodeType = 'condition';
      } else if (type === 'logic:delay') {
        nodeType = 'delay';
      } else if (type === 'logic:parallel') {
        nodeType = 'parallel';
      } else if (type.startsWith('agent:')) {
        nodeType = 'agentNode';
      }

      const newNode: Node = {
        id: `${nodeType}_${Date.now()}`,
        type: nodeType,
        position,
        data: {
          label: label || type,
          actionType: type,
          ...(nodeType === 'trigger' && {
            trigger: {
              id: crypto.randomUUID(),
              type: type as any,
              config: {},
              enabled: true,
            },
          }),
          ...(nodeType === 'action' && {
            actionType: type,
            config: {},
          }),
          ...(nodeType === 'condition' && {
            conditions: {
              operator: 'and',
              conditions: [],
            },
          }),
          ...(nodeType === 'delay' && {
            duration: 1000,
            unit: 'milliseconds',
          }),
          ...(nodeType === 'parallel' && {
            branches: 2,
          }),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(nodes, edges);
  }, [nodes, edges, onSave]);

  const handlePublish = useCallback(() => {
    onPublish?.(nodes, edges);
  }, [nodes, edges, onPublish]);

  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);

  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  }, [reactFlowInstance]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-900">
            {workflowId ? 'Edit Workflow' : 'New Workflow'}
          </h1>
          <BadgeUntitled variant="neutral" size="sm">Draft</BadgeUntitled>
        </div>

        <div className="flex items-center gap-3">
          <ButtonUntitled variant="secondary" size="sm" onClick={handleSave}>
            Save
          </ButtonUntitled>
          <ButtonUntitled variant="primary" size="sm" onClick={handlePublish}>
            Publish
          </ButtonUntitled>
        </div>
      </div>

      {/* Builder Body */}
      <div className="flex-1 flex overflow-hidden">
        <NodePalette />

        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            minZoom={0.1}
            maxZoom={2}
            defaultEdgeOptions={{
              animated: false,
              type: 'smoothstep',
              style: { stroke: '#cbd5e1', strokeWidth: 2 },
            }}
          >
            <Background gap={12} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'trigger':
                    return '#86efac';
                  case 'action':
                    return '#93c5fd';
                  case 'condition':
                    return '#fde047';
                  case 'delay':
                    return '#c4b5fd';
                  case 'parallel':
                    return '#a5b4fc';
                  case 'end':
                    return '#d4d4d4';
                  case 'agentNode':
                    return '#fca5a5';
                  default:
                    return '#e2e8f0';
                }
              }}
              maskColor="rgba(0, 0, 0, 0.05)"
            />

            {/* Custom Controls Panel */}
            <Panel position="top-right" className="flex gap-1">
              <ButtonUntitled variant="ghost" size="sm" isIconOnly onClick={handleZoomIn}>
                <ZoomIn size={16} />
              </ButtonUntitled>
              <ButtonUntitled variant="ghost" size="sm" isIconOnly onClick={handleZoomOut}>
                <ZoomOut size={16} />
              </ButtonUntitled>
              <ButtonUntitled variant="ghost" size="sm" isIconOnly onClick={handleFitView}>
                <Maximize2 size={16} />
              </ButtonUntitled>
            </Panel>
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <NodePropertiesPanel
              node={selectedNode}
              onUpdate={(data) => {
                setNodes((nds) =>
                  nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, ...data } } : n))
                );
              }}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap in provider
export const WorkflowCanvas = (props: WorkflowCanvasProps) => (
  <ReactFlowProvider>
    <WorkflowCanvasContent {...props} />
  </ReactFlowProvider>
);
