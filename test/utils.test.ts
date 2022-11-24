import { describe, it, expect } from '@jest/globals';
import { assertSupportedAction, assertSupportedEvent } from '../src/utils';

import { GithubClientBuilder } from './dummy-client-github';

describe('assertSupportedEvent', () => {
  it('accepts a "pull_request" event type', () => {
    const github = new GithubClientBuilder().withEvent('pull_request').build();
    expect(() => assertSupportedEvent(github)).not.toThrow();
  });

  it('fails with other event types', () => {
    const github = new GithubClientBuilder().withEvent('foobar').build();
    expect(() => assertSupportedEvent(github)).toThrow();
  });
});

describe('assertSupportedAction', () => {
  it('accepts a "opened" action type', () => {
    const github = new GithubClientBuilder().withAction('opened').build();
    expect(() => assertSupportedAction(github)).not.toThrow();
  });

  it('accepts a "reopened" action type', () => {
    const github = new GithubClientBuilder().withAction('reopened').build();
    expect(() => assertSupportedAction(github)).not.toThrow();
  });

  it('accepts a "edited" action type', () => {
    const github = new GithubClientBuilder().withAction('edited').build();
    expect(() => assertSupportedAction(github)).not.toThrow();
  });

  it('fails with other action types', () => {
    const github = new GithubClientBuilder().withAction('foobar').build();
    expect(() => assertSupportedAction(github)).toThrow();
  });
});
