export const currency = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
/**
 * Function to convert a given number into words.
 * @param {number} n - The number to be converted into words.
 * @returns {string} - The word representation of the given number.
 */
export function numberToWords(n: number): string | boolean {
  n = Math.trunc(n);
  if (n < 0) return false;

  // Arrays to hold words for single-digit, double-digit, and below-hundred numbers
  const single_digit = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const double_digit = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const below_hundred = [
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (n === 0) return "Zero";

  // Recursive function to translate the number into words
  function translate(n) {
    let word = "";
    if (n < 10) {
      word = single_digit[n] + " ";
    } else if (n < 20) {
      word = double_digit[n - 10] + " ";
    } else if (n < 100) {
      const rem = translate(n % 10);
      word = below_hundred[(n - (n % 10)) / 10 - 2] + " " + rem;
    } else if (n < 1000) {
      word =
        single_digit[Math.trunc(n / 100)] + " Hundred " + translate(n % 100);
    } else if (n < 1000000) {
      word =
        translate(parseInt(n / 1000)).trim() +
        " Thousand " +
        translate(n % 1000);
    } else if (n < 1000000000) {
      word =
        translate(parseInt(n / 1000000)).trim() +
        " Million " +
        translate(n % 1000000);
    } else {
      word =
        translate(parseInt(n / 1000000000)).trim() +
        " Billion " +
        translate(n % 1000000000);
    }
    return word;
  }

  // Get the result by translating the given number
  const result = translate(n);
  return result.trim();
}

/**
 * Function to convert a given number into words in French.
 * @param {number} n - The number to be converted into words.
 * @returns {string} - The word representation of the given number in French.
 */
export function numberToWordsFrench(n: number): string | boolean {
  if (n < 0) return false;

  // Arrays to hold words for single-digit, double-digit, and below-hundred numbers in French
  const single_digit = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
  ];
  const double_digit = [
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];
  const below_hundred = [
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante-dix",
    "quatre-vingt",
    "quatre-vingt-dix",
  ];

  if (n === 0) return "zéro";

  // Recursive function to translate the number into words in French
  function translate(n) {
    n = Math.trunc(n);
    let word = "";
    if (n < 10) {
      word = single_digit[n] + " ";
    } else if (n < 20) {
      word = double_digit[n - 10] + " ";
    } else if (n < 100) {
      const rem = translate(n % 10);
      word = below_hundred[(n - (n % 10)) / 10 - 2] + " " + rem;
    } else if (n < 1000) {
      word =
        (Math.trunc(n / 100) > 1 ? single_digit[Math.trunc(n / 100)] : "") +
        " cent " +
        translate(n % 100);
    } else if (n < 1000000) {
      word =
        (Math.trunc(n / 1000) > 1 ? translate(parseInt(n / 1000)).trim() : "") +
        " mille " +
        translate(n % 1000);
    } else if (n < 1000000000) {
      word =
        translate(parseInt(n / 1000000)).trim() +
        " Million " +
        translate(n % 1000000);
    } else {
      word =
        translate(parseInt(n / 1000000000)).trim() +
        " Milliard " +
        translate(n % 1000000000);
    }
    return word;
  }

  // Get the result by translating the given number
  const result = translate(n).trim();
  // uppercase first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// if running vite dev or vite build
export const isProd = import.meta.env.MODE === "production";
