import { expect } from '@jest/globals';

const expectThrows = async (p: Promise<void>, errorMessage: string) => {
  expect.assertions(1);
  await expect(p).rejects.toEqual(errorMessage);
};

const expectSuccess = async (p: Promise<void>) => {
  expect.assertions(1);
  await expect(p).resolves.not.toThrow();
};

export { expectThrows, expectSuccess };
