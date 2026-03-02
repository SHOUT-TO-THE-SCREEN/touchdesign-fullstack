# PrismDesign Server

그래프 저장/불러오기를 담당하는 Express 백엔드입니다.
그래프 데이터를 `graphs/` 폴더에 JSON 파일로 로컬 저장합니다.

## 실행

```bash
# 의존성 설치
npm install

# 개발 (파일 변경 시 자동 재시작)
npm run dev

# 일반 실행
npm start
```

서버가 뜨면 `http://localhost:3001` 에서 응답합니다.

## 기술 스택

- **Runtime**: Node.js + [tsx](https://github.com/privatenumber/tsx) (TypeScript 직접 실행, 빌드 불필요)
- **Framework**: Express
- **Port**: `3001` (하드코딩)

## API

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/graphs` | 저장된 그래프 목록 조회 |
| `GET` | `/api/graphs/:name` | 그래프 불러오기 |
| `POST` | `/api/graphs/:name` | 그래프 저장 (없으면 생성, 있으면 덮어쓰기) |
| `PATCH` | `/api/graphs/:name/rename` | 그래프 이름 변경 |
| `DELETE` | `/api/graphs/:name` | 그래프 삭제 |

### 그래프 목록 응답 예시

```json
[
  {
    "name": "my-graph",
    "thumbnail": "data:image/png;base64,...",
    "savedAt": "2026-02-28T10:21:00.000Z",
    "nodeCount": 5,
    "edgeCount": 3,
    "nodeKinds": ["noise", "transform", "out"]
  }
]
```

### 그래프 저장 요청 예시

```bash
POST /api/graphs/my-graph
Content-Type: application/json

{ "nodes": [...], "edges": [...], "thumbnail": "data:image/png;base64,..." }
```

### 이름 변경 요청 예시

```bash
PATCH /api/graphs/my-graph/rename
Content-Type: application/json

{ "newName": "new-name" }
```

## 디렉토리 구조

```
server/
├── index.ts        # 서버 엔트리포인트
├── graphs/         # 저장된 그래프 JSON (git 미추적)
├── package.json
└── README.md
```

## 프론트엔드 연동

프론트엔드(`demo/`)는 `http://localhost:3001`로 API를 호출합니다.
개발 시 프론트와 서버를 각각 별도 터미널에서 실행하세요.

```bash
# 터미널 1 – 프론트엔드
cd demo && npm run dev

# 터미널 2 – 서버
cd server && npm run dev
```
