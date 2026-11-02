import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { deploymentIdentity } from './deployment-identity.mjs';

const root = resolve(import.meta.dirname, '..');
const publicDir = resolve(root, 'public');
const stalePublicData = resolve(publicDir, 'data.json');
const config = JSON.parse(await readFile(resolve(root, 'aleph.config.json'), 'utf8'));

if (!Number.isInteger(config.step) || config.step < 2) {
  throw new Error('2단계 이상 설정에서만 보호된 자료 API 빌드를 실행할 수 있습니다.');
}

await mkdir(publicDir, { recursive: true });
// Remove any data.json left by an earlier step-1 build.
await rm(stalePublicData, { force: true });
console.log('공개 정적 data.json을 제거했습니다. 자료는 /api/notes에서 제공합니다.');

if (!process.argv.includes('--local')) {
  const identity = deploymentIdentity(process.env, config);
  await writeFile(resolve(publicDir, 'aleph.json'),
    `${JSON.stringify(identity, null, 2)}\n`, 'utf8');
  console.log('배포 저장소·커밋·주소를 public/aleph.json에 기록했습니다.');
}
