const firebaseConfig = {
    apiKey: "AIzaSyBTAjmwijuxSoo1W8SBh0MWu-ZFDlFZZ8U",
    authDomain: "megilat-ester.firebaseapp.com",
    databaseURL: "https://megilat-ester-default-rtdb.firebaseio.com/",
    projectId: "megilat-ester",
    storageBucket: "megilat-ester.firebasestorage.app",
    messagingSenderId: "933099508099",
    appId: "1:933099508099:web:7276a005e72a75c16326b6"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const ADMIN_PASS_HASH = "f33ef584161d349d906df37718453917299dd56fd43111e1fb1c4ef1f5afb019";

async function hashString(str) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

window.addEventListener('load', () => {
    db.ref('stats/visits').set(firebase.database.ServerValue.increment(1));
});

function sendMessage() {
    const name = document.getElementById('contactName').value;
    const text = document.getElementById('contactMessage').value;
    if(!name.trim() || !text.trim()) return alert("מלא שדות");
    
    db.ref('messages').push({
        name, text, date: new Date().toLocaleString('he-IL')
    }).then(() => {
        alert("נשלח!");
        closeModals();
    });
}

async function openAdminLogin() {
    const pass = prompt("סיסמה:");
    if (pass) {
        const hashed = await hashString(pass);
        if (hashed === ADMIN_PASS_HASH) {
            updateAdminDashboard();
            document.getElementById('adminModal').style.display = 'flex';
        } else alert("טעות");
    }
}

function updateAdminDashboard() {
    db.ref('stats/visits').once('value').then(s => document.getElementById('adminVisits').innerText = s.val() || 0);
    db.ref('messages').once('value').then(s => {
        const list = document.getElementById('adminMessagesList');
        list.innerHTML = '';
        s.forEach(c => {
            const m = c.val();
            list.innerHTML += `<li>${m.name}: ${m.text}</li>`;
        });
    });
}

function clearAdminData() {
    if(confirm("למחוק הכל?")) {
        db.ref().remove();
        location.reload();
    }
}
