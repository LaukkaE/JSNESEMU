//   7  bit  0
// ---- ----
// VPHB SINN
// |||| ||||
// |||| ||++- Base nametable address
// |||| ||    (0 = $2000; 1 = $2400; 2 = $2800; 3 = $2C00)
// |||| |+--- VRAM address increment per CPU read/write of PPUDATA
// |||| |     (0: add 1, going across; 1: add 32, going down)
// |||| +---- Sprite pattern table address for 8x8 sprites
// ||||       (0: $0000; 1: $1000; ignored in 8x16 mode)
// |||+------ Background pattern table address (0: $0000; 1: $1000)
// ||+------- Sprite size (0: 8x8 pixels; 1: 8x16 pixels – see PPU OAM#Byte 1)
// |+-------- PPU master/slave select
// |          (0: read backdrop from EXT pins; 1: output color on EXT pins)
// +--------- Generate an NMI at the start of the
//            vertical blanking interval (0: off; 1: on)
class PPUCTRL {
  bitflags = {
    NAMETABLE_LO: 0,
    NAMETABLE_HI: 0,
    VRAM_INCREMENT_MODE: 0,
    SPRITE_TILE_SELECT: 0,
    BG_TILE_SELECT: 0,
    SPRITE_HEIGHT: 0,
    PPU_MASTER_SLAVE_SELECT: 0,
    GENERATE_NMI: 0,
  };

  getNameTableAddress(): number {
    const combined: number =
      (this.bitflags.NAMETABLE_HI << 1) + this.bitflags.NAMETABLE_LO;
    switch (combined) {
      case 0:
        return 0x2000;
      case 1:
        return 0x2400;
      case 2:
        return 0x2800;
      case 3:
        return 0x2c00;
      default:
        throw new Error('PPUCTRL NAMETABLE ADDRESS ERROR');
    }
  }

  getSpriteSize(): number {
    if (this.bitflags.SPRITE_HEIGHT === 1) {
      return 16;
    }
    return 8;
  }

  getVramAddrIncrement(): number {
    if (this.bitflags.VRAM_INCREMENT_MODE === 1) {
      return 32;
    }
    return 1;
  }

  getBgPatternAddr(): number {
    if (this.bitflags.BG_TILE_SELECT === 1) {
      return 0x1000;
    }
    return 0;
  }

  getSpritePatternAddr(): number {
    if (this.bitflags.SPRITE_TILE_SELECT === 1) {
      return 0x1000;
    }
    return 0;
  }

  getGenerateVBlankNmi(): number {
    //vaihto booleaniin?
    return this.bitflags.GENERATE_NMI;
  }

  getMasterSlaveSelect(): number {
    //vaihto booleaniin?
    return this.bitflags.PPU_MASTER_SLAVE_SELECT;
  }

  update(value: number) {
    this.bitflags.NAMETABLE_LO = (value >> 0) & 1;
    this.bitflags.NAMETABLE_HI = (value >> 1) & 1;
    this.bitflags.VRAM_INCREMENT_MODE = (value >> 2) & 1;
    this.bitflags.SPRITE_TILE_SELECT = (value >> 3) & 1;
    this.bitflags.BG_TILE_SELECT = (value >> 4) & 1;
    this.bitflags.SPRITE_HEIGHT = (value >> 5) & 1;
    this.bitflags.PPU_MASTER_SLAVE_SELECT = (value >> 6) & 1;
    this.bitflags.GENERATE_NMI = (value >> 7) & 1;
  }
}

export { PPUCTRL };
