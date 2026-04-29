import 'dart:math';

class ColorUtil {
  /// Convert HSL to Hex color
  static String hsl2hex(double h, double s, double l) {
    final c = (1 - (2 * l - 1).abs()) * s;
    final x = c * (1 - ((h / 60) % 2 - 1).abs());
    final m = l - c / 2;

    double r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    String toHex(double val) {
      final hex = ((val + m) * 255).round().toRadixString(16);
      return hex.length == 1 ? '0$hex' : hex;
    }

    return '#${toHex(r)}${toHex(g)}${toHex(b)}'.toUpperCase();
  }

  /// Make color brighter
  /// rate = 1.2 means 120%
  static List<double> incLight(double rate, double h, double s, double l) {
    l = min(1.0, l * rate);
    s = min(1.0, s * rate);
    return [h, s, l];
  }
}
