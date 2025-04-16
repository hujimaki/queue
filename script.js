import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDP4MJbaogKfamgeKIvJVWKpeylGdls6EM",
  authDomain: "haeundae-eb1a0.firebaseapp.com",
  databaseURL: "https://haeundae-eb1a0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "haeundae-eb1a0",
  storageBucket: "haeundae-eb1a0.firebasestorage.app",
  messagingSenderId: "530243527795",
  appId: "1:530243527795:web:2d3f83669733006fa03606",
  measurementId: "G-K1JD30BWBD"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const queueRef = ref(db, "queue");
onValue(queueRef, (snapshot) => {
  const data = snapshot.val();
  const total = data ? Object.keys(data).length : 0;
  document.getElementById("queueCount").innerText = total;
});

window.checkMyQueue = async function () {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return alert("이름을 입력해주세요");

  try {
    const snapshot = await get(queueRef);
    const data = snapshot.val();

    if (!data) {
      document.getElementById("myQueueNumber").innerText = "대기자가 없습니다.";
      return;
    }

    const entries = Object.entries(data);
    const foundIndex = entries.findIndex(([_, value]) => value.name === name);

    if (foundIndex !== -1) {
      document.getElementById("myQueueNumber").innerText = `${name}님의 순번은 ${foundIndex + 1}번입니다.`;
    } else {
      document.getElementById("myQueueNumber").innerText = `${name}님은 대기 명단에 없습니다.`;
    }
  } catch (error) {
    console.error("오류 발생:", error);
  }
};
