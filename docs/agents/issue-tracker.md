# Issue tracker: Linear

Issues and specs for this repo live in Linear under the **Brenner** team, within the **`mix-it`** project. Use the connected Linear app for all operations.

## Conventions

- Create issues in the Brenner team and assign them to the `mix-it` project.
- Read an issue by its Linear identifier, including its description, labels, state, comments, and relationships when relevant.
- List or search issues using team, state, label, project, cycle, or assignee filters as appropriate.
- Add discussion and progress updates as issue comments.
- Apply or remove labels using the vocabulary in `triage-labels.md`.
- Close an issue by moving it to the Brenner team's completed state, adding an explanatory comment when appropriate.
- Preserve the issue's existing project, cycle, priority, assignee, and labels unless the requested workflow requires changing them.

## When a skill says "publish to the issue tracker"

Create a Linear issue in the Brenner team and assign it to the `mix-it` project.

## When a skill says "fetch the relevant ticket"

Fetch the Linear issue using its identifier and include comments and relationships when relevant.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a parent Linear issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes, Decisions-so-far, and Fog sections.
- **Child ticket**: a sub-issue of the map carrying a `wayfinder:<type>` label (`research`, `prototype`, `grilling`, or `task`). Once claimed, assign it to the driving developer.
- **Blocking**: use Linear's native blocking relationships. A ticket is unblocked when all issues in its `blockedBy` relationship are completed.
- **Frontier query**: inspect the map's open child issues, excluding assigned or blocked issues; the first remaining child in map order wins.
- **Claim**: assign the child issue to the driving developer before beginning work.
- **Resolve**: add the answer as a comment, move the child issue to a completed state, then add a context pointer to the map's Decisions-so-far section.
