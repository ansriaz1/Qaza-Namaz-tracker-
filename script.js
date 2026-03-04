const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

// Multi-user system
let currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
    currentUser = prompt("Enter your name:");
    localStorage.setItem("currentUser", currentUser);
}

let allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};
if (!allUsers[currentUser]) allUsers[currentUser] = {};

let data = allUsers[currentUser];

// Dates
const today = new Date();
const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
const gregorianDate = today.toISOString().split("T")[0];
const hijriDate = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
}).format(today);

document.getElementById("dateDisplay").innerHTML =
    `${dayName} <br> Gregorian: ${gregorianDate} <br> Hijri: ${hijriDate}`;

// Initialize today's prayers
if (!data[gregorianDate]) {
    data[gregorianDate] = {};
    prayers.forEach(p => data[gregorianDate][p] = false);
}

// Save function
function saveData() {
    allUsers[currentUser] = data;
    localStorage.setItem("allUsers", JSON.stringify(allUsers));
}

// Update monthly progress & Qaza
function updateProgress() {
    let total = 0, completed = 0, qaza = 0;
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    for (let date in data) {
        const d = new Date(date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            prayers.forEach(p => {
                total++;
                if (data[date][p]) completed++;
                else qaza++;
            });
        }
    }

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    const progressFill = document.getElementById("progressFill");
    progressFill.style.width = percent + "%";
    progressFill.style.boxShadow = `0 0 20px rgba(255, 215, 0, ${percent/100})`;

    document.getElementById("progressText").innerText = percent + "% Completed This Month";
    document.getElementById("qazaCount").innerText = qaza;
}

// Render prayer cards
const container = document.getElementById("prayerContainer");
container.innerHTML = "";
prayers.forEach((prayer, index) => {
    const div = document.createElement("div");
    div.className = "prayer-box";
    div.style.animation = `fadeIn 0.5s ease forwards ${index*0.2}s`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = data[gregorianDate][prayer];

    checkbox.addEventListener("change", () => {
        data[gregorianDate][prayer] = checkbox.checked;
        saveData();
        updateProgress();
        generateChart(data);
    });

    div.innerHTML = `<label>${prayer}</label> `;
    div.appendChild(checkbox);
    container.appendChild(div);
});

// History
function showHistory() {
    const historyDiv = document.getElementById("historySection");
    historyDiv.innerHTML = "<h3>History</h3>";
    Object.keys(data).sort().reverse().forEach(date => {
        let row = `<p><strong>${date}</strong> : `;
        prayers.forEach(p => row += data[date][p] ? "✅ " : "❌ ");
        row += "</p>";
        historyDiv.innerHTML += row;
    });
}

// Notifications
if ("Notification" in window) Notification.requestPermission();
setTimeout(() => {
    if (Notification.permission === "granted") {
        new Notification("Namaz Reminder", { body: "Have you completed your prayers today?" });
    }
}, 3000);

// Initialize
saveData();
updateProgress();
generateChart(data);

// PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
      }
