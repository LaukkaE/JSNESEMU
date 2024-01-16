import React from 'react';
import ReactDOM from 'react-dom/client';
import { CPU } from './cpu/Cpu.ts';
import { MemoryBus } from './cpu/MemoryBus.ts';
import DebugPage from './debugPage/DebugPage.tsx';
import { PPU } from './cpu/Ppu.ts';

let memory = new MemoryBus();
let cpu = new CPU(memory);
let ppu = new PPU(memory);
cpu.reset();
memory.setCPU(cpu);
memory.setPPU(ppu);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DebugPage cpu={cpu} memory={memory} ppu={ppu} />
  </React.StrictMode>
);
