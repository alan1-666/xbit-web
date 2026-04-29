import 'dart:math';
import 'ColorUtil.dart';

typedef HexColor = String;

/// ColorWheel is color theory in art painting, please Google to learn & understand color wheel first
class ColorWheel {
  ColorWheelConfig configs = ColorWheelConfig(
    hues: [],
    lightnessLevels: [],
    saturate: 1.0,
  );

  // output
  List<Color> colors = [];

  /// @param hueLevelsCount auto generate hue steps base on hue level count, eg: count=6 will generate 6 colors in the color wheel
  /// @param saturate make more color saturate, range: 0-1
  /// @param lightnessLevels array of range: 0-1, it's how many ring we made in the color wheel, must be in decreasing order
  ColorWheel(
      int hueLevelsCount,
      double saturate,
      List<double> lightnessLevels,
      ) {
    final List<double> hues = [];
    for (int i = 0; i < hueLevelsCount; i++) {
      hues.add((i * 360 / hueLevelsCount).floorToDouble());
    }

    configs.hues = hues;
    configs.lightnessLevels = lightnessLevels;
    configs.saturate = saturate;
    colors = ColorWheel.generateColorWheelColors(hues, saturate, lightnessLevels);
  }

  /// Generate color pallet base on color wheel
  /// amount returned = 12 hue * count sat levels
  /// @returns Array of color objects with hsl, hex and data properties
  static List<Color> generateColorWheelColors(
      List<double> hues,
      double saturate,
      List<double> lightnessLevels,
      ) {
    final List<Color> colors = [];

    for (int i = 0; i < hues.length; i++) {
      final hue = hues[i];
      for (final lightness in lightnessLevels) {
        final color = Color(
          hex: ColorUtil.hsl2hex(hue, saturate, lightness),
          data: ColorData(
            h: hue,
            s: saturate,
            l: lightness,
            hi: i,
            i: colors.length,
          ),
        );
        colors.add(color);
      }
    }

    return colors;
  }

  List<Color> getColors() {
    return colors;
  }

  List<String> getHexColors() {
    return colors.map((i) => i.hex).toList();
  }

  /// return Color type, this ensure returned color have enough contrast compared to srcColor
  Color getContrastColorOf(
      int srcColorIdx,
      ColorWheel srcColorWheel,
      int seed, [
        dynamic debugData,
      ]) {
    // hue is the same config between all color wheel, so hueIdx is the same for src & target
    final hueIdx = srcColorWheel.getHueIdx(srcColorIdx);
    // same hue or hue + 1 is not enough contrast, so need to hue += 2
    const shiftDegree = 180;
    final hueIdxDelta = (configs.hues.length * shiftDegree / 360).floor();
    final palletColorDelta = hueIdx +
        hueIdxDelta * configs.lightnessLevels.length +
        seed % configs.lightnessLevels.length;
    final targetColorIdx = (srcColorIdx / srcColorWheel.configs.hues.length).floor() +
        (srcColorIdx % srcColorWheel.configs.hues.length);
    final contrastColorIdx = _cycleIndex(targetColorIdx, palletColorDelta, colors);
    final contrastColor = colors[contrastColorIdx];

    return contrastColor;
  }

  int getHueIdx(int colorIdx) {
    return colors[colorIdx].data.hi;
  }

  /// Helper function to cycle through array indices
  int _cycleIndex(int current, int delta, List<Color> array) {
    return (current + delta) % array.length;
  }
}

class ColorWheelConfig {
  List<double> hues; // in degree, 0-360 degree in the color wheel
  List<double> lightnessLevels; // range: 0-1
  double saturate; // range 0-1

  ColorWheelConfig({
    required this.hues,
    required this.lightnessLevels,
    required this.saturate,
  });
}

class ColorData {
  double h;
  double s;
  double l;
  int hi; // aka hue index
  int i; // index of color in the pallet arr

  ColorData({
    required this.h,
    required this.s,
    required this.l,
    required this.hi,
    required this.i,
  });
}

class Color {
  HexColor hex;
  ColorData data;

  Color({
    required this.hex,
    required this.data,
  });
}
