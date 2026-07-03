// Parser e gerador de CSV minimalistas (RFC4180: aspas, escape de aspas
// duplicadas, campos com quebra de linha), com deteccao automatica de
// delimitador (virgula ou ponto-e-virgula, comum em exportacoes do Excel
// em pt-BR).
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

const BOM_CHAR_CODE = 0xfeff;

export function parseCsv(text: string): string[][] {
  const clean = text.charCodeAt(0) === BOM_CHAR_CODE ? text.slice(1) : text;
  const delimiter = detectDelimiter(clean);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < clean.length) {
    const char = clean[i];
    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === delimiter) {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (char === "\r") {
      i++;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += char;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

export function buildCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  return lines.join("\r\n");
}

// Normaliza um cabecalho de coluna para comparacao: minusculas, sem acento,
// espacos/hifens viram underscore. Remove marcas diacriticas (NFD + faixa
// U+0300-U+036F) em vez de comparar caractere a caractere acentuado.
export function normalizeHeader(header: string): string {
  const decomposed = header.trim().toLowerCase().normalize("NFD");
  let withoutAccents = "";
  for (const ch of decomposed) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x0300 && code <= 0x036f) continue;
    withoutAccents += ch;
  }
  return withoutAccents.replace(/[\s-]+/g, "_");
}
