import { describe, expect, test } from '@jest/globals';
import { CPU, Memory, OPCODES } from '../cpu/Cpu';

describe('CPU LDA tests', () => {
  test('LDA_IMMEDIATE', () => {
    let cpu = new CPU();
    let mem = new Memory();
    cpu.reset(mem);
    mem.memory[0xfffc] = OPCODES.LDA_IMMEDIATE;
    mem.memory[0xfffc + 1] = 0x30;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x30);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_ZEROPAGE', () => {
    let cpu = new CPU();
    let mem = new Memory();
    cpu.reset(mem);
    mem.memory[0xfffc] = OPCODES.LDA_ZEROPAGE;
    mem.memory[0xfffc + 1] = 0x42;
    mem.memory[0x0042] = 0x84;
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x84);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_ZEROPAGE_X', () => {
    let cpu = new CPU();
    let mem = new Memory();
    cpu.reset(mem);
    cpu.registers.X = 0x0f; //hardcode x
    mem.memory[0xfffc] = OPCODES.LDA_ZEROPAGE_X;
    mem.memory[0xfffc + 1] = 0x42;
    mem.memory[0x0042 + 0x0f] = 0x55;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_ABSOLUTE', () => {
    let cpu = new CPU();
    let mem = new Memory();
    cpu.reset(mem);
    mem.memory[0xfffc] = OPCODES.LDA_ABSOLUTE;
    mem.memory[0xfffd] = 0x42;
    mem.memory[0xfffe] = 0x55; //0x5542
    mem.memory[0x5542] = 0x69;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
});

describe('CPU Jump tests', () => {
  test('JSR + LDA_IMMEDIATE', () => {
    let cpu = new CPU();
    let mem = new Memory();
    cpu.reset(mem);
    mem.memory[0xfffc] = OPCODES.JSR_ABSOLUTE;
    mem.memory[0xfffc + 1] = 0x30;
    mem.memory[0xfffc + 2] = 0x30;
    mem.memory[0x3030] = OPCODES.LDA_IMMEDIATE;
    mem.memory[0x3031] = 0x66;
    cpu.cycles = 8;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x66); //test that jsr jumps to LDA and loads A
    expect(cpu.PC).toEqual(0x3032); //pc should be after LDA immediate
    expect(cpu.cycles).toBe(0); //cycles used should be 6 + 2
    expect(cpu.SP).toBe(0xff + 1); //stackpointer should be incremented (jos initialize vaihtunu ni failaa)
    let word = mem.memory[0xff] | (mem.memory[0xff + 1] << 8);
    expect(word).toEqual(0xfffe); //PC should be stored in memory at SP
  });
});
