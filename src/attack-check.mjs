// The student self-check records only requests actually made.
// Never return tokens, private keys, real names, or note bodies.
export async function runAttackChecks(config) {
  if (!Number.isInteger(config.step) || config.step < 2) {
    throw new Error('2단계 이상에서 /data.json 비공개 여부를 점검할 수 있습니다.');
  }
  let app;
  try {
    app = new URL(config.publicAppUrl);
  } catch {
    throw new Error('aleph.config.json의 실제 배포 주소를 먼저 넣어 주세요.');
  }
  if (app.protocol !== 'https:' || app.username || app.password || app.search || app.hash
      || app.pathname !== '/' || app.hostname.endsWith('.example')) {
    throw new Error('aleph.config.json의 실제 배포 주소를 먼저 넣어 주세요.');
  }

  const response = await fetch(new URL('/data.json', app), {
    redirect: 'error', signal: AbortSignal.timeout(10000),
  });
  const hidden = response.status === 404;
  return [{
    attackId: 'anonymous_static_note_read',
    expected: '/data.json 요청이 HTTP 404로 거부됨',
    observed: hidden
      ? '비로그인 /data.json 요청이 HTTP 404로 거부됨'
      : `비로그인 /data.json 요청이 HTTP ${response.status}를 반환함 (404가 아님)`,
  }];
}
