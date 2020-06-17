# node-translate

Helper tool for generating translation files that works with ngx-translate

## Generate translations

Find all translation keys in 'app' and 'domain' folders and generate translation files

```console
translate build --source=\"./src/{app,domain}/**/*+(.ts|.html)\" --langs=pl --langs=en
```

## Define translation keys

### in TypeScript

Every translation key needs to match RegExp which means also that it needs to be used insinde of methods translate\$ or instant

```
/[\s\t\[\(\{\.](?:t|translate\$|instant)\(:?\'\w+(:?.\w+)*/
```

If translate\$ or instant methods can't be used, wrap translation key in translation marker 't'

```typescript
const a = t('A.B.C');
```

### in HTML

Every translatio key needs to match RegExp which means also that it needs to pass through 'translate' pipe

```
/\'\w+(?:\.\w+)*\'\s(?:\|\s.+)*?\|\stranslate/
```

#### Example

```html
<div [value]="'J' | async | name | translate"></div>
<div value="{{ 'J.J' | getName: {a: '1'} | translate }}"></div>
<div value="{{ 'J.J.J' | translate: {name: 'Jan'} }}"></div>
```

## Default config

```json
{
  "inputPath": "./src/app/**/*+(.ts|.html)",
  "outputTranslatorPath": "./src/translations/for-the-translator/",
  "outputAppPath": "./src/assets/i18n/",
  "outputInterfaceFile": "./src/translations/translations.ts",
  "outputTranslationKeyTypeFile": "./src/translations/translation-key.ts",
  "outputMarkerFile": "./src/translations/translation-marker.ts",
  "langs": ["pl"]
}
```
