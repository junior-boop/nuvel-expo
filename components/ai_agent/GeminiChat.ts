import { GoogleGenAI } from "@google/genai/web";
import * as marked from "marked";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export class GeminiChat {
  private ai: GoogleGenAI;
  private chat: any;
  private content: string;
  private history: ChatMessage[] = [];

  constructor(
    apiKey: string,
    contents: string,
    initialHistory: ChatMessage[] = []
  ) {
    this.content = contents;
    this.ai = new GoogleGenAI({
      vertexai: false,
      apiKey: apiKey,
    });
    this.history = initialHistory;
    this.initChat();
  }

  private initChat() {
    const formattedHistory = this.history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    this.chat = this.ai.chats.create({
      model: "gemini-2.5-flash-lite",
      history: [
        {
          role: "user",
          parts: [{ text: this.content }],
        },
        {
          role: "model",
          parts: [{ text: "Ok!, C'est comprit, je vais le faire!" }],
        },
        ...formattedHistory,
      ],
    });
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await this.chat.sendMessage({ message });

      this.history.push(
        { role: "user", content: message, timestamp: new Date() },
        { role: "assistant", content: response.text, timestamp: new Date() }
      );

      return {
        text: response.text,
        history: this.history,
      };
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      throw error;
    }
  }

  async sendMessageStream(message: string): Promise<AsyncGenerator<string>> {
    try {
      const response = await this.chat.sendMessageStream({ message });
      const generator = async function* () {
        for await (const chunk of response) {
          yield chunk.text;
        }
      };
      return generator();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message en stream:", error);
      throw error;
    }
  }

  //   async generateContent(
  //     prompt: string,
  //     options: GenerateOptions = {}
  //   ): Promise<GenerateResponse> {
  //     try {
  //       const defaultOptions = {
  //         temperature: 0.5,
  //         maxOutputTokens: 1024,
  //         model: "gemini-2.5-flash-lite",
  //       };

  //       const mergedOptions = { ...defaultOptions, ...options };

  //       const result = await this.ai.models.generateContent({
  //         model: mergedOptions.model,
  //         contents: this.content,
  //         config : {
  //             thinkingConfig :
  //         }
  //       });

  //       return {
  //         text: result.text as string,
  //         usage: result.promptFeedback,
  //       };
  //     } catch (error) {
  //       console.error("Erreur lors de la génération de contenu:", error);
  //       throw error;
  //     }
  //   }

  getHistory(): any[] {
    return [...this.history];
  }

  resetChat(): void {
    this.initChat();
  }
}

// Utilitaire pour l'affichage du markdown
export class DebugOutput {
  static async renderMarkdown(...args: string[]): Promise<string> {
    const promises = args.map(async (arg) => await marked.parse(arg ?? ""));
    const strings = await Promise.all(promises);
    return strings.join("");
  }

  static appendToDocument(html: string): void {
    const turn = document.createElement("div");
    turn.innerHTML = html;
    document.body.append(turn);
  }
}
