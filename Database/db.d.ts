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
  version: number;
};

export type User = {
  id: string;
  name: string;
  first_name: string;
  email: string;
  church_status: "Pastor" | "Elder" | "Deacon" | "Leader" | "Member";
  domination: string;
  biography: string;
  photo: string;
  created: Date | string;
  modified: Date | string;
  lastlogin: Date | string;
  lastlogout: Date | string;
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
}

export interface BibleMetadata {
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
