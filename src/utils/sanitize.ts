/**
 * Security & Input Validation Helper
 * Escapes HTML characters and neutralizes injection triggers.
 */
export function sanitizeInput(text: any, maxLength: number = 300): string {
  if (typeof text !== 'string') return '';
  
  // Truncate to avoid payload overflow / token abuse
  let clean = text.slice(0, maxLength);
  
  // HTML character escaping to block potential XSS attacks
  clean = clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  // Neutralize common prompt injection trigger words
  const injectionPatterns = [
    /ignore\s+(?:all\s+)?previous\s+instructions/gi,
    /ignore\s+(?:all\s+)?prior\s+instructions/gi,
    /system\s+instructions/gi,
    /you\s+are\s+now\s+a/gi,
    /you\s+must\s+act\s+as/gi,
    /bypass\s+the\s+rules/gi,
    /new\s+role/gi,
    /dan\s+mode/gi,
    /ignore\s+rules/gi,
    /forget\s+everything/gi,
    /developer\s+mode/gi
  ];

  for (const pattern of injectionPatterns) {
    clean = clean.replace(pattern, "[Security Neutralized]");
  }

  return clean;
}
