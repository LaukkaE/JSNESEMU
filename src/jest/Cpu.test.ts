import { describe, expect, test } from '@jest/globals';
import { CPU, Memory, OPCODES } from '../cpu/Cpu';

let cpu = new CPU();
let mem = new Memory();
describe('CPU LDA tests', () => {
  test('LDA_IMMEDIATE', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDA_IMMEDIATE;
    mem.memory[0x1] = 0x30;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x30);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_ZEROPAGE', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDA_ZEROPAGE;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042] = 0x84;
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x84);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_ZEROPAGE_X, noWrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f; //hardcode x
    mem.memory[0x0] = OPCODES.LDA_ZEROPAGE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042 + 0x0f] = 0x55;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_ZEROPAGE_X, wrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f; //hardcode x
    mem.memory[0x0] = OPCODES.LDA_ZEROPAGE_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0xe] = 0x55; // 0xff + 0x0f + wrap = 0xe
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_ABSOLUTE', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDA_ABSOLUTE;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5542] = 0x69;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_ABSOLUTE_X, no Page cross', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f; //hardcode x
    mem.memory[0x0] = OPCODES.LDA_ABSOLUTE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_ABSOLUTE_X,Page cross', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x1; //hardcode x
    mem.memory[0x0] = OPCODES.LDA_ABSOLUTE_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0x2] = 0x44; //0x4402
    mem.memory[0x4500] = 0x69; //0x4402 + 0x1, page cross
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_ABSOLUTE_Y, no Page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0f; //hardcode Y
    mem.memory[0x0] = OPCODES.LDA_ABSOLUTE_Y;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_ABSOLUTE_Y,Page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x1; //hardcode Y
    mem.memory[0x0] = OPCODES.LDA_ABSOLUTE_Y;
    mem.memory[0x1] = 0xff;
    mem.memory[0x2] = 0x44; //0x44ff
    mem.memory[0x4500] = 0x69; //0x44ff + 0x1, page cross
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_INDEXED_INDIRECT_X, noWrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x10; //hardcode X
    mem.memory[0x0] = OPCODES.LDA_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0x4;
    mem.memory[0x14] = 0x69; // no wrap
    mem.memory[0x15] = 0x32; // 0x3269
    mem.memory[0x3269] = 0x44;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x44);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_INDEXED_INDIRECT_X, wrap around', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x7; //hardcode X
    mem.memory[0x0] = OPCODES.LDA_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0x6] = 0x69; //wrap
    mem.memory[0x7] = 0x44; //0x4469
    mem.memory[0x4469] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_INDEXED_INDIRECT_Y, page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xff; //hardcode Y
    mem.memory[0x0] = OPCODES.LDA_INDIRECT_INDEXED_Y;
    mem.memory[0x1] = 0x10;
    mem.memory[0x10] = 0x01; //wrap
    mem.memory[0x11] = 0x80; //wrap
    mem.memory[0x8100] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
  test('LDA_INDEXED_INDIRECT_Y, no page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0; //hardcode Y
    mem.memory[0x0] = OPCODES.LDA_INDIRECT_INDEXED_Y;
    mem.memory[0x1] = 0x10;
    mem.memory[0x10] = 0x00; //wrap
    mem.memory[0x11] = 0x02; //wrap
    mem.memory[0x200] = 0x55;
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
});
describe('CPU LDX tests', () => {
  test('LDX_IMMEDIATE', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDX_IMMEDIATE;
    mem.memory[0x1] = 0x30;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.registers.X).toEqual(0x30);
    expect(cpu.cycles).toBe(0);
  });
  test('LDX_ZEROPAGE', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDX_ZEROPAGE;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042] = 0x84;
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(cpu.registers.X).toEqual(0x84);
    expect(cpu.cycles).toBe(0);
  });
  test('LDX_ZEROPAGE_Y,wrap', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xff;
    mem.memory[0x0] = OPCODES.LDX_ZEROPAGE_Y;
    mem.memory[0x1] = 0x42;
    mem.memory[0x41] = 0x55; //0x42 + 0xff + wrap = 0x41
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.X).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
  test('LDX_ZEROPAGE_Y, no wrap', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0f;
    mem.memory[0x0] = OPCODES.LDX_ZEROPAGE_Y;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042 + 0x0f] = 0x55;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.X).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
  test('LDX_ABSOLUTE', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDX_ABSOLUTE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x44; //0x4433
    mem.memory[0x4433] = 0x69;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.X).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('LDX_ABSOLUTE_Y,Page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x1; //hardcode x
    mem.memory[0x0] = OPCODES.LDX_ABSOLUTE_Y;
    mem.memory[0x1] = 0xff;
    mem.memory[0x2] = 0x44; //0x4402
    mem.memory[0x4500] = 0x69; //0x4402 + 0x1, page cross
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.X).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('LDX_ABSOLUTE_Y, no Page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0f; //hardcode Y
    mem.memory[0x0] = OPCODES.LDX_ABSOLUTE_Y;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.X).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
});

describe('CPU Jump tests', () => {
  test('JSR + LDA_IMMEDIATE', () => {
    // let cpu = new CPU();
    // let mem = new Memory();
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.JSR_ABSOLUTE;
    mem.memory[0x1] = 0x30;
    mem.memory[0x2] = 0x30;
    mem.memory[0x3030] = OPCODES.LDA_IMMEDIATE;
    mem.memory[0x3031] = 0x66;
    cpu.cycles = 8;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x66); //test that jsr jumps to LDA and loads A
    expect(cpu.PC).toEqual(0x3032); //pc should be after LDA immediate
    expect(cpu.cycles).toBe(0); //cycles used should be 6 + 2
    expect(cpu.SP).toBe(0xff - 1); //stackpointer should be decremented (jos initialize vaihtunu ni failaa)
    let word = mem.memory[0xff] | (mem.memory[0xff + 1] << 8);
    expect(word).toEqual(0x2); //PC should be stored in memory at SP
  });
});
