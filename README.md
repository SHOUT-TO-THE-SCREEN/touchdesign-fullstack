# PrismDesign

브라우저에서 동작하는 노드 기반 비주얼 프로그래밍 스튜디오입니다.
TouchDesigner에서 영감을 받아, 2D 텍스처(TOP) · 채널 데이터(CHOP) · 3D 지오메트리(SOP) 오퍼레이터를 노드 그래프로 연결해 실시간 비주얼을 만들 수 있습니다.

## 구조

```
touchdesign-fullstack/
├── demo/     # 프론트엔드 (React + Vite)
└── server/   # 백엔드 (Express) — 그래프 저장/불러오기
```


## 빠른 시작

두 터미널에서 각각 실행합니다.

```bash
# 터미널 1 – 프론트엔드 (http://localhost:5173)
cd demo
npm install
npm run dev

# 터미널 2 – 서버 (http://localhost:3001)
cd server
npm install
npm run dev
```

## 오퍼레이터 종류

| 카테고리 | 설명 | 주요 노드 |
|----------|------|-----------|
| **TOP** | 2D 텍스처 생성·합성 | Noise, Text, Transform, Composite… |
| **CHOP** | 시계열 채널 데이터 | LFO, Noise, FFT, Hands (웹캠 트래킹) |
| **SOP** | 3D 서피스·지오메트리 | Sphere, Noise (버텍스 변위) |

- **CHOP → SOP/TOP 바인딩**: CHOP 출력 채널로 SOP·TOP 파라미터를 실시간 구동
- **Hands CHOP**: MediaPipe를 통해 웹캠으로 손 위치·핀치 제스처를 8채널로 추적

## 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| UI 프레임워크 | React 19 + TypeScript |
| 번들러 | Vite |
| 노드 그래프 | ReactFlow |
| 상태 관리 | Zustand |
| 렌더링 | Canvas 2D API (WebGL 미사용) |
| 손 트래킹 | MediaPipe Tasks Vision |
| 백엔드 | Express + tsx (빌드 없이 TS 실행) |
| 그래프 저장 | 로컬 JSON 파일 (`server/graphs/`) |

## 주요 기능

- **노드 그래프 편집** — 더블클릭으로 오퍼레이터 생성, 드래그로 연결
- **실시간 프리뷰** — 각 노드에 RAF 기반 라이브 프리뷰
- **그래프 저장/불러오기** — 서버에 이름 붙여 저장, 썸네일 포함
- **웹캠 인터랙션** — Hands CHOP으로 손 제스처를 비주얼에 연동

## 상세 문서

- [server/README.md](server/README.md) — 서버 API 및 실행 방법

## 디자인

- [Figma — TouchDesign](https://www.figma.com/design/yO1oSzYQypry0ft3tmGKQl/TouchDesign?node-id=0-1&t=VN4ukxP2Jt4NNKwz-1)
