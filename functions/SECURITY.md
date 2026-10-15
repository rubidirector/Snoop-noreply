# Snoop 보안 안내서

무료 범위(Cloudflare Pages 무료 + Firebase Spark 무료 + 각자 Gemini 무료 키) 안에서 맞춘 보안 설정과, 올린 뒤 직접 해야 할 일을 정리했어요.
기본 버전(Snoop)과 답장할 수 없는 버전(Snoop-view)에 똑같이 적용돼요.

---

## 1. 이번에 바뀐 것

| 항목 | 내용 |
|---|---|
| 호스팅 | GitHub Pages → **Cloudflare Pages**(무료). GitHub Pages는 보안 헤더를 붙일 수 없어서 옮겨요. |
| 서버 코드 | `server.js`, `api/` 폴더를 지웠어요. 서버 없는 정적 사이트예요. |
| 보안 헤더 | `_headers` 파일 추가. HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP. 허용한 외부 주소마다 이유를 주석으로 적었어요. |
| 스크립트 | `index.html`에 인라인 `<script>`나 `onclick` 같은 인라인 이벤트가 없어요. CSP에서 스크립트의 `unsafe-inline`, `unsafe-eval`을 막았어요. |
| 외부 라이브러리 | Firebase SDK 하나뿐이고 버전 **10.14.1**로 고정했어요. CSP도 그 버전 폴더만 허용해요. |
| 사진 데이터 검증 | 배포된 폰이나 가져온 파일의 사진이 진짜 이미지(`data:image/...;base64,...`)일 때만 써요. 다른 관리자가 사진 칸에 HTML이나 스크립트를 넣어도 화면에 들어가지 않아요. |
| 이메일 비공개 | 배포된 폰(누구나 읽을 수 있는 문서)에 관리자 이메일을 더는 저장하지 않아요. 예전에 배포한 폰은 다시 배포하면 이메일이 지워져요. |
| Firestore 규칙 | 기본 전체 차단, 본인 문서만 쓰기, 문서마다 저장할 수 있는 칸과 크기 제한, 총관리자는 "목록 노출"만 바꿀 수 있게 줄였어요. |

### 코드 안전 규칙 점검 결과
- `eval`, `new Function`, `document.write`: 쓰지 않아요.
- 사용자가 넣은 글(이름, 대화, 메모 등)은 모두 `esc()`로 바꾼 뒤 화면에 넣거나 `textContent`로 넣어요. 숫자 칸(배터리, 통화 횟수, 확률)은 저장할 때 숫자로 바꿔요. 색은 `#rrggbb` 형식만 받아요.
- 사진은 위처럼 이미지 데이터만 받아요.

---

## 2. 공개돼도 되는 값과 비밀 값

| 값 | 어디에 있나 | 공개돼도 되나 |
|---|---|---|
| Firebase 웹 설정(`apiKey`, `authDomain`, `projectId` 등) | `config.js` | **괜찮아요.** 누구나 볼 수 있게 만든 값이에요. 데이터는 Firestore 규칙이 지키고, 아래 4단계에서 키를 내 주소에서만 쓰게 묶어요. |
| 총관리자 이메일 | `config.js`, `firestore.rules` | 괜찮지만 원하지 않으면 알려 주세요. 권한은 규칙이 정하고, `config.js` 값은 화면 표시용이에요. |
| 각자의 **Gemini API 키** | 각자의 브라우저 저장소, 로그인했다면 본인 Firestore 문서(`users/내 uid`) | **비밀이에요.** 코드에는 없어요. 본인만 읽을 수 있고 총관리자도 못 봐요. |
| Firebase 로그인 토큰 | 브라우저(Firebase SDK가 관리) | 비밀이에요. 코드에 넣지 않아요. |

비밀 키나 토큰을 `config.js`나 다른 파일에 넣지 마세요. 이 파일들은 누구나 볼 수 있어요.

---

## 3. 외부로 데이터를 보내는 곳

| 보내는 곳 | 언제 | 무엇을 | 목적 |
|---|---|---|---|
| `generativelanguage.googleapis.com` (Gemini) | AI 생성, 답장, 인물이 먼저 연락할 때, 연결 확인 | 이야기 설정, 최근 대화, 지금 폰 시각, 각자의 API 키(요청 헤더) | AI 글 생성 |
| `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`, `www.googleapis.com`, `apis.google.com`, `snoop-97d45.firebaseapp.com` | Google 로그인할 때, 로그인 유지 | Google 계정 로그인 정보(Google이 처리) | 관리자 로그인 |
| `firestore.googleapis.com` | 로그인한 관리자가 폰을 저장·배포할 때, 키를 저장할 때, 플레이 링크를 열 때 | 만든 폰 데이터, 사진, 관리자 이름, 본인 Gemini 키(본인 문서) | 계정 저장, 배포 |
| `fonts.googleapis.com`, `fonts.gstatic.com` | 페이지를 열 때 | 일반 웹 요청(IP 등) | 글꼴 |
| `www.gstatic.com/firebasejs/10.14.1/` | 페이지를 열 때 | 일반 웹 요청 | Firebase SDK 파일 |

로그인하지 않고 쓰는 기능(플레이 진행 상황, 소리·테마 설정, 시계)은 브라우저 저장소(localStorage, IndexedDB)에만 저장하고 밖으로 보내지 않아요.
단, AI 답장과 먼저 연락하기는 기능 특성상 대화 내용을 Gemini로 보내요.

---

## 4. 올린 뒤 내가 할 일 (단계별)

> 아래 `snoop`, `snoop-view`는 예시 이름이에요. 실제로 정한 이름으로 바꿔 읽어 주세요.
> Cloudflare 주소는 `https://snoop.pages.dev`처럼 만들어져요.

### 1단계. GitHub 저장소에 파일 올리기
1. https://github.com 에 로그인하고 오른쪽 위 **+** › **New repository**를 눌러요. (기존 `Snoop` 저장소를 그대로 써도 돼요)
2. 저장소 이름을 정하고 **Public** 또는 **Private** 중 하나를 고른 뒤 **Create repository**를 눌러요. Cloudflare는 Private 저장소도 연결할 수 있어요.
3. 저장소 화면에서 **Add file** › **Upload files**를 누르고, zip을 푼 폴더 안의 파일과 폴더를 모두 끌어다 놓아요. `_headers`, `stories` 폴더, `firestore.rules`도 포함이에요.
4. 아래 **Commit changes**를 눌러요.
5. 기존 저장소에 덮어쓸 때는 예전 `server.js`와 `api` 폴더를 지워 주세요. 파일을 누르고 오른쪽 **⋯** › **Delete file** › **Commit changes**.

### 2단계. Cloudflare Pages 연결과 배포
1. https://dash.cloudflare.com 에 가입·로그인해요(무료).
2. 왼쪽 메뉴 **Workers & Pages**(또는 **Compute (Workers)**) › **Create** › **Pages** 탭 › **Connect to Git**을 눌러요. Workers가 아니라 **Pages**를 골라야 `_headers`가 적용돼요.
3. GitHub 계정을 연결하고 1단계의 저장소를 골라 **Begin setup**.
4. 설정:
   - Project name: `snoop` (이게 주소 `snoop.pages.dev`가 돼요)
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: 비워 두기
   - Build output directory: `/` (비워 두거나 `/`)
5. **Save and Deploy**를 누르고 1~2분 기다리면 `https://snoop.pages.dev`가 열려요.
6. 답장할 수 없는 버전도 같은 방법으로 다른 저장소·다른 이름(`snoop-view`)으로 한 번 더 해요.
7. 앞으로 GitHub에 파일을 올리면 Cloudflare가 알아서 다시 배포해요.

예전 GitHub Pages 주소로 공유한 링크가 있다면 `github-pages-redirect` 폴더의 파일을 옛 저장소에 올려서 새 주소로 자동 이동시킬 수 있어요(`redirect.js`의 `NEW` 값을 새 주소로 바꾸기).

### 3단계. Firebase 규칙 게시와 확인
1. https://console.firebase.google.com › `snoop-97d45` 프로젝트 › 왼쪽 **Firestore Database** › 위쪽 **규칙(Rules)** 탭.
2. 내용을 모두 지우고 `firestore.rules` 파일 내용을 그대로 붙여 넣은 뒤 **게시(Publish)**.
3. 확인: 같은 화면의 **규칙 플레이그라운드(Rules Playground)**를 열고
   - 시뮬레이션 유형 **get**, 위치 `plays/test`, 인증 끔 › **실행** → **허용**이 나와야 해요(플레이 링크용).
   - 위치 `users/abc`, 인증 끔 › **실행** → **거부**가 나와야 해요.
   - 위치 `stories/abc`, 유형 **create**, 인증 켬(Google), 데이터 없이 › **실행** → **거부**가 나와야 해요.
4. 마지막으로 사이트에서 로그인 › 폰 저장 › 배포 › 플레이 링크 열기를 한 번씩 해 보세요. 저장이 안 되면 규칙 화면 아래 오류 내용을 알려 주세요.

### 4단계. 로그인 허용 주소와 API 키 주소 제한
**Firebase 승인 도메인**
1. Firebase 콘솔 › **Authentication** › 위쪽 **설정(Settings)** 탭 › **승인된 도메인(Authorized domains)** › **도메인 추가**.
2. `snoop.pages.dev`, `snoop-view.pages.dev`를 추가해요.
3. GitHub Pages를 더 쓰지 않으면 `rubidirector.github.io`는 지워요. `localhost`도 개발하지 않으면 지워도 돼요.

**Google OAuth 허용 주소**
1. https://console.cloud.google.com › 위쪽에서 프로젝트 `snoop-97d45` 선택 › **API 및 서비스** › **사용자 인증 정보(Credentials)**.
2. **OAuth 2.0 클라이언트 ID**의 **Web client (auto created by Google Service)**를 눌러요.
3. **승인된 JavaScript 원본**에 `https://snoop.pages.dev`, `https://snoop-view.pages.dev`를 추가해요.
4. **승인된 리디렉션 URI**에 `https://snoop-97d45.firebaseapp.com/__/auth/handler`가 있는지 확인해요(없으면 추가). **저장**.

**Firebase 웹 API 키를 내 주소에서만 쓰게 묶기**
1. 같은 **사용자 인증 정보** 화면 › **API 키** › **Browser key (auto created by Firebase)**를 눌러요.
2. **애플리케이션 제한사항** › **웹사이트** › 항목 추가:
   - `https://snoop.pages.dev/*`
   - `https://snoop-view.pages.dev/*`
   - `https://snoop-97d45.firebaseapp.com/*`
3. **API 제한사항** › **키 제한** › 다음만 체크: **Identity Toolkit API**, **Token Service API**, **Cloud Firestore API**. **저장**.
4. 저장 후 5분쯤 지나 로그인과 저장이 되는지 확인해요. 안 되면 API 제한사항을 잠시 "키 제한 안 함"으로 돌리고 알려 주세요.

**각 사용자의 Gemini 키(권장 안내)**
사용자에게 이렇게 안내하면 키가 새어도 다른 곳에서 못 써요: Google AI Studio의 키 › **Google Cloud에서 보기** › **애플리케이션 제한사항: 웹사이트**에 이 사이트 주소 추가, **API 제한사항: Generative Language API**만.

### 5단계. 보안 점검 사이트로 확인 (목표 A+)
1. https://securityheaders.com › 입력칸에 `https://snoop.pages.dev` › **Scan**. 결과 등급과 빨간 항목을 확인해요.
2. https://developer.mozilla.org/en-US/observatory › 입력칸에 `snoop.pages.dev` › **Scan**. 점수와 실패 항목을 확인해요.
3. `.dev` 주소는 브라우저에 HTTPS 전용으로 미리 등록돼 있어서(HSTS preload) 따로 등록할 필요가 없어요.
4. 두 곳 중 A+가 아니면 결과 화면을 캡처해서 보여 주세요. 흔한 경고는 CSP의 `style-src 'unsafe-inline'`이에요(폰 화면이 style 속성으로 그려져서 필요해요. 스크립트 실행은 막혀 있어요).

---

## 5. 이 점검이 보장하는 것과 못 하는 것

**보장하는 것**
- 다른 사이트가 Snoop을 몰래 안에 넣어 클릭을 유도하는 공격(클릭재킹)을 막아요.
- 화면에 다른 사람이 넣은 글·사진이 들어가도 스크립트가 실행되지 않게 두 겹(이스케이프 + CSP)으로 막아요.
- 허용 목록에 없는 주소로는 스크립트를 불러오거나 데이터를 보낼 수 없어요.
- 항상 HTTPS로만 접속돼요.
- 남의 폰·남의 키를 읽거나 고칠 수 없고, 정해진 칸과 크기 이상은 저장되지 않아요.

**보장하지 못하는 것**
- 사용자 기기 자체가 해킹됐거나, 브라우저 확장 프로그램이 화면을 읽는 경우.
- Google 계정이 털린 경우(그 계정의 폰과 키는 보호되지 않아요). 2단계 인증을 권해요.
- 관리자가 배포한 폰 내용 자체(🔒 시스템 탭 포함)는 플레이 링크가 있는 누구나 개발자 도구로 볼 수 있어요. 공개되면 안 되는 내용은 넣지 마세요.
- 무료 등급 한도 초과로 생기는 서비스 중단(Firestore 읽기/쓰기, Gemini 사용량), 악의적인 대량 요청(DDoS)은 Cloudflare 기본 보호 이상으로 막지 못해요.
- Firebase SDK는 외부(gstatic, 버전 고정)에서 불러와요. Google이 그 파일을 바꾸면 영향을 받을 수 있어요(무결성 해시 SRI는 이 버전 파일을 받아 계산해야 해서 이번엔 넣지 못했어요).
- 점검 사이트 등급은 "헤더가 잘 붙었는지"만 봐요. 코드 전체의 안전을 증명하지는 않아요.

---

## 6. 개인정보 안내 문구 초안

> 앱 안 설정 화면이나 사이트 아래쪽에 붙일 수 있는 초안이에요. `[ ]` 부분을 채워 주세요. 법률 검토가 필요하면 전문가에게 확인받으세요.

**Snoop 개인정보 안내**

**수집하는 정보**
- 관리자(Google 로그인 사용자): Google 계정의 이름, 이메일, 프로필 사진, 계정 고유번호. 직접 만든 폰의 내용과 사진. 직접 입력한 Gemini API 키.
- 플레이 링크로 보는 사용자: 로그인 정보를 받지 않아요. 진행 상황과 직접 입력한 Gemini API 키는 사용자의 브라우저에만 저장돼요.

**보관 위치**
- 브라우저 저장소(localStorage, IndexedDB): 진행 상황, 설정, API 키.
- Google Firebase(Firestore): 관리자가 저장·배포한 폰, 관리자 이름, 관리자 본인의 API 키(본인만 읽을 수 있음).
- 배포한 폰의 내용과 만든 사람 이름은 플레이 링크가 있는 누구나 볼 수 있어요.

**제3자 제공 및 처리 위탁**
- Google(Firebase 로그인·데이터 저장, Gemini AI): AI 기능을 쓰면 이야기 설정과 대화 내용이 각자의 API 키로 Google Gemini에 보내져요. 무료 등급에서는 Google이 서비스 개선에 쓸 수 있어요.
- Cloudflare(사이트 호스팅): 접속 기록(IP 주소 등)이 Cloudflare에 남을 수 있어요.
- 그 밖의 곳에 개인정보를 팔거나 넘기지 않아요.

**삭제 방법**
- 관리자: 설정 › 데이터 · 계정 삭제 › **계정 탈퇴**를 누르면 만든 폰, 배포한 폰, 저장된 API 키, 로그인 계정이 함께 지워져요.
- 이 기기의 기록만 지우기: 설정 › **이 기기의 데이터 지우기**.
- 그 밖의 삭제·문의: [문의 이메일 주소]

**시행일**: [2026년 ○월 ○일]
