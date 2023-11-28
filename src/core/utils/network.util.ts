import { get } from 'https';

export async function getBufferFromUrl(url: string): Promise<Buffer> {
  return new Promise((resolve) => {
    get(url, (response) => {
      const body: Buffer[] = [];
      response
        .on('data', (chunk: Buffer) => {
          body.push(chunk);
        })
        .on('end', () => {
          resolve(Buffer.concat(body));
        });
    });
  });
}
