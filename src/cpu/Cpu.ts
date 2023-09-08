class Memory {
  memory = new Uint8Array(1024 * 64);

  resetMemory() {
    this.memory = new Uint8Array(1024 * 64).fill(0x00);
  }
  writeVector(vector: number, address: number) {
    this.memory[address - 1] = vector & 0xff;
    this.memory[address] = vector >> 8;
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
  // AND - Logical AND
  AND_IMMEDIATE = 0x29, //2
  AND_ZEROPAGE = 0x25, //3
  AND_ZEROPAGE_X = 0x35, //4
  AND_ABSOLUTE = 0x2d, //4
  AND_ABSOLUTE_X = 0x3d, //4 + 1
  AND_ABSOLUTE_Y = 0x39, //4 + 1
  AND_INDEXED_INDIRECT_X = 0x21, //6
  AND_INDIRECT_INDEXED_Y = 0x31, // 5 + 1
  //ASL - Arithmetic Shift Left
  ASL_ACCUMULATOR = 0x0a, //2
  ASL_ZEROPAGE = 0x06, //5
  ASL_ZEROPAGE_X = 0x16, //6
  ASL_ABSOLUTE = 0x0e, //6
  ASL_ABSOLUTE_X = 0x1e, //7
  // LSR - Logical Shift Right
  LSR_ACCUMULATOR = 0x4a, //2
  LSR_ZEROPAGE = 0x46, //5
  LSR_ZEROPAGE_X = 0x56, //6
  LSR_ABSOLUTE = 0x4e, //6
  LSR_ABSOLUTE_X = 0x5e, //7
  // ROL - Rotate Left
  ROL_ACCUMULATOR = 0x2a, //2
  ROL_ZEROPAGE = 0x26, //5
  ROL_ZEROPAGE_X = 0x36, //6
  ROL_ABSOLUTE = 0x2e, //6
  ROL_ABSOLUTE_X = 0x3e, //7
  // ROR - Rotate Right
  ROR_ACCUMULATOR = 0x6a, //2
  ROR_ZEROPAGE = 0x66, //5
  ROR_ZEROPAGE_X = 0x76, //6
  ROR_ABSOLUTE = 0x6e, //6
  ROR_ABSOLUTE_X = 0x7e, //7
  // EOR - Exclusive OR
  EOR_IMMEDIATE = 0x49, //2
  EOR_ZEROPAGE = 0x45, //3
  EOR_ZEROPAGE_X = 0x55, //4
  EOR_ABSOLUTE = 0x4d, //4
  EOR_ABSOLUTE_X = 0x5d, //4 + 1
  EOR_ABSOLUTE_Y = 0x59, //4 + 1
  EOR_INDEXED_INDIRECT_X = 0x41, //6
  EOR_INDIRECT_INDEXED_Y = 0x51, // 5 + 1
  // ORA - INCLUSIVE OR
  ORA_IMMEDIATE = 0x09, //2
  ORA_ZEROPAGE = 0x05, //3
  ORA_ZEROPAGE_X = 0x15, //4
  ORA_ABSOLUTE = 0x0d, //4
  ORA_ABSOLUTE_X = 0x1d, //4 + 1
  ORA_ABSOLUTE_Y = 0x19, //4 + 1
  ORA_INDEXED_INDIRECT_X = 0x01, //6
  ORA_INDIRECT_INDEXED_Y = 0x11, // 5 + 1
  // Increments & Decrements
  INX_IMPLIED = 0xe8, //2
  INY_IMPLIED = 0xc8, //2
  DEX_IMPLIED = 0xca, //2
  DEY_IMPLIED = 0x88, //2
  INC_ZEROPAGE = 0xe6, //5
  INC_ZEROPAGE_X = 0xf6, //6
  INC_ABSOLUTE = 0xee, //6
  INC_ABSOLUTE_X = 0xfe, //7
  DEC_ZEROPAGE = 0xc6, //5
  DEC_ZEROPAGE_X = 0xd6, //6
  DEC_ABSOLUTE = 0xce, //6
  DEC_ABSOLUTE_X = 0xde, //7

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
  //Register & Stack Transfers
  TAX_IMPLIED = 0xaa, //2
  TAY_IMPLIED = 0xa8, //2
  TSX_IMPLIED = 0xba, //2
  TXA_IMPLIED = 0x8a, //2
  TXS_IMPLIED = 0x9a, //2
  TYA_IMPLIED = 0x98, //2
  //STATUS FLAG CHANGES
  CLC_IMPLIED = 0x18, //2
  CLD_IMPLIED = 0xd8, //2 DECIMAL MODE DISABLE
  CLI_IMPLIED = 0x58, //2
  CLV_IMPLIED = 0xb8, //2
  SEC_IMPLIED = 0x38, //2
  // SED_IMPLIED = 0xf8, //2 DECIMAL MODE ENABLE - Decimal mode is not available in NES
  SEI_IMPLIED = 0x78, //2
  //JSR - Jump to Subroutine & RTS - Return from Subroutine & JMP - Jump
  JSR_ABSOLUTE = 0x20, //6
  RTS_IMPLIED = 0x60, //6
  JMP_ABSOLUTE = 0x4c, //3
  JMP_INDIRECT = 0x6c, //6
}

class CPU {
  cycles = 0; //Ticks to be computed
  PC = 0x0000; //Program counter
  SP = 0x00; //Stack pointer
  registers = {
    A: 0, //Accumulator
    X: 0, //Index X
    Y: 0, //Index Y
  };
  flags = {
    C: false, //Carry
    Z: false, //Zero
    I: false, //Interrupt Disable
    D: false, //Decimal Mode (disabled in NES)
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
    this.cycles = 0;
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
  setZeroAndNegativeFlags(register: number) {
    this.flags.Z = register === 0;
    this.flags.N = ((register >> 7) & 1) > 0; //TODO CHECK
  }

  //Function For Left Shift
  setASLFlagsAndReturnValue(value: number) {
    let result = value << 1;
    let finalValue = result & 0xff;
    this.flags.Z = finalValue === 0;
    this.flags.C = (result & 0xff00) > 0;
    this.flags.N = ((finalValue >> 7) & 1) > 0;
    return finalValue;
  }

  //Function For Right Shift
  setLSRFlagsAndReturnValue(value: number) {
    let result = value >> 1;
    result &= 0xff;
    this.flags.Z = result === 0;
    this.flags.C = (value & 0x01) > 0;
    this.flags.N = ((result >> 7) & 1) > 0;
    return result;
  }

  //Function for Rotate Left
  setROLFlagsAndReturnValue(value: number) {
    let result = value << 1; //shift bits to left
    result &= 0xff; //cull overflow
    result |= +this.flags.C; //add Carry
    this.flags.Z = result === 0;
    this.flags.C = (value & 0x80) > 0; //Carry is set to old bit 7
    this.flags.N = ((result >> 7) & 1) > 0;
    return result;
  }
  //Function for Rotate Right
  setRORFlagsAndReturnValue(value: number) {
    let result = value >> 1; //shift bits to right
    // result &= 0xff;
    result |= +this.flags.C << 7; //add Carry as the most significant bit
    this.flags.Z = result === 0;
    this.flags.C = (value & 0x01) > 0; //Carry is set to old bit 0
    this.flags.N = ((result >> 7) & 1) > 0;
    return result;
  }
  setADCRegisterAndFlags(value: number) {
    let ABefore = this.registers.A;
    let sumofAddition = value + this.registers.A + +this.flags.C;
    this.registers.A = sumofAddition & 0xff;
    this.flags.Z = this.registers.A === 0;
    this.flags.N = ((this.registers.A >> 7) & 1) > 0;
    this.flags.C = (sumofAddition & 0xff00) > 0;
    this.flags.V =
      ((ABefore ^ sumofAddition) & (value ^ sumofAddition) & 0x80) > 0; //When adding two signed numbers results in > 127 ($7F) or < -128 ($80), V is set
  }
  zeroPageWrappingCheck(zeroPageAddress: number, Xregister: number) {
    //Zero page ends at 0xff, wrap if overflow instead of exiting zero page
    return (zeroPageAddress + Xregister) & 0xff;
  }
  pageCrossBoundaryCheck(address: number, secondAddress: number) {
    //6502 Spends an extra cycle if memory "page" switches
    if ((secondAddress & 0xff00) !== (address & 0xff00)) {
      this.cycles--;
    }
  }

  execute(memory: Memory) {
    while (this.cycles > 0) {
      let opcode = this.getByte(memory); //1 cycle
      switch (opcode) {
        //ADC INSTRUCTIONS
        case OPCODES.ADC_IMMEDIATE: {
          let value = this.getByte(memory);
          this.setADCRegisterAndFlags(value);
          break;
        }
        case OPCODES.ADC_ZEROPAGE: {
          let zeroPageAddress = this.getByte(memory);
          let value = this.readByte(memory, zeroPageAddress);
          this.setADCRegisterAndFlags(value);
          break;
        }
        case OPCODES.ADC_ZEROPAGE_X: {
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let value = this.readByte(memory, zeroPageAddressX);
          this.setADCRegisterAndFlags(value);
          this.cycles--;
          break;
        }
        case OPCODES.ADC_ABSOLUTE: {
          let absoluteAddress = this.getVector(memory);
          let value = this.readByte(memory, absoluteAddress);
          this.setADCRegisterAndFlags(value);
          break;
        }
        case OPCODES.ADC_ABSOLUTE_X: {
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          this.pageCrossBoundaryCheck(addressX, address);
          let value = this.readByte(memory, addressX);
          this.setADCRegisterAndFlags(value);
          break;
        }
        case OPCODES.ADC_ABSOLUTE_Y: {
          let address = this.getVector(memory);
          let addressY = address + this.registers.Y;
          this.pageCrossBoundaryCheck(addressY, address);
          let value = this.readByte(memory, addressY);
          this.setADCRegisterAndFlags(value);
          break;
        }
        case OPCODES.ADC_INDEXED_INDIRECT_X: {
          //6 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let vector = this.readVector(memory, zeroPageAddressX);
          let value = this.readByte(memory, vector);
          this.setADCRegisterAndFlags(value);
          this.cycles -= 1;
          break;
        }
        case OPCODES.ADC_INDIRECT_INDEXED_Y: {
          //5 + 1 cycles
          let zeroPageAddress = this.getByte(memory);
          let vector = this.readVector(memory, zeroPageAddress);
          let vectorY = vector + this.registers.Y;
          this.pageCrossBoundaryCheck(vectorY, vector);
          let value = this.readByte(memory, vectorY);
          this.setADCRegisterAndFlags(value);
          break;
        }
        //AND INSTRUCTIONS
        case OPCODES.AND_IMMEDIATE: {
          let value = this.getByte(memory);
          this.registers.A &= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.AND_ZEROPAGE: {
          let zeroPageAddress = this.getByte(memory);
          let value = this.readByte(memory, zeroPageAddress);
          this.registers.A &= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.AND_ZEROPAGE_X: {
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let value = this.readByte(memory, zeroPageAddressX);
          this.registers.A &= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.AND_ABSOLUTE: {
          let absoluteAddress = this.getVector(memory);
          let value = this.readByte(memory, absoluteAddress);
          this.registers.A &= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.AND_ABSOLUTE_X: {
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          this.pageCrossBoundaryCheck(addressX, address);
          let value = this.readByte(memory, addressX);
          this.registers.A &= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.AND_ABSOLUTE_Y: {
          let address = this.getVector(memory);
          let addressY = address + this.registers.Y;
          this.pageCrossBoundaryCheck(addressY, address);
          let value = this.readByte(memory, addressY);
          this.registers.A &= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.AND_INDEXED_INDIRECT_X: {
          //6 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let vector = this.readVector(memory, zeroPageAddressX);
          let value = this.readByte(memory, vector);
          this.registers.A &= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          this.cycles -= 1;
          break;
        }
        case OPCODES.AND_INDIRECT_INDEXED_Y: {
          //5 + 1 cycles
          let zeroPageAddress = this.getByte(memory);
          let vector = this.readVector(memory, zeroPageAddress);
          let vectorY = vector + this.registers.Y;
          this.pageCrossBoundaryCheck(vectorY, vector);
          let value = this.readByte(memory, vectorY);
          this.registers.A &= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        //ASL INSTRUCTIONS
        case OPCODES.ASL_ACCUMULATOR: {
          this.registers.A = this.setASLFlagsAndReturnValue(this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.ASL_ZEROPAGE: {
          let zeroPageAddress = this.getByte(memory);
          let value = this.readByte(memory, zeroPageAddress);
          value = this.setASLFlagsAndReturnValue(value);
          memory.writeByte(zeroPageAddress, value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.ASL_ZEROPAGE_X: {
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let value = this.readByte(memory, zeroPageAddressX);
          value = this.setASLFlagsAndReturnValue(value);
          memory.writeByte(zeroPageAddressX, value);
          this.cycles -= 3;
          break;
        }
        case OPCODES.ASL_ABSOLUTE: {
          let absoluteAddress = this.getVector(memory);
          let value = this.readByte(memory, absoluteAddress);
          value = this.setASLFlagsAndReturnValue(value);
          memory.writeByte(absoluteAddress, value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.ASL_ABSOLUTE_X: {
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          //No page cross check, always 7 cycles
          let value = this.readByte(memory, addressX);
          value = this.setASLFlagsAndReturnValue(value);
          memory.writeByte(addressX, value);
          this.cycles -= 3;
          break;
        }
        //LSR INSTRUCTIONS
        case OPCODES.LSR_ACCUMULATOR: {
          this.registers.A = this.setLSRFlagsAndReturnValue(this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.LSR_ZEROPAGE: {
          let zeroPageAddress = this.getByte(memory);
          let value = this.readByte(memory, zeroPageAddress);
          value = this.setLSRFlagsAndReturnValue(value);
          memory.writeByte(zeroPageAddress, value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.LSR_ZEROPAGE_X: {
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let value = this.readByte(memory, zeroPageAddressX);
          value = this.setLSRFlagsAndReturnValue(value);
          memory.writeByte(zeroPageAddressX, value);
          this.cycles -= 3;
          break;
        }
        case OPCODES.LSR_ABSOLUTE: {
          let absoluteAddress = this.getVector(memory);
          let value = this.readByte(memory, absoluteAddress);
          value = this.setLSRFlagsAndReturnValue(value);
          memory.writeByte(absoluteAddress, value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.LSR_ABSOLUTE_X: {
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          //No page cross check, always 7 cycles
          let value = this.readByte(memory, addressX);
          value = this.setLSRFlagsAndReturnValue(value);
          memory.writeByte(addressX, value);
          this.cycles -= 3;
          break;
        }
        //ROL INSTRUCTIONS
        case OPCODES.ROL_ACCUMULATOR: {
          this.registers.A = this.setROLFlagsAndReturnValue(this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.ROL_ZEROPAGE: {
          let zeroPageAddress = this.getByte(memory);
          let value = this.readByte(memory, zeroPageAddress);
          value = this.setROLFlagsAndReturnValue(value);
          memory.writeByte(zeroPageAddress, value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.ROL_ZEROPAGE_X: {
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let value = this.readByte(memory, zeroPageAddressX);
          value = this.setROLFlagsAndReturnValue(value);
          memory.writeByte(zeroPageAddressX, value);
          this.cycles -= 3;
          break;
        }
        case OPCODES.ROL_ABSOLUTE: {
          let absoluteAddress = this.getVector(memory);
          let value = this.readByte(memory, absoluteAddress);
          value = this.setROLFlagsAndReturnValue(value);
          memory.writeByte(absoluteAddress, value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.ROL_ABSOLUTE_X: {
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          //No page cross check, always 7 cycles
          let value = this.readByte(memory, addressX);
          value = this.setROLFlagsAndReturnValue(value);
          memory.writeByte(addressX, value);
          this.cycles -= 3;
          break;
        }
        //ROR INSTRUCTIONS
        case OPCODES.ROR_ACCUMULATOR: {
          this.registers.A = this.setRORFlagsAndReturnValue(this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.ROR_ZEROPAGE: {
          let zeroPageAddress = this.getByte(memory);
          let value = this.readByte(memory, zeroPageAddress);
          value = this.setRORFlagsAndReturnValue(value);
          memory.writeByte(zeroPageAddress, value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.ROR_ZEROPAGE_X: {
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let value = this.readByte(memory, zeroPageAddressX);
          value = this.setRORFlagsAndReturnValue(value);
          memory.writeByte(zeroPageAddressX, value);
          this.cycles -= 3;
          break;
        }
        case OPCODES.ROR_ABSOLUTE: {
          let absoluteAddress = this.getVector(memory);
          let value = this.readByte(memory, absoluteAddress);
          value = this.setRORFlagsAndReturnValue(value);
          memory.writeByte(absoluteAddress, value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.ROR_ABSOLUTE_X: {
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          //No page cross check, always 7 cycles
          let value = this.readByte(memory, addressX);
          value = this.setRORFlagsAndReturnValue(value);
          memory.writeByte(addressX, value);
          this.cycles -= 3;
          break;
        }

        //EOR INSTRUCTIONS
        case OPCODES.EOR_IMMEDIATE: {
          let value = this.getByte(memory);
          this.registers.A ^= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.EOR_ZEROPAGE: {
          let zeroPageAddress = this.getByte(memory);
          let value = this.readByte(memory, zeroPageAddress);
          this.registers.A ^= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.EOR_ZEROPAGE_X: {
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let value = this.readByte(memory, zeroPageAddressX);
          this.registers.A ^= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.EOR_ABSOLUTE: {
          let absoluteAddress = this.getVector(memory);
          let value = this.readByte(memory, absoluteAddress);
          this.registers.A ^= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.EOR_ABSOLUTE_X: {
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          this.pageCrossBoundaryCheck(addressX, address);
          let value = this.readByte(memory, addressX);
          this.registers.A ^= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.EOR_ABSOLUTE_Y: {
          let address = this.getVector(memory);
          let addressY = address + this.registers.Y;
          this.pageCrossBoundaryCheck(addressY, address);
          let value = this.readByte(memory, addressY);
          this.registers.A ^= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.EOR_INDEXED_INDIRECT_X: {
          //6 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let vector = this.readVector(memory, zeroPageAddressX);
          let value = this.readByte(memory, vector);
          this.registers.A ^= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          this.cycles -= 1;
          break;
        }
        case OPCODES.EOR_INDIRECT_INDEXED_Y: {
          //5 + 1 cycles
          let zeroPageAddress = this.getByte(memory);
          let vector = this.readVector(memory, zeroPageAddress);
          let vectorY = vector + this.registers.Y;
          this.pageCrossBoundaryCheck(vectorY, vector);
          let value = this.readByte(memory, vectorY);
          this.registers.A ^= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }

        //ORA INSTRUCTIONS
        case OPCODES.ORA_IMMEDIATE: {
          let value = this.getByte(memory);
          this.registers.A |= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.ORA_ZEROPAGE: {
          let zeroPageAddress = this.getByte(memory);
          let value = this.readByte(memory, zeroPageAddress);
          this.registers.A |= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.ORA_ZEROPAGE_X: {
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let value = this.readByte(memory, zeroPageAddressX);
          this.registers.A |= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.ORA_ABSOLUTE: {
          let absoluteAddress = this.getVector(memory);
          let value = this.readByte(memory, absoluteAddress);
          this.registers.A |= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.ORA_ABSOLUTE_X: {
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          this.pageCrossBoundaryCheck(addressX, address);
          let value = this.readByte(memory, addressX);
          this.registers.A |= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.ORA_ABSOLUTE_Y: {
          let address = this.getVector(memory);
          let addressY = address + this.registers.Y;
          this.pageCrossBoundaryCheck(addressY, address);
          let value = this.readByte(memory, addressY);
          this.registers.A |= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.ORA_INDEXED_INDIRECT_X: {
          //6 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let vector = this.readVector(memory, zeroPageAddressX);
          let value = this.readByte(memory, vector);
          this.registers.A |= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          this.cycles -= 1;
          break;
        }
        case OPCODES.ORA_INDIRECT_INDEXED_Y: {
          //5 + 1 cycles
          let zeroPageAddress = this.getByte(memory);
          let vector = this.readVector(memory, zeroPageAddress);
          let vectorY = vector + this.registers.Y;
          this.pageCrossBoundaryCheck(vectorY, vector);
          let value = this.readByte(memory, vectorY);
          this.registers.A |= value;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }

        //INCREMENT & DECREMENT INSTRUCTIONS
        case OPCODES.INX_IMPLIED: {
          this.registers.X++;
          this.registers.X &= 0xff; //wrap if overflow
          this.cycles--;
          this.setZeroAndNegativeFlags(this.registers.X);
          break;
        }
        case OPCODES.INY_IMPLIED: {
          this.registers.Y++;
          this.registers.Y &= 0xff; //wrap if overflow
          this.cycles--;
          this.setZeroAndNegativeFlags(this.registers.Y);
          break;
          break;
        }
        case OPCODES.DEX_IMPLIED: {
          this.registers.X--;
          this.registers.X &= 0xff; //wrap if underflow
          this.cycles--;
          this.setZeroAndNegativeFlags(this.registers.X);
          break;
        }
        case OPCODES.DEY_IMPLIED: {
          this.registers.Y--;
          this.registers.Y &= 0xff; //wrap if underflow
          this.cycles--;
          this.setZeroAndNegativeFlags(this.registers.Y);
          break;
        }
        case OPCODES.INC_ABSOLUTE: {
          let address = this.getVector(memory);
          let value = this.readByte(memory, address);
          value++;
          value &= 0xff;
          memory.writeByte(address, value);
          this.setZeroAndNegativeFlags(value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.INC_ABSOLUTE_X: {
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          //no page cross check, always 7 cycles
          let value = this.readByte(memory, addressX);
          value++;
          value &= 0xff;
          memory.writeByte(addressX, value);
          this.setZeroAndNegativeFlags(value);
          this.cycles -= 3;
          break;
        }
        case OPCODES.INC_ZEROPAGE: {
          let zeroPageAddress = this.getByte(memory);
          let value = this.readByte(memory, zeroPageAddress);
          value++;
          value &= 0xff;
          memory.writeByte(zeroPageAddress, value);
          this.setZeroAndNegativeFlags(value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.INC_ZEROPAGE_X: {
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let value = this.readByte(memory, zeroPageAddressX);
          value++;
          value &= 0xff;
          memory.writeByte(zeroPageAddressX, value);
          this.setZeroAndNegativeFlags(value);
          this.cycles -= 3;
          break;
        }
        case OPCODES.DEC_ABSOLUTE: {
          let address = this.getVector(memory);
          let value = this.readByte(memory, address);
          value--;
          value &= 0xff;
          memory.writeByte(address, value);
          this.setZeroAndNegativeFlags(value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.DEC_ABSOLUTE_X: {
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          //no page cross check, always 7 cycles
          let value = this.readByte(memory, addressX);
          value--;
          value &= 0xff;
          memory.writeByte(addressX, value);
          this.setZeroAndNegativeFlags(value);
          this.cycles -= 3;
          break;
        }
        case OPCODES.DEC_ZEROPAGE: {
          let zeroPageAddress = this.getByte(memory);
          let value = this.readByte(memory, zeroPageAddress);
          value--;
          value &= 0xff;
          memory.writeByte(zeroPageAddress, value);
          this.setZeroAndNegativeFlags(value);
          this.cycles -= 2;
          break;
        }
        case OPCODES.DEC_ZEROPAGE_X: {
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          let value = this.readByte(memory, zeroPageAddressX);
          value--;
          value &= 0xff;
          memory.writeByte(zeroPageAddressX, value);
          this.setZeroAndNegativeFlags(value);
          this.cycles -= 3;
          break;
        }

        //LDA INSTRUCTIONS
        case OPCODES.LDA_IMMEDIATE: {
          //2 cycles
          let data = this.getByte(memory);
          this.registers.A = data;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.LDA_ZEROPAGE: {
          //3 cycles
          let zeroPageAddress = this.getByte(memory);
          this.registers.A = this.readByte(memory, zeroPageAddress);
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.LDA_ZEROPAGE_X: {
          //4 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          this.registers.A = this.readByte(memory, zeroPageAddressX);
          this.cycles--;
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.LDA_ABSOLUTE: {
          //4 cycles
          let address = this.getVector(memory);
          this.registers.A = this.readByte(memory, address);
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.LDA_ABSOLUTE_X: {
          //4 + 1 cycles
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          this.pageCrossBoundaryCheck(addressX, address);
          this.registers.A = this.readByte(memory, addressX);
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }
        case OPCODES.LDA_ABSOLUTE_Y: {
          //4 + 1 cycles
          let address = this.getVector(memory);
          let addressY = address + this.registers.Y;
          this.pageCrossBoundaryCheck(addressY, address);
          this.registers.A = this.readByte(memory, addressY);
          this.setZeroAndNegativeFlags(this.registers.A);
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
          this.setZeroAndNegativeFlags(this.registers.A);
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
          this.setZeroAndNegativeFlags(this.registers.A);
          break;
        }

        //LDX INSTRUCTIONS
        case OPCODES.LDX_IMMEDIATE: {
          //2 cycles
          let data = this.getByte(memory);
          this.registers.X = data;
          this.setZeroAndNegativeFlags(this.registers.X);
          break;
        }
        case OPCODES.LDX_ZEROPAGE: {
          //3 cycles
          let zeroPageAddress = this.getByte(memory);
          this.registers.X = this.readByte(memory, zeroPageAddress);
          this.setZeroAndNegativeFlags(this.registers.X);
          break;
        }
        case OPCODES.LDX_ZEROPAGE_Y: {
          //4 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressY = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.Y
          );
          this.registers.X = this.readByte(memory, zeroPageAddressY);
          this.cycles--;
          this.setZeroAndNegativeFlags(this.registers.X);
          break;
        }
        case OPCODES.LDX_ABSOLUTE: {
          //4 cycles
          let address = this.getVector(memory);
          this.registers.X = this.readByte(memory, address);
          this.setZeroAndNegativeFlags(this.registers.X);
          break;
        }
        case OPCODES.LDX_ABSOLUTE_Y: {
          //4 + 1 cycles
          let address = this.getVector(memory);
          let addressY = address + this.registers.Y;
          this.pageCrossBoundaryCheck(addressY, address);
          this.registers.X = this.readByte(memory, addressY);
          this.setZeroAndNegativeFlags(this.registers.X);
          break;
        }

        //LDY INSTRUCTIONS
        case OPCODES.LDY_IMMEDIATE: {
          //2 cycles
          let data = this.getByte(memory);
          this.registers.Y = data;
          this.setZeroAndNegativeFlags(this.registers.Y);
          break;
        }
        case OPCODES.LDY_ZEROPAGE: {
          //3 cycles
          let zeroPageAddress = this.getByte(memory);
          this.registers.Y = this.readByte(memory, zeroPageAddress);
          this.setZeroAndNegativeFlags(this.registers.Y);
          break;
        }
        case OPCODES.LDY_ZEROPAGE_X: {
          //4 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          this.registers.Y = this.readByte(memory, zeroPageAddressX);
          this.cycles--;
          this.setZeroAndNegativeFlags(this.registers.Y);
          break;
        }
        case OPCODES.LDY_ABSOLUTE: {
          //4 cycles
          let address = this.getVector(memory);
          this.registers.Y = this.readByte(memory, address);
          this.setZeroAndNegativeFlags(this.registers.Y);
          break;
        }
        case OPCODES.LDY_ABSOLUTE_X: {
          //4 + 1 cycles
          let address = this.getVector(memory);
          let addressX = address + this.registers.X;
          this.pageCrossBoundaryCheck(addressX, address);
          this.registers.Y = this.readByte(memory, addressX);
          this.setZeroAndNegativeFlags(this.registers.Y);
          break;
        }

        //STA INSTRUCTIONS
        case OPCODES.STA_ZEROPAGE: {
          //3 cycles
          let zeroPageAddress = this.getByte(memory);
          memory.writeByte(zeroPageAddress, this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.STA_ZEROPAGE_X: {
          //4 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          memory.writeByte(zeroPageAddressX, this.registers.A);
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
          let zeroPageAddress = this.getByte(memory);
          memory.writeByte(zeroPageAddress, this.registers.X);
          this.cycles--;
          break;
        }
        case OPCODES.STX_ZEROPAGE_Y: {
          //4 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressY = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.Y
          );
          memory.writeByte(zeroPageAddressY, this.registers.X);
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
          let zeroPageAddress = this.getByte(memory);
          memory.writeByte(zeroPageAddress, this.registers.Y);
          this.cycles--;
          break;
        }
        case OPCODES.STY_ZEROPAGE_X: {
          //4 cycles
          let zeroPageAddress = this.getByte(memory);
          let zeroPageAddressX = this.zeroPageWrappingCheck(
            zeroPageAddress,
            this.registers.X
          );
          memory.writeByte(zeroPageAddressX, this.registers.Y);
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

        //TRANSFER INSTRUCTIONS
        case OPCODES.TAX_IMPLIED: {
          this.registers.X = this.registers.A;
          this.setZeroAndNegativeFlags(this.registers.X);
          this.cycles--;
          break;
        }
        case OPCODES.TAY_IMPLIED: {
          this.registers.Y = this.registers.A;
          this.setZeroAndNegativeFlags(this.registers.Y);
          this.cycles--;
          break;
        }
        case OPCODES.TXA_IMPLIED: {
          this.registers.A = this.registers.X;
          this.setZeroAndNegativeFlags(this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.TYA_IMPLIED: {
          this.registers.A = this.registers.Y;
          this.setZeroAndNegativeFlags(this.registers.A);
          this.cycles--;
          break;
        }
        case OPCODES.TXS_IMPLIED: {
          //TODO : TXS JA TSX SAATTAA OLLA VITUILLAAN
          this.SP = this.registers.X;
          this.cycles--;
          break;
        }
        case OPCODES.TSX_IMPLIED: {
          //TODO : TXS JA TSX SAATTAA OLLA VITUILLAAN
          this.registers.X = this.SP;
          this.cycles--;
          break;
        }

        //STATUS FLAG INSTRUCTIONS
        case OPCODES.CLC_IMPLIED: {
          this.flags.C = false;
          this.cycles--;
          break;
        }
        case OPCODES.CLD_IMPLIED: {
          this.flags.D = false;
          this.cycles--;
          break;
        }
        case OPCODES.CLI_IMPLIED: {
          this.flags.I = false;
          this.cycles--;
          break;
        }
        case OPCODES.CLV_IMPLIED: {
          this.flags.V = false;
          this.cycles--;
          break;
        }
        case OPCODES.SEC_IMPLIED: {
          this.flags.C = true;
          this.cycles--;
          break;
        }
        case OPCODES.SEI_IMPLIED: {
          this.flags.I = true;
          this.cycles--;
          break;
        }

        //JSR, JMP & RTS INSTRUCTIONS
        case OPCODES.JSR_ABSOLUTE: {
          //6 cycles
          let jumpAddress = this.getVector(memory);
          memory.writeVector(this.PC - 1, this.SP); //TODO : Koska pc on jo incrementattu, tää saattaa olla pc - 2
          this.SP -= 2; //TODO Stackin tarkistus
          this.PC = jumpAddress;
          this.cycles -= 3;
          break;
        }
        case OPCODES.JMP_ABSOLUTE: {
          //3 cycles
          let jumpAddress = this.getVector(memory);
          this.PC = jumpAddress;
          break;
        }
        case OPCODES.JMP_INDIRECT: {
          //5 cycles
          let firstAddress = this.getByte(memory);
          let secondAddress = this.getByte(memory); //Nää incrementtaa PC:tä mut ei pitäs olla väliä
          let firstByte = this.readByte(memory, firstAddress);
          let secondByte = this.readByte(memory, secondAddress);
          this.PC = firstByte | (secondByte << 8);
          break;
        }
        case OPCODES.RTS_IMPLIED: {
          //6 cycles
          let storedPC = this.readVector(memory, this.SP + 1); //TODO : STACK tarkistus
          this.SP += 2;
          this.PC = storedPC - 2; //TODO TÄMÄKIN
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
