import { createContext, useContext, useState, useCallback } from "react";

// ─── Display configurations ────────────────────────────────────────────────
export const DISPLAYS = {
  inkplate6: { label: "Inkplate 6", width: 800, height: 600 },
  inkplate10: { label: "Inkplate 10", width: 1200, height: 825 },
  inkplate6plus: { label: "Inkplate 6PLUS", width: 1024, height: 758 },
  inkplate2: { label: "Inkplate 2", width: 212, height: 104 },
};

// ─── Entity type definitions ───────────────────────────────────────────────
export const ENTITY_TYPES = {
  // Shapes
  PIXEL: "Pixel",
  LINE: "Line",
  RECTANGLE: "Rectangle",
  CIRCLE: "Circle",
  TRIANGLE: "Triangle",
  TEXT: "Text",
  BITMAP: "Bitmap",
  // Widgets
  GRAPH: "Graph",
  CLOCK: "Clock",
  DIGITAL_CLOCK: "Digital clock",
};

// Default params per entity type
export const DEFAULT_PARAMS = {
  [ENTITY_TYPES.PIXEL]: { x: 100, y: 100, color: 0 },
  [ENTITY_TYPES.LINE]: {
    x0: 50,
    y0: 50,
    x1: 200,
    y1: 200,
    color: 0,
    thickness: 1,
  },
  [ENTITY_TYPES.RECTANGLE]: {
    x: 100,
    y: 100,
    width: 150,
    height: 100,
    color: 0,
    fill: false,
  },
  [ENTITY_TYPES.CIRCLE]: {
    cx: 400,
    cy: 300,
    radius: 100,
    color: 0,
    fill: false,
  },
  [ENTITY_TYPES.TRIANGLE]: {
    x0: 100,
    y0: 300,
    x1: 200,
    y1: 100,
    x2: 300,
    y2: 300,
    color: 0,
    fill: false,
  },
  [ENTITY_TYPES.TEXT]: {
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    text: "Hello!",
    fontSize: 2,
    color: 0,
  },
  [ENTITY_TYPES.BITMAP]: { x: 0, y: 0, width: 100, height: 100, data: "" },
  [ENTITY_TYPES.GRAPH]: { x: 50, y: 50, width: 200, height: 150, color: 0 },
  [ENTITY_TYPES.CLOCK]: { x: 100, y: 100, radius: 80, color: 0 },
  [ENTITY_TYPES.DIGITAL_CLOCK]: { x: 100, y: 100, fontSize: 3, color: 0 },
};

// ─── Types ─────────────────────────────────────────────────────────────────
export interface Entity {
  id: string;
  name: string;
  type: string;
  params: Record<string, any>;
}

// ─── Context ───────────────────────────────────────────────────────────────
const AppContext = createContext<any>(null);

let entityCounter = 0;
const generateId = (type) => {
  const short = type.replace(/\s/g, "").replace("Digital", "Dig");
  return `${short}${entityCounter++}`;
};

export function AppProvider({ children }) {
  const [selectedDisplay, setSelectedDisplay] = useState("inkplate6");
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [activeTool, setActiveTool] = useState(ENTITY_TYPES.CIRCLE);
  const [toolParams, setToolParams] = useState<Record<string, any>>(
    DEFAULT_PARAMS[ENTITY_TYPES.CIRCLE],
  );
  const [magnetClipping, setMagnetClipping] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────
  const display = DISPLAYS[selectedDisplay];
  const selectedEntity =
    entities.find((e) => e.id === selectedEntityId) ?? null;

  // ── Tool selection ───────────────────────────────────────────────────────
  const selectTool = useCallback((toolType) => {
    setActiveTool(toolType);
    setToolParams(DEFAULT_PARAMS[toolType] ?? {});
    setSelectedEntityId(null);
  }, []);

  const updateToolParam = useCallback((key, value) => {
    setToolParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Entity CRUD ──────────────────────────────────────────────────────────
  const createEntity = useCallback(() => {
    const id = generateId(activeTool);
    const newEntity = { id, name: id, type: activeTool, params: { ...toolParams } };
    setEntities((prev) => [...prev, newEntity]);
    setSelectedEntityId(id);
    return id;
  }, [activeTool, toolParams]);

  const renameEntity = useCallback((id: string, newName: string) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name: newName } : e)),
    );
  }, []);

  const selectEntity = useCallback(
    (id) => {
      setSelectedEntityId(id);
      const entity = entities.find((e) => e.id === id);
      if (entity) setToolParams({ ...entity.params });
    },
    [entities],
  );

  const updateEntity = useCallback((id, newParams) => {
    setEntities((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, params: { ...e.params, ...newParams } } : e,
      ),
    );
  }, []);

  const deleteEntity = useCallback((id) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
    setSelectedEntityId((prev) => (prev === id ? null : prev));
  }, []);

  const moveEntity = useCallback((id, dx, dy) => {
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const p = e.params as any;
        if ("x" in p && "y" in p)
          return { ...e, params: { ...p, x: p.x + dx, y: p.y + dy } };
        if ("cx" in p && "cy" in p)
          return { ...e, params: { ...p, cx: p.cx + dx, cy: p.cy + dy } };
        if (e.type === ENTITY_TYPES.TRIANGLE)
          return { ...e, params: { ...p, x0: p.x0 + dx, y0: p.y0 + dy, x1: p.x1 + dx, y1: p.y1 + dy, x2: p.x2 + dx, y2: p.y2 + dy } };
        if (e.type === ENTITY_TYPES.LINE)
          return { ...e, params: { ...p, x0: p.x0 + dx, y0: p.y0 + dy, x1: p.x1 + dx, y1: p.y1 + dy } };
        return e;
      }),
    );
  }, []);

  // ── Save / Load ──────────────────────────────────────────────────────────
  const saveProject = useCallback(() => {
    const data = JSON.stringify({ selectedDisplay, entities }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inkplate-project.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedDisplay, entities]);

  const loadProject = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.selectedDisplay) setSelectedDisplay(data.selectedDisplay);
          if (data.entities) setEntities(data.entities);
        } catch {
          alert("Invalid project file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // ── Arduino code export ──────────────────────────────────────────────────
  const exportArduino = useCallback(() => {
    const lines = [
      `// Inkplate GUI Designer export`,
      `// Display: ${display.label}`,
      `#include "Inkplate.h"`,
      `Inkplate display(INKPLATE_1BIT);`,
      ``,
      `void setup() {`,
      `  display.begin();`,
      `  display.clearDisplay();`,
      `  display.display();`,
      `}`,
      ``,
      `void loop() {`,
      `  display.clearDisplay();`,
    ];

    entities.forEach((e) => {
      const p = e.params;
      switch (e.type) {
        case ENTITY_TYPES.TEXT:
          lines.push(`  display.setCursor(${p.x}, ${p.y});`);
          lines.push(`  display.setTextSize(${p.fontSize});`);
          lines.push(`  display.print("${p.text}");`);
          break;
        case ENTITY_TYPES.CIRCLE:
          lines.push(
            `  display.draw${p.fill ? "Filled" : ""}Circle(${p.cx}, ${p.cy}, ${p.radius}, ${p.color});`,
          );
          break;
        case ENTITY_TYPES.RECTANGLE:
          lines.push(
            `  display.draw${p.fill ? "Filled" : ""}Rect(${p.x}, ${p.y}, ${p.width}, ${p.height}, ${p.color});`,
          );
          break;
        case ENTITY_TYPES.LINE:
          lines.push(
            `  display.drawLine(${p.x0}, ${p.y0}, ${p.x1}, ${p.y1}, ${p.color});`,
          );
          break;
        case ENTITY_TYPES.PIXEL:
          lines.push(`  display.drawPixel(${p.x}, ${p.y}, ${p.color});`);
          break;
        default:
          lines.push(`  // ${e.id}: ${e.type} (manual implementation needed)`);
      }
    });

    lines.push(`  display.display();`);
    lines.push(`  delay(5000);`);
    lines.push(`}`);

    const code = lines.join("\n");
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inkplate_sketch.ino";
    a.click();
    URL.revokeObjectURL(url);
  }, [entities, display]);

  return (
    <AppContext.Provider
      value={{
        // Display
        selectedDisplay,
        setSelectedDisplay,
        display,
        // Entities
        entities,
        selectedEntityId,
        selectedEntity,
        createEntity,
        selectEntity,
        updateEntity,
        deleteEntity,
        moveEntity,
        renameEntity,
        // Tool
        activeTool,
        selectTool,
        toolParams,
        updateToolParam,
        // Settings
        magnetClipping,
        setMagnetClipping,
        // Actions
        saveProject,
        loadProject,
        exportArduino,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
