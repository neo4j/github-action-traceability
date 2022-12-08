"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSupportedAction = exports.assertSupportedEvent = void 0;
const assertSupportedEvent = (githubClient) => {
    if (githubClient.getContextEvent() !== 'pull_request')
        throw new Error(`Github event "${githubClient.getContextEvent()}" is unsupported. ` +
            'Only "pull_request" is supported.');
};
exports.assertSupportedEvent = assertSupportedEvent;
const assertSupportedAction = (githubClient) => {
    if (!['opened', 'reopened', 'edited'].some((el) => el === githubClient.getContextAction()))
        throw new Error(`Github action "${githubClient.getContextAction()}" is unsupported. Only "opened", "reopened", ` +
            '"edited" are supported.');
};
exports.assertSupportedAction = assertSupportedAction;
