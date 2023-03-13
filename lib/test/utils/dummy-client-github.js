"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClientBuilder = void 0;
class GitHubClientBuilder {
    constructor() {
        this.url = 'https://www.github.com/neo4j/apoc';
        this.title = 'Install Traceability GitHub Action';
        this.author = 'Alice';
        this.commits = [];
        this.comments = [];
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
    withPullRequestCommitMessage(message) {
        this.commits.push({ commit: { message: message } });
        return this;
    }
    withPullRequestLabel(name) {
        this.labels.push({ name });
        return this;
    }
    withPullRequestComment(author, url, body) {
        this.comments.push({
            author: {
                login: author,
            },
            body,
            url,
        });
        return this;
    }
    build() {
        return new DummyGitHubClient(this.url, this.title, this.author, this.commits, this.comments, this.labels);
    }
}
exports.GitHubClientBuilder = GitHubClientBuilder;
class DummyGitHubClient {
    constructor(url, title, author, commits, comments, labels) {
        this.url = url;
        this.title = title;
        this.author = author;
        this.commits = commits;
        this.comments = comments;
        this.labels = labels;
    }
    getPullRequest(pullRequestNumber, repositoryOwner, repositoryName) {
        return Promise.resolve({
            url: this.url,
            title: this.title,
            author: this.author,
            commits: this.commits,
            comments: this.comments,
            labels: this.labels,
        });
    }
}
