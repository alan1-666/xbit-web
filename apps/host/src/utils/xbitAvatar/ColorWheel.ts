import {cycleIndex} from "@/utils/array.ts"
import {hsl2hex} from "@/utils/xbitAvatar/ColorUtil.ts";

/**
 * ColorWheel is color theory in art painting, please Google to learn & understand color wheel first
 */
export class ColorWheel {
  configs: ColorWheelConfig = {
    hues: [
      // 0, // Red
      // 30, // Red-Orange
      // 60, // Yellow
      // 90, // Yellow-Green
      // 120, // Green
      // 150, // Green-Cyan
      // 180, // Cyan
      // 210, // Cyan-Blue
      // 240, // Blue
      // 270, // Blue-Magenta
      // 300, // Magenta
      // 330 // Magenta-Red
    ],
    lightnessLevels: [],
    saturate: 1,
  }

  // output
  colors: Color[] = [];

  /**
   * @param hueLevelsCount auto generate hue steps base on hue level count, eg: count=6 will generate 6 colors in the color wheel
   * @param saturate make more color saturate, range: 0-1
   * @param lightnessLevels array of range: 0-1, it's how many ring we made in the color wheel, must be in decreasing order
   */
  constructor(
    hueLevelsCount: number,
    saturate: number,
    lightnessLevels: number[],
  ) {
    const hues: number[] = [];
    for (let i = 0; i < hueLevelsCount; i++) {
      hues.push(Math.floor(i * 360 / hueLevelsCount));
    }

    this.configs.hues = hues;
    this.configs.lightnessLevels = lightnessLevels;
    this.configs.saturate = saturate;
    this.colors = ColorWheel.generateColorWheelColors(hues, saturate, lightnessLevels);
  }

  /**
   * Generate color pallet base on color wheel
   * amount returned = 12 hue * count sat levels
   * @returns Array of color objects with hsl, hex and data properties
   */
  static generateColorWheelColors(
    hues: number[] = [],
    saturate: number = 0.75,
    lightnessLevels: number[] = [0.75, 0.5, 0.25],
  ): Color[] {
    const colors: Color[] = [];

    for (let i = 0, c = hues.length; i < c; i++) {
      const hue = hues[i]
      for (const lightness of lightnessLevels) {
        // The saturation is kept at a high value for vibrant colors
        const color: Color = {
          // hsl: `hsl(${hue}, ${saturate * 100}%, ${lightness * 100}%)`,
          hex: hsl2hex(hue, saturate, lightness),
          data: {
            h: hue, s: saturate, l: lightness,
            hi: i,
            i: colors.length,
          },
        }
        colors.push(color)
      }
    }

    return colors
  }

  getColors(): Color[] {
    return this.colors;
  }

  getHexColors(): string[] {
    return this.colors.map(i => i.hex);
  }

  // brighter(color) {
  //
  // }
  // darker(color) {
  //
  // }

  // return Color type, this ensure returned color have enough contrast compared to srcColor
  getContrastColorOf(srcColorIdx: number, srcColorWheel: ColorWheel, seed: number, _debugData?: any): Color {
    // hue is the same config between all color wheel, so hueIdx is the same for src & target
    const hueIdx = srcColorWheel.getHueIdx(srcColorIdx)
    // same hue or hue + 1 is not enough contrast, so need to hue += 2
    const shiftDegree = 180
    const hueIdxDelta = Math.floor(this.configs.hues.length * shiftDegree / 360) // must shift hue +60 degree, means 60/360 = 1/6 color wheel
    const lc = this.configs.lightnessLevels.length;
    const palletColorDelta = hueIdx + hueIdxDelta * lc + seed % lc;
    const targetColorIdx = Math.floor(srcColorIdx / srcColorWheel.configs.hues.length) + (srcColorIdx % srcColorWheel.configs.hues.length)
    const contrastColorIdx = cycleIndex(targetColorIdx, palletColorDelta, this.colors)
    const contrastColor = this.colors[contrastColorIdx]

    // Turn verifyHslContrast on for debug only
    // const debug = 1
    // if (debug) {
    //   const srcColor = srcColorWheel.colors[srcColorIdx]
    //   const verify = verifyHslContrast(srcColor.data, contrastColor.data)
    //   if (!verify.verified.xbit_logo_bg) {
    //     console.log(`not enough contrast: `, {
    //       verifyHslContrast: verify,
    //       srcColorIdx,
    //       contrastColorIdx,
    //       srcColor,
    //       contrastColor,
    //       seed,
    //       hueIdxDelta,
    //       palletColorDelta,
    //       _debugData,
    //     })
    //   }
    // }

    return contrastColor
  }

  getHueIdx(colorIdx: number): number {
    return this.colors[colorIdx].data.hi
  }
}

export interface ColorWheelConfig {
  hues: number[]; // in degree, 0-360 degree in the color wheel
  lightnessLevels: number[]; // range: 0-1
  saturate: number; // range 0-1
}

export interface ColorData {
  h: number;
  s: number;
  l: number;
  hi: number; // aka hue index
  i: number; // index of color in the pallet arr
}

export interface Color {
  hex: HexColor;
  data: ColorData;
}

export type HexColor = string
