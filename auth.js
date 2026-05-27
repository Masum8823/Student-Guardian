// User Authentication System
document.getElementById('regForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value.toLowerCase().trim();
    const pass = document.getElementById('regPass').value;

    let users = JSON.parse(localStorage.getItem('sg_users')) || [];
    if(users.find(u => u.email === email)) {
        return alert("User already exists!");
    }

    users.push({ name, email, pass });
    localStorage.setItem('sg_users', JSON.stringify(users));
    alert("Registration Successful!");
    toggleView('login');
});

document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.toLowerCase().trim();
    const pass = document.getElementById('loginPass').value;

    let users = JSON.parse(localStorage.getItem('sg_users')) || [];
    const user = users.find(u => u.email === email && u.pass === pass);

    if(user) {
        sessionStorage.setItem('activeUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        alert("Invalid credentials!");
    }
});

function toggleView(view) {
    document.getElementById('loginSection').classList.toggle('hidden', view === 'reg');
    document.getElementById('regSection').classList.toggle('hidden', view === 'login');
}