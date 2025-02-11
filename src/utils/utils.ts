export const convertSecondsToTimeFormat = (totalDuration: number) => {
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalDuration % 60)
    .toString()
    .padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${minutes}:${seconds}`;
  }
  return `${minutes}:${seconds}`;
};
