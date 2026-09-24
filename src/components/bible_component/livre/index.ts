import * as BibleVerse from "@/Database/bible.content";

const listBooks = [
  {
    titre: "Genèse",
    abr: ["Gn", "GN", "gn", "Gen", "GEN", "gen", "Ge", "GE", "ge", "Genèse", "GENÈSE", "genèse", "Genese", "GENESE", "genese", "Genesis", "GENESIS", "genesis"],
    index: "A1",
    nbr_chap: 50,
    livre: 1,
  },
  {
    titre: "Exode",
    abr: ["Ex", "EX", "ex", "Exo", "EXO", "exo", "Exod", "EXOD", "exod", "Exode", "EXODE", "exode", "Exodus", "EXODUS", "exodus"],
    index: "A2",
    nbr_chap: 40,
    livre: 2,
  },
  {
    titre: "Lévitique",
    abr: ["Lv", "LV", "lv", "Lev", "LEV", "lev", "Lévitique", "LÉVITIQUE", "lévitique", "Levitique", "LEVITIQUE", "levitique", "Leviticus", "LEVITICUS", "leviticus"],
    index: "A3",
    nbr_chap: 27,
    livre: 3,
  },
  {
    titre: "Nombres",
    abr: ["Nb", "NB", "nb", "Nbr", "NBR", "nbr", "Nomb", "NOMB", "nomb", "Num", "NUM", "num", "Nombres", "NOMBRES", "nombres", "Numbers", "NUMBERS", "numbers"],
    index: "A4",
    nbr_chap: 36,
    livre: 4,
  },
  {
    titre: "Deutéronome",
    abr: ["Dt", "DT", "dt", "Deut", "DEUT", "deut", "Deutéronome", "DEUTÉRONOME", "deutéronome", "Deuteronome", "DEUTERONOME", "deuteronome", "Deuteronomy", "DEUTERONOMY", "deuteronomy"],
    index: "A5",
    nbr_chap: 34,
    livre: 5,
  },
  {
    titre: "Josué",
    abr: ["Jos", "JOS", "jos", "Josh", "JOSH", "josh", "Josué", "JOSUÉ", "josué", "Josue", "JOSUE", "josue", "Joshua", "JOSHUA", "joshua"],
    index: "A6",
    nbr_chap: 24,
    livre: 6,
  },
  {
    titre: "Juges",
    abr: ["Jg", "JG", "jg", "Jug", "JUG", "jug", "Judg", "JUDG", "judg", "Juges", "JUGES", "juges", "Judges", "JUDGES", "judges"],
    index: "A7",
    nbr_chap: 21,
    livre: 7,
  },
  {
    titre: "Ruth",
    abr: ["Rt", "RT", "rt", "Rut", "RUT", "rut", "Ru", "RU", "ru", "Rth", "RTH", "rth", "Ruth", "RUTH", "ruth"],
    index: "A8",
    nbr_chap: 4,
    livre: 8,
  },
  {
    titre: "1 Samuel",
    abr: ["1S", "1s", "1Sam", "1SAM", "1sam", "1Sm", "1SM", "1sm", "1Sa", "1SA", "1sa", "1 Samuel", "1 SAMUEL", "1 samuel"],
    index: "A9",
    nbr_chap: 31,
    livre: 9,
  },
  {
    titre: "2 Samuel",
    abr: ["2S", "2s", "2Sam", "2SAM", "2sam", "2Sm", "2SM", "2sm", "2Sa", "2SA", "2sa", "2 Samuel", "2 SAMUEL", "2 samuel"],
    index: "A10",
    nbr_chap: 24,
    livre: 10,
  },
  {
    titre: "1 Rois",
    abr: ["1R", "1r", "1Rs", "1RS", "1rs", "1Kg", "1KG", "1kg", "1Kgs", "1KGS", "1kgs", "1Ki", "1KI", "1ki", "1 Rois", "1 ROIS", "1 rois", "1 Kings", "1 KINGS", "1 kings"],
    index: "A11",
    nbr_chap: 22,
    livre: 11,
  },
  {
    titre: "2 Rois",
    abr: ["2R", "2r", "2Rs", "2RS", "2rs", "2Kg", "2KG", "2kg", "2Kgs", "2KGS", "2kgs", "2Ki", "2KI", "2ki", "2 Rois", "2 ROIS", "2 rois", "2 Kings", "2 KINGS", "2 kings"],
    index: "A12",
    nbr_chap: 25,
    livre: 12,
  },
  {
    titre: "1 Chroniques",
    abr: ["1Ch", "1CH", "1ch", "1Chr", "1CHR", "1chr", "1 Chroniques", "1 CHRONIQUES", "1 chroniques", "1 Chronicles", "1 CHRONICLES", "1 chronicles"],
    index: "A13",
    nbr_chap: 29,
    livre: 13,
  },
  {
    titre: "2 Chroniques",
    abr: ["2Ch", "2CH", "2ch", "2Chr", "2CHR", "2chr", "2 Chroniques", "2 CHRONIQUES", "2 chroniques", "2 Chronicles", "2 CHRONICLES", "2 chronicles"],
    index: "A14",
    nbr_chap: 36,
    livre: 14,
  },
  {
    titre: "Esdras",
    abr: ["Esd", "ESD", "esd", "Ezr", "EZR", "ezr", "Esdras", "ESDRAS", "esdras", "Ezra", "EZRA", "ezra"],
    index: "A15",
    nbr_chap: 10,
    livre: 15,
  },
  {
    titre: "Néhémie",
    abr: ["Ne", "NE", "ne", "Neh", "NEH", "neh", "Nh", "NH", "nh", "Néhémie", "NÉHÉMIE", "néhémie", "Nehemie", "NEHEMIE", "nehemie", "Nehemiah", "NEHEMIAH", "nehemiah"],
    index: "A16",
    nbr_chap: 13,
    livre: 16,
  },
  {
    titre: "Esther",
    abr: ["Est", "EST", "est", "Esth", "ESTH", "esth", "Esther", "ESTHER", "esther"],
    index: "A17",
    nbr_chap: 10,
    livre: 17,
  },
  {
    titre: "Job",
    abr: ["Jb", "JB", "jb", "Job", "JOB", "job"],
    index: "A18",
    nbr_chap: 42,
    livre: 18,
  },
  {
    titre: "Psaumes",
    abr: ["Ps", "PS", "ps", "Psa", "PSA", "psa", "Psm", "PSM", "psm", "Psaumes", "PSAUMES", "psaumes", "Psalms", "PSALMS", "psalms", "Psalm", "PSALM", "psalm"],
    index: "A19",
    nbr_chap: 150,
    livre: 19,
  },
  {
    titre: "Proverbes",
    abr: ["Pr", "PR", "pr", "Pro", "PRO", "pro", "Prov", "PROV", "prov", "Proverbes", "PROVERBES", "proverbes", "Proverbs", "PROVERBS", "proverbs"],
    index: "A20",
    nbr_chap: 31,
    livre: 20,
  },
  {
    titre: "Ecclésiaste",
    abr: ["Ec", "EC", "ec", "Eccl", "ECCL", "eccl", "Eccles", "ECCLES", "eccles", "Ecclésiaste", "ECCLÉSIASTE", "ecclésiaste", "Ecclesiaste", "ECCLESIASTE", "ecclesiaste", "Ecclesiastes", "ECCLESIASTES", "ecclesiastes"],
    index: "A21",
    nbr_chap: 12,
    livre: 21,
  },
  {
    titre: "Cantique",
    abr: ["Ct", "CT", "ct", "Can", "CAN", "can", "Cant", "CANT", "cant", "SoS", "SOS", "sos", "Sos", "Song", "SONG", "song", "Cantique", "CANTIQUE", "cantique", "Cantique des cantiques", "CANTIQUE DES CANTIQUES", "cantique des cantiques", "Cantique Des Cantiques", "Song of Songs", "SONG OF SONGS", "song of songs", "Song Of Songs", "Song of Solomon", "SONG OF SOLOMON", "song of solomon", "Song Of Solomon"],
    index: "A22",
    nbr_chap: 8,
    livre: 22,
  },
  {
    titre: "Esaïe",
    abr: ["Es", "ES", "es", "Esa", "ESA", "esa", "Esai", "ESAI", "esai", "Isa", "ISA", "isa", "Esaïe", "ESAÏE", "esaïe", "Esaie", "ESAIE", "esaie", "Isaïe", "ISAÏE", "isaïe", "Isaie", "ISAIE", "isaie", "Isaiah", "ISAIAH", "isaiah"],
    index: "A23",
    nbr_chap: 66,
    livre: 23,
  },
  {
    titre: "Jérémie",
    abr: ["Jr", "JR", "jr", "Jer", "JER", "jer", "Jérémie", "JÉRÉMIE", "jérémie", "Jeremie", "JEREMIE", "jeremie", "Jeremiah", "JEREMIAH", "jeremiah"],
    index: "A24",
    nbr_chap: 52,
    livre: 24,
  },
  {
    titre: "Lamentations",
    abr: ["Lm", "LM", "lm", "Lam", "LAM", "lam", "Lamentations", "LAMENTATIONS", "lamentations"],
    index: "A25",
    nbr_chap: 5,
    livre: 25,
  },
  {
    titre: "Ezéchiel",
    abr: ["Ez", "EZ", "ez", "Eze", "EZE", "eze", "Ezek", "EZEK", "ezek", "Ezéchiel", "EZÉCHIEL", "ezéchiel", "Ezechiel", "EZECHIEL", "ezechiel", "Ezekiel", "EZEKIEL", "ezekiel"],
    index: "A26",
    nbr_chap: 48,
    livre: 26,
  },
  {
    titre: "Daniel",
    abr: ["Dn", "DN", "dn", "Dan", "DAN", "dan", "Dani", "DANI", "dani", "Daniel", "DANIEL", "daniel"],
    index: "A27",
    nbr_chap: 12,
    livre: 27,
  },
  {
    titre: "Osée",
    abr: ["Os", "OS", "os", "Ose", "OSE", "ose", "Hos", "HOS", "hos", "Osée", "OSÉE", "osée", "Osee", "OSEE", "osee", "Hosea", "HOSEA", "hosea"],
    index: "A28",
    nbr_chap: 14,
    livre: 28,
  },
  {
    titre: "Joël",
    abr: ["Jl", "JL", "jl", "Joel", "JOEL", "joel", "Joël", "JOËL", "joël"],
    index: "A29",
    nbr_chap: 3,
    livre: 29,
  },
  {
    titre: "Amos",
    abr: ["Am", "AM", "am", "Amos", "AMOS", "amos"],
    index: "A30",
    nbr_chap: 9,
    livre: 30,
  },
  {
    titre: "Abdias",
    abr: ["Ab", "AB", "ab", "Abd", "ABD", "abd", "Ob", "OB", "ob", "Obad", "OBAD", "obad", "Abdias", "ABDIAS", "abdias", "Obadiah", "OBADIAH", "obadiah"],
    index: "A31",
    nbr_chap: 1,
    livre: 31,
  },
  {
    titre: "Jonas",
    abr: ["Jon", "JON", "jon", "Jonas", "JONAS", "jonas", "Jnh", "JNH", "jnh", "Jonah", "JONAH", "jonah"],
    index: "A32",
    nbr_chap: 4,
    livre: 32,
  },
  {
    titre: "Michée",
    abr: ["Mi", "MI", "mi", "Mic", "MIC", "mic", "Mich", "MICH", "mich", "Michée", "MICHÉE", "michée", "Michee", "MICHEE", "michee", "Micah", "MICAH", "micah"],
    index: "A33",
    nbr_chap: 7,
    livre: 33,
  },
  {
    titre: "Nahum",
    abr: ["Na", "NA", "na", "Nah", "NAH", "nah", "Nahum", "NAHUM", "nahum"],
    index: "A34",
    nbr_chap: 3,
    livre: 34,
  },
  {
    titre: "Habacuc",
    abr: ["Ha", "HA", "ha", "Hab", "HAB", "hab", "Habacuc", "HABACUC", "habacuc", "Habakkuk", "HABAKKUK", "habakkuk"],
    index: "A35",
    nbr_chap: 3,
    livre: 35,
  },
  {
    titre: "Sophonie",
    abr: ["So", "SO", "so", "Soph", "SOPH", "soph", "Zep", "ZEP", "zep", "Zeph", "ZEPH", "zeph", "Sophonie", "SOPHONIE", "sophonie", "Zephaniah", "ZEPHANIAH", "zephaniah"],
    index: "A36",
    nbr_chap: 3,
    livre: 36,
  },
  {
    titre: "Aggée",
    abr: ["Ag", "AG", "ag", "Agg", "AGG", "agg", "Hag", "HAG", "hag", "Aggée", "AGGÉE", "aggée", "Aggee", "AGGEE", "aggee", "Haggai", "HAGGAI", "haggai"],
    index: "A37",
    nbr_chap: 2,
    livre: 37,
  },
  {
    titre: "Zacharie",
    abr: ["Za", "ZA", "za", "Zac", "ZAC", "zac", "Zach", "ZACH", "zach", "Zec", "ZEC", "zec", "Zech", "ZECH", "zech", "Zacharie", "ZACHARIE", "zacharie", "Zechariah", "ZECHARIAH", "zechariah"],
    index: "A38",
    nbr_chap: 14,
    livre: 38,
  },
  {
    titre: "Malachie",
    abr: ["Ml", "ML", "ml", "Mal", "MAL", "mal", "Malachie", "MALACHIE", "malachie", "Malachi", "MALACHI", "malachi"],
    index: "A39",
    nbr_chap: 4,
    livre: 39,
  },
  {
    titre: "Matthieu",
    abr: ["Mt", "MT", "mt", "Mat", "MAT", "mat", "Matt", "MATT", "matt", "Mathieu", "MATHIEU", "mathieu", "Matthieu", "MATTHIEU", "matthieu", "Matthew", "MATTHEW", "matthew"],
    index: "N1",
    nbr_chap: 28,
    livre: 40,
  },
  {
    titre: "Marc",
    abr: ["Mc", "MC", "mc", "Mrc", "MRC", "mrc", "Mk", "MK", "mk", "Mrk", "MRK", "mrk", "Marc", "MARC", "marc", "Mark", "MARK", "mark"],
    index: "N2",
    nbr_chap: 16,
    livre: 41,
  },
  {
    titre: "Luc",
    abr: ["Lc", "LC", "lc", "Lk", "LK", "lk", "Luc", "LUC", "luc", "Luke", "LUKE", "luke"],
    index: "N3",
    nbr_chap: 24,
    livre: 42,
  },
  {
    titre: "Jean",
    abr: ["Jn", "JN", "jn", "Jhn", "JHN", "jhn", "Jean", "JEAN", "jean", "John", "JOHN", "john"],
    index: "N4",
    nbr_chap: 21,
    livre: 43,
  },
  {
    titre: "Actes",
    abr: ["Ac", "AC", "ac", "Act", "ACT", "act", "Acts", "ACTS", "acts", "Actes", "ACTES", "actes"],
    index: "N5",
    nbr_chap: 28,
    livre: 44,
  },
  {
    titre: "Romains",
    abr: ["Rm", "RM", "rm", "Rom", "ROM", "rom", "Romains", "ROMAINS", "romains", "Romans", "ROMANS", "romans"],
    index: "N6",
    nbr_chap: 16,
    livre: 45,
  },
  {
    titre: "1 Corinthiens",
    abr: ["1Co", "1CO", "1co", "1Cor", "1COR", "1cor", "1 Corinthiens", "1 CORINTHIENS", "1 corinthiens", "1 Corinthians", "1 CORINTHIANS", "1 corinthians"],
    index: "N7",
    nbr_chap: 16,
    livre: 46,
  },
  {
    titre: "2 Corinthiens",
    abr: ["2Co", "2CO", "2co", "2Cor", "2COR", "2cor", "2 Corinthiens", "2 CORINTHIENS", "2 corinthiens", "2 Corinthians", "2 CORINTHIANS", "2 corinthians"],
    index: "N8",
    nbr_chap: 13,
    livre: 47,
  },
  {
    titre: "Galates",
    abr: ["Ga", "GA", "ga", "Gal", "GAL", "gal", "Galates", "GALATES", "galates", "Galatians", "GALATIANS", "galatians"],
    index: "N9",
    nbr_chap: 6,
    livre: 48,
  },
  {
    titre: "Ephésiens",
    abr: ["Ep", "EP", "ep", "Eph", "EPH", "eph", "Ephésiens", "EPHÉSIENS", "ephésiens", "Ephesiens", "EPHESIENS", "ephesiens", "Éphésiens", "ÉPHÉSIENS", "éphésiens", "Ephesians", "EPHESIANS", "ephesians"],
    index: "N10",
    nbr_chap: 6,
    livre: 49,
  },
  {
    titre: "Philippiens",
    abr: ["Ph", "PH", "ph", "Phi", "PHI", "phi", "Phil", "PHIL", "phil", "Php", "PHP", "php", "Philippiens", "PHILIPPIENS", "philippiens", "Philippians", "PHILIPPIANS", "philippians"],
    index: "N11",
    nbr_chap: 4,
    livre: 50,
  },
  {
    titre: "Colossiens",
    abr: ["Col", "COL", "col", "Colossiens", "COLOSSIENS", "colossiens", "Colossians", "COLOSSIANS", "colossians"],
    index: "N12",
    nbr_chap: 4,
    livre: 51,
  },
  {
    titre: "1 Thessalonicien",
    abr: ["1Th", "1TH", "1th", "1Thess", "1THESS", "1thess", "1 Thessalonicien", "1 THESSALONICIEN", "1 thessalonicien", "1 Thessaloniciens", "1 THESSALONICIENS", "1 thessaloniciens", "1 Thessalonians", "1 THESSALONIANS", "1 thessalonians"],
    index: "N13",
    nbr_chap: 5,
    livre: 52,
  },
  {
    titre: "2 Thessalonicien",
    abr: ["2Th", "2TH", "2th", "2Thess", "2THESS", "2thess", "2 Thessalonicien", "2 THESSALONICIEN", "2 thessalonicien", "2 Thessaloniciens", "2 THESSALONICIENS", "2 thessaloniciens", "2 Thessalonians", "2 THESSALONIANS", "2 thessalonians"],
    index: "N14",
    nbr_chap: 3,
    livre: 53,
  },
  {
    titre: "1 Timothée",
    abr: ["1Tm", "1TM", "1tm", "1Tim", "1TIM", "1tim", "1Ti", "1TI", "1ti", "1 Timothée", "1 TIMOTHÉE", "1 timothée", "1 Timothee", "1 TIMOTHEE", "1 timothee", "1 Timothy", "1 TIMOTHY", "1 timothy"],
    index: "N15",
    nbr_chap: 6,
    livre: 54,
  },
  {
    titre: "2 Timothée",
    abr: ["2Tm", "2TM", "2tm", "2Tim", "2TIM", "2tim", "2Ti", "2TI", "2ti", "2 Timothée", "2 TIMOTHÉE", "2 timothée", "2 Timothee", "2 TIMOTHEE", "2 timothee", "2 Timothy", "2 TIMOTHY", "2 timothy"],
    index: "N16",
    nbr_chap: 4,
    livre: 55,
  },
  {
    titre: "Tite",
    abr: ["Tt", "TT", "tt", "Tit", "TIT", "tit", "Tite", "TITE", "tite", "Titus", "TITUS", "titus"],
    index: "N17",
    nbr_chap: 3,
    livre: 56,
  },
  {
    titre: "Philémon",
    abr: ["Phm", "PHM", "phm", "Phlm", "PHLM", "phlm", "Philémon", "PHILÉMON", "philémon", "Philemon", "PHILEMON", "philemon"],
    index: "N18",
    nbr_chap: 1,
    livre: 57,
  },
  {
    titre: "Hébreux",
    abr: ["He", "HE", "he", "Heb", "HEB", "heb", "Hébreux", "HÉBREUX", "hébreux", "Hebreux", "HEBREUX", "hebreux", "Hebrews", "HEBREWS", "hebrews"],
    index: "N19",
    nbr_chap: 13,
    livre: 58,
  },
  {
    titre: "Jacques",
    abr: ["Jc", "JC", "jc", "Jac", "JAC", "jac", "Jacq", "JACQ", "jacq", "Jas", "JAS", "jas", "Jam", "JAM", "jam", "Jacques", "JACQUES", "jacques", "James", "JAMES", "james"],
    index: "N20",
    nbr_chap: 5,
    livre: 59,
  },
  {
    titre: "1 Pierre",
    abr: ["1P", "1p", "1Pi", "1PI", "1pi", "1Pe", "1PE", "1pe", "1Pet", "1PET", "1pet", "1 Pierre", "1 PIERRE", "1 pierre", "1 Peter", "1 PETER", "1 peter"],
    index: "N21",
    nbr_chap: 5,
    livre: 60,
  },
  {
    titre: "2 Pierre",
    abr: ["2P", "2p", "2Pi", "2PI", "2pi", "2Pe", "2PE", "2pe", "2Pet", "2PET", "2pet", "2 Pierre", "2 PIERRE", "2 pierre", "2 Peter", "2 PETER", "2 peter"],
    index: "N22",
    nbr_chap: 3,
    livre: 61,
  },
  {
    titre: "1 Jean",
    abr: ["1Jn", "1JN", "1jn", "1Jo", "1JO", "1jo", "1John", "1JOHN", "1john", "1 Jean", "1 JEAN", "1 jean", "1 John", "1 JOHN", "1 john"],
    index: "N23",
    nbr_chap: 5,
    livre: 62,
  },
  {
    titre: "2 Jean",
    abr: ["2Jn", "2JN", "2jn", "2Jo", "2JO", "2jo", "2John", "2JOHN", "2john", "2 Jean", "2 JEAN", "2 jean", "2 John", "2 JOHN", "2 john"],
    index: "N24",
    nbr_chap: 1,
    livre: 63,
  },
  {
    titre: "3 Jean",
    abr: ["3Jn", "3JN", "3jn", "3Jo", "3JO", "3jo", "3John", "3JOHN", "3john", "3 Jean", "3 JEAN", "3 jean", "3 John", "3 JOHN", "3 john"],
    index: "N25",
    nbr_chap: 1,
    livre: 64,
  },
  {
    titre: "Jude",
    abr: ["Jd", "JD", "jd", "Jud", "JUD", "jud", "Jde", "JDE", "jde", "Jude", "JUDE", "jude"],
    index: "N26",
    nbr_chap: 1,
    livre: 65,
  },
  {
    titre: "Révélation",
    abr: ["Ap", "AP", "ap", "Apo", "APO", "apo", "Rev", "REV", "rev", "Révélation", "RÉVÉLATION", "révélation", "Revelation", "REVELATION", "revelation", "Apocalypse", "APOCALYPSE", "apocalypse"],
    index: "N27",
    nbr_chap: 22,
    livre: 66,
  }
];

/**
 * Recherche des versets dans la base de données
 */
export const filterBible = async (
  data: [
    book_id: string,
    book_name: string,
    chapter: string,
    vers1?: string,
    vers2?: string,
    version?: string
  ]
) => {
  const [book_id, book_name, chapter, vers1, vers2, version] = data;
  const versionSuffix = version ? ` (${version})` : "";

  const findbook = listBooks.find((el) => el.abr.includes(book_name));
  const ref = {
    book_id: book_id,
    book: findbook?.livre,
    chapter: parseInt(chapter),
  };
  const find = await BibleVerse.find(ref);
  if (vers1 && vers2) {
    const verseStart = parseInt(vers1);
    const verseEnd = parseInt(vers2);
    const arr = [];
    const titre = find[0].book_name;

    for (let i = verseStart; i <= verseEnd; i++) {
      const v = find.filter((el) => el.verse === i)[0].text;
      const obj = {
        n: i < 10 ? `0${i}` : i,
        text: v,
      };
      arr.push(obj);
    }

    const ref_complet = {
      ref_bible: `${titre} ${chapter}: ${vers1}-${vers2}${versionSuffix}`,
      content: JSON.stringify(arr),
    };

    return ref_complet;
  }
  if (vers1 && !vers2) {
    const verseStart = parseInt(vers1);
    const titre = find[0].book_name;
    const v = find.filter((el) => el.verse === verseStart)[0].text;

    const ref_complet = {
      ref_bible: `${titre} ${chapter}: ${vers1}${versionSuffix}`,
      content: JSON.stringify([{ n: verseStart, text: v }]),
    };
    return ref_complet;
  }
  if (!vers1 && !vers2) {
    const arr = [];
    const titre = find[0].book_name;

    for (let i = 0; i < find.length; i++) {
      const v = find.filter((el) => el.verse === i)[0].text;
      const obj = {
        n: find[i]?.verse < 10 ? `0${find[i].verse}` : find[i]?.verse,
        text: v,
      };
      arr.push(obj);
    }

    const ref_complet = {
      ref_bible: `${titre} ${chapter}${versionSuffix}`,
      content: JSON.stringify(arr),
    };

    return ref_complet;
  }
};
