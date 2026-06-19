# Graph Report - nuvel-twyo-ptbpmwgsox1tafyp  (2026-06-11)

## Corpus Check
- 144 files · ~84,444 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 989 nodes · 1532 edges · 75 communities (57 shown, 18 thin omitted)
- Extraction: 98% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `98152ccc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_NPM Dependencies|NPM Dependencies]]
- [[_COMMUNITY_SimpleORM Query Builder|SimpleORM Query Builder]]
- [[_COMMUNITY_Tab Navigation Layout|Tab Navigation Layout]]
- [[_COMMUNITY_TipTap Bible Editor|TipTap Bible Editor]]
- [[_COMMUNITY_Fluent Icon Library|Fluent Icon Library]]
- [[_COMMUNITY_Article & Profile Screens|Article & Profile Screens]]
- [[_COMMUNITY_Expo App Config|Expo App Config]]
- [[_COMMUNITY_Bible Download Page|Bible Download Page]]
- [[_COMMUNITY_SimpleORM Schema Types|SimpleORM Schema Types]]
- [[_COMMUNITY_Database Type Definitions|Database Type Definitions]]
- [[_COMMUNITY_Root Layout & Login|Root Layout & Login]]
- [[_COMMUNITY_SimpleORM CRUD Methods|SimpleORM CRUD Methods]]
- [[_COMMUNITY_Themed UI Components|Themed UI Components]]
- [[_COMMUNITY_Sheet UI Components|Sheet UI Components]]
- [[_COMMUNITY_Groups & History Pages|Groups & History Pages]]
- [[_COMMUNITY_Database Context Provider|Database Context Provider]]
- [[_COMMUNITY_InstantDB Article Stats|InstantDB Article Stats]]
- [[_COMMUNITY_Note Editor & AI|Note Editor & AI]]
- [[_COMMUNITY_Claude Instructions Docs|Claude Instructions Docs]]
- [[_COMMUNITY_Bible Database Tables|Bible Database Tables]]
- [[_COMMUNITY_Misc Module 20|Misc Module 20]]
- [[_COMMUNITY_Misc Module 21|Misc Module 21]]
- [[_COMMUNITY_Misc Module 22|Misc Module 22]]
- [[_COMMUNITY_Misc Module 23|Misc Module 23]]
- [[_COMMUNITY_Misc Module 24|Misc Module 24]]
- [[_COMMUNITY_Misc Module 25|Misc Module 25]]
- [[_COMMUNITY_Misc Module 26|Misc Module 26]]
- [[_COMMUNITY_Misc Module 27|Misc Module 27]]
- [[_COMMUNITY_Misc Module 28|Misc Module 28]]
- [[_COMMUNITY_Misc Module 29|Misc Module 29]]
- [[_COMMUNITY_Misc Module 30|Misc Module 30]]
- [[_COMMUNITY_Misc Module 31|Misc Module 31]]
- [[_COMMUNITY_Misc Module 32|Misc Module 32]]
- [[_COMMUNITY_Misc Module 33|Misc Module 33]]
- [[_COMMUNITY_Misc Module 34|Misc Module 34]]
- [[_COMMUNITY_Misc Module 35|Misc Module 35]]
- [[_COMMUNITY_Misc Module 36|Misc Module 36]]
- [[_COMMUNITY_Misc Module 37|Misc Module 37]]
- [[_COMMUNITY_Misc Module 39|Misc Module 39]]
- [[_COMMUNITY_Misc Module 40|Misc Module 40]]
- [[_COMMUNITY_Misc Module 41|Misc Module 41]]
- [[_COMMUNITY_Misc Module 42|Misc Module 42]]
- [[_COMMUNITY_Misc Module 44|Misc Module 44]]
- [[_COMMUNITY_Misc Module 45|Misc Module 45]]
- [[_COMMUNITY_Misc Module 46|Misc Module 46]]
- [[_COMMUNITY_Misc Module 47|Misc Module 47]]
- [[_COMMUNITY_Misc Module 48|Misc Module 48]]
- [[_COMMUNITY_Misc Module 49|Misc Module 49]]
- [[_COMMUNITY_Misc Module 50|Misc Module 50]]
- [[_COMMUNITY_Misc Module 51|Misc Module 51]]
- [[_COMMUNITY_Misc Module 52|Misc Module 52]]
- [[_COMMUNITY_Misc Module 54|Misc Module 54]]
- [[_COMMUNITY_Misc Module 55|Misc Module 55]]
- [[_COMMUNITY_Misc Module 56|Misc Module 56]]
- [[_COMMUNITY_Misc Module 62|Misc Module 62]]
- [[_COMMUNITY_Misc Module 63|Misc Module 63]]
- [[_COMMUNITY_Misc Module 64|Misc Module 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]

## God Nodes (most connected - your core abstractions)
1. `convert()` - 62 edges
2. `useDatabase()` - 47 edges
3. `QueryForTable` - 44 edges
4. `SimpleORM` - 23 edges
5. `expo` - 15 edges
6. `BibleDownloader` - 15 edges
7. `PageLayout_3()` - 13 edges
8. `cn()` - 12 edges
9. `📚 Documentation - Hook `useAuthDB`` - 12 edges
10. `/graphify` - 11 edges

## Surprising Connections (you probably didn't know these)
- `SyncNoteGroup()` --calls--> `useDatabase()`  [EXTRACTED]
  src/app/(onboarding)/sync.tsx → src/context/database.context.tsx
- `TopArticles()` --calls--> `convert()`  [EXTRACTED]
  src/app/(tabs)/index.tsx → src/constants/convert.ts
- `TabTwoScreen()` --calls--> `useDatabase()`  [EXTRACTED]
  src/app/(tabs)/myspace/group.tsx → src/context/database.context.tsx
- `HistoryItems()` --calls--> `convert()`  [EXTRACTED]
  src/app/(tabs)/settings.tsx → src/constants/convert.ts
- `HistoryPage()` --calls--> `convert()`  [EXTRACTED]
  src/app/history.tsx → src/constants/convert.ts

## Import Cycles
- None detected.

## Communities (75 total, 18 thin omitted)

### Community 0 - "NPM Dependencies"
Cohesion: 0.03
Nodes (76): dependencies, autoprefixer, bufferutil, class-variance-authority, clsx, expo, expo-clipboard, expo-constants (+68 more)

### Community 2 - "Tab Navigation Layout"
Cohesion: 0.10
Nodes (22): styles, TabTwoScreen(), styles, ExternalLink(), Props, HintRowProps, styles, styles (+14 more)

### Community 3 - "TipTap Bible Editor"
Cohesion: 0.07
Nodes (26): attrsProps, FilterProps, Commands, BxsBible(), FluentAppsList20Filled(), FluentArrowEnterLeft24Filled(), FluentCode24Regular(), FluentCodeBlock32Regular() (+18 more)

### Community 4 - "Fluent Icon Library"
Cohesion: 0.06
Nodes (5): BxsBible(), FluentArchive16Regular(), FluentChevronDown24Filled(), FluentChevronRight32Regular(), FluentSearch32Filled()

### Community 5 - "Article & Profile Screens"
Cohesion: 0.24
Nodes (8): DatabaseContext, DatabaseContextType, DatabaseError, HistoryType, History(), HistoryItems(), styles, TabTwoScreen()

### Community 6 - "Expo App Config"
Cohesion: 0.06
Nodes (30): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+22 more)

### Community 7 - "Bible Download Page"
Cohesion: 0.09
Nodes (8): delay(), fetchSequentielAvecDelai(), styles, FluentArrowDownload32Filled(), FluentCheckmark28Filled(), Bible, BibleDownloader, versets

### Community 8 - "SimpleORM Schema Types"
Cohesion: 0.07
Nodes (29): blob, current, DatabaseRow, datetime, Default, foreignKey, IncludeOptions, integer (+21 more)

### Community 9 - "Database Type Definitions"
Cohesion: 0.09
Nodes (21): AiHistoryType, Appreciations, ArchivedNote, Articles, BibleData, BibleMetadata, BibleVerse, Comments (+13 more)

### Community 10 - "Root Layout & Login"
Cohesion: 0.18
Nodes (14): AuthGate(), RootLayout(), RootLayoutGate(), unstable_settings, ModalScreen(), styles, AuthContext, AuthContextValue (+6 more)

### Community 12 - "Themed UI Components"
Cohesion: 0.10
Nodes (11): ThemeProps, ViewProps, FluentFolderOpenDown28Regular(), styles, styles, TabTwoScreen(), HeaderStyles, styles (+3 more)

### Community 13 - "Sheet UI Components"
Cohesion: 0.16
Nodes (9): cn(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), Textarea() (+1 more)

### Community 14 - "Groups & History Pages"
Cohesion: 0.15
Nodes (11): GroupeItemps(), HistoryPage(), styles, PageLayout(), PageLayout_3(), styles, styles_2, FluentNoteAdd28Regular() (+3 more)

### Community 15 - "Database Context Provider"
Cohesion: 0.06
Nodes (35): 1. Toujours vérifier `loading`, 2. Gérer les erreurs, 3. Rafraîchir après modification, 4. Nettoyer au démontage, 📘 API Référence, ✨ Bonnes pratiques, `checkSession(): Promise<void>`, 📚 Documentation - Hook `useAuthDB` (+27 more)

### Community 16 - "InstantDB Article Stats"
Cohesion: 0.25
Nodes (7): checkArticleStats(), createdArticleStats(), deleteArticleStats(), setViewCount(), Article, UseArticleResult, User

### Community 17 - "Note Editor & AI"
Cohesion: 0.12
Nodes (13): Response_Ai(), FluentArrowUp32Filled(), FluentDelete32Regular(), FluentDismiss32Filled(), FluentFolderLink32Regular(), FluentGlobeArrowForward32Regular(), FluentMoreVertical32Filled(), FluentShare32Regular() (+5 more)

### Community 18 - "Claude Instructions Docs"
Cohesion: 0.04
Nodes (44): Global Claude Instructions, Add and Watch Reference, Expo HAS CHANGED, graphify, Expo v56 Versioned Docs, Exports Reference, Extraction Spec, GitHub and Merge Reference (+36 more)

### Community 19 - "Bible Database Tables"
Cohesion: 0.15
Nodes (3): AIhistory, BibleMetadata, generateUUID()

### Community 20 - "Misc Module 20"
Cohesion: 0.13
Nodes (14): devDependencies, @types/react, typescript, main, name, private, scripts, android (+6 more)

### Community 22 - "Misc Module 22"
Cohesion: 0.20
Nodes (5): AppreciationType, ArticleStatsType, schema, storage, ReactNativeStorage

### Community 23 - "Misc Module 23"
Cohesion: 0.06
Nodes (22): FluentCloudArrowDown48Regular(), BaseEntity, PaginationResult, PredicateFunction, QueryOptions, SortOptions, StatsResult, UpdateData (+14 more)

### Community 24 - "Misc Module 24"
Cohesion: 0.21
Nodes (5): styles, styles, ExternalLink(), MonoText(), TextProps

### Community 25 - "Misc Module 25"
Cohesion: 0.16
Nodes (14): ArticlesItems(), createdHistoryItem(), getHistoryByArticleId(), getHistoryForUser(), historiesDB, schema, updatedHistoryItem(), Article (+6 more)

### Community 26 - "Misc Module 26"
Cohesion: 0.17
Nodes (10): FluentAlert32Filled(), FluentAlert32Regular(), FluentBookmark32Filled(), FluentBookmark32Regular(), FluentDocumentFolder32Filled(), FluentDocumentFolder32Regular(), FluentHome32Filled(), FluentHome32Regular() (+2 more)

### Community 27 - "Misc Module 27"
Cohesion: 0.17
Nodes (4): Sync_Metadata, SyncMetadata, SyncChange, SyncResult

### Community 28 - "Misc Module 28"
Cohesion: 0.17
Nodes (12): CommentsProps, ShareButton(), SignalButton(), styles, useShareHook(), RiBookmark3Fill(), RiBookmark3Line(), RiSendPlaneLine() (+4 more)

### Community 29 - "Misc Module 29"
Cohesion: 0.19
Nodes (12): LikeButton(), LikeButtonProps, styles, useAppreciation(), RiOpenArmFill(), RiOpenArmLine(), getAppreciationStateForUser(), removeAppreciation() (+4 more)

### Community 30 - "Misc Module 30"
Cohesion: 0.22
Nodes (5): addsignal(), addupvote(), createdComment(), getComments(), Comment

### Community 31 - "Misc Module 31"
Cohesion: 0.24
Nodes (4): deleted(), deletedall(), getAll(), sync_event

### Community 33 - "Misc Module 33"
Cohesion: 0.28
Nodes (8): CommentaireItem(), signalHooks(), Signals(), upVoteHooks(), Upvotes(), FluentArrowCircleUp20Filled(), FluentSubtractCircle12Regular(), CommentType

### Community 34 - "Misc Module 34"
Cohesion: 0.28
Nodes (4): deleted(), deletedall(), getall(), Groups

### Community 35 - "Misc Module 35"
Cohesion: 0.29
Nodes (9): orm, deletedata(), deleteSyncData(), first_sync(), getOldRecords(), GroupsType, NotesType, senddata() (+1 more)

### Community 36 - "Misc Module 36"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 37 - "Misc Module 37"
Cohesion: 0.32
Nodes (4): Articles, deleted(), deletedall(), getall()

### Community 39 - "Misc Module 39"
Cohesion: 0.29
Nodes (6): DRY, EXTS, files, findCallEnd(), TARGET_METHODS, transform()

### Community 40 - "Misc Module 40"
Cohesion: 0.25
Nodes (7): compilerOptions, paths, strict, extends, include, @/*, @/assets/*

### Community 41 - "Misc Module 41"
Cohesion: 0.29
Nodes (4): glowKeyframe, keyframe, logoKeyframe, styles

### Community 42 - "Misc Module 42"
Cohesion: 0.29
Nodes (4): glowKeyframe, keyframe, logoKeyframe, styles

### Community 44 - "Misc Module 44"
Cohesion: 0.10
Nodes (30): BibleItems(), BiblePage(), ArticlesType, NewArticle(), NoteEditor(), Country, Profils(), styles (+22 more)

### Community 45 - "Misc Module 45"
Cohesion: 0.33
Nodes (6): Minimal Light UI Design with Black Frame, Expo Blue Rounded Logo, Localhost URL http://localhost:8081/, Top Navigation Bar (Expo starter, Home, Explore, Doc), Expo Web Tutorial Screenshot, Welcome to Expo Heading

### Community 46 - "Misc Module 46"
Cohesion: 0.25
Nodes (7): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 47 - "Misc Module 47"
Cohesion: 0.40
Nodes (3): SignInData, UseAuthResult, User

### Community 48 - "Misc Module 48"
Cohesion: 0.50
Nodes (4): Expo SQLite, useAuthDB Hook Documentation, expo-sqlite, useAuthDB React Hook

### Community 49 - "Misc Module 49"
Cohesion: 0.50
Nodes (4): Nuvel App Branding, Personal Section Title, High-contrast Serif Typography, My Space Wordmark

### Community 50 - "Misc Module 50"
Cohesion: 0.50
Nodes (4): Nuvel App Identity, Nuvel Brand, Nuvel Logo (Wordmark), Bold Black Serif Wordmark

### Community 65 - "Community 65"
Cohesion: 0.32
Nodes (7): SheetComments(), Commentaire(), styles, useCommentHooks(), useCommentStats(), RiMessageLine(), setCommentCount()

### Community 66 - "Community 66"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 67 - "Community 67"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 68 - "Community 68"
Cohesion: 0.50
Nodes (3): For /graphify explain, For /graphify path, graphify reference: query, path, explain

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **376 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+371 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Expo SQLite` connect `Misc Module 48` to `SimpleORM Schema Types`, `Bible Download Page`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `dependencies` connect `NPM Dependencies` to `Misc Module 48`, `Misc Module 20`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `expo-sqlite` connect `Misc Module 48` to `NPM Dependencies`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _377 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `NPM Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.02631578947368421 - nodes in this community are weakly interconnected._
- **Should `SimpleORM Query Builder` be split into smaller, more focused modules?**
  _Cohesion score 0.09230769230769231 - nodes in this community are weakly interconnected._
- **Should `Tab Navigation Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.10128205128205128 - nodes in this community are weakly interconnected._