let displayMode = 0; 
let scrollMode = 0; 
let isSilentMode = false;
let currentFontSize = window.innerWidth < 768 ? 1.7 : 2.5; 
let currentChapter = 1;
let currentPlaybackRate = 1;
let currentSpeedIdx = 0;
const playSpeeds = [1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const audio = document.getElementById('megillahAudio');

let listenerAutoScrollInterval = null;
let isListenerScrolling = false;
let listenerScrollSpeedIdx = 0;
const listenerScrollSpeeds = [1, 1.5, 2.5, 4];

function startApp(mode) {
    isSilentMode = (mode === 'listener');
    if (isSilentMode) displayMode = 0;

    document.getElementById('playerBar').classList.toggle('hidden', isSilentMode);
    document.getElementById('listenerBar').classList.toggle('hidden', !isSilentMode);
    document.getElementById('instructionsHint').classList.toggle('hidden', isSilentMode);
    document.getElementById('floatingControls').classList.toggle('hidden', isSilentMode);

    document.getElementById('welcomeOverlay').style.opacity = '0';
    setTimeout(() => { document.getElementById('welcomeOverlay').style.display = 'none'; }, 500);
    setupNav();
    loadChapter(1);
}

function loadChapter(num) {
    if (isSilentMode && isListenerScrolling) toggleListenerScroll();
    currentChapter = num;
    document.querySelectorAll('.chapter-btn').forEach((b, i) => b.classList.toggle('active', i+1 === num));
    applyLayout();
    updateBottomNav();
    
    if(!isSilentMode) {
        audio.src = `./audio/chap${num}.mp3`;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
}

function applyLayout() {
    const wrapper = document.getElementById('mainWrapper');
    wrapper.innerHTML = ''; 
    if (displayMode === 2) { 
        const grid = document.createElement('div');
        grid.className = 'dual-view-container';
        grid.appendChild(createCol('mode-chumash', true, true));
        grid.appendChild(createCol('mode-megillah', true, false));
        wrapper.appendChild(grid);
    } else { 
        wrapper.appendChild(createCol(displayMode === 0 ? 'mode-chumash' : 'mode-megillah', false, displayMode === 0));
    }
}

function createCol(className, isDual, isChumash) {
    const col = document.createElement('div');
    col.className = `column ${className}`;
    const inner = document.createElement('div');
    inner.className = 'text-content';
    renderTextToElement(inner, isDual, isChumash);
    col.appendChild(inner);
    return col;
}

function renderTextToElement(area, isDual, isChumashMode) {
    const dataWith = megillahData[currentChapter];
    const dataNo = megillahDataNoNikkud[currentChapter];
    let size = isDual ? (currentFontSize * 0.75) : currentFontSize;
    area.style.fontSize = size + 'rem';

    dataWith.forEach((item, idx) => {
        const span = document.createElement('span');
        span.className = 'pasuk';
        span.dataset.index = idx;
        span.onclick = () => { if(!isSilentMode) { audio.currentTime = item.time; audio.play(); } };
        
        const textNo = dataNo[idx] ? dataNo[idx].t : "";
        span.innerHTML = `
            <span class="text-with">${item.t}</span>
            <span class="text-without">${textNo}</span>
        `;
        area.appendChild(span);
    });
}

function syncText() {
    if (isSilentMode) return;
    const data = megillahData[currentChapter];
    let activeIdx = -1;
    for (let i = 0; i < data.length; i++) { if (audio.currentTime >= data[i].time) activeIdx = i; }
    
    document.querySelectorAll('.pasuk').forEach(p => p.classList.remove('playing-now'));
    const activeSpans = document.querySelectorAll(`.pasuk[data-index="${activeIdx}"]`);
    
    if(activeSpans.length > 0) {
        activeSpans.forEach(s => s.classList.add('playing-now'));
        if(scrollMode === 1) {
            activeSpans[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function togglePlayPause() { audio.paused ? audio.play() : audio.pause(); }

function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
}

function setupNav() {
    const nav = document.getElementById('chapterNav');
    const letters = ["", "א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ז'", "ח'", "ט'", "י'"];
    nav.innerHTML = '';
    for(let i=1; i<=10; i++) {
        const btn = document.createElement('button');
        btn.className = `chapter-btn ${i===1?'active':''}`;
        btn.innerHTML = `פרק ${letters[i]}`;
        btn.onclick = () => loadChapter(i);
        nav.appendChild(btn);
    }
}

function updateBottomNav() {
    const nav = document.getElementById('bottomNav');
    nav.innerHTML = `
        <button class="nav-btn" ${currentChapter===1?'disabled':''} onclick="loadChapter(${currentChapter-1})">פרק הקודם</button>
        <button class="nav-btn" ${currentChapter===10?'disabled':''} onclick="loadChapter(${currentChapter+1})">פרק הבא</button>
    `;
}

function changeFontSize(d) {
    currentFontSize += d * 0.15;
    applyLayout();
}

function cycleDisplayMode() {
    displayMode = (displayMode + 1) % 3;
    const labels = ["לתצוגה ללא ניקוד", "לתצוגת שתי עמודות", "לתצוגה עם ניקוד"];
    document.getElementById('mainCycleBtn').innerText = labels[displayMode];
    applyLayout();
}

// פונקציות נוספות (גלילה, מהירות וכו') כפי שהיו בקוד המקורי...
