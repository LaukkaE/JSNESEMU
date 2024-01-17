import { CPU } from './Cpu';
import { PPU } from './Ppu';

class MemoryBus {
  memory = new Uint8Array(1024 * 64); //addressable space 0x0 - 0xffff
  //0x00-
  CPU: CPU;
  PPU: PPU;
  constructor() {
    this.CPU = new CPU(this);
    this.PPU = new PPU(this);
  }

  setPPU(PPU: PPU) {
    this.PPU = PPU;
  }
  setCPU(CPU: CPU) {
    this.CPU = CPU;
  }
  triggerNMI() {
    if (!this.CPU) {
      throw 'No CPU initialized';
    }
    this.CPU?.nmi();
  }
  resetMemory() {
    this.memory = new Uint8Array(1024 * 64).fill(0x00);
  }
  writeVector(vector: number, address: number) {
    //mirroring TODO sama writebyteen
    //if(address >= 0x0 && address <= 0x1fff){
    //address &= 0x07ff
    //}
    //lisäks PPU range 0x2000-0x2007 mirroraus 0x3fff asti
    this.memory[address - 1] = vector & 0xff;
    this.memory[address] = vector >> 8;
  }
  writeByte(address: number, value: number) {
    this.memory[address] = value;
  }
  loadProgram(rom: Uint8Array) {
    for (let i = 0x10; i < 0x4010; i++) {
      this.memory[0x8000 - 0x10 + i] = rom[i];
      this.memory[0xc000 - 0x10 + i] = rom[i];
    }
  }
}

export { MemoryBus };
