type Chunk = { chunk: string; index: number };

export function splitEveryN(str: string, n = 1024): Array<Chunk> {
  const arr: Array<Chunk> = [];
  let chunkIndex = 1;

  for (let index = 0; index < str.length; index += n) {
    arr.push({ chunk: str.slice(index, index + n), index: chunkIndex });
    chunkIndex++;
  }

  return arr;
}
