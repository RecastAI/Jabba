/*
** This module helps reading a json wording file and templating it
*/
import { readFile, readFileSync } from "fs";
import { shuffle } from "lodash";

export type StringMap = { [key: string]: string[] };
export type WordingFile = { [key: string]: StringMap[][] };

function checkWordingFile(file: any): Error | null {
  for (const key in file) {
    if (typeof key !== "string") {
      return new Error(`Invalid wording key: ${key}. Keys must be a string.`);
    }
    if (!(file[key] instanceof Array)) {
      return new Error(`Invalid value for key ${key}: Value must be an array`);
    }
    for (const value of file[key]) {
      if (!(value instanceof Array)) {
        return new Error(
          `Invalid entry ${value} for key ${key}: Value must be an array of messages`
        );
      }
    }
  }
  return null;
}

export default class Wording {
  public dictionnary: WordingFile;

  constructor(dictionnary: WordingFile) {
    this.dictionnary = dictionnary;
  }

  // public execTemplate(template: string[]): IMessage[] {
  //   return template.map(line => shuffle(line.split('$$'))[0]).map(elem => {
  // }

  public get(key: string): StringMap[] {
    if (!this.dictionnary[key] || this.dictionnary[key].length === 0) {
      throw new Error(`Could not find wording for key "${key}"`);
    }
    return shuffle(this.dictionnary[key])[0];
  }

  static fromFile(path: string): Promise<Wording> {
    return new Promise((resolve, reject) => {
      readFile(path, (err: NodeJS.ErrnoException, content: Buffer) => {
        if (err)
          return reject(
            `Wording#loadFromFile error while reading file: ${err}`
          );

        const json: any = JSON.parse(content.toString());
        const invalidFileError: Error | null = checkWordingFile(json);

        if (!invalidFileError) return resolve(new Wording(json as WordingFile));
        return reject(invalidFileError);
      });
    });
  }

  static fromFileSync(path: string): Wording {
      const content: Buffer = readFileSync(path);
      const json: any = JSON.parse(content.toString());
      const invalidFileError: Error | null = checkWordingFile(json);

      if (invalidFileError) throw invalidFileError;
      return new Wording(json as WordingFile);
  }

  static fromJson(json: any): Wording {
    const invalidFileError: Error | null = checkWordingFile(json);

    if (!invalidFileError) return new Wording(json as WordingFile);
    throw invalidFileError;
  }
}
