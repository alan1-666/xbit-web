import 'dart:convert';
import 'AvatarFactory.dart';
import 'ColorWheel.dart';

typedef Cfg = List<dynamic>; // [int, double, List<double>]

// please use this in production
class DefaultXbitConfig {
  static final Map<String, Cfg> config = {
    // el: [hueCount, satLevels, lightLevels]
    'deco': [42, 0.6, [0.60, 0.52, 0.45]],
    'logo': [42, 0.6, [0.95, 0.85, 0.75]],
    'bgrd': [42, 0.6, [0.30, 0.20, 0.10]],
  };
}

final avatarFactory = AvatarFactory(
  decoColorWheel: ColorWheel(
    DefaultXbitConfig.config['deco']![0] as int,
    DefaultXbitConfig.config['deco']![1] as double,
    (DefaultXbitConfig.config['deco']![2] as List).cast<double>(),
  ),
  logoColorWheel: ColorWheel(
    DefaultXbitConfig.config['logo']![0] as int,
    DefaultXbitConfig.config['logo']![1] as double,
    (DefaultXbitConfig.config['logo']![2] as List).cast<double>(),
  ),
  bgColorWheel: ColorWheel(
    DefaultXbitConfig.config['bgrd']![0] as int,
    DefaultXbitConfig.config['bgrd']![1] as double,
    (DefaultXbitConfig.config['bgrd']![2] as List).cast<double>(),
  ),
);

/// return svg image as string
String generateAvatar(String walletAddress) {
  final result = avatarFactory.generateAvatar(walletAddress, 128);
  return result[0] as String;
}

/// generate svg base64 base on wallet address
///
/// please use with Image.memory(base64Decode(generateAvatarSvgImgSrc(...).split(',')[1]))
/// or for web: <img src="${generateAvatarSvgImgSrc(...)}">
///
/// @param walletAddress
String generateAvatarSvgImgSrc(String walletAddress) {
  final svg = generateAvatar(walletAddress);
  final base64Svg = base64Encode(utf8.encode(svg));
  return 'data:image/svg+xml;base64,$base64Svg';
}
