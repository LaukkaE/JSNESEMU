import React from 'react';
import ReactDOM from 'react-dom/client';
import { CPU, Memory } from './cpu/Cpu.ts';
import DebugPage from './DebugPage.tsx';

let cpu = new CPU();
let memory = new Memory();
cpu.reset(memory);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DebugPage cpu={cpu} memory={memory} />
  </React.StrictMode>
);
