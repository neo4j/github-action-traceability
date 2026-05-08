"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClientBuilder = void 0;
class GitHubClientBuilder {
    constructor() {
        this.url = 'https://github.com/neo4j/apoc/pull/1';
        this.title = 'Install Traceability GitHub Action';
        this.body = '';
        this.author = 'Alice';
        this.headRefName = 'feature/install-action';
        this.baseRefName = 'dev';
        this.labels = [];
    }
    withPullRequestUrl(url) {
        this.url = url;
        return this;
    }
    withPullRequestTitle(title) {
        this.title = title;
        return this;
    }
    withPullRequestBody(body) {
        this.body = body;
        return this;
    }
    withHeadRefName(headRefName) {
        this.headRefName = headRefName;
        return this;
    }
    withBaseRefName(baseRefName) {
        this.baseRefName = baseRefName;
        return this;
    }
    withPullRequestLabel(name) {
        this.labels.push({ name });
        return this;
    }
    build() {
        return new DummyGitHubClient(this.url, this.title, this.body, this.author, this.headRefName, this.baseRefName, this.labels);
    }
}
exports.GitHubClientBuilder = GitHubClientBuilder;
class DummyGitHubClient {
    constructor(url, title, body, author, headRefName, baseRefName, labels) {
        this.url = url;
        this.title = title;
        this.body = body;
        this.author = author;
        this.headRefName = headRefName;
        this.baseRefName = baseRefName;
        this.labels = labels;
    }
    getPullRequest(_pullRequestNumber, _repositoryOwner, _repositoryName) {
        return Promise.resolve({
            url: this.url,
            title: this.title,
            body: this.body,
            author: this.author,
            headRefName: this.headRefName,
            baseRefName: this.baseRefName,
            labels: this.labels,
        });
    }
}
