import React from 'react';
import ReactDOM from 'react-dom/client';
import { CPU } from './cpu/Cpu.ts';
import { MemoryBus } from './cpu/MemoryBus.ts';
import DebugPage from './debugPage/DebugPage.tsx';

let memory = new MemoryBus();
let cpu = new CPU(memory);
cpu.reset();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DebugPage cpu={cpu} memory={memory} />
  </React.StrictMode>
);
