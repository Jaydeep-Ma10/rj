// utils/styles.ts
export const getDigitStyle = (digit: number) => {
  if (digit === 0) {
    return {
      background: "linear-gradient(135deg, #ef4444 50%, #8b5cf6 50%)",
      textColor: "#ef4444",
    };
  } else if (digit === 5) {
    return {
      background: "linear-gradient(135deg, #22c55e 50%, #8b5cf6 50%)",
      textColor: "#22c55e",
    };
  } else if ([2, 4, 6, 8].includes(digit)) {
    return {
      background: "#ef4444",
      textColor: "#ef4444",
    };
  } else if ([1, 3, 7, 9].includes(digit)) {
    return {
      background: "#22c55e",
      textColor: "#22c55e",
    };
  } else {
    return {
      background: "#4b5563",
      textColor: "#4b5563",
    };
  }
};
