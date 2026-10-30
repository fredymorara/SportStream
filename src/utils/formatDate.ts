export const formatEventDate = (
  timestamp: number,
  options: Intl.DateTimeFormatOptions = {},
) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    ...options,
  }).format(new Date(timestamp));
