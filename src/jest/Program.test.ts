// import { describe, test } from '@jest/globals';
// import { CPU, Memory } from '../cpu/Cpu';

// let cpu = new CPU();
// let mem = new Memory();

// describe.only('Memory', () => {
//   test('memory load', () => {
//     mem.loadProgram('src/cpu/nestest.nes');
//     // console.log(mem.memory);
//     cpu.reset(mem);
//     cpu.PC = 0xc000;
//     cpu.cycles = 10000;
//     console.log(mem.memory[0xc000]);
//     cpu.execute(mem);
//   });
// });
