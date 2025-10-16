import Genese from "./Gen.json";
import Exode from "./Exo.json";
import Levitique from "./Lev.json";
import Nombre from "./Nbr.json";
import Deut from "./Deut.json";
import Josue from "./Jos.json";
import juges from "./Jug.json";
import Ruth from "./Rut.json";
import Sam1 from "./1Sam.json";
import Sam2 from "./2Sam.json";
import Rois1 from "./1Rois.json";
import Rois2 from "./2Rois.json";
import Chron1 from "./1Ch.json";
import Chron2 from "./2Ch.json";
import Esdra from "./Esd.json";
import Nehemie from "./Neh.json";
import Esth from "./Est.json";
import Job from "./Job.json";
import Psaum from "./Ps.json";
import Prov from "./Pr.json";
import Eccl from "./Ecc.json";
import Cantic from "./Can.json";
import Essaie from "./Es.json";
import Jeremie from "./Jer.json";
import Lam from "./Lam.json";
import Eze from "./Eze.json";
import Dan from "./Dan.json";
import Ose from "./Os.json";
import Joel from "./Joel.json";
import Amos from "./Amos.json";
import Abdias from "./Abd.json";
import Jonas from "./Jon.json";
import Miche from "./Mich.json";
import Nahum from "./Nah.json";
import habacuc from "./Hab.json";
import Sophonie from "./Soph.json";
import Agge from "./Agg.json";
import Zach from "./Zach.json";
import Malachi from "./Mal.json";
import Matt from "./Matt.json";
import Marc from "./Marc.json";
import Luc from "./Luc.json";
import Jean from "./Jn.json";
import Act from "./Act.json";
import Romain from "./Rom.json";
import Cor1 from "./1Cor.json";
import Cor2 from "./2Cor.json";
import Gal from "./Gal.json";
import Eph from "./Eph.json";
import Phil from "./Phil.json";
import Colo from "./Col.json";
import Thes1 from "./1The.json";
import Thes2 from "./2The.json";
import Tim1 from "./1Tim.json";
import Tim2 from "./2Tim.json";
import Tit from "./Tit.json";
import Philemon from "./Phile.json";
import Heb from "./Heb.json";
import Jacque from "./Jacq.json";
import Pier1 from "./1P.json";
import Pier2 from "./2P.json";
import Jean1 from "./1Jn.json";
import Jean2 from "./2jn.json";
import Jean3 from "./3Jn.json";
import Jude from "./Jude.json";
import Apcalipse from "./Apo.json";

const data = [
  {
    titre: "Genèse",
    abr: ["gen", "Gen", "gns", "GNS", "GEN", "Gns", "Gn", "Gn"],
    index: "A1",
    nbr_chap: 50,
    livre: Genese,
  },
  {
    titre: "Exode",
    abr: ["Ex", "Exo", "exo", "ex", "EXO", "EX"],
    index: "A2",
    nbr_chap: 40,
    livre: Exode,
  },
  {
    titre: "Lévitique",
    abr: ["LV", "Lv", "lv", "LEV", "Lev", "lev"],
    index: "A3",
    nbr_chap: 27,
    livre: Levitique,
  },
  {
    titre: "Nombres",
    abr: ["NOMB", "Nomb", "nomb", "NBR", "Nbr", "nbr"],
    index: "A4",
    nbr_chap: 36,
    livre: Nombre,
  },
  {
    titre: "Deutéronome",
    abr: ["DEUT", "Deut", "deut"],
    index: "A5",
    nbr_chap: 34,
    livre: Deut,
  },
  {
    titre: "Josué",
    abr: ["JOS", "Jos", "jos"],
    index: "A6",
    nbr_chap: 24,
    livre: Josue,
  },
  {
    titre: "Juges",
    abr: ["JUG", "jug", "jug"],
    index: "A7",
    nbr_chap: 21,
    livre: juges,
  },
  {
    titre: "Ruth",
    abr: ["RUT", "Rut", "rut", "ruth", "Ruth"],
    index: "A8",
    nbr_chap: 4,
    livre: Ruth,
  },
  {
    titre: "1 Samuel",
    abr: [
      "1SAM",
      "1Sam",
      "1sam",
      "1 SAM",
      "1 Sam",
      "1 sam",
      "1SM",
      "1Sm",
      "1sm",
      "1 SM",
      "1 Sm",
      "1 sm",
      "1S",
      "1s",
    ],
    index: "A9",
    nbr_chap: 31,
    livre: Sam1,
  },
  {
    titre: "2 Samuel",
    abr: [
      "2SAM",
      "2Sam",
      "2sam",
      "2 SAM",
      "2 Sam",
      "2 sam",
      "2SM",
      "2Sm",
      "2sm",
      "2 SM",
      "2 Sm",
      "2 sm",
      "2S",
      "2s",
    ],
    index: "A10",
    nbr_chap: 24,
    livre: Sam2,
  },
  {
    titre: "1 Rois",
    abr: [
      "1RS",
      "1Rs",
      "1rs",
      "1 Rs",
      "1 RS",
      "1 rs",
      "1R",
      "1r",
      "1 R",
      "1 r",
    ],
    index: "A11",
    nbr_chap: 22,
    livre: Rois1,
  },
  {
    titre: "2 Rois",
    abr: [
      "2RS",
      "2Rs",
      "2rs",
      "2 Rs",
      "2 RS",
      "2 rs",
      "2R",
      "2r",
      "2 R",
      "2 r",
    ],
    index: "A12",
    nbr_chap: 25,
    livre: Rois2,
  },
  {
    titre: "1 Chroniques",
    abr: ["1CH", "1Ch", "1ch", "1 CH", "1 Ch", "1 ch"],
    index: "A13",
    nbr_chap: 29,
    livre: Chron1,
  },
  {
    titre: "2 Chroniques",
    abr: ["2CH", "2Ch", "2ch", "2 CH", "2 Ch", "2 ch"],
    index: "A14",
    nbr_chap: 36,
    livre: Chron2,
  },
  {
    titre: "Esdras",
    abr: ["ESD", "Esd", "esd"],
    index: "A15",
    nbr_chap: 10,
    livre: Esdra,
  },
  {
    titre: "Néhémie",
    abr: ["NEH", "Neh", "neh", "NH", "Nh", "nh"],
    index: "A16",
    nbr_chap: 13,
    livre: Nehemie,
  },
  {
    titre: "Esther",
    abr: ["EST", "Est", "est", "Esth", "esth", "ESTH"],
    index: "A17",
    nbr_chap: 10,
    livre: Esth,
  },
  {
    titre: "Job",
    abr: ["JOB", "job", "jb", "Jb", "JB"],
    index: "A18",
    nbr_chap: 42,
    livre: Job,
  },
  {
    titre: "Psaumes",
    abr: ["PS", "Ps", "ps"],
    index: "A19",
    nbr_chap: 150,
    livre: Psaum,
  },
  {
    titre: "Proverbes",
    abr: [
      "PR",
      "Pr",
      "pr",
      "Pro",
      "PRO",
      "pro",
      "PROV",
      "Prov",
      "prov",
      "PRo",
      "PRov",
      "PROv",
    ],
    index: "A20",
    nbr_chap: 31,
    livre: Prov,
  },
  {
    titre: "Ecclésiaste",
    abr: ["EC", "Ec", "ec"],
    index: "A21",
    nbr_chap: 12,
    livre: Eccl,
  },
  {
    titre: "Cantique",
    abr: ["CAN", "Can", "can", "Cant", "CANT", "cant"],
    index: "A22",
    nbr_chap: 8,
    livre: Cantic,
  },
  {
    titre: "Esaïe",
    abr: [
      "ES",
      "Es",
      "es",
      "Essaie",
      "ESSAIE",
      "essaie",
      "Ess",
      "ESS",
      "ess",
      "Esaie",
      "esaie",
      "ESAIE",
      "Esa",
      "ESA",
      "esa",
      "Esai",
      "esai",
      "ESAI",
    ],
    index: "A23",
    nbr_chap: 66,
    livre: Essaie,
  },
  {
    titre: "Jérémie",
    abr: ["JER", "Jer", "jer", "JR", "Jr", "jr"],
    index: "A24",
    nbr_chap: 52,
    livre: Jeremie,
  },
  {
    titre: "Lamentations",
    abr: ["LAM", "Lam", "lam"],
    index: "A25",
    nbr_chap: 5,
    livre: Lam,
  },
  {
    titre: "Ezéchiel",
    abr: ["EZ", "Ez", "ez", "EZE", "Eze", "eze"],
    index: "A26",
    nbr_chap: 48,
    livre: Eze,
  },
  {
    titre: "Daniel",
    abr: [
      "DAN",
      "Dan",
      "dan",
      "Daniel",
      "daniel",
      "DANIEL",
      "dani",
      "Dani",
      "DANI",
    ],
    index: "A27",
    nbr_chap: 12,
    livre: Dan,
  },
  {
    titre: "Osée",
    abr: ["OS", "Os", "os", "OSE", "Ose", "ose"],
    index: "A28",
    nbr_chap: 14,
    livre: Ose,
  },
  {
    titre: "Joël",
    abr: ["joel", "JOEL", "Joel"],
    index: "A29",
    nbr_chap: 3,
    livre: Joel,
  },
  {
    titre: "Amos",
    abr: ["AMOS", "amos", "AM", "Am", "am"],
    index: "A30",
    nbr_chap: 9,
    livre: Amos,
  },
  {
    titre: "Abdias",
    abr: ["ABD", "Abd", "abd"],
    index: "A31",
    nbr_chap: 1,
    livre: Abdias,
  },
  {
    titre: "Jonas",
    abr: ["JONAS", "jonas", "Jon", "JON", "jon"],
    index: "A32",
    nbr_chap: 4,
    livre: Jonas,
  },
  {
    titre: "Michée",
    abr: ["MIC", "Mic", "mic", "MICH", "Mich", "mich"],
    index: "A33",
    nbr_chap: 7,
    livre: Miche,
  },
  {
    titre: "Nahum",
    abr: ["NAH", "Nah", "nah"],
    index: "A34",
    nbr_chap: 3,
    livre: Nahum,
  },
  {
    titre: "Habacuc",
    abr: ["HAB", "Hab", "hab"],
    index: "A35",
    nbr_chap: 3,
    livre: habacuc,
  },
  {
    titre: "Sophonie",
    abr: ["SOPH", "Soph", "soph"],
    index: "A36",
    nbr_chap: 3,
    livre: Sophonie,
  },
  {
    titre: "Aggée",
    abr: [
      "AGG",
      "Agg",
      "agg",
      "Aggee",
      "AGGEE",
      "Agge",
      "agge",
      "Aggée",
      "aggée",
      "AGGÉE",
    ],
    index: "A37",
    nbr_chap: 2,
    livre: Agge,
  },
  {
    titre: "Zacharie",
    abr: [
      "ZACH",
      "Zach",
      "zach",
      "ZAC",
      "Zac",
      "zac",
      "ZACHARIE",
      "Zacharie",
      "zacharie",
    ],
    index: "A38",
    nbr_chap: 14,
    livre: Zach,
  },
  {
    titre: "Malachie",
    abr: ["MAL", "Mal", "mal", "malachie", "Malachie", "MALACHIE"],
    index: "A39",
    nbr_chap: 4,
    livre: Malachi,
  },
  {
    titre: "Matthieu",
    abr: [
      "MAT",
      "Mat",
      "mat",
      "MTT",
      "Mtt",
      "mtt",
      "matthieu",
      "Matthieu",
      "MATTHIEU",
      "Mathieu",
      "mathieu",
      "MATHIEU",
      "MATT",
      "Matt",
      "matt",
      "Math",
      "math",
      "MATH",
      "matth",
      "Matth",
      "MATTH",
    ],
    index: "N1",
    nbr_chap: 28,
    livre: Matt,
  },
  {
    titre: "Marc",
    abr: ["MARC", "marc", "Marc", "mrc", "MRC", "Mrc"],
    index: "N2",
    nbr_chap: 16,
    livre: Marc,
  },
  {
    titre: "Luc",
    abr: ["LUC", "luc", "Luc", "lc", "LC", "lc"],
    index: "N3",
    nbr_chap: 24,
    livre: Luc,
  },
  {
    titre: "Jean",
    abr: ["JN", "Jn", "jn", "Jean", "jean", "JEAN"],
    index: "N4",
    nbr_chap: 21,
    livre: Jean,
  },
  {
    titre: "Actes",
    abr: ["ACT", "Act", "act", "Actes", "ACTES", "actes"],
    index: "N5",
    nbr_chap: 28,
    livre: Act,
  },
  {
    titre: "Romains",
    abr: [
      "ROM",
      "Rom",
      "rom",
      "romains",
      "Romains",
      "ROMAINS",
      "Rm",
      "rm",
      "RM",
    ],
    index: "N6",
    nbr_chap: 16,
    livre: Romain,
  },
  {
    titre: "1 Corinthiens",
    abr: [
      "1COR",
      "1Cor",
      "1cor",
      "1COR",
      "1Cor",
      "1cor",
      "1corinthiens",
      "1Corinthiens",
      "1CORINTHIENS",
    ],
    index: "N7",
    nbr_chap: 16,
    livre: Cor1,
  },
  {
    titre: "2 Corinthiens",
    abr: ["2COR", "2Cor", "2cor", "2 COR", "2 Cor", "2 cor"],
    index: "N8",
    nbr_chap: 13,
    livre: Cor2,
  },
  {
    titre: "Galates",
    abr: ["GAL", "Gal", "gal"],
    index: "N9",
    nbr_chap: 6,
    livre: Gal,
  },
  {
    titre: "Ephésiens",
    abr: ["EPH", "Eph", "eph"],
    index: "N10",
    nbr_chap: 6,
    livre: Eph,
  },
  {
    titre: "Philippiens",
    abr: ["PHIL", "Phil", "phil"],
    index: "N11",
    nbr_chap: 4,
    livre: Phil,
  },
  {
    titre: "Colossiens",
    abr: ["COL", "Col", "col"],
    index: "N12",
    nbr_chap: 4,
    livre: Colo,
  },
  {
    titre: "1 Thessalonicien",
    abr: ["1TH", "1Th", "1th", "1 TH", "1 Th", "1 th"],
    index: "N12",
    nbr_chap: 5,
    livre: Thes1,
  },
  {
    titre: "2 Thessalonicien",
    abr: ["2TH", "2Th", "2th", "2 TH", "2 Th", "2 th"],
    index: "N13",
    nbr_chap: 3,
    livre: Thes2,
  },
  {
    titre: "1 Timothée",
    abr: ["1TIM", "1Tim", "1tim", "1 TIM", "1 Tim", "1 tim"],
    index: "N14",
    nbr_chap: 6,
    livre: Tim1,
  },
  {
    titre: "2 Timothée",
    abr: ["2TIM", "2Tim", "2tim", "2 TIM", "2 Tim", "2 tim"],
    index: "N15",
    nbr_chap: 4,
    livre: Tim2,
  },
  {
    titre: "Tite",
    abr: ["TIT", "tit"],
    index: "N16",
    nbr_chap: 3,
    livre: Tit,
  },
  {
    titre: "Philémon",
    abr: ["PHIL", "Phil", "phil"],
    index: "N17",
    nbr_chap: 1,
    livre: Philemon,
  },
  {
    titre: "Hébreux",
    abr: ["HEB", "Heb", "heb"],
    index: "N18",
    nbr_chap: 13,
    livre: Heb,
  },
  {
    titre: "Jacques",
    abr: ["JACQ", "Jacq", "jacq"],
    index: "N19",
    nbr_chap: 5,
    livre: Jacque,
  },
  {
    titre: "1 Pierre",
    abr: ["1 P", "1 p", "1P", "1p"],
    index: "N20",
    nbr_chap: 5,
    livre: Pier1,
  },
  {
    titre: "2 Pierre",
    abr: ["2 P", "2 p", "2P", "2p"],
    index: "N21",
    nbr_chap: 3,
    livre: Pier2,
  },
  {
    titre: "1 Jean",
    abr: ["1Jn", "1JN", "1jn", "1 JN", "1 Jn", "1 jn"],
    index: "N22",
    nbr_chap: 5,
    livre: Jean1,
  },
  {
    titre: "2 Jean",
    abr: ["2Jn", "2JN", "2jn", "2 JN", "2 Jn", "2 jn"],
    index: "N23",
    nbr_chap: 1,
    livre: Jean2,
  },
  {
    titre: "3 Jean",
    abr: ["3Jn", "3JN", "3jn", "3 JN", "3 Jn", "3 jn"],
    index: "N24",
    nbr_chap: 1,
    livre: Jean3,
  },
  {
    titre: "Jude",
    abr: ["JUDE", "jude", "Jud", "jud", "JUD", "Jude", "Jd", "jd", "JD"],
    index: "N25",
    nbr_chap: 1,
    livre: Jude,
  },
  {
    titre: "Révélation",
    abr: ["APO", "Apo", "apo"],
    index: "N26",
    nbr_chap: 22,
    livre: Apcalipse,
  },
];

export interface filterProps {
  livre: string;
  chap: string;
  vers1: string;
  vers2?: string;
}

export interface filterResultProps {
  chapitre: string | undefined;
  vers: (
    | {
        n: number;
        v: string;
      }
    | undefined
  )[];
  versChar: string;
  reference: string;
}

export default function filtre({
  livre,
  chap,
  vers1,
  vers2,
}: filterProps): filterResultProps | undefined {
  const book = livre;
  const chapt = parseInt(chap);
  const verset1 = parseInt(vers1);
  const verset2 = vers2 !== undefined ? parseInt(vers2) : null;

  for (let i = 0; i < data.length; i++) {
    const abr = data[i]?.abr;

    for (let t = 0; t < abr.length; t++) {
      if (book === abr[t]) {
        const CC = data[i]?.livre;
        const chapter = CC[chapt - 1]?.chapitre;
        if (verset2 !== null) {
          const arr = [];
          for (let v = verset1 - 1; v < verset2; v++) {
            const z = CC[chapt - 1]?.contenu[v];
            arr.push(z);
          }
          const versChar = verset1 + "-" + verset2;
          const reference = chapter + ": " + versChar;
          const result = { chapitre: chapter, vers: arr, versChar, reference };
          return result;
        } else {
          const ref = CC[chapt - 1]?.contenu[verset1 - 1];
          const versChar = verset1;
          const reference = chapter + ": " + versChar;
          const result = {
            chapitre: chapter,
            vers: [ref],
            versChar,
            reference,
          };
          return result;
        }
      }
    }
  }
}
