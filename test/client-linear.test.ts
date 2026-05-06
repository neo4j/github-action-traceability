import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { LinearClient } from '../src/client-linear';
import { ERR_LINEAR_AUTH, ERR_LINEAR_RATE_LIMITED } from '../src/errors';

type FetchArgs = Parameters<typeof fetch>;
type FetchReturn = ReturnType<typeof fetch>;

const jsonResponse = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);

describe('LinearClient.getIssueAttachmentUrls', () => {
  let fetchMock: jest.Mock<(...args: FetchArgs) => FetchReturn>;
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchMock = jest.fn<(...args: FetchArgs) => FetchReturn>();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns attachment URLs when the issue exists', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        data: {
          issue: {
            id: 'issue-uuid',
            attachments: {
              nodes: [{ url: 'https://github.com/x/y/pull/1' }, { url: 'https://example.com' }],
            },
          },
        },
      }),
    );
    const client = new LinearClient('lin_api_test');
    const urls = await client.getIssueAttachmentUrls('NEO-123');
    expect(urls).toEqual(['https://github.com/x/y/pull/1', 'https://example.com']);
  });

  it('sends the API key in the Authorization header without a Bearer prefix', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { data: { issue: { id: 'x', attachments: { nodes: [] } } } }),
    );
    const client = new LinearClient('lin_api_secret');
    await client.getIssueAttachmentUrls('NEO-1');
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)['Authorization']).toBe('lin_api_secret');
  });

  it('returns null when data.issue is null', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { data: { issue: null } }));
    const client = new LinearClient('k');
    expect(await client.getIssueAttachmentUrls('NEO-999')).toBeNull();
  });

  it('returns null when the GraphQL response signals NotFound', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        errors: [{ message: 'Entity not found: Issue', extensions: { type: 'NotFound' } }],
      }),
    );
    const client = new LinearClient('k');
    expect(await client.getIssueAttachmentUrls('NEO-999')).toBeNull();
  });

  it('throws ERR_LINEAR_AUTH on HTTP 401', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, {}));
    const client = new LinearClient('bad');
    await expect(client.getIssueAttachmentUrls('NEO-1')).rejects.toThrow(ERR_LINEAR_AUTH());
  });

  it('throws ERR_LINEAR_AUTH on HTTP 403', async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, {}));
    const client = new LinearClient('bad');
    await expect(client.getIssueAttachmentUrls('NEO-1')).rejects.toThrow(ERR_LINEAR_AUTH());
  });

  it('throws ERR_LINEAR_RATE_LIMITED on HTTP 429', async () => {
    fetchMock.mockResolvedValue(jsonResponse(429, {}));
    const client = new LinearClient('k');
    await expect(client.getIssueAttachmentUrls('NEO-1')).rejects.toThrow(ERR_LINEAR_RATE_LIMITED());
  });

  it('throws ERR_LINEAR_AUTH when GraphQL errors signal authentication failure', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        errors: [
          { message: 'Authentication required', extensions: { code: 'AUTHENTICATION_ERROR' } },
        ],
      }),
    );
    const client = new LinearClient('k');
    await expect(client.getIssueAttachmentUrls('NEO-1')).rejects.toThrow(ERR_LINEAR_AUTH());
  });

  it('throws ERR_LINEAR_RATE_LIMITED when GraphQL errors signal rate limiting', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        errors: [{ message: 'Rate limit exceeded', extensions: { code: 'RATELIMITED' } }],
      }),
    );
    const client = new LinearClient('k');
    await expect(client.getIssueAttachmentUrls('NEO-1')).rejects.toThrow(ERR_LINEAR_RATE_LIMITED());
  });

  it('throws a generic error for unexpected non-2xx HTTP responses', async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, {}));
    const client = new LinearClient('k');
    await expect(client.getIssueAttachmentUrls('NEO-1')).rejects.toThrow('HTTP 500');
  });

  it('throws a descriptive error for unrecognised GraphQL errors', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { errors: [{ message: 'Something exploded' }] }));
    const client = new LinearClient('k');
    await expect(client.getIssueAttachmentUrls('NEO-1')).rejects.toThrow('Something exploded');
  });
});
