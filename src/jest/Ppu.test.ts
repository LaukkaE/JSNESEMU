import { describe, expect, test } from '@jest/globals';
// import { CPU, OPCODES } from '../cpu/Cpu';
import { MemoryBus } from '../cpu/MemoryBus';

let mem = new MemoryBus();

describe('PPUCTRL tests', () => {
  test('PPU 0x2008 Gets mirrored to 0x2000', () => {
    mem.CPU.reset();
    mem.PPU.PPUCTRL.bitflags.NAMETABLE_HI = 0;
    mem.PPU.PPUCTRL.bitflags.NAMETABLE_LO = 1;
    expect(mem.PPU.PPUCTRL.getNameTableAddress()).toEqual(1);
  });
});
