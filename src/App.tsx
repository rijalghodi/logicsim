import { useCallback, useMemo, useState } from "react";
import { CircuitCanvas } from "./components/circuit/CircuitCanvas";
import { createDemoCircuit } from "./components/circuit/demoCircuit";
import type { Layout, Position } from "./components/circuit/geometry";
import type { Bit } from "./core";

function App() {
  const demo = useMemo(() => createDemoCircuit(), []);
  const [boundaryInputs, setBoundaryInputs] = useState<Record<string, Bit>>({});
  const [layout, setLayout] = useState<Layout>(demo.layout);
  const [boundaryLayout, setBoundaryLayout] = useState<Record<string, number>>({});

  const handleToggleBoundaryInput = useCallback((portId: string) => {
    setBoundaryInputs((prev) => ({ ...prev, [portId]: !prev[portId] }));
  }, []);

  const handleMoveComponent = useCallback((componentId: string, position: Position) => {
    setLayout((prev) => ({ ...prev, [componentId]: position }));
  }, []);

  const handleMoveBoundaryPort = useCallback((portId: string, y: number) => {
    setBoundaryLayout((prev) => ({ ...prev, [portId]: y }));
  }, []);

  return (
    <CircuitCanvas
      circuit={demo.definition}
      registry={demo.registry}
      layout={layout}
      boundary={demo.boundary}
      boundaryLayout={boundaryLayout}
      boundaryInputs={boundaryInputs}
      onToggleBoundaryInput={handleToggleBoundaryInput}
      onMoveComponent={handleMoveComponent}
      onMoveBoundaryPort={handleMoveBoundaryPort}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}

export default App;
