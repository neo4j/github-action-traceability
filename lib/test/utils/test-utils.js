"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectSuccess = exports.expectThrows = void 0;
const globals_1 = require("@jest/globals");
const expectThrows = (p, errorMessage) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, globals_1.expect)(p).rejects.toThrowError(errorMessage);
});
exports.expectThrows = expectThrows;
const expectSuccess = (p) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, globals_1.expect)(p).resolves.not.toThrow();
});
exports.expectSuccess = expectSuccess;
