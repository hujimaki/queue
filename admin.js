
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  get,
  child,
  set
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
const queueRef = ref(db, "queue");
const settingsRef = ref(db, "settings");

window.checkPassword = function () {
  const input = document.getElementById("passwordInput").value;
  if (input === "1234") {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("adminSection").style.display = "block";
  } else {
    alert("비밀번호가 틀렸습니다.");
  }
};

window.saveApprovalTime = function () {
  const time = document.getElementById("approvalTimeSelect").value;
  if (!time) return alert("시간을 선택해주세요");

  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  const kst = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hours - 9, minutes));
  const timestamp = kst.getTime();

  set(ref(db, "settings/approvalTime"), timestamp);
  const text = `결재 시작 시간: ${time}`;
  document.getElementById("setTimeText").innerText = text;
};

window.addToQueue = function () {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("이름을 입력하세요");

  push(queueRef, { name, timestamp: Date.now() });
  document.getElementById("nameInput").value = "";
};

window.addRandomizedQueue = function () {
  const raw = document.getElementById("bulkNames").value;
  const names = raw.split(",").map(n => n.trim()).filter(n => n);
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  names.forEach(name => {
    push(queueRef, { name, timestamp: Date.now() });
  });
  document.getElementById("bulkNames").value = "";
};

window.clearAll = () => remove(queueRef);

window.processNext = async function () {
  const snapshot = await get(queueRef);
  const data = snapshot.val();
  if (!data) return;

  const [firstKey] = Object.keys(data);
  remove(child(queueRef, firstKey));
};

window.randomizeFinalQueue = async function () {
  const snapshot = await get(queueRef);
  const data = snapshot.val();
  if (!data) return alert("대기자 없음");

  const entries = Object.entries(data);
  const shuffled = entries.sort(() => Math.random() - 0.5);
  await remove(queueRef);
  for (let [_, val] of shuffled) {
    await push(queueRef, val);
  }
};

onValue(queueRef, (snapshot) => {
  const list = document.getElementById("queueList");
  list.innerHTML = "";
  const data = snapshot.val();
  if (!data) return;
  Object.entries(data).forEach(([key, val], i) => {
    const li = document.createElement("li");
    const mins = Math.floor((Date.now() - val.timestamp) / 60000);
    li.innerText = `${i + 1}번 - ${val.name} (${mins}분 전)`;
    list.appendChild(li);
  });
});
