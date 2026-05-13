import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

// ─── Color modes ───────────────────────────────────────────────────────────
export const COLOR_MODES: Record<string, { label: string; css: string }[]> = {
  "1bit": [
    { label: "Black", css: "#000000" },
    { label: "White", css: "#ffffff" },
  ],
  "3bit": Array.from({ length: 8 }, (_, i) => ({
    label: i === 0 ? "Black" : i === 7 ? "White" : `Gray ${i}`,
    css: `rgb(${Math.round((i / 7) * 255)},${Math.round((i / 7) * 255)},${Math.round((i / 7) * 255)})`,
  })),
  "bwr": [
    { label: "Black", css: "#000000" },
    { label: "White", css: "#ffffff" },
    { label: "Red",   css: "#cc0000" },
  ],
  "7color": [
    { label: "Black",  css: "#000000" },
    { label: "White",  css: "#ffffff" },
    { label: "Green",  css: "#007800" },
    { label: "Blue",   css: "#0000c8" },
    { label: "Red",    css: "#c80000" },
    { label: "Yellow", css: "#f0e000" },
    { label: "Orange", css: "#c87800" },
  ],
  "6color": [
    { label: "Black",  css: "#000000" },
    { label: "White",  css: "#ffffff" },
    { label: "Yellow", css: "#f0e000" },
    { label: "Red",    css: "#c80000" },
    { label: "Blue",   css: "#0000c8" },
    { label: "Green",  css: "#007800" },
  ],
};

// ─── Display configurations ────────────────────────────────────────────────
export const DISPLAYS = {
  inkplate2:         { label: "Inkplate 2",        width: 212,  height: 104,  colorMode: "bwr"    },
  inkplate4:         { label: "Inkplate 4",        width: 400,  height: 300,  colorMode: "bwr"    },
  inkplate4tempera:  { label: "Inkplate 4TEMPERA", width: 600,  height: 600,  colorMode: "3bit"   },
  inkplate5:         { label: "Inkplate 5",        width: 960,  height: 540,  colorMode: "3bit"   },
  inkplate5v2:       { label: "Inkplate 5V2",      width: 1280, height: 720,  colorMode: "3bit"   },
  inkplate6:         { label: "Inkplate 6",        width: 800,  height: 600,  colorMode: "3bit"   },
  inkplate6color:    { label: "Inkplate 6COLOR",   width: 600,  height: 448,  colorMode: "7color" },
  inkplate6flick:    { label: "Inkplate 6FLICK",   width: 1024, height: 758,  colorMode: "3bit"   },
  inkplate6motion:   { label: "Inkplate 6MOTION",  width: 1024, height: 758,  colorMode: "3bit"   },
  inkplate6plus:     { label: "Inkplate 6PLUS",    width: 1024, height: 758,  colorMode: "3bit"   },
  inkplate7:         { label: "Inkplate 7",        width: 640,  height: 384,  colorMode: "bwr"    },
  inkplate10:        { label: "Inkplate 10",       width: 1200, height: 825,  colorMode: "3bit"   },
  inkplate13spectra: { label: "Inkplate 13SPECTRA",width: 1600, height: 1200, colorMode: "6color" },
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

// ─── Centering helper ──────────────────────────────────────────────────────
function centerParams(type: string, params: Record<string, any>, display: { width: number; height: number }): Record<string, any> {
  const cx = Math.round(display.width / 2);
  const cy = Math.round(display.height / 2);
  const p = { ...params };
  switch (type) {
    case ENTITY_TYPES.PIXEL:
      return { ...p, x: cx, y: cy };
    case ENTITY_TYPES.LINE: {
      const hdx = Math.round((p.x1 - p.x0) / 2);
      const hdy = Math.round((p.y1 - p.y0) / 2);
      return { ...p, x0: cx - hdx, y0: cy - hdy, x1: cx + hdx, y1: cy + hdy };
    }
    case ENTITY_TYPES.RECTANGLE:
    case ENTITY_TYPES.BITMAP:
    case ENTITY_TYPES.GRAPH:
    case ENTITY_TYPES.TEXT:
      return { ...p, x: Math.round(cx - p.width / 2), y: Math.round(cy - p.height / 2) };
    case ENTITY_TYPES.CIRCLE:
    case ENTITY_TYPES.CLOCK:
      return { ...p, cx, cy };
    case ENTITY_TYPES.TRIANGLE: {
      const tcx = Math.round((p.x0 + p.x1 + p.x2) / 3);
      const tcy = Math.round((p.y0 + p.y1 + p.y2) / 3);
      return { ...p, x0: p.x0 + cx - tcx, y0: p.y0 + cy - tcy, x1: p.x1 + cx - tcx, y1: p.y1 + cy - tcy, x2: p.x2 + cx - tcx, y2: p.y2 + cy - tcy };
    }
    case ENTITY_TYPES.DIGITAL_CLOCK:
      return { ...p, x: cx, y: cy };
    default:
      return p;
  }
}

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
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState(ENTITY_TYPES.CIRCLE);
  const [toolParams, setToolParams] = useState<Record<string, any>>(
    DEFAULT_PARAMS[ENTITY_TYPES.CIRCLE],
  );
  const [grid, setGrid] = useState({ enabled: false, size: 10 });

  const entitiesRef = useRef(entities);
  entitiesRef.current = entities;
  const selectedEntityIdRef = useRef(selectedEntityId);
  selectedEntityIdRef.current = selectedEntityId;
  const deleteEntityRef = useRef<(id: string) => void>(() => {});

  // ── History ──────────────────────────────────────────────────────────────
  const historyRef = useRef<{ past: Entity[][], future: Entity[][] }>({ past: [], future: [] });
  const [historyVersion, setHistoryVersion] = useState(0);

  const pushHistory = useCallback(() => {
    historyRef.current.past.push([...entitiesRef.current]);
    historyRef.current.future = [];
    if (historyRef.current.past.length > 100) historyRef.current.past.shift();
    setHistoryVersion((v) => v + 1);
  }, []);

  const undo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (past.length === 0) return;
    future.unshift([...entitiesRef.current]);
    setEntities(past.pop()!);
    setHistoryVersion((v) => v + 1);
  }, []);

  const redo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (future.length === 0) return;
    past.push([...entitiesRef.current]);
    setEntities(future.shift()!);
    setHistoryVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;

      const mod = e.metaKey || e.ctrlKey;
      if (mod) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
        if ((e.key === "z" && e.shiftKey) || e.key === "y") { e.preventDefault(); redo(); }
        return;
      }

      if (!isEditing && (e.key === "Backspace" || e.key === "Delete")) {
        const id = selectedEntityIdRef.current;
        if (id) { e.preventDefault(); deleteEntityRef.current(id); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  void historyVersion;
  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  // ── Derived ──────────────────────────────────────────────────────────────
  const display = DISPLAYS[selectedDisplay as keyof typeof DISPLAYS];
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
    pushHistory();
    const id = generateId(activeTool);
    const centered = centerParams(activeTool, toolParams, display);
    const newEntity = { id, name: id, type: activeTool, params: centered };
    setEntities((prev) => [...prev, newEntity]);
    setSelectedEntityId(id);
    return id;
  }, [activeTool, toolParams, display, pushHistory]);

  const renameEntity = useCallback((id: string, newName: string) => {
    pushHistory();
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name: newName } : e)),
    );
  }, [pushHistory]);

  const selectEntity = useCallback((id: string | null) => {
    setSelectedEntityId(id);
    const entity = entitiesRef.current.find((e) => e.id === id);
    if (entity) setToolParams({ ...entity.params });
  }, []);

  const updateEntity = useCallback((id, newParams) => {
    setEntities((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, params: { ...e.params, ...newParams } } : e,
      ),
    );
  }, []);

  const reorderEntities = useCallback((fromId: string, toId: string) => {
    pushHistory();
    setEntities((prev) => {
      const fromIndex = prev.findIndex((e) => e.id === fromId);
      const toIndex = prev.findIndex((e) => e.id === toId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      const insertAt = next.findIndex((e) => e.id === toId);
      next.splice(fromIndex < toIndex ? insertAt + 1 : insertAt, 0, item);
      return next;
    });
  }, [pushHistory]);

  const deleteEntity = useCallback((id) => {
    pushHistory();
    setEntities((prev) => prev.filter((e) => e.id !== id));
    setSelectedEntityId((prev) => (prev === id ? null : prev));
  }, [pushHistory]);
  deleteEntityRef.current = deleteEntity;

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
          if (data.entities) {
            pushHistory();
            setEntities(data.entities);
          }
        } catch {
          alert("Invalid project file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [pushHistory]);

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
        reorderEntities,
        moveEntity,
        renameEntity,
        // Tool
        activeTool,
        selectTool,
        toolParams,
        updateToolParam,
        // Settings
        grid,
        setGrid,
        // History
        pushHistory,
        undo,
        redo,
        canUndo,
        canRedo,
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
