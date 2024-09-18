// 7  bit  0
// ---- ----
// BGRs bMmG
// |||| ||||
// |||| |||+- Greyscale (0: normal color, 1: produce a greyscale display)
// |||| ||+-- 1: Show background in leftmost 8 pixels of screen, 0: Hide
// |||| |+--- 1: Show sprites in leftmost 8 pixels of screen, 0: Hide
// |||| +---- 1: Show background
// |||+------ 1: Show sprites
// ||+------- Emphasize red (green on PAL/Dendy)
// |+-------- Emphasize green (red on PAL/Dendy)
// +--------- Emphasize blue
enum Color {
  Red,
  Green,
  Blue,
}
class PPUMASK {
  bitflags = {
    GREYSCALE: 0,
    LEFTMOST_BG: 0,
    LEFTMOST_SPRITE: 0,
    SHOW_BG: 0,
    SHOW_SPRITE: 0,
    EMPHASIZE_RED: 0,
    EMPHASIZE_GREEN: 0,
    EMPHASIZE_BLUE: 0,
  };

  produceGreyscale(): boolean {
    if (this.bitflags.GREYSCALE) {
      return true;
    }
    return false;
  }

  showLeft8PixelBG(): boolean {
    if (this.bitflags.LEFTMOST_BG) {
      return true;
    }
    return false;
  }
  showLeft8PixelSprite(): boolean {
    if (this.bitflags.LEFTMOST_SPRITE) {
      return true;
    }
    return false;
  }
  showBG(): boolean {
    if (this.bitflags.SHOW_BG) {
      return true;
    }
    return false;
  }
  showSprite(): boolean {
    if (this.bitflags.SHOW_SPRITE) {
      return true;
    }
    return false;
  }
  emphasizeColors(): Array<Color> {
    let colorArray: Array<Color> = [];
    if (this.bitflags.EMPHASIZE_RED) {
      colorArray.push(Color.Red);
    }
    if (this.bitflags.EMPHASIZE_GREEN) {
      colorArray.push(Color.Green);
    }
    if (this.bitflags.EMPHASIZE_BLUE) {
      colorArray.push(Color.Blue);
    }
    return colorArray;
  }

  update(value: number) {
    this.bitflags.GREYSCALE = (value >> 0) & 1;
    this.bitflags.LEFTMOST_BG = (value >> 1) & 1;
    this.bitflags.LEFTMOST_SPRITE = (value >> 2) & 1;
    this.bitflags.SHOW_BG = (value >> 3) & 1;
    this.bitflags.SHOW_SPRITE = (value >> 4) & 1;
    this.bitflags.EMPHASIZE_RED = (value >> 5) & 1;
    this.bitflags.EMPHASIZE_GREEN = (value >> 6) & 1;
    this.bitflags.EMPHASIZE_BLUE = (value >> 7) & 1;
  }
}

export { PPUMASK, Color };
