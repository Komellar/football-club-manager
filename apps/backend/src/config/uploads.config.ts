import { join } from 'path';
import type { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Serves uploaded images. The headers stop browsers from sniffing a file
 * into HTML and from running scripts in anything opened directly, which also
 * covers files uploaded before extensions were derived from file contents.
 */
export function setupUploads(
  app: NestExpressApplication,
  root = join(process.cwd(), 'uploads'),
): void {
  app.useStaticAssets(root, {
    prefix: '/uploads/',
    index: false,
    dotfiles: 'deny',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; img-src 'self'; sandbox",
      );
    },
  });
}
