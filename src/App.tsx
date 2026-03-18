import { useState, useRef, useEffect } from "react";
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';

// ==========================================
// 📂 1. 컬러 및 테마 설정
// ==========================================
const THEME_COLORS = {
  orange: { bg: "bg-orange-50", inputBg: "bg-orange-50", textMain: "text-orange-500", textSub: "text-orange-400", btn: "bg-orange-400 hover:bg-orange-500", accentBg: "bg-orange-100", accentText: "text-orange-600", border: "border-orange-100", dot: "bg-orange-300", ring: "focus:ring-orange-200" },
  yellow: { bg: "bg-yellow-50", inputBg: "bg-yellow-50", textMain: "text-yellow-600", textSub: "text-yellow-500", btn: "bg-yellow-400 hover:bg-yellow-500", accentBg: "bg-yellow-100", accentText: "text-yellow-700", border: "border-yellow-100", dot: "bg-yellow-300", ring: "focus:ring-yellow-200" },
  rose: { bg: "bg-rose-50", inputBg: "bg-rose-50", textMain: "text-rose-500", textSub: "text-rose-400", btn: "bg-rose-400 hover:bg-rose-500", accentBg: "bg-rose-100", accentText: "text-rose-600", border: "border-rose-100", dot: "bg-rose-300", ring: "focus:ring-rose-200" },
  red: { bg: "bg-red-50", inputBg: "bg-red-50", textMain: "text-red-500", textSub: "text-red-400", btn: "bg-red-400 hover:bg-red-500", accentBg: "bg-red-100", accentText: "text-red-600", border: "border-red-100", dot: "bg-red-300", ring: "focus:ring-red-200" },
  emerald: { bg: "bg-emerald-50", inputBg: "bg-emerald-50", textMain: "text-emerald-600", textSub: "text-emerald-500", btn: "bg-emerald-500 hover:bg-emerald-600", accentBg: "bg-emerald-100", accentText: "text-emerald-700", border: "border-emerald-100", dot: "bg-emerald-300", ring: "focus:ring-emerald-200" },
  pink: { bg: "bg-pink-50", inputBg: "bg-pink-50", textMain: "text-pink-500", textSub: "text-pink-400", btn: "bg-pink-400 hover:bg-pink-500", accentBg: "bg-pink-100", accentText: "text-pink-600", border: "border-pink-100", dot: "bg-pink-300", ring: "focus:ring-pink-200" },
  purple: { bg: "bg-purple-50", inputBg: "bg-purple-50", textMain: "text-purple-500", textSub: "text-purple-400", btn: "bg-purple-400 hover:bg-purple-500", accentBg: "bg-purple-100", accentText: "text-purple-600", border: "border-purple-100", dot: "bg-purple-300", ring: "focus:ring-purple-200" },
  lime: { bg: "bg-lime-50", inputBg: "bg-lime-50", textMain: "text-lime-600", textSub: "text-lime-500", btn: "bg-lime-500 hover:bg-lime-600", accentBg: "bg-lime-100", accentText: "text-lime-700", border: "border-lime-100", dot: "bg-lime-300", ring: "focus:ring-lime-200" },
  indigo: { bg: "bg-indigo-50", inputBg: "bg-indigo-50", textMain: "text-indigo-500", textSub: "text-indigo-400", btn: "bg-indigo-400 hover:bg-indigo-500", accentBg: "bg-indigo-100", accentText: "text-indigo-600", border: "border-indigo-100", dot: "bg-indigo-300", ring: "focus:ring-indigo-200" },
};

const MONTHLY_THEMES = [
  { month: 1, name: "귤", emoji: "🍊", eng: "JANUARY", colors: THEME_COLORS.orange },
  { month: 2, name: "레몬", emoji: "🍋", eng: "FEBRUARY", colors: THEME_COLORS.yellow },
  { month: 3, name: "딸기", emoji: "🍓", eng: "MARCH", colors: THEME_COLORS.rose },
  { month: 4, name: "오렌지", emoji: "🍊", eng: "APRIL", colors: THEME_COLORS.orange },
  { month: 5, name: "체리", emoji: "🍒", eng: "MAY", colors: THEME_COLORS.red },
  { month: 6, name: "수박", emoji: "🍉", eng: "JUNE", colors: THEME_COLORS.emerald },
  { month: 7, name: "복숭아", emoji: "🍑", eng: "JULY", colors: THEME_COLORS.pink },
  { month: 8, name: "포도", emoji: "🍇", eng: "AUGUST", colors: THEME_COLORS.purple },
  { month: 9, name: "배", emoji: "🍐", eng: "SEPTEMBER", colors: THEME_COLORS.lime },
  { month: 10, name: "사과", emoji: "🍎", eng: "OCTOBER", colors: THEME_COLORS.red },
  { month: 11, name: "블루베리", emoji: "🫐", eng: "NOVEMBER", colors: THEME_COLORS.indigo },
  { month: 12, name: "파인애플", emoji: "🍍", eng: "DECEMBER", colors: THEME_COLORS.yellow },
];

const MONTHLY_QUESTIONS: string[] = [
  "오늘 하루를 한 단어로 표현한다면?", "나를 웃게 만든 아주 사소한 순간은?", "지금 당장 먹고 싶은 달콤한 디저트는?", "내일의 나에게 해주고 싶은 말은?", "오늘 새롭게 알게 된 나의 모습은?", "최근에 가장 고마웠던 사람은 누구인가요?", "나만 아는 나의 귀여운 점 하나는?", "오늘 하루 가장 집중했던 순간은 언제인가요?", "가장 좋아하는 계절과 그 이유는?", "10년 후의 나에게 하고 싶은 말이 있다면?", "스트레스를 받을 때 나만의 해소법은?", "오늘 가장 아쉬웠던 일은 무엇인가요?", "최근 나를 설레게 한 단어나 문장이 있나요?", "스스로 칭찬해주고 싶은 오늘의 행동은?", "마음이 편안해지는 나만의 아지트는 어디인가요?", "만약 오늘 하루를 다시 살 수 있다면 바꾸고 싶은 것은?", "어린 시절 가장 좋아했던 장난감이나 놀이는?", "나를 가장 나답게 만드는 취미는 무엇인가요?", "최근에 들은 노래 중 가장 맘에 든 곡은?", "아침에 일어나서 가장 먼저 한 생각은?", "오늘 누군가에게 베푼 작은 친절이 있나요?", "잠들기 전, 꼭 하는 나만의 의식이 있다면?", "이번 주말에 꼭 하고 싶은 일 한 가지는?", "나에게 가장 큰 힘이 되는 사람이나 존재는?", "올해가 가기 전에 꼭 이루고 싶은 소소한 목표는?", "우울할 때 보면 기분이 좋아지는 사진이나 영상은?", "오늘 하늘은 어떤 모습이었나요?", "내가 가장 좋아하는 나의 표정은?", "나를 표현하는 색깔을 고른다면 어떤 색일까요?", "가장 최근에 크게 웃었던 일은 무엇인가요?", "한 달을 마무리하며, 나에게 주고 싶은 선물은?",
];

const REAL_TODAY = new Date();
const REAL_YEAR = REAL_TODAY.getFullYear();
const REAL_MONTH = REAL_TODAY.getMonth();
const REAL_DATE = REAL_TODAY.getDate();

interface DateInfo {
  year: number; month: number; date: number; question: string; isPast: boolean; isToday: boolean; theme: (typeof MONTHLY_THEMES)[0];
}

// ==========================================
// 2. UI 컴포넌트들
// ==========================================
function BasketCard({ y, m, d, text, theme, question }: {
  y: number; m: number; d: number; text: string; theme: (typeof MONTHLY_THEMES)[0]; question: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-3xl p-5 shadow-sm border ${theme.colors.border}`}>
      {/* 질문 */}
      <h2 className={`font-black text-lg mb-3 ${theme.colors.textMain}`}>{`"${question}"`}</h2>

      {/* 대답 — 클릭하면 펼쳐짐 */}
      <div
        className={`rounded-2xl p-4 transition-all duration-300 cursor-pointer ${theme.colors.inputBg}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <p className={`text-gray-700 font-medium whitespace-pre-wrap transition-all duration-300 ${!isExpanded ? 'line-clamp-3' : ''}`}>
          {text}
        </p>
      </div>

      {/* 디바이더 */}
      <div className="w-full h-px my-3 bg-gray-200 opacity-50" />

      {/* 날짜 및 기록완료 */}
      <div className="flex justify-between items-center">
        <span className={`font-bold text-sm ${theme.colors.textSub}`}>{y}년 {m + 1}월 {d}일</span>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${theme.colors.accentBg} ${theme.colors.accentText}`}>
          {theme.emoji} 기록 완료
        </span>
      </div>
    </div>
  );
}

function Header({ theme, userPhoto, onLogout, onBasket }: { theme: (typeof MONTHLY_THEMES)[0]; userPhoto: string | null; onLogout: () => void; onBasket: () => void; }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      {/* 바깥 클릭 감지 오버레이 */}
      {isMenuOpen && (
  <div 
    className="fixed inset-0 z-40" 
    onClick={() => setIsMenuOpen(false)}
    onTouchStart={() => setIsMenuOpen(false)}
  />
)}
      <div className="flex justify-between items-center mb-6 px-2 mt-4 relative z-50">
        <h1 className={`text-2xl font-extrabold transition-colors duration-500 ${theme.colors.textMain}`}>일기장 {theme.emoji}</h1>
        <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 cursor-pointer hover:shadow-md transition overflow-hidden border-2 border-transparent">
          {userPhoto ? <img src={userPhoto} alt="profile" className="w-full h-full object-cover" /> : "👤"}
        </div>
        {isMenuOpen && (
  <div className="absolute right-0 top-14 bg-white border border-gray-100 shadow-lg rounded-2xl p-2 w-36 flex flex-col gap-1 z-50">
    <button onClick={() => { setIsMenuOpen(false); onBasket(); }} className="w-full text-center px-4 py-2 text-sm font-bold hover:bg-rose-50 rounded-xl transition">
      🧺 과일 바구니
    </button>
    <button onClick={() => { setIsMenuOpen(false); onLogout(); }} className="w-full text-center px-4 py-2 text-sm text-red-500 font-bold hover:bg-red-50 rounded-xl transition">
      🚪 로그아웃 
    </button>
  </div>
)}
      </div>
    </>
  );
}

function DetailCard({ selectedDate, initialText, onSave }: { selectedDate: DateInfo; initialText: string; onSave: (dateKey: string, text: string) => void; }) {
  const [text, setText] = useState(initialText);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setText(initialText); }, [initialText]);

  // const isYesterday = 
  // selectedDate.year === REAL_YEAR && 
  // selectedDate.month === REAL_MONTH && 
  // selectedDate.date === REAL_DATE - 1;

  const isEditable = selectedDate.isToday 
  // || isYesterday;  
  const theme = selectedDate.theme;
  const dateKey = `${selectedDate.year}-${selectedDate.month}-${selectedDate.date}`;
  const isModified = text !== initialText;
  const showButton = !initialText || isFocused || isModified;
  const [showFruits, setShowFruits] = useState(false); // ← 추가

  const handleAction = async () => {
    if (!initialText || isModified) { await onSave(dateKey, text); }
    textareaRef.current?.blur();
    setIsFocused(false);
    setShowFruits(true);
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); }, 1800); // 텍스트 1초 후 사라짐
  setTimeout(() => { setShowFruits(false); }, 4000); // 과일 4초 후 사라짐
};

  const [isExpanded, setIsExpanded] = useState(false);

useEffect(() => { 
  setText(initialText); 
  setIsExpanded(false); // 날짜 바뀌면 자동 접기
}, [initialText]);

  return (
    <>
    {/* 기록 수정 및 완료 애니메이션 */}
    {showFruits && (
  <div className="fixed inset-0 z-[100] pointer-events-none">
    {[...Array(25)].map((_, i) => {
  const angle = (i / 25) * 360 + Math.random() * 20;
  const distance = 150 + Math.random() * 250;
  const tx = Math.cos((angle * Math.PI) / 180) * distance;
  const ty = Math.sin((angle * Math.PI) / 180) * distance;
  return (
    <div
      key={i}
      className="fixed text-3xl pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        '--tx': `${tx}px`,
        '--ty': `${ty}px`,
        animation: `burst ${1 + Math.random() * 0.8}s cubic-bezier(0.2, 0, 0.8, 1) forwards`,
        animationDelay: `${Math.random() * 0.3}s`,
      } as React.CSSProperties}
    >
      {theme.emoji}
    </div>
  );
})}
  </div>
)}

{showSuccess && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
    <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl">
      <div className="text-7xl mb-4 drop-shadow-md">{theme.emoji}</div>
      <p className={`text-2xl font-extrabold ${theme.colors.textMain}`}>완료되었습니다!</p>
    </div>
  </div>
)}

{/* 날짜 및 상태 표시 */}
<div className="px-5 flex justify-between items-center mb-2">
          <span className={`font-bold text-base transition-colors duration-500 ${theme.colors.textSub}`}>
            {selectedDate.year}년 {theme.month}월 {selectedDate.date}일
          </span>
          {initialText ? (
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors duration-500 ${theme.colors.accentBg} ${theme.colors.accentText}`}>
              {theme.emoji} 기록 완료
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              {selectedDate.isPast ? "기록 없음" : "기록 대기"}
            </span>
          )}
        </div>
      <div className={`rounded-3xl p-5 py-3.5 shadow-sm mb-6 border transition-all duration-300 transform ${theme.colors.border}`} style={{ backgroundColor: '#fdfcfa' }}>
        
        {/* 디바이더 */}
        {/* <div className={`w-full h-px mb-1 transition-colors duration-500 text-gray-400 bg-current opacity-30`} /> */}
        {/* 질문 */}
        <div className={`rounded-2xl py-3 transition-colors duration-500`}>
          <h2 className={`font-black text-lg flex items-center gap-2 transition-colors duration-500 ${theme.colors.textMain}`}>
            {`"${selectedDate.question}"`}
          </h2>
        </div>
        {/* 오늘의 답변 */}
        <div>
        {!isEditable ? (
  <div 
    className={`rounded-2xl p-4 transition-all duration-300 ${theme.colors.inputBg} ${initialText ? 'cursor-pointer' : ''}`}
    onClick={() => { if (initialText) setIsExpanded(!isExpanded); }}
  >
    <p className={`text-gray-700 font-medium whitespace-pre-wrap transition-all duration-300 ${initialText && !isExpanded ? 'line-clamp-3' : ''}`}>
      {initialText ? initialText : selectedDate.isPast ? "이날은 기록을 남기지 않았어요 🥲" : "당일이 되면 쓸 수 있어요! 🌱"}
    </p>
  </div>
          ) : (
            <textarea
              ref={textareaRef} value={text} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onChange={(e) => setText(e.target.value)}
              className={`w-full rounded-2xl p-3 text-gray-800 focus:outline-none focus:ring-2 resize-none font-medium min-h-[120px] transition-colors duration-500 ${theme.colors.inputBg} ${theme.colors.ring}`}
              placeholder="오늘의 마음을 적어주세요..."
            />
          )}
        </div>
        {isEditable && showButton && (
          <button onMouseDown={(e) => { e.preventDefault(); handleAction(); }} disabled={text.trim().length === 0}
            className={`w-full font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-sm ${text.trim().length > 0 ? `${theme.colors.btn} text-white` : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
            {!initialText ? `저장하기 ${theme.emoji}` : `수정완료 ${theme.emoji}`}
          </button>
        )}
      </div>
    </>
  );
}

function CalendarGrid({ viewingYear, viewingMonth, onPrevMonth, onNextMonth, onDateClick, diaries, selectedDate }: { viewingYear: number; viewingMonth: number; onPrevMonth: () => void; onNextMonth: () => void; onDateClick: (d: DateInfo) => void; diaries: Record<string, string>; selectedDate: DateInfo; }) {
  const wobblyCircle = (seed: number) => {
    const r = (n: number) => ((seed * 13 + n * 7) % 6) - 3;
    return `M${18+r(1)} ${4+r(2)} Q${28+r(3)} ${2+r(4)} ${33+r(5)} ${11+r(6)} Q${37+r(7)} ${21+r(8)} ${30+r(9)} ${29+r(10)} Q${23+r(11)} ${36+r(12)} ${13+r(13)} ${33+r(14)} Q${3+r(15)} ${29+r(16)} ${3+r(17)} ${18+r(18)} Q${3+r(19)} ${7+r(20)} ${18+r(1)} ${4+r(2)}`;
  };
  const theme = MONTHLY_THEMES[viewingMonth];
  const isCurrentMonth = viewingYear === REAL_YEAR && viewingMonth === REAL_MONTH;
  const canGoNext = viewingYear < REAL_YEAR || viewingMonth < REAL_MONTH;
  const daysInMonth = new Date(viewingYear, viewingMonth + 1, 0).getDate();
  const days: DateInfo[] = [];
  const weeks = Math.ceil(daysInMonth / 7);
  const svgHeight = 60 + weeks * 52 + 20;

  for (let i = 1; i <= daysInMonth; i++) {
    let isPast = false; let isToday = false;
    if (viewingYear < REAL_YEAR || (viewingYear === REAL_YEAR && viewingMonth < REAL_MONTH)) {
      isPast = true;
    } else if (isCurrentMonth) {
      isPast = i < REAL_DATE; isToday = i === REAL_DATE;
    }
    days.push({ year: viewingYear, month: viewingMonth, date: i, question: MONTHLY_QUESTIONS[i - 1] || "오늘의 질문이 없습니다.", isPast, isToday, theme });
  }

  return (
<div className={`relative rounded-3xl p-5 shadow-sm border transition-colors duration-500 ${theme.colors.border}`} style={{ backgroundColor: '#fdfcfa' }}>

{/* 삐뚤빼뚤 선 오버레이 */}
<svg className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl overflow-hidden" 
  viewBox={`0 0 340 ${svgHeight}`} 
  preserveAspectRatio="none">
  {/* 가로줄 */}
  <path d="M 8,70 Q 100,67 180,71 Q 260,75 332,69" stroke="#00000018" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
  {/* 가로줄 5개 추가 — 각 주 사이 */}
  {Array.from({ length: Math.ceil(daysInMonth / 7) + 1 }).map((_, i) => {
  const gap = 47; // ← 이 숫자 하나만 조절
  const totalHeight = svgHeight;
  const startY = totalHeight / 2 - (Math.ceil(daysInMonth / 7) / 2) * gap;
  const y = startY + (i + 1) * gap;
  return (
    <path key={i}
      d={`M 8,${y} Q 100,${y + (i%2===0?2:-2)} 180,${y+1} Q 260,${y + (i%2===0?-1:2)} 332,${y}`}
      stroke="#00000018" strokeWidth="1.2" fill="none" strokeLinecap="round"
    />
  );
})}
  {/* 세로줄 6개 */}
  {[1,2,3,4,5,6].map((i) => {
  const center = 170; // 340/2
  const x = center + (i - 3.5) * 44;
  return (
    <path key={i}
      d={`M ${x+2},62 Q ${x+(i%2===0?3:-3)},${svgHeight*0.6} ${x-1},${svgHeight}`}
      stroke="#00000015" strokeWidth="1" fill="none" strokeLinecap="round"
    />
  );
})}
</svg>      <div className="text-center mb-3"> 
        <p className={`text-xs font-bold mb-1 transition-colors duration-500 ${theme.colors.textSub}`}>
          {isCurrentMonth ? "이번 달" : `${viewingYear}년 ${theme.month}월`} 제철과일 : {theme.name} {theme.emoji}
        </p>
        <div className="flex justify-center items-center">
          <button onClick={onPrevMonth} className={`font-bold text-xl px-4 py-2 hover:scale-125 transition transform ${theme.colors.textSub}`}>&lt;</button>
          <span className={`text-xl font-black tracking-[0.25em] whitespace-nowrap w-40 text-center transition-colors duration-500 ${theme.colors.textMain}`}>{theme.eng}</span>
          <button onClick={onNextMonth} disabled={!canGoNext} className={`font-bold text-xl px-4 py-2 transition transform ${canGoNext ? `${theme.colors.textSub} hover:scale-125 cursor-pointer` : "text-gray-200 cursor-not-allowed"}`}>&gt;</button>
        </div>
        
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-4">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, i) => (
          <span key={day} className={`text-xs font-bold transition-colors duration-500 ${i === 0 ? theme.colors.textSub : theme.colors.textMain}`}>{day}</span>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-x-1 gap-y-2 text-center">
        {days.map((dayObj) => {
          const dateKey = `${dayObj.year}-${dayObj.month}-${dayObj.date}`;
          const isRecorded = !!diaries[dateKey];
          const isSelected = selectedDate.year === dayObj.year && selectedDate.month === dayObj.month && selectedDate.date === dayObj.date;
          return (
            <div key={dayObj.date} onClick={() => onDateClick(dayObj)} className="flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-110">
  <div className="relative flex items-center justify-center w-9 h-9">
    {dayObj.isToday && (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
        <path
          d={wobblyCircle(dayObj.date + 100)}
          fill="none"
          stroke="#f43f5e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
    )}
    {/* {isSelected && !dayObj.isToday && (
      <div className={`absolute inset-0 rounded-full ${theme.colors.accentBg}`} />
    )} */}
    {isSelected && !dayObj.isToday && (
  <svg className={`absolute inset-0 w-full h-full ${theme.colors.textMain}`} viewBox="0 0 36 36">
    <path
      d={wobblyCircle(dayObj.date)}
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)}
    <span className={`relative z-10 font-bold text-sm
      ${dayObj.isToday ? `font-extrabold ${theme.colors.textMain}` : ''}
      ${isSelected && !dayObj.isToday ? theme.colors.textMain : ''}
      ${!dayObj.isToday && dayObj.date % 7 === 1 ? theme.colors.textSub : ''}
      ${!dayObj.isToday && dayObj.date % 7 !== 1 && !isSelected ? 'text-gray-800' : ''}
    `}>
      {dayObj.date}
    </span>
  </div>
  <div className="h-3 flex items-center justify-center">
    {isRecorded ? <span className="text-[10px]">{theme.emoji}</span> : <div className={`w-1.5 h-1.5 rounded-full ${theme.colors.dot}`}></div>}
  </div>
</div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 3. 최상위 App 컴포넌트
// ==========================================
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [viewingYear, setViewingYear] = useState(REAL_YEAR);
  const [viewingMonth, setViewingMonth] = useState(REAL_MONTH);
  const [diaries, setDiaries] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showBasket, setShowBasket] = useState(false);

  const [selectedDate, setSelectedDate] = useState<DateInfo>({
    year: REAL_YEAR, month: REAL_MONTH, date: REAL_DATE,
    question: MONTHLY_QUESTIONS[REAL_DATE - 1], isPast: false, isToday: true, theme: MONTHLY_THEMES[REAL_MONTH],
  });

  // 1. 로그인 상태 감지
  useEffect(() => {
    const listenerHandle = FirebaseAuthentication.addListener('authStateChange', ({ user }) => {
      console.log("🔄 authStateChange:", user?.uid ?? "로그아웃");
      if (user) {
        setUserUid(user.uid);
        setUserPhoto(user.photoUrl ?? null);
        setIsLoggedIn(true);
      } else {
        setUserUid(null);
        setUserPhoto(null);
        setIsLoggedIn(false);
        setDiaries({});
      }
    });

    // 앱 시작시 현재 유저 확인
    FirebaseAuthentication.getCurrentUser().then(({ user }) => {
      if (user) {
        console.log("✅ 현재 유저:", user.uid);
        setUserUid(user.uid);
        setUserPhoto(user.photoUrl ?? null);
        setIsLoggedIn(true);
      }
    });

    return () => {
      listenerHandle.then(handle => handle.remove());
    };
  }, []);

  // 2. UID 확정되면 데이터 로딩
  useEffect(() => {
    if (!userUid) return;

    const fetchDiaries = async () => {
      try {
        console.log(`📂 ${userUid} 데이터 로딩 중...`);
        const { snapshots } = await FirebaseFirestore.getCollection({
          reference: `users/${userUid}/diaries`
        });
        const fetchedData: Record<string, string> = {};
        snapshots.forEach((snap) => {
          if (snap.data?.text) fetchedData[snap.id] = snap.data.text;
        });
        console.log("🎉 데이터 로딩 완료! 개수:", Object.keys(fetchedData).length);
        setDiaries(fetchedData);
      } catch (error) {
        console.error("❌ 데이터 로딩 실패:", error);
      }
    };
    fetchDiaries();
  }, [userUid]);

  // 3. 구글 로그인
  const handleGoogleLogin = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      
      if (Capacitor.isNativePlatform()) {
        // 앱: 네이티브 사파리
        await FirebaseAuthentication.signInWithGoogle();
      } else {
        // 웹: 팝업
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error("❌ 로그인 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. 로그아웃
  const handleLogout = async () => {
    try {
      await FirebaseAuthentication.signOut();
      console.log("👋 로그아웃 완료");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 5. 일기 저장
  const handleSaveDiary = async (dateKey: string, text: string) => {
    if (!userUid) return;
    setDiaries((prev) => ({ ...prev, [dateKey]: text }));
    try {
      await FirebaseFirestore.setDocument({
        reference: `users/${userUid}/diaries/${dateKey}`,
        data: { text, createdAt: new Date().toISOString() }
      });
    } catch (error) {
      console.error("저장 실패:", error);
    }
  };

  const changeMonthAndSelectDate = (newYear: number, newMonth: number) => {
    setViewingYear(newYear); setViewingMonth(newMonth);
    const isCurrentMonth = newYear === REAL_YEAR && newMonth === REAL_MONTH;
    const targetDate = isCurrentMonth ? REAL_DATE : 1;
    const isPast = newYear < REAL_YEAR || (newYear === REAL_YEAR && newMonth < REAL_MONTH) || (isCurrentMonth && targetDate < REAL_DATE);
    setSelectedDate({ year: newYear, month: newMonth, date: targetDate, question: MONTHLY_QUESTIONS[targetDate - 1] || "오늘의 질문이 없습니다.", isPast, isToday: isCurrentMonth && targetDate === REAL_DATE, theme: MONTHLY_THEMES[newMonth] });
  };

  const handlePrevMonth = () => { viewingMonth === 0 ? changeMonthAndSelectDate(viewingYear - 1, 11) : changeMonthAndSelectDate(viewingYear, viewingMonth - 1); };
  const handleNextMonth = () => {
    if (viewingYear === REAL_YEAR && viewingMonth === REAL_MONTH) return;
    viewingMonth === 11 ? changeMonthAndSelectDate(viewingYear + 1, 0) : changeMonthAndSelectDate(viewingYear, viewingMonth + 1);
  };

  // 로그인 화면
  if (!isLoggedIn) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen p-6 w-full transition-colors duration-500 ${MONTHLY_THEMES[REAL_MONTH].colors.bg}`}>
        <div className="text-6xl mb-4 text-center">{MONTHLY_THEMES[REAL_MONTH].emoji}</div>
        <h1 className={`text-3xl font-extrabold mb-2 text-center ${MONTHLY_THEMES[REAL_MONTH].colors.textMain}`}>제철과일 일기장</h1>
        <p className={`font-medium mb-12 text-center ${MONTHLY_THEMES[REAL_MONTH].colors.textSub}`}>매달 새로운 과일과 함께 나를 기록하세요</p>
        <div className="w-full max-w-sm mt-12 flex flex-col gap-3">
          <button className="w-full bg-black text-white font-bold py-4 rounded-2xl shadow-sm hover:bg-gray-800 transition flex items-center justify-center gap-2">
            Apple로 시작하기
          </button>
          <button onClick={handleGoogleLogin} disabled={isLoading}
            className="w-full bg-white text-gray-800 border border-gray-200 font-bold py-4 rounded-2xl shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" className="w-5 h-5" />
            {isLoading ? "로그인 중..." : "Google로 시작하기"}
          </button>
        </div>
      </div>
    );
  }

  // 과일 바구니 화면
  if (showBasket) {
    const sortedDiaries = Object.entries(diaries)
      .sort(([a], [b]) => {
        const [ay, am, ad] = a.split('-').map(Number);
        const [by, bm, bd] = b.split('-').map(Number);
        return new Date(by, bm, bd).getTime() - new Date(ay, am, ad).getTime();
      });
  
    return (
      <div className="min-h-screen text-gray-800" style={{ backgroundColor: '#ffffff' }}>
  {/* 헤더 */}
  <div className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#8B6343', paddingTop: 'env(safe-area-inset-top)' }}>
    <div className="px-4 flex items-center gap-3 py-4">
      <button onClick={() => setShowBasket(false)} className="font-bold text-xl text-white">←</button>
      <h1 className="text-2xl font-extrabold text-white">과일 바구니</h1>
    </div>
  </div>
  
        {/* 카드 목록 */}
        <div className="px-4 flex flex-col items-center"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 70px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}>
          <div className="w-full max-w-md flex flex-col gap-4">
            {sortedDiaries.length === 0 ? (
              <p className={`text-center mt-20 ${MONTHLY_THEMES[REAL_MONTH].colors.textSub}`}>아직 기록이 없어요 🥲</p>
            ) : (
              sortedDiaries.map(([dateKey, text]) => {
                const [y, m, d] = dateKey.split('-').map(Number);
                const themeIndex = Math.max(0, Math.min(m , 11));
                const theme = MONTHLY_THEMES[themeIndex];
                const question = MONTHLY_QUESTIONS[d - 1] || "오늘의 질문";
                return (
                  <BasketCard key={dateKey} y={y} m={m} d={d} text={text} theme={theme} question={question} />
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // 메인 화면
  return (
    <div className={`min-h-screen text-gray-800 transition-colors duration-500 ${MONTHLY_THEMES[viewingMonth].colors.bg}`}>
  
      {/* 헤더 고정 — safe area 포함 */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${MONTHLY_THEMES[viewingMonth].colors.bg}`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-4">
        <Header theme={MONTHLY_THEMES[viewingMonth]} userPhoto={userPhoto} onLogout={handleLogout} onBasket={() => setShowBasket(true)} />        </div>
      </div>
  
      {/* 스크롤 콘텐츠 — 헤더 높이만큼 밀어내기 */}
      <div className="px-4 flex flex-col items-center"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 80px)' }}>
        <div className="w-full max-w-md"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}>
          <DetailCard
            key={`${selectedDate.year}-${selectedDate.month}-${selectedDate.date}`}
            selectedDate={selectedDate}
            initialText={diaries[`${selectedDate.year}-${selectedDate.month}-${selectedDate.date}`] || ""}
            onSave={handleSaveDiary}
          />
          <CalendarGrid
            viewingYear={viewingYear}
            viewingMonth={viewingMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            selectedDate={selectedDate}
            diaries={diaries}
            onDateClick={(dateInfo) => setSelectedDate(dateInfo)}
          />
        </div>
      </div>
  
    </div>
  );
}