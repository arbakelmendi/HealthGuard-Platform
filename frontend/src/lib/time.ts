const utcOffsetPattern = /(?:Z|[+-]\d{2}:?\d{2})$/i;

export function parseBackendDate(value: string) {
  return new Date(utcOffsetPattern.test(value) ? value : `${value}Z`);
}

export function formatNotificationTime(value: string, now = Date.now()) {
  const createdAt = parseBackendDate(value).getTime();
  const elapsedSeconds = Math.max(0, Math.floor((now - createdAt) / 1000));

  if (elapsedSeconds < 60) {
    return "just now";
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} ${elapsedMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours} ${elapsedHours === 1 ? "hour" : "hours"} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} ${elapsedDays === 1 ? "day" : "days"} ago`;
}
