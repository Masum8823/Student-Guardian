let currentUser = JSON.parse(sessionStorage.getItem('activeUser'));

if (!currentUser) {
    window.location.href = 'index.html';
}

let userLogs = JSON.parse(localStorage.getItem(`logs_${currentUser.email}`)) || [];

window.onload = () => {
    document.getElementById('userNameDisp').innerText = currentUser.name;
    document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=002663&color=fff`;
    
    const dateInput = document.getElementById('logDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    calculateScore();
};

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('sidebar-active', 'text-[#002663]');
        btn.classList.add('text-gray-400');
    });

    document.getElementById(`${tabId}Tab`).classList.add('active');
    document.getElementById(`nav-${tabId}`).classList.add('sidebar-active', 'text-[#002663]');
    document.getElementById(`nav-${tabId}`).classList.remove('text-gray-400');

    if (tabId === 'analytics') updateAnalytics();
    if (tabId === 'history') renderHistoryList();
}

function togglePrayer(btn) {
    btn.classList.toggle('p-btn-active');
    calculateScore();
}

function calculateScore() {
    const study = parseFloat(document.getElementById('hrsStudy').value) || 0;
    const walk = parseFloat(document.getElementById('hrsWalk').value) || 0;
    const hobby = parseFloat(document.getElementById('hrsHobby').value) || 0;
    const screen = parseFloat(document.getElementById('hrsScreen').value) || 0;
    const waste = parseFloat(document.getElementById('hrsWaste').value) || 0;
    const sleep = parseFloat(document.getElementById('hrsSleep').value) || 0;

    const prayerCount = document.querySelectorAll('.p-btn-active').length;

    const positivePoints = (study * 10) + (walk * 12) + (hobby * 8) + (prayerCount * 5) + (sleep * 5);
    const negativePoints = (screen * 15) + (waste * 5);

    const netScore = Math.round(positivePoints - negativePoints);

    const scoreDisplay = document.getElementById('liveScore');
    scoreDisplay.innerText = netScore;

    if (netScore < 0) {
        scoreDisplay.style.color = "#ef4444";
    } else {
        scoreDisplay.style.color = "white";
    }

    return {
        study,
        walk,
        hobby,
        screen,
        waste,
        sleep,
        prayers: prayerCount,
        score: netScore
    };
}

function saveLog() {
    const selectedDate = document.getElementById('logDate').value;

    if (!selectedDate) {
        alert("Please select a date!");
        return;
    }

    const data = calculateScore();

    const formattedDate = new Date(selectedDate).toLocaleDateString('en-GB');

    const newEntry = {
        id: Date.now(),
        rawDate: selectedDate,
        displayDate: formattedDate,
        ...data,
        timestamp: new Date(selectedDate).getTime()
    };

    userLogs = userLogs.filter(log => log.rawDate !== selectedDate);

    userLogs.push(newEntry);

    userLogs.sort((a, b) => b.timestamp - a.timestamp);

    localStorage.setItem(`logs_${currentUser.email}`, JSON.stringify(userLogs));

    alert(`Success! Your data for ${formattedDate} has been saved.`);

    calculateScore();
}

function updateAnalytics() {
    if (userLogs.length === 0) return;

    const totalDays = userLogs.length;

    const sumScore = userLogs.reduce((acc, curr) => acc + curr.score, 0);
    const sumStudy = userLogs.reduce((acc, curr) => acc + curr.study, 0);

    const avgScore = sumScore / totalDays;

    document.getElementById('statAvgScore').innerText = Math.round(avgScore);
    document.getElementById('statDays').innerText = totalDays + "d";
    document.getElementById('statPeakStudy').innerText = Math.max(...userLogs.map(l => l.study)) + "h";

    let level = "Balanced";
    let advice = "You are maintaining a steady routine. Consistency is the key!";

    if (avgScore < 0) {
        level = "High Burnout";
        advice = "Urgent: Your screen time and wasted hours are draining your energy. Focus on sleep and walking.";
    } else if (avgScore > 100) {
        level = "Elite Performer";
        advice = "MashaAllah! You are in an optimal productivity zone. Ensure you take small breaks to avoid future fatigue.";
    } else if (avgScore < 40) {
        level = "Borderline Risk";
        advice = "You're doing okay, but try to increase your study hours and reduce passive screen usage.";
    }

    document.getElementById('statLevel').innerText = level;
    document.getElementById('smartAdvice').innerText = advice;
}

function renderHistoryList() {
    const listContainer = document.getElementById('historyList');

    if (userLogs.length === 0) {
        listContainer.innerHTML = `<p class="text-gray-400 p-4 text-center">No history recorded yet.</p>`;
        return;
    }

    listContainer.innerHTML = userLogs.map((log, index) => `
        <div onclick="viewHistoryDetail(${index})" class="group p-5 mb-3 bg-gray-50 rounded-2xl cursor-pointer hover:bg-blue-600 transition-all">
            <p class="text-[10px] font-bold text-blue-900 group-hover:text-blue-100 uppercase tracking-widest">${log.displayDate}</p>

            <div class="flex justify-between items-center mt-1">
                <p class="font-black text-blue-950 group-hover:text-white text-lg">Score: ${log.score}</p>

                <i class="fas fa-chevron-right text-gray-300 group-hover:text-white text-xs"></i>
            </div>
        </div>
    `).join('');
}

function viewHistoryDetail(index) {
    const log = userLogs[index];

    const detailContainer = document.getElementById('historyDetail');

    detailContainer.innerHTML = `
        <div class="animate-in fade-in duration-500">

            <div class="flex justify-between items-start mb-8">

                <div>
                    <h2 class="text-4xl font-black text-blue-950">${log.displayDate}</h2>

                    <p class="text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Daily Detailed Report
                    </p>
                </div>

                <div class="text-right">
                    <p class="text-xs font-bold text-gray-400 mb-1">FINAL SCORE</p>

                    <h1 class="text-6xl font-black text-blue-600">${log.score}</h1>
                </div>

            </div>

            <div class="grid grid-cols-2 gap-6">

                <div class="p-6 bg-blue-50 rounded-3xl border border-blue-100">

                    <p class="text-sm font-bold text-blue-400 mb-4 uppercase">
                        Productivity
                    </p>

                    <div class="space-y-3">

                        <div class="flex justify-between">
                            <span>📖 Study Time</span>
                            <b>${log.study}h</b>
                        </div>

                        <div class="flex justify-between">
                            <span>🚶 Walking</span>
                            <b>${log.walk}h</b>
                        </div>

                        <div class="flex justify-between">
                            <span>🎨 Hobbies</span>
                            <b>${log.hobby}h</b>
                        </div>

                    </div>

                </div>

                <div class="p-6 bg-orange-50 rounded-3xl border border-orange-100">

                    <p class="text-sm font-bold text-orange-400 mb-4 uppercase">
                        Recovery & Health
                    </p>

                    <div class="space-y-3">

                        <div class="flex justify-between">
                            <span>😴 Sleep</span>
                            <b>${log.sleep}h</b>
                        </div>

                        <div class="flex justify-between">
                            <span>🕌 Prayers</span>
                            <b>${log.prayers}/5</b>
                        </div>

                        <div class="flex justify-between text-red-500">
                            <span>📱 Screen Time</span>
                            <b>${log.screen}h</b>
                        </div>

                    </div>

                </div>

            </div>

            <div class="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">

                <p class="text-sm font-bold text-gray-400 mb-2 uppercase">
                    System Insight
                </p>

                <p class="text-lg text-gray-700 font-medium italic">
                    "On this day, your ${log.study > 5 ? 'focus was exceptional' : 'activity was balanced'}. Keep tracking to improve."
                </p>

            </div>

        </div>
    `;
}

function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
        sessionStorage.removeItem('activeUser');
        window.location.href = 'index.html';
    }
}