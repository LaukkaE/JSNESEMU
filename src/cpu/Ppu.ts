import { MemoryBus } from './MemoryBus';

class PPU {
  vram = new Uint8Array(2048); //oikeesti 2000 -- 3eff
  palette_table = new Uint8Array(32); //oikeesti 3f00 -- 3f1f
  oam_data = new Uint8Array(256); //sprite memory
  chr_rom = new Uint8Array();
  memory: MemoryBus;
  constructor(memory: MemoryBus) {
    this.memory = memory;
  }
  PPUCTRL() {}

  tick() {
    console.log('tock');
  }
}

export { PPU };
