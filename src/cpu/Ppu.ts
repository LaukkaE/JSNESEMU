import { Memory } from './Cpu';

class PPU {
  memory: Memory;
  constructor(memory: Memory) {
    this.memory = memory;
  }

  tick() {
    console.log('tock');
  }
}

let mem = new Memory();

let ppu = new PPU(mem);
