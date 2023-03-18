import { Potrace } from "potrace";

export async function vectorize(buf: Buffer): Promise<string> {
  const tracer = new Potrace();

  return new Promise((resolve, reject) => {
    tracer.loadImage(buf, (err) => {
      if (err) return reject(err);

      const svg = tracer.getSVG();
      resolve(svg);
    });
  });
}
