# Translations for BetterGov.ph

## How it works

Translation files live in `public/locales/`:

- `en` - English (required - fallback language)
- `fil` - Filipino
- `pag` - Pangasinan (in progress; hidden until `features.pangasinan` is on)

To organize translations better the concept of namespacing is used

- `common.json` - Home page, disclaimer, directory and shared civic text
- `about.json` - About page
- `navigation.json` - Navbar, menus and footer
- `ui.json` - Shared components, plus LGU-type words (`city`, `municipality`,
  `province`) picked by i18next context
- `services.json` - Services directory and service detail pages
- `openlgu.json` - OpenLGU legislative pages
- `transparency.json` - Transparency portal and financial report
- `statistics.json` - Statistics layout, income and competitiveness pages
- `government.json` - Government hub and barangay pages
- `pages.json` - Contact, Join Us, Ideas, Contribute, Sitemap, Search,
  weather, forex, Accessibility and Terms of Service

Every namespace exists in `en`, `fil` and `pag` (Pangasinan files start as
`{}`), and is listed in the `ns` array in `src/i18n.ts` so it loads before a
page renders. `src/data/__tests__/localeParity.test.ts` enforces both.

## For translators

### Adding translations to existing pages

1. Find the page file (like `visa.json`)
2. Edit the English version (required)
3. Add translations to your language

**Note**: English is the fallback language. If a translation is missing in your language, it will show English instead. So you only need to translate what you can!

Example:

```json5
// English
{
  "title": "Visa Information",
  "steps": ["Step 1", "Step 2", "Step 3"]
}

// Filipino
{
  "title": "Impormasyon sa Visa",
  "steps": ["Hakbang 1", "Hakbang 2", "Hakbang 3"]
}
```

## Pangasinan translations

Pangasinan (`pag`) is set up but not yet translated. Its files in
`public/locales/pag/` start as empty objects, and every key that is missing
falls back to English, so the portal works in Pangasinan with any amount of the
translation done.

Only human translations are accepted. Machine-translated strings will not be
merged, however good they look: a civic portal cannot publish wording nobody
who speaks the language has checked. The maintainer chooses the translators,
and a pull request is merged only after a Pangasinan speaker has reviewed it.

### Contributing

1. Pick keys from any file in `public/locales/en/` and copy them into the
   matching file in `public/locales/pag/`, keeping the same nesting.
2. Translate the values. Leave the keys themselves in English.
3. Keep every placeholder exactly as it is, including the double braces:
   `{{portal}}`, `{{lgu}}`, `{{date}}` and so on. They are filled in by the
   portal; translating or dropping one breaks the sentence. Keep tags such as
   `<strong>` and `<anchor>` too: translate the words between them, not the tags.
   Never name a tag after an HTML void element (`link`, `img`, `br`, `input`
   and so on): `<Trans>` parses it as empty and the words fall outside it.
4. Translate lists whole. A list in Pangasinan replaces the English one rather
   than merging with it, so it needs the same number of items.
5. Do not add empty strings. Leave a key out instead, and English will show.
6. Run `npm run test -- --run src/data/__tests__/localeParity.test.ts`, which
   rejects keys English does not have and changed placeholders.
7. Open a pull request saying who translated the strings and who reviewed
   them.

### Turning it on

Pangasinan appears in the language switcher only when `features.pangasinan` is
`true` in `config/lgu.config.json`. Leave it `false` until enough of the
portal is translated and reviewed to be useful to a reader.

## For developers

### Using translations in code

```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('page-name');
return <h1>{t('title')}</h1>;
```

### Arrays

```tsx
const items = t('items', { returnObjects: true }) as string[];
```

### Adding new feature with translation

1. Create `new-namespace.json` under `public/locales/en` and
   `public/locales/fil` with the same keys, and an empty `{}` under
   `public/locales/pag`
2. Add to `src/i18n.ts`: `ns: [...otherNamespaces,'new-namespace']`
3. Use `useTranslation('new-namespace')` in your component
4. Pass LGU names and type-aware words from `useLguTerms()`
   (`src/lib/useLguTerms.ts`) as interpolation values rather than writing
   "City" or the LGU name into the strings
