import { useApp, ENTITY_TYPES, COLOR_MODES } from "../context/AppContext";

// ─── Small reusable form controls ─────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-mono text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function FieldRow({ children }) {
  return <div className="flex gap-2 mb-3">{children}</div>;
}

function FieldCell({ label, children }) {
  return (
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-mono text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, min, max }) {
  return (
    <input
      type="number"
      value={value ?? ""}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-400 bg-white"
    />
  );
}

function TextInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-400 bg-white"
    />
  );
}

function ColorSlider({ value, onChange }) {
  const { display } = useApp();
  const palette = COLOR_MODES[display?.colorMode ?? "3bit"] ?? COLOR_MODES["3bit"];
  const selected = Math.max(0, Math.min(value ?? 0, palette.length - 1));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1 flex-wrap">
        {palette.map((c, i) => (
          <button
            key={i}
            title={c.label}
            onClick={() => onChange(i)}
            style={{
              width: 20,
              height: 20,
              background: c.css,
              border: selected === i ? "2px solid #7c3aed" : "1px solid #999",
              borderRadius: 3,
              cursor: "pointer",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      <span className="text-xs font-mono text-gray-500">{palette[selected]?.label}</span>
    </div>
  );
}

function CheckboxInput({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={value ?? false}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 accent-violet-600"
      />
      <span className="text-sm font-mono text-gray-700">{label}</span>
    </label>
  );
}

// ─── Per-type param forms ─────────────────────────────────────────────────
function PixelForm({ p, set }) {
  return (
    <>
      <FieldRow>
        <FieldCell label="X"><NumberInput value={p.x} onChange={(v) => set("x", v)} /></FieldCell>
        <FieldCell label="Y"><NumberInput value={p.y} onChange={(v) => set("y", v)} /></FieldCell>
      </FieldRow>
      <Field label="Color"><ColorSlider value={p.color} onChange={(v) => set("color", v)} /></Field>
    </>
  );
}

function LineForm({ p, set }) {
  return (
    <>
      <FieldRow>
        <FieldCell label="X0"><NumberInput value={p.x0} onChange={(v) => set("x0", v)} /></FieldCell>
        <FieldCell label="Y0"><NumberInput value={p.y0} onChange={(v) => set("y0", v)} /></FieldCell>
      </FieldRow>
      <FieldRow>
        <FieldCell label="X1"><NumberInput value={p.x1} onChange={(v) => set("x1", v)} /></FieldCell>
        <FieldCell label="Y1"><NumberInput value={p.y1} onChange={(v) => set("y1", v)} /></FieldCell>
      </FieldRow>
      <Field label="Thickness"><NumberInput value={p.thickness} min={1} onChange={(v) => set("thickness", v)} /></Field>
      <Field label="Color"><ColorSlider value={p.color} onChange={(v) => set("color", v)} /></Field>
    </>
  );
}

function RectForm({ p, set }) {
  return (
    <>
      <FieldRow>
        <FieldCell label="X"><NumberInput value={p.x} onChange={(v) => set("x", v)} /></FieldCell>
        <FieldCell label="Y"><NumberInput value={p.y} onChange={(v) => set("y", v)} /></FieldCell>
      </FieldRow>
      <FieldRow>
        <FieldCell label="Width"><NumberInput value={p.width} min={1} onChange={(v) => set("width", v)} /></FieldCell>
        <FieldCell label="Height"><NumberInput value={p.height} min={1} onChange={(v) => set("height", v)} /></FieldCell>
      </FieldRow>
      <Field label="Color"><ColorSlider value={p.color} onChange={(v) => set("color", v)} /></Field>
      <CheckboxInput label="Fill" value={p.fill} onChange={(v) => set("fill", v)} />
    </>
  );
}

function CircleForm({ p, set }) {
  return (
    <>
      <FieldRow>
        <FieldCell label="Cx"><NumberInput value={p.cx} onChange={(v) => set("cx", v)} /></FieldCell>
        <FieldCell label="Cy"><NumberInput value={p.cy} onChange={(v) => set("cy", v)} /></FieldCell>
      </FieldRow>
      <Field label="Radius"><NumberInput value={p.radius} min={1} onChange={(v) => set("radius", v)} /></Field>
      <Field label="Color"><ColorSlider value={p.color} onChange={(v) => set("color", v)} /></Field>
      <CheckboxInput label="Fill" value={p.fill} onChange={(v) => set("fill", v)} />
    </>
  );
}

function TriangleForm({ p, set }) {
  return (
    <>
      <FieldRow>
        <FieldCell label="X0"><NumberInput value={p.x0} onChange={(v) => set("x0", v)} /></FieldCell>
        <FieldCell label="Y0"><NumberInput value={p.y0} onChange={(v) => set("y0", v)} /></FieldCell>
      </FieldRow>
      <FieldRow>
        <FieldCell label="X1"><NumberInput value={p.x1} onChange={(v) => set("x1", v)} /></FieldCell>
        <FieldCell label="Y1"><NumberInput value={p.y1} onChange={(v) => set("y1", v)} /></FieldCell>
      </FieldRow>
      <FieldRow>
        <FieldCell label="X2"><NumberInput value={p.x2} onChange={(v) => set("x2", v)} /></FieldCell>
        <FieldCell label="Y2"><NumberInput value={p.y2} onChange={(v) => set("y2", v)} /></FieldCell>
      </FieldRow>
      <Field label="Color"><ColorSlider value={p.color} onChange={(v) => set("color", v)} /></Field>
      <CheckboxInput label="Fill" value={p.fill} onChange={(v) => set("fill", v)} />
    </>
  );
}

function TextForm({ p, set }) {
  return (
    <>
      <FieldRow>
        <FieldCell label="X"><NumberInput value={p.x} onChange={(v) => set("x", v)} /></FieldCell>
        <FieldCell label="Y"><NumberInput value={p.y} onChange={(v) => set("y", v)} /></FieldCell>
      </FieldRow>
      <FieldRow>
        <FieldCell label="Width"><NumberInput value={p.width} min={10} onChange={(v) => set("width", v)} /></FieldCell>
        <FieldCell label="Height"><NumberInput value={p.height} min={10} onChange={(v) => set("height", v)} /></FieldCell>
      </FieldRow>
      <Field label="Text"><TextInput value={p.text} onChange={(v) => set("text", v)} /></Field>
      <Field label="Font size"><NumberInput value={p.fontSize} min={1} max={10} onChange={(v) => set("fontSize", v)} /></Field>
      <Field label="Color"><ColorSlider value={p.color} onChange={(v) => set("color", v)} /></Field>
    </>
  );
}

function GraphForm({ p, set }) {
  return (
    <>
      <FieldRow>
        <FieldCell label="X"><NumberInput value={p.x} onChange={(v) => set("x", v)} /></FieldCell>
        <FieldCell label="Y"><NumberInput value={p.y} onChange={(v) => set("y", v)} /></FieldCell>
      </FieldRow>
      <FieldRow>
        <FieldCell label="Width"><NumberInput value={p.width} min={20} onChange={(v) => set("width", v)} /></FieldCell>
        <FieldCell label="Height"><NumberInput value={p.height} min={20} onChange={(v) => set("height", v)} /></FieldCell>
      </FieldRow>
      <Field label="Color"><ColorSlider value={p.color} onChange={(v) => set("color", v)} /></Field>
    </>
  );
}

function ClockForm({ p, set }) {
  return (
    <>
      <FieldRow>
        <FieldCell label="X"><NumberInput value={p.x} onChange={(v) => set("x", v)} /></FieldCell>
        <FieldCell label="Y"><NumberInput value={p.y} onChange={(v) => set("y", v)} /></FieldCell>
      </FieldRow>
      <Field label="Radius"><NumberInput value={p.radius} min={10} onChange={(v) => set("radius", v)} /></Field>
      <Field label="Color"><ColorSlider value={p.color} onChange={(v) => set("color", v)} /></Field>
    </>
  );
}

function DigitalClockForm({ p, set }) {
  return (
    <>
      <FieldRow>
        <FieldCell label="X"><NumberInput value={p.x} onChange={(v) => set("x", v)} /></FieldCell>
        <FieldCell label="Y"><NumberInput value={p.y} onChange={(v) => set("y", v)} /></FieldCell>
      </FieldRow>
      <Field label="Font size"><NumberInput value={p.fontSize} min={1} max={10} onChange={(v) => set("fontSize", v)} /></Field>
      <Field label="Color"><ColorSlider value={p.color} onChange={(v) => set("color", v)} /></Field>
    </>
  );
}

function BitmapForm({ p, set }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("src", ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <FieldRow>
        <FieldCell label="X"><NumberInput value={p.x} onChange={(v) => set("x", v)} /></FieldCell>
        <FieldCell label="Y"><NumberInput value={p.y} onChange={(v) => set("y", v)} /></FieldCell>
      </FieldRow>
      <FieldRow>
        <FieldCell label="Width"><NumberInput value={p.width} min={1} onChange={(v) => set("width", v)} /></FieldCell>
        <FieldCell label="Height"><NumberInput value={p.height} min={1} onChange={(v) => set("height", v)} /></FieldCell>
      </FieldRow>
      <Field label="Image">
        <label className="block w-full text-center text-sm font-mono border border-gray-300 rounded px-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors">
          {p.src ? "Change image" : "Upload image"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        {p.src && (
          <img
            src={p.src}
            alt=""
            className="mt-2 w-full object-contain max-h-24 rounded border border-gray-200"
          />
        )}
      </Field>
    </>
  );
}

const FORMS = {
  [ENTITY_TYPES.PIXEL]: PixelForm,
  [ENTITY_TYPES.LINE]: LineForm,
  [ENTITY_TYPES.RECTANGLE]: RectForm,
  [ENTITY_TYPES.CIRCLE]: CircleForm,
  [ENTITY_TYPES.TRIANGLE]: TriangleForm,
  [ENTITY_TYPES.TEXT]: TextForm,
  [ENTITY_TYPES.BITMAP]: BitmapForm,
  [ENTITY_TYPES.GRAPH]: GraphForm,
  [ENTITY_TYPES.CLOCK]: ClockForm,
  [ENTITY_TYPES.DIGITAL_CLOCK]: DigitalClockForm,
};

// ─── Main panel ────────────────────────────────────────────────────────────
export default function RightPanel() {
  const {
    activeTool,
    toolParams,
    updateToolParam,
    createEntity,
    selectedEntityId,
    selectedEntity,
    updateEntity,
    renameEntity,
  } = useApp();

  // If an entity is selected, show its edit form
  if (selectedEntity) {
    const Form = FORMS[selectedEntity.type] ?? (() => null);
    const set = (key, val) => updateEntity(selectedEntity.id, { [key]: val });

    return (
      <aside className="w-56 bg-white border-l border-gray-200 overflow-y-auto shrink-0 px-3 py-3">
        <h2 className="font-bold text-sm font-mono text-gray-900 mb-3">
          Edit: {selectedEntity.name ?? selectedEntity.id}
        </h2>
        <Field label="Name">
          <TextInput
            value={selectedEntity.name ?? selectedEntity.id}
            onChange={(v) => renameEntity(selectedEntity.id, v)}
          />
        </Field>
        <div className="border-t border-gray-100 my-3" />
        <Form p={selectedEntity.params} set={set} />
      </aside>
    );
  }

  // Otherwise show the creation form for the active tool
  const Form = FORMS[activeTool] ?? (() => null);
  const set = (key, val) => updateToolParam(key, val);

  return (
    <aside className="w-56 bg-white border-l border-gray-200 overflow-y-auto shrink-0 px-3 py-3">
      <h2 className="font-bold text-sm font-mono text-gray-900 mb-3">
        Create new {activeTool.toLowerCase()}
      </h2>

      <Form p={toolParams} set={set} />

      <button
        onClick={createEntity}
        className="mt-4 w-full text-sm font-mono text-gray-900 border border-gray-400 rounded px-3 py-1.5
          hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        Create Entity
      </button>
    </aside>
  );
}
