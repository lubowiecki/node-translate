import * as R from 'ramda';
import {readFileSync} from 'fs-extra';
import {sync} from 'glob';

import {TranslationsObject} from '../../models/translations-object';

export class TranslationsIdentifiers {
  getNewIdentifiers(inputPath: string): string[] {
    const filePaths: string[] = sync(inputPath);
    const identifiers: Set<string> = new Set();

    filePaths.forEach((path) => {
      let content: string;

      try {
        content = readFileSync(path, 'utf8');
      } catch (e) {
        throw new Error(`File not found: ${e}`);
      }

      const identifiersFromMarkers = this.findMarkers(content);
      const identifiersFromPipes = this.findPipes(content);

      const identifiersInFile = new Set([...identifiersFromMarkers, ...identifiersFromPipes]);

      identifiersInFile.forEach((identifier) => {
        identifiers.add(identifier);
      });
    });

    return Array.from(identifiers).sort();
  }

  private findMarkers(content: string): string[] {
    return R.pipe(
      R.match(/[\s\t\[\(\{\.](?:t|translate\$|instant)\(:?\'\w+(:?.\w+)*/g),
      R.map(R.pipe(R.match(/\w+(:?.\w+)*/g), R.last))
    )(content) as string[];
  }

  private findPipes(content: string): string[] {
    return R.pipe(
      R.match(/\'\w+(?:\.\w+)*\'\s(?:\|\s.+)*?\|\stranslate/g),
      R.map(R.pipe(R.match(/\w+(?:.\w+)*/g), R.head))
    )(content) as string[];
  }

  toObject(identifiers: string[]): TranslationsObject {
    return R.reduce(
      (result, identifier) => {
        return {
          ...result,
          [identifier]: '',
        };
      },
      {},
      identifiers
    );
  }
}
