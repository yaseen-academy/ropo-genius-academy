const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion

export function generateCode(prefix = "CA") {
  let body = "";
  for (let i = 0; i < 8; i++) {
    body += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${prefix}-${body.slice(0, 4)}-${body.slice(4)}`;
}
