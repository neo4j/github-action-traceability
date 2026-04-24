"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearIssueLink = exports.NoIdShortLink = exports.ShortLink = void 0;
class ShortLink {
    constructor(id) {
        this.id = id;
    }
}
exports.ShortLink = ShortLink;
class NoIdShortLink extends ShortLink {
    constructor(id) {
        super(id);
    }
}
exports.NoIdShortLink = NoIdShortLink;
class LinearIssueLink extends ShortLink {
    constructor(id) {
        super(id);
    }
}
exports.LinearIssueLink = LinearIssueLink;
