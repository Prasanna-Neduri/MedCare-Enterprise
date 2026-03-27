const app = {
    registry: JSON.parse(localStorage.getItem('med_registry')) || {
        "City General": ["Dr. Smith"],
        "St. Marys Medical": ["Dr. Sarah"],
        "Sunrise Wellness": ["Dr. Varma"]
    },
    user: null,
    apps: JSON.parse(localStorage.getItem('med_apps')) || [],
    revs: JSON.parse(localStorage.getItem('med_revs')) || [],

    toggleHospField: function() {
        const role = document.getElementById('auth-role').value;
        document.getElementById('hosp-select-group').classList.toggle('hidden', role !== 'doctor');
    },

    filterDoctors: function(hospId, docId) {
        const hosp = document.getElementById(hospId).value;
        const docSelect = document.getElementById(docId);
        docSelect.innerHTML = '<option value="">-- Select Specialist --</option>';
        if (hosp && this.registry[hosp]) {
            docSelect.disabled = false;
            this.registry[hosp].forEach(d => {
                docSelect.innerHTML += `<option value="${d}">${d}</option>`;
            });
        } else {
            docSelect.disabled = true;
            docSelect.innerHTML = "<option>Select hospital first</option>";
        }
    },

    handleLogin: function() {
        const name = document.getElementById('auth-user').value;
        const role = document.getElementById('auth-role').value;
        const pass = document.getElementById('auth-pass').value;
        if (!name || !pass) return alert("All fields are required.");

        this.user = { name, role };
        if(role === 'doctor') {
            const hosp = document.getElementById('auth-hosp').value;
            this.user.hospital = hosp;
            if(!this.registry[hosp].includes(name)) {
                this.registry[hosp].push(name);
                localStorage.setItem('med_registry', JSON.stringify(this.registry));
            }
        }
        document.getElementById('view-auth').classList.add('hidden');
        document.getElementById('sidebar').classList.remove('hidden');
        document.getElementById('view-dash').classList.remove('hidden');
        document.getElementById('nav-name').innerText = name;
        document.getElementById('nav-role').innerText = role.toUpperCase();
        document.getElementById('nav-avatar').innerText = name[0].toUpperCase();
        this.renderNav();
        this.switchPane(role === 'patient' ? 'pane-booking' : 'pane-history');
    },

    renderNav: function() {
        const nav = document.getElementById('nav-links');
        nav.innerHTML = this.user.role === 'patient' ? 
            `<button onclick="app.switchPane('pane-booking')">📅 Book Appointment</button>
             <button onclick="app.switchPane('pane-history')">📜 History</button>
             <button onclick="app.switchPane('pane-reviews')">⭐ Feedback</button>` :
            `<button onclick="app.switchPane('pane-history')">📋 Patient Queue</button>
             <button onclick="app.switchPane('pane-reviews')">⭐ My Reviews</button>`;
    },

    switchPane: function(id) {
        document.querySelectorAll('.pane').forEach(p => p.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
        if(id === 'pane-history') this.renderHistory();
        if(id === 'pane-reviews') this.renderReviews();
    },

    processBooking: function() {
        const hosp = document.getElementById('book-hosp').value;
        const doc = document.getElementById('book-doc').value;
        const reason = document.getElementById('book-reason').value;
        const pay = document.querySelector('input[name="pay"]:checked').value;
        if(!doc || !reason) return alert("Fill all details including the Reason for Visit.");

        this.apps.push({ patient: this.user.name, doctor: doc, hospital: hosp, reason: reason, pay: pay, date: new Date().toLocaleString() });
        localStorage.setItem('med_apps', JSON.stringify(this.apps));
        alert("Booking Confirmed!");
        document.getElementById('book-reason').value = "";
        this.switchPane('pane-history');
    },

    renderHistory: function() {
        const list = document.getElementById('history-list');
        const data = this.user.role === 'patient' ? this.apps.filter(a => a.patient === this.user.name) : this.apps.filter(a => a.doctor === this.user.name);
        list.innerHTML = data.map(a => `
            <div class="glass-module">
                <h4>${this.user.role === 'patient' ? "Doctor: " + a.doctor : "Patient: " + a.patient}</h4>
                <p style="color:var(--accent); margin: 8px 0;"><strong>Reason:</strong> ${a.reason}</p>
                <small>${a.hospital} | ${a.date} | Method: ${a.pay}</small>
            </div>
        `).join('') || "<p>No clinical records.</p>";
    },

    submitReview: function() {
        const hosp = document.getElementById('rev-hosp').value;
        const doc = document.getElementById('rev-doc').value;
        const body = document.getElementById('rev-body').value;
        if(!body || !doc) return alert("Complete the review fields.");
        this.revs.unshift({ name: this.user.name, hospital: hosp, doctor: doc, body: body });
        localStorage.setItem('med_revs', JSON.stringify(this.revs));
        document.getElementById('rev-body').value = "";
        this.renderReviews();
    },

    renderReviews: function() {
        const inputArea = document.getElementById('review-input-area');
        const listArea = document.getElementById('review-list');
        if(this.user.role === 'patient') {
            inputArea.innerHTML = `<div class="glass-module"><h3>Submit Feedback</h3><select id="rev-hosp" onchange="app.filterDoctors('rev-hosp', 'rev-doc')"><option value="">-- Facility --</option><option value="City General">City General Hospital</option><option value="St. Marys Medical">St. Marys Medical Center</option><option value="Sunrise Wellness">Sunrise Wellness Clinic</option></select><select id="rev-doc" disabled><option>Doctor</option></select><textarea id="rev-body" placeholder="Your review..."></textarea><button class="btn-primary" onclick="app.submitReview()">Post</button></div>`;
        } else {
            inputArea.innerHTML = `<div class="glass-module"><h3>Reviews for ${this.user.name}</h3></div>`;
        }
        const filtered = this.user.role === 'doctor' ? this.revs.filter(r => r.doctor === this.user.name) : this.revs;
        listArea.innerHTML = filtered.map(r => `<div class="glass-module"><strong>${r.name} → ${r.doctor}</strong><p>${r.body}</p></div>`).join('');
    }
};