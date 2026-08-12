export function convertApiAmountToTokenAmount(apiAmount: string): bigint {
  const amountStr = apiAmount.toString();

  if (amountStr.toUpperCase().includes("E")) {
    const [mantissaStr, expStr] = amountStr.toUpperCase().split("E");
    const [intPart, decPart = ""] = mantissaStr.split(".");
    const mantissaDigits = intPart + decPart;
    const scientificExp = parseInt(expStr);
    const decimalPlaces = decPart.length;

    const actualExp = scientificExp - decimalPlaces;

    if (actualExp < 0) {
      return 0n;
    }

    const fullNumber = mantissaDigits + "0".repeat(actualExp);

    const bigIntValue = BigInt(fullNumber);
    const divisor = BigInt(10 ** 9);
    const result = bigIntValue / divisor;
    const remainder = bigIntValue % divisor;

    if (remainder >= divisor / 2n) {
      return result + 1n;
    }
    return result;
  } else {
    const [integerPart] = amountStr.split(".");
    const bigIntValue = BigInt(integerPart || "0");

    if (bigIntValue < BigInt(10 ** 9)) {
      return 0n;
    }

    return bigIntValue / BigInt(10 ** 9);
  }
}

export function formatTokenAmount(amount: bigint, decimals: number = 9): string {
  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const divisor = BigInt(10 ** decimals);
  const wholePart = abs / divisor;
  const fractionalPart = abs % divisor;

  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  const trimmedFractional = fractionalStr.replace(/0+$/, "");

  const prefix = negative ? "-" : "";
  const wholeStr = wholePart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (trimmedFractional === "") {
    return `${prefix}${wholeStr}`;
  }
  return `${prefix}${wholeStr}.${trimmedFractional}`;
}
