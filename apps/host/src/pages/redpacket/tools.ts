export function formatSecondsToHoursMinutes(seconds: number) {
  // 分钟向上取整
  const totalMinutes = Math.ceil(seconds / 60)

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return {
    hours,
    minutes
  }
}