import { useApp, DISPLAYS } from "../context/AppContext";

export default function Navbar() {
  const {
    selectedDisplay,
    setSelectedDisplay,
    grid,
    setGrid,
    saveProject,
    loadProject,
    exportArduino,
  } = useApp();

  return (
    <header className="flex flex-col bg-surface">
      {/* Top row: title + display selector */}
      <div className="flex items-center justify-between px-4 py-2">
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight text-gray-900 font-mono">
            Inkplate GUI Designer
          </h1>
          <p className="text-xs text-gray-500 font-mono">
            Made by e-radionica.com
          </p>
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

      {/* Bottom row: actions */}
      <div className="flex items-center gap-1 px-3 py-1.5">
        <button
          onClick={saveProject}
          className="text-sm font-mono text-white hover:text-yellow-300 transition-colors px-2 py-0.5"
        >
          Save
        </button>

        <span className="text-gray-600 font-mono">|</span>

        <button
          onClick={loadProject}
          className="text-sm font-mono text-white hover:text-yellow-300 transition-colors px-2 py-0.5"
        >
          Load
        </button>

        <span className="text-gray-600 font-mono mx-1">|</span>

        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={grid.enabled}
            onChange={(e) => setGrid((g) => ({ ...g, enabled: e.target.checked }))}
            className="w-3 h-3 accent-yellow-400"
          />
          <span className="text-sm font-mono text-white">Grid</span>
        </label>
        <input
          type="number"
          min={10}
          max={50}
          value={grid.size}
          onChange={(e) => setGrid((g) => ({ ...g, size: Math.max(10, parseInt(e.target.value) || 10) }))}
          className="w-12 text-sm font-mono px-1 py-0.5 rounded border border-gray-500 bg-gray-700 text-white text-center"
        />
        <span className="text-xs font-mono text-gray-400">px</span>

        <span className="text-gray-600 font-mono mx-1">|</span>

        <button
          onClick={exportArduino}
          className="text-sm font-mono bg-yellow-400 text-gray-900 font-semibold px-3 py-0.5 rounded hover:bg-yellow-300 transition-colors"
        >
          Export Arduino Code
        </button>
      </div>
    </header>
  );
}
