import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdtemp, mkdir, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import * as request from 'supertest';
import { setupUploads } from './uploads.config';

describe('setupUploads', () => {
  let app: NestExpressApplication;
  let root: string;

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'uploads-'));
    await mkdir(join(root, 'players'));
    await writeFile(join(root, 'players', 'old.html'), '<script>1</script>');
    await writeFile(join(root, 'players', 'ok.png'), 'png');
    const moduleRef = await Test.createTestingModule({}).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    setupUploads(app, root);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await rm(root, { recursive: true, force: true });
  });

  it('sandboxes served files so legacy HTML uploads cannot run scripts', async () => {
    const res = await request(app.getHttpServer())
      .get('/uploads/players/old.html')
      .expect(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toContain('sandbox');
    expect(res.headers['content-security-policy']).toContain(
      "default-src 'none'",
    );
  });

  it('still serves images', () =>
    request(app.getHttpServer())
      .get('/uploads/players/ok.png')
      .expect(200)
      .expect('Content-Type', 'image/png'));

  it('does not list directories', () =>
    request(app.getHttpServer()).get('/uploads/players/').expect(404));
});
