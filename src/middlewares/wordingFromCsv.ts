import * as fs from 'fs';

import { ChatbotMiddleware, ChatbotMiddlewareNext, IChatbotContext } from '../Chatbot';

export const answerFloatingFromCsv = async (path: string): Promise<ChatbotMiddleware> => {
  const wording: string[][] = await loadCsvFile(path);

  return async (ctx: IChatbotContext, next: ChatbotMiddlewareNext): Promise<any> => {
    if (!ctx.conversation) {
      return next();
    }
    const intent = ctx.conversation.intents[0];
    if (!intent) {
      return next();
    }

    for (const line of wording) {
      if (line[0] === intent.slug) {
        await ctx.message.reply([{ type: 'text', content: line[1] }]);
        return;
      }
    }
    next();
  };
};

const loadCsvFile = (
  path: string,
  opts?: { delimiter?: string }
): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err: NodeJS.ErrnoException, data: string) => {
      if (err) {
        return reject(err);
      }

      const delimiter: string = opts && opts.delimiter ? opts.delimiter[0] : ';';
      const nonEscapedDelimiter: RegExp = new RegExp(
        `(?:"(?:\\.|[^"])*"|\\.|[^${delimiter}])+`,
        'g'
      );

      const lines: string[][] = data
        .toString()
        .split(/\n|\r/g)
        .filter((line: string) => line.length > 0)
        .map(
          (line: string) => line.replace(/^"|"$/g, '').match(nonEscapedDelimiter) || []
        );

      resolve(lines);
    });
  });
};
