// 데이터 정의
const SUBJECTS_DATA = [
    {
        name: "생활과 윤리",
        units: [
            "윤리 문제에 대한 다양한 접근 (서양)", "윤리 문제에 대한 다양한 접근 (동양)", "윤리학의 분류", 
            "삶과 죽음의 윤리", "생명과학과 윤리", "성, 사랑, 가족의 윤리", "직업 윤리", "니부어와 사회 윤리", 
            "사회 정의 : 분배 윤리", "국가 시민 : 형벌 윤리", "국가 시민 : 사회계약", "시민불복종", 
            "인간과 자연의 관계", "과학기술과 윤리", "평화와 원조의 윤리", "정보사회의 윤리", 
            "예술과 종교 윤리", "의식주와 소비 윤리", "다문화 윤리", "갈등과 소통, 민족 윤리"
        ]
    },
    {
        name: "사회문화",
        units: [
            "자연 현상과 사회문화 현상", "양적연구와 질적연구", "자료 수집 방법의 종류와 특징", 
            "사회화의 개념과 의미", "사회집단의 의미와 분류", "공식 조직 (관료제, 탈관료제)", 
            "사회집단과 조직 문제풀이", "일탈행위론", "문화의 의미와 문화 상대주의", 
            "문화를 연구하는 관점, 문화의 5대 속성", "대중 매체와 대중문화", "문화의 변동", 
            "계층화를 바라보는 기능론과 갈등론", "계층이동과 표분석 문제", "성불평등과 사회적 소수자", 
            "복지제도의 이해", "진화론과 순환론"
        ]
    }
];

// 복습 주기 (일차)
const REVIEW_INTERVALS = [1, 3, 5, 7, 14, 30, 60, 100, 180];

// 로컬 스토리지 키
const STORAGE_KEY = "tamgu_study_data";

// 초기 상태
let state = {
    activeUnits: {}, // unitId: { startDate, completedSteps: [] }
    roundCount: 0
};

// 앱 초기화
function init() {
    loadData();
    renderAll();
}

// 데이터 로드
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        state = JSON.parse(saved);
    }
}

// 데이터 저장
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// 날짜 차이 계산 (YYYY-MM-DD 기준)
function getDiffInDays(startDateStr) {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today - start;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // 1일차부터 시작
}

// 렌더링 함수들
function renderAll() {
    renderTodoList();
    renderSubjects();
}

function renderTodoList() {
    const todoContainer = document.getElementById("todo-list");
    todoContainer.innerHTML = "";
    
    let hasTasks = false;
    
    // 모든 활성 단원 순회
    for (const unitId in state.activeUnits) {
        const unitData = state.activeUnits[unitId];
        const [subjectName, unitName] = unitId.split("||");
        const currentDay = getDiffInDays(unitData.startDate);
        
        // 각 단계별로 오늘 해야 할 일인지 확인
        REVIEW_INTERVALS.forEach((targetDay, index) => {
            // 오늘이 목표일보다 같거나 지났고, 아직 완료하지 않은 단계라면 표시
            if (currentDay >= targetDay && !unitData.completedSteps.includes(index)) {
                hasTasks = true;
                const item = document.createElement("div");
                item.className = "todo-item";
                
                item.innerHTML = `
                    <input type="checkbox" onchange="toggleComplete('${unitId}', ${index})">
                    <div class="todo-info">
                        <span class="todo-text">[${subjectName} - ${unitName}] ${targetDay}일차</span>
                        <span class="todo-desc">연습장에 설명하듯이 백지복습</span>
                    </div>
                `;
                todoContainer.appendChild(item);
            }
        });
    }
    
    if (!hasTasks) {
        todoContainer.innerHTML = '<p class="empty-msg">오늘의 복습을 모두 완료했거나, 시작한 단원이 없습니다.</p>';
    }
}

function renderSubjects() {
    const container = document.getElementById("subjects-container");
    container.innerHTML = "";
    
    SUBJECTS_DATA.forEach((subject, sIdx) => {
        const item = document.createElement("div");
        item.className = "accordion-item active"; // 기본으로 펼쳐둠
        
        const header = document.createElement("button");
        header.className = "accordion-header";
        header.innerHTML = `<span>${subject.name}</span> <span>▾</span>`;
        header.onclick = () => item.classList.toggle("active");
        
        const content = document.createElement("div");
        content.className = "accordion-content";
        
        subject.units.forEach(unit => {
            const unitId = `${subject.name}||${unit}`;
            const unitData = state.activeUnits[unitId];
            const isStarted = !!unitData;
            const progress = isStarted ? unitData.completedSteps.length : 0;
            
            const row = document.createElement("div");
            row.className = "unit-row";
            row.innerHTML = `
                <div class="unit-info">
                    <span class="unit-name">${unit}</span>
                    ${isStarted ? `<span class="unit-progress">${progress} / 9 단계 완료</span>` : ""}
                </div>
                <button class="start-btn" ${isStarted ? "disabled" : ""} onclick="startUnit('${unitId}')">
                    ${isStarted ? "진행 중" : "시작"}
                </button>
            `;
            content.appendChild(row);
        });
        
        item.appendChild(header);
        item.appendChild(content);
        container.appendChild(item);
    });
}

// 액션 함수들 (Global scope 노출을 위해 window에 등록)
window.startUnit = (unitId) => {
    const today = new Date().toISOString().split('T')[0];
    state.activeUnits[unitId] = {
        startDate: today,
        completedSteps: []
    };
    saveData();
    renderAll();
};

window.toggleComplete = (unitId, stepIndex) => {
    if (!state.activeUnits[unitId].completedSteps.includes(stepIndex)) {
        state.activeUnits[unitId].completedSteps.push(stepIndex);
        saveData();
        
        // 애니메이션 효과를 위해 약간의 지연 후 렌더링
        setTimeout(() => {
            checkTotalCompletion();
            renderAll();
        }, 300);
    }
};

// 전체 완료 및 회독 초기화 로직
function checkTotalCompletion() {
    const totalUnitsCount = SUBJECTS_DATA.reduce((acc, sub) => acc + sub.units.length, 0);
    const activeUnitsKeys = Object.keys(state.activeUnits);
    
    // 모든 단원이 시작되었고, 모든 단원의 완료 단계가 9개(전체 단계)인지 확인
    if (activeUnitsKeys.length === totalUnitsCount) {
        const isAllDone = activeUnitsKeys.every(key => state.activeUnits[key].completedSteps.length === REVIEW_INTERVALS.length);
        
        if (isAllDone) {
            alert(`축하합니다! 사탐 ${state.roundCount + 1}바퀴를 돌리셨습니다! 모든 데이터가 초기화됩니다.`);
            state.roundCount += 1;
            state.activeUnits = {};
            saveData();
            renderAll();
        }
    }
}

// 실행
init();
