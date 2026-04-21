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

function EntityItem({ entity, selected, onClick, onDelete }) {
  return (
    <div
      className={`flex items-center justify-between group px-1 py-0.5 rounded cursor-pointer text-sm font-mono transition-colors
        ${selected ? "bg-violet-200 text-violet-900 font-semibold" : "text-gray-800 hover:bg-gray-100"}`}
      onClick={onClick}
    >
      <span>{entity.name ?? entity.id}</span>
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
  const { activeTool, selectTool, entities, selectedEntityId, selectEntity, deleteEntity } = useApp();

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
        <SectionHeader>Added entities</SectionHeader>
        {entities.length === 0 && (
          <p className="text-xs text-gray-400 font-mono italic px-1">None yet</p>
        )}
        {entities.map((entity) => (
          <EntityItem
            key={entity.id}
            entity={entity}
            selected={selectedEntityId === entity.id}
            onClick={() => selectEntity(entity.id)}
            onDelete={deleteEntity}
          />
        ))}
      </div>
    </aside>
  );
}
