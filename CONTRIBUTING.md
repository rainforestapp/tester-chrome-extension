# Contributing to the Extension

Contributions are welcome, but please keep all discussion focused on the
extension. Other technical issues (related to VMs etc.) or testing-related
questions and discussions should go to the
[tester forum](https://forum.rainforestqa.com/).

## General Conduct

Please keep discussion positive and constructive. If you're rude or overly
negative you'll be blocked from the repo, possibly without warning.

## Opening Issues

You should open an issue in one of two cases:

1. You think you've found a bug *in the extension*.
2. You'd like to request a feature *in the extension*.

### Bug Reports

Bug reports are welcome, but please follow these guidelines:

1. Make sure your issue is extension-related and not a problem with the tester
   terminal, VMs, etc.
2. Look through existing open issues to see if your issue has already been
   reported.
3. If it hasn't already been reported, open a new issue with *as many details as
   possible* (ideally, steps to consistently reproduce the issue). Keep each
   GitHub issue focused on a single problem (don't put multiple problems in the
   same issue).

Examples of good bug reports:

- "My extension gets stuck in 'OFF' state when I _" (followed by details)
- "The extension sometimes opens 2 work tabs" (followed by details)

Examples of bad bug reports:

- "The extension isn't working!"
- "My VMs keep disconnecting" (not extension-related)
- "Not enough work!"

#### How do I know if an issue is extension-related?

If the extension itself is behaving strangely (not turning green, WIP not going
away, etc.), it's probably an extension-related problem.

The following issues are *not* extension-related:

- VM connection problems
- Tester terminal error messages (e.g. "Could not fetch _ machine")
- Work availability

Report those issues on the tester forum instead.

### Feature Requests

Feature requests are always welcome, but be aware that they might take some time
to implement (unless you want to submit a pull request). Examples of good
feature requests:

- "It would be nice if there was a notification when _ happens."
- "I'd like to be able to customize _ in the extension."

Examples of bad feature requests:

- "I'd like it if the tester terminal had a timing clock." (This isn't
  extension-related and should go to the forum.)
- "I hate the arpeggio sound."
- "Not enough work!"

## Contributing Code

Contributions are welcome! Please keep the following in mind:

- It's usually best to open a GitHub issue *before* you start working on the
  code so that technical plans can be discussed.
- Follow the
  [Rainforest frontend conventions](https://github.com/rainforestapp/frontend-conventions)
  where it makes sense.
- Always follow the ESLint style suggestions.
- State should be managed with [Redux](http://redux.js.org/); if you're not
  familiar,
  [this video guide](https://egghead.io/courses/getting-started-with-redux) is a
  great resource.
- Always write tests to go along with your changes (our tests are written with
  [mocha](https://mochajs.org/) and [chai](http://chaijs.com/)).
