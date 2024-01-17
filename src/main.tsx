import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryBus } from './cpu/MemoryBus.ts';
import DebugPage from './debugPage/DebugPage.tsx';

let memoryBus = new MemoryBus();
memoryBus.CPU.reset();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DebugPage memory={memoryBus} />
  </React.StrictMode>
);
