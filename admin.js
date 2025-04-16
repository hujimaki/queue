import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, get, child } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDP4MJbaogKfamgeKIvJVWKpeylGdls6EM",
  authDomain: "haeundae-eb1a0.firebaseapp.com",
  databaseURL: "https://haeundae-eb1a0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "haeundae-eb1a0",
  storageBucket: "haeundae-eb1a0.firebasestorage.app",
  messagingSenderId: "530243527795",
  appId: "1:530243527795:web:2d3f83669733006fa03606"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const queueRef = ref(db, "queue");

const ADMIN_PASSWORD = "1234";

window.checkPassword = function () {
  const input = document.getElementById("passwordInput").value;
  if (input === ADMIN_PASSWORD) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("adminSection").style.display = "block";
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
};

window.addToQueue = function () {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("이름을 입력해주세요");

  const newEntry = {
    name,
    timestamp: Date.now()
  };

  push(queueRef, newEntry);
  document.getElementById("nameInput").value = "";
};

window.clearAll = function () {
  if (confirm("정말 전체 삭제하시겠습니까?")) {
    remove(queueRef);
  }
};

window.processNext = async function () {
  const snapshot = await get(queueRef);
  const data = snapshot.val();
  if (!data) return alert("대기자가 없습니다!");

  const entries = Object.entries(data);
  const [firstKey] = entries[0];
  remove(child(queueRef, firstKey));
};

// 🔀 랜덤 순번 등록
window.addRandomizedQueue = function () {
  const input = document.getElementById("bulkNames").value.trim();
  if (!input) return alert("이름을 입력해주세요");

  let names = input.split(',').map(n => n.trim()).filter(n => n);
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }

  names.forEach(name => {
    const newEntry = {
      name,
      timestamp: Date.now()
    };
    push(queueRef, newEntry);
  });

  document.getElementById("bulkNames").value = "";
};

// 리스트 실시간 렌더링
onValue(queueRef, (snapshot) => {
  const data = snapshot.val();
  const listElement = document.getElementById("queueList");
  listElement.innerHTML = "";

  if (data) {
    const entries = Object.entries(data);
    entries.forEach(([key, value], index) => {
      const minutes = Math.floor((Date.now() - value.timestamp) / 60000);
      const timeInfo = minutes > 0 ? `${minutes}분 경과` : `방금 등록`;

      const li = document.createElement("li");
      li.innerHTML = `
        <div class="name-time">${index + 1}번 - ${value.name} (${timeInfo})</div>
        <button class="delete-btn" onclick="deleteEntry('${key}')">삭제</button>
      `;
      listElement.appendChild(li);
    });
  }
});

// 개별 삭제
window.deleteEntry = function (key) {
  remove(child(queueRef, key));
};
