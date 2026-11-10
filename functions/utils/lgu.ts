import lguConfig from '../../config/lgu.config.json';

const COUNCIL_BY_TYPE: Record<string, string> = {
  municipality: 'Sangguniang Bayan',
  city: 'Sangguniang Panlungsod',
  province: 'Sangguniang Panlalawigan',
};

/** The local legislative body for the configured LGU type. */
export const councilName =
  COUNCIL_BY_TYPE[lguConfig.lgu.type] ?? COUNCIL_BY_TYPE.municipality;

/** The LGU's official website, without a trailing slash. */
export const officialWebsite = lguConfig.lgu.officialWebsite.replace(
  /\/+$/,
  ''
);
