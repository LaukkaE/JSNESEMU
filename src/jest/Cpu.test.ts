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
    cpu.registers.Y = 0x1;
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
    cpu.registers.X = 0x10;
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
    cpu.registers.X = 0x7;
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
  test('LDA_INDIRECT_INDEXED_Y, page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xff;
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
  test('LDA_INDIRECT_INDEXED_Y, no page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0;
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
describe('CPU AND tests', () => {
  test('AND_IMMEDIATE', () => {
    cpu.reset(mem);
    cpu.registers.A = 0xff;
    mem.memory[0x0] = OPCODES.AND_IMMEDIATE;
    mem.memory[0x1] = 0x0f;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x0f);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_ZEROPAGE', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x32;
    mem.memory[0x0] = OPCODES.AND_ZEROPAGE;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042] = 0x99;
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x10);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_ZEROPAGE_X, noWrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f;
    cpu.registers.A = 0x15;
    mem.memory[0x0] = OPCODES.AND_ZEROPAGE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042 + 0x0f] = 0x32;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x10);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_ZEROPAGE_X, wrap', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x1;
    cpu.registers.X = 0x0f;
    mem.memory[0x0] = OPCODES.AND_ZEROPAGE_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0xe] = 0x55; // 0xff + 0x0f + wrap = 0xe
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x1);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_ABSOLUTE', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x0f;
    mem.memory[0x0] = OPCODES.AND_ABSOLUTE;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5542] = 0x69;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x9);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_ABSOLUTE_X, no Page cross', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f;
    cpu.registers.A = 0x15;
    mem.memory[0x0] = OPCODES.AND_ABSOLUTE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x1);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_ABSOLUTE_X,Page cross', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x1;
    cpu.registers.A = 0xae;
    mem.memory[0x0] = OPCODES.AND_ABSOLUTE_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0x2] = 0x44; //0x4402
    mem.memory[0x4500] = 0x69; //0x4402 + 0x1, page cross
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x28);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_ABSOLUTE_Y, no Page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0f;
    cpu.registers.A = 0xef;
    mem.memory[0x0] = OPCODES.AND_ABSOLUTE_Y;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_ABSOLUTE_Y,Page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x1;
    cpu.registers.A = 0xff;
    mem.memory[0x0] = OPCODES.AND_ABSOLUTE_Y;
    mem.memory[0x1] = 0xff;
    mem.memory[0x2] = 0x44; //0x44ff
    mem.memory[0x4500] = 0x69; //0x44ff + 0x1, page cross
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_INDEXED_INDIRECT_X, noWrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x10;
    cpu.registers.A = 0x1f;
    mem.memory[0x0] = OPCODES.AND_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0x4;
    mem.memory[0x14] = 0x69; // no wrap
    mem.memory[0x15] = 0x32; // 0x3269
    mem.memory[0x3269] = 0x44;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x4);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_INDEXED_INDIRECT_X, wrap around', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x7;
    cpu.registers.A = 0x0f;
    mem.memory[0x0] = OPCODES.AND_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0x6] = 0x69; //wrap
    mem.memory[0x7] = 0x44; //0x4469
    mem.memory[0x4469] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x5);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_INDIRECT_INDEXED_Y, page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xff;
    cpu.registers.A = 0x3a;
    mem.memory[0x0] = OPCODES.AND_INDIRECT_INDEXED_Y;
    mem.memory[0x1] = 0x10;
    mem.memory[0x10] = 0x01; //wrap
    mem.memory[0x11] = 0x80; //wrap
    mem.memory[0x8100] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x10);
    expect(cpu.cycles).toBe(0);
  });
  test('AND_INDIRECT_INDEXED_Y, no page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0;
    cpu.registers.A = 0x2d;
    mem.memory[0x0] = OPCODES.AND_INDIRECT_INDEXED_Y;
    mem.memory[0x1] = 0x10;
    mem.memory[0x10] = 0x00; //wrap
    mem.memory[0x11] = 0x02; //wrap
    mem.memory[0x200] = 0x55;
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x5);
    expect(cpu.cycles).toBe(0);
  });
});
describe('CPU EOR tests', () => {
  test('EOR_IMMEDIATE', () => {
    cpu.reset(mem);
    cpu.registers.A = 0xff;
    mem.memory[0x0] = OPCODES.EOR_IMMEDIATE;
    mem.memory[0x1] = 0x0f;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0xf0);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_ZEROPAGE', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x32;
    mem.memory[0x0] = OPCODES.EOR_ZEROPAGE;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042] = 0x99;
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0xab);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_ZEROPAGE_X, noWrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f;
    cpu.registers.A = 0x15;
    mem.memory[0x0] = OPCODES.EOR_ZEROPAGE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042 + 0x0f] = 0x32;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x27);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_ZEROPAGE_X, wrap', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x1;
    cpu.registers.X = 0x0f;
    mem.memory[0x0] = OPCODES.EOR_ZEROPAGE_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0xe] = 0x55; // 0xff + 0x0f + wrap = 0xe
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x54);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_ABSOLUTE', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x0f;
    mem.memory[0x0] = OPCODES.EOR_ABSOLUTE;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5542] = 0x69;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x66);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_ABSOLUTE_X, no Page cross', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f;
    cpu.registers.A = 0x15;
    mem.memory[0x0] = OPCODES.EOR_ABSOLUTE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x7c);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_ABSOLUTE_X,Page cross', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x1;
    cpu.registers.A = 0xae;
    mem.memory[0x0] = OPCODES.EOR_ABSOLUTE_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0x2] = 0x44; //0x4402
    mem.memory[0x4500] = 0x69; //0x4402 + 0x1, page cross
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0xc7);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_ABSOLUTE_Y, no Page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0f;
    cpu.registers.A = 0xef;
    mem.memory[0x0] = OPCODES.EOR_ABSOLUTE_Y;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x86);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_ABSOLUTE_Y,Page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x1;
    cpu.registers.A = 0xff;
    mem.memory[0x0] = OPCODES.EOR_ABSOLUTE_Y;
    mem.memory[0x1] = 0xff;
    mem.memory[0x2] = 0x44; //0x44ff
    mem.memory[0x4500] = 0x69; //0x44ff + 0x1, page cross
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x96);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_INDEXED_INDIRECT_X, noWrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x10;
    cpu.registers.A = 0x1f;
    mem.memory[0x0] = OPCODES.EOR_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0x4;
    mem.memory[0x14] = 0x69; // no wrap
    mem.memory[0x15] = 0x32; // 0x3269
    mem.memory[0x3269] = 0x44;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x5b);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_INDEXED_INDIRECT_X, wrap around', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x7;
    cpu.registers.A = 0x0f;
    mem.memory[0x0] = OPCODES.EOR_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0x6] = 0x69; //wrap
    mem.memory[0x7] = 0x44; //0x4469
    mem.memory[0x4469] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x5a);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_INDIRECT_INDEXED_Y, page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xff;
    cpu.registers.A = 0x3a;
    mem.memory[0x0] = OPCODES.EOR_INDIRECT_INDEXED_Y;
    mem.memory[0x1] = 0x10;
    mem.memory[0x10] = 0x01; //wrap
    mem.memory[0x11] = 0x80; //wrap
    mem.memory[0x8100] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x6f);
    expect(cpu.cycles).toBe(0);
  });
  test('EOR_INDIRECT_INDEXED_Y, no page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0;
    cpu.registers.A = 0x2d;
    mem.memory[0x0] = OPCODES.EOR_INDIRECT_INDEXED_Y;
    mem.memory[0x1] = 0x10;
    mem.memory[0x10] = 0x00; //wrap
    mem.memory[0x11] = 0x02; //wrap
    mem.memory[0x200] = 0x55;
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x78);
    expect(cpu.cycles).toBe(0);
  });
});
describe('CPU ORA tests', () => {
  test('ORA_IMMEDIATE', () => {
    cpu.reset(mem);
    cpu.registers.A = 0xff;
    mem.memory[0x0] = OPCODES.ORA_IMMEDIATE;
    mem.memory[0x1] = 0x0f;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0xff);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_ZEROPAGE', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x32;
    mem.memory[0x0] = OPCODES.ORA_ZEROPAGE;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042] = 0x99;
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0xbb);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_ZEROPAGE_X, noWrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f;
    cpu.registers.A = 0x15;
    mem.memory[0x0] = OPCODES.ORA_ZEROPAGE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042 + 0x0f] = 0x32;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x37);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_ZEROPAGE_X, wrap', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x1;
    cpu.registers.X = 0x0f;
    mem.memory[0x0] = OPCODES.ORA_ZEROPAGE_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0xe] = 0x55; // 0xff + 0x0f + wrap = 0xe
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_ABSOLUTE', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x0f;
    mem.memory[0x0] = OPCODES.ORA_ABSOLUTE;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5542] = 0x69;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x6f);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_ABSOLUTE_X, no Page cross', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f;
    cpu.registers.A = 0x15;
    mem.memory[0x0] = OPCODES.ORA_ABSOLUTE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x7d);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_ABSOLUTE_X,Page cross', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x1;
    cpu.registers.A = 0xae;
    mem.memory[0x0] = OPCODES.ORA_ABSOLUTE_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0x2] = 0x44; //0x4402
    mem.memory[0x4500] = 0x69; //0x4402 + 0x1, page cross
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0xef);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_ABSOLUTE_Y, no Page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0f;
    cpu.registers.A = 0xef;
    mem.memory[0x0] = OPCODES.ORA_ABSOLUTE_Y;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0xef);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_ABSOLUTE_Y,Page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x1;
    cpu.registers.A = 0xff;
    mem.memory[0x0] = OPCODES.ORA_ABSOLUTE_Y;
    mem.memory[0x1] = 0xff;
    mem.memory[0x2] = 0x44; //0x44ff
    mem.memory[0x4500] = 0x69; //0x44ff + 0x1, page cross
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0xff);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_INDEXED_INDIRECT_X, noWrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x10;
    cpu.registers.A = 0x1f;
    mem.memory[0x0] = OPCODES.ORA_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0x4;
    mem.memory[0x14] = 0x69; // no wrap
    mem.memory[0x15] = 0x32; // 0x3269
    mem.memory[0x3269] = 0x44;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x5f);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_INDEXED_INDIRECT_X, wrap around', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x7;
    cpu.registers.A = 0x0f;
    mem.memory[0x0] = OPCODES.ORA_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0x6] = 0x69; //wrap
    mem.memory[0x7] = 0x44; //0x4469
    mem.memory[0x4469] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x5f);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_INDIRECT_INDEXED_Y, page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xff;
    cpu.registers.A = 0x3a;
    mem.memory[0x0] = OPCODES.ORA_INDIRECT_INDEXED_Y;
    mem.memory[0x1] = 0x10;
    mem.memory[0x10] = 0x01; //wrap
    mem.memory[0x11] = 0x80; //wrap
    mem.memory[0x8100] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x7f);
    expect(cpu.cycles).toBe(0);
  });
  test('ORA_INDIRECT_INDEXED_Y, no page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0;
    cpu.registers.A = 0x2d;
    mem.memory[0x0] = OPCODES.ORA_INDIRECT_INDEXED_Y;
    mem.memory[0x1] = 0x10;
    mem.memory[0x10] = 0x00; //wrap
    mem.memory[0x11] = 0x02; //wrap
    mem.memory[0x200] = 0x55;
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x7d);
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
describe('CPU LD flags tests', () => {
  test('Zero flag set when byte is zero', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDA_IMMEDIATE;
    // mem.memory[0x1] = 0x30;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.Z).toBe(true);
  });
  test('Zero flag cleared when byte is not zero', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDA_IMMEDIATE;
    mem.memory[0x1] = 0x30;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.Z).toBe(false);
  });
  test('Negative flag is set when byte 7 is one', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDA_IMMEDIATE;
    mem.memory[0x1] = 0xff;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.N).toBe(true);
  });
  test('Negative flag is cleared when byte 7 is 0', () => {
    cpu.reset(mem);
    cpu.flags.N = true;
    mem.memory[0x0] = OPCODES.LDA_IMMEDIATE;
    mem.memory[0x1] = 0x50;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.N).toBe(false);
  });
});
describe('CPU LDY tests', () => {
  test('LDY_IMMEDIATE', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDY_IMMEDIATE;
    mem.memory[0x1] = 0x30;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.registers.Y).toEqual(0x30);
    expect(cpu.cycles).toBe(0);
  });
  test('LDY_ZEROPAGE', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDY_ZEROPAGE;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042] = 0x84;
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(cpu.registers.Y).toEqual(0x84);
    expect(cpu.cycles).toBe(0);
  });
  test('LDY_ZEROPAGE_X,wrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0xff;
    mem.memory[0x0] = OPCODES.LDY_ZEROPAGE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x41] = 0x55; //0x42 + 0xff + wrap = 0x41
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.Y).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
  test('LDY_ZEROPAGE_X, no wrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f;
    mem.memory[0x0] = OPCODES.LDY_ZEROPAGE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042 + 0x0f] = 0x55;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.Y).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
  test('LDY_ABSOLUTE', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LDY_ABSOLUTE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x44; //0x4433
    mem.memory[0x4433] = 0x69;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.Y).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('LDY_ABSOLUTE_X,Page cross', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x1;
    mem.memory[0x0] = OPCODES.LDY_ABSOLUTE_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0x2] = 0x44; //0x4402
    mem.memory[0x4500] = 0x69; //0x4402 + 0x1, page cross
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.Y).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('LDY_ABSOLUTE_X, no Page cross', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f; //hardcode Y
    mem.memory[0x0] = OPCODES.LDY_ABSOLUTE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.Y).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
});
describe('CPU STA tests', () => {
  test('STA_ZEROPAGE', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x13;
    mem.memory[0x0] = OPCODES.STA_ZEROPAGE;
    mem.memory[0x1] = 0x42;
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(mem.memory[0x42]).toEqual(0x13);
    expect(cpu.cycles).toBe(0);
  });
  test('STA_ZEROPAGE_X,wrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0xff;
    cpu.registers.A = 0x13;
    mem.memory[0x0] = OPCODES.STA_ZEROPAGE_X;
    mem.memory[0x1] = 0x42;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(mem.memory[0x41]).toEqual(0x13);
    expect(cpu.cycles).toBe(0);
  });
  test('STA_ZEROPAGE_X, no wrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f;
    cpu.registers.A = 0x13;
    mem.memory[0x0] = OPCODES.STA_ZEROPAGE_X;
    mem.memory[0x1] = 0x42;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(mem.memory[0x042 + 0x0f]).toEqual(0x13);
    expect(cpu.cycles).toBe(0);
  });
  test('STA_ABSOLUTE', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x11;
    mem.memory[0x0] = OPCODES.STA_ABSOLUTE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x44; //0x4433
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(mem.memory[0x4433]).toEqual(0x11);
    expect(cpu.cycles).toBe(0);
  });
  test('STA_ABSOLUTE_X', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f;
    cpu.registers.A = 0x35;
    mem.memory[0x0] = OPCODES.STA_ABSOLUTE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(mem.memory[0x5551]).toEqual(0x35);
    expect(cpu.cycles).toBe(0);
  });
  test('STA_ABSOLUTE_Y', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0f;
    cpu.registers.A = 0x11;
    mem.memory[0x0] = OPCODES.STA_ABSOLUTE_Y;
    mem.memory[0x1] = 0x42;
    mem.memory[0x2] = 0x55; //0x5542
    mem.memory[0x5551] = 0x69; //0x5542 + 0x0f
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(mem.memory[0x5551]).toEqual(0x11);
    expect(cpu.cycles).toBe(0);
  });
  test('STA_INDEXED_INDIRECT_X, wrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0xff;
    cpu.registers.A = 0x69;
    mem.memory[0x0] = OPCODES.STA_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0xfe] = 0x69; //wrap
    mem.memory[0xff] = 0x44; //0x4469
    mem.memory[0x4469] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(mem.memory[0xfe]).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('STA_INDEXED_INDIRECT_X, nowrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x1;
    cpu.registers.A = 0x69;
    mem.memory[0x0] = OPCODES.STA_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0x05;
    mem.memory[0x6] = 0x69;
    mem.memory[0x7] = 0x44; //0x4469
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(mem.memory[0x4469]).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
  test('STA_INDIRECT_INDEXED_Y', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xff;
    cpu.registers.A = 0x69;
    mem.memory[0x0] = OPCODES.STA_INDIRECT_INDEXED_Y;
    mem.memory[0x1] = 0x10;
    mem.memory[0x10] = 0x01;
    mem.memory[0x11] = 0x80; //0x8001 + A
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(mem.memory[0x8100]).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
});
describe('CPU STX tests', () => {
  test('STX_ZEROPAGE', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x55;
    mem.memory[0x0] = OPCODES.STX_ZEROPAGE;
    mem.memory[0x1] = 0x42;
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(mem.memory[0x42]).toEqual(0x55);
    expect(cpu.cycles).toBe(0);
  });
  test('STX_ZEROPAGE_Y,wrap', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xff;
    cpu.registers.X = 0x43;
    mem.memory[0x0] = OPCODES.STX_ZEROPAGE_Y;
    mem.memory[0x1] = 0x42;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(mem.memory[0x41]).toEqual(0x43);
    expect(cpu.cycles).toBe(0);
  });
  test('STX_ZEROPAGE_Y, no wrap', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0f;
    cpu.registers.X = 0x73;
    mem.memory[0x0] = OPCODES.STX_ZEROPAGE_Y;
    mem.memory[0x1] = 0x42;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(mem.memory[0x042 + 0x0f]).toEqual(0x73);
    expect(cpu.cycles).toBe(0);
  });
  test('STX_ABSOLUTE', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x42;
    mem.memory[0x0] = OPCODES.STX_ABSOLUTE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x44; //0x4433
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(mem.memory[0x4433]).toEqual(0x42);
    expect(cpu.cycles).toBe(0);
  });
});
describe('CPU STY tests', () => {
  test('STY_ZEROPAGE', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x44;
    mem.memory[0x0] = OPCODES.STY_ZEROPAGE;
    mem.memory[0x1] = 0x42;
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(mem.memory[0x42]).toEqual(0x44);
    expect(cpu.cycles).toBe(0);
  });
  test('STY_ZEROPAGE_X,wrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0xff;
    cpu.registers.Y = 0x23;
    mem.memory[0x0] = OPCODES.STY_ZEROPAGE_X;
    mem.memory[0x1] = 0x42;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(mem.memory[0x41]).toEqual(0x23);
    expect(cpu.cycles).toBe(0);
  });
  test('STY_ZEROPAGE_X, no wrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0f;
    cpu.registers.Y = 0x53;
    mem.memory[0x0] = OPCODES.STY_ZEROPAGE_X;
    mem.memory[0x1] = 0x42;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(mem.memory[0x042 + 0x0f]).toEqual(0x53);
    expect(cpu.cycles).toBe(0);
  });
  test('STY_ABSOLUTE', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x69;
    mem.memory[0x0] = OPCODES.STY_ABSOLUTE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x44; //0x4433
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(mem.memory[0x4433]).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
  });
});
describe('CPU Transfer tests', () => {
  test('TAX_IMPLIED', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x33;
    cpu.cycles = 2;
    mem.memory[0x0] = OPCODES.TAX_IMPLIED;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.X).toEqual(0x33);
  });
  test('TAY_IMPLIED', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x34;
    cpu.cycles = 2;
    mem.memory[0x0] = OPCODES.TAY_IMPLIED;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.Y).toEqual(0x34);
  });
  test('TXA_IMPLIED', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x35;
    cpu.cycles = 2;
    mem.memory[0x0] = OPCODES.TXA_IMPLIED;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.A).toEqual(0x35);
  });
  test('TYA_IMPLIED', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x34;
    cpu.cycles = 2;
    mem.memory[0x0] = OPCODES.TYA_IMPLIED;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.A).toEqual(0x34);
  });
  test('TSX_IMPLIED', () => {
    cpu.reset(mem);
    cpu.cycles = 2;
    mem.memory[0x0] = OPCODES.TSX_IMPLIED;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.X).toEqual(0xff);
  });
  test('TXS_IMPLIED', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x105;
    cpu.cycles = 2;
    mem.memory[0x0] = OPCODES.TXS_IMPLIED;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.SP).toEqual(0x105);
  });
});
describe('CPU Jump tests', () => {
  test('JSR + LDA_IMMEDIATE', () => {
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
    expect(cpu.SP).toBe(0xff - 2); //stackpointer should be decremented (jos initialize vaihtunu ni failaa)
    let word = mem.memory[0xfe] | (mem.memory[0xff] << 8);
    expect(word).toEqual(0x2); //PC should be stored in memory at SP
  });
  test('JSR + RTS', () => {
    cpu.reset(mem);
    cpu.PC = 0x50;
    mem.memory[0x50] = OPCODES.JSR_ABSOLUTE;
    mem.memory[0x51] = 0x30;
    mem.memory[0x52] = 0x30; //Jump to 3030
    mem.memory[0x3030] = OPCODES.RTS_IMPLIED;
    cpu.cycles = 12;
    cpu.execute(mem);
    expect(cpu.PC).toEqual(0x50);
    expect(cpu.cycles).toEqual(0);
    expect(cpu.SP).toEqual(0xff);
  });
  test('JMP_ABSOLUTE', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.JMP_ABSOLUTE;
    mem.memory[0x1] = 0x30;
    mem.memory[0x2] = 0x22; //0x2230
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(cpu.PC).toEqual(0x2230);
    expect(cpu.cycles).toBe(0);
  });
  test('JMP_INDIRECT', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.JMP_INDIRECT;
    mem.memory[0x1] = 0x30;
    mem.memory[0x2] = 0x22; //0x2230
    mem.memory[0x30] = 0xfc;
    mem.memory[0x22] = 0xba; //0xbafc
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.PC).toEqual(0xbafc);
    expect(cpu.cycles).toBe(0);
  });
});
describe('CPU ADC tests', () => {
  test('ADC_IMMEDIATE 0xf + 1 = 0x10', () => {
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.flags.N = true;
    cpu.registers.A = 0x1;
    cpu.flags.C = false;
    mem.memory[0x0] = OPCODES.ADC_IMMEDIATE;
    mem.memory[0x1] = 0x0f;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x10);
    expect(cpu.flags.C).toBe(false);
    expect(cpu.flags.Z).toBe(false);
  });
  test('ADC_IMMEDIATE 0xff + 2 = 0x10, set Carry', () => {
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.flags.N = true;
    cpu.registers.A = 0x2;
    cpu.flags.C = false;
    mem.memory[0x0] = OPCODES.ADC_IMMEDIATE;
    mem.memory[0x1] = 0xff;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x1);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.C).toBe(true);
    expect(cpu.flags.Z).toBe(false);
  });
  test('ADC_ZEROPAGE 0x84 + 2 = 0x86', () => {
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.flags.N = true;
    cpu.registers.A = 0x2;
    cpu.flags.C = false;
    mem.memory[0x0] = OPCODES.ADC_ZEROPAGE;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0042] = 0x84;
    cpu.cycles = 3;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.A).toEqual(0x86);
    expect(cpu.flags.C).toBe(false);
    expect(cpu.flags.Z).toBe(false);
  });
  test('ADC_ZEROPAGE_X', () => {
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.flags.N = true;
    cpu.registers.X = 0x5;
    cpu.registers.A = 0x3;
    cpu.flags.C = false;
    mem.memory[0x0] = OPCODES.ADC_ZEROPAGE_X;
    mem.memory[0x1] = 0x42;
    mem.memory[0x0047] = 0x66;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x69);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.C).toBe(false);
    expect(cpu.flags.Z).toBe(false);
  });
  test('ADC_ABSOLUTE 0+0 = 0', () => {
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.flags.N = true;
    cpu.flags.V = true;
    mem.memory[0x0] = OPCODES.ADC_ABSOLUTE;
    mem.memory[0x1] = 0x00;
    mem.memory[0x2] = 0x80;
    mem.memory[0x8000] = 0x00;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x0);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.C).toBe(false);
    expect(cpu.flags.Z).toBe(true);
    expect(cpu.flags.N).toBe(false);
    expect(cpu.flags.V).toBe(false);
  });
  test('ADC_ABSOLUTE 0+0 + CARRY = 1', () => {
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.flags.N = true;
    cpu.flags.V = true;
    cpu.flags.C = true;
    mem.memory[0x0] = OPCODES.ADC_ABSOLUTE;
    mem.memory[0x1] = 0x00;
    mem.memory[0x2] = 0x80;
    mem.memory[0x8000] = 0x00;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x1);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.C).toBe(false);
    expect(cpu.flags.Z).toBe(false);
    expect(cpu.flags.N).toBe(false);
    expect(cpu.flags.V).toBe(false);
  });
  test('ADC_ABSOLUTE ff + 2 WILL CARRY', () => {
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.flags.N = true;
    cpu.flags.V = true;
    cpu.registers.A = 0xff;
    mem.memory[0x0] = OPCODES.ADC_ABSOLUTE;
    mem.memory[0x1] = 0x00;
    mem.memory[0x2] = 0x80;
    mem.memory[0x8000] = 0x2;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x1);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.C).toBe(true);
    expect(cpu.flags.Z).toBe(false);
    expect(cpu.flags.N).toBe(false);
  });
  test('ADC_ABSOLUTE set overflow when signed addition fails', () => {
    //1 : 1000 0001
    //2: 1000 0001
    //A: 0000 0010 C:1 V:1 A: 0x2
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.registers.A = 0x81;
    mem.memory[0x0] = OPCODES.ADC_ABSOLUTE;
    mem.memory[0x1] = 0x00;
    mem.memory[0x2] = 0x80;
    mem.memory[0x8000] = 0x81;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x2);
    expect(cpu.flags.C).toBe(true);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.Z).toBe(false);
    expect(cpu.flags.V).toBe(true);
  });
  test('ADC_ABSOLUTE_X, no page Cross', () => {
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.flags.N = true;
    cpu.flags.V = true;
    cpu.registers.A = 0xff;
    cpu.registers.X = 0x1;
    mem.memory[0x0] = OPCODES.ADC_ABSOLUTE_X;
    mem.memory[0x1] = 0x02;
    mem.memory[0x2] = 0x80;
    mem.memory[0x8003] = 0x10;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0xf);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.C).toBe(true);
    expect(cpu.flags.Z).toBe(false);
    expect(cpu.flags.N).toBe(false);
  });
  test('ADC_ABSOLUTE_X,page Cross', () => {
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.flags.N = true;
    cpu.flags.V = true;
    cpu.registers.A = 0xff;
    cpu.registers.X = 0xff;
    mem.memory[0x0] = OPCODES.ADC_ABSOLUTE_X;
    mem.memory[0x1] = 0x80;
    mem.memory[0x2] = 0x01;
    mem.memory[0x0180 + 0xff] = 0x2;
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x1);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.C).toBe(true);
    expect(cpu.flags.Z).toBe(false);
    expect(cpu.flags.N).toBe(false);
  });
  test('ADC_ABSOLUTE_Y, no page Cross', () => {
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.flags.N = true;
    cpu.flags.V = true;
    cpu.registers.A = 0xff;
    cpu.registers.Y = 0x1;
    mem.memory[0x0] = OPCODES.ADC_ABSOLUTE_Y;
    mem.memory[0x1] = 0x02;
    mem.memory[0x2] = 0x80;
    mem.memory[0x8003] = 0x10;
    cpu.cycles = 4;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0xf);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.C).toBe(true);
    expect(cpu.flags.Z).toBe(false);
    expect(cpu.flags.N).toBe(false);
  });
  test('ADC_ABSOLUTE_Y,page Cross', () => {
    cpu.reset(mem);
    cpu.flags.Z = false;
    cpu.flags.N = true;
    cpu.flags.V = true;
    cpu.registers.A = 0xff;
    cpu.registers.Y = 0xff;
    mem.memory[0x0] = OPCODES.ADC_ABSOLUTE_Y;
    mem.memory[0x1] = 0x80;
    mem.memory[0x2] = 0x01;
    mem.memory[0x0180 + 0xff] = 0x2;
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x1);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.C).toBe(true);
    expect(cpu.flags.Z).toBe(false);
    expect(cpu.flags.N).toBe(false);
  });
  test('ADC_INDEXED_INDIRECT_X, noWrap', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x10;
    cpu.registers.A = 0x5;
    mem.memory[0x0] = OPCODES.ADC_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0x4;
    mem.memory[0x14] = 0x69; // no wrap
    mem.memory[0x15] = 0x32; // 0x3269
    mem.memory[0x3269] = 0x44;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x49);
    expect(cpu.cycles).toBe(0);
  });
  test('ADC_INDEXED_INDIRECT_X, wrap around', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x7;
    cpu.registers.A = 0x5;
    mem.memory[0x0] = OPCODES.ADC_INDEXED_INDIRECT_X;
    mem.memory[0x1] = 0xff;
    mem.memory[0x6] = 0x69; //wrap
    mem.memory[0x7] = 0x44; //0x4469
    mem.memory[0x4469] = 0x81;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x86);
    expect(cpu.cycles).toBe(0);
  });
  test('ADC_INDIRECT_INDEXED_Y, page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xff;
    cpu.registers.A = 0x4;
    mem.memory[0x0] = OPCODES.ADC_INDIRECT_INDEXED_Y;
    mem.memory[0x1] = 0x10;
    mem.memory[0x10] = 0x01; //wrap
    mem.memory[0x11] = 0x80; //wrap
    mem.memory[0x8100] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x59);
    expect(cpu.cycles).toBe(0);
  });
  test('ADC_INDIRECT_INDEXED_Y, no page cross', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0;
    cpu.registers.A = 0x3;
    mem.memory[0x0] = OPCODES.ADC_INDIRECT_INDEXED_Y;
    mem.memory[0x1] = 0x10;
    mem.memory[0x10] = 0x00; //wrap
    mem.memory[0x11] = 0x02; //wrap
    mem.memory[0x200] = 0x55;
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.registers.A).toEqual(0x58);
    expect(cpu.cycles).toBe(0);
  });
});
describe('CPU Flag set Tests', () => {
  test('CLC Clears Carry', () => {
    cpu.reset(mem);
    cpu.flags.C = true;
    mem.memory[0x0] = OPCODES.CLC_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.C).toBe(false);
  });
  test('CLD Clears Decimal', () => {
    cpu.reset(mem);
    cpu.flags.D = true;
    mem.memory[0x0] = OPCODES.CLD_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.D).toBe(false);
  });
  test('CLI Clears Interrupt Disable', () => {
    cpu.reset(mem);
    cpu.flags.I = true;
    mem.memory[0x0] = OPCODES.CLI_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.I).toBe(false);
  });
  test('CLV Clears Overflow', () => {
    cpu.reset(mem);
    cpu.flags.V = true;
    mem.memory[0x0] = OPCODES.CLV_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.V).toBe(false);
  });
  test('SEC Sets Carry', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.SEC_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.C).toBe(true);
  });
  test('SEI Sets Interrupt Disable', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.SEI_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.flags.I).toBe(true);
  });
});
describe('CPU DECREMENT & INCREMENT TESTS', () => {
  test('INX_IMPLIED OVERFLOW TEST', () => {
    cpu.reset(mem);
    cpu.registers.X = 0xff;
    mem.memory[0x0] = OPCODES.INX_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.X).toEqual(0x0);
    expect(cpu.flags.Z).toBe(true);
  });
  test('INX_IMPLIED Normal', () => {
    cpu.reset(mem);
    cpu.registers.X = 0xda;
    mem.memory[0x0] = OPCODES.INX_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.X).toEqual(0xdb);
    expect(cpu.flags.Z).toBe(false);
  });
  test('INY_IMPLIED OVERFLOW TEST', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xff;
    mem.memory[0x0] = OPCODES.INY_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.Y).toEqual(0x0);
    expect(cpu.flags.Z).toBe(true);
  });
  test('INY_IMPLIED Normal', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xda;
    mem.memory[0x0] = OPCODES.INY_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.Y).toEqual(0xdb);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEX_IMPLIED UNDERFLOW TEST', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x0;
    mem.memory[0x0] = OPCODES.DEX_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.X).toEqual(0xff);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEX_IMPLIED Normal', () => {
    cpu.reset(mem);
    cpu.registers.X = 0xdc;
    mem.memory[0x0] = OPCODES.DEX_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.X).toEqual(0xdb);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEY_IMPLIED UNDERFLOW TEST', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0x0;
    mem.memory[0x0] = OPCODES.DEY_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.Y).toEqual(0xff);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEY_IMPLIED Normal', () => {
    cpu.reset(mem);
    cpu.registers.Y = 0xdc;
    mem.memory[0x0] = OPCODES.DEY_IMPLIED;
    cpu.cycles = 2;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.Y).toEqual(0xdb);
    expect(cpu.flags.Z).toBe(false);
  });
  test('INC_ABSOLUTE OVERFLOW TEST', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.INC_ABSOLUTE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x12;
    mem.memory[0x1233] = 0xff;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x1233]).toEqual(0x0);
    expect(cpu.flags.Z).toBe(true);
  });
  test('INC_ABSOLUTE Normal', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.INC_ABSOLUTE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x12;
    mem.memory[0x1233] = 0xda;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x1233]).toEqual(0xdb);
    expect(cpu.flags.Z).toBe(false);
  });
  test('INC_ABSOLUTE_X OVERFLOW TEST', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x2;
    mem.memory[0x0] = OPCODES.INC_ABSOLUTE_X;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x12;
    mem.memory[0x1235] = 0xff;
    cpu.cycles = 7;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x1235]).toEqual(0x0);
    expect(cpu.flags.Z).toBe(true);
  });
  test('INC_ABSOLUTE_X Normal', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x4;
    mem.memory[0x0] = OPCODES.INC_ABSOLUTE_X;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x12;
    mem.memory[0x1237] = 0xda;
    cpu.cycles = 7;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x1237]).toEqual(0xdb);
    expect(cpu.flags.Z).toBe(false);
  });
  test('INC_ZEROPAGE OVERFLOW TEST', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.INC_ZEROPAGE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x33] = 0xff;
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x33]).toEqual(0x0);
    expect(cpu.flags.Z).toBe(true);
  });
  test('INC_ZEROPAGE Normal', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.INC_ZEROPAGE;
    mem.memory[0x1] = 0x34;
    mem.memory[0x34] = 0xda;
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x34]).toEqual(0xdb);
    expect(cpu.flags.Z).toBe(false);
  });
  test('INC_ZEROPAGE_X OVERFLOW TEST', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x8;
    mem.memory[0x0] = OPCODES.INC_ZEROPAGE_X;
    mem.memory[0x1] = 0x31;
    mem.memory[0x39] = 0xff;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x39]).toEqual(0x0);
    expect(cpu.flags.Z).toBe(true);
  });
  test('INC_ZEROPAGE_X Normal', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.INC_ZEROPAGE_X;
    mem.memory[0x1] = 0x34;
    mem.memory[0x34] = 0xda;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x34]).toEqual(0xdb);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEC_ABSOLUTE UNDERFLOW TEST', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.DEC_ABSOLUTE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x12;
    mem.memory[0x1233] = 0x0;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x1233]).toEqual(0xff);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEC_ABSOLUTE Normal', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.DEC_ABSOLUTE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x12;
    mem.memory[0x1233] = 0xdb;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x1233]).toEqual(0xda);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEC_ABSOLUTE_X UNDERFLOW TEST', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x2;
    mem.memory[0x0] = OPCODES.DEC_ABSOLUTE_X;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x12;
    mem.memory[0x1235] = 0x0;
    cpu.cycles = 7;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x1235]).toEqual(0xff);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEC_ABSOLUTE_X Normal', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x4;
    mem.memory[0x0] = OPCODES.DEC_ABSOLUTE_X;
    mem.memory[0x1] = 0x33;
    mem.memory[0x2] = 0x12;
    mem.memory[0x1237] = 0xdc;
    cpu.cycles = 7;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x1237]).toEqual(0xdb);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEC_ZEROPAGE UNDERFLOW TEST', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.DEC_ZEROPAGE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x33] = 0x0;
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x33]).toEqual(0xff);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEC_ZEROPAGE Normal', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.DEC_ZEROPAGE;
    mem.memory[0x1] = 0x34;
    mem.memory[0x34] = 0xdc;
    cpu.cycles = 5;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x34]).toEqual(0xdb);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEC_ZEROPAGE_X UNDERFLOW TEST', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x8;
    mem.memory[0x0] = OPCODES.DEC_ZEROPAGE_X;
    mem.memory[0x1] = 0x31;
    mem.memory[0x39] = 0x0;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x39]).toEqual(0xff);
    expect(cpu.flags.Z).toBe(false);
  });
  test('DEC_ZEROPAGE_X Normal', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.DEC_ZEROPAGE_X;
    mem.memory[0x1] = 0x34;
    mem.memory[0x34] = 0xdc;
    cpu.cycles = 6;
    cpu.execute(mem);
    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x34]).toEqual(0xdb);
    expect(cpu.flags.Z).toBe(false);
  });
});
describe('CPU ASL TESTS', () => {
  test('ASL_ACC NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x3;
    mem.memory[0x0] = OPCODES.ASL_ACCUMULATOR;
    cpu.cycles = 2;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.A).toEqual(0x6);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ASL_ACC CARRY', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x85;
    mem.memory[0x0] = OPCODES.ASL_ACCUMULATOR;
    cpu.cycles = 2;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.A).toEqual(0xa);
    expect(cpu.flags.C).toEqual(true);
  });
  test('ASL_ZEROPAGE NO CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.ASL_ZEROPAGE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x69] = 0x9;
    cpu.cycles = 5;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x69]).toEqual(0x12);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ASL_ZEROPAGE CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.ASL_ZEROPAGE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x33] = 0x85;
    cpu.cycles = 5;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x33]).toEqual(0xa);
    expect(cpu.flags.C).toEqual(true);
  });
  test('ASL_ZEROPAGE_X NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x3;
    mem.memory[0x0] = OPCODES.ASL_ZEROPAGE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x6c] = 0x9;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x6c]).toEqual(0x12);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ASL_ZEROPAGE_X CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x5;
    mem.memory[0x0] = OPCODES.ASL_ZEROPAGE_X;
    mem.memory[0x1] = 0x33;
    mem.memory[0x38] = 0x85;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x38]).toEqual(0xa);
    expect(cpu.flags.C).toEqual(true);
  });
  test('ASL_ABSOLUTE NO CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.ASL_ABSOLUTE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x3369] = 0x27;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x3369]).toEqual(0x4e);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ASL_ABSOLUTE CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.ASL_ABSOLUTE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x3369] = 0x91;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x3369]).toEqual(0x22);
    expect(cpu.flags.C).toEqual(true);
  });
  test('ASL_ABSOLUTE_X NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x2;
    mem.memory[0x0] = OPCODES.ASL_ABSOLUTE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x336b] = 0x27;
    cpu.cycles = 7;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x336b]).toEqual(0x4e);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ASL_ABSOLUTE_X CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x2;
    mem.memory[0x0] = OPCODES.ASL_ABSOLUTE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x336b] = 0x91;
    cpu.cycles = 7;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x336b]).toEqual(0x22);
    expect(cpu.flags.C).toEqual(true);
  });
});
describe('CPU LSR TESTS', () => {
  test('LSR_ACC NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x122;
    mem.memory[0x0] = OPCODES.LSR_ACCUMULATOR;
    cpu.cycles = 2;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.A).toEqual(0x91);
    expect(cpu.flags.C).toEqual(false);
  });
  test('LSR_ACC CARRY', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x91;
    mem.memory[0x0] = OPCODES.LSR_ACCUMULATOR;
    cpu.cycles = 2;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.A).toEqual(0x48);
    expect(cpu.flags.C).toEqual(true);
  });
  test('LSR_ZEROPAGE NO CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LSR_ZEROPAGE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x69] = 0x68;
    cpu.cycles = 5;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x69]).toEqual(0x34);
    expect(cpu.flags.C).toEqual(false);
  });
  test('LSR_ZEROPAGE CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LSR_ZEROPAGE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x33] = 0x9;
    cpu.cycles = 5;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x33]).toEqual(0x4);
    expect(cpu.flags.C).toEqual(true);
  });
  test('LSR_ZEROPAGE_X NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x3;
    mem.memory[0x0] = OPCODES.LSR_ZEROPAGE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x6c] = 0x84;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x6c]).toEqual(0x42);
    expect(cpu.flags.C).toEqual(false);
  });
  test('LSR_ZEROPAGE_X CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x5;
    mem.memory[0x0] = OPCODES.LSR_ZEROPAGE_X;
    mem.memory[0x1] = 0x33;
    mem.memory[0x38] = 0x85;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x38]).toEqual(0x42);
    expect(cpu.flags.C).toEqual(true);
  });
  test('LSR_ABSOLUTE NO CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LSR_ABSOLUTE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x3369] = 0x28;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x3369]).toEqual(0x14);
    expect(cpu.flags.C).toEqual(false);
  });
  test('LSR_ABSOLUTE CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.LSR_ABSOLUTE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x3369] = 0x27;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x3369]).toEqual(0x13);
    expect(cpu.flags.C).toEqual(true);
  });
  test('LSR_ABSOLUTE_X NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x2;
    mem.memory[0x0] = OPCODES.LSR_ABSOLUTE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x336b] = 0x44;
    cpu.cycles = 7;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x336b]).toEqual(0x22);
    expect(cpu.flags.C).toEqual(false);
  });
  test('LSR_ABSOLUTE_X CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x2;
    mem.memory[0x0] = OPCODES.LSR_ABSOLUTE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x336b] = 0x45;
    cpu.cycles = 7;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x336b]).toEqual(0x22);
    expect(cpu.flags.C).toEqual(true);
  });
});
describe('CPU ROL TESTS', () => {
  test('ROL_ACC NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x65;
    mem.memory[0x0] = OPCODES.ROL_ACCUMULATOR;
    cpu.cycles = 2;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.A).toEqual(0xca);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROL_ACC CARRY', () => {
    cpu.reset(mem);
    cpu.flags.C = true;
    cpu.registers.A = 0x8;
    mem.memory[0x0] = OPCODES.ROL_ACCUMULATOR;
    cpu.cycles = 2;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.A).toEqual(0x11);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROL_ZEROPAGE NO CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.ROL_ZEROPAGE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x69] = 0x68;
    cpu.cycles = 5;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x69]).toEqual(0xd0);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROL_ZEROPAGE CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.ROL_ZEROPAGE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x33] = 0x82;
    cpu.cycles = 5;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x33]).toEqual(0x4);
    expect(cpu.flags.C).toEqual(true);
  });
  test('ROL_ZEROPAGE_X NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x3;
    mem.memory[0x0] = OPCODES.ROL_ZEROPAGE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x6c] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x6c]).toEqual(0xaa);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROL_ZEROPAGE_X CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x5;
    mem.memory[0x0] = OPCODES.ROL_ZEROPAGE_X;
    mem.memory[0x1] = 0x33;
    mem.memory[0x38] = 0x8a;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x38]).toEqual(0x14);
    expect(cpu.flags.C).toEqual(true);
  });
  test('ROL_ABSOLUTE NO CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.ROL_ABSOLUTE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x3369] = 0x28;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x3369]).toEqual(0x50);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROL_ABSOLUTE CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.ROL_ABSOLUTE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x3369] = 0xa3;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x3369]).toEqual(0x46);
    expect(cpu.flags.C).toEqual(true);
  });
  test('ROL_ABSOLUTE_X NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x2;
    cpu.flags.C = true;
    mem.memory[0x0] = OPCODES.ROL_ABSOLUTE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x336b] = 0x44;
    cpu.cycles = 7;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x336b]).toEqual(0x89);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROL_ABSOLUTE_X CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x2;
    mem.memory[0x0] = OPCODES.ROL_ABSOLUTE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x336b] = 0xbc;
    cpu.cycles = 7;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x336b]).toEqual(0x78);
    expect(cpu.flags.C).toEqual(true);
  });
});
describe('CPU ROR TESTS', () => {
  test('ROR_ACC NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.A = 0x66;
    mem.memory[0x0] = OPCODES.ROR_ACCUMULATOR;
    cpu.cycles = 2;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.A).toEqual(0x33);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROR_ACC CARRY', () => {
    cpu.reset(mem);
    cpu.flags.C = true;
    cpu.registers.A = 0x8;
    mem.memory[0x0] = OPCODES.ROR_ACCUMULATOR;
    cpu.cycles = 2;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(cpu.registers.A).toEqual(0x84);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROR_ZEROPAGE NO CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.ROR_ZEROPAGE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x69] = 0x68;
    cpu.cycles = 5;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x69]).toEqual(0x34);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROR_ZEROPAGE CARRY', () => {
    cpu.reset(mem);
    cpu.flags.C = true;
    mem.memory[0x0] = OPCODES.ROR_ZEROPAGE;
    mem.memory[0x1] = 0x33;
    mem.memory[0x33] = 0x82;
    cpu.cycles = 5;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x33]).toEqual(0xc1);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROR_ZEROPAGE_X NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x3;
    mem.memory[0x0] = OPCODES.ROR_ZEROPAGE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x6c] = 0x55;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x6c]).toEqual(0x2a);
    expect(cpu.flags.C).toEqual(true);
  });
  test('ROR_ZEROPAGE_X CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x5;
    mem.memory[0x0] = OPCODES.ROR_ZEROPAGE_X;
    mem.memory[0x1] = 0x33;
    mem.memory[0x38] = 0x8a;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x38]).toEqual(0x45);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROR_ABSOLUTE NO CARRY', () => {
    cpu.reset(mem);
    mem.memory[0x0] = OPCODES.ROR_ABSOLUTE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x3369] = 0x28;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x3369]).toEqual(0x14);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROR_ABSOLUTE CARRY', () => {
    cpu.reset(mem);
    cpu.flags.C = true;
    mem.memory[0x0] = OPCODES.ROR_ABSOLUTE;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x3369] = 0xa3;
    cpu.cycles = 6;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x3369]).toEqual(0xd1);
    expect(cpu.flags.C).toEqual(true);
  });
  test('ROR_ABSOLUTE_X NO CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x2;
    mem.memory[0x0] = OPCODES.ROR_ABSOLUTE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x336b] = 0x44;
    cpu.cycles = 7;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x336b]).toEqual(0x22);
    expect(cpu.flags.C).toEqual(false);
  });
  test('ROR_ABSOLUTE_X CARRY', () => {
    cpu.reset(mem);
    cpu.registers.X = 0x2;
    cpu.flags.C = true;
    mem.memory[0x0] = OPCODES.ROR_ABSOLUTE_X;
    mem.memory[0x1] = 0x69;
    mem.memory[0x2] = 0x33; //0x3369
    mem.memory[0x336b] = 0xbc;
    cpu.cycles = 7;
    cpu.execute(mem);

    expect(cpu.cycles).toBe(0);
    expect(mem.memory[0x336b]).toEqual(0xde);
    expect(cpu.flags.C).toEqual(false);
  });
});
