import { useRef, useEffect, useLayoutEffect, useCallback, useState } from "react";
import { useApp, ENTITY_TYPES, COLOR_MODES } from "../context/AppContext";

const HANDLE_SIZE = 8; // canvas px

function colorToCSS(color, colorMode) {
  const palette = COLOR_MODES[colorMode] ?? COLOR_MODES["3bit"];
  return palette[Math.max(0, Math.min(color ?? 0, palette.length - 1))].css;
}

// ─── Resize handles ────────────────────────────────────────────────────────
function getHandles(entity) {
  const p = entity.params;
  switch (entity.type) {
    case ENTITY_TYPES.CIRCLE:
      return [
        { id: "r", x: p.cx + p.radius, y: p.cy },
        { id: "l", x: p.cx - p.radius, y: p.cy },
        { id: "t", x: p.cx, y: p.cy - p.radius },
        { id: "b", x: p.cx, y: p.cy + p.radius },
      ];
    case ENTITY_TYPES.RECTANGLE:
    case ENTITY_TYPES.BITMAP:
    case ENTITY_TYPES.GRAPH:
    case ENTITY_TYPES.TEXT:
      return [
        { id: "tl", x: p.x, y: p.y },
        { id: "tr", x: p.x + p.width, y: p.y },
        { id: "bl", x: p.x, y: p.y + p.height },
        { id: "br", x: p.x + p.width, y: p.y + p.height },
        { id: "tm", x: p.x + p.width / 2, y: p.y },
        { id: "bm", x: p.x + p.width / 2, y: p.y + p.height },
        { id: "ml", x: p.x, y: p.y + p.height / 2 },
        { id: "mr", x: p.x + p.width, y: p.y + p.height / 2 },
      ];
    case ENTITY_TYPES.LINE:
      return [
        { id: "p0", x: p.x0, y: p.y0 },
        { id: "p1", x: p.x1, y: p.y1 },
      ];
    case ENTITY_TYPES.TRIANGLE:
      return [
        { id: "v0", x: p.x0, y: p.y0 },
        { id: "v1", x: p.x1, y: p.y1 },
        { id: "v2", x: p.x2, y: p.y2 },
      ];
    case ENTITY_TYPES.CLOCK:
      return [{ id: "r", x: p.x + p.radius, y: p.y }];
    default:
      return [];
  }
}

function applyHandleDrag(entity, handleId, dx, dy) {
  const p = { ...entity.params };
  const ri = (v) => Math.round(v);

  switch (entity.type) {
    case ENTITY_TYPES.CIRCLE:
      if (handleId === "r") p.radius = Math.max(1, ri(p.radius + dx));
      if (handleId === "l") p.radius = Math.max(1, ri(p.radius - dx));
      if (handleId === "b") p.radius = Math.max(1, ri(p.radius + dy));
      if (handleId === "t") p.radius = Math.max(1, ri(p.radius - dy));
      return p;

    case ENTITY_TYPES.RECTANGLE:
    case ENTITY_TYPES.BITMAP:
    case ENTITY_TYPES.GRAPH:
    case ENTITY_TYPES.TEXT:
      if (handleId.includes("l")) {
        p.width = Math.max(1, ri(p.width - dx));
        p.x = ri(p.x + dx);
      }
      if (handleId.includes("r")) {
        p.width = Math.max(1, ri(p.width + dx));
      }
      if (handleId.includes("t")) {
        p.height = Math.max(1, ri(p.height - dy));
        p.y = ri(p.y + dy);
      }
      if (handleId.includes("b")) {
        p.height = Math.max(1, ri(p.height + dy));
      }
      return p;

    case ENTITY_TYPES.LINE:
      if (handleId === "p0") {
        p.x0 = ri(p.x0 + dx);
        p.y0 = ri(p.y0 + dy);
      }
      if (handleId === "p1") {
        p.x1 = ri(p.x1 + dx);
        p.y1 = ri(p.y1 + dy);
      }
      return p;

    case ENTITY_TYPES.TRIANGLE: {
      const n = handleId[1]; // "0" | "1" | "2"
      p[`x${n}`] = ri(p[`x${n}`] + dx);
      p[`y${n}`] = ri(p[`y${n}`] + dy);
      return p;
    }

    case ENTITY_TYPES.CLOCK:
      if (handleId === "r") p.radius = Math.max(1, ri(p.radius + dx));
      return p;

    default:
      return p;
  }
}

// ─── Canvas rendering ──────────────────────────────────────────────────────
function renderEntity(ctx, entity, colorMode) {
  const p = entity.params;
  const c = colorToCSS(p.color, colorMode);
  ctx.strokeStyle = c;
  ctx.fillStyle = c;
  ctx.lineWidth = p.thickness ?? 1;

  switch (entity.type) {
    case ENTITY_TYPES.PIXEL:
      ctx.fillRect(p.x, p.y, 2, 2);
      break;
    case ENTITY_TYPES.LINE:
      ctx.beginPath();
      ctx.moveTo(p.x0, p.y0);
      ctx.lineTo(p.x1, p.y1);
      ctx.stroke();
      break;
    case ENTITY_TYPES.RECTANGLE:
      if (p.fill) ctx.fillRect(p.x, p.y, p.width, p.height);
      else ctx.strokeRect(p.x, p.y, p.width, p.height);
      break;
    case ENTITY_TYPES.CIRCLE:
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, p.radius, 0, Math.PI * 2);
      if (p.fill) ctx.fill();
      else ctx.stroke();
      break;
    case ENTITY_TYPES.TRIANGLE:
      ctx.beginPath();
      ctx.moveTo(p.x0, p.y0);
      ctx.lineTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.closePath();
      if (p.fill) ctx.fill();
      else ctx.stroke();
      break;
    case ENTITY_TYPES.TEXT: {
      const size = (p.fontSize ?? 2) * 8;
      const boxW = p.width ?? 200;
      const boxH = p.height ?? 60;
      ctx.font = `${size}px "Courier New", monospace`;
      const words = (p.text ?? "").split(" ");
      const lines = [];
      let cur = words[0] ?? "";
      for (let i = 1; i < words.length; i++) {
        const test = cur + " " + words[i];
        if (ctx.measureText(test).width <= boxW) cur = test;
        else { lines.push(cur); cur = words[i]; }
      }
      if (cur) lines.push(cur);
      ctx.save();
      ctx.beginPath();
      ctx.rect(p.x, p.y, boxW, boxH);
      ctx.clip();
      lines.forEach((line, i) => ctx.fillText(line, p.x, p.y + size + i * size));
      ctx.restore();
      break;
    }
    case ENTITY_TYPES.GRAPH:
      ctx.strokeStyle = "#555";
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(p.x, p.y, p.width, p.height);
      ctx.setLineDash([]);
      ctx.font = "10px monospace";
      ctx.fillStyle = "#888";
      ctx.fillText("Graph", p.x + 4, p.y + 14);
      break;
    case ENTITY_TYPES.CLOCK: {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.stroke();
      const now = new Date();
      const hAng = ((now.getHours() % 12) / 12) * Math.PI * 2 - Math.PI / 2;
      const mAng = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(hAng) * p.radius * 0.5, p.y + Math.sin(hAng) * p.radius * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(mAng) * p.radius * 0.7, p.y + Math.sin(mAng) * p.radius * 0.7);
      ctx.stroke();
      break;
    }
    case ENTITY_TYPES.DIGITAL_CLOCK: {
      const size = (p.fontSize ?? 3) * 8;
      ctx.font = `${size}px "Courier New", monospace`;
      ctx.fillText(new Date().toLocaleTimeString(), p.x, p.y + size);
      break;
    }
    default:
      break;
  }
}

function renderSelectionAndHandles(ctx, entity) {
  const p = entity.params;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = "#6d28d9";

  // Bounding box
  let bx, by, bw, bh;
  switch (entity.type) {
    case ENTITY_TYPES.CIRCLE:
      bx = p.cx - p.radius - 6;
      by = p.cy - p.radius - 6;
      bw = p.radius * 2 + 12;
      bh = p.radius * 2 + 12;
      break;
    case ENTITY_TYPES.PIXEL:
      bx = p.x - 4;
      by = p.y - 4;
      bw = 10;
      bh = 10;
      break;
    case ENTITY_TYPES.LINE:
      bx = Math.min(p.x0, p.x1) - 4;
      by = Math.min(p.y0, p.y1) - 4;
      bw = Math.abs(p.x1 - p.x0) + 8;
      bh = Math.abs(p.y1 - p.y0) + 8;
      break;
    case ENTITY_TYPES.TRIANGLE:
      bx = Math.min(p.x0, p.x1, p.x2) - 6;
      by = Math.min(p.y0, p.y1, p.y2) - 6;
      bw = Math.max(p.x0, p.x1, p.x2) - bx + 6;
      bh = Math.max(p.y0, p.y1, p.y2) - by + 6;
      break;
    default:
      bx = (p.x ?? p.cx ?? 0) - 6;
      by = (p.y ?? p.cy ?? 0) - 6;
      bw = (p.width ?? (p.radius ? p.radius * 2 : 80)) + 12;
      bh = (p.height ?? (p.radius ? p.radius * 2 : 40)) + 12;
  }
  ctx.strokeRect(bx, by, bw, bh);
  ctx.setLineDash([]);

  // Handles
  const half = HANDLE_SIZE / 2;
  getHandles(entity).forEach((h) => {
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#6d28d9";
    ctx.lineWidth = 1.5;
    ctx.fillRect(h.x - half, h.y - half, HANDLE_SIZE, HANDLE_SIZE);
    ctx.strokeRect(h.x - half, h.y - half, HANDLE_SIZE, HANDLE_SIZE);
  });
}

// ─── Hit testing ──────────────────────────────────────────────────────────
function triSign(ax, ay, bx, by, cx, cy) {
  return (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
}
function pointInTriangle(px, py, x0, y0, x1, y1, x2, y2) {
  const d1 = triSign(px, py, x0, y0, x1, y1);
  const d2 = triSign(px, py, x1, y1, x2, y2);
  const d3 = triSign(px, py, x2, y2, x0, y0);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

function hitTest(entity, mx, my) {
  const p = entity.params;
  const pad = 6;
  switch (entity.type) {
    case ENTITY_TYPES.CIRCLE:
      return Math.hypot(mx - p.cx, my - p.cy) <= p.radius + pad;
    case ENTITY_TYPES.LINE: {
      const dx = p.x1 - p.x0,
        dy = p.y1 - p.y0;
      const len2 = dx * dx + dy * dy;
      if (len2 === 0) return Math.hypot(mx - p.x0, my - p.y0) <= pad;
      const t = Math.max(
        0,
        Math.min(1, ((mx - p.x0) * dx + (my - p.y0) * dy) / len2),
      );
      return Math.hypot(mx - (p.x0 + t * dx), my - (p.y0 + t * dy)) <= pad;
    }
    case ENTITY_TYPES.TRIANGLE:
      // exact test + fallback to padded bbox for edge clicks
      return (
        pointInTriangle(mx, my, p.x0, p.y0, p.x1, p.y1, p.x2, p.y2) ||
        (mx >= Math.min(p.x0, p.x1, p.x2) - pad &&
          mx <= Math.max(p.x0, p.x1, p.x2) + pad &&
          my >= Math.min(p.y0, p.y1, p.y2) - pad &&
          my <= Math.max(p.y0, p.y1, p.y2) + pad)
      );
    case ENTITY_TYPES.PIXEL:
      return Math.hypot(mx - p.x, my - p.y) <= pad + 2;
    default: {
      const ex = p.x ?? p.cx ?? 0;
      const ey = p.y ?? p.cy ?? 0;
      const ew = p.width ?? (p.radius ? p.radius * 2 : 60);
      const eh = p.height ?? (p.radius ? p.radius * 2 : 30);
      return (
        mx >= ex - pad &&
        mx <= ex + ew + pad &&
        my >= ey - pad &&
        my <= ey + eh + pad
      );
    }
  }
}

function hitHandle(handle, mx, my) {
  const half = HANDLE_SIZE / 2 + 3;
  return Math.abs(mx - handle.x) <= half && Math.abs(my - handle.y) <= half;
}

// ─── Component ─────────────────────────────────────────────────────────────
const HANDLE_CURSORS = {
  tl: "nwse-resize",
  br: "nwse-resize",
  tr: "nesw-resize",
  bl: "nesw-resize",
  tm: "ns-resize",
  bm: "ns-resize",
  ml: "ew-resize",
  mr: "ew-resize",
  r: "ew-resize",
  l: "ew-resize",
  t: "ns-resize",
  b: "ns-resize",
  p0: "move",
  p1: "move",
  v0: "move",
  v1: "move",
  v2: "move",
};

export default function Canvas() {
  const canvasRef = useRef(null);
  // { mode:"move"|"resize", id, handleId?, lastX, lastY, accumX, accumY }
  const dragRef = useRef(null);
  const {
    display,
    entities,
    selectedEntityId,
    selectEntity,
    moveEntity,
    updateEntity,
    grid,
  } = useApp();

  const FRAME_PAD = 48; // 24px padding each side of device frame
  const PANEL_W = 400;
  const NAVBAR_H = 80;
  const V_MARGIN = 48; // breathing room top/bottom

  const [viewport, setViewport] = useState({
    w: window.innerWidth - PANEL_W - FRAME_PAD,
    h: window.innerHeight - NAVBAR_H - FRAME_PAD - V_MARGIN,
  });

  useEffect(() => {
    const onResize = () => setViewport({
      w: window.innerWidth - PANEL_W - FRAME_PAD,
      h: window.innerHeight - NAVBAR_H - FRAME_PAD - V_MARGIN,
    });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const cw = display.width;
  const ch = display.height;
  const scale = Math.min(viewport.w / cw, viewport.h / ch);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f0efeb";
    ctx.fillRect(0, 0, cw, ch);
    if (grid.enabled) {
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let gx = 0; gx <= cw; gx += grid.size) { ctx.moveTo(gx, 0); ctx.lineTo(gx, ch); }
      for (let gy = 0; gy <= ch; gy += grid.size) { ctx.moveTo(0, gy); ctx.lineTo(cw, gy); }
      ctx.stroke();
    }
    const colorMode = display.colorMode ?? "3bit";
    entities.forEach((entity) => {
      renderEntity(ctx, entity, colorMode);
      if (entity.id === selectedEntityId)
        renderSelectionAndHandles(ctx, entity);
    });
  }, [entities, selectedEntityId, cw, ch, grid, display]);

  useLayoutEffect(() => {
    draw();
  }, [draw]);

  // ── Pointer helpers ────────────────────────────────────────────────────────
  const toCanvas = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const handlePointerDown = (e) => {
    const { x, y } = toCanvas(e);

    // 1. Handles of selected entity take priority
    if (selectedEntityId) {
      const sel = entities.find((en) => en.id === selectedEntityId);
      if (sel) {
        for (const h of getHandles(sel)) {
          if (hitHandle(h, x, y)) {
            dragRef.current = {
              mode: "resize",
              id: sel.id,
              handleId: h.id,
              lastX: x,
              lastY: y,
              startX: x,
              startY: y,
              startHandleX: h.x,
              startHandleY: h.y,
              appliedDx: 0,
              appliedDy: 0,
              accumX: 0,
              accumY: 0,
            };
            canvasRef.current.setPointerCapture(e.pointerId);
            return;
          }
        }
      }
    }

    // 2. Entity body
    for (let i = entities.length - 1; i >= 0; i--) {
      if (hitTest(entities[i], x, y)) {
        selectEntity(entities[i].id);
        const ep = entities[i].params;
        dragRef.current = {
          mode: "move",
          id: entities[i].id,
          lastX: x,
          lastY: y,
          startX: x,
          startY: y,
          accumX: 0,
          accumY: 0,
          anchorX: ep.x ?? ep.cx ?? ep.x0 ?? 0,
          anchorY: ep.y ?? ep.cy ?? ep.y0 ?? 0,
        };
        canvasRef.current.setPointerCapture(e.pointerId);
        return;
      }
    }

    selectEntity(null);
  };

  const handlePointerMove = (e) => {
    const { x, y } = toCanvas(e);
    const dr = dragRef.current;

    // Update cursor even when not dragging
    if (!dr) {
      if (selectedEntityId) {
        const sel = entities.find((en) => en.id === selectedEntityId);
        if (sel) {
          for (const h of getHandles(sel)) {
            if (hitHandle(h, x, y)) {
              canvasRef.current.style.cursor =
                HANDLE_CURSORS[h.id] ?? "crosshair";
              return;
            }
          }
        }
      }
      canvasRef.current.style.cursor = "crosshair";
      return;
    }

    // Sub-pixel accumulator → integer deltas
    dr.accumX += x - dr.lastX;
    dr.accumY += y - dr.lastY;
    dr.lastX = x;
    dr.lastY = y;

    const dx = Math.round(dr.accumX);
    const dy = Math.round(dr.accumY);
    if (dx === 0 && dy === 0) return;
    dr.accumX -= dx;
    dr.accumY -= dy;

    if (dr.mode === "move") {
      if (grid.enabled) {
        const snap = grid.size;
        const totalDx = x - dr.startX;
        const totalDy = y - dr.startY;
        const snappedX = Math.round((dr.anchorX + totalDx) / snap) * snap;
        const snappedY = Math.round((dr.anchorY + totalDy) / snap) * snap;
        const entity = entities.find((en) => en.id === dr.id);
        if (!entity) return;
        const ep = entity.params;
        const curX = ep.x ?? ep.cx ?? ep.x0 ?? 0;
        const curY = ep.y ?? ep.cy ?? ep.y0 ?? 0;
        const sdx = snappedX - curX;
        const sdy = snappedY - curY;
        if (sdx !== 0 || sdy !== 0) moveEntity(dr.id, sdx, sdy);
      } else {
        moveEntity(dr.id, dx, dy);
      }
    } else {
      const entity = entities.find((en) => en.id === dr.id);
      if (!entity) return;
      if (grid.enabled) {
        const snap = grid.size;
        const snappedDx = Math.round((dr.startHandleX + x - dr.startX) / snap) * snap - dr.startHandleX;
        const snappedDy = Math.round((dr.startHandleY + y - dr.startY) / snap) * snap - dr.startHandleY;
        const ddx = snappedDx - dr.appliedDx;
        const ddy = snappedDy - dr.appliedDy;
        if (ddx !== 0 || ddy !== 0) {
          dr.appliedDx = snappedDx;
          dr.appliedDy = snappedDy;
          updateEntity(dr.id, applyHandleDrag(entity, dr.handleId, ddx, ddy));
        }
      } else {
        updateEntity(dr.id, applyHandleDrag(entity, dr.handleId, dx, dy));
      }
    }
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="flex-1 bg-gray-400 flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center gap-2">
        <div
          className="relative shadow-2xl"
          style={{
            padding: "24px",
            background: "linear-gradient(145deg, #888, #666)",
            borderRadius: "8px",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)",
          }}
        >
          <canvas
            ref={canvasRef}
            width={cw}
            height={ch}
            style={{
              display: "block",
              width: cw * scale,
              height: ch * scale,
              imageRendering: "pixelated",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>
        <div className="text-xs font-mono text-gray-200 select-none">
          {display.width} × {display.height} px &nbsp;·&nbsp; {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
}
