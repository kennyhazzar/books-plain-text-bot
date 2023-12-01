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

export function translitText(text: string) {
  return text.replace(
    /([а-яё])|([\s_-])|([^a-z\d])/gi,
    function (all, ch, space, words, i) {
      if (space || words) {
        return space ? '-' : '';
      }
      const code = ch.charCodeAt(0),
        index =
          code == 1025 || code == 1105
            ? 0
            : code > 1071
            ? code - 1071
            : code - 1039,
        t = [
          'yo',
          'a',
          'b',
          'v',
          'g',
          'd',
          'e',
          'zh',
          'z',
          'i',
          'y',
          'k',
          'l',
          'm',
          'n',
          'o',
          'p',
          'r',
          's',
          't',
          'u',
          'f',
          'h',
          'c',
          'ch',
          'sh',
          'shch',
          '',
          'y',
          '',
          'e',
          'yu',
          'ya',
        ];
      return t[index];
    },
  );
}

export const generateId = (
  length = 10,
  dict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
) => {
  const a = dict.split('');
  const token = [];
  for (let i = 0; i < length; i++) {
    const instance = (Math.random() * (a.length - 1)).toFixed(0);
    token[i] = a[instance];
  }
  return token.join('');
};
