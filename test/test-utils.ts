import { expect } from '@jest/globals';

const expectThrows = async (p: Promise<void>, errorMessage: string) => {
  await expect(p).rejects.toThrowError(errorMessage);
};

const expectSuccess = async (p: Promise<void>) => {
  await expect(p).resolves.not.toThrow();
};

export { expectThrows, expectSuccess };
