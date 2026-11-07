// sms-segments.js
// GSM 03.38 default alphabet (without the escape code) and its extension table.
const GSM7_BASIC = new Set(
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?' +
  '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà'
);
const GSM7_EXTENDED = new Set('\f^{}\\[~]|€'); // each one costs 2 septets

function smsSegments(text) {
  const chars = Array.from(text); // code points, so an emoji is one item
  const gsm7 = chars.every((c) => GSM7_BASIC.has(c) || GSM7_EXTENDED.has(c));

  // GSM-7 counts septets; UCS-2 counts UTF-16 code units (an emoji is 2).
  const costs = chars.map((c) => (gsm7 ? (GSM7_EXTENDED.has(c) ? 2 : 1) : c.length));
  const units = costs.reduce((sum, n) => sum + n, 0);
  const single = gsm7 ? 160 : 70;
  const perPart = gsm7 ? 153 : 67;

  let segments = 1;
  if (units > single) {
    // Fill parts one character at a time, so an escape pair or an
    // emoji is never cut in half between two parts.
    let used = 0;
    for (const n of costs) {
      if (used + n > perPart) {
        segments += 1;
        used = 0;
      }
      used += n;
    }
  }
  return { encoding: gsm7 ? 'GSM-7' : 'UCS-2', units, segments };
}

// Which characters pushed the message out of GSM-7?
function nonGsmChars(text) {
  const found = Array.from(text).filter((c) => !GSM7_BASIC.has(c) && !GSM7_EXTENDED.has(c));
  return [...new Set(found)];
}

module.exports = { smsSegments, nonGsmChars };
