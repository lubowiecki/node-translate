import {Maybe} from '@lubowiecki/ts-utility';

import {TranslationsIdentifiers} from './translations-identifiers';

describe(`TranslationsIdentifiers`, () => {
  let translationsIdentifiers: Maybe<TranslationsIdentifiers>;

  beforeEach(() => {
    translationsIdentifiers = new TranslationsIdentifiers();
  });

  afterEach(() => {
    translationsIdentifiers = null;
  });

  describe(`findMarkers() should find markers in`, () => {
    describe(`object`, () => {
      it(`should find all markers`, () => {
        const content = `
				const obj = {
					A: t('A.B.C'),
					B: 'D.E.F',
					C: t('G.H')
				};`;

        expect((translationsIdentifiers as any).findMarkers(content)).toEqual(['A.B.C', 'G.H']);
      });
    });

    describe(`class`, () => {
      it(`should find all markers in properties`, () => {
        const content = `
				class Class {
					prop = t('A.B');
					prop = t('C');
					prop = at('D');
				}`;

        expect((translationsIdentifiers as any).findMarkers(content)).toEqual(['A.B', 'C']);
      });

      it(`should find all markers in property of type array`, () => {
        const content = `
				class Class {
					prop = [t('A.B'), t('C'), at('D')];
				}`;

        expect((translationsIdentifiers as any).findMarkers(content)).toEqual(['A.B', 'C']);
      });

      it(`should find all markers in property of type object`, () => {
        const content = `
				class Class {
					prop = { a: t('A.B'), b: t('C'), b: at('C')};
				}`;

        expect((translationsIdentifiers as any).findMarkers(content)).toEqual(['A.B', 'C']);
      });

      it(`should find all markers in methods`, () => {
        const content = `
				class Class {
					get1() {
						return this.get1(t('A'));
					}

					get2() {
						return this.get1(t('B.C.D'));
					}

					get3() {
						return this.get1(at('E.F'));
					}
				}`;

        expect((translationsIdentifiers as any).findMarkers(content)).toEqual(['A', 'B.C.D']);
      });

      it(`should find one marker in template strings with translate$`, () => {
        const content = "this.get1(`${this.service.translate$('A.B')}`))";

        expect((translationsIdentifiers as any).findMarkers(content)).toEqual(['A.B']);
      });

      it(`should find one marker in template strings with instant`, () => {
        const content = "this.get1(`${this.service.instant('A.B')}`))";

        expect((translationsIdentifiers as any).findMarkers(content)).toEqual(['A.B']);
      });

      it(`should find all markers in template strings with translate$`, () => {
        const content = "this.get1(`${this.service.translate$('A.B')}`) this.get1(`${this.service.translate$('C.D')}`)";

        expect((translationsIdentifiers as any).findMarkers(content)).toEqual(['A.B', 'C.D']);
      });

      it(`should find all markers in template strings with instant`, () => {
        const content = "this.get1(`${this.service.instant('A.B')}`) this.get1(`${this.service.instant('C.D')}`)";

        expect((translationsIdentifiers as any).findMarkers(content)).toEqual(['A.B', 'C.D']);
      });
    });
  });

  describe(`findPipes() should find pipes in template`, () => {
    it(`should find all pipes in template`, () => {
      const content = `
				<div>{{ 'nA' }}</div>
				<div>{{ 'A' | translate }}</div> <div>{{ 'B.B.A' | translate: '1' }}</div> <div>{{ 'C' | translate: 1 }}</div>
				<div>{{'D.B.B' | translate: { z: 1 }}}</div>
				<div>{{'E' | translate: { z: 'a' }}}</div>
				<div>{{ 'F' | async | translate }}</div>
				<div>{{ 'G' | name | translate }}</div>
				<div>{{ 'nG1' | name }}</div>
				<div>{{ 'nG2' | nametranslate }}</div>
				<div>{{ 'H' | getName: 'a' | translate }}</div>
				<div>{{ 'I' | getName: {a: 1} | translate }}</div>
				<div>{{ 'J' | getName: {a: '1'} | translate }}</div>
			`;

      expect((translationsIdentifiers as any).findPipes(content)).toEqual(['A', 'B.B.A', 'C', 'D.B.B', 'E', 'F', 'G', 'H', 'I', 'J']);
    });
    it(`should find all pipes in template`, () => {
      const content = `
				<div>{{ 'nA' }}</div>
				<div>{{ 'A' | translate }}</div>
				<div>{{ 'B.B.A' | translate: '1' }}</div>
				<div>{{ 'C' | translate: 1 }}</div>
				<div>{{ 'D.B.B' | translate: { z: 1 } }}</div>
				<div>{{ 'E' | translate: { z: 'a' } }}</div>
				<div>{{ 'F' | async | name | translate }}</div>
				<div>{{ 'G' | name | translate }}</div>
				<div>{{ 'nG1' | name }}</div>
				<div>{{ 'nG2' | nametranslate }}</div>
				<div>{{ 'H' | getName: 'a' | translate }}</div>
				<div>{{ 'I' | getName: {a: 1} | translate }}</div>
				<div>{{ 'J' | getName: {a: '1'} | translate }}</div>
			`;

      expect((translationsIdentifiers as any).findPipes(content)).toEqual(['A', 'B.B.A', 'C', 'D.B.B', 'E', 'F', 'G', 'H', 'I', 'J']);
    });

    it(`should find all pipes in template parsed inputs`, () => {
      const content = `
				<div [value]="'nA'"></div>
				<div [value]="'A' | translate"></div>
				<div [value]="'B' | translate: '1'"></div>
				<div [value]="'C.C.A' | translate: 1"></div>
				<div [value]="'D' | translate: {z: 1}"></div>
				<div [value]="'E.C.B' | translate: {z: 'a'}"></div>
				<div [value]="'F' | async | name | translate"></div>
				<div [value]="'G' | name | translate"></div>
				<div [value]="'nG1' | name"></div>
				<div [value]="'nG2' | nametranslate"></div>
				<div [value]="'H' | getName: 'a' | translate"></div>
				<div [value]="'I' | getName: {a: 1} | translate"></div>
				<div [value]="'J' | getName: {a: '1'} | translate"></div>
			`;

      expect((translationsIdentifiers as any).findPipes(content)).toEqual(['A', 'B', 'C.C.A', 'D', 'E.C.B', 'F', 'G', 'H', 'I', 'J']);
    });

    it(`should find all pipes in template inputs`, () => {
      const content = `
				<div value="{{ 'nA' }}"></div>
				<div value="{{ 'A' | translate }}"></div>
				<div value="{{ 'B.D.A' | translate: '1' }}"></div>
				<div value="{{ 'C' | translate: 1 }">}</div>
				<div value="{{ 'D' | translate: { z: 1 } }}"></div>
				<div value="{{ 'E' | translate: { z: 'a' } }}"></div>
				<div value="{{ 'F' | async | translate }}"></div>
				<div value="{{ 'G.D.B' | name | translate }}"></div>
				<div value="{{ 'nG1' | name }}"></div>
				<div value="{{ 'nG2' | nametranslate }}"></div>
				<div value="{{ 'H.D.E' | getName: 'a' | translate }}"></div>
				<div value="{{ 'I' | getName: {a: 1} | translate }}"></div>
				<div value="{{ 'J' | getName: {a: '1'} | translate }}"></div>
			`;

      expect((translationsIdentifiers as any).findPipes(content)).toEqual(['A', 'B.D.A', 'C', 'D', 'E', 'F', 'G.D.B', 'H.D.E', 'I', 'J']);
    });
  });

  describe(`toObject()`, () => {
    it(`should transform array of identifiers into object with identifiers as keys and empty string as values`, () => {
      const identifiers = ['A', 'B.B', 'C.C.C'];
      const stringifiedResult = '{"A":"","B.B":"","C.C.C":""}';

      const result =
        translationsIdentifiers != null && translationsIdentifiers instanceof TranslationsIdentifiers
          ? translationsIdentifiers.toObject(identifiers)
          : null;

      expect(JSON.stringify(result)).toEqual(stringifiedResult);
    });
  });
});
