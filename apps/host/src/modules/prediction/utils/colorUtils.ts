export const isDarkColor = (color: string | undefined | null) => {
  if (!color) return false
  // Dùng Regex để tách 3 cặp hex: R (đỏ), G (xanh lá), B (xanh dương)
  const match = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!match) return false

  // Chuyển từ base-16 sang số thập phân (0-255), sau đó chia cho 255 để về thang 0-1
  const r = parseInt(match[1], 16) / 255
  const g = parseInt(match[2], 16) / 255
  const b = parseInt(match[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  // Tính 'Hue' (Góc màu trên vòng tròn màu):
  let h = 0
  if (max !== min) {
    const d = max - min
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break // Nếu màu Đỏ trội nhất
      case g:
        h = (b - r) / d + 2
        break // Nếu màu Xanh Lá trội nhất
      case b:
        h = (r - g) / d + 4
        break // Nếu màu Xanh Dương trội nhất
    }
    h /= 6 // Chuẩn hóa về 0-1
  }
  const hue = h * 360 // Đổi ra độ (0° - 360°)
  const l = (max + min) / 2 // Tính Lightness (Độ sáng trung bình)

  // Hue range: Chia vòng tròn màu làm 2 nửa:
  /**
   * - Nửa "Sáng" (isLightHue): Từ 30° đến 210°.
   *   Khoảng này chứa màu Vàng, Xanh Lá, Cyan (Xanh lơ). Những màu này mắt người nhìn thấy rất sáng.
   * - Nửa "Tối": Còn lại (Đỏ, Xanh Dương đậm, Tím, Hồng).
   */
  const isLightHue = hue > 30 && hue < 210

  // Logic cốt lõi:
  /**
   * - Nếu là Tông màu Sáng (Vàng/Xanh Lá):
   *   Ngưỡng cực thấp (0.25). Tức là phải "Rất rất tối" (như Nâu đậm, Rêu đậm) mới được coi là màu tối.
   *   -> Mục đích: Để màu Vàng hay Xanh Lá bình thường (L~0.5) KHÔNG bị dính gán là "Tối".
   * - Nếu là Tông màu Tối (Đỏ/Xanh Dương/Tím):
   *   Ngưỡng thấp (0.25). Tức là phải "Thực sự tối" (như Đen, Xám đậm, Nâu) mới được coi là tối.
   *   -> Mục đích: Chỉ bật backlight cho những màu gần như chìm vào nền đen. Đỏ đô hay Xanh đậm vừa phải vẫn sẽ tự hiển thị được.
   */

  const threshold = isLightHue ? 0.25 : 0.25

  // Cuối cùng: So sánh độ sáng thực tế (l) với ngưỡng (threshold).
  // Nếu độ sáng nhỏ hơn ngưỡng -> Trả về TRUE (Cần bật Backlight trắng).
  return l < threshold
}
