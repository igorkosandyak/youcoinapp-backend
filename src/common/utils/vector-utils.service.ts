import { Injectable } from '@nestjs/common';

@Injectable()
export class VectorUtils {
  constructor() {}

  cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

    return magA && magB ? dot / (magA * magB) : 0;
  }
}
