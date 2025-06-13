import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugToOriginalText(slug: string): string {
  if (!slug) {
    return '';
  }

  // 1. Replace hyphens with spaces
  const textWithSpaces = slug.replace(/-/g, ' ');

  // 2. Capitalize the first letter of each word
  // Split the string by spaces, capitalize each word, then join back
  const words = textWithSpaces.split(' ');
  const capitalizedWords = words.map(word => {
    if (word.length === 0) {
      return ''; // Handle multiple spaces
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return capitalizedWords.join(' ');
}