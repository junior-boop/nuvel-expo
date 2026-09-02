export type Notes = {
  id: string;
  body: string;
  html: string;
  creator: string;
  pinned: 0 | 1 | boolean;
  archived: 0 | 1 | boolean;
  grouped: string | null;
  created: Date | string;
  modified: Date | string;
  publishId: string | null;
  version: number;
};

export type User = {
  id: string;
  name: string;
  first_name: string;
  email: string;
  church_status: "Pastor" | "Elder" | "Deacon" | "Leader" | "Member";
  biography: string;
  photo: string;
  country: string;
  association: string | null;
  created: Date | string;
  modified: Date | string;
  lastlogin: Date | string | null;
  lastlogout: Date | string | null;
  language: "fr" | "en" | "es" | null;
};

export type Groups = {
  id: string;
  name: string;
  created: Date | string;
  modified: Date | string;
};

export type Session = {
  id: string;
  iduser: string;
  name?: string;
  email?: string;
};

export type UserInput = {
  name: string;
  email: string;
  lastlogin: string;
  lastlogout: string;
};

export type DeletedNote = {
  id: string;
};

export type ModifiedNote = {
  id: string;
  body: string;
  modified: number;
};

export type ArchivedNote = {
  id: string;
  archived: boolean;
};

export type GroupedLink = {
  id: string;
  grouped: string;
};

export type PinningNote = {
  id: string;
  pinned: boolean;
};

export type usersession = {
  id: string;
  iduser: string;
  name: string;
  email: string;
};

export interface AiHistoryType {
  id: string;
  iduser: string;
  role: string;
  content: string;
  replyContent?: string;
  created: Date | string;
  modified: Date | string;
}

export interface Articles {
  id?: string;
  imageurl: string;
  userid: string;
  noteid: string;
  body: string;
  description: string;
  topic: string;
  title: string;
  appreciation: string;
  createdAt: string;
  updatedAt: string;
  user: User
}

export interface BibleMetadata {
  id: string;
  name: string;
  shortname: string;
  module: string;
  year: string;
  publisher: string | null;
  owner: string | null;
  description: string;
  lang: string;
  lang_short: string;
  copyright: number;
  copyright_statement: string;
  url: string | null;
  citation_limit: number;
  restrict: number;
  italics: number;
  strongs: number;
  red_letter: number;
  paragraph: number;
  official: number;
  research: number;
  module_version: string;
}

// Type pour un verset
export interface BibleVerse {
  id: string;
  book_id: string;
  book_name: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

// Type pour l'objet Bible complet
export interface BibleData {
  metadata: BibleMetadata;
  verses: BibleVerse[];
  lien: string;
}

export interface Comments {
  id: string;
  articleId: string;
  creator: string;
  content: string;
  notes: number;
  upvotes: string; // JSON array of userids
  signals: string; // JSON array of userids
  created: string;
  modified: string;
}

export interface Appreciations {
  id: string;
  articleId: string;
  userid: string;
}

export interface SyncEvent {
  id: string;
  userId: string;
  deviceId: string;
  entityType: 'notes' | 'groups';
  entityId: string;
  action: 'created' | 'updated' | 'deleted';
  timestamp: string; // ISO timestamp
  synced: number; // 0 = pas sync, 1 = syncé
  created: string;
}

export interface Devices {
  id: string;
  userid: string;
  devicename: string;
  devicecharac: string;
  created: string;
}

export interface localStorage {
  id: string;
  value: string;
}

export type SyncableTable =
  | "notes"
  | "groupes"
  | "articles"
  | "publish"
  | "comments"
  | "appreciations";

export interface SyncStateRow {
  table_name: SyncableTable | string;
  element_id: string;
  version: number;          // version connue cote serveur (0 si jamais sync)
  clientVersion: number;    // version locale (incrementee a chaque mutation locale)
  updatedAt: string;        // ISO timestamp de la derniere mutation locale
  updatedBy: string;        // userid auteur de la mutation
  deleted: 0 | 1;           // tombstone
  dirty: 0 | 1;             // 1 = mutation locale non pushee
  pushAttempts?: number;    // nb d'echecs push consecutifs (skip apres MAX_PUSH_ATTEMPTS)
}