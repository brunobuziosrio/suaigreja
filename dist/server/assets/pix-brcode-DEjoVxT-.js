function emv(id, value) {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}
function normalizeAscii(input, maxLen) {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "").trim().toUpperCase().slice(0, maxLen);
}
function crc16(payload) {
  let crc = 65535;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 32768) !== 0 ? (crc << 1 ^ 4129) & 65535 : crc << 1 & 65535;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
function buildPixBrCode(input) {
  const key = input.pixKey.trim();
  const name = normalizeAscii(input.merchantName || "RECEBEDOR", 25) || "RECEBEDOR";
  const city = normalizeAscii(input.merchantCity || "BRASIL", 15) || "BRASIL";
  const txid = (input.txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
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
  payload += emv("00", "01");
  payload += mai;
  payload += emv("52", "0000");
  payload += emv("53", "986");
  if (input.amountCents && input.amountCents > 0) {
    const amount = (input.amountCents / 100).toFixed(2);
    payload += emv("54", amount);
  }
  payload += emv("58", "BR");
  payload += emv("59", name);
  payload += emv("60", city);
  payload += additionalData;
  payload += "6304";
  const crc = crc16(payload);
  return payload + crc;
}
export {
  buildPixBrCode as b
};
