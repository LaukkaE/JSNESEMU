class Memory {
  memory = new Uint8Array(1024 * 64);

  resetMemory() {
    this.memory = new Uint8Array(1024 * 64).fill(0x00);
  }
  writeWord(word: number, address: number) {
    this.memory[address] = word & 0xff;
    this.memory[address + 1] = word >> 8;
  }
}

enum OPCODES { //num of Cycles
  // LDA - Load Accumulator
  LDA_IMMEDIATE = 0xa9, //2
  LDA_ZEROPAGE = 0xa5, //3
  LDA_ZEROPAGE_X = 0xb5, //4
  LDA_ABSOLUTE = 0xad, //4
  LDA_ABSOLUTE_X = 0xbd, //4 + 1
  LDA_ABSOLUTE_Y = 0xb9, //4 + 1
  LDA_INDIRECT_X = 0xa1, //6
  LDA_INDIRECT_Y = 0xb1, //4 + 1

  //JSR - Jump to Subroutine
  JSR_ABSOLUTE = 0x20, //6
}

class CPU {
  cycles = 0; //Ticks
  PC = 0x00; //Program counter
  SP = 0; //Stack pointer
  registers = {
    A: 0, //Accumulator
    X: 0, //Index X
    Y: 0, //Index Y
  };
  flags = {
    C: false, //Carry
    Z: false, //Zero
    I: false, //Interrupt Disable
    D: false, //Decimal Mode
    B: false, //Break Command
    V: false, //Overflow
    N: false, //Negative
  };

  clearFlags() {
    this.flags.C = false;
    this.flags.Z = false;
    this.flags.I = false;
    this.flags.D = false;
    this.flags.B = false;
    this.flags.V = false;
    this.flags.N = false;
  }
  clearRegisters() {
    this.registers.A = 0;
    this.registers.X = 0;
    this.registers.Y = 0;
  }

  reset(memory: Memory) {
    this.PC = 0xfffc;
    this.SP = 0xff;
    this.clearFlags();
    this.clearRegisters();
    memory.resetMemory();
  }

  getByte(memory: Memory) {
    // fetch byte from mem using PC, takes 1 cycle
    let byte = memory.memory[this.PC];
    this.PC++;
    this.cycles--;
    return byte;
  }
  getWord(memory: Memory) {
    //fetch 16 bit word from mem, takes 2 cycles
    let data = memory.memory[this.PC];
    console.log('first', memory.memory[this.PC]);
    this.PC++;

    data |= memory.memory[this.PC] << 8;
    console.log('second', memory.memory[this.PC]);
    console.log('combined', data);
    this.PC++;
    this.cycles -= 2;
    return data;
  }

  readByte(memory: Memory, address: number) {
    // read byte from mem, takes 1 cycle,
    let byte = memory.memory[address];
    this.cycles--;
    return byte;
  }
  setLDAflags() {
    this.flags.Z = this.registers.A === 0;
    this.flags.N = (this.registers.A & 0b100000000) > 0; //untested
  }

  execute(memory: Memory) {
    while (this.cycles > 0) {
      let opcode = this.getByte(memory); //takes one cycle
      switch (opcode) {
        case OPCODES.LDA_IMMEDIATE: {
          //2 cycles
          let data = this.getByte(memory);
          this.registers.A = data;
          this.setLDAflags();
          break;
        }
        case OPCODES.LDA_ZEROPAGE: {
          //3 cycles
          let ZeroPageAddress = this.getByte(memory);
          this.registers.A = this.readByte(memory, ZeroPageAddress);
          this.setLDAflags();
          break;
        }
        case OPCODES.LDA_ZEROPAGE_X: {
          //4 cycles
          let ZeroPageAddress = this.getByte(memory);
          this.registers.A = this.readByte(
            memory,
            ZeroPageAddress + this.registers.X
          );
          this.cycles--;
          this.setLDAflags();
          break;
        }
        case OPCODES.LDA_ABSOLUTE: {
          //4 cycles
          let address = this.getWord(memory);
          console.log(address);
          this.registers.A = this.readByte(memory, address);
          this.setLDAflags();
          break;
        }
        case OPCODES.JSR_ABSOLUTE: {
          //6 cycles
          let jumpAddress = this.getWord(memory);
          memory.writeWord(this.PC - 1, this.SP);
          this.SP++;
          this.PC = jumpAddress;
          this.cycles -= 3;
          break;
        }
        default:
          throw `unimplemented opcode ${opcode} at PC ${this.PC - 1}`;
      }
    }
  }
}
export { CPU, Memory, OPCODES };
// let cpu = new CPU();
// let mem = new Memory();
// cpu.reset(mem);
// mem.memory[0xfffc] = OPCODES.LDA_ZEROPAGE;
// mem.memory[0xfffc + 1] = 0x42;
// mem.memory[0x0042] = 0x84;
// cpu.cycles = 3;

// cpu.execute(mem);
// console.log(cpu.registers.A);
