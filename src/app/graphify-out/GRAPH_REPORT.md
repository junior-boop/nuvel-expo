# Graph Report - app  (2026-06-11)

## Corpus Check
- 28 files · ~11,312 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 97 nodes · 80 edges · 25 communities (10 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `98152ccc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]

## God Nodes (most connected - your core abstractions)
1. `HeaderStyles` - 3 edges
2. `NewNoteButton` - 3 edges
3. `delay()` - 2 edges
4. `fetchSequentielAvecDelai()` - 2 edges
5. `useShareHook()` - 2 edges
6. `ShareButton()` - 2 edges
7. `styles` - 1 edges
8. `styles` - 1 edges
9. `styles` - 1 edges
10. `unstable_settings` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- 1-file cycle: `+html.tsx -> +html.tsx`

## Communities (25 total, 15 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.19
Nodes (3): CardStyles, HeaderStyles, NewNoteButton

### Community 1 - "Community 1"
Cohesion: 0.29
Nodes (4): CommentsProps, ShareButton(), styles, useShareHook()

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (3): delay(), fetchSequentielAvecDelai(), styles

## Knowledge Gaps
- **20 isolated node(s):** `styles`, `styles`, `styles`, `unstable_settings`, `styles` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HeaderStyles` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `styles`, `styles`, `styles` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._