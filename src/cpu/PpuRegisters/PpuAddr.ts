//Because the CPU and the PPU are on separate buses, neither has direct access to the other's memory.
//The CPU writes to VRAM through a pair of registers on the PPU by first loading an address into PPUADDR and then it writing data repeatedly to PPUDATA.
//The 16-bit address is written to PPUADDR one byte at a time, upper byte first.
//Whether this is the first or second write is tracked internally by the w register, which is shared with PPUSCROLL.

class PPUADDR {
  lowByte = 0x0;
  highbyte = 0x0;
  highPointer = true; //true = write to high byte first

  getAddress(): number {
    return (this.highbyte << 8) | this.lowByte;
  }
  setAddress(address: number) {
    this.highbyte = address >> 8;
    this.lowByte = address & 0xff;
  }
  update(byte: number) {
    if (this.highPointer) {
      this.highbyte = byte;
    } else {
      this.lowByte = byte;
    }
    //Valid addresses are $0000–$3FFF; higher addresses will be mirrored down. TODO: TESTIT TÄHÄN
    if (this.getAddress() > 0x3fff) {
      this.setAddress(this.getAddress() & 0x3fff);
    }

    this.highPointer = !this.highPointer;
  }
  resetPointer() {
    this.highPointer = true;
  }
}

export { PPUADDR };
