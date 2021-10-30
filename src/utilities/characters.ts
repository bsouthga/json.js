export function isDigit(char: string): boolean {
  return char === '0' || isNonZeroDigit(char);
}

export function isHexDigit(char: string): boolean {
  switch (char) {
    case 'a':
    case 'b':
    case 'c':
    case 'd':
    case 'e':
    case 'f':
    case 'A':
    case 'B':
    case 'C':
    case 'D':
    case 'E':
    case 'F':
      return true;
    default: {
      return isDigit(char);
    }
  }
}

export function isNonZeroDigit(char: string): boolean {
  switch (char) {
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9': {
      return true;
    }
  }

  return false;
}

export function isLiteral(s: string, i: number, literal: string): boolean {
  for (let j = 0; j < literal.length; j++) {
    if (s[i + j] !== literal[j]) {
      return false;
    }
  }

  return true;
}

export function isWhiteSpaceLiteral(char: string): boolean {
  switch (char) {
    case '\n':
    case '\r':
    case '\t':
      return true;
    default:
      return false;
  }
}

export function isControlCharacter(char: string): boolean {
  const code = char.charCodeAt(0);
  return code < 0x1f || (code > 0x80 && code < 0x9f);
}

export function isWhitespace(char: string): boolean {
  return char === ' ' || isWhiteSpaceLiteral(char);
}

export function escapeChar(char: string): string {
  switch (char) {
    case '\\':
      return '\\\\';
    case '"':
      return '\\"';
    case '\f':
      return '\\f';
    case '\r':
      return '\\r';
    case '\t':
      return '\\t';
    case '\b':
      return '\\b';
    case '\n':
      return '\\n';
    default:
      if (isControlCharacter(char)) {
        return '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0');
      }
      return char;
  }
}

export function escapeString(value: string): string {
  const pieces = ['"'];

  for (let i = 0; i < value.length; i++) {
    pieces.push(escapeChar(value[i]));
  }

  pieces.push('"');
  return pieces.join('');
}

export function fillSpaces(n: number): string {
  return new Array(n).fill(' ').join('');
}
