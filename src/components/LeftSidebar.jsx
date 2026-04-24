import { useState } from "react";
import { useApp, ENTITY_TYPES } from "../context/AppContext";

const SHAPES = [
  ENTITY_TYPES.PIXEL,
  ENTITY_TYPES.LINE,
  ENTITY_TYPES.RECTANGLE,
  ENTITY_TYPES.CIRCLE,
  ENTITY_TYPES.TRIANGLE,
  ENTITY_TYPES.TEXT,
  ENTITY_TYPES.BITMAP,
];

const WIDGETS = [
  ENTITY_TYPES.GRAPH,
  ENTITY_TYPES.CLOCK,
  ENTITY_TYPES.DIGITAL_CLOCK,
];

function SectionHeader({ children }) {
  return (
    <p className="font-bold text-sm font-mono text-gray-900 mt-4 mb-1 first:mt-2">
      {children}
    </p>
  );
}

function ToolItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left text-sm font-mono px-1 py-0.5 rounded transition-colors
        ${active
          ? "bg-violet-200 text-violet-900 font-semibold"
          : "text-gray-800 hover:bg-gray-100"
        }`}
    >
      {label}
    </button>
  );
}

function EntityItem({ entity, selected, onClick, onDelete, onDragStart, onDragOver, onDrop, onDragEnd, dragOver }) {
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(entity.id); }}
      onDragOver={(e) => { e.preventDefault(); onDragOver(entity.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop(entity.id); }}
      onDragEnd={onDragEnd}
      className={`flex items-center justify-between group px-1 py-0.5 rounded cursor-pointer text-sm font-mono transition-colors
        ${selected ? "bg-violet-200 text-violet-900 font-semibold" : "text-gray-800 hover:bg-gray-100"}
        ${dragOver ? "border border-violet-400" : "border border-transparent"}`}
      onClick={onClick}
    >
      <span className="text-gray-400 mr-1 cursor-grab select-none">⠿</span>
      <span className="flex-1 truncate">{entity.name ?? entity.id}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(entity.id); }}
        className="hidden group-hover:block text-red-400 hover:text-red-600 text-xs px-1 leading-none"
        title="Delete"
      >
        ×
      </button>
    </div>
  );
}

export default function LeftSidebar() {
  const { activeTool, selectTool, entities, selectedEntityId, selectEntity, deleteEntity, reorderEntities } = useApp();
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const handleDrop = (toId) => {
    if (dragId && dragId !== toId) reorderEntities(dragId, toId);
    setDragId(null);
    setDragOverId(null);
  };

  const reversed = [...entities].reverse();

  return (
    <aside className="w-48 bg-white border-r border-gray-200 flex flex-col overflow-y-auto shrink-0 py-1 px-2">
      <SectionHeader>Shapes</SectionHeader>
      {SHAPES.map((type) => (
        <ToolItem
          key={type}
          label={type}
          active={activeTool === type}
          onClick={() => selectTool(type)}
        />
      ))}

      <SectionHeader>Widgets</SectionHeader>
      {WIDGETS.map((type) => (
        <ToolItem
          key={type}
          label={type}
          active={activeTool === type}
          onClick={() => selectTool(type)}
        />
      ))}

      <div className="border-t border-gray-200 mt-3 pt-2">
        <SectionHeader>Layers</SectionHeader>
        {reversed.length === 0 && (
          <p className="text-xs text-gray-400 font-mono italic px-1">None yet</p>
        )}
        {reversed.map((entity) => (
          <EntityItem
            key={entity.id}
            entity={entity}
            selected={selectedEntityId === entity.id}
            onClick={() => selectEntity(entity.id)}
            onDelete={deleteEntity}
            onDragStart={setDragId}
            onDragOver={setDragOverId}
            onDrop={handleDrop}
            onDragEnd={() => { setDragId(null); setDragOverId(null); }}
            dragOver={dragOverId === entity.id}
          />
        ))}
      </div>
    </aside>
  );
}
