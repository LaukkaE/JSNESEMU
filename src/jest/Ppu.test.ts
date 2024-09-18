import { describe, expect, test } from '@jest/globals';
// import { CPU, OPCODES } from '../cpu/Cpu';
import { MemoryBus } from '../cpu/MemoryBus';

let mem = new MemoryBus();

describe('PPUCTRL tests', () => {
  test('PPUCTRL gives 0x2000 as address', () => {
    mem.CPU.reset();
    mem.PPU.PPUCTRL.bitflags.NAMETABLE_HI = 0;
    mem.PPU.PPUCTRL.bitflags.NAMETABLE_LO = 0;
    expect(mem.PPU.PPUCTRL.getNameTableAddress()).toEqual(0x2000);
  });
  test('PPUCTRL gives 0x2400 as address', () => {
    mem.CPU.reset();
    mem.PPU.PPUCTRL.bitflags.NAMETABLE_HI = 0;
    mem.PPU.PPUCTRL.bitflags.NAMETABLE_LO = 1;
    expect(mem.PPU.PPUCTRL.getNameTableAddress()).toEqual(0x2400);
  });
  test('PPUCTRL gives 0x2800 as address', () => {
    mem.CPU.reset();
    mem.PPU.PPUCTRL.bitflags.NAMETABLE_HI = 1;
    mem.PPU.PPUCTRL.bitflags.NAMETABLE_LO = 0;
    expect(mem.PPU.PPUCTRL.getNameTableAddress()).toEqual(0x2800);
  });
  test('PPUCTRL gives 0x2c00 as address', () => {
    mem.CPU.reset();
    mem.PPU.PPUCTRL.bitflags.NAMETABLE_HI = 1;
    mem.PPU.PPUCTRL.bitflags.NAMETABLE_LO = 1;
    expect(mem.PPU.PPUCTRL.getNameTableAddress()).toEqual(0x2c00);
  });
});
