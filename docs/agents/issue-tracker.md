# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues in `brenner-company/mix-it`. Prefer the connected GitHub app for repository and issue operations. Use the `gh` CLI only where the connector does not cover the operation well.

## Conventions

- **Create an issue**: create it in `brenner-company/mix-it` with a descriptive title, Markdown body, and applicable labels.
- **Read an issue**: fetch the issue by number, including its description, state, labels, assignees, comments, and relationships when relevant.
- **List or search issues**: scope queries to `brenner-company/mix-it`, using state, label, milestone, or assignee filters as appropriate.
- **Comment on an issue**: add discussion and progress updates as issue comments.
- **Apply or remove labels**: use the vocabulary in `triage-labels.md`.
- **Close an issue**: close it with an explanatory comment when appropriate.
- Preserve the issue's existing milestone, assignees, and labels unless the requested workflow requires changing them.

Infer the repository from `git remote -v` when working inside the clone. For connector gaps, use the corresponding `gh issue create`, `gh issue view`, `gh issue list`, `gh issue comment`, `gh issue edit`, or `gh issue close` command.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, external pull requests run through the same labels and states as issues. Only treat pull requests from `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` as incoming requests; exclude pull requests from owners, members, and collaborators.

GitHub shares one number space across issues and pull requests, so resolve whether a bare reference such as `#42` is an issue or pull request before acting.

## When a skill says "publish to the issue tracker"

Create a GitHub issue in `brenner-company/mix-it`.

## When a skill says "fetch the relevant ticket"

Fetch the GitHub issue by number, including its comments and relationships when relevant.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single GitHub issue with child issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes, Decisions-so-far, and Fog sections.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue and carrying a `wayfinder:<type>` label (`research`, `prototype`, `grilling`, or `task`). Where sub-issues are unavailable, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Once claimed, assign it to the driving developer.
- **Blocking**: use GitHub's native issue dependencies. Where dependencies are unavailable, add a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: inspect the map's open child issues, excluding assigned or blocked issues; the first remaining child in map order wins.
- **Claim**: assign the child issue to the driving developer before beginning work.
- **Resolve**: add the answer as a comment, close the child issue, then add a context pointer to the map's Decisions-so-far section.
