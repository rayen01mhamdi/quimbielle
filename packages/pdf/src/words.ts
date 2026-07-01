export function numToFr(n: number): string {
  if (n === 0) return "zero"
  if (n < 0) return "moins " + numToFr(-n)

  const ones = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
    "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"]
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"]

  function below100(n: number): string {
    if (n < 20) return ones[n]
    const t = Math.floor(n / 10)
    const o = n % 10
    if (t === 7 || t === 9) return tens[t] + (o === 0 ? "" : "-" + ones[10 + o])
    return tens[t] + (o === 0 ? (t === 8 ? "s" : "") : "-" + ones[o])
  }

  function below1000(n: number): string {
    if (n < 100) return below100(n)
    const h = Math.floor(n / 100)
    const r = n % 100
    return (h === 1 ? "cent" : ones[h] + " cent") + (r === 0 ? (h > 1 ? "s" : "") : " " + below100(r))
  }

  const parts: string[] = []
  const millions = Math.floor(n / 1000000)
  const thousands = Math.floor((n % 1000000) / 1000)
  const rest = n % 1000

  if (millions > 0) parts.push(below1000(millions) + " million" + (millions > 1 ? "s" : ""))
  if (thousands > 0) parts.push(thousands === 1 ? "mille" : below1000(thousands) + " mille")
  if (rest > 0) parts.push(below1000(rest))

  return parts.join(" ")
}

export function numToAr(n: number): string {
  if (n === 0) return "صفر"
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
    "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"]
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"]
  const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"]

  function below1000(n: number): string {
    const h = Math.floor(n / 100)
    const rem = n % 100
    const parts = []
    if (h > 0) parts.push(hundreds[h])
    if (rem > 0 && rem < 20) parts.push(ones[rem])
    else {
      const t = Math.floor(rem / 10)
      const o = rem % 10
      if (t > 0) parts.push(tens[t])
      if (o > 0) parts.push(ones[o])
    }
    return parts.join(" و")
  }

  const parts: string[] = []
  const millions = Math.floor(n / 1000000)
  const thousands = Math.floor((n % 1000000) / 1000)
  const rest = n % 1000

  if (millions > 0) parts.push(below1000(millions) + " مليون")
  if (thousands > 0) parts.push(below1000(thousands) + " ألف")
  if (rest > 0) parts.push(below1000(rest))

  return parts.join(" و")
}