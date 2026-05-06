import { LinearClientI } from '../../src/client-linear';
import { ERR_LINEAR_AUTH } from '../../src/errors';

interface IssueFixture {
  identifier: string;
  attachmentUrls: string[];
}

class LinearClientBuilder {
  private issues: Map<string, string[]> = new Map();
  private authFails: boolean = false;
  private attachOnAttempt?: { identifier: string; prUrl: string; attempt: number };

  withExistingIssue(identifier: string, attachmentUrls: string[] = []): LinearClientBuilder {
    this.issues.set(identifier, attachmentUrls);
    return this;
  }

  withAttachedPullRequest(identifier: string, prUrl: string): LinearClientBuilder {
    const existing = this.issues.get(identifier) ?? [];
    this.issues.set(identifier, [...existing, prUrl]);
    return this;
  }

  withAuthFailure(): LinearClientBuilder {
    this.authFails = true;
    return this;
  }

  /**
   * Simulates Linear's processing latency: the issue exists from attempt 1, but the
   * given PR URL only appears among its attachments starting at the specified attempt
   * (1-indexed). Use to drive retry-loop tests in run.ts.
   */
  withAttachmentRegisteredOnAttempt(
    identifier: string,
    prUrl: string,
    attempt: number,
  ): LinearClientBuilder {
    if (!this.issues.has(identifier)) this.issues.set(identifier, []);
    this.attachOnAttempt = { identifier, prUrl, attempt };
    return this;
  }

  build(): LinearClientI {
    return new DummyLinearClient(this.issues, this.authFails, this.attachOnAttempt);
  }
}

class DummyLinearClient implements LinearClientI {
  private callCounts: Map<string, number> = new Map();

  constructor(
    private readonly issues: Map<string, string[]>,
    private readonly authFails: boolean,
    private readonly attachOnAttempt?: { identifier: string; prUrl: string; attempt: number },
  ) {}

  async getIssueAttachmentUrls(identifier: string): Promise<string[] | null> {
    if (this.authFails) {
      throw new Error(ERR_LINEAR_AUTH());
    }
    const baseUrls = this.issues.get(identifier);
    if (baseUrls === undefined) return null;

    const callCount = (this.callCounts.get(identifier) ?? 0) + 1;
    this.callCounts.set(identifier, callCount);

    if (
      this.attachOnAttempt &&
      this.attachOnAttempt.identifier === identifier &&
      callCount >= this.attachOnAttempt.attempt
    ) {
      return [...baseUrls, this.attachOnAttempt.prUrl];
    }
    return [...baseUrls];
  }
}

export { LinearClientBuilder };
