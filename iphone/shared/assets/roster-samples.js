// 가상 XLSX 원본과 브라우저 미리보기 데이터만 포함합니다.
const DemoRoster = { samples: [
  {
    "id": "valid",
    "name": "demo-roster-valid.xlsx",
    "path": "assets/demo-roster-valid.xlsx",
    "hash": "da3c79e147cf342d706de46bf5563196ccc6870de3887f28de4f2f896afc7017",
    "downloadLabel": "정상 예시 받기",
    "previewLabel": "정상 예시 바로 체험",
    "rows": [
      {
        "key": "demo-learner-01",
        "name": "이새봄",
        "grade": "중2",
        "classes": [
          "중2 심화반"
        ],
        "age": "만 14세 미만",
        "consent": "확인 완료",
        "phone": "010-0000-0001",
        "email": "guardian-demo1@example.com",
        "line": 2,
        "guardianLine": 2
      },
      {
        "key": "demo-learner-02",
        "name": "이한결",
        "grade": "중1",
        "classes": [
          "중1 개념반"
        ],
        "age": "만 14세 미만",
        "consent": "미확인",
        "phone": "010-0000-0001",
        "email": "guardian-demo1@example.com",
        "line": 3,
        "guardianLine": 3
      },
      {
        "key": "demo-learner-03",
        "name": "최누리",
        "grade": "고1",
        "classes": [
          "고1 내신반"
        ],
        "age": "만 14세 이상",
        "consent": "해당 없음",
        "phone": "010-0000-0002",
        "line": 4,
        "guardianLine": 4
      }
    ]
  },
  {
    "id": "errors",
    "name": "demo-roster-errors.xlsx",
    "path": "assets/demo-roster-errors.xlsx",
    "hash": "049f4e9d4a0b8686956583a1ff707eb374ae2b4557b9c98330c5e881818b00d3",
    "downloadLabel": "오류 예시 받기",
    "previewLabel": "오류 예시 바로 체험",
    "rows": [
      {
        "key": "demo-learner-01",
        "name": "이새봄",
        "grade": "중2",
        "classes": [
          "중2 심화반"
        ],
        "age": "만 14세 미만",
        "consent": "확인 완료",
        "phone": "010-0000-0001",
        "email": "guardian-demo1@example.com",
        "line": 2,
        "guardianLine": 2
      },
      {
        "key": "demo-learner-04",
        "name": "윤하늘",
        "grade": "중2",
        "classes": [
          "중2 응용반"
        ],
        "age": "만 14세 미만",
        "consent": "미확인",
        "errors": [
          "학생 명부 3행 · ‘중2 응용반’ 반을 찾을 수 없습니다."
        ],
        "line": 3
      },
      {
        "key": "demo-learner-05",
        "name": "정이든",
        "grade": "고1",
        "classes": [
          "고1 내신반"
        ],
        "age": "만 14세 이상",
        "consent": "해당 없음",
        "email": "guardian-demo2@example.com",
        "errors": [
          "보호자 연결 3행 · 보호자 휴대폰 번호를 입력하세요."
        ],
        "line": 4,
        "guardianLine": 3
      }
    ]
  }
] };
