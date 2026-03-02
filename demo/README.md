# PrismDesign – Frontend

노드 기반 비주얼 스튜디오의 프론트엔드입니다.
그래프 편집, 실시간 렌더링, 웹캠 트래킹 UI를 담당합니다.

## 실행

```bash
npm install
npm run dev   # http://localhost:5173
```

그래프 저장/불러오기 기능을 사용하려면 `server/`도 함께 실행해야 합니다.

## 주요 스크립트

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사
```

## 구조

```
src/
├── studio/
│   ├── network/        # ReactFlow 노드 그래프 에디터
│   ├── panels/         # OpLibrary 등 사이드 패널
│   ├── runtime/        # RAF 평가 루프, 렌더러
│   └── state/          # Zustand 스토어
├── opsTop/             # TOP 오퍼레이터
├── opsChop/            # CHOP 오퍼레이터
└── opsSop/             # SOP 오퍼레이터
```

## 루트 문서

전체 프로젝트 개요는 [../README.md](../README.md)를 참고하세요.
