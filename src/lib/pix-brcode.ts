// PIX "Copia e Cola" (BR Code estático) — sem dependências externas.
// Gera o payload EMV conforme spec do Banco Central:
// https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf

function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function normalizeAscii(input: string, maxLen: number): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, maxLen);
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export type PixCodeInput = {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amountCents?: number | null;
  txid?: string;
  description?: string;
};

export function buildPixBrCode(input: PixCodeInput): string {
  const key = input.pixKey.trim();
  const name = normalizeAscii(input.merchantName || "RECEBEDOR", 25) || "RECEBEDOR";
  const city = normalizeAscii(input.merchantCity || "BRASIL", 15) || "BRASIL";
  const txid = (input.txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";

  // Merchant Account Information — PIX
  const gui = emv("00", "br.gov.bcb.pix");
  const pixKeyField = emv("01", key);
  let merchantAccount = gui + pixKeyField;
  if (input.description) {
    const desc = input.description.slice(0, 40);
    merchantAccount += emv("02", desc);
  }
  const mai = emv("26", merchantAccount);

  const additionalData = emv("62", emv("05", txid));

  let payload = "";
  payload += emv("00", "01"); // Payload Format Indicator
  payload += mai;
  payload += emv("52", "0000"); // MCC
  payload += emv("53", "986"); // BRL
  if (input.amountCents && input.amountCents > 0) {
    const amount = (input.amountCents / 100).toFixed(2);
    payload += emv("54", amount);
  }
  payload += emv("58", "BR");
  payload += emv("59", name);
  payload += emv("60", city);
  payload += additionalData;
  payload += "6304"; // CRC field header

  const crc = crc16(payload);
  return payload + crc;
}