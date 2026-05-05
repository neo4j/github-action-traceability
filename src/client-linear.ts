import * as core from '@actions/core';
import {
  LinearClient as LinearSdkClient,
  AuthenticationLinearError,
  ForbiddenLinearError,
  RatelimitedLinearError,
} from '@linear/sdk';
import { ERR_LINEAR_AUTH, ERR_LINEAR_RATE_LIMITED } from './errors';

interface LinearClientI {
  /**
   * Returns the URLs of all attachments on the issue with the given identifier,
   * or null if no such issue exists. Throws on auth or rate-limit errors.
   */
  getIssueAttachmentUrls(identifier: string): Promise<string[] | null>;
}

class LinearClient implements LinearClientI {
  private readonly sdk: LinearSdkClient;

  constructor(apiKey: string) {
    this.sdk = new LinearSdkClient({ apiKey });
  }

  async getIssueAttachmentUrls(identifier: string): Promise<string[] | null> {
    core.info(`Fetching Linear issue ${identifier}.`);
    let issue;
    try {
      issue = await this.sdk.issue(identifier);
    } catch (error) {
      this.rethrowFatal(error);
      return null;
    }
    if (!issue?.id) return null;

    const attachments = await issue.attachments();
    return attachments.nodes.map((a) => a.url);
  }

  private rethrowFatal(error: unknown): void {
    if (error instanceof AuthenticationLinearError || error instanceof ForbiddenLinearError) {
      throw new Error(ERR_LINEAR_AUTH());
    }
    if (error instanceof RatelimitedLinearError) {
      throw new Error(ERR_LINEAR_RATE_LIMITED());
    }
  }
}

export { LinearClient, LinearClientI };
