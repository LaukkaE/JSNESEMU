//Because the CPU and the PPU are on separate buses, neither has direct access to the other's memory.
//The CPU writes to VRAM through a pair of registers on the PPU by first loading an address into PPUADDR and then it writing data repeatedly to PPUDATA.
//The 16-bit address is written to PPUADDR one byte at a time, upper byte first.
//Whether this is the first or second write is tracked internally by the w register, which is shared with PPUSCROLL.

class PPUADDR {
  lowByte = 0x0;
  highbyte = 0x0;
  highPointer = true; //tää on ehkä "internal registers w" eli write latch

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
    this.validAddressCheck();

    this.highPointer = !this.highPointer;
  }

  //Valid addresses are $0000–$3FFF; higher addresses will be mirrored down. TODO: TESTIT TÄHÄN
  validAddressCheck() {
    if (this.getAddress() > 0x3fff) {
      this.setAddress(this.getAddress() & 0x3fff);
    }
  }
  resetPointer() {
    this.highPointer = true;
  }
  //Also note that read or write access to 0x2007 increments the PPU Address (0x2006).
  //The increment size is determined by the state of the Control register (0x2000): (Either 1 or 32)
  incrementValue(amount: number) {
    // TODO TESTS!!!!
    let low = this.lowByte + amount; // amount = 1 or 32
    this.lowByte = low &= 0xff;
    if (low > 0xff) {
      this.highbyte = (this.highbyte + 1) & 0xff;
    }
    this.validAddressCheck();
  }
}

export { PPUADDR };
