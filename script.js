
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDP4MJbaogKfamgeKIvJVWKpeylGdls6EM",
  authDomain: "haeundae-eb1a0.firebaseapp.com",
  databaseURL: "https://haeundae-eb1a0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "haeundae-eb1a0",
  storageBucket: "haeundae-eb1a0.appspot.com",
  messagingSenderId: "530243527795",
  appId: "1:530243527795:web:2d3f83669733006fa03606"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let approvalTime = null;

const queueRef = ref(db, "queue");
const approvalRef = ref(db, "settings/approvalTime");

onValue(queueRef, snapshot => {
  const data = snapshot.val();
  document.getElementById("queueCount").innerText = data ? Object.keys(data).length : 0;
});

onValue(approvalRef, snap => {
  const timestamp = snap.val();
  if (!timestamp) return;

  const utcDate = new Date(timestamp);
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(utcDate.getTime() + kstOffset);

  const hours = kstDate.getHours().toString().padStart(2, '0');
  const minutes = kstDate.getMinutes().toString().padStart(2, '0');

  // 시간 텍스트 제거됨
  approvalTime = timestamp;

  updateStatus();
});

function updateStatus() {
  const now = Date.now();
  const statusDiv = document.getElementById("queueStatus");
  const requestBtn = document.getElementById("requestBtn");

  if (!approvalTime) {
    statusDiv.innerText = "신청 시간 미설정";
    requestBtn.disabled = true;
    requestBtn.classList.add("disabled");
    return;
  }

  const diffMin = (approvalTime - now) / (1000 * 60);

  if (diffMin > 120) {
    statusDiv.innerText = `아직 신청 전입니다. (${Math.floor(diffMin - 120)}분 후 시작)`;
    requestBtn.disabled = true;
    requestBtn.classList.add("disabled");
  } else if (diffMin < 60) {
    statusDiv.innerText = "⛔ 신청 마감되었습니다.";
    requestBtn.disabled = true;
    requestBtn.classList.add("disabled");
  } else {
    statusDiv.innerText = `✅ 신청 가능! (${Math.floor(diffMin - 60)}분 남음)`;
    requestBtn.disabled = false;
    requestBtn.classList.remove("disabled");
  }
}

setInterval(updateStatus, 30000);

window.requestQueue = async function () {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("이름을 입력하세요");

  if (!approvalTime) return alert("승인 시간이 설정되지 않았습니다");

  const now = Date.now();
  const diffMin = (approvalTime - now) / (1000 * 60);
  if (diffMin > 120 || diffMin < 60) {
    return alert("지금은 신청할 수 없는 시간입니다.");
  }

  push(queueRef, { name, timestamp: now });
  alert("신청 완료!");
  document.getElementById("nameInput").value = "";
};

window.checkMyQueue = async function () {
  const name = document.getElementById("nameInput").value.trim();
  const snapshot = await get(queueRef);
  const data = snapshot.val();
  if (!data || !name) return;

  const sorted = Object.values(data);
  const index = sorted.findIndex(entry => entry.name === name);
  if (index !== -1) {
    document.getElementById("myQueueNumber").innerText = `내 순번: ${index + 1}번`;
  } else {
    document.getElementById("myQueueNumber").innerText = "등록되지 않음";
  }
};
