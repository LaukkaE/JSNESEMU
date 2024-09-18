import { MemoryBus } from './MemoryBus';
import { PPUADDR } from './PpuRegisters/PpuAddr';
import { PPUCTRL } from './PpuRegisters/PpuCtrl';
import { PPUMASK } from './PpuRegisters/PpuMask';
import { PPUSCROLL } from './PpuRegisters/PpuScroll';

class PPU {
  vram = new Uint8Array(2048).fill(0); //oikeesti 2000 -- 3eff
  palette_table = new Uint8Array(32); //oikeesti 3f00 -- 3f1f
  oam_data = new Uint8Array(256).fill(0); //sprite memory
  chr_rom = new Uint8Array(); //tulee peliltä
  memoryBus: MemoryBus;

  //Registers
  PPUCTRL = new PPUCTRL();
  PPUADDR = new PPUADDR();
  PPUMASK = new PPUMASK();
  PPUSCROLL = new PPUSCROLL();
  //Internal registers
  internalRegisters = {
    v: 0, //During rendering, used for the scroll position. Outside of rendering, used as the current VRAM address.
    t: 0, //During rendering, specifies the starting coarse-x scroll for the next scanline and the starting y scroll for the screen. Outside of rendering, holds the scroll or VRAM address before transferring it to v.
    x: 0, //The fine-x position of the current scroll, used during rendering alongside v.
    w: 0, //Toggles on each write to either PPUSCROLL or PPUADDR, indicating whether this is the first or second write. Clears on reads of PPUSTATUS. Sometimes called the 'write latch' or 'write toggle'.
  };
  constructor(memoryBus: MemoryBus) {
    this.memoryBus = memoryBus;
  }

  tick() {
    console.log('tock');
  }
}

export { PPU };
