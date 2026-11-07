import {allocateDepartments} from './layout.js';

// Append a department here to use the next available team bay.
// Optional floor: 0/1/2. Each bay holds up to five people; the last name is the leader.
export const DEPTS = [
  {name:'영업팀',color:'#d68d9d',tasks:['고객과 통화 중','제안서 작성 중','거래처 확인 중','견적서 정리 중'],names:['김도윤','이서준','박지호','최하린','배수현']},
  {name:'인사팀',color:'#b19acb',tasks:['인사 서류 검토 중','면접 일정 조율 중','채용 공고 작성 중','복지 제도 검토 중'],names:['정서연','강지우','윤수빈','임예린','고나은']},
  {name:'회계팀',color:'#c6a17e',tasks:['정산 내역 확인 중','전표 입력 중','예산 검토 중','급여 내역 확인 중'],names:['한시우','오유진','서민준','신채원','남도현']},
  {name:'개발팀',color:'#8fa7cb',tasks:['코딩에 집중 중','코드 리뷰 중','버그 수정 중','테스트 실행 중'],names:['권준호','황은우','안소윤','송태오','백시온']},
  {name:'기획팀',color:'#c292b3',tasks:['기획서 작성 중','사용자 흐름 설계 중','리서치 정리 중','일정 조율 중'],names:['류다은','홍이안','전지안','문하준','조해린']},
];
DEPTS.push({name:'디자인팀',color:'#8aa99b',tasks:['시안 제작 중','디자인 리뷰 중','컬러 보드 검토 중','프로토타입 제작 중'],names:['유하늘','차예준','문서아','신도겸','진다인']},{name:'마케팅팀',color:'#d5aa68',tasks:['캠페인 기획 중','성과 분석 중','출시 준비 중','콘텐츠 제작 중'],names:['노지후','양서우','주연우','민하윤','장우빈']});
DEPTS.push({name:'경영지원팀',color:'#83aaa7',tasks:['회의·면접·외부 미팅 회의실 배정 확인 중','비품 재고 확인 및 발주 중','시설 점검·수리 요청 접수 중','우편물·공용 비품 관리 중'],names:['김지원','오지훈','이수아','박현우','최유나']});
export const DEPARTMENT_LAYOUT=allocateDepartments(DEPTS);
export const DEPT_FLOORS=DEPARTMENT_LAYOUT.map(bay=>bay.floor);
