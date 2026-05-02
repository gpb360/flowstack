import React from 'react';
import { type BuilderElement } from '../types';
import { ContainerBlock } from '../blocks/ContainerBlock';
import { TextBlock } from '../blocks/TextBlock';
import { useBuilderStore } from '../stores/useBuilderStore';

interface ElementRendererProps {
  element: BuilderElement;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element }) => {
  const { selectedBlockId, selectBlock } = useBuilderStore();
  const isActive = element.id === selectedBlockId;

  const handleClick = () => {
    selectBlock(element.id);
  };

  const renderChildren = () => {
    return element.children?.map((child) => (
      <ElementRenderer key={child.id} element={child} />
    ));
  };

  switch (element.type) {
    case 'container':
      return (
        <ContainerBlock
            block={element as any}
            isSelected={isActive}
            onClick={handleClick}
        >
          {renderChildren()}
        </ContainerBlock>
      );
    case 'text':
      return (
        <TextBlock
            block={element as any}
            isSelected={isActive}
            onClick={handleClick}
        />
      );
    default:
      return null;
  }
};
