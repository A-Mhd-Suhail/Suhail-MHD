/* ============================================================
   MHD HOSPITAL — PATIENT PORTAL MODULE
   Restored implementations of the render functions that were
   missing from app.js (they were warning stubs before).
   Loaded after i18n.js, before app.js. Uses globals from both.
   ============================================================ */

/* ---------- DOCTOR DROPDOWN (booking) ---------- */
function renderDoctorDropdown() {
  const sel = document.getElementById('apDoctor'); if (!sel || ROLE !== 'patient') return;
  const cur = sel.value;
  sel.innerHTML = STATE.doctors.map(d => '<option value="' + d.id + '">👨‍⚕️ Dr. ' + esc(d.name) + ' — ' + esc(d.specialization || '') + '</option>').join('') || '<option value="">No doctors registered yet</option>';
  if (cur && STATE.doctors.some(d => d.id === cur)) sel.value = cur;
  const de = document.getElementById('apDate');
  if (de && !de.value) de.value = todayStr();
  loadTakenSlots();
}

/* ---------- SLOT LOADING (double-booking protection) ---------- */
const SLOT_TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
async function loadTakenSlots() {
  if (ROLE !== 'patient') return;
  const box = document.getElementById('apSlots'); if (!box) return;
  const docId = (document.getElementById('apDoctor') || {}).value;
  const date = (document.getElementById('apDate') || {}).value || todayStr();
  chosenSlot = null;
  if (!docId) { box.innerHTML = '<span class="muted sm-txt">No doctors available yet.</span>'; return; }
  let taken = [];
  try {
    const s = await db.collection('appointments')
      .where('doctorId', '==', docId).where('date', '==', date).where('status', '==', 'upcoming').get();
    taken = s.docs.map(d => d.data().time);
  } catch (e) { console.error(e); }
  box.innerHTML = SLOT_TIMES.map(tm => {
    const busy = taken.includes(tm);
    return '<button type="button" class="chip slot' + (busy ? ' taken' : '') + '" data-slot="' + tm + '"' + (busy ? ' disabled' : '') + '>' + (busy ? '🔒 ' : '') + tm + '</button>';
  }).join('');
}
document.addEventListener('click', e => {
  const s = e.target.closest('[data-slot]');
  if (!s || s.disabled) return;
  chosenSlot = s.dataset.slot;
  document.querySelectorAll('[data-slot]').forEach(x => x.classList.remove('active'));
  s.classList.add('active');
});
document.addEventListener('change', e => {
  if (e.target && (e.target.id === 'apDoctor' || e.target.id === 'apDate')) loadTakenSlots();
});
document.addEventListener('click', async e => {
  if (!e.target.closest('[data-act="book-appt"]')) return;
  const docId = (document.getElementById('apDoctor') || {}).value;
  const date = (document.getElementById('apDate') || {}).value;
  const reason = (document.getElementById('apReason') || {}).value || '';
  const type = (document.getElementById('apType') || {}).value || 'Follow-up Checkup';
  const doc = STATE.doctors.find(d => d.id === docId);
  if (!doc) return toast('⚠️ Select a doctor first.');
  if (!date) return toast('⚠️ Select a date.');
  if (!chosenSlot) return toast('⚠️ Pick an available time slot.');
  const slotId = (docId + '_' + date + '_' + chosenSlot).replace(/[^a-zA-Z0-9]/g, '_');
  try {
    /* ACID-style lock: create the slot doc first; failure = someone else booked it */
    await db.collection('slots').doc(slotId).set({ doctorId: docId, date, time: chosenSlot, patientId: ME.id, createdAt: Date.now() });
    await db.collection('appointments').add({
      patientId: ME.id, patientName: ME.name, healthId: ME.healthId,
      doctorId: docId, doctorName: 'Dr. ' + doc.name, hospital: doc.hospital || '',
      date, time: chosenSlot, type, reason, status: 'upcoming', createdAt: Date.now()
    });
    await db.collection('timeline').add({ patientId: ME.id, date, type: 'appointment', icon: '📅', title: 'Appointment booked — Dr. ' + doc.name, description: type + ' at ' + chosenSlot, createdAt: Date.now() });
    await notify(docId, '📅 New Appointment', ME.name + ' booked ' + type + ' on ' + fmtD(date) + ' at ' + chosenSlot + '.');
    document.getElementById('apReason').value = '';
    toast('✅ Appointment confirmed — 🎟️ queue number assigned');
    loadTakenSlots();
  } catch (err) {
    toast('⚠️ That slot was just taken — pick another.');
    loadTakenSlots();
  }
});

/* ---------- APPOINTMENTS PAGE ---------- */
document.addEventListener('click', e => {
  const tab = e.target.closest('[data-aptab]');
  if (!tab) return;
  document.querySelectorAll('[data-aptab]').forEach(x => x.classList.remove('active'));
  tab.classList.add('active');
  CURRENT_APTAB = tab.dataset.aptab;
  renderAppts();
});
function renderAppts() {
  const el = document.getElementById('apList'); if (!el || ROLE !== 'patient') return;
  const list = STATE.appts.filter(a => (a.status || 'upcoming') === CURRENT_APTAB);
  el.innerHTML = list.map(a => {
    const q = a.status === 'upcoming' ? queueNumberOf(a) : null;
    return '<div class="list-item"><div class="li-main"><b>👨‍⚕️ ' + esc(a.doctorName || '') + (q ? ' <span class="queue-chip">🎟️ Q#' + q + '</span>' : '') + '</b>' +
      '<small>' + fmtD(a.date) + ' • ' + esc(a.time || '') + ' • ' + esc(a.type || '') + (a.hospital ? ' • ' + esc(a.hospital) : '') + '</small></div>' +
      '<div class="li-actions"><span class="chip ' + (a.status === 'upcoming' ? 'blue' : a.status === 'completed' ? 'green' : 'red') + '">' + esc(a.status) + '</span>' +
      (a.status === 'upcoming' ? '<button class="btn danger sm" data-act="cancel-appt" data-id="' + a.id + '">Cancel</button>' : '') +
      '</div></div>';
  }).join('') || '<p class="muted">' + (CURRENT_APTAB === 'upcoming' ? t('noUpcomingAppts') : 'Nothing here yet.') + '</p>';
}

/* ---------- MY MEDICINES (self-add + stop/restart + mark taken) ---------- */
function renderMeds() {
  const el = document.getElementById('medList'); if (!el || ROLE !== 'patient') return;
  const today = todayStr();
  el.innerHTML = STATE.meds.map(m => {
    const active = m.active !== false;
    const taken = m.takenDates && m.takenDates[today];
    return '<div class="list-item"><div class="li-main"><b>💊 ' + esc(m.name) + '</b>' +
      '<small>' + esc(m.dosage || '') + ' • from ' + fmtD(m.startDate) + (m.durationDays ? ' • ' + esc(m.durationDays) + ' days' : '') + (m.prescribedBy ? ' • by ' + esc(m.prescribedBy) : '') + '</small></div>' +
      '<div class="li-actions">' + medChip(m) +
      (active && !taken ? '<button class="btn ghost sm" data-act="mark-taken" data-id="' + m.id + '">✅ Mark Taken</button>' : '') +
      (taken ? '<span class="chip green">✓ Taken today</span>' : '') +
      '<button class="btn ghost sm" data-act="' + (active ? 'stop-med' : 'restart-med') + '" data-id="' + m.id + '">' + (active ? '⏹️ Stop' : '▶️ Restart') + '</button>' +
      '</div></div>';
  }).join('') || '<p class="muted">No medicines yet — add the ones you take below.</p>';
}
document.addEventListener('click', async e => {
  const am = e.target.closest('[data-act="add-med"]');
  if (am) {
    const name = (document.getElementById('mName') || {}).value || '';
    const dose = (document.getElementById('mDose') || {}).value || '';
    const start = (document.getElementById('mStart') || {}).value || todayStr();
    const dur = (document.getElementById('mDur') || {}).value || '';
    if (!name.trim()) return toast('⚠️ Enter the medicine name.');
    try {
      await db.collection('medicines').add({ patientId: ME.id, name: name.trim(), dosage: dose.trim(), startDate: start, durationDays: dur, prescribedBy: ME.name + ' (self-reported)', verified: false, source: 'patient', active: true, createdAt: Date.now() });
      document.getElementById('mName').value = ''; document.getElementById('mDose').value = ''; document.getElementById('mDur').value = '';
      toast('✅ Medicine added — awaiting doctor verification');
    } catch (err) { toast('⚠️ ' + errMsg(err)); }
    return;
  }
  const st = e.target.closest('[data-act="stop-med"], [data-act="restart-med"]');
  if (st) {
    const active = st.dataset.act === 'restart-med';
    db.collection('medicines').doc(st.dataset.id).update({ active }).catch(() => {});
    toast(active ? '▶️ Medicine restarted' : '⏹️ Medicine stopped — your doctor can see this');
    return;
  }
  const mt = e.target.closest('[data-act="mark-taken"]');
  if (mt) {
    try {
      await db.collection('medicines').doc(mt.dataset.id).update({ ['takenDates.' + todayStr()]: true });
      toast('✅ Marked as taken today');
    } catch (err) { toast('⚠️ ' + errMsg(err)); }
  }
});

/* ---------- MY RESULTS ---------- */
function renderResults() {
  if (ROLE !== 'patient') return;
  const sum = document.getElementById('resSummary'), list = document.getElementById('repList');
  const rs = STATE.reports || [];
  if (sum) sum.innerHTML = kvRows([
    ['Total results', rs.length],
    ['Verified ✓', rs.filter(r => r.verified).length],
    ['Latest result', rs[0] ? (esc(rs[0].title) + ' • ' + fmtD(rs[0].date)) : '—']
  ]);
  if (list) list.innerHTML = rs.map(r =>
    '<div class="list-item"><div class="li-main"><b>' + (r.fileData ? '📄' : '🧪') + ' ' + esc(r.title || r.type || 'Result') + '</b>' +
    '<small>' + esc(r.type || '') + ' • ' + fmtD(r.date) + (r.hospital ? ' • ' + esc(r.hospital) : '') + (r.doctor ? ' • ' + esc(r.doctor) : '') + '</small></div>' +
    '<div class="li-actions">' + docStatusChip(r) +
    '<button class="btn ghost sm" data-act="view-doc" data-id="' + r.id + '">👁️ View Detail</button></div></div>'
  ).join('') || '<p class="muted">No results yet — they appear here the moment your doctor or hospital adds them.</p>';
}

/* ---------- MY CASE (new case form + history + profile sections) ---------- */
const NC_FIELDS = ['ncComplaint', 'ncSymptoms', 'ncDuration', 'ncPrevTx', 'ncExisting', 'ncMeds', 'ncAllergy', 'ncSurgery', 'ncFamily', 'ncOther'];
let ncAreasSel = new Set();
function draftKey() { return 'mhd_draft_' + (ME ? ME.id : 'anon'); }
function saveDraft() {
  const d = {};
  NC_FIELDS.forEach(id => { const el = document.getElementById(id); if (el && el.value.trim()) d[id] = el.value; });
  try { localStorage.setItem(draftKey(), JSON.stringify({ fields: d, areas: [...ncAreasSel], at: Date.now() })); } catch (e) {}
  const dn = document.getElementById('draftNote');
  if (dn && Object.keys(d).length) dn.textContent = '💾 Draft auto-saved';
}
document.addEventListener('input', e => {
  if (NC_FIELDS.includes(e.target.id)) saveDraft();
});
document.addEventListener('click', e => {
  const chip = e.target.closest('#ncAreas .chip');
  if (!chip) return;
  chip.classList.toggle('active');
  if (chip.classList.contains('active')) ncAreasSel.add(chip.dataset.area); else ncAreasSel.delete(chip.dataset.area);
  saveDraft();
});
document.addEventListener('click', async e => {
  if (!e.target.closest('[data-act="submit-case"]')) return;
  const g = id => ((document.getElementById(id) || {}).value || '').trim();
  const complaint = g('ncComplaint');
  if (!complaint) return toast('⚠️ Please describe your chief complaint (question 1).');
  const c = {
    patientId: ME.id, patientName: ME.name, healthId: ME.healthId,
    chiefComplaint: complaint, symptoms: g('ncSymptoms'), area: [...ncAreasSel].join(', '),
    duration: g('ncDuration'), severity: (document.getElementById('ncSeverity') || {}).value || '',
    prevTreatment: g('ncPrevTx'), existing: g('ncExisting'), currentMeds: g('ncMeds'),
    allergyNote: g('ncAllergy'), surgeryNote: g('ncSurgery'), familyHistory: g('ncFamily'), other: g('ncOther'),
    status: 'waiting', createdAt: Date.now()
  };
  try {
    await db.collection('cases').add(c);
    await db.collection('timeline').add({ patientId: ME.id, date: todayStr(), type: 'case', icon: '📝', title: 'New case submitted', description: complaint, createdAt: Date.now() });
    await notifyRole('doctor', '🟡 New Case Waiting', ME.name + ' (' + (ME.healthId || '') + '): ' + complaint.slice(0, 60));
    NC_FIELDS.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    ncAreasSel = new Set();
    document.querySelectorAll('#ncAreas .chip').forEach(x => x.classList.remove('active'));
    try { localStorage.removeItem(draftKey()); } catch (err) {}
    const dn = document.getElementById('draftNote'); if (dn) dn.textContent = '';
    toast('✅ Case submitted — your doctor has been notified');
  } catch (err) { toast('⚠️ ' + errMsg(err)); }
});
function renderMyCase() {
  if (ROLE !== 'patient') return;
  /* current status */
  const st = document.getElementById('myCaseStatus');
  const waiting = STATE.cases.filter(c => c.status === 'waiting');
  const reviewed = STATE.cases.filter(c => c.status === 'reviewed');
  if (st) {
    if (waiting.length) st.innerHTML = '<div class="banner amber">🟡 Case waiting for doctor review: <b>' + esc(waiting[0].chiefComplaint) + '</b> — submitted ' + fmtDT(waiting[0].createdAt) + '</div>';
    else if (reviewed.length) {
      const c = reviewed[0];
      st.innerHTML = '<div class="banner">🟩 Latest case reviewed by <b>Dr. ' + esc(c.doctorName || '') + '</b>' +
        (c.doctorNotes ? ' — ' + esc(c.doctorNotes.slice(0, 120)) : '') +
        (c.followupDays ? ' • follow-up in ' + esc(c.followupDays) + ' days' : '') + '</div>';
    } else st.innerHTML = '';
  }
  /* restore draft */
  try {
    const d = JSON.parse(localStorage.getItem(draftKey()) || 'null');
    if (d) {
      NC_FIELDS.forEach(id => { const el = document.getElementById(id); if (el && d.fields[id]) el.value = d.fields[id]; });
      ncAreasSel = new Set(d.areas || []);
      ncAreasSel.forEach(a => { const chip = document.querySelector('#ncAreas .chip[data-area="' + a + '"]'); if (chip) chip.classList.add('active'); });
      const dn = document.getElementById('draftNote'); if (dn && Object.keys(d.fields || {}).length) dn.textContent = '💾 Draft restored';
    }
  } catch (e) {}
  /* history */
  const ch = document.getElementById('caseHistory');
  if (ch) ch.innerHTML = STATE.cases.map(c =>
    '<div class="list-item"><div class="li-main"><b>' + esc(c.chiefComplaint) + '</b>' +
    '<small>Submitted ' + fmtDT(c.createdAt) + (c.duration ? ' • ' + esc(c.duration) : '') + (c.severity ? ' • ' + esc(c.severity) : '') + '</small></div>' +
    (c.status === 'reviewed'
      ? '<span class="chip green">🟩 Dr. ' + esc(c.doctorName || '') + (c.tests ? ' • ' + esc(c.tests.slice(0, 30)) : '') + '</span>'
      : '<span class="chip amber">🟡 Waiting</span>') +
    '</div>').join('') || '<p class="muted">No cases yet — submit your first case above 🚀</p>';
  /* profile sections */
  const sp = document.getElementById('secPersonal');
  if (sp) sp.innerHTML = kvRows([
    ['Health ID', ME.healthId], ['Full Name', ME.name], ['Date of Birth', fmtD(ME.dob) + ' (' + ageOf(ME.dob) + ')'],
    ['Gender', ME.gender], ['Blood Group', ME.bloodGroup], ['Phone', ME.phone], ['Address', ME.address],
    ['Emergency Contact', (ME.emergencyName || '—') + ' ' + (ME.emergencyPhone || '')]
  ]);
  const sm = document.getElementById('secMedical');
  if (sm) sm.innerHTML = kvRows([
    ['Existing Conditions', ME.conditions || 'None'], ['Accidents', ME.accidents || 'None'],
    ['Family History', ME.familyHistory || 'None'], ['Height / Weight', (ME.heightCm || '—') + ' cm • ' + (ME.weightKg || '—') + ' kg'],
    ['Annual Income', ME.income ? '₹' + ME.income : '—']
  ]);
  const sa = document.getElementById('secAllergy');
  if (sa) sa.innerHTML = (ME.allergies ? '<p>' + esc(ME.allergies) + '</p>' : '<p class="muted">None recorded</p>');
  const ss = document.getElementById('secSurgery');
  if (ss) ss.innerHTML = (ME.surgeries ? ME.surgeries.split('\n').filter(Boolean).map(l => '<p>🔪 ' + esc(l) + '</p>').join('') : '<p class="muted">None recorded</p>');
  const smed = document.getElementById('secMeds');
  if (smed) smed.innerHTML = STATE.meds.map(m => '<li>' + esc(m.name) + ' <small class="muted">' + esc(m.dosage || '') + '</small> ' + medChip(m) + '</li>').join('') || '<li class="muted">None</li>';
  const sv = document.getElementById('secVisits');
  if (sv) sv.innerHTML = STATE.timeline.filter(x => ['consult', 'report', 'appointment'].includes(x.type)).slice(0, 10).map(x => '<li>' + (x.icon || '•') + ' ' + esc(x.title) + ' <small class="muted">' + fmtD(x.date) + '</small></li>').join('') || '<li class="muted">None yet</li>';
}

/* ---------- PATIENT DASHBOARD ---------- */
const STAT_ICONS = {
  meds: '<svg viewBox="0 0 24 24" class="st-ico" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10.5 20.5l-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"/><path d="M8.5 8.5l7 7"/></svg>',
  appts: '<svg viewBox="0 0 24 24" class="st-ico" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/></svg>',
  results: '<svg viewBox="0 0 24 24" class="st-ico" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h6M9 16h4"/></svg>',
  msgs: '<svg viewBox="0 0 24 24" class="st-ico" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>'
};
function renderPatientDash() {
  if (ROLE !== 'patient' || !ME) return;
  const today = todayStr();
  /* greeting + ID */
  const hEl = document.getElementById('dGreet');
  if (hEl) {
    const h = new Date().getHours();
    hEl.textContent = (h < 12 ? t('greetM') : h < 17 ? t('greetA') : t('greetE')) + ', ' + ME.name + ' \ud83d\ude4b';
  }
  const hid = document.getElementById('dHid'); if (hid) hid.textContent = ME.healthId || 'MHD-XXXXXX';
  /* case review banner */
  const rb = document.getElementById('reviewBanner');
  const waiting = STATE.cases.filter(c => c.status === 'waiting');
  if (rb) {
    if (waiting.length) { rb.classList.remove('hidden'); rb.innerHTML = '\ud83d\udfe1 <b>' + t('waitingReview') + '</b> \u2014 ' + esc(waiting[0].chiefComplaint) + ' \u2022 ' + fmtDT(waiting[0].createdAt); }
    else rb.classList.add('hidden');
  }
  /* health status bar */
  const total = STATE.cases.length, rev = STATE.cases.filter(c => c.status === 'reviewed').length;
  const pct = total ? Math.round((rev / total) * 100) : 0;
  const fill = document.getElementById('statusFill'); if (fill) fill.style.width = pct + '%';
  const spct = document.getElementById('statusPct'); if (spct) spct.textContent = pct + '%';
  const rmsg = document.getElementById('recoMsg');
  if (rmsg) rmsg.textContent = !total ? t('recoStart') : (pct >= 100 ? t('recoGreat') : t('recoDoing'));
  /* next appointment */
  const na = STATE.appts.filter(a => a.status === 'upcoming' && a.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const nac = document.getElementById('nextApptCard');
  if (nac) {
    if (na) {
      const q = queueNumberOf(na);
      nac.classList.remove('muted');
      nac.innerHTML = '<b>\ud83d\udc69\u200d\u2695\ufe0f Dr. ' + esc(na.doctorName) + '</b><br><small>' + fmtD(na.date) + ' \u2022 ' + esc(na.time) + (q ? ' \u2022 \ud83c\udfab Q#' + q : '') + '</small><br><small>' + esc(na.type || '') + '</small>';
    } else { nac.classList.add('muted'); nac.textContent = t('noUpcomingAppts'); }
  }
  /* mini stats */
  const ms = document.getElementById('miniStats');
  if (ms) ms.innerHTML = [
    ['meds', 'mc-blue', t('meds'), STATE.meds.filter(m => m.active !== false).length, t('activeSub'), 'p-meds'],
    ['appts', 'mc-green', t('appts'), STATE.appts.filter(a => a.status === 'upcoming' && a.date >= today).length, t('upcomingSub'), 'p-appts'],
    ['results', 'mc-amber', t('results'), STATE.reports.length, t('totalSub'), 'p-results'],
    ['msgs', 'mc-red', t('chats'), STATE.notifs.filter(n => !n.read).length, t('unreadSub'), ROLE === 'patient' ? 'p-notifs' : 'd-chats']
  ].map(([ico, cls, label, val, sub, nav]) =>
    '<div class="mini-card stat-click" data-nav="' + nav + '"><span class="mc-ico ' + cls + '">' + STAT_ICONS[ico] + '</span><span><span class="mc-label">' + label + '</span><b>' + val + '</b><small>' + sub + '</small></span></div>').join('');
  /* today's medications table */
  const ts = document.getElementById('todaySchedule');
  if (ts) {
    const rows = buildTodaySchedule().map(it => {
      const isAppt = it.ico === '\ud83d\udcc5';
      const status = isAppt ? '<span class="chip blue">' + t('upcomingTab') + '</span>'
        : (it.status === 'taken' ? '<span class="st-done">\u25cf ' + t('takenLbl') + '</span>'
        : (it.sub && it.sub.indexOf('\ud83d\udfe9') === 0 ? '<span class="st-ok">\u25cf ' + t('verifiedLbl') + '</span>' : '<span class="st-pend">\u25cf ' + t('pendingLbl') + '</span>'));
      const action = (!isAppt && it.medId && it.status !== 'taken') ? '<button class="btn ghost sm" data-act="mark-taken" data-id="' + it.medId + '">' + t('markTaken') + '</button>' : '';
      const inst = isAppt ? it.sub : (it.sub.split('\u2022').slice(1).join('\u2022').trim() || it.sub);
      return '<div class="mt-row"><span class="mt-time">' + esc(it.time) + '</span><span class="mt-item">' + esc(it.title.replace(/^[^\u2014]*\u2014\s*/, '')) + '</span><span class="mt-inst">' + esc(inst) + '</span><span class="mt-status">' + status + '</span><span class="mt-act">' + action + '</span></div>';
    });
    ts.innerHTML = rows.join('') || '<p class="muted" style="padding:8px 2px">Nothing scheduled today \u2014 rest well!</p>';
  }
  /* follow-up banner */
  const fb = document.getElementById('followBanner');
  const fu = STATE.timeline.filter(x => x.type === 'followup' && x.due && x.due >= today).sort((a, b) => a.due.localeCompare(b.due))[0];
  if (fb) {
    if (fu) { fb.classList.remove('hidden'); fb.innerHTML = '\ud83d\udd14 <b>' + t('followDue') + ' ' + fmtD(fu.due) + '</b> \u2014 ' + esc(fu.description || fu.title || ''); }
    else fb.classList.add('hidden');
  }
  /* care status bars */
  const cb = document.getElementById('careBars');
  if (cb) {
    const bar = (label, num, den) => '<div class="pbar"><div class="p-top"><span>' + label + '</span><span>' + num + '/' + den + '</span></div><div class="p-track"><div class="p-fill" style="width:' + (den ? Math.round(num / den * 100) : 0) + '%"></div></div></div>';
    cb.innerHTML =
      bar('\ud83d\udccb ' + t('mycase') + ' \u2014 reviewed', rev, total || 0) +
      bar('\ud83d\udc8a ' + t('meds') + ' \u2014 verified', STATE.meds.filter(m => m.verified).length, STATE.meds.length || 0) +
      bar('\ud83e\uddea ' + t('results') + ' \u2014 verified', STATE.reports.filter(r => r.verified).length, STATE.reports.length || 0) +
      bar('\ud83d\udcb0 ' + t('billing') + ' \u2014 paid', STATE.bills.filter(b => b.status === 'paid').length, STATE.bills.length || 0);
  }
  /* mini lists */
  const mm = document.getElementById('medMini');
  if (mm) mm.innerHTML = STATE.meds.filter(m => m.active !== false).slice(0, 4).map(m => '<li><span>\ud83d\udc8a ' + esc(m.name) + '</span>' + medChip(m) + '</li>').join('') || '<li class="muted">None</li>';
  const rm = document.getElementById('repMini');
  if (rm) rm.innerHTML = STATE.reports.slice(0, 4).map(r => '<li><span>\ud83e\uddea ' + esc(r.title || r.type) + '</span><small class="muted">' + fmtD(r.date) + '</small></li>').join('') || '<li class="muted">None</li>';
  const bm = document.getElementById('billMini');
  if (bm) {
    const b0 = STATE.bills[0];
    bm.classList.toggle('muted', !b0);
    bm.innerHTML = b0 ? '<b>' + esc(b0.type || 'bill') + ' \u2014 \u20b9' + esc(b0.total) + '</b><br><small>' + (b0.status === 'paid' ? '\u2713 ' + t('paidLbl') : t('pendingLbl')) + ' \u2022 ' + fmtDT(b0.createdAt) + '</small>' : t('noBillsYet');
  }
}
