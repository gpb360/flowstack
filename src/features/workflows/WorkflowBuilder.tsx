import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodePalette } from './components/NodePalette';
import { Bot, Save, Play } from 'lucide-react';

const initialNodes = [
  { id: '1', position: { x: 250, y: 100 }, data: { label: 'Start Trigger' }, type: 'input' },
];

const WorkflowBuilderContent = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
    const onConnect = useCallback(
      (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
      [setEdges],
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
  
        if (typeof type === 'undefined' || !type) {
          return;
        }
  
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
  
        const newNode = {
          id: `${type}_${Date.now()}`, // Unique ID
          type: 'default', // Using default node type for now, will implement custom nodes next
          position,
          data: { label: label, type: type },
          style: { 
             border: '1px solid #e2e8f0', 
             padding: '10px', 
             borderRadius: '8px', 
             background: 'white',
             minWidth: '150px'
          }
        };
  
        setNodes((nds) => nds.concat(newNode));
      },
      [reactFlowInstance, setNodes],
    );

  return (
    <div className="flex flex-col h-screen bg-white">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white z-10">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold text-gray-900 border-none outline-none focus:ring-0">
                    Untitled Workflow
                </h1>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Draft</span>
            </div>
            
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 border border-gray-200">
                    <Bot size={16} />
                    <span>AI Assistant</span>
                </button>
                <div className="h-6 w-px bg-gray-200 mx-1"></div>
                 <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
                    <Save size={16} />
                    <span>Save</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm">
                    <Play size={16} />
                    <span>Publish</span>
                </button>
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
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Controls />
                    <MiniMap />
                    <Background gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    </div>
  );
};

// Wrap in provider
export const WorkflowBuilder = () => (
    <ReactFlowProvider>
        <WorkflowBuilderContent />
    </ReactFlowProvider>
);
