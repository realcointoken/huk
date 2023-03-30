export const Latinise: {latinMap: {[symbol: string]: string}} = {
  latinMap: {
    τ: 't',
    Τ: 'T',
  },
}

export const latinise = (input: string) => {
  return input.replace(/[^A-Za-z0-9[\] ]/g, (x) => Latinise.latinMap[x] || x)
}
