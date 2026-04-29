import 'dart:math';
import 'ColorWheel.dart';
import 'ColorUtil.dart';

class AvatarFactory {
  // config
  ColorWheel decoColorWheel;
  ColorWheel logoColorWheel;
  ColorWheel bgColorWheel;

  // pre-calc & cache
  late List<HexColor> LOGO_COLOR_PALLET_HEX;
  late List<HexColor> BG_COLOR_PALETTE_HEX;
  late List<HexColor> BG_COLOR_PALETTE_HEX_LIGHTER;

  AvatarFactory({
    required this.decoColorWheel,
    required this.logoColorWheel,
    required this.bgColorWheel,
  }) {
    LOGO_COLOR_PALLET_HEX = logoColorWheel.getHexColors();
    BG_COLOR_PALETTE_HEX = bgColorWheel.getHexColors();
    BG_COLOR_PALETTE_HEX_LIGHTER = bgColorWheel.getColors().map((i) {
      final result = ColorUtil.incLight(1.4, i.data.h, i.data.s, i.data.l);
      return ColorUtil.hsl2hex(result[0], result[1], result[2]);
    }).toList();
  }

  // Generate avatar configuration from wallet address
  AvatarConfig generateAvatarConfig(String walletAddress) {
    final hash = AvatarFactory.hashString(walletAddress.toLowerCase());

    // Generate pseudo-random bytes from hash
    final List<int> bytes = [];
    for (int i = 0; i < 10; i++) {
      bytes.add((hash >> (i * 3)) & 0xFF);
    }

    // Background
    final bgTypeIndex = bytes[0] % BACKGROUND_TYPES.length;

    final bgColorIndex1 = bytes[1] % BG_COLOR_PALETTE_HEX.length;

    final bgColor1 = BG_COLOR_PALETTE_HEX[bgColorIndex1];
    final bgColor2 = BG_COLOR_PALETTE_HEX_LIGHTER[bgColorIndex1];

    // Logo color - must be far from both background colors on color wheel
    final logoColorIndex = logoColorWheel
        .getContrastColorOf(bgColorIndex1, bgColorWheel, bytes[3])
        .data
        .i;
    final logoColor = LOGO_COLOR_PALLET_HEX[logoColorIndex];

    final decoColorEl =
    decoColorWheel.getContrastColorOf(bgColorIndex1, bgColorWheel, bytes[5]);
    final decoColor = decoColorEl.hex;

    // Eyes
    final eyeIndex = bytes[5] % EYE_SHAPES.length;
    final eyeColor = decoColor;

    // Mouth
    final mouthIndex = bytes[6] % MOUTH_SHAPES.length;
    final mouthColor = decoColor;

    return AvatarConfig(
      bgTypeIndex: bgTypeIndex,
      bgColor1: bgColor1,
      bgColor2: bgColor2,
      logoColor: logoColor,
      eyeIndex: eyeIndex,
      eyeColor: eyeColor,
      mouthIndex: mouthIndex,
      mouthColor: mouthColor,
      data: AvatarConfigData(
        decoColorIdx: decoColorEl.data.i,
      ),
    );
  }

  // Generate SVG avatar
  List<dynamic> generateAvatar(String walletAddress, [int size = 128]) {
    final config = generateAvatarConfig(walletAddress);
    final uniqueId = 'grad_${AvatarFactory.hashString(walletAddress)}';

    final svgContent = '''
<svg width="$size" height="$size" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${BACKGROUND_TYPES[config.bgTypeIndex](uniqueId, config.bgColor1, config.bgColor2)}
  </defs>
  <!-- Background -->
  <rect width="32" height="32" fill="url(#$uniqueId)"/>
  <!-- Logo (Face) -->
  <g transform="translate(2,2)">
    <path fill="${config.logoColor}" d="M27.6599 4.61799C27.4023 3.67884 26.9867 2.66489 26.2637 2C26.2387 2 26.2637 2.04987 26.2637 2.06649C26.3551 2.68151 26.4299 3.13862 26.4382 3.77026C26.4798 6.8038 25.2746 9.06441 22.2744 9.97032C16.8971 11.591 11.1791 11.6076 5.7935 9.97863C2.40258 8.96468 1.28889 6.23034 1.60471 2.87266L1.746 2.01662C1.43849 2.24102 1.18916 2.61502 1.00632 2.93915C0.0837887 4.56812 -0.173855 6.93678 0.108722 8.7569C0.956451 14.1674 6.101 15.9294 10.9297 16.3034C11.1292 16.32 11.337 16.3698 11.5448 16.3449C11.6029 16.187 11.6112 16.0125 11.6611 15.8379C12.0517 14.5248 13.4646 13.7934 14.7778 14.1923C15.7169 14.4749 16.44 15.3642 16.5148 16.3449C16.7059 16.3698 16.8805 16.32 17.0633 16.3034C20.288 16.0374 24.2025 15.1149 26.2969 12.4553C28.009 10.2861 28.3664 7.24429 27.6516 4.60968L27.6599 4.61799Z"/>
    <path fill="${config.logoColor}" d="M23.022 16.5278H18.1684C18.1102 16.6276 18.1517 16.7772 18.1351 16.8935C17.8775 19.8689 14.5281 21.5976 11.9517 20.06C10.7383 19.337 10.0651 18.1568 9.94039 16.7522C9.94039 16.7024 9.95701 16.5362 9.90715 16.5195H5.05348C5.00362 16.5943 5.02024 16.7522 5.02024 16.852C5.19477 22.0963 9.8739 26.0856 15.0849 25.4955C19.3735 25.0134 22.8558 21.3649 23.0553 17.0348C23.0553 16.9268 23.0719 16.6691 23.0553 16.5777C23.0553 16.5528 23.047 16.5445 23.022 16.5278Z"/>
  </g>
  <!-- Mouth -->
  ${MOUTH_SHAPES[config.mouthIndex](config.mouthColor)}
  <!-- Eyes -->
  ${EYE_SHAPES[config.eyeIndex](config.eyeColor)}
</svg>
''';

    return [svgContent, config];
  }

  // Hash function for wallet address
  static int hashString(String str) {
    int hash = 0;
    for (int i = 0; i < str.length; i++) {
      final char = str.codeUnitAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.abs();
  }
}

class AvatarConfig {
  int bgTypeIndex;
  HexColor bgColor1;
  HexColor bgColor2;
  HexColor logoColor;
  int eyeIndex;
  HexColor eyeColor;
  int mouthIndex;
  HexColor mouthColor;

  // for debug
  AvatarConfigData? data;

  AvatarConfig({
    required this.bgTypeIndex,
    required this.bgColor1,
    required this.bgColor2,
    required this.logoColor,
    required this.eyeIndex,
    required this.eyeColor,
    required this.mouthIndex,
    required this.mouthColor,
    this.data,
  });
}

class AvatarConfigData {
  int decoColorIdx;

  AvatarConfigData({
    required this.decoColorIdx,
  });
}

class AvatarFactoryOptions {
  int? universalHueLevels;
  ColorWheel decoColorWheel;
  ColorWheel logoColorWheel;
  ColorWheel bgColorWheel;

  AvatarFactoryOptions({
    this.universalHueLevels,
    required this.decoColorWheel,
    required this.logoColorWheel,
    required this.bgColorWheel,
  });
}

// Background gradient types
final List<String Function(String, HexColor, HexColor)> BACKGROUND_TYPES = [
  // 0: Solid color
      (id, bgCenter, bgOut) => '''
<radialGradient id="$id" cx="50%" cy="50%" r="80%">
  <stop offset="0%" stop-color="$bgCenter"/>
  <stop offset="100%" stop-color="$bgCenter"/>
</radialGradient>
''',

  // 1: Radial Gradient
      (id, bgCenter, bgOut) => '''
<radialGradient id="$id" cx="50%" cy="50%" r="80%">
  <stop offset="0%" stop-color="$bgCenter"/>
  <stop offset="100%" stop-color="$bgOut"/>
</radialGradient>
''',
];

// Eye shapes - Fixed SVG definitions
final List<String Function(HexColor)> EYE_SHAPES = [
  // 0: Ellipse (vertical)
      (c) => '<ellipse cx="13" cy="13" rx="2" ry="4" fill="$c"/><ellipse cx="19" cy="13" rx="2" ry="4" fill="$c"/>',
  // 1: Circle
      (c) => '<circle cx="13" cy="13" r="3.2" fill="$c"/><circle cx="19" cy="13" r="2.4" fill="$c"/>',
  // 2: Ellipse (horizontal)
      (c) => '<ellipse cx="13" cy="13" rx="3" ry="1" fill="$c"/><ellipse cx="19" cy="13" rx="3" ry="1" fill="$c"/>',
  // 3: Small dots
      (c) => '<circle cx="13" cy="13" r="2.8" fill="$c"/><circle cx="19" cy="13" r="2.8" fill="$c"/>',
  // 4: Large circles
      (c) => '<circle cx="13" cy="13" r="1.6" fill="$c"/><circle cx="19" cy="13" r="1.6" fill="$c"/>',
  // 5: Lines (closed eyes)
      (c) => '<line x1="12" y1="13" x2="14" y2="13" stroke="$c" stroke-width="3.6" stroke-linecap="round"/><line x1="18" y1="13" x2="20" y2="13" stroke="$c" stroke-width="3.6" stroke-linecap="round"/>',
  // 6: diagonal eyes
      (c) => '<rect x="11" y="12" width="4" height="3" rx="0.5" fill="$c" transform="rotate(-20 12 12.5)"/><rect x="17" y="12" width="4" height="3" rx="0.5" fill="$c" transform="rotate(20 18 12.5)"/>',
  // 7
      (c) => '<ellipse cx="13" cy="16" rx="1.7" ry="2" fill="#fff"/><ellipse cx="19" cy="16" rx="1.7" ry="2" fill="#fff"/><ellipse cx="13" cy="16" rx="0.7" ry="0.9" fill="$c"/><ellipse cx="19" cy="16" rx="0.7" ry="0.9" fill="$c"/>',
  // 8
      (c) => '<rect x="8" y="12" width="16" height="5" rx="2" fill="$c"/>',
  // 9: x eye
      (c) => '''
<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M10.6 10.6 L15.4 15.4 M15.4 10.6 L10.6 15.4" stroke="$c" stroke-width="1.2" stroke-linecap="round"/>
<path d="M16.6 10.6 L21.4 15.4 M21.4 10.6 L16.6 15.4" stroke="$c" stroke-width="1.2" stroke-linecap="round"/>''',
  // 10: star eye
      (c) => '''<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M13 10 L13.6 12.6 L16 13 L13.6 13.4 L13 16 L12.4 13.4 L10 13 L12.4 12.6 Z" fill="$c"/>
<path d="M19 10 L19.6 12.6 L22 13 L19.6 13.4 L19 16 L18.4 13.4 L16 13 L18.4 12.6 Z" fill="$c"/>''',
  // 11: heart eye
      (c) => '''
<path d="M10.5 11.5 C10.5 10.5 11.5 10 12 10.5 C12.5 10 13.5 10.5 13.5 11.5 C13.5 13 11.5 14.5 11.5 14.5 C11.5 14.5 9.5 13 9.5 11.5 C9.5 10.5 10.5 10 11 10.5 C11.5 10 10.5 10.5 10.5 11.5 Z" fill="$c"/>
<path d="M16.5 11.5 C16.5 10.5 17.5 10 18 10.5 C18.5 10 19.5 10.5 19.5 11.5 C19.5 13 17.5 14.5 17.5 14.5 C17.5 14.5 15.5 13 15.5 11.5 C15.5 10.5 16.5 10 17 10.5 C17.5 10 16.5 10.5 16.5 11.5 Z" fill="$c"/>''',
  // 12: wink eye
      (c) => '''<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<ellipse cx="13" cy="13" rx="2.2" ry="2.8" fill="$c"/>
<path d="M16.5 13 Q19 15 21.5 13" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>''',
  // 13: closed happy eye
      (c) => '''<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M10.5 13 Q13 15 15.5 13" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M16.5 13 Q19 15 21.5 13" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>''',
];

// Mouth shapes - Fixed SVG definitions
final List<String Function(HexColor)> MOUTH_SHAPES = [
  // 0: Smile
      (c) => '<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 1: Big smile
      (c) => '<path d="M12 20 Q16 24 20 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 2: Neutral
      (c) => '<line x1="13" y1="21" x2="19" y2="21" stroke="$c" stroke-width="1.2" stroke-linecap="round"/>',
  // 3: Sad
      (c) => '<path d="M13 22 Q16 19 19 22" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 4: Surprised (O shape)
      (c) => '<circle cx="16" cy="21" r="1.5" stroke="$c" stroke-width="1.2" fill="none"/>',
  // 5: Smirk
      (c) => '<path d="M13 21 Q15 22 19 21" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 6
      (c) => '<path d="M11 22 Q16 17 21 22" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 7: Laugh (filled)
      (c) => '<ellipse cx="16" cy="21" rx="2.5" ry="1.5" fill="$c"/>',
  // 8
      (c) => '<ellipse cx="16" cy="21" rx="1.2" ry="1.6" fill="#fff"/><ellipse cx="16" cy="21" rx="0.7" ry="0.9" fill="$c"/>',
  // 9: Original Smile
      (c) => '<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 10: Big Smile
      (c) => '<path d="M12 20 Q16 24 20 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 11: Slight Smile
      (c) => '<path d="M13 21 Q16 22 19 21" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 12: Neutral Line
      (c) => '<line x1="13" y1="21" x2="19" y2="21" stroke="$c" stroke-width="1.2" stroke-linecap="round"/>',
  // 13: Sad Frown
      (c) => '<path d="M13 22 Q16 20 19 22" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 14: Big Frown
      (c) => '<path d="M12 23 Q16 19 20 23" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 15: Open Mouth (O)
      (c) => '<ellipse cx="16" cy="21" rx="1.5" ry="2" fill="$c"/>',
  // 16: Open Mouth (Circle)
      (c) => '<circle cx="16" cy="21" r="1.5" fill="$c"/>',
  // 17: Wide Open
      (c) => '<ellipse cx="16" cy="21" rx="2.5" ry="2" fill="$c"/>',
  // 18: Surprised (Small O)
      (c) => '<circle cx="16" cy="21" r="1" fill="$c"/>',
  // 19: Teeth Smile
      (c) => '''
<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<rect x="14.5" y="20.5" width="3" height="1.5" fill="#fff" rx="0.3"/>''',
  // 20: Grin with Teeth
      (c) => '''
<path d="M12 20 Q16 24 20 20 L20 21 Q16 23 12 21 Z" fill="$c"/>
<line x1="14" y1="20.5" x2="14" y2="22" stroke="#fff" stroke-width="0.8"/>
<line x1="16" y1="20.5" x2="16" y2="22" stroke="#fff" stroke-width="0.8"/>
<line x1="18" y1="20.5" x2="18" y2="22" stroke="#fff" stroke-width="0.8"/>''',
  // 21: Wavy Smile
      (c) => '<path d="M13 20 Q14 22 15 21 Q16 20 17 21 Q18 22 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 22: Smirk (Asymmetric)
      (c) => '<path d="M13 21 Q15 21 16 22 Q17 23 19 21" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 23: Tongue Out
      (c) => '''
<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<ellipse cx="16" cy="22" rx="1" ry="1.5" fill="#e91e63"/>''',
  // 24: Vampire Fangs
      (c) => '''
<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M14 21 L14 23 L14.5 21 Z" fill="#fff"/>
<path d="M18 21 L18 23 L17.5 21 Z" fill="#fff"/>''',
  // 25: Zipper Mouth
      (c) => '''
<line x1="13" y1="21" x2="19" y2="21" stroke="$c" stroke-width="1.2" stroke-linecap="round"/>
<line x1="14" y1="20" x2="14" y2="22" stroke="$c" stroke-width="0.8"/>
<line x1="16" y1="20" x2="16" y2="22" stroke="$c" stroke-width="0.8"/>
<line x1="18" y1="20" x2="18" y2="22" stroke="$c" stroke-width="0.8"/>''',
  // 26: Worried
      (c) => '<path d="M13 21 Q14 20.5 15 21 Q16 21.5 17 21 Q18 20.5 19 21" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  // 27: Gritted Teeth
      (c) => '''
<rect x="13" y="20.5" width="6" height="2" rx="0.5" fill="none" stroke="$c" stroke-width="1.2"/>
<line x1="14" y1="20.5" x2="14" y2="22.5" stroke="$c" stroke-width="0.8"/>
<line x1="15" y1="20.5" x2="15" y2="22.5" stroke="$c" stroke-width="0.8"/>
<line x1="16" y1="20.5" x2="16" y2="22.5" stroke="$c" stroke-width="0.8"/>
<line x1="17" y1="20.5" x2="17" y2="22.5" stroke="$c" stroke-width="0.8"/>
<line x1="18" y1="20.5" x2="18" y2="22.5" stroke="$c" stroke-width="0.8"/>''',
  // 28: Mustache
      (c) => '''
<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M12 19 Q14 18 16 19 Q18 18 20 19" stroke="$c" stroke-width="1.2" fill="none"/>''',
  // 29: Whistle
      (c) => '''
<circle cx="15" cy="21" r="1.2" fill="none" stroke="$c" stroke-width="1.2"/>
<path d="M16.2 21 L18 20" stroke="$c" stroke-width="1" stroke-linecap="round"/>''',
  // 30: Cat Mouth
      (c) => '''
<path d="M16 20 L14 22 M16 20 L18 22" stroke="$c" stroke-width="1.2" stroke-linecap="round"/>
<circle cx="16" cy="19.5" r="0.5" fill="$c"/>''',
  // 31: Lips
      (c) => '''
<path d="M13 21 Q16 23 19 21" fill="$c"/>
<path d="M13 21 Q16 20 19 21" fill="$c"/>''',
  // 32: Blow Kiss
      (c) => '''
<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M20 19 L21 18 M20.5 18.5 L21.5 19.5 M21 19 L22 19" stroke="#d63384" stroke-width="0.8" stroke-linecap="round"/>''',
  // 33: Drool
      (c) => '''
<path d="M13 20 Q16 23 19 20" stroke="$c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
<path d="M19 21 Q19.5 23 19 25" stroke="#4fc3f7" stroke-width="1" fill="none" stroke-linecap="round"/>''',
  // 34: Stitched
      (c) => '''
<line x1="13" y1="21" x2="19" y2="21" stroke="$c" stroke-width="1.2" stroke-linecap="round"/>
<line x1="13" y1="20" x2="13" y2="22" stroke="$c" stroke-width="0.8"/>
<line x1="15" y1="20" x2="15" y2="22" stroke="$c" stroke-width="0.8"/>
<line x1="17" y1="20" x2="17" y2="22" stroke="$c" stroke-width="0.8"/>
<line x1="19" y1="20" x2="19" y2="22" stroke="$c" stroke-width="0.8"/>''',
  // 35: Pacifier
      (c) => '''
<circle cx="16" cy="21" r="2" fill="#ffc107" stroke="$c" stroke-width="1"/>
<circle cx="16" cy="21" r="1" fill="#fff"/>
<rect x="15.5" y="19" width="1" height="1" fill="$c"/>''',
  // 36: Yawn
      (c) => '''
<ellipse cx="16" cy="22" rx="2.5" ry="3" fill="$c"/>
<ellipse cx="16" cy="21" rx="2" ry="1.5" fill="#d63384"/>''',
];
