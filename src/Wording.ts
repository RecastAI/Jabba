/*
** This module helps reading a json wording file and templating it
*/
import { readFile } from "fs";
import { shuffle } from "lodash";

export type stringMap = { [key: string]: string[] };
export interface IMessage {
  type: "text" | "delay" | "picture";
  content: string | number;
}

function checkWordingFile(file: any): Error | null {
  for (const key in file) {
    if (typeof key !== "string") {
      return new Error(`Invalid wording key: ${key}. Keys must be a string.`);
    }
    if (!(file[key] instanceof Array)) {
      return new Error(`Invalid value for key ${key}: Value must be an array`);
    }
    for (const value of file[key]) {
      if (typeof value !== "string") {
        return new Error(
          `Invalid entry ${value} for key ${key}: Value must be an array of strings`
        );
      }
    }
  }
  return null;
}

export default class Wording {
  public dictionnary: stringMap;

  constructor(dictionnary: stringMap) {
    this.dictionnary = dictionnary;
  }

  public execTemplate(template: string[]): IMessage[] {
    return template.map(line => shuffle(line.split("$$"))[0]).map(elem => {
      if (/^delai /.test(elem)) {
        return {
          type: "delay",
          content: parseInt(elem.replace(/delai */, ""), 10)
        } as IMessage;
      }
      if (/^image /.test(elem)) {
        return {
          type: "picture",
          content: elem.replace(/^image /, "")
        } as IMessage;
      }
      return { type: "text", content: elem } as IMessage;
    });
  }

  public get(key: string): IMessage[] {
    if (!this.dictionnary[key] || this.dictionnary[key].length === 0) {
      throw new Error(`Could not find wording for key "${key}"`);
    }
    return this.execTemplate(this.dictionnary[key]);
  }

  static fromFile(path: string): Promise<Wording> {
    return new Promise((resolve, reject) => {
      readFile(path, (err: NodeJS.ErrnoException, content: Buffer) => {
        if (err)
          return reject(
            `Wording#loadFromFile error while reading file: ${err}`
          );

        const json: any = JSON.stringify(content.toString());
        const invalidFileError: Error | null = checkWordingFile(json);

        if (!invalidFileError) return resolve(new Wording(json as stringMap));
        return reject(invalidFileError);
      });
    });
  }

  static fromJson(json: any): Wording {
    const invalidFileError: Error | null = checkWordingFile(json);

    if (!invalidFileError) return new Wording(json as stringMap);
    throw invalidFileError;
  }
}
