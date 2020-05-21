import * as R from 'ramda';
import {writeFileSync} from 'fs-extra';
import {Maybe} from '@lubowiecki/ts-utility';
import {Notify} from '@lubowiecki/node-notify';

import {TranslationsExtractorProps} from '../../models/translations-extractor-props';
import {TranslationsIdentifiers} from '../translations-identifiers/translations-identifiers';
import {TranslationsBuilder} from '../translations-builder/translations-builder';
import {TranslationsObject} from '../../models/translations-object';

export class TranslationsExtractor {
  translationsIdentifiers: TranslationsIdentifiers;
  translationsBuilder: TranslationsBuilder;

  constructor(private props: TranslationsExtractorProps) {
    this.translationsIdentifiers = new TranslationsIdentifiers();
    this.translationsBuilder = new TranslationsBuilder();
  }

  extract(): void {
    const newIdentifiers: string[] = this.translationsIdentifiers.getNewIdentifiers(this.props.inputPath);
    this.saveTranslations(this.props.langs, this.translationsIdentifiers.toObject(newIdentifiers));
  }

  private saveTranslations(langs: string[], translations: TranslationsObject): void {
    R.forEach((lang) => {
      const fileForTheTranslatorName = `${this.props.outputTranslatorPath}${lang}.json`;
      const fileForAppName = `${this.props.outputAppPath}${lang}.json`;
      const oldTranslations: Maybe<TranslationsObject> = this.translationsBuilder.getOldTranslationObject(
        lang,
        this.props.outputTranslatorPath
      );
      let newTranslations: TranslationsObject = R.clone(translations);

      if (oldTranslations && R.is(Object, oldTranslations)) {
        newTranslations = this.translationsBuilder.mergeOldTranslations(newTranslations, oldTranslations);
      }

      if (lang === 'pl') {
        this.buildInterface(newTranslations);
      }

      this.writeFile(fileForTheTranslatorName, newTranslations, true);
      this.writeFile(fileForAppName, this.translationsBuilder.removeKeysWithEmptyString(newTranslations));
    }, langs);

    Notify.success({message: `Translations generated`});
  }

  private writeFile(name: string, translation: TranslationsObject, format = false): void {
    try {
      writeFileSync(name, `${JSON.stringify(translation, null, format ? '\t' : undefined)}\n`, 'utf8');
      Notify.info({message: `Saved file: ${name}`});
    } catch (error) {
      Notify.error({message: `Can't save file: ${name}`, error});
    }
  }

  private buildInterface(newTranslations: TranslationsObject) {
    let keys = '';

    R.pipe(
      R.keys,
      R.forEach((key) => {
        keys = `${keys}\n\t'${key}': string;`;
      })
    )(newTranslations);

    this.saveTranslationsInterface(keys);
    this.saveTranslationKeyType();
    this.saveTranslationMarker();
  }

  private saveTranslationsInterface(keys: string): void {
    try {
      writeFileSync(this.props.outputInterfaceFile, `export interface Translations {${keys}\n}`);
      Notify.info({message: `Saved file: ${this.props.outputInterfaceFile}`});
    } catch (error) {
      Notify.error({message: `Can't save file: ${this.props.outputInterfaceFile}`, error});
    }
  }

  private saveTranslationKeyType(): void {
    try {
      writeFileSync(
        this.props.outputTranslationKeyTypeFile,
        `import {Translations} from './translations';
export type TranslationKey = keyof Translations;`
      );
      Notify.info({message: `Saved file: ${this.props.outputTranslationKeyTypeFile}`});
    } catch (error) {
      Notify.error({message: `Can't save file: ${this.props.outputTranslationKeyTypeFile}`, error});
    }
  }

  private saveTranslationMarker(): void {
    try {
      writeFileSync(
        this.props.outputMarkerFile,
        `import {TranslationKey} from './translation-key';
export function t(key: TranslationKey): TranslationKey {
	return key;
}`
      );
      Notify.info({message: `Saved file: ${this.props.outputMarkerFile}`});
    } catch (error) {
      Notify.error({message: `Can't save file: ${this.props.outputMarkerFile}`, error});
    }
  }
}
