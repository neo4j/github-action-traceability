"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSupportedAction = exports.assertSupportedEvent = void 0;
const assertSupportedEvent = (githubClient) => {
    if (githubClient.getContextEvent() !== 'pull_request')
        throw new Error(`Event ${githubClient.getContextEvent()} is unsupported. Only 'pull_request' events are supported.`);
};
exports.assertSupportedEvent = assertSupportedEvent;
const assertSupportedAction = (githubClient) => {
    if (!['opened', 'reopened', 'edited'].some((el) => el === githubClient.getContextAction()))
        throw new Error(`Action ${githubClient.getContextAction()} is unsupported. Only 'opened', 'reopened', 'edited' actions are supported.`);
};
exports.assertSupportedAction = assertSupportedAction;
