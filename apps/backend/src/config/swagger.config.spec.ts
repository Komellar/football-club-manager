import { apiDocsEnabled } from './swagger.config';

describe('apiDocsEnabled', () => {
  it('serves docs in development and test', () => {
    expect(apiDocsEnabled({ NODE_ENV: 'development' })).toBe(true);
    expect(apiDocsEnabled({})).toBe(true);
  });

  it('hides docs in production unless explicitly enabled', () => {
    expect(apiDocsEnabled({ NODE_ENV: 'production' })).toBe(false);
    expect(
      apiDocsEnabled({ NODE_ENV: 'production', SWAGGER_ENABLED: 'true' }),
    ).toBe(true);
  });
});
