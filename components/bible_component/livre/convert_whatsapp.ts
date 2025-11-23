import * as htmlparser2 from "htmlparser2";

/**
 * Convertit du HTML en formatage WhatsApp
 * @param {string} htmlString - La chaîne HTML à convertir
 * @returns {string} - Le texte formaté pour WhatsApp
 */
export default function htmlToWhatsApp(htmlString: string): string {
  let result = "";
  let formatStack: string[] = []; // Pour gérer les balises imbriquées
  let listDepth = 0;
  let isInOrderedList = false;

  const parser = new htmlparser2.Parser({
    onopentag(name, attributes) {
      switch (name) {
        case "b":
        case "strong":
          formatStack.push("*");
          result += "*";
          break;

        case "i":
        case "em":
          formatStack.push("_");
          result += "_";
          break;

        case "s":
        case "strike":
        case "del":
          formatStack.push("~");
          result += "~";
          break;

        case "code":
          formatStack.push("```");
          result += "```";
          break;

        case "pre":
          formatStack.push("```\n");
          result += "```\n";
          break;

        case "blockquote":
          formatStack.push("blockquote");
          result += "> ";
          break;

        case "bible-verset":
          const ref_bible = attributes.ref_bible;
          const content = JSON.parse(attributes.content);

          if (ref_bible && content) {
            result += `*${ref_bible}* \n> `;
            for (let vers of content) {
              result += `[${vers.n}] ${vers.text} `;
            }
            result += "\n\n";
          }
          formatStack.push("bible-verset");
          break;

        case "h1":
          formatStack.push("h1");
          result += "*";
          break;

        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          formatStack.push("h");
          result += "*";
          break;

        case "p":
          formatStack.push("p");
          break;

        case "div":
          formatStack.push("div");
          break;

        case "ol":
          listDepth++;
          isInOrderedList = true;
          formatStack.push("ol");
          break;

        case "ul":
          listDepth++;
          isInOrderedList = false;
          formatStack.push("ul");
          break;

        case "li":
          formatStack.push("li");
          result += "- ";
          break;

        case "a":
          formatStack.push(`link:${attributes.href || ""}`);
          break;

        case "br":
          result += "\n";
          break;

        default:
          formatStack.push("");
          break;
      }
    },

    ontext(text) {
      // Pour h1, convertir en majuscules
      if (formatStack.includes("h1")) {
        result += text.toUpperCase();
      } else {
        result += text;
      }
    },

    onclosetag(tagname) {
      const lastFormat = formatStack.pop();

      switch (tagname) {
        case "b":
        case "strong":
          result += "*";
          break;

        case "i":
        case "em":
          result += "_";
          break;

        case "s":
        case "strike":
        case "del":
          result += "~";
          break;

        case "code":
          result += "```";
          break;

        case "pre":
          result += "\n```";
          break;

        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          result += "*\n\n";
          break;

        case "p":
          result += "\n\n";
          break;

        case "div":
          result += "\n";
          break;

        case "li":
          result += "\n";
          break;

        case "ol":
        case "ul":
          listDepth--;
          if (listDepth === 0) {
            result += "\n";
          }
          break;

        case "a":
          if (lastFormat?.startsWith("link:")) {
            const href = lastFormat.substring(5);
            if (href) {
              result += ` (${href})`;
            }
          }
          break;

        case "blockquote":
          // Gérer les retours à la ligne dans les blockquotes
          break;
      }
    },
  });

  parser.write(htmlString);
  parser.end();

  // Nettoyer le résultat
  return result.replace(/\n{3,}/g, "\n\n").trim();
}
