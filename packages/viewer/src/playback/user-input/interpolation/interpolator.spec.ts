import { interpolator, linear, flipHalfway } from "./interpolater";

describe('interpolator', () => {
  it('Returns an array with the correct number of values', () => {
    const int = interpolator<Thingy>(3, {
      x: (n) => () => new Array(n).fill(123),
    });
    const res = int({ x: 1, y: 1 }, { x: 5, y: 5 })
    expect(res.length).toBe(5);
    expect(res[1].x).toBe(123);
    expect(res[1].y).toBe(1);
  });

  describe('linear', () => {
    it('Generates intermediate values between a start and end', () => {
      const interpolated = linear(3)(1, 5);
      expect(interpolated).toEqual([2, 3, 4]);
    })
  })

  describe('flipHalfway', () => {
    it('Generates the right values', () => {
      const odd = flipHalfway(3)(1, 5);
      expect(odd).toEqual([1, 5, 5]);

      const even = flipHalfway(4)(1, 5);
      expect(even).toEqual([1, 1, 5, 5]);
    })
  })
})

interface Thingy {
  x: number,
  y: number
}
