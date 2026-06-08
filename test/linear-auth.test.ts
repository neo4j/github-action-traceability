import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { resolveLinearAuthorization } from '../src/linear-auth';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { ERR_NO_LINEAR_AUTH } from '../src/errors';

type FetchArgs = Parameters<typeof fetch>;
type FetchReturn = ReturnType<typeof fetch>;

const tokenResponse = (accessToken: string): Response =>
  ({
    ok: true,
    status: 200,
    json: async () => ({ access_token: accessToken }),
  } as Response);

describe('resolveLinearAuthorization', () => {
  let fetchMock: jest.Mock<(...args: FetchArgs) => FetchReturn>;
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchMock = jest.fn<(...args: FetchArgs) => FetchReturn>();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns the personal API key verbatim when only an API key is configured', async () => {
    const inputs = new InputsClientBuilder().withLinearApiKey('lin_api_xyz').build();
    expect(await resolveLinearAuthorization(inputs)).toBe('lin_api_xyz');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mints an app token and returns a Bearer header when client credentials are configured', async () => {
    fetchMock.mockResolvedValue(tokenResponse('app-token'));
    const inputs = new InputsClientBuilder()
      .withLinearApiKey('')
      .withLinearClientCredentials('client-id', 'client-secret')
      .build();
    expect(await resolveLinearAuthorization(inputs)).toBe('Bearer app-token');
  });

  it('prefers client credentials over a personal API key when both are configured', async () => {
    fetchMock.mockResolvedValue(tokenResponse('app-token'));
    const inputs = new InputsClientBuilder()
      .withLinearApiKey('lin_api_xyz')
      .withLinearClientCredentials('client-id', 'client-secret')
      .build();
    expect(await resolveLinearAuthorization(inputs)).toBe('Bearer app-token');
  });

  it('throws ERR_NO_LINEAR_AUTH when no credential is configured', async () => {
    const inputs = new InputsClientBuilder().withLinearApiKey('').build();
    await expect(resolveLinearAuthorization(inputs)).rejects.toThrow(ERR_NO_LINEAR_AUTH());
  });
});
