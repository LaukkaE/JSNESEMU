class Memory {
  memory = new Uint8Array(1024 * 64);

  resetMemory() {
    this.memory = new Uint8Array(1024 * 64).fill(0x00);
  }
  writeVector(vector: number, address: number) {
    this.memory[address] = vector & 0xff;
    this.memory[address + 1] = vector >> 8;
  }
  writeByte(address: number, value: number) {
    this.memory[address] = value;
  }
}

enum OPCODES { //num of Cycles
  // ADC - Add with Carry
  ADC_IMMEDIATE = 0x69, //2
  ADC_ZEROPAGE = 0x65, //3
  ADC_ZEROPAGE_X = 0x75, //4
  ADC_ABSOLUTE = 0x6d, //4
  ADC_ABSOLUTE_X = 0x7d, //4 + 1
  ADC_ABSOLUTE_Y = 0x79, //4 + 1
  ADC_INDEXED_INDIRECT_X = 0x61, //6
  ADC_INDIRECT_INDEXED_Y = 0x71, //5 + 1
  // LDA - Load Accumulator
  LDA_IMMEDIATE = 0xa9, //2
  LDA_ZEROPAGE = 0xa5, //3
  LDA_ZEROPAGE_X = 0xb5, //4
  LDA_ABSOLUTE = 0xad, //4
  LDA_ABSOLUTE_X = 0xbd, //4 + 1
  LDA_ABSOLUTE_Y = 0xb9, //4 + 1
  LDA_INDEXED_INDIRECT_X = 0xa1, //6
  LDA_INDIRECT_INDEXED_Y = 0xb1, //4 + 1
  //LDX - Load X Register
  LDX_IMMEDIATE = 0xa2, //2
  LDX_ZEROPAGE = 0xa6, //3
  LDX_ZEROPAGE_Y = 0xb6, //4
  LDX_ABSOLUTE = 0xae, //4
  LDX_ABSOLUTE_Y = 0xbe, //4 + 1
  //LDY - Load Y Register
  LDY_IMMEDIATE = 0xa0, //2
  LDY_ZEROPAGE = 0xa4, //3
  LDY_ZEROPAGE_X = 0xb4, //4
  LDY_ABSOLUTE = 0xac, //4
  LDY_ABSOLUTE_X = 0xbc, //4 + 1
  //STA - Store Accumulator
  STA_ZEROPAGE = 0x85, //3
  STA_ZEROPAGE_X = 0x95, //4
  STA_ABSOLUTE = 0x8d, //4
  STA_ABSOLUTE_X = 0x9d, //5
  STA_ABSOLUTE_Y = 0x99, //5
  STA_INDEXED_INDIRECT_X = 0x81, //6
  STA_INDIRECT_INDEXED_Y = 0x91, //6
  //STX - Store X Register
  STX_ZEROPAGE = 0x86, //3
  STX_ZEROPAGE_Y = 0x96, //4
  STX_ABSOLUTE = 0x8e, //4
  //STY - Store Y Register
  STY_ZEROPAGE = 0x84, //3
  STY_ZEROPAGE_X = 0x94, //4
  STY_ABSOLUTE = 0x8c, //4
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
    D: false, //Decimal Mode (Tää on disabled NES:issä)
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
    memory.resetMemory();
    this.PC = memory.memory[0xfffc] | (memory.memory[0xfffd] << 8); //  resetissä lue fffc ja fffd combinee ja laita pc. eli 0x10 + 0x42 : pc = 0x4210, tyhjällä muistilla aina 0x0
    this.SP = 0xff;
    this.clearFlags();
    this.clearRegisters();
  }

  getByte(memory: Memory) {
    // fetch byte from mem using PC, takes 1 cycle
    let byte = memory.memory[this.PC];
    this.PC++;
    this.cycles--;
    return byte;
  }
  getVector(memory: Memory) {
    //fetch 16 bit vector from mem, takes 2 cycles
    let firstByte = memory.memory[this.PC];
    this.PC++;
    let secondByte = memory.memory[this.PC];
    this.PC++;
    this.cycles -= 2;
    return firstByte | (secondByte << 8);
  }
  readVector(memory: Memory, address: number) {
    //read 16 bit vector from mem, takes 2 cycles
    let firstByte = memory.memory[address];
    let secondByte = memory.memory[address + 1];

    this.cycles -= 2;
    return firstByte | (secondByte << 8);
  }

  readByte(memory: Memory, address: number) {
    // read byte from mem, takes 1 cycle,
    let byte = memory.memory[address];
    this.cycles--;
    return byte;
  }
  setLDflags(register: number) {
    this.flags.Z = register === 0;
    this.flags.N = (register & 0b100000000) > 0; //untested
  }
  zeroPageWrappingCheck(zeroPageAddress: number, Xregister: number) {
    //jos x + address menee yli zero pagen, niin wrapataan ympäri eikä mennä seuraavalle sivulle
    return (zeroPageAddress + Xregister) & 0xff;
  }
  pageCrossBoundaryCheck(address: number, secondAddress: number) {
    //muisti"page" vaihtuu 256 byten välein, jos page vaihtuu kun muistipaikkaan lisätään X tai Y, kuluu ylimääräinen cycle
    if ((secondAddress & 0xff00) !== (address & 0xff00)) {
      this.cycles--;
    }
  }

  execute(memory: Memory) {
    while (this.cycles > 0) {
      let opcode = this.getByte(memory); //1 cycle
      switch (opcode) {
        //LDA INSTRUCTIONS
        case OPCODES.LDA_IMMEDIATE: {
          //2 cycles
          let data = this.getByte(memory);
          this.registers.A = data;
          this.setLDflags(this.registers.A);
          break;
        }
        case OPCODES.LDA_ZEROPAGE: {
          //3 cycles
          let ZeroPageAddress = this.getByte(memory);
          this.registers.A = this.readByte(memory, ZeroPageAddress);
          this.setLDflags(this.registers.A);
          break;
        }
        case OPCODES.LDA_ZEROPAGE_X: {
          //4 cycles
          let ZeroPageAddress = this.getByte(memory);
          let ZeroPageAddressX = this.zeroPageWrappingCheck(
            ZeroPageAddress,
            this.registers.X
          );
          this.registers.A = this.readByte(memory, ZeroPageAddressX);
          this.cycles--;
          this.setLDflags(this.registers.A);
          break;
        }
        case OPCODES.LDA_ABSOLUTE: {
          //4 cycles
          let address = this.getVector(memory);
          this.registers.A = this.readByte(memory, address);
          this.setLDflags(this.registers.A);
          break;
        }
        case OPCODES.LDA_ABSOLUTE_X: {
          //4 + 1 cycles
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          this.pageCrossBoundaryCheck(addressX, address);
          this.registers.A = this.readByte(memory, addressX);
          this.setLDflags(this.registers.A);
          break;
        }
        case OPCODES.LDA_ABSOLUTE_Y: {
          //4 + 1 cycles
          let address = this.getVector(memory);
          let addressY = address + this.registers.Y;
          this.pageCrossBoundaryCheck(addressY, address);
          this.registers.A = this.readByte(memory, addressY);
          this.setLDflags(this.registers.A);
          break;
        }
        case OPCODES.LDA_INDEXED_INDIRECT_X: {
          //6 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let vector = this.readVector(memory, zeroPageAddressX);
          this.registers.A = this.readByte(memory, vector);
          this.setLDflags(this.registers.A);
          this.cycles -= 1;
          break;
        }
        case OPCODES.LDA_INDIRECT_INDEXED_Y: {
          //5 + 1 cycles
          let zeroPageAddress = this.getByte(memory);
          let vector = this.readVector(memory, zeroPageAddress);
          let vectorY = vector + this.registers.Y;
          this.pageCrossBoundaryCheck(vectorY, vector);
          this.registers.A = this.readByte(memory, vectorY);
          this.setLDflags(this.registers.A);
          break;
        }
        //LDX INSTRUCTIONS
        case OPCODES.LDX_IMMEDIATE: {
          //2 cycles
          let data = this.getByte(memory);
          this.registers.X = data;
          this.setLDflags(this.registers.X);
          break;
        }
        case OPCODES.LDX_ZEROPAGE: {
          //3 cycles
          let ZeroPageAddress = this.getByte(memory);
          this.registers.X = this.readByte(memory, ZeroPageAddress);
          this.setLDflags(this.registers.X);
          break;
        }
        case OPCODES.LDX_ZEROPAGE_Y: {
          //4 cycles
          let ZeroPageAddress = this.getByte(memory);
          let ZeroPageAddressY = this.zeroPageWrappingCheck(
            ZeroPageAddress,
            this.registers.Y
          );
          this.registers.X = this.readByte(memory, ZeroPageAddressY);
          this.cycles--;
          this.setLDflags(this.registers.X);
          break;
        }
        case OPCODES.LDX_ABSOLUTE: {
          //4 cycles
          let address = this.getVector(memory);
          this.registers.X = this.readByte(memory, address);
          this.setLDflags(this.registers.X);
          break;
        }
        case OPCODES.LDX_ABSOLUTE_Y: {
          //4 + 1 cycles
          let address = this.getVector(memory);
          let addressY = address + this.registers.Y;
          this.pageCrossBoundaryCheck(addressY, address);
          this.registers.X = this.readByte(memory, addressY);
          this.setLDflags(this.registers.X);
          break;
        }
        //LDY INSTRUCTIONS
        case OPCODES.LDY_IMMEDIATE: {
          //2 cycles
          let data = this.getByte(memory);
          this.registers.Y = data;
          this.setLDflags(this.registers.Y);
          break;
        }
        case OPCODES.LDY_ZEROPAGE: {
          //3 cycles
          let ZeroPageAddress = this.getByte(memory);
          this.registers.Y = this.readByte(memory, ZeroPageAddress);
          this.setLDflags(this.registers.Y);
          break;
        }
        case OPCODES.LDY_ZEROPAGE_X: {
          //4 cycles
          let ZeroPageAddress = this.getByte(memory);
          let ZeroPageAddressX = this.zeroPageWrappingCheck(
            ZeroPageAddress,
            this.registers.X
          );
          this.registers.Y = this.readByte(memory, ZeroPageAddressX);
          this.cycles--;
          this.setLDflags(this.registers.Y);
          break;
        }
        case OPCODES.LDY_ABSOLUTE: {
          //4 cycles
          let address = this.getVector(memory);
          this.registers.Y = this.readByte(memory, address);
          this.setLDflags(this.registers.Y);
          break;
        }
        case OPCODES.LDY_ABSOLUTE_X: {
          //4 + 1 cycles
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          this.pageCrossBoundaryCheck(addressX, address);
          this.registers.Y = this.readByte(memory, addressX);
          this.setLDflags(this.registers.Y);
          break;
        }
        //STA INSTRUCTIONS
        case OPCODES.STA_ZEROPAGE: {
          //3 cycles
          let ZeroPageAddress = this.getByte(memory);
          memory.writeByte(ZeroPageAddress, this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.STA_ZEROPAGE_X: {
          //4 cycles
          let ZeroPageAddress = this.getByte(memory);
          let ZeroPageAddressX = this.zeroPageWrappingCheck(
            ZeroPageAddress,
            this.registers.X
          );
          memory.writeByte(ZeroPageAddressX, this.registers.A);
          this.cycles -= 2;
          break;
        }
        case OPCODES.STA_ABSOLUTE: {
          //4 cycles
          let address = this.getVector(memory);
          memory.writeByte(address, this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.STA_ABSOLUTE_X: {
          //5 cycles
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          // this.pageCrossBoundaryCheck(addressX, address);
          memory.writeByte(addressX, this.registers.A);
          this.cycles -= 2;
          break;
        }
        case OPCODES.STA_ABSOLUTE_Y: {
          //5 cycles
          let address = this.getVector(memory);
          let addressY = address + this.registers.Y;
          // this.pageCrossBoundaryCheck(addressX, address);
          memory.writeByte(addressY, this.registers.A);
          this.cycles -= 2;
          break;
        }
        case OPCODES.STA_INDEXED_INDIRECT_X: {
          //6 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let vector = this.readVector(memory, zeroPageAddressX);
          memory.writeByte(vector, this.registers.A);
          this.cycles -= 2;
          break;
        }
        case OPCODES.STA_INDIRECT_INDEXED_Y: {
          //6
          let zeroPageAddress = this.getByte(memory);
          let vector = this.readVector(memory, zeroPageAddress);
          let vectorY = vector + this.registers.Y;
          // this.pageCrossBoundaryCheck(vectorY, vector);
          memory.writeByte(vectorY, this.registers.A);
          this.cycles -= 2;
          break;
        }
        //STX INSTRUCTIONS
        case OPCODES.STX_ZEROPAGE: {
          //3 cycles
          let ZeroPageAddress = this.getByte(memory);
          memory.writeByte(ZeroPageAddress, this.registers.X);
          this.cycles--;
          break;
        }
        case OPCODES.STX_ZEROPAGE_Y: {
          //4 cycles
          let ZeroPageAddress = this.getByte(memory);
          let ZeroPageAddressY = this.zeroPageWrappingCheck(
            ZeroPageAddress,
            this.registers.Y
          );
          memory.writeByte(ZeroPageAddressY, this.registers.X);
          this.cycles -= 2;
          break;
        }
        case OPCODES.STX_ABSOLUTE: {
          //4 cycles
          let address = this.getVector(memory);
          memory.writeByte(address, this.registers.X);
          this.cycles--;
          break;
        }
        //STY INSTRUCTIONS
        case OPCODES.STY_ZEROPAGE: {
          //3 cycles
          let ZeroPageAddress = this.getByte(memory);
          memory.writeByte(ZeroPageAddress, this.registers.Y);
          this.cycles--;
          break;
        }
        case OPCODES.STY_ZEROPAGE_X: {
          //4 cycles
          let ZeroPageAddress = this.getByte(memory);
          let ZeroPageAddressX = this.zeroPageWrappingCheck(
            ZeroPageAddress,
            this.registers.X
          );
          memory.writeByte(ZeroPageAddressX, this.registers.Y);
          this.cycles -= 2;
          break;
        }
        case OPCODES.STY_ABSOLUTE: {
          //4 cycles
          let address = this.getVector(memory);
          memory.writeByte(address, this.registers.Y);
          this.cycles--;
          break;
        }

        case OPCODES.JSR_ABSOLUTE: {
          //6 cycles
          let jumpAddress = this.getVector(memory);
          memory.writeVector(this.PC - 1, this.SP);
          this.SP--;
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
