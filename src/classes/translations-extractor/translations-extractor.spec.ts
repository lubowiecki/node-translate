import {writeFileSync, emptyDirSync, readFileSync, removeSync} from 'fs-extra';
import R from 'ramda';

import {TranslationsExtractor} from './translations-extractor';

const contentTs = "[t('A'), at('B')]; prop = { a: t('A.B'), b: at('C')}; this.get1(t('D')); this.get1(`${service.translate$('E.A')}`))";
const contentHtml = `
	<div>{{ 'nA' }}</div>
	<div>{{ 'A' | translate }}</div>
	<div [value]="'C.C.A' | translate: 1"></div>
	<div [value]="'F' | async | name | translate"></div>
	<div value="{{ 'J' | getName: {a: '1'} | translate }}"></div>
`;

describe(`TranslationsExtractor`, () => {
  const tmpFolderPath = '.tmp/';
  const tmpSrcPath = `${tmpFolderPath}src/`;
  const tmpTranslatorPath = `${tmpFolderPath}for-the-translator/`;
  const tmpInterfacePath = `${tmpFolderPath}translations.ts`;
  const tmpAppPath = `${tmpFolderPath}i18n/`;
  const tmpOutputTranslationKeyTypeFile = `${tmpFolderPath}translation-key.ts`;
  const tmpOutputMarkerFile = `${tmpFolderPath}translation-marker.ts`;
  let translationsExtractor: TranslationsExtractor;

  describe(`extract() without old translations`, () => {
    beforeAll(() => {
      emptyDirSync(`${tmpFolderPath}`);
      emptyDirSync(`${tmpSrcPath}`);
      emptyDirSync(`${tmpTranslatorPath}`);
      emptyDirSync(`${tmpAppPath}`);

      writeFileSync(`${tmpSrcPath}file.ts`, contentTs, {encoding: 'utf-8'});
      writeFileSync(`${tmpSrcPath}file.html`, contentHtml, {encoding: 'utf-8'});

      translationsExtractor = new TranslationsExtractor({
        inputPath: `${tmpSrcPath}/**/*+(.ts|.html)`,
        outputTranslatorPath: tmpTranslatorPath,
        outputInterfaceFile: tmpInterfacePath,
        outputAppPath: tmpAppPath,
        outputTranslationKeyTypeFile: tmpOutputTranslationKeyTypeFile,
        outputMarkerFile: tmpOutputMarkerFile,
        langs: ['pl', 'en'],
      });
      translationsExtractor.extract();
    });

    afterAll(() => {
      removeSync(`${tmpFolderPath}`);
    });

    it(`should extract indetifiers for translator and save in pl.json and en.json`, () => {
      const pl = readFileSync(`${tmpTranslatorPath}pl.json`);
      expect(fileObjectKeys(pl)).toEqual(['A', 'A.B', 'C.C.A', 'D', 'E.A', 'F', 'J']);

      const en = readFileSync(`${tmpTranslatorPath}en.json`);
      expect(fileObjectKeys(en)).toEqual(['A', 'A.B', 'C.C.A', 'D', 'E.A', 'F', 'J']);
    });

    it(`should save translations for app in pl.json and en.json`, () => {
      const pl = readFileSync(`${tmpAppPath}pl.json`);
      expect(fileObjectKeys(pl)).toEqual([]);

      const en = readFileSync(`${tmpAppPath}en.json`);
      expect(fileObjectKeys(en)).toEqual([]);
    });
  });

  describe(`extract() with old translations`, () => {
    const partialyFilledTranslationPl = `{"A":"test pl","A.B":"b pl","n":"n"}`;
    const partialyFilledTranslationEn = `{"A":"test en","A.B":"b en","n":"n"}`;

    beforeAll(() => {
      emptyDirSync(`${tmpFolderPath}`);
      emptyDirSync(`${tmpSrcPath}`);
      emptyDirSync(`${tmpTranslatorPath}`);
      emptyDirSync(`${tmpAppPath}`);

      writeFileSync(`${tmpSrcPath}file.ts`, contentTs, {encoding: 'utf-8'});
      writeFileSync(`${tmpSrcPath}file.html`, contentHtml, {encoding: 'utf-8'});
      writeFileSync(`${tmpTranslatorPath}pl.json`, partialyFilledTranslationPl, {encoding: 'utf-8'});
      writeFileSync(`${tmpTranslatorPath}en.json`, partialyFilledTranslationEn, {encoding: 'utf-8'});

      translationsExtractor = new TranslationsExtractor({
        inputPath: `${tmpSrcPath}/**/*+(.ts|.html)`,
        outputTranslatorPath: tmpTranslatorPath,
        outputInterfaceFile: tmpInterfacePath,
        outputAppPath: tmpAppPath,
        outputTranslationKeyTypeFile: tmpOutputTranslationKeyTypeFile,
        outputMarkerFile: tmpOutputMarkerFile,
        langs: ['pl', 'en'],
      });
      translationsExtractor.extract();
    });

    afterAll(() => {
      removeSync(`${tmpFolderPath}`);
    });

    it(`should extract indetifiers for translator and save in pl.json and en.json`, () => {
      const pl = readFileSync(`${tmpTranslatorPath}pl.json`);
      expect(fileObjectKeys(pl)).toEqual(['A', 'A.B', 'C.C.A', 'D', 'E.A', 'F', 'J']);

      const en = readFileSync(`${tmpTranslatorPath}en.json`);
      expect(fileObjectKeys(en)).toEqual(['A', 'A.B', 'C.C.A', 'D', 'E.A', 'F', 'J']);
    });

    it(`should save translations for app in pl.json and en.json without missing keys`, () => {
      const pl = readFileSync(`${tmpAppPath}pl.json`);
      expect(fileObjectKeys(pl)).toEqual(['A', 'A.B']);

      const en = readFileSync(`${tmpAppPath}en.json`);
      expect(fileObjectKeys(en)).toEqual(['A', 'A.B']);
    });
  });
});

function fileObjectKeys(result: Buffer): string[] {
  return R.keys(JSON.parse(result.toString()) as {});
}
