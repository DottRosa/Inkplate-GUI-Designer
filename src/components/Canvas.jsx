import { useRef, useEffect, useCallback } from "react";
import { useApp, ENTITY_TYPES } from "../context/AppContext";

// ─── Canvas rendering ──────────────────────────────────────────────────────
function renderEntity(ctx, entity) {
  const p = entity.params;
  ctx.strokeStyle = p.color === 0 ? "#000" : "#fff";
  ctx.fillStyle = p.color === 0 ? "#000" : "#fff";
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
      ctx.font = `${size}px "Courier New", monospace`;
      ctx.fillStyle = p.color === 0 ? "#000" : "#fff";
      ctx.fillText(p.text ?? "", p.x, p.y + size);
      break;
    }

    case ENTITY_TYPES.GRAPH: {
      // placeholder wireframe
      ctx.strokeStyle = "#555";
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(p.x, p.y, p.width, p.height);
      ctx.setLineDash([]);
      ctx.font = "10px monospace";
      ctx.fillStyle = "#888";
      ctx.fillText("Graph", p.x + 4, p.y + 14);
      break;
    }

    case ENTITY_TYPES.CLOCK: {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.strokeStyle = p.color === 0 ? "#000" : "#fff";
      ctx.stroke();
      // clock hands
      const now = new Date();
      const hAngle = ((now.getHours() % 12) / 12) * Math.PI * 2 - Math.PI / 2;
      const mAngle = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(hAngle) * p.radius * 0.5, p.y + Math.sin(hAngle) * p.radius * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(mAngle) * p.radius * 0.7, p.y + Math.sin(mAngle) * p.radius * 0.7);
      ctx.stroke();
      break;
    }

    case ENTITY_TYPES.DIGITAL_CLOCK: {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();
      const size = (p.fontSize ?? 3) * 8;
      ctx.font = `${size}px "Courier New", monospace`;
      ctx.fillStyle = p.color === 0 ? "#000" : "#fff";
      ctx.fillText(timeStr, p.x, p.y + size);
      break;
    }

    default:
      break;
  }
}

function renderSelectionHandle(ctx, entity) {
  const p = entity.params;
  ctx.strokeStyle = "#6d28d9";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);

  let x, y, w, h;
  switch (entity.type) {
    case ENTITY_TYPES.CIRCLE:
      x = p.cx - p.radius - 6;
      y = p.cy - p.radius - 6;
      w = p.radius * 2 + 12;
      h = p.radius * 2 + 12;
      break;
    case ENTITY_TYPES.PIXEL:
      x = p.x - 4; y = p.y - 4; w = 10; h = 10;
      break;
    case ENTITY_TYPES.LINE:
      x = Math.min(p.x0, p.x1) - 4;
      y = Math.min(p.y0, p.y1) - 4;
      w = Math.abs(p.x1 - p.x0) + 8;
      h = Math.abs(p.y1 - p.y0) + 8;
      break;
    default:
      x = (p.x ?? p.cx ?? 0) - 6;
      y = (p.y ?? p.cy ?? 0) - 6;
      w = (p.width ?? p.radius * 2 ?? 80) + 12;
      h = (p.height ?? p.radius * 2 ?? 40) + 12;
  }

  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
}

// ─── Hit testing ───────────────────────────────────────────────────────────
function hitTest(entity, mx, my) {
  const p = entity.params;
  const pad = 8;
  switch (entity.type) {
    case ENTITY_TYPES.CIRCLE:
      return Math.hypot(mx - p.cx, my - p.cy) <= p.radius + pad;
    case ENTITY_TYPES.LINE:
      // rough AABB
      return (
        mx >= Math.min(p.x0, p.x1) - pad &&
        mx <= Math.max(p.x0, p.x1) + pad &&
        my >= Math.min(p.y0, p.y1) - pad &&
        my <= Math.max(p.y0, p.y1) + pad
      );
    default: {
      const ex = p.x ?? p.cx ?? 0;
      const ey = p.y ?? p.cy ?? 0;
      const ew = p.width ?? (p.radius ? p.radius * 2 : 60);
      const eh = p.height ?? (p.radius ? p.radius * 2 : 30);
      return mx >= ex - pad && mx <= ex + ew + pad && my >= ey - pad && my <= ey + eh + pad;
    }
  }
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function Canvas() {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const { display, entities, selectedEntityId, selectEntity, moveEntity } = useApp();

  // Scale the display to fit inside a max viewport
  const MAX_W = window.innerWidth - 400; // sidebar + panel
  const MAX_H = window.innerHeight - 80;
  const scale = Math.min(MAX_W / display.width, MAX_H / display.height, 1);
  const cw = display.width;
  const ch = display.height;

  // ── Draw ────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Background (e-ink white)
    ctx.fillStyle = "#f0efeb";
    ctx.fillRect(0, 0, cw, ch);

    entities.forEach((entity) => {
      renderEntity(ctx, entity);
      if (entity.id === selectedEntityId) renderSelectionHandle(ctx, entity);
    });
  }, [entities, selectedEntityId, cw, ch]);

  useEffect(() => {
    draw();
  }, [draw]);

  // ── Pointer events ────────────────────────────────────────────────────
  const toCanvasCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const handlePointerDown = (e) => {
    const { x, y } = toCanvasCoords(e);
    // Hit-test in reverse order (top entity first)
    for (let i = entities.length - 1; i >= 0; i--) {
      if (hitTest(entities[i], x, y)) {
        selectEntity(entities[i].id);
        dragRef.current = { id: entities[i].id, startX: x, startY: y };
        canvasRef.current.setPointerCapture(e.pointerId);
        return;
      }
    }
    selectEntity(null);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const { x, y } = toCanvasCoords(e);
    const dx = x - dragRef.current.startX;
    const dy = y - dragRef.current.startY;
    moveEntity(dragRef.current.id, dx, dy);
    dragRef.current.startX = x;
    dragRef.current.startY = y;
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="flex-1 bg-gray-400 flex items-center justify-center overflow-hidden">
      {/* e-ink display frame */}
      <div
        className="relative shadow-2xl"
        style={{
          padding: "24px",
          background: "linear-gradient(145deg, #888, #666)",
          borderRadius: "8px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)",
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
            cursor: "crosshair",
            imageRendering: "pixelated",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>
    </div>
  );
}
