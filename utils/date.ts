export const simpleFormatDate = (date: Date | string | number) => {
  return new Date(date).toLocaleString()
}
