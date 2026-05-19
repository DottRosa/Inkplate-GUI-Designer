import { useApp, DISPLAYS } from "../context/AppContext";
import arduinoLogo from "../assets/arduino.png";
import solderedLogo from "../assets/soldered.svg";

export default function Navbar() {
  const {
    selectedDisplay,
    setSelectedDisplay,
    rotation,
    setRotation,
    grid,
    setGrid,
    padding,
    setPadding,
    zoom,
    setZoom,
    saveProject,
    loadProject,
    exportArduino,
  } = useApp();

  return (
    <header className="flex flex-col bg-surface">
      {/* Top row: title + display selector */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <img src={solderedLogo} alt="" className="h-6 border-r pr-2" />
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-gray-900 font-mono">
              Inkplate GUI Designer
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-mono text-gray-700">Display:</label>
          <select
            className="border border-gray-400 text-sm font-mono px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-violet-400"
            value={selectedDisplay}
            onChange={(e) => setSelectedDisplay(e.target.value)}
          >
            {Object.entries(DISPLAYS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom row: actions — wraps on narrow viewports */}
      <div className="flex flex-wrap items-center gap-y-1 px-3 py-1.5">
        {/* Group: file actions */}
        <div className="flex items-center shrink-0">
          <button
            onClick={saveProject}
            className="text-sm font-mono hover:cursor-pointer transition-colors px-2 py-0.5"
          >
            Save
          </button>
          <span className="text-gray-600 font-mono">|</span>
          <button
            onClick={loadProject}
            className="text-sm font-mono hover:cursor-pointer transition-colors px-2 py-0.5"
          >
            Load
          </button>
          <span className="text-gray-600 font-mono">|</span>
          <button
            onClick={exportArduino}
            className="flex items-center border border-arduino text-arduino gap-1.5 text-sm font-mono font-semibold px-1 py-0.5 rounded transition-colors bg-white hover:opacity-80 cursor-pointer"
          >
            <img src={arduinoLogo} alt="" className="w-4 h-4" />
            <span className="hidden sm:inline">Export Arduino Code</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>

        {/* Group: rotation */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-gray-600 font-mono mx-1">|</span>
          <span className="text-sm font-mono text-gray-700">Rotation:</span>
          <div className="flex">
            {[0, 1, 2, 3].map((r) => (
              <button
                key={r}
                onClick={() => setRotation(r)}
                title={`${r * 90}°`}
                className={`text-xs font-mono px-1.5 py-0.5 border border-gray-400 first:rounded-l last:rounded-r -ml-px first:ml-0 cursor-pointer transition-colors ${
                  rotation === r ? "bg-violet-600 text-white border-violet-600 z-10" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {r * 90}°
              </button>
            ))}
          </div>
        </div>

        {/* Group: grid */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-gray-600 font-mono mx-1">|</span>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={grid.enabled}
              onChange={(e) => setGrid((g) => ({ ...g, enabled: e.target.checked }))}
              className="w-3 h-3 accent-yellow-400"
            />
            <span className="text-sm font-mono">Grid</span>
          </label>
          <input
            type="number"
            min={10}
            max={50}
            value={grid.size}
            onChange={(e) =>
              setGrid((g) => ({ ...g, size: Math.max(10, parseInt(e.target.value) || 10) }))
            }
            className="w-12 text-sm font-mono px-1 py-0.5 rounded border border-gray-500 bg-gray-700 text-white text-center"
          />
          <span className="text-xs font-mono text-gray-400">px</span>
        </div>

        {/* Group: padding */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-gray-600 font-mono mx-1">|</span>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={padding.enabled}
              onChange={(e) => setPadding((p) => ({ ...p, enabled: e.target.checked }))}
              className="w-3 h-3 accent-blue-400"
            />
            <span className="text-sm font-mono">Padding</span>
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={padding.size}
            onChange={(e) =>
              setPadding((p) => ({ ...p, size: Math.max(1, parseInt(e.target.value) || 1) }))
            }
            className="w-12 text-sm font-mono px-1 py-0.5 rounded border border-gray-500 bg-gray-700 text-white text-center"
          />
          <span className="text-xs font-mono text-gray-400">px</span>
        </div>

        {/* Group: zoom */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-gray-600 font-mono mx-1">|</span>
          <span className="text-sm font-mono text-gray-700">Zoom:</span>
          <button
            onClick={() => setZoom((z) => Math.max(0.1, z / 1.25))}
            className="text-sm font-mono px-1.5 py-0.5 border border-gray-400 rounded-l bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            −
          </button>
          <span className="text-sm font-mono text-gray-700 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(8, z * 1.25))}
            className="text-sm font-mono px-1.5 py-0.5 border border-gray-400 rounded-r bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="text-sm font-mono px-2 py-0.5 border border-gray-400 rounded bg-white text-gray-700 hover:bg-gray-100 cursor-pointer ml-1"
          >
            Fit
          </button>
        </div>
      </div>
    </header>
  );
}
