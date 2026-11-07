export function csvCell(value: string) {
  return /[",;\r\n]/.test(value) ? `"${value.replace(/"/g, "\"\"")}"` : value;
}

export function csvLine(values: string[]) {
  return values.map(csvCell).join(",");
}

function delimiterOf(text: string) {
  const header = text.slice(0, text.search(/\r?\n|$/));
  return (header.match(/;/g)?.length ?? 0) > (header.match(/,/g)?.length ?? 0) ? ";" : ",";
}

export function parseCsv(text: string): string[][] {
  const source = text.replace(/^﻿/, "");
  const delimiter = delimiterOf(source);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === "\"" && source[i + 1] === "\"") {
        field += "\"";
        i++;
      } else if (char === "\"") {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === "\"") {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function decodeCsvBytes(bytes: ArrayBuffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}
