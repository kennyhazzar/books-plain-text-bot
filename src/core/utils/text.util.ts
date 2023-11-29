type Chunk = { chunk: string; index: number };
type SplitResult = { chunks: Array<Chunk>; totalIndex: number };

export function splitEveryN(str: string, n = 4096): SplitResult {
  const chunks: Array<Chunk> = [];
  let chunkIndex = 1;

  for (let index = 0; index < str.length; index += n) {
    chunks.push({ chunk: str.slice(index, index + n), index: chunkIndex });
    chunkIndex++;
  }

  return { chunks, totalIndex: chunkIndex };
}
