import { run } from '../src/index';

import { DummyGithubClientBuilder } from './dummy-client-github';
import { DummyTrelloClientBuilder } from './dummy-client-trello';
import { DummyInputsClientBuilder } from './dummy-client-inputs';

const inputs = new DummyInputsClientBuilder().build();
const github = new DummyGithubClientBuilder().build();
const trello = new DummyTrelloClientBuilder().build();

run(inputs, github, trello);
