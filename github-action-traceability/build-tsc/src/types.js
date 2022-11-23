"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitleVerificationStrategy = exports.CommitVerificationStrategy = exports.NoIdVerificationStrategy = void 0;
var NoIdVerificationStrategy;
(function (NoIdVerificationStrategy) {
    NoIdVerificationStrategy["CASE_INSENSITIVE"] = "CASE_INSENSITIVE";
    NoIdVerificationStrategy["UPPER_CASE"] = "UPPER_CASE";
    NoIdVerificationStrategy["LOWER_CASE"] = "LOWER_CASE";
    NoIdVerificationStrategy["NEVER"] = "NEVER";
})(NoIdVerificationStrategy || (NoIdVerificationStrategy = {}));
exports.NoIdVerificationStrategy = NoIdVerificationStrategy;
var CommitVerificationStrategy;
(function (CommitVerificationStrategy) {
    CommitVerificationStrategy["ALL_COMMITS"] = "ALL_COMMITS";
    CommitVerificationStrategy["HEAD_COMMIT_ONLY"] = "HEAD_COMMIT_ONLY";
    CommitVerificationStrategy["NEVER"] = "NEVER";
})(CommitVerificationStrategy || (CommitVerificationStrategy = {}));
exports.CommitVerificationStrategy = CommitVerificationStrategy;
var TitleVerificationStrategy;
(function (TitleVerificationStrategy) {
    TitleVerificationStrategy["ALWAYS"] = "ALWAYS";
    TitleVerificationStrategy["IF_EXISTS"] = "IF_EXISTS";
    TitleVerificationStrategy["NEVER"] = "NEVER";
})(TitleVerificationStrategy || (TitleVerificationStrategy = {}));
exports.TitleVerificationStrategy = TitleVerificationStrategy;
//# sourceMappingURL=types.js.map