# BYTE BACK 방어전 시작 틀 R5 — 2단계

이 저장소는 BYTE BACK 방어전 2단계 실습용입니다. 화면에 표시되는 네 건의 메모는 모두 가상 자료입니다. 실제 개인정보, 비밀번호, 토큰 또는 서버 전용 키를 저장소에 넣지 마세요.

## 2단계 구현 내용

- 네 건의 가상 메모를 Supabase `public.learning_notes` 테이블로 옮깁니다.
- `owner_id`는 UUID 칼럼으로 만들고 외래키는 설정하지 않습니다.
- 테이블에 RLS를 활성화하고 `PUBLIC`, `anon`, `authenticated` 역할의 테이블 권한을 회수합니다.
- 정적 `data.json` 파일을 제거합니다. 빌드는 이전 배포에서 남은 `public/data.json`도 삭제합니다.
- 화면은 `/api/notes` 서버 함수를 호출해 메모를 표시합니다.
- 서버 함수는 `SUPABASE_URL`과 `SUPABASE_SECRET_KEY` 환경변수를 사용합니다. 비밀 키는 브라우저에 전달하거나 응답·로그에 기록하지 않습니다.
- `public/aleph.json`은 Vercel 빌드 중 계속 생성됩니다.
- 모든 경로에 `X-Content-Type-Options: nosniff` 응답 헤더를 적용합니다.

## 1. Supabase 설정

1. Supabase 프로젝트의 **SQL Editor**를 엽니다.
2. 저장소의 `001_learning_notes.sql` 내용을 붙여넣고 한 번 실행합니다.
3. Table Editor에서 `public.learning_notes` 테이블과 네 건의 가상 메모를 확인합니다.

`001_learning_notes.sql`은 네 메모의 본문을 포함하는 로컬 초기화 파일입니다. Supabase SQL Editor에서 실행하되 GitHub에는 커밋하지 마세요. 따라서 최신 GitHub 소스와 정적 배포 파일에는 메모 본문이 포함되지 않습니다.
4. 테이블 설정에서 RLS가 활성화되어 있는지 확인합니다.

`owner_id`는 UUID 칼럼이며 `auth.users`를 참조하는 외래키는 없습니다. `anon` 및 `authenticated` 역할에는 테이블 권한을 부여하지 않습니다. 서버 함수는 서버 환경변수의 비밀 키를 사용하므로 이 역할 제한과 별개로 데이터에 접근할 수 있습니다.

## 2. Vercel 환경변수

Vercel 프로젝트의 **Settings → Environment Variables**에서 다음 두 변수를 설정합니다.

- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_SECRET_KEY`: Supabase 서버 전용 Secret key

두 변수는 Production과 실제 테스트에 사용할 Preview 환경에 등록한 뒤 재배포합니다. 키 값을 소스 코드, GitHub, 브라우저 코드, 채팅 또는 제출물에 붙여넣지 마세요. `NEXT_PUBLIC_` 같은 공개 접두사를 붙이지 마세요.

## 3. 실행 및 자체 점검

Node.js 22 이상에서 저장소 루트에서 실행합니다.

```powershell
npm ci
npm run build -- --local
npm run test:r5
npm run test:package
```

로컬 빌드는 공개 `public/data.json`을 삭제합니다. `--local` 빌드는 Vercel 배포 메타데이터가 없으므로 `public/aleph.json`을 생성하지 않습니다. 실제 Vercel 빌드에서는 Vercel의 Git·커밋·배포 URL 환경변수를 검증한 뒤 `public/aleph.json`을 생성합니다.

정상 결과:
- `npm run build -- --local`이 성공합니다.
- `npm run test:r5` 및 `npm run test:package`가 통과합니다.
- 화면에 Supabase에서 읽어온 가상 메모 네 건이 표시됩니다.
- `/data.json`은 HTTP 404를 반환합니다.
- 배포된 `/aleph.json`은 HTTP 200을 반환합니다.
- 홈페이지 응답에 `X-Content-Type-Options: nosniff`가 포함됩니다.

## 4. 남아 있는 보안 약점

**`/api/notes` 자체는 현재 공개 엔드포인트입니다.** 로그인·사용자별 권한 검사를 구현하지 않았으므로 누구나 이 API를 호출해 네 건의 가상 메모를 받을 수 있습니다. 이 단계에서는 서버 전용 키를 브라우저에 노출하지 않고 서버 함수에서만 사용하도록 구성했지만, API 접근 통제까지 완성한 것은 아닙니다. 다음 단계에서 인증과 인가를 추가해야 합니다.

RLS와 `anon`/`authenticated` 권한 회수는 Supabase 테이블 직접 접근을 제한합니다. 그러나 서버 함수가 Secret key로 조회하므로 공개 API를 통한 조회는 여전히 가능합니다. 이 실습에는 실제 개인정보를 넣지 마세요.

## 5. 배포 후 100점 추가 조건 확인

아래 명령은 PowerShell에서 실행합니다. `YOUR-APP.vercel.app`을 실제 배포 주소로 바꿉니다.

```powershell
# 1) 정적 메모 파일은 404여야 합니다.
curl.exe -s -o NUL -w "%{http_code}`n" https://YOUR-APP.vercel.app/data.json

# 2) 배포 식별 파일은 200이어야 합니다.
curl.exe -s -o NUL -w "%{http_code}`n" https://YOUR-APP.vercel.app/aleph.json

# 3) 홈페이지 응답 헤더에 nosniff가 있어야 합니다.
curl.exe -s -D - -o NUL https://YOUR-APP.vercel.app/
```

기대 결과는 각각 `404`, `200`, `X-Content-Type-Options: nosniff`입니다. `/aleph.json`은 빌드가 자동 생성하므로 삭제하지 마세요.

## 6. GitHub와 배포 파일의 메모 문자열 검색

먼저 GitHub에 변경 사항을 Push한 뒤 최신 원격 `main`을 가져옵니다. 검색어를 두 조각으로 나누어 작성하므로 README 자체가 검색 결과를 오염시키지 않습니다.

```powershell
git fetch origin
$terms = @(
  ('실습용 가상 ' + '과제 기록'),
  ('실습용 가상 ' + '포트폴리오 기록'),
  ('실습용 가상 ' + '리추얼 기록'),
  ('실습용 가상 ' + '행정 기록')
)
foreach ($term in $terms) {
  git grep -n -F $term origin/main -- . ':!001_learning_notes.sql'
}
```

SQL 초기화 파일은 메모 본문을 포함하므로 GitHub에 커밋하지 않습니다. 로컬에서 Supabase SQL Editor로 실행한 뒤 안전하게 보관하거나 삭제하세요.

현재 배포의 정적 HTML에서 메모 문자열이 노출되지 않는지 확인합니다.

```powershell
$html = (Invoke-WebRequest -Uri "https://YOUR-APP.vercel.app/" -UseBasicParsing).Content
$terms | ForEach-Object { $html.Contains($_) }
```

위 네 결과는 모두 `False`여야 합니다. 브라우저 개발자 도구의 **Network** 탭에서도 홈페이지가 불러오는 JS/CSS 정적 파일을 확인하고 동일한 문자열이 포함되어 있지 않은지 검색합니다.

검색 결과는 다음 두 항목을 분리해서 기록합니다.

- **정적 파일 검색:** HTML/JS/CSS 및 SQL을 제외한 최신 GitHub 소스에 메모 본문이 없어야 합니다.
- **남은 공개 API 약점:** `/api/notes`는 공개되어 있어 API 응답에서 가상 메모를 읽을 수 있습니다. 이 약점은 정적 파일 검색 결과와 별개입니다.

과거 Git 커밋이나 이전 Vercel 배포에는 1단계의 공개 파일이 남아 있을 수 있습니다. 최신 `main`과 현재 배포에서 문자열이 검색되지 않는다고 해서 과거 커밋·배포의 노출까지 해결되었다고 단정하지 마세요.

## 7. 심판 관련 주의

`npm run bundle`은 학생의 자체 점검·제출물 생성 도구이며 운영 심판의 판정이 아닙니다. 실제 배포, 공개 저장소 커밋, 포털 제출 및 심판 판정은 각 시스템에서 별도로 확인해야 합니다. `aleph.config.json`의 `judgeIssuer`는 운영 설정이므로 변경하지 마세요.
