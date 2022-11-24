import { describe, it, expect } from '@jest/globals';
import { run } from '../src/index';

import { GithubClientBuilder } from './dummy-client-github';
import { InputsClientBuilder } from './dummy-client-inputs';
import { TrelloClientBuilder } from './dummy-client-trello';

describe('compiles', () => {
  it('run', () => {
    const github = new GithubClientBuilder().build();
    const inputs = new InputsClientBuilder().build();
    const trello = new TrelloClientBuilder().build();
    run(inputs, github, trello);
  });
});
