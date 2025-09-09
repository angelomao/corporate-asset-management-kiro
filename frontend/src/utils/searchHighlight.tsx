import React from 'react';

/**
 * Highlights search terms in text
 * @param text - The text to highlight
 * @param searchTerm - The search term to highlight
 * @returns JSX element with highlighted text
 */
export function highlightSearchTerm(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm || !text) {
    return text;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      );
    }
    return part;
  });
}

/**
 * Checks if text matches search criteria
 * @param text - The text to search in
 * @param searchTerm - The search term
 * @returns Boolean indicating if there's a match
 */
export function matchesSearchTerm(text: string, searchTerm: string): boolean {
  if (!searchTerm || !text) {
    return true;
  }
  
  return text.toLowerCase().includes(searchTerm.toLowerCase());
}