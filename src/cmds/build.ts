import {ensureDirSync} from 'fs-extra';
import {Notify} from '@lubowiecki/node-notify';

import {TranslationsExtractor} from '../classes/translations-extractor/translations-extractor';
import {TranslationsExtractorProps} from '../models/translations-extractor-props';

exports.command = 'build [source] [dist] [i18n] [langs...]';
exports.aliases = ['b'];
exports.desc = 'Generate translations';
exports.builder = {
  source: {
    default: './src/app/**/*+(.ts|.html)',
  },
  dist: {
    default: './src/translations',
  },
  i18n: {
    default: './src/assets/i18n/',
  },
  langs: {
    default: ['pl'],
  },
};
exports.handler = (argv: any) => {
  ensureDirSync(argv.dist);
  ensureDirSync(`${argv.dist}/for-the-translator/`);
  ensureDirSync(argv.i18n);

  const options: TranslationsExtractorProps = {
    inputPath: argv.source,
    outputTranslatorPath: `${argv.dist}/for-the-translator/`,
    outputAppPath: argv.i18n,
    outputInterfaceFile: `${argv.dist}/translations.ts`,
    outputTranslationKeyTypeFile: `${argv.dist}/translation-key.ts`,
    outputMarkerFile: `${argv.dist}/translation-marker.ts`,
    langs: argv.langs,
  };
  const translationsExtractor = new TranslationsExtractor(options);

  try {
    translationsExtractor.extract();
  } catch (error) {
    Notify.error({message: `Error`, error});
  }
};
