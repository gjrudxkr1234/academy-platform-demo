// 가상 XLSX 원본과 브라우저 미리보기 데이터만 포함합니다.
const DemoRoster = { samples: [
  {
    "id": "valid",
    "name": "demo-roster-valid.xlsx",
    "path": "assets/demo-roster-valid.xlsx",
    "hash": "ba9ae51b3b9b7da49369a73c969653096b671d0d5b6a626629a1eb245094a424",
    "downloadLabel": "정상 예시 받기",
    "previewLabel": "정상 예시 바로 체험",
    "rows": [
      {
        "key": "demo-learner-01",
        "age": "만 14세 미만",
        "consent": "확인 완료",
        "guardian": "guardian-demo1@example.com",
        "line": 2,
        "guardianLine": 2
      },
      {
        "key": "demo-learner-02",
        "age": "만 14세 미만",
        "consent": "미확인",
        "guardian": "guardian-demo1@example.com",
        "line": 3,
        "guardianLine": 3
      },
      {
        "key": "demo-learner-03",
        "age": "만 14세 이상",
        "consent": "해당 없음",
        "line": 4
      }
    ]
  },
  {
    "id": "errors",
    "name": "demo-roster-errors.xlsx",
    "path": "assets/demo-roster-errors.xlsx",
    "hash": "62a4602cd4222748f4caa9f9e69ac9e3cc88725a2290c447b2481f9efcacf1f3",
    "downloadLabel": "오류 예시 받기",
    "previewLabel": "오류 예시 바로 체험",
    "rows": [
      {
        "key": "demo-learner-01",
        "age": "만 14세 미만",
        "consent": "확인 완료",
        "guardian": "guardian-demo1@example.com",
        "line": 2,
        "guardianLine": 2
      },
      {
        "key": "demo-learner-04",
        "age": "만 14세 미만",
        "consent": "확인 완료",
        "errors": [
          "학생 명부 3행 · 동의 확인일, 동의서 버전, 보관 참조번호가 필요합니다."
        ],
        "line": 3
      },
      {
        "key": "demo-learner-05",
        "age": "만 14세 이상",
        "consent": "해당 없음",
        "guardian": "guardian-demo2",
        "errors": [
          "보호자 연결 3행 · 이메일 형식을 확인하세요.",
          "보호자 연결 3행 · 연결을 확인한 뒤 ‘확인 완료’를 입력하세요."
        ],
        "line": 4,
        "guardianLine": 3
      }
    ]
  }
] };
