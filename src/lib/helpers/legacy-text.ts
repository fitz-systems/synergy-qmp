import { htmlEntities, mojibakePattern, windows1252Extras } from "../../constants/legacy-migration.ts";

const strictUtf8 = new TextDecoder("utf-8", { fatal: true });

function windows1252Char(byte: number) {
  return windows1252Extras[byte] ?? String.fromCharCode(byte);
}

const windows1252Bytes = new Map(Array.from({ length: 256 }, (_, byte) => [windows1252Char(byte), byte]));

export function decodeLegacyBytes(bytes: Uint8Array) {
  try {
    return strictUtf8.decode(bytes).replace(/^﻿/, "");
  } catch {
    return Array.from(bytes, windows1252Char).join("");
  }
}

export function createTextCleaner() {
  const repairs = { mojibake: 0, entities: 0, unknownEntities: new Set<string>() }

  function repairMojibake(value: string) {
    if (!mojibakePattern.test(value)) return value;
    const bytes = [...value].map((char) => windows1252Bytes.get(char));
    if (bytes.some((byte) => byte === undefined)) return value;
    try {
      const repaired = strictUtf8.decode(Uint8Array.from(bytes as number[]));
      repairs.mojibake++;
      return repaired;
    } catch {
      return value;
    }
  }

  function decodeEntities(value: string) {
    if (!value.includes("&")) return value;
    const decoded = value.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (entity, body: string) => {
      const replacement = decodeEntity(body);
      if (replacement === null) repairs.unknownEntities.add(entity);
      return replacement ?? entity;
    });
    if (decoded !== value) repairs.entities++;
    return decoded;
  }

  function clean(value: string) {
    return decodeEntities(repairMojibake(value)).replace(/\s+/g, " ").trim();
  }

  return { clean, repairs }
}

function decodeEntity(body: string) {
  if (body.startsWith("#")) {
    const code = body[1].toLowerCase() === "x" ? parseInt(body.slice(2), 16) : Number(body.slice(1));
    if (code >= 0x80 && code <= 0x9f) return windows1252Char(code);
    return Number.isFinite(code) ? String.fromCodePoint(code) : null;
  }
  return htmlEntities[body] ?? null;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function unprefixedEmail(email: string) {
  return email.replace(/^\d+/, "");
}

export function comparableName(name: string) {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
}
