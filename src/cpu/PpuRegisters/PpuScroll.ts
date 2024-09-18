class PPUSCROLL {
  latch = true; //oikeesti internal register w. if true, write X
  scroll_X = 0;
  scroll_Y = 0;

  update(value: number) {
    if (this.latch) {
      this.scroll_X = value;
    } else {
      this.scroll_Y = value;
    }
    this.latch = !this.latch;
  }

  resetLatch() {
    this.latch = true;
  }
}
export { PPUSCROLL };
