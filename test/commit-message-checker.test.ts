// describe('commit-message-checker tests', () => {
//   beforeAll(() => {
//     // Now import
//     commitMessageChecker = require('../lib/commit-message-checker');
//   });
//
//   it('requires pattern', async () => {
//     const checkerArguments: ICheckerArguments = {
//       pattern: '',
//       flags: '',
//       error: '',
//       messages: [],
//     };
//     await expect(commitMessageChecker.checkCommitMessages(checkerArguments)).rejects.toThrow(
//       'PATTERN not defined.',
//     );
//   });
//
//   it('requires valid flags', async () => {
//     const checkerArguments: ICheckerArguments = {
//       pattern: 'some-pattern',
//       flags: 'abcdefgh',
//       error: '',
//       messages: [],
//     };
//     await expect(commitMessageChecker.checkCommitMessages(checkerArguments)).rejects.toThrow(
//       'FLAGS contains invalid characters "abcdefh".',
//     );
//   });
//
//   it('requires error message', async () => {
//     const checkerArguments: ICheckerArguments = {
//       pattern: 'some-pattern',
//       flags: '',
//       error: '',
//       messages: [],
//     };
//     await expect(commitMessageChecker.checkCommitMessages(checkerArguments)).rejects.toThrow(
//       'ERROR not defined.',
//     );
//   });
//
//   it('requires messages', async () => {
//     const checkerArguments: ICheckerArguments = {
//       pattern: 'some-pattern',
//       flags: '',
//       error: 'some-error',
//       messages: [],
//     };
//     await expect(commitMessageChecker.checkCommitMessages(checkerArguments)).rejects.toThrow(
//       'MESSAGES not defined.',
//     );
//   });
//
//   it('check fails single message', async () => {
//     const checkerArguments: ICheckerArguments = {
//       pattern: 'some-pattern',
//       flags: '',
//       error: 'some-error',
//       messages: ['some-message'],
//     };
//     await expect(commitMessageChecker.checkCommitMessages(checkerArguments)).rejects.toThrow(
//       'some-error',
//     );
//   });
//
//   it('check fails multiple messages', async () => {
//     const checkerArguments: ICheckerArguments = {
//       pattern: 'some-pattern',
//       flags: '',
//       error: 'some-error',
//       messages: ['some-message', 'some-pattern'],
//     };
//     await expect(commitMessageChecker.checkCommitMessages(checkerArguments)).rejects.toThrow(
//       'some-error',
//     );
//   });
//
//   it('check succeeds on single message', async () => {
//     const checkerArguments: ICheckerArguments = {
//       pattern: '.*',
//       flags: '',
//       error: 'some-error',
//       messages: ['some-message'],
//     };
//     await expect(
//       commitMessageChecker.checkCommitMessages(checkerArguments),
//     ).resolves.toBeUndefined();
//   });
//
//   it('check succeeds on multiple messages', async () => {
//     const checkerArguments: ICheckerArguments = {
//       pattern: '.*',
//       flags: '',
//       error: 'some-error',
//       messages: ['some-message', 'other-message'],
//     };
//     await expect(
//       commitMessageChecker.checkCommitMessages(checkerArguments),
//     ).resolves.toBeUndefined();
//   });
// });
