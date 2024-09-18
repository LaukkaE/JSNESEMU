import { MemoryBus } from './MemoryBus';
import { PPUCTRL } from './PpuRegisters/PpuCtrl';
import { PPUMASK } from './PpuRegisters/PpuMask';

class PPU {
  vram = new Uint8Array(2048).fill(0); //oikeesti 2000 -- 3eff
  palette_table = new Uint8Array(32); //oikeesti 3f00 -- 3f1f
  oam_data = new Uint8Array(256).fill(0); //sprite memory
  chr_rom = new Uint8Array(); //tulee peliltä
  memoryBus: MemoryBus;

  //Registers
  PPUCTRL = new PPUCTRL();
  PPUMASK = new PPUMASK();

  constructor(memoryBus: MemoryBus) {
    this.memoryBus = memoryBus;
  }

  tick() {
    console.log('tock');
  }
}

export { PPU };
