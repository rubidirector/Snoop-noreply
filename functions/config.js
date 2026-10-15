// 사이트 설정 파일. 보통은 이 파일만 고치면 돼요.
// 주의: 여기에 Gemini API 키를 넣지 마세요. 이 파일은 누구나 볼 수 있어요.
window.PHONE_CONFIG = {
  // 답장할 수 없는 버전: 인물들이 먼저 보내는 메시지는 오지만, 폰 주인으로 답장은 못 해요(메시지·톡 입력칸이 잠겨요).
  noReply: true,

  // ── AI (Gemini) ─────────────────────────────────────────
  // 이 사이트는 서버 코드가 없는 정적 사이트예요. 방문자가 설정에서 각자 Gemini 키를 넣어서 써요. 비워 두세요.
  // (보안 헤더의 허용 목록에 없는 주소로는 연결되지 않아요.)
  aiProxy: '',
  allowUserKey: true,

  // 무료 등급이 있는 글 모델: gemini-3.8-flash, gemini-3.5-flash-lite
  // 모델 이름은 Google이 종종 바꿔요. 안 되면 https://ai.google.dev/gemini-api/docs/models 에서 확인하세요.
  textModel: 'gemini-3.8-flash',
  textModels: ['gemini-3.8-flash', 'gemini-3.5-flash-lite'],

  // 사진을 실제 이미지로 만들 때 쓰는 모델 (무료 등급 없음, 결제가 연결된 키 필요)
  imageModel: 'gemini-3.1-flash-image',
  allowImages: false, // aiProxy를 쓸 때 방문자에게 이미지 생성을 허용할지

  // ── Google 로그인 · 계정 저장 · 공유 링크 (Firebase) ────────
  // 비워 두면(null) 만든 폰이 각자 기기에만 저장되고, 공유는 파일 내보내기로만 돼요.
  // Firebase 콘솔 › 프로젝트 설정 › 내 앱(웹)에 보이는 firebaseConfig 값을 그대로 붙여 넣으세요.
  // 이 값들은 공개돼도 괜찮아요. 데이터 보호는 firestore.rules가 맡아요.
  firebase: {
    apiKey: 'AIzaSyC37_0eeVA0PyiXE_mr37XI0dsvX-DAkfk',
    authDomain: 'snoopnoreply-38223.firebaseapp.com',
    projectId: 'snoopnoreply-38223',
    storageBucket: 'snoopnoreply-38223.firebasestorage.app',
    messagingSenderId: '776823080552',
    appId: '1:776823080552:web:7f06b4ea1fd7060cd05ddd'
  },
  // firebase: {
  //   apiKey: 'AIza...',
  //   authDomain: '내프로젝트.firebaseapp.com',
  //   projectId: '내프로젝트',
  //   appId: '1:1234567890:web:abcdef'
  // },
  firebaseVersion: '10.14.1',

  // ── 예시 폰 ───────────────────────────────────────────
  // '+ 예시로 시작'과 처음 방문했을 때 보이는 예시를, 이 아이디로 배포된 폰에서 가져와요.
  // 그 폰을 고쳐서 다시 배포하면 예시도 바로 바뀌어요. 비워 두면('') 기본 예시(example-data.js)를 써요.
  examplePlay: '',
  // 예시에서 빼고 싶은 인물 이름(저장된 이름 그대로). 채팅방·단톡 멤버와 그 사람의 말·친구·연락처·통화·시스템 인물에서 모두 빠져요.
  exampleRemove: ['이수진 대리'],
  // 빠진 인물을 언급하던 문장을 자연스럽게 바꿔 쓰는 목록 ['원래 문장', '바꿀 문장']. 여기에 없는 언급은 '누군가'로 바뀌어요.
  exampleReplace: [
    ['하지만 최근 눈치 빠른 이수진 대리가 두 사람 사이의', '하지만 최근 회사 안에서 누군가 두 사람 사이의'],
    ['복도 끝에 이수진 대리 같았는데 확실하진 않아요', '복도 끝이라 누군지는 못 봤어요'],
    ['탕비실에서 나오다가 수진이한테 들킨 것 같아', '탕비실에서 나오다가 누구한테 들킨 것 같아'],
    ['(수진이 조심)', '(회사 사람들 조심)'],
    [' 수진은 거의 확신하고 있지만 증거를 잡으려고 떠보는 중이다.', ' 회사 안에 두 사람을 의심하는 눈길이 생기기 시작했다.'],
    [' 수진은 직접적으로 묻지 않고 돌려서 떠본다.', '']
  ],

  // ── 역할 ──────────────────────────────────────────────
  // 총관리자 이메일. 설정에 '총관리자' 칸이 생겨 모든 배포를 관리할 수 있어요.
  // firestore.rules의 isSuper()에 적힌 이메일과 똑같이 맞춰야 실제로 권한이 생겨요.
  superAdmins: ['jyuel1411@gmail.com'],
  // 플레이 링크의 기본 주소. 비워 두면 지금 사이트 주소를 써요. 예) 'https://rubidirector.github.io/Snoop/'
  playBase: ''
};
