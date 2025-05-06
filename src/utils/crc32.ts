function makeTable(): number[] {
  return [...Array.from({ length: 256 }).fill(0)].map((_, id) => {
    let c = id;
    Array.from({ length: 8 })
      .fill(0)
      .forEach(() => {
        c = c & 1 ? 0xed_b8_83_20 ^ (c >>> 1) : c >>> 1;
      });
    return c >>> 0;
  });
}

function crcTable(arr: Uint8Array | undefined): number {
  let crc = 0 ^ -1;

  if (!arr || arr.length === 0) return crc;

  const table = makeTable();

  arr.forEach((item) => {
    crc = (crc >>> 8) ^ table[(crc ^ item) & 0xff];
  });

  return crc ^ -1;
}

// https://www.npmjs.com/package/crc32
export function crc32(str: string): string {
  const encoder = new TextEncoder();
  const byteArray: Uint8Array = encoder.encode(str);
  const table: number = crcTable(byteArray);
  return (table >>> 0).toString(16);
}
