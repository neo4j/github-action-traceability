"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const client_inputs_1 = require("./client-inputs");
const client_github_1 = require("./client-github");
const client_trello_1 = require("./client-trello");
const run_1 = require("./run");
const inputs = new client_inputs_1.InputsClient();
const github = new client_github_1.GithubClient(inputs.getGitHubApiToken());
const trello = new client_trello_1.TrelloClient(inputs.getTrelloApiKey(), inputs.getTrelloApiToken());
(0, run_1.run)(inputs, github, trello)
    .then(() => {
    core.setOutput('Traceability check completed successfully', 0);
})
    .catch((error) => {
    if (error instanceof Error) {
        core.setFailed(error);
    }
    core.setFailed(`Failed with unexpected error ${error}`);
});
