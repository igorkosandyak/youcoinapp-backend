import { Injectable } from '@nestjs/common';

@Injectable()
export class VectorUtils {
  constructor() {}

  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!this.validateDimensions(vecA, vecB)) throw new Error('Vector dimensions must match');
    const [normA, normB] = [this.normalize(vecA), this.normalize(vecB)];
    return normA.reduce((sum, val, i) => sum + val * normB[i], 0);
  }

  validateDimensions(vecA: number[], vecB: number[]): boolean {
    return vecA.length === vecB.length;
  }

  normalize(vec: number[]): number[] {
    const mag = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    return mag ? vec.map(x => x / mag) : vec;
  }
}
