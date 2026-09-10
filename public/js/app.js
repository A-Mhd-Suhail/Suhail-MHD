/* ============================================================
   MHD HOSPITAL v16.1 — My Health Defense Hospital 24×7
   v16.1 changes (only these):
   • Timeline entries now show TIME (🕒) beside the date
   • "All My Cases" → 👁️ View Details button on every case
     (opens full case: patient answers + doctor review)
   • Upload Result → Patient dropdown + Doctor dropdown
   • micro-fix: chatbot "blood group" answer placeholder
   ============================================================ */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => (s == null ? '' : String(s)).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtD = d => { if (!d) return '—'; try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch (e) { return d; } };
const fmtDT = t => { if (!t) return '—'; try { return new Date(t).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return String(t); } };
const uid6 = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const maskAadhaar = a => a ? 'XXXX XXXX ' + String(a).slice(-4) : '—';
function timeToMin(t) { const m = String(t || '').match(/(\d+):(\d+)\s*(AM|PM)/i); if (!m) return 0; let h = (+m[1]) % 12; if (/pm/i.test(m[3])) h += 12; return h * 60 + (+m[2]); }
function schedTimeFromDosage(d) { const s = (d || '').toLowerCase();
  if (s.includes('breakfast') || s.includes('morning')) return '08:00 AM';
  if (s.includes('lunch') || s.includes('afternoon')) return '01:00 PM';
  if (s.includes('dinner') || s.includes('night')) return '08:00 PM';
  if (s.includes('evening')) return '06:00 PM';
  return '09:00 AM'; }
function avatarHTML(p, cls) { cls = cls || 'pava';
  if (p && p.photo) return '<img src="' + p.photo + '" class="' + cls + '" alt="">';
  return '<div class="' + cls + '" style="display:flex;align-items:center;justify-content:center">' + (p && p.role === 'doctor' ? '👨‍⚕️' : '🧑') + '</div>'; }
function telLink(phone) { const n = String(phone || '').replace(/\D/g, ''); return n ? 'tel:+91' + n.slice(-10) : null; }

/* ============ AUTH WIRING (bulletproof, delegated) ============ */
function showAuth(view) {
  const lv = document.getElementById('authLoginView'), rv = document.getElementById('authRegisterView');
  if (!lv || !rv) { console.error('Auth views missing'); return; }
  lv.classList.toggle('hidden', view !== 'login');
  rv.classList.toggle('hidden', view !== 'register');
  window.scrollTo({ top: 0 });
}
document.addEventListener('click', e => {

  if (e.target.closest('[data-act="show-register"]')) { e.preventDefault(); showAuth('register'); return; }
  if (e.target.closest('[data-act="show-login"]')) { e.preventDefault(); showAuth('login'); return; }
  if (e.target.closest('[data-act="forgot-pass"]')) {
    e.preventDefault();
    const em = ((document.getElementById('loginEmail') || {}).value || '').trim();
    if (!em) return toast('Enter your email first, then tap Forgot password.');
    auth.sendPasswordResetEmail(em).then(() => toast('📧 Password reset email sent.')).catch(err => toast('⚠️ ' + errMsg(err)));
    return;
  }
  if (e.target.closest('[data-act="foot-link"]')) { toast('ℹ️ This section is available in the full release.'); return; }
});
(function ensureRegForm() {
  if (!document.getElementById('formReg')) {
    const rv = document.getElementById('authRegisterView');
    if (rv) { rv.innerHTML = '<h3>Register</h3><p class="sub">Please replace index.html with the latest full file for the complete registration form.</p><p class="auth-alt">Already have an account? <a data-act="show-login">Login</a></p>'; console.warn('formReg missing'); }
  }
})();
document.addEventListener('submit', e => {
  if (e.target.id === 'formLogin') { e.preventDefault(); doLogin(); }
  if (e.target.id === 'formReg') { e.preventDefault(); doRegister(e.target); }
});
function doLogin() {
  const emEl = document.getElementById('loginEmail'), pwEl = document.getElementById('loginPass');
  if (!emEl || !pwEl) return toast('⚠️ Login form error — refresh the page.');
  const rm = document.getElementById('rememberMe');
  const persistence = (rm && rm.checked) ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
  auth.setPersistence(persistence).catch(() => {})
    .then(() => auth.signInWithEmailAndPassword(emEl.value.trim(), pwEl.value))
    .catch(err => toast('⚠️ ' + errMsg(err)));
}
function doRegister(form) {
  const roleEl = form.querySelector('.reg-pill.active');
  const role = roleEl ? roleEl.dataset.regrole : 'patient';
  const g = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  try {
    let email, pass, profile;
    if (role === 'patient') {
      const name = g('rpName').trim(), dob = g('rpDob'), phone = g('rpPhone').trim();
      const aad = g('rpAadhaar').replace(/\D/g, '');
      email = g('rpEmail').trim(); pass = g('rpPass');
      if (!name || !dob || !phone) return toast('⚠️ Name, Date of Birth and Phone are required.');
      if (aad.length !== 12) return toast('⚠️ Aadhaar must be exactly 12 digits.');
      if (!email || pass.length < 6) return toast('⚠️ Email and a 6+ character password are required.');
      profile = { role: 'patient', name, dob, gender: g('rpGender'), bloodGroup: g('rpBlood'), phone, aadhaar: aad,
        address: g('rpAddress').trim(), emergencyName: g('rpEName').trim(), emergencyPhone: g('rpEPhone').trim(),
        heightCm: g('rpHeight'), weightKg: g('rpWeight'), allergies: g('rpAllergies').trim(),
        conditions: g('rpConditions').trim(), surgeries: g('rpSurgeries').trim(), accidents: g('rpAccidents').trim(),
        familyHistory: g('rpFamily').trim(), income: g('rpIncome'), language: CUR_LANG };
    } else if (role === 'doctor') {
      email = g('rdEmail').trim(); pass = g('rdPass');
      if (!g('rdName').trim() || !g('rdSpec').trim() || !g('rdHospital').trim() || !g('rdReg').trim()) return toast('⚠️ Please fill all required doctor fields.');
      if (!email || pass.length < 6) return toast('⚠️ Email and a 6+ character password are required.');
      profile = { role: 'doctor', name: g('rdName').trim(), specialization: g('rdSpec').trim(), experience: g('rdExp'), hospital: g('rdHospital').trim(), regNo: g('rdReg').trim(), phone: g('rdPhone').trim(), onDuty: false, language: CUR_LANG };
    } else {
      email = g('rhEmail').trim(); pass = g('rhPass');
      if (!g('rhName').trim() || !g('rhAdmin').trim()) return toast('⚠️ Hospital name and admin name are required.');
      if (!email || pass.length < 6) return toast('⚠️ Email and a 6+ character password are required.');
      profile = { role: 'hospital', name: g('rhName').trim(), adminName: g('rhAdmin').trim(), phone: g('rhPhone').trim(), address: g('rhAddress').trim(), licenseNo: g('rhLicense').trim(), language: CUR_LANG };
    }
    toast('⏳ Creating your account…');
    auth.createUserWithEmailAndPassword(email, pass).then(cred => {
      profile.email = email; profile.createdAt = Date.now();
      if (role === 'patient') profile.healthId = 'MHD-' + uid6();
      return db.collection('users').doc(cred.user.uid).set(profile);
    }).then(() => toast('✅ Welcome to MHD Hospital!')).catch(err => toast('⚠️ ' + errMsg(err)));
  } catch (err) { toast('⚠️ ' + (err.message || err)); }
}

/* ============ UNIVERSAL DATE PICKER ============ */
const DP_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DP_DOW = ['Su','Mo','Tu','We','Th','Fr','Sa'];
function mountDatePickers(root) {
  (root || document).querySelectorAll('input[type="date"]').forEach(inp => {
    if (inp.dataset.dpMounted === '1') return;
    inp.dataset.dpMounted = '1';
    inp.style.display = 'none';
    const wrap = document.createElement('div'); wrap.className = 'dp';
    const display = document.createElement('button'); display.type = 'button'; display.className = 'dp-display';
    const panel = document.createElement('div'); panel.className = 'dp-panel';
    const head = document.createElement('div'); head.className = 'dp-head';
    const selM = document.createElement('select'), selY = document.createElement('select');
    const cy = new Date().getFullYear();
    selM.innerHTML = DP_MONTHS.map((m, i) => '<option value="' + i + '">' + m + '</option>').join('');
    for (let y = cy + 2; y >= 1900; y--) selY.innerHTML += '<option value="' + y + '">' + y + '</option>';
    head.appendChild(selM); head.appendChild(selY);
    const grid = document.createElement('div'); grid.className = 'dp-grid';
    const actions = document.createElement('div'); actions.className = 'dp-actions';
    const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'btn ghost sm'; bt.textContent = 'Today';
    const bc = document.createElement('button'); bc.type = 'button'; bc.className = 'btn ghost sm'; bc.textContent = 'Clear';
    actions.appendChild(bt); actions.appendChild(bc);
    panel.appendChild(head); panel.appendChild(grid); panel.appendChild(actions);
    wrap.appendChild(display); wrap.appendChild(panel);
    inp.after(wrap);
    let view = new Date();
    function syncFromInput() {
      const v = inp.value;
      if (v) { const p = v.split('-'); view = new Date(+p[0], +p[1] - 1, +p[2]); selM.value = view.getMonth(); selY.value = view.getFullYear(); display.innerHTML = '📅 <b>' + fmtD(v) + '</b>'; }
      else display.innerHTML = '📅 <span class="muted">Select date</span>';
    }
    function renderGrid() {
      grid.innerHTML = DP_DOW.map(d => '<span class="dow">' + d + '</span>').join('');
      const y = view.getFullYear(), m = view.getMonth();
      selM.value = m; selY.value = y;
      const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
      for (let i = 0; i < first; i++) { const e = document.createElement('button'); e.type = 'button'; e.className = 'dp-day empty'; grid.appendChild(e); }
      const minV = inp.min || '', today = todayStr();
      for (let d = 1; d <= days; d++) {
        const iso = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        const b = document.createElement('button'); b.type = 'button'; b.className = 'dp-day'; b.textContent = d;
        if (iso === today) b.classList.add('today');
        if (iso === inp.value) b.classList.add('sel');
        if (minV && iso < minV) b.disabled = true;
        b.onclick = () => { inp.value = iso; syncFromInput(); wrap.classList.remove('open'); inp.dispatchEvent(new Event('change', { bubbles: true })); };
        grid.appendChild(b);
      }
    }
    display.onclick = e => { e.stopPropagation(); $$('.dp.open').forEach(w => { if (w !== wrap) w.classList.remove('open'); }); wrap.classList.toggle('open'); if (wrap.classList.contains('open')) renderGrid(); };
    selM.onchange = () => { view = new Date(+selY.value, +selM.value, 1); renderGrid(); };
    selY.onchange = () => { view = new Date(+selY.value, +selM.value, 1); renderGrid(); };
    bt.onclick = () => { inp.value = todayStr(); syncFromInput(); wrap.classList.remove('open'); inp.dispatchEvent(new Event('change', { bubbles: true })); };
    bc.onclick = () => { inp.value = ''; syncFromInput(); wrap.classList.remove('open'); inp.dispatchEvent(new Event('change', { bubbles: true })); };
    panel.onclick = e => e.stopPropagation();
    inp._dpSync = syncFromInput;
    syncFromInput();
  });
}
document.addEventListener('click', () => $$('.dp.open').forEach(w => w.classList.remove('open')));

/* ============ DOCUMENT HELPERS ============ */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        try {
          const attempts = [[1200, 0.6], [900, 0.5], [700, 0.45], [500, 0.4], [380, 0.35]];
          let out = null;
          for (const [dim, q] of attempts) {
            const cv = document.createElement('canvas');
            const scale = Math.min(1, dim / Math.max(img.width, img.height));
            cv.width = Math.max(1, Math.round(img.width * scale));
            cv.height = Math.max(1, Math.round(img.height * scale));
            const ctx = cv.getContext('2d');
            ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cv.width, cv.height);
            ctx.drawImage(img, 0, 0, cv.width, cv.height);
            out = cv.toDataURL('image/jpeg', q);
            if (out.length < 550000) break;
          }
          if (out && out.length < 700000) resolve(out);
          else reject(new Error('Image is too large — retake closer/clearer'));
        } catch (err) { reject(err); }
      };
      img.onerror = () => reject(new Error('Could not read this image'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
}
function autoDetectDoc(name) {
  const f = (name || '').toLowerCase();
  let type = 'Other Document';
  if (/(x[-_ ]?ray|radiograph)/.test(f)) type = 'X-ray';
  else if (/(ct|c\.t|mri|ultrasound|usg|sonography|scan)/.test(f)) type = 'CT / MRI';
  else if (/(prescri|\brx\b|medic)/.test(f)) type = 'Prescription';
  else if (/(discharge|summary)/.test(f)) type = 'Discharge Summary';
  else if (/(blood|cbc|lab|hba1c|glucose|lipid|sugar|test|report|result)/.test(f)) type = 'Lab Report';
  let date = '';
  let m = f.match(/(\d{4})[-_. ](\d{1,2})[-_. ](\d{1,2})/);
  if (m) date = m[1] + '-' + String(Math.min(12, +m[2])).padStart(2, '0') + '-' + String(Math.min(31, +m[3])).padStart(2, '0');
  else {
    m = f.match(/(\d{1,2})[-_. ](\d{1,2})[-_. ](\d{4})/);
    if (m) date = m[3] + '-' + String(Math.min(12, +m[2])).padStart(2, '0') + '-' + String(Math.min(31, +m[1])).padStart(2, '0');
    else {
      m = f.match(/(?:^|[^0-9])(\d{2})(\d{2})(\d{4})(?:[^0-9]|$)/);
      if (m && +m[2] >= 1 && +m[2] <= 12) date = m[3] + '-' + m[2] + '-' + m[1];
    }
  }
  if (date) { const p = date.split('-'); const d = new Date(p[0] + '-' + p[1] + '-' + p[2]); if (isNaN(d.getTime())) date = ''; }
  const cleanTitle = (name || '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  return { type, date, title: cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : '' };
}
function docStatusChip(r) {
  if (r.verified) return '<span class="chip ready">🟩 Verified ✓' + (r.verifiedBy ? ' ' + esc(r.verifiedBy) : '') + '</span>';
  if (r.fileData) return '<span class="chip waiting">🟡 Awaiting verification</span>';
  return '<span class="chip blue">🟦 Self-uploaded</span>';
}
async function openDocViewer(id) {
  try {
    const s = await db.collection('reports').doc(id).get();
    if (!s.exists) return toast('⚠️ Result not found.');
    const r = s.data();
    if (r.patientId && ROLE !== 'patient') logAccess(r.patientId, (ROLE === 'doctor' ? '👨‍⚕️ Dr. ' : '🏥 ') + ME.name + ' viewed result: ' + (r.title || ''));
    let html = '<h3>' + esc(r.title || 'Result') + '</h3>';
    if (r.fileData) html += '<img src="' + r.fileData + '" class="doc-view-img" alt="Result">';
    html += '<div class="kv">' + kvRows([
      ['Type', r.type], ['Date', fmtD(r.date)], ['Hospital', r.hospital], ['Doctor', r.doctor],
      ['Summary / Note', r.note], ['Uploaded by', (r.uploadedBy || '—') + (r.uploadedByRole ? ' (' + r.uploadedByRole + ')' : '')],
      ['Uploaded on', fmtDT(r.createdAt)], ['Status', r.verified ? '🟩 Verified' : '🟡 Awaiting verification']
    ]) + '</div>';
    if (ROLE === 'hospital' && !r.verified) html += '<button class="btn primary big" data-act="h-verify-doc" data-id="' + id + '">✅ VERIFY THIS RESULT</button>';
    html += modalCloseBtn();
    showModal(html);
  } catch (err) { toast('⚠️ ' + errMsg(err)); }
}

/* ============ I18N ============ */
const LANGS = [['en','English'],['hi','हिन्दी'],['ta','தமிழ்'],['te','తెలుగు'],['ml','മലയാളം'],['kn','ಕನ್ನಡ'],['bn','বাংলা'],['mr','मराठी'],['gu','ગુજરાતી'],['pa','ਪੰਜਾਬੀ']];
const I18N = {
 en:{dashboard:'Dashboard',upcoming:'Upcoming',mycase:'My Case',meds:'Medicines',results:'My Results',appts:'Appointments',doctors:'My Doctors',timeline:'Timeline',tracking:'Health Overview',qr:'My QR',privacy:'Privacy & Access',billing:'Billing',notifs:'Notifications',settings:'Settings',emergency:'Emergency',logout:'Logout',cases:'Cases',verify:'Verify Medicines',chats:'Messages',patients:'Patients',dappts:'My Appointments',earnings:'My Earnings',healthinput:'Health Input',hdash:'Hospital Dashboard',hpatients:'All Patients',hdoctors:'All Doctors',hcases:'All Cases',hmeds:'Medicines',hdocs:'Verify Documents',happts:'Appointments',hupload:'Upload Result',greetM:'Good Morning',greetA:'Good Afternoon',greetE:'Good Evening',page:'MHD Hospital'},
 hi:{dashboard:'डैशबोर्ड',upcoming:'आगामी',mycase:'मेरा केस',meds:'दवाइयाँ',results:'मेरे परिणाम',appts:'अपॉइंटमेंट',doctors:'मेरे डॉक्टर',timeline:'टाइमलाइन',tracking:'स्वास्थ्य विवरण',qr:'मेरा QR',privacy:'गोपनीयता व पहुँच',billing:'बिल',notifs:'सूचनाएँ',settings:'सेटिंग्स',emergency:'आपातकाल',logout:'लॉगआउट',cases:'केस',verify:'दवा सत्यापन',chats:'संदेश',patients:'मरीज़',dappts:'मेरे अपॉइंटमेंट',earnings:'मेरी कमाई',healthinput:'स्वास्थ्य प्रविष्टि',hdash:'अस्पताल डैशबोर्ड',hpatients:'सभी मरीज़',hdoctors:'सभी डॉक्टर',hcases:'सभी केस',hmeds:'दवाइयाँ',hdocs:'दस्तावेज़ सत्यापन',happts:'अपॉइंटमेंट',hupload:'परिणाम अपलोड',greetM:'सुप्रभात',greetA:'नमस्कार',greetE:'शुभ संध्या',page:'MHD हॉस्पिटल'},
 ta:{dashboard:'டாஷ்போர்டு',upcoming:'வரவிருக்கும்',mycase:'என் கேஸ்',meds:'மருந்துகள்',results:'என் முடிவுகள்',appts:'சந்திப்புகள்',doctors:'என் மருத்துவர்கள்',timeline:'காலவரிசை',tracking:'உடல்நல கண்ணோட்டம்',qr:'என் QR',privacy:'தனியுரிமை & அணுகல்',billing:'பில்',notifs:'அறிவிப்புகள்',settings:'அமைப்புகள்',emergency:'அவசரம்',logout:'வெளியேறு',cases:'கேஸ்கள்',verify:'மருந்து சரிபார்ப்பு',chats:'செய்திகள்',patients:'நோயாளிகள்',dappts:'என் சந்திப்புகள்',earnings:'என் வருவாய்',healthinput:'உடல்நல பதிவு',hdash:'மருத்துவமனை டாஷ்போர்டு',hpatients:'அனைத்து நோயாளிகள்',hdoctors:'அனைத்து மருத்துவர்கள்',hcases:'அனைத்து கேஸ்கள்',hmeds:'மருந்துகள்',hdocs:'ஆவண சரிபார்ப்பு',happts:'சந்திப்புகள்',hupload:'முடிவு பதிவேற்றம்',greetM:'காலை வணக்கம்',greetA:'மதிய வணக்கம்',greetE:'மாலை வணக்கம்',page:'MHD மருத்துவமனை'},
 te:{dashboard:'డాష్‌బోర్డ్',upcoming:'రాబోయేవి',mycase:'నా కేసు',meds:'మందులు',results:'నా ఫలితాలు',appts:'అపాయింట్‌మెంట్లు',doctors:'నా డాక్టర్లు',timeline:'టైమ్‌లైన్',tracking:'ఆరోగ్య సమాచారం',qr:'నా QR',privacy:'గోప్యత & యాక్సెస్',billing:'బిల్లు',notifs:'నోటిఫికేషన్లు',settings:'సెట్టింగ్‌లు',emergency:'అత్యవసరం',logout:'లాగ్ అవుట్',cases:'కేసులు',verify:'మందు ధృవీకరణ',chats:'సందేశాలు',patients:'రోగులు',dappts:'నా అపాయింట్‌మెంట్లు',earnings:'నా ఆదాయం',healthinput:'ఆరోగ్య నమోదు',hdash:'ఆసుపత్రి డాష్‌బోర్డ్',hpatients:'అన్ని రోగులు',hdoctors:'అన్ని డాక్టర్లు',hcases:'అన్ని కేసులు',hmeds:'మందులు',hdocs:'పత్ర ధృవీకరణ',happts:'అపాయింట్‌మెంట్లు',hupload:'ఫలితం అప్‌లోడ్',greetM:'శుభోదయం',greetA:'శుభ మధ్యాహ్నం',greetE:'శుభ సాయంత్రం',page:'MHD ఆసుపత్రి'},
 ml:{dashboard:'ഡാഷ്ബോർഡ്',upcoming:'വരാനിരിക്കുന്നവ',mycase:'എന്റെ കേസ്',meds:'മരുന്നുകൾ',results:'എന്റെ ഫലങ്ങൾ',appts:'അപ്പോയിന്റ്മെന്റുകൾ',doctors:'എന്റെ ഡോക്ടർമാർ',timeline:'ടൈംലൈൻ',tracking:'ആരോഗ്യ അവലോകനം',qr:'എന്റെ QR',privacy:'സ്വകാര്യത & ആക്സസ്സ്',billing:'ബിൽ',notifs:'അറിയിപ്പുകൾ',settings:'സെറ്റിംഗ്സ്',emergency:'അത്യാഹിതം',logout:'ലോഗ് ഔട്ട്',cases:'കേസുകൾ',verify:'മരുന്ന് സ്ഥിരീകരണം',chats:'സന്ദേശങ്ങൾ',patients:'രോഗികൾ',dappts:'എന്റെ അപ്പോയിന്റ്മെന്റുകൾ',earnings:'എന്റെ വരുമാനം',healthinput:'ആരോഗ്യ നമോദു',hdash:'ആശുപത്രി ഡാഷ്ബോർഡ്',hpatients:'എല്ലാ രോഗികൾ',hdoctors:'എല്ലാ ഡോക്ടർമാർ',hcases:'എല്ലാ കേസുകൾ',hmeds:'മരുന്നുകൾ',hdocs:'രേഖ സ്ഥിരീകരണം',happts:'അപ്പോയിന്റ്മെന്റുകൾ',hupload:'ഫലം അപ്‌ലോഡ്',greetM:'സുപ്രഭാതം',greetA:'ശുഭ ഉച്ച',greetE:'ശുഭ സന്ധ്യ',page:'MHD ആശുപത്രി'},
 kn:{dashboard:'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',upcoming:'ಮುಂಬರುವ',mycase:'ನನ್ನ ಪ್ರಕರಣ',meds:'ಔಷಧಿಗಳು',results:'ನನ್ನ ಫಲಿತಾಂಶ',appts:'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು',doctors:'ನನ್ನ ವೈದ್ಯರು',timeline:'ಟೈಮ್‌ಲೈನ್',tracking:'ಆರೋಗ್ಯ ಸಮೀಕ್ಷೆ',qr:'ನನ್ನ QR',privacy:'ಗೋಪ್ಯತೆ ಮತ್ತು ಪ್ರವೇಶ',billing:'ಬಿಲ್',notifs:'ಅಧಿಸೂಚನೆಗಳು',settings:'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',emergency:'ತುರ್ತು',logout:'ಲಾಗ್ ಔಟ್',cases:'ಪ್ರಕರಣಗಳು',verify:'ಔಷಧ ಪರಿಶೀಲನೆ',chats:'ಸಂದೇಶಗಳು',patients:'ರೋಗಿಗಳು',dappts:'ನನ್ನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು',earnings:'ನನ್ನ ಆದಾಯ',healthinput:'ಆರೋಗ್ಯ ನಮೂದು',hdash:'ಆಸ್ಪತ್ರೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',hpatients:'ಎಲ್ಲಾ ರೋಗಿಗಳು',hdoctors:'ಎಲ್ಲಾ ವೈದ್ಯರು',hcases:'ಎಲ್ಲಾ ಪ್ರಕರಣಗಳು',hmeds:'ಔಷಧಿಗಳು',hdocs:'ದಸ್ತಾವೇಜು ಪರಿಶೀಲನೆ',happts:'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು',hupload:'ಫಲಿತಾಂಶ ಅಪ್‌ಲೋಡ್',greetM:'ಶುಭೋದಯ',greetA:'ಶುಭ ಮಧ್ಯಾಹ್ನ',greetE:'ಶುಭ ಸಂಜೆ',page:'MHD ಆಸ್ಪತ್ರೆ'},
 bn:{dashboard:'ড্যাশবোর্ড',upcoming:'আসন্ন',mycase:'আমার কেস',meds:'ওষুধ',results:'আমার ফলাফল',appts:'অ্যাপয়েন্টমেন্ট',doctors:'আমার ডাক্তার',timeline:'টাইমলাইন',tracking:'স্বাস্থ্য ওভারভিউ',qr:'আমার QR',privacy:'গোপনীয়তা ও অ্যাক্সেস',billing:'বিল',notifs:'বিজ্ঞপ্তি',settings:'সেটিংস',emergency:'জরুরি',logout:'লগআউট',cases:'কেস',verify:'ওষুধ যাচাই',chats:'বার্তা',patients:'রোগী',dappts:'আমার অ্যাপয়েন্টমেন্ট',earnings:'আমার আয়',healthinput:'স্বাস্থ্য এন্ট্রি',hdash:'হাসপাতাল ড্যাশবোর্ড',hpatients:'সব রোগী',hdoctors:'সব ডাক্তার',hcases:'সব কেস',hmeds:'ওষুধ',hdocs:'ডকুমেন্ট যাচাই',happts:'অ্যাপয়েন্টমেন্ট',hupload:'ফলাফল আপলোড',greetM:'সুপ্রভাত',greetA:'শুভ অপরাহ্ন',greetE:'শুভ সন্ধ্যা',page:'MHD হাসপাতাল'},
 mr:{dashboard:'डॅशबोर्ड',upcoming:'आगामी',mycase:'माझा केस',meds:'औषधे',results:'माझे निकाल',appts:'अपॉइंटमेंट',doctors:'माझे डॉक्टर',timeline:'टाइमलाइन',tracking:'आरोग्य आढावा',qr:'माझा QR',privacy:'गोपनीयता व प्रवेश',billing:'बिल',notifs:'सूचना',settings:'सेटिंग्ज',emergency:'आपत्कालीन',logout:'लॉगआउट',cases:'केस',verify:'औषध पडताळणी',chats:'संदेश',patients:'रुग्ण',dappts:'माझी अपॉइंटमेंट',earnings:'माझी कमाई',healthinput:'आरोग्य नोंद',hdash:'रुग्णालय डॅशबोर्ड',hpatients:'सर्व रुग्ण',hdoctors:'सर्व डॉक्टर',hcases:'सर्व केस',hmeds:'औषधे',hdocs:'दस्तऐवज पडताळणी',happts:'अपॉइंटमेंट',hupload:'निकाल अपलोड',greetM:'शुभ प्रभात',greetA:'नमस्कार',greetE:'शुभ संध्याकाळ',page:'MHD रुग्णालय'},
 gu:{dashboard:'ડેશબોર્ડ',upcoming:'આગામી',mycase:'મારો કેસ',meds:'દવાઓ',results:'મારા પરિણામો',appts:'એપોઇન્ટમેન્ટ',doctors:'મારા ડૉક્ટર',timeline:'ટાઇમલાઇન',tracking:'આરોગ્ય ઝાંખી',qr:'મારો QR',privacy:'ગોપનીયતા અને પ્રવેશ',billing:'બિલ',notifs:'સૂચનાઓ',settings:'સેટિંગ્સ',emergency:'કટોકટી',logout:'લોગ આઉટ',cases:'કેસ',verify:'દવા ચકાસણી',chats:'સંદેશા',patients:'દર્દીઓ',dappts:'મારી એપોઇન્ટમેન્ટ',earnings:'મારી કમાણી',healthinput:'આરોગ્ય એન્ટ્રી',hdash:'હોસ્પિટલ ડેશબોર્ડ',hpatients:'બધા દર્દીઓ',hdoctors:'બધા ડૉક્ટર',hcases:'બધા કેસ',hmeds:'દવાઓ',hdocs:'દસ્તાવેજ ચકાસણી',happts:'એપોઇન્ટમેન્ટ',hupload:'પરિણામ અપલોડ',greetM:'સુપ્રભાત',greetA:'શુભ બપોર',greetE:'શુભ સાંજ',page:'MHD હોસ્પિટલ'},
 pa:{dashboard:'ਡੈਸ਼ਬੋਰਡ',upcoming:'ਆਉਣ ਵਾਲੇ',mycase:'ਮੇਰਾ ਕੇਸ',meds:'ਦਵਾਈਆਂ',results:'ਮੇਰੇ ਨਤੀਜੇ',appts:'ਅਪਾਇੰਟਮੈਂਟ',doctors:'ਮੇਰੇ ਡਾਕਟਰ',timeline:'ਟਾਈਮਲਾਈਨ',tracking:'ਸਿਹਤ ਝਲਕ',qr:'ਮੇਰਾ QR',privacy:'ਗੁਪਤਤਾ ਅਤੇ ਪਹੁੰਚ',billing:'ਬਿੱਲ',notifs:'ਸੂਚਨਾਵਾਂ',settings:'ਸੈਟਿੰਗਾਂ',emergency:'ਐਮਰਜੈਂਸੀ',logout:'ਲੌਗ ਆਉਟ',cases:'ਕੇਸ',verify:'ਦਵਾਈ ਪੁਸ਼ਟੀ',chats:'ਸੁਨੇਹੇ',patients:'ਮਰੀਜ਼',dappts:'ਮੇਰੀਆਂ ਅਪਾਇੰਟਮੈਂਟਾਂ',earnings:'ਮੇਰੀ ਕਮਾਈ',healthinput:'ਸਿਹਤ ਐਂਟਰੀ',hdash:'ਹਸਪਤਾਲ ਡੈਸ਼ਬੋਰਡ',hpatients:'ਸਾਰੇ ਮਰੀਜ਼',hdoctors:'ਸਾਰੇ ਡਾਕਟਰ',hcases:'ਸਾਰੇ ਕੇਸ',hmeds:'ਦਵਾਈਆਂ',hdocs:'ਦਸਤਾਵੇਜ਼ ਪੁਸ਼ਟੀ',happts:'ਅਪਾਇੰਟਮੈਂਟ',hupload:'ਨਤੀਜਾ ਅੱਪਲੋਡ',greetM:'ਸ਼ੁਭ ਸਵੇਰ',greetA:'ਸ਼ੁਭ ਦੁਪਹਿਰ',greetE:'ਸ਼ੁਭ ਸ਼ਾਮ',page:'MHD ਹਸਪਤਾਲ'}
};
let CUR_LANG = localStorage.getItem('mhd_lang') || 'en';
const t = k => (I18N[CUR_LANG] && I18N[CUR_LANG][k]) || I18N.en[k] || k;
function fillLangSelects() { ['#langSel', '#langSelAuth', '#setLang'].forEach(id => { const el = $(id); if (!el) return; el.innerHTML = LANGS.map(([v, n]) => '<option value="' + v + '">' + n + '</option>').join(''); el.value = CUR_LANG; }); }
function setLanguage(v) {
  CUR_LANG = v; localStorage.setItem('mhd_lang', v); fillLangSelects();
  if (ME) { db.collection('users').doc(ME.id).update({ language: v }).catch(() => {}); buildNav(); if (CURRENT_PAGE) go(CURRENT_PAGE, { silent: true }); }
  toast('Language updated ✅');
}
['langSel', 'langSelAuth', 'setLang'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', e => setLanguage(e.target.value)); });
fillLangSelects();

let ME = null, ROLE = null, UNBINDS = [];
const STATE = { doctors: [], patients: [], cases: [], myReviewed: [], meds: [], reports: [], appts: [], timeline: [], access: [], consents: [], notifs: [], vitals: [], unverifiedMeds: [], allCases: [], medsAll: [], bills: [], myBills: [], billsAll: [], reportsAll: [] };
let CURRENT_CASE = null, CHAT_WITH = null, CURRENT_APTAB = 'upcoming', CURRENT_CTAB = 'waiting', chosenSlot = null, chatUnsub = null, pendingPhoto = null, pendingDoc = null, pendingHu = null;
let dutyWatch = null, lastLocSend = 0, focusDoctorId = null, cvMap = null, markersLayer = null;
let CURRENT_PAGE = null, NAV_STACK = [];

window.addEventListener('error', e => { try { if (!e || !e.message || e.message === 'Script error.') return; toast('⚠️ ' + e.message); } catch (_) {} });
window.addEventListener('unhandledrejection', e => { try { const r = e.reason; if (!r || !r.message || r.message === 'Script error.') return; toast('⚠️ ' + (r && r.message ? r.message : 'Unexpected error')); } catch (_) {} });
function toast(msg) { const el = $('#toastRoot'); if (!el) { console.log('TOAST:', msg); return; } const t2 = document.createElement('div'); t2.className = 'toast'; t2.textContent = msg; el.appendChild(t2); setTimeout(() => t2.remove(), 3500); }
function showModal(html) { const mc = $('#modalCard'), mr = $('#modalRoot'); if (mc) mc.innerHTML = html; if (mr) mr.classList.remove('hidden'); }
function closeModal() { const mr = $('#modalRoot'); if (mr) mr.classList.add('hidden'); }
function modalCloseBtn() { return '<button class="btn ghost sm" data-act="close-modal" style="margin-top:12px">Close</button>'; }
function errMsg(err) {
  const c = (err && err.code) ? err.code : '';
  if (c.includes('email-already-in-use')) return 'This email is already registered — please Login instead.';
  if (c.includes('invalid-email')) return 'Invalid email format.';
  if (c.includes('weak-password')) return 'Password must be at least 6 characters.';
  if (c.includes('operation-not-allowed')) return 'Firebase Console → Authentication → enable Email/Password!';
  if (c.includes('unauthorized-domain')) return 'Firebase Console → Authentication → Settings → add your GitHub Pages domain!';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found')) return 'Wrong email or password.';
  if (c.includes('network')) return 'Network problem — check your internet.';
  if (c.includes('permission-denied')) return 'Firestore rules issue — publish the rules again.';
  return (err && err.message) ? err.message : 'Something went wrong.';
}

/* ---------- THEME / FONT ---------- */
function applyTheme(v) {
  if (document.documentElement && document.documentElement.dataset) {
    document.documentElement.dataset.theme = v;
  } else if (document.documentElement) {
    document.documentElement.setAttribute('data-theme', v);
  }
  localStorage.setItem('mhd_theme', v);
  ['themeSelAuth', 'themeSel', 'themeSelSet'].forEach(id => { const el = document.getElementById(id); if (el) el.value = v; });
}
['themeSelAuth', 'themeSel', 'themeSelSet'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', e => { applyTheme(e.target.value); toast('Theme changed ✅'); }); });
applyTheme(localStorage.getItem('mhd_theme') || 'light');
function setFont(v) { document.body.classList.remove('font-sm', 'font-lg'); if (v === 'sm') document.body.classList.add('font-sm'); if (v === 'lg') document.body.classList.add('font-lg'); localStorage.setItem('mhd_font', v); }
setFont(localStorage.getItem('mhd_font') || 'md');

/* ---------- ROLE PILL TOGGLE ---------- */
document.addEventListener('click', e => {

  const p = e.target.closest('.reg-pill');
  if (!p) return;
  $$('.reg-pill').forEach(x => x.classList.remove('active'));
  p.classList.add('active');
  const r = p.dataset.regrole;
  const rp = document.getElementById('regPatient'), rd = document.getElementById('regDoctor'), rh = document.getElementById('regHospital');
  if (rp) rp.classList.toggle('hidden', r !== 'patient');
  if (rd) rd.classList.toggle('hidden', r !== 'doctor');
  if (rh) rh.classList.toggle('hidden', r !== 'hospital');
});

/* ---------- DEMO ---------- */
const DEMO_PASS = 'demo123';
const DEMO = {
  patient: { email: 'patient.demo@mhdhospital.in', profile: { role: 'patient', name: 'Arjun Kumar', dob: '1980-03-14', gender: 'Male', bloodGroup: 'O+', phone: '9840012345', aadhaar: '432187651122', address: '12, Gandhi Street, Anna Nagar, Chennai 600040', emergencyName: 'Priya Kumar (Wife)', emergencyPhone: '9840055555', heightCm: '170', weightKg: '74', allergies: 'Penicillin (medicine allergy), Dust (other)', conditions: 'Type 2 Diabetes (2021), Hypertension (2022)', surgeries: 'Appendectomy | 2019 | Apollo Hospitals | Dr. Rajan | Appendicitis\nKnee Arthroscopy | 2022 | Kauvery Hospital | Dr. Menon | Meniscus tear', accidents: 'Two-wheeler accident 2016 — right arm fracture', familyHistory: 'Father — Diabetes; Grandmother — Hypertension', income: '240000', language: 'en', healthId: 'MHD-DEMO01' } },
  doctor: { email: 'doctor.demo@mhdhospital.in', profile: { role: 'doctor', name: 'Arun Kumar', specialization: 'General Surgery', experience: '12', hospital: 'MHD Hospital', regNo: 'TMC-45892', phone: '9840077777', onDuty: false } },
  hospital: { email: 'hospital.demo@mhdhospital.in', profile: { role: 'hospital', name: 'MHD Hospital', adminName: 'Admin Demo', phone: '9840088888', address: '1, Hospital Road, Chennai', licenseNo: 'TN-HOSP-1024' } }
};
async function quickDemo(role) {
  const d = DEMO[role]; if (!d) return;
  toast('Opening demo ' + role + '… ⚡');
  cleanupSession();

  // If already logged in as this user, enter app instantly
  if (auth.currentUser && auth.currentUser.email === d.email) {
    ME = { id: auth.currentUser.uid, email: d.email, ...d.profile };
    ROLE = ME.role;
    enterApp();
    return;
  }

  try { await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) {}
  try {
    await auth.signInWithEmailAndPassword(d.email, DEMO_PASS);
  } catch (err) {
    const c = (err && err.code) || '';
    if (c.includes('user-not-found') || c.includes('invalid-credential') || c.includes('wrong-password')) {
      try {
        const cred = await auth.createUserWithEmailAndPassword(d.email, DEMO_PASS);
        await db.collection('users').doc(cred.user.uid).set({ ...d.profile, email: d.email, createdAt: Date.now() });
        if (role === 'patient') await db.collection('medicines').add({ patientId: cred.user.uid, name: 'Metformin 500mg', dosage: '1 tablet after breakfast', startDate: todayStr(), durationDays: '30', prescribedBy: 'Arjun Kumar (self-reported)', verified: false, source: 'patient', active: true, createdAt: Date.now() });
      } catch (e2) {
        if ((e2 && e2.code || '').includes('email-already-in-use')) {
          try { await auth.signInWithEmailAndPassword(d.email, DEMO_PASS); } catch (e3) { toast('⚠️ ' + errMsg(e3)); }
        } else toast('⚠️ ' + errMsg(e2));
      }
    } else toast('⚠️ ' + errMsg(err));
  }
}
document.addEventListener('click', e => {
 const dl = e.target.closest('[data-act="demo-login"]'); if (dl) quickDemo(dl.dataset.role); });
document.addEventListener('click', e => {

  if (!e.target.closest('[data-act="demo-fill"]')) return;
  const setv = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  setv('rpName', 'Arjun Kumar'); setv('rpDob', '1980-03-14');
  if (document.getElementById('rpDob') && document.getElementById('rpDob')._dpSync) document.getElementById('rpDob')._dpSync();
  setv('rpGender', 'Male'); setv('rpBlood', 'O+'); setv('rpPhone', '9840012345'); setv('rpAadhaar', '432187651122');
  setv('rpAddress', '12, Gandhi Street, Anna Nagar, Chennai 600040');
  setv('rpEName', 'Priya Kumar (Wife)'); setv('rpEPhone', '9840055555');
  setv('rpHeight', '170'); setv('rpWeight', '74'); setv('rpIncome', '240000');
  setv('rpAllergies', 'Penicillin (medicine allergy), Dust (other)');
  setv('rpConditions', 'Type 2 Diabetes (2021), Hypertension (2022)');
  setv('rpSurgeries', 'Appendectomy | 2019 | Apollo Hospitals | Dr. Rajan | Appendicitis\nKnee Arthroscopy | 2022 | Kauvery Hospital | Dr. Menon | Meniscus tear');
  setv('rpAccidents', 'Two-wheeler accident 2016 — right arm fracture');
  setv('rpFamily', 'Father — Diabetes; Grandmother — Hypertension');
  setv('rpEmail', 'arjun.demo' + Math.floor(Math.random() * 9000) + '@mhdhospital.in'); setv('rpPass', 'demo123');
  toast('Demo data filled ✅ — now press "Create Health ID"');
});

/* ---------- SESSION ---------- */
function cleanupSession() {
  try { if (ROLE === 'doctor' && ME) db.collection('users').doc(ME.id).update({ onDuty: false, location: firebase.firestore.FieldValue.delete() }).catch(() => {}); } catch (e) {}
  if (dutyWatch) { navigator.geolocation.clearWatch(dutyWatch); dutyWatch = null; }
  if (chatUnsub) { chatUnsub(); chatUnsub = null; }
  UNBINDS.forEach(u => { try { u(); } catch (e) {} }); UNBINDS = [];
  ME = null; ROLE = null; CURRENT_CASE = null; CHAT_WITH = null; chosenSlot = null; pendingPhoto = null; pendingDoc = null; pendingHu = null; CURRENT_PAGE = null; NAV_STACK = [];
  Object.keys(STATE).forEach(k => STATE[k] = Array.isArray(STATE[k]) ? [] : STATE[k]);
}
async function doLogout() { cleanupSession(); await auth.signOut().catch(() => {}); location.reload(); }

if (typeof auth !== 'undefined' && auth && typeof auth.onAuthStateChanged === 'function') {
  auth.onAuthStateChanged(async user => {
    if (!user) {
      const sa = $('#screen-auth'), ap = $('#app');
      if (sa) sa.classList.remove('hidden');
      if (ap) ap.classList.add('hidden');
      showAuth('login');
      return;
    }
  try {
    const demoKey = Object.keys(DEMO).find(k => DEMO[k].email === user.email);
    if (demoKey) {
      ME = { id: user.uid, email: user.email, ...DEMO[demoKey].profile };
      ROLE = ME.role;
      if (ME.language && I18N[ME.language]) { CUR_LANG = ME.language; localStorage.setItem('mhd_lang', CUR_LANG); fillLangSelects(); }
      enterApp();
      db.collection('users').doc(user.uid).get().then(s => {
        if (s.exists) {
          ME = { id: user.uid, ...s.data() };
        } else {
          db.collection('users').doc(user.uid).set(ME, { merge: true }).catch(() => {});
        }
      }).catch(() => {});
      return;
    }

    let snap = null;
    for (let i = 0; i < 3; i++) {
      const s = await db.collection('users').doc(user.uid).get();
      if (s.exists) { snap = s; break; }
      await new Promise(r => setTimeout(r, 200));
    }
    if (!snap) { toast('Profile missing — please register again.'); await auth.signOut(); return; }
    ME = { id: user.uid, ...snap.data() };
    ROLE = ME.role;
    if (ME.language && I18N[ME.language]) { CUR_LANG = ME.language; localStorage.setItem('mhd_lang', CUR_LANG); fillLangSelects(); }
    enterApp();
  } catch (err) { toast('⚠️ ' + errMsg(err)); }
});
}

/* ---------- NAV ---------- */
const MENUS = {
  patient: [['p-dash', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>', 'dashboard'], ['p-upcoming', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>', 'upcoming'], ['p-case', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>', 'mycase'], ['p-meds', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.5 20.5a5 5 0 1 1-7.07-7.07l9.19-9.19a5 5 0 1 1 7.07 7.07z"></path><line x1="8.54" y1="11.46" x2="15.61" y2="18.54"></line></svg>', 'meds'], ['p-results', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path></svg>', 'results'], ['p-appts', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>', 'appts'], ['p-doctors', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', 'doctors'], ['p-timeline', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>', 'timeline'], ['p-vitals', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>', 'tracking'], ['p-qr', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>', 'qr'], ['p-privacy', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>', 'privacy'], ['p-billing', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>', 'billing'], ['EMERGENCY', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h4l3-9 5 18 3-9h5"></path></svg>', 'emergency']],
  doctor: [['d-dash', '🏠', 'dashboard'], ['d-vitals', '🩺', 'healthinput'], ['d-cases', '📋', 'cases'], ['d-verify', '💊', 'verify'], ['d-chats', '💬', 'chats'], ['d-patients', '🔍', 'patients'], ['d-appts', '📅', 'dappts'], ['d-billing', '💰', 'earnings']],
  hospital: [['h-dash', '🏥', 'hdash'], ['h-patients', '👥', 'hpatients'], ['h-doctors', '👨‍⚕️', 'hdoctors'], ['h-cases', '📋', 'hcases'], ['h-meds', '💊', 'hmeds'], ['h-docs', '📄', 'hdocs'], ['h-appts', '📅', 'happts'], ['h-billing', '💰', 'billing'], ['h-upload', '🧪', 'hupload']]
};
const TKEY = { 'p-dash': 'dashboard', 'p-upcoming': 'upcoming', 'p-case': 'mycase', 'p-meds': 'meds', 'p-results': 'results', 'p-appts': 'appts', 'p-doctors': 'doctors', 'p-timeline': 'timeline', 'p-vitals': 'tracking', 'p-qr': 'qr', 'p-privacy': 'privacy', 'p-billing': 'billing', 'p-notifs': 'notifs', 'p-settings': 'settings', 'd-dash': 'dashboard', 'd-vitals': 'healthinput', 'd-cases': 'cases', 'd-verify': 'verify', 'd-chats': 'chats', 'd-case': 'cases', 'd-patients': 'patients', 'd-appts': 'dappts', 'd-billing': 'earnings', 'h-dash': 'hdash', 'h-patients': 'hpatients', 'h-doctors': 'hdoctors', 'h-cases': 'hcases', 'h-meds': 'hmeds', 'h-docs': 'hdocs', 'h-appts': 'happts', 'h-upload': 'hupload', 'h-billing': 'billing' };
function homeId() { return ROLE === 'patient' ? 'p-dash' : ROLE === 'doctor' ? 'd-dash' : 'h-dash'; }
function buildNav() {
  const nav = $('#sideNav'); nav.innerHTML = '';
  MENUS[ROLE].forEach(([id, emo, key]) => {
    const b = document.createElement('button'); b.className = 'nav-item' + (id === 'EMERGENCY' ? ' danger' : ''); b.dataset.nav = id;
    b.innerHTML = emo + ' ' + t(key); nav.appendChild(b);
  });
  const lb = document.createElement('button'); lb.className = 'nav-item danger'; lb.dataset.nav = 'LOGOUT'; lb.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>' + t('logout'); nav.appendChild(lb);
  $('#sideRole').textContent = ROLE === 'patient' ? 'Patient Portal' : ROLE === 'doctor' ? 'Doctor Portal' : 'Hospital Portal';
  $('#sideName').textContent = ME.name || '—';
  $('#sideSub').textContent = ROLE === 'patient' ? (ME.healthId || '') : (ROLE === 'doctor' ? (ME.specialization || '') : (ME.adminName || ''));
  const av = $('#sideAvatar');
  av.textContent = ROLE === 'patient' ? '🧑' : ROLE === 'doctor' ? '👨‍⚕️' : '🏥';
  if (ME.photo) { av.style.backgroundImage = 'url(' + ME.photo + ')'; av.classList.add('has-photo'); } else { av.style.backgroundImage = ''; av.classList.remove('has-photo'); }
  $('#cbFab').classList.toggle('hidden', ROLE !== 'patient');
  $('#topSearch').classList.toggle('hidden', ROLE !== 'patient');
}
document.addEventListener('click', e => {

  const nv = e.target.closest('[data-nav]'); if (!nv) return;
  if (nv.tagName === 'A') e.preventDefault();
  const id = nv.dataset.nav;
  if (id === 'LOGOUT') { doLogout(); return; }
  if (id === 'EMERGENCY') { openEmergency(false); return; }
  go(id);
});
function go(id, opts) {
  if (!opts || !opts.silent) { if (CURRENT_PAGE && CURRENT_PAGE !== id) { NAV_STACK.push(CURRENT_PAGE); if (NAV_STACK.length > 40) NAV_STACK.shift(); } }
  CURRENT_PAGE = id;
  $$('.page').forEach(p => p.classList.add('hidden'));
  const pg = $('#pg-' + id);
  if (!pg) { toast('⚠️ Page "#pg-' + id + '" missing — replace index.html with latest full file.'); return; }
  pg.classList.remove('hidden');
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.nav === id));
  $('#pageTitle').textContent = t(TKEY[id] || 'page');
  $('#sidebar').classList.remove('open');
  const hooks = {
    'p-dash': () => renderPatientDash(), 'p-upcoming': () => renderUpcoming(), 'p-case': () => renderMyCase(),
    'p-meds': () => renderMeds(), 'p-results': () => renderResults(), 'p-appts': () => { renderAppts(); loadTakenSlots(); },
    'p-doctors': () => { renderDoctorsPage(); renderDoctorMap(); }, 'p-timeline': () => renderTimeline(), 'p-vitals': () => renderVitals(),
    'p-qr': () => renderQR(), 'p-privacy': () => { renderConsent(); renderAccess(); }, 'p-billing': () => renderPBilling(),
    'p-notifs': () => renderNotifPage(),
    'p-settings': () => renderSettings(),
    'd-dash': () => renderDocDash(), 'd-vitals': () => renderDocVitals(), 'd-cases': () => renderDoctorCases(), 'd-verify': () => renderVerifyMeds(), 'd-chats': () => renderDChats(), 'd-patients': () => renderPatients(), 'd-appts': () => renderDocAppts(), 'd-billing': () => renderDBilling(),
    'h-dash': () => renderHospital(), 'h-patients': () => renderHPatients(), 'h-doctors': () => renderHDoctors(), 'h-cases': () => renderHCases(), 'h-meds': () => renderHMeds(), 'h-docs': () => renderHDocs(), 'h-appts': () => renderHAppts(), 'h-billing': () => renderHBilling(), 'h-upload': () => fillUploadDropdowns()
  };
  if (hooks[id]) { try { hooks[id](); } catch (e) { console.error(e); toast('⚠️ Render error: ' + e.message); } }
}
function navBack() { const prev = NAV_STACK.pop(); go(prev || homeId(), { silent: true }); }
function navHome() { NAV_STACK = []; go(homeId(), { silent: true }); }
document.addEventListener('click', e => {

  if (e.target.closest('[data-act="nav-back"]')) navBack();
  if (e.target.closest('[data-act="nav-home"]')) navHome();
  if (e.target.closest('[data-act="burger"]')) $('#sidebar').classList.toggle('open');
  if (e.target.closest('[data-act="logout"]')) doLogout();
  // if (e.target.closest(.[data-act="profile-quick"].)) openQuickProfile();
});

function enterApp() {
  $('#screen-auth').classList.add('hidden'); $('#app').classList.remove('hidden');
  buildNav();
  if (ROLE === 'patient') localStorage.setItem('mhd_emergency', JSON.stringify(ME));
  const h = new Date().getHours();
  const greet = h < 12 ? t('greetM') : h < 17 ? t('greetA') : t('greetE');
  if (ROLE === 'patient') { $('#dGreet').textContent = greet + ', ' + ME.name + ' 👋'; $('#dHid').textContent = ME.healthId; bindPatient(); go('p-dash', { silent: true }); }
  if (ROLE === 'doctor') {
    db.collection('users').doc(ME.id).update({ onDuty: false, location: firebase.firestore.FieldValue.delete() }).catch(() => {});
    ME.onDuty = false; ME.location = null;
    bindDoctor(); go('d-dash', { silent: true });
  }
  if (ROLE === 'hospital') { bindHospital(); go('h-dash', { silent: true }); }
  bindNotifs();
}

/* ============ QUICK PROFILE CARD (top-right 👤) ============ */
function openQuickProfile() {
  if (ROLE === 'patient') {
    showModal('<div class="doctor-line" style="margin-bottom:8px">' + avatarHTML(ME) +
      '<h3 style="margin:0">' + esc(ME.name) + '</h3></div>' +
      '<div class="kv">' + kvRows([
        ['Health ID', ME.healthId], ['Age', ageOf(ME.dob)], ['Gender', ME.gender], ['🩸 Blood Group', ME.bloodGroup],
        ['Phone', ME.phone], ['Email', ME.email], ['Address', ME.address],
        ['Emergency Contact', (ME.emergencyName || '—') + ' ' + (ME.emergencyPhone || '')],
        ['⚠️ Allergies', ME.allergies || 'None'], ['🏥 Conditions', ME.conditions || 'None']
      ]) + '</div>' +
      '<button class="btn primary big" data-act="go-settings" style="margin-top:10px">⚙️ Edit Profile &amp; Settings</button>' + modalCloseBtn());
  } else if (ROLE === 'doctor') {
    showModal('<div class="doctor-line" style="margin-bottom:8px">' + avatarHTML(ME) +
      '<h3 style="margin:0">Dr. ' + esc(ME.name) + '</h3></div>' +
      '<div class="kv">' + kvRows([['Specialization', ME.specialization], ['Hospital', ME.hospital], ['Reg No', ME.regNo], ['Experience', (ME.experience || '—') + ' yrs'], ['Phone', ME.phone], ['Email', ME.email]]) + '</div>' +
      '<button class="btn primary big" data-act="go-settings" style="margin-top:10px">⚙️ Edit Profile &amp; Settings</button>' + modalCloseBtn());
  } else {
    showModal('<h3>🏥 ' + esc(ME.name) + '</h3><div class="kv">' + kvRows([['Admin', ME.adminName], ['Phone', ME.phone], ['Address', ME.address], ['License', ME.licenseNo], ['Email', ME.email]]) + '</div>' +
      '<button class="btn primary big" data-act="go-settings" style="margin-top:10px">⚙️ Edit Hospital Details</button>' + modalCloseBtn());
  }
}

/* ============ NOTIFICATIONS (New/Read columns + auto-read) ============ */
function notifTargetFromText(title, body) {
  const text = ((title || '') + ' ' + (body || '')).toLowerCase();
  if (text.includes('appointment') || text.includes('queue')) return ROLE === 'doctor' ? 'd-appts' : 'p-appts';
  if (text.includes('case')) return ROLE === 'doctor' ? 'd-cases' : 'p-case';
  if (text.includes('medicine')) return ROLE === 'doctor' ? 'd-verify' : 'p-meds';
  if (text.includes('result') || text.includes('report')) return ROLE === 'doctor' ? 'd-chats' : 'p-results';
  if (text.includes('bill') || text.includes('billing') || text.includes('payment')) return ROLE === 'doctor' ? 'd-billing' : 'p-billing';
  if (text.includes('health record') || text.includes('vital')) return ROLE === 'doctor' ? 'd-vitals' : 'p-vitals';
  if (text.includes('privacy') || text.includes('consent')) return 'p-privacy';
  return null;
}
function notifItem(n) {
  const target = n.navTarget || notifTargetFromText(n.title, n.body);
  return '<button type="button" class="notif-row" data-act="open-notif" data-id="' + n.id + '" data-target="' + esc(target || '') + '"><div class="li-main"><b>' + esc(n.title) + '</b><small>' + esc(n.body) + ' • ' + fmtDT(n.createdAt) + '</small></div><span class="chip blue">Open</span></button>';
}
function renderNotifDrop() {
  const news = STATE.notifs.filter(n => !n.read), read = STATE.notifs.filter(n => n.read);
  const sec = (title, arr, empty) => '<h4 style="padding:4px 6px 0">' + title + ' (' + arr.length + ')</h4>' + (arr.slice(0, 8).map(notifItem).join('') || '<p class="muted" style="padding:0 6px">' + empty + '</p>');
  $('#bellDrop').innerHTML = '<div style="max-height:340px;overflow:auto">' + sec('🆕 New', news, 'Nothing new.') + '<hr style="border:none;border-top:1px dashed var(--border);margin:8px 0">' + sec('✅ Read', read, 'No read notifications yet.') + '</div>' +
    '<button class="btn ghost sm" data-act="go-notifs" style="width:100%;margin-top:6px">Open Notification Center</button>';
}
function renderNotifPage() {
  const news = STATE.notifs.filter(n => !n.read), read = STATE.notifs.filter(n => n.read);
  const nEl = $('#notifNew'), rEl = $('#notifRead');
  if (nEl) nEl.innerHTML = news.map(notifItem).join('') || '<p class="muted">All caught up — no new notifications 🎉</p>';
  if (rEl) rEl.innerHTML = read.map(notifItem).join('') || '<p class="muted">No read notifications yet.</p>';
}
function notify(to, title, body, navTarget) { return db.collection('notifications').add({ to, title, body, navTarget: navTarget || notifTargetFromText(title, body) || null, read: false, createdAt: Date.now() }); }
function notifyRole(role, title, body) { return notify('role:' + role, title, body); }
function bindNotifs() {
  UNBINDS.push(db.collection('notifications').where('to', 'in', [ME.id, 'role:' + ROLE]).onSnapshot(snap => {
    STATE.notifs = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt);
    const unread = STATE.notifs.filter(n => !n.read).length;
    $('#bellDot').classList.toggle('hidden', unread === 0);
    renderNotifDrop();
    renderNotifPage();
    if (ROLE === 'patient') renderPatientDash();
    if (ROLE === 'doctor') renderDocDash();
  }, err => console.error(err)));
}
document.addEventListener('click', e => {

  if (e.target.closest('[data-act="bell"]')) {
    const drop = $('#bellDrop');
    drop.classList.toggle('hidden');
    if (!drop.classList.contains('hidden')) {
      const unread = STATE.notifs.filter(n => !n.read);
      if (unread.length) {
        unread.forEach(n => db.collection('notifications').doc(n.id).update({ read: true }).catch(() => {}));
        setTimeout(() => { $('#bellDot').classList.add('hidden'); renderNotifDrop(); renderNotifPage(); }, 600);
      }
    }
    return;
  }
  if (!e.target.closest('.bell-drop') && !e.target.closest('.bell')) $('#bellDrop').classList.add('hidden');
  const on = e.target.closest('[data-act="open-notif"]');
  if (on) {
    const n = STATE.notifs.find(x => x.id === on.dataset.id);
    if (n && !n.read) db.collection('notifications').doc(n.id).update({ read: true }).catch(() => {});
    $('#bellDrop').classList.add('hidden');
    const target = (n && (n.navTarget || notifTargetFromText(n.title, n.body))) || on.dataset.target;
    if (target) go(target); else if (ROLE === 'patient') go('p-notifs'); else if (ROLE === 'doctor') go('d-dash'); else go('h-dash');
    return;
  }
  if (e.target.closest('[data-act="go-notifs"]')) { $('#bellDrop').classList.add('hidden'); if (ROLE === 'patient') go('p-notifs'); else if (ROLE === 'doctor') go('d-dash'); else go('h-dash'); }
  if (e.target.closest('[data-act="mark-read"]')) { STATE.notifs.filter(n => !n.read).forEach(n => db.collection('notifications').doc(n.id).update({ read: true }).catch(() => {})); toast('All marked read ✅'); }
});
function logAccess(patientId, action) { return db.collection('accessLog').add({ patientId, actorName: (ROLE === 'doctor' ? 'Dr. ' : '') + ME.name, actorRole: ROLE, action, createdAt: Date.now() }).catch(() => {}); }
const kvRows = rows => rows.map(([k, v]) => '<div class="krow"><span>' + k + '</span><b>' + esc(v || '—') + '</b></div>').join('');
function ageOf(dob) { if (!dob) return '—'; const a = Math.floor((Date.now() - new Date(dob)) / 31557600000); return isNaN(a) ? '—' : a + 'y'; }
function medChip(m) { return m.verified ? '<span class="chip ready">🟩 Verified — Ready to take ✓' + (m.verifiedBy ? ' <small>(' + esc(m.verifiedBy) + ')</small>' : '') + '</span>' : '<span class="chip waiting">🔴 Verification Pending</span>'; }
function queueNumberOf(a) {
  const sameDay = STATE.appts.filter(x => x.doctorId === a.doctorId && x.date === a.date && x.status === 'upcoming').sort((x, y) => timeToMin(x.time) - timeToMin(y.time));
  const i = sameDay.findIndex(x => x.id === a.id);
  return i >= 0 ? i + 1 : null;
}

/* ============ PATIENT BINDINGS ============ */
function bindPatient() {
  const pid = ME.id;
  UNBINDS.push(db.collection('cases').where('patientId', '==', pid).onSnapshot(s => { STATE.cases = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt); renderMyCase(); renderPatientDash(); }, console.error));
  UNBINDS.push(db.collection('medicines').where('patientId', '==', pid).onSnapshot(s => { STATE.meds = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt); renderMeds(); renderPatientDash(); renderUpcoming(); renderMyCase(); }, console.error));
  UNBINDS.push(db.collection('reports').where('patientId', '==', pid).onSnapshot(s => { STATE.reports = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt); renderResults(); renderPatientDash(); }, console.error));
  UNBINDS.push(db.collection('appointments').where('patientId', '==', pid).onSnapshot(s => { STATE.appts = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.date || '').localeCompare(a.date || '')); renderAppts(); renderPatientDash(); renderUpcoming(); }, console.error));
  UNBINDS.push(db.collection('timeline').where('patientId', '==', pid).onSnapshot(s => { STATE.timeline = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.date || '').localeCompare(a.date || '')); renderTimeline(); renderPatientDash(); }, console.error));
  UNBINDS.push(db.collection('accessLog').where('patientId', '==', pid).onSnapshot(s => { STATE.access = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt); renderAccess(); }, console.error));
  UNBINDS.push(db.collection('vitals').where('patientId', '==', pid).onSnapshot(s => { STATE.vitals = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt); renderVitals(); renderPatientDash(); }, console.error));
  UNBINDS.push(db.collection('bills').where('patientId', '==', pid).onSnapshot(s => { STATE.bills = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt); renderPBilling(); renderPatientDash(); }, console.error));
  UNBINDS.push(db.collection('users').where('role', '==', 'doctor').onSnapshot(s => { STATE.doctors = s.docs.map(d => ({ id: d.id, ...d.data() })); renderDoctorDropdown(); renderConsent(); renderDoctorsPage(); renderDoctorMap(); }, console.error));
  loadDoctors();
}
async function loadDoctors() {
  try {
    const s = await db.collection('users').where('role', '==', 'doctor').get();
    STATE.doctors = s.docs.map(d => ({ id: d.id, ...d.data() }));
    const c = await db.collection('consents').where('patientId', '==', ME.id).get();
    STATE.consents = c.docs.map(d => ({ id: d.id, ...d.data() }));
    renderDoctorDropdown(); renderConsent(); renderDoctorsPage();
  } catch (e) { console.error(e); }
}

/* ----- RECOVERY + SCHEDULE ----- */
function ringSVG(pct) {
  const r = 40, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
  return '<div class="ring-wrap"><svg width="92" height="92" viewBox="0 0 92 92"><circle class="ring-bg" cx="46" cy="46" r="' + r + '" fill="none" stroke-width="9"/><circle class="ring-fg" cx="46" cy="46" r="' + r + '" fill="none" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg><div class="ring-txt">' + pct + '%<small>RECOVERY</small></div></div>';
}
function buildTodaySchedule() {
  const items = [];
  STATE.appts.filter(a => a.date === todayStr() && a.status === 'upcoming').forEach(a => {
    const q = queueNumberOf(a);
    items.push({ 
      time: a.time || '09:00 AM', 
      title: (a.doctorName || 'Doctor'), 
      inst: (q ? 'Queue #' + q + ' • ' : '') + (a.hospital || 'Hospital'), 
      status: 'Upcoming', 
      statusColor: '#64748B',
      actionHtml: '<button class="btn ghost sm" data-nav="p-appts">View</button>' 
    });
  });
  STATE.meds.filter(m => m.active !== false).forEach(m => {
    const taken = m.takenDates && m.takenDates[todayStr()];
    items.push({ 
      time: schedTimeFromDosage(m.dosage), 
      title: m.name, 
      inst: m.dosage || 'As prescribed', 
      status: m.verified ? 'Verified' : 'Pending', 
      statusColor: m.verified ? '#2E7D5B' : '#B7791F',
      actionHtml: taken ? '<span class="taken-text">Taken</span>' : '<button class="btn ghost sm" data-act="mark-taken" data-id="' + m.id + '">Mark Taken</button>' 
    });
  });
  return items.sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
}
function renderTodaySchedule() {
  const el = $('#todaySchedule'); if (!el) return;
  el.innerHTML = buildTodaySchedule().map(it => {
    const statusHtml = '<span class="row-status" style="color:' + it.statusColor + '">● ' + esc(it.status) + '</span>';
    return '<div class="sched-item"><div class="sched-time">' + esc(it.time) + '</div><div class="sched-title">' + esc(it.title) + '</div><div class="sched-inst">' + esc(it.inst) + '</div><div class="sched-status">' + statusHtml + '</div><div class="sched-action">' + it.actionHtml + '</div></div>';
  }).join('') || '<p class="muted">Nothing scheduled today.</p>';
}
document.addEventListener('click', async e => {
  const mt = e.target.closest('[data-act="mark-taken"]');
  if (!mt) return;
  const m = STATE.meds.find(x => x.id === mt.dataset.id);
  if (!m) return;
  try { const dates = m.takenDates || {}; dates[todayStr()] = true; await db.collection('medicines').doc(m.id).update({ takenDates: dates }); toast('✅ Marked as taken'); } catch (err) { toast('⚠️ ' + errMsg(err)); }
});

/* ----- PATIENT DASHBOARD ----- */
function renderPatientDash() {
  if (ROLE !== 'patient' || !ME) return;
  const lastCase = STATE.cases.find(c => c.status === 'reviewed');
  const nextAppt = STATE.appts.filter(a => a.status === 'upcoming' && a.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date))[0];
  const fields = ['name', 'dob', 'gender', 'phone', 'aadhaar', 'bloodGroup', 'address', 'emergencyName', 'allergies', 'conditions'];
  const profilePct = Math.round(fields.filter(f => ME[f] && String(ME[f]).trim()).length / fields.length * 100);
  const docsPct = Math.min(100, STATE.reports.length * 20);
  const vm = STATE.meds.length ? Math.round(STATE.meds.filter(m => m.verified).length / STATE.meds.length * 100) : 100;
  const active = STATE.meds.filter(m => m.active !== false);
  const fu = STATE.timeline.find(tt => tt.type === 'followup' && tt.due && tt.due >= todayStr());
  const recovery = Math.round((profilePct + vm + docsPct + (fu ? 60 : 100)) / 4);
  const rr = $('#recoRing'); if (rr) rr.innerHTML = recovery + '%'; const rbf = $('#recoBarFill'); if (rbf) rbf.style.width = recovery + '%';
  const rm = $('#recoMsg');
  if (rm) rm.textContent = recovery >= 75 ? 'You are doing well. Continue following your current care plan.' : recovery >= 40 ? 'Fair progress. Continue following your care plan.' : 'Attention required to stay on track.';
  const unread = STATE.notifs.filter(n => !n.read).length;
  const upN = STATE.appts.filter(a => a.status === 'upcoming' && a.date >= todayStr()).length;
  const ms = $('#miniStats');
  if (ms) ms.innerHTML = [['', '<svg viewBox="0 0 24 24"><path d="M10.5 20.5a5 5 0 1 1-7.07-7.07l9.19-9.19a5 5 0 1 1 7.07 7.07z"></path><line x1="8.54" y1="11.46" x2="15.61" y2="18.54"></line></svg>', 'Medicines', active.length, 'Active'], ['', '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>', 'Appointments', upN, 'Upcoming'], ['', '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><polyline points="9 15 11 17 15 13"></polyline></svg>', 'Results', STATE.reports.length, 'Total'], ['', '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>', 'Messages', unread, 'Unread']].map(([cls, ico, label, val, sub]) => '<div class="mini-card"><span class="mc-ico ' + cls + '">' + ico + '</span><span><span class="mc-label">' + label + '</span><b>' + val + '</b><small>' + sub + '</small></span></div>').join('');
  const latest = STATE.cases[0];
  const rb = $('#reviewBanner');
  if (latest && latest.status === 'reviewed') { rb.className = 'banner'; rb.innerHTML = '✅ Doctor Reviewed Your Case — Dr. ' + esc(latest.doctorName) + ' verified it. <a href="#" data-nav="p-case" style="color:inherit;text-decoration:underline">Open</a>'; }
  else if (latest) { rb.className = 'banner amber'; rb.innerHTML = '● Waiting for Doctor Review — submitted ' + fmtDT(latest.createdAt); }
  else rb.className = 'banner hidden';
  const fb = $('#followBanner');
  if (fu) { fb.className = 'banner amber'; fb.innerHTML = '● Follow-up: ' + esc(fu.title) + ' — due ' + fmtD(fu.due); } else fb.className = 'banner hidden';
  $('#medMini').innerHTML = active.slice(0, 4).map(m => '<li><span>' + esc(m.name) + ' <small class="muted">' + esc(m.dosage || '') + '</small></span>' + medChip(m) + '</li>').join('') || '<li class="muted">No medicines yet</li>';
  $('#repMini').innerHTML = STATE.reports.slice(0, 4).map(r => '<li><span style="cursor:pointer" data-act="view-doc" data-id="' + r.id + '">' + (r.fileData ? '' : '') + esc(r.title) + '</span>' + docStatusChip(r) + '</li>').join('') || '<li class="muted">No results yet</li>';
  const billMini = $('#billMini');
  if (billMini) { const tot = (STATE.bills || []).reduce((a, b) => a + Number(b.total || 0), 0); billMini.innerHTML = '<div class="krow"><span>Total billed</span><b>₹' + tot + '</b></div><div class="krow"><span>Pending</span><b>' + (STATE.bills || []).filter(b => b.status !== 'paid').length + '</b></div>'; }
  $('#nextApptCard').innerHTML = nextAppt ? '<div class="appt-row-1">' + fmtD(nextAppt.date) + ' &middot; ' + esc(nextAppt.time) + '</div><div class="appt-row-2">Dr. ' + esc(nextAppt.doctorName) + ' &middot; ' + esc(nextAppt.hospital || 'Consultation') + '</div>' : 'No upcoming appointments.';
  $('#careBars').innerHTML = pbar('Profile', profilePct) + pbar('Documents', docsPct) + pbar('Verification', vm) + pbar('Follow-up', fu ? 60 : 100);
  renderTodaySchedule();
}
function pbar(label, pct) { return '<div class="pbar"><div class="p-top"><span>' + label + '</span><span>' + pct + '%</span></div><div class="p-track"><div class="p-fill" style="width:' + pct + '%"></div></div></div>'; }

/* ----- MY CASE + DRAFT ----- */
const DRAFT_FIELDS = ['ncComplaint', 'ncSymptoms', 'ncDuration', 'ncPrevTx', 'ncExisting', 'ncMeds', 'ncAllergy', 'ncSurgery', 'ncFamily', 'ncOther'];
let draftTimer = null;
document.addEventListener('input', e => {
  if (ROLE !== 'patient') return;
  if (DRAFT_FIELDS.includes(e.target.id)) { clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft, 1200); }
});
async function saveDraft() {
  if (!ME) return;
  const d = {};
  DRAFT_FIELDS.forEach(f => { const el = $('#' + f); d[f] = el ? el.value : ''; });
  const ac = $('#ncAreas .chip.active'); d.area = ac ? ac.dataset.area : '';
  d.severity = $('#ncSeverity') ? $('#ncSeverity').value : '';
  try { await db.collection('caseDrafts').doc(ME.id).set({ ...d, updatedAt: Date.now() }); const dn = $('#draftNote'); if (dn) dn.textContent = 'Draft saved ✓ ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); } catch (e) {}
}
async function loadDraft() {
  if (!ME) return;
  try {
    const s = await db.collection('caseDrafts').doc(ME.id).get();
    if (s.exists) {
      const d = s.data(); let any = false;
      DRAFT_FIELDS.forEach(f => { if (d[f] && $('#' + f) && !$('#' + f).value) { $('#' + f).value = d[f]; any = true; } });
      const dn = $('#draftNote');
      if (dn && any) dn.textContent = 'Draft restored (' + fmtDT(d.updatedAt) + ')';
    }
  } catch (e) {}
}
 $$('#ncAreas .chip').forEach(c => c.addEventListener('click', () => { $$('#ncAreas .chip').forEach(x => x.classList.remove('active')); c.classList.add('active'); }));
document.addEventListener('click', async e => {
  if (!e.target.closest('[data-act="submit-case"]')) return;
  const complaint = $('#ncComplaint').value.trim();
  if (!complaint) return toast('⚠️ Please fill the Chief Complaint.');
  const area = $('#ncAreas .chip.active');
  try {
    await db.collection('cases').add({
      patientId: ME.id, patientName: ME.name, healthId: ME.healthId,
      chiefComplaint: complaint, symptoms: $('#ncSymptoms').value.trim(), area: area ? area.dataset.area : '',
      duration: $('#ncDuration').value.trim(), severity: $('#ncSeverity').value,
      prevTreatment: $('#ncPrevTx').value.trim(), existing: $('#ncExisting').value.trim(),
      currentMeds: $('#ncMeds').value.trim(), allergyNote: $('#ncAllergy').value.trim(),
      surgeryNote: $('#ncSurgery').value.trim(), familyHistory: $('#ncFamily').value.trim(), other: $('#ncOther').value.trim(),
      status: 'waiting', createdAt: Date.now()
    });
    await db.collection('timeline').add({ patientId: ME.id, date: todayStr(), type: 'case', icon: '📝', title: 'Case Submitted', description: complaint, createdAt: Date.now() });
    await notifyRole('doctor', '🟡 New Case Submitted', ME.name + ' (' + ME.healthId + '): ' + complaint);
    DRAFT_FIELDS.forEach(f => { const el = $('#' + f); if (el) el.value = ''; });
    await db.collection('caseDrafts').doc(ME.id).delete().catch(() => {});
    const dn = $('#draftNote'); if (dn) dn.textContent = '';
    toast('✅ Case submitted! Status: ● Waiting for Doctor Review');
    renderMyCase();
  } catch (err) { toast('⚠️ ' + errMsg(err)); }
});
function autofillCase() {
  if (ROLE !== 'patient') return;
  if (!$('#ncExisting').value) $('#ncExisting').value = ME.conditions || '';
  if (!$('#ncMeds').value) $('#ncMeds').value = STATE.meds.filter(m => m.active !== false).map(m => m.name + ' (' + (m.dosage || '') + ')').join(', ');
  if (!$('#ncAllergy').value) $('#ncAllergy').value = ME.allergies || '';
  if (!$('#ncSurgery').value) $('#ncSurgery').value = ME.surgeries || '';
  if (!$('#ncFamily').value) $('#ncFamily').value = ME.familyHistory || '';
}
function renderMyCase() {
  if (ROLE !== 'patient') return;
  autofillCase(); loadDraft();
  const c = STATE.cases[0];
  const stEl = $('#myCaseStatus');
  if (stEl) stEl.innerHTML = !c ? '<div class="card muted">No cases yet — fill the form below to create your first case.</div>' :
    '<div class="card"><h4>Latest Case — ' + (c.status === 'reviewed' ? '🟩 Reviewed by Dr. ' + esc(c.doctorName || '') : '<span style="color:#B7791F">●</span> Waiting for Doctor Review') + '</h4><div class="kv">' +
    '<div class="krow"><span>Chief Complaint</span><b>' + esc(c.chiefComplaint) + '</b></div>' +
    (c.status === 'reviewed' ? '<div class="krow"><span>🟩 Clinical Notes</span><b>' + esc(c.doctorNotes || '—') + '</b></div><div class="krow"><span>🟩 Prescription</span><b>' + esc(c.prescriptionText || '—') + '</b></div><div class="krow"><span>🟩 Tests</span><b>' + esc(c.tests || '—') + '</b></div><div class="krow"><span>🟩 Follow-up</span><b>' + (c.followupDays ? 'after ' + esc(c.followupDays) + ' days' : '—') + '</b></div>' : '') +
    '</div></div>';
  const ch = $('#caseHistory');
  if (ch) ch.innerHTML = STATE.cases.map(x => '<div class="list-item"><div class="li-main"><b>' + esc(x.chiefComplaint) + '</b><small>' + esc(x.duration || '') + ' • ' + esc(x.severity || '') + ' • ' + fmtDT(x.createdAt) + '</small></div><div class="li-actions">' + (x.status === 'reviewed' ? '<span class="chip green">🟩 Dr. ' + esc(x.doctorName || '') + '</span>' : '<span class="chip amber">● Waiting</span>') + '<button class="btn primary sm" data-act="view-case" data-id="' + x.id + '">👁️ View Details</button></div></div>').join('') || '<p class="muted">No case history yet.</p>';
  $('#secPersonal').innerHTML = kvRows([['Name', ME.name], ['DOB / Age', (ME.dob || '—') + ' (' + ageOf(ME.dob) + ')'], ['Gender', ME.gender], ['Contact', ME.phone], ['Address', ME.address], ['Emergency Contact', (ME.emergencyName || '') + ' ' + (ME.emergencyPhone || '')], ['Aadhaar', maskAadhaar(ME.aadhaar)], ['Health ID', ME.healthId]]);
  $('#secMedical').innerHTML = kvRows([['Existing Conditions', ME.conditions || 'None'], ['Previous Illnesses / Accidents', ME.accidents || 'None'], ['Family History', ME.familyHistory || '—']]);
  $('#secAllergy').innerHTML = kvRows([['Allergies', ME.allergies || 'None recorded']]);
  $('#secSurgery').innerHTML = (ME.surgeries || 'No surgeries recorded').split('\n').filter(Boolean).map(s => '<div class="krow"><span>🔪 ' + esc(s) + '</span></div>').join('');
  $('#secMeds').innerHTML = STATE.meds.map(m => '<li><span>' + esc(m.name) + ' <small class="muted">' + esc(m.dosage || '') + ' • ' + esc(m.prescribedBy || '') + '</small></span>' + medChip(m) + '</li>').join('') || '<li class="muted">—</li>';
  $('#secVisits').innerHTML = STATE.timeline.filter(tt => tt.type === 'case' || tt.type === 'consult').map(tt => '<li><span>' + (tt.icon || '🏥') + ' ' + esc(tt.title) + ' <small class="muted">' + esc(tt.description || '') + '</small></span><small class="muted">' + fmtD(tt.date) + '</small></li>').join('') || '<li class="muted">No visits yet</li>';
}
/* ----- PAST CASE DETAIL VIEWER (patient) ----- */
async function openCaseDetail(id) {
  let c = STATE.cases.find(x => x.id === id);
  if (!c) { try { const s = await db.collection('cases').doc(id).get(); if (s.exists) c = { id: s.id, ...s.data() }; } catch (e) {} }
  if (!c) return toast('⚠️ Case not found.');
  const row = (k, v) => '<div class="krow"><span>' + k + '</span><b>' + esc(v || '—') + '</b></div>';
  let html = '<h3>📋 Case Details</h3><p class="muted sm-txt">Submitted: ' + fmtDT(c.createdAt) + ' • ' + (c.status === 'reviewed' ? '🟩 Reviewed by Dr. ' + esc(c.doctorName || '') : '<span style="color:#B7791F">●</span> Waiting for Doctor Review') + '</p>' +
    '<h4 style="margin-top:10px">🟦 What you reported</h4><div class="kv">' +
    row('1️⃣ Chief Complaint', c.chiefComplaint) + row('2️⃣ Symptoms', c.symptoms) + row('🧍 Symptom Area', c.area) +
    row('3️⃣ Since when', c.duration) + row('Severity', c.severity) + row('4️⃣ Previous treatment taken', c.prevTreatment) +
    row('5️⃣ Existing conditions', c.existing) + row('6️⃣ Current medicines', c.currentMeds) +
    row('7️⃣ Allergies', c.allergyNote) + row('8️⃣ Previous surgery', c.surgeryNote) +
    row('9️⃣ Family history', c.familyHistory) + row('🔟 Other / Questions', c.other) +
    '</div>';
  if (c.status === 'reviewed') {
    html += '<h4 style="margin-top:12px">🟩 Doctor-Verified — Dr. ' + esc(c.doctorName || '') + '</h4><div class="kv">' +
      row('Clinical Notes', c.doctorNotes) + row('Observations', c.observations) +
      row('💊 Prescription', c.prescriptionText) + row('Recommended Tests', c.tests) +
      row('● Follow-up', c.followupDays ? 'after ' + c.followupDays + ' days' : '—') +
      row('💰 Consultation Fee', c.fee ? '₹' + c.fee : '—') +
      '</div>';
  } else {
    html += '<p class="hint" style="margin-top:10px">● Waiting for doctor review — verified details will appear here once reviewed.</p>';
  }
  html += modalCloseBtn();
  showModal(html);
}
document.addEventListener('click', e => {
 const vc = e.target.closest('[data-act="view-case"]'); if (vc) openCaseDetail(vc.dataset.id); });

/* ----- MEDICINES (patient self-add restored) ----- */
function renderMeds() {
  const el = $('#medList'); if (!el || ROLE !== 'patient') return;
  el.innerHTML = STATE.meds.map(m =>
    '<div class="list-item"><div class="li-main"><b>' + esc(m.name) + '</b>' +
    '<small>' + esc(m.dosage || '') + ' • Start ' + fmtD(m.startDate) + (m.durationDays ? ' • ' + esc(m.durationDays) + ' days' : '') + ' • ' + esc(m.prescribedBy || '') + '</small></div>' +
    '<div class="li-actions">' + medChip(m) +
    '<button class="btn ghost sm" data-act="stop-med" data-id="' + m.id + '">' + (m.active === false ? 'Restart' : 'Stop') + '</button></div></div>').join('') || '<p class="muted">No medicines added yet — add your first one above.</p>';
}
document.addEventListener('click', async e => {
  if (e.target.closest('[data-act="add-med"]')) {
    const name = $('#mName').value.trim(); if (!name) return toast('⚠️ Medicine name is required.');
    try {
      await db.collection('medicines').add({ patientId: ME.id, name, dosage: $('#mDose').value.trim(), startDate: $('#mStart').value || todayStr(), durationDays: $('#mDur').value, prescribedBy: ME.name + ' (self-reported)', verified: false, source: 'patient', active: true, createdAt: Date.now() });
      $('#mName').value = ''; $('#mDose').value = ''; $('#mDur').value = '';
      await notifyRole('doctor', '💊 Medicine Awaiting Verification', ME.name + ' added: ' + name + ' — please verify.');
      toast('Added — 🔴 doctor verification pending');
      renderMeds(); renderPatientDash();
    } catch (err) { toast('⚠️ ' + errMsg(err)); }
  }
  const sm = e.target.closest('[data-act="stop-med"]');
  if (sm) { const m = STATE.meds.find(x => x.id === sm.dataset.id); if (m) { await db.collection('medicines').doc(m.id).update({ active: m.active === false }).catch(err => toast('⚠️ ' + errMsg(err))); toast('Updated ✅'); renderMeds(); } }
});

/* ----- PATIENT RESULTS (view-only, detail viewer) ----- */
function renderResults() {
  if (ROLE !== 'patient') return;
  const sum = $('#resSummary'), list = $('#repList');
  const rs = STATE.reports || [];
  const verified = rs.filter(r => r.verified).length, scanned = rs.filter(r => r.fileData).length;
  if (sum) sum.innerHTML = '<div class="krow"><span>Total results</span><b>' + rs.length + '</b></div><div class="krow"><span>🟩 Verified</span><b>' + verified + '</b></div><div class="krow"><span>With document photo</span><b>' + scanned + '</b></div><small class="muted">Results are added by your doctor & hospital — tap any result to view full detail.</small>';
  if (list) list.innerHTML = rs.map(r =>
    '<div class="list-item"><div class="li-main" style="display:flex;align-items:center;gap:10px">' +
    (r.fileData ? '<img src="' + r.fileData + '" class="doc-thumb" alt="">' : '<div class="doc-thumb" style="display:flex;align-items:center;justify-content:center">🧪</div>') +
    '<div><b>' + esc(r.title) + '</b><small>' + esc(r.type) + ' • ' + fmtD(r.date) + ' • ' + esc(r.hospital || '') + (r.doctor ? ' • ' + esc(r.doctor) : '') + '</small></div></div>' +
    '<div class="li-actions">' + docStatusChip(r) +
    '<button class="btn primary sm" data-act="view-doc" data-id="' + r.id + '">👁️ View Detail</button>' +
    '</div></div>').join('') || '<p class="muted">No results yet — they appear here when your doctor or hospital adds them.</p>';
}

/* ----- APPOINTMENTS ----- */
const SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '04:00 PM', '04:30 PM', '05:00 PM'];
function renderDoctorDropdown() {
  const d = $('#apDoctor'); if (!d) return;
  const cur = d.value;
  d.innerHTML = STATE.doctors.map(x => '<option value="' + x.id + '" data-name="Dr. ' + esc(x.name) + '" data-dept="' + esc(x.specialization || '') + '" data-hosp="' + esc(x.hospital || '') + '">Dr. ' + esc(x.name) + ' — ' + esc(x.specialization || '') + ' (' + esc(x.hospital || '') + ')</option>').join('') || '<option value="">No doctors registered yet</option>';
  if (cur) d.value = cur;
  const ad = $('#apDate'); if (ad && !ad.min) { ad.min = todayStr(); if (ad._dpSync) ad._dpSync(); }
  $('#apSlots').innerHTML = SLOTS.map(s => '<button type="button" class="chip" data-slot="' + s + '">' + s + '</button>').join('');
  $$('#apSlots .chip').forEach(c => c.onclick = () => { if (c.disabled) return; $$('#apSlots .chip').forEach(x => x.classList.remove('active')); c.classList.add('active'); chosenSlot = c.dataset.slot; });
  loadTakenSlots();
}
async function loadTakenSlots() {
  if (ROLE !== 'patient') return;
  const dsel = $('#apDoctor') && $('#apDoctor').selectedOptions[0];
  const date = $('#apDate') ? $('#apDate').value : '';
  const chips = $$('#apSlots .chip');
  if (!chips.length) return;
  if (!dsel || !dsel.value || !date) { chips.forEach(c => { c.classList.remove('taken'); c.disabled = false; }); return; }
  try {
    const s = await db.collection('appointments').where('doctorId', '==', dsel.value).get();
    const taken = new Set(s.docs.map(x => x.data()).filter(a => a.date === date && a.status === 'upcoming').map(a => a.time));
    chips.forEach(c => { if (taken.has(c.dataset.slot)) { c.classList.add('taken'); c.disabled = true; c.title = 'Already booked'; if (chosenSlot === c.dataset.slot) { chosenSlot = null; c.classList.remove('active'); } } else { c.classList.remove('taken'); c.disabled = false; c.title = ''; } });
  } catch (e) { console.error(e); }
}
const apDocEl = $('#apDoctor'); if (apDocEl) apDocEl.addEventListener('change', () => { chosenSlot = null; $$('#apSlots .chip').forEach(x => x.classList.remove('active')); loadTakenSlots(); });
const apDateEl = $('#apDate'); if (apDateEl) apDateEl.addEventListener('change', () => { chosenSlot = null; $$('#apSlots .chip').forEach(x => x.classList.remove('active')); loadTakenSlots(); });
document.addEventListener('click', async e => {
  if (!e.target.closest('[data-act="book-appt"]')) return;
  const dsel = $('#apDoctor').selectedOptions[0];
  if (!dsel || !dsel.value) return toast('⚠️ No doctor available — register a doctor account first.');
  const date = $('#apDate').value;
  if (!date) return toast('⚠️ Please select a date (use the calendar).');
  if (!chosenSlot) return toast('⚠️ Please select a time slot.');
  const slotId = (dsel.value + '_' + date + '_' + chosenSlot).replace(/[^a-zA-Z0-9]/g, '_');
  const slotRef = db.collection('slots').doc(slotId);
  const apptRef = db.collection('appointments').doc();
  try {
    await db.runTransaction(async tx => {
      const sd = await tx.get(slotRef);
      if (sd.exists) throw new Error('SLOT_TAKEN');
      tx.set(slotRef, { doctorId: dsel.value, date, time: chosenSlot, patientId: ME.id, bookedAt: Date.now() });
      tx.set(apptRef, { patientId: ME.id, patientName: ME.name, healthId: ME.healthId, doctorId: dsel.value, doctorName: dsel.dataset.name, department: dsel.dataset.dept, hospital: dsel.dataset.hosp, date, time: chosenSlot, type: $('#apType').value, reason: $('#apReason').value.trim(), status: 'upcoming', createdAt: Date.now() });
    });
    await notify(dsel.value, '📅 New Appointment', ME.name + ' booked ' + fmtD(date) + ' at ' + chosenSlot);
    await notify(ME.id, '✅ Appointment Confirmed', dsel.dataset.name + ' — ' + fmtD(date) + ' ' + chosenSlot);
    $('#apReason').value = '';
    loadTakenSlots();
    toast('✅ Booked! Check your 🎟️ Queue number on the dashboard.');
  } catch (err) {
    if (err && err.message === 'SLOT_TAKEN') { toast('⛔ That slot was just booked. Pick another time.'); loadTakenSlots(); }
    else toast('⚠️ ' + errMsg(err));
  }
});
 $$('[data-aptab]').forEach(tt => tt.onclick = () => { $$('[data-aptab]').forEach(x => x.classList.remove('active')); tt.classList.add('active'); CURRENT_APTAB = tt.dataset.aptab; renderAppts(); });
function renderAppts() {
  const el = $('#apList'); if (!el || ROLE !== 'patient') return;
  const list = STATE.appts.filter(a => a.status === CURRENT_APTAB);
  el.innerHTML = list.map(a => { const q = a.status === 'upcoming' ? queueNumberOf(a) : null;
    return '<div class="list-item"><div class="li-main"><b>' + (q ? '<span class="queue-chip">🎟️ Q#' + q + '</span> ' : '') + esc(a.doctorName || 'Doctor') + ' • ' + esc(a.time || '') + '</b><small>' + esc(a.department || '') + ' • ' + esc(a.hospital || '') + ' • ' + fmtD(a.date) + ' • ' + esc(a.type || '') + '</small></div><div class="li-actions"><span class="chip ' + (a.status === 'upcoming' ? 'blue' : a.status === 'completed' ? 'green' : 'red') + '">' + esc(a.status) + '</span>' + (a.status === 'upcoming' ? '<button class="btn ghost sm" data-act="cancel-appt" data-id="' + a.id + '">Cancel</button>' : '') + '</div></div>'; }).join('') || '<p class="muted">Nothing here.</p>';
}
document.addEventListener('click', async e => {
  const c = e.target.closest('[data-act="cancel-appt"]');
  if (c) {
    try {
      const adoc = await db.collection('appointments').doc(c.dataset.id).get();
      const a = adoc.exists ? adoc.data() : null;
      await db.collection('appointments').doc(c.dataset.id).update({ status: 'cancelled' });
      if (a && a.doctorId && a.date && a.time) await db.collection('slots').doc((a.doctorId + '_' + a.date + '_' + a.time).replace(/[^a-zA-Z0-9]/g, '_')).delete().catch(() => {});
      toast('Cancelled — slot released ✅');
    } catch (err) { toast('⚠️ ' + errMsg(err)); }
  }
  const cp = e.target.closest('[data-act="complete-appt"]');
  if (cp) { await db.collection('appointments').doc(cp.dataset.id).update({ status: 'completed' }).catch(err => toast('⚠️ ' + errMsg(err))); toast('Marked completed ✅'); }
});

/* ----- MY DOCTORS + MAP ----- */
function isOnline(d) { return !!(d && d.onDuty && d.location && d.location.lat != null && (Date.now() - d.location.updatedAt) < 6 * 60 * 1000); }
function ago(ts) { const s = Math.max(1, Math.round((Date.now() - ts) / 1000)); return s < 60 ? s + ' sec ago' : Math.round(s / 60) + ' min ago'; }
function renderDoctorsPage() {
  const el = $('#docList'); if (!el || ROLE !== 'patient') return;
  el.innerHTML = STATE.doctors.map(d => {
    const on = isOnline(d); const tel = telLink(d.phone);
    return '<div class="card"><div class="doctor-line">' + avatarHTML(d) + '<div><b>Dr. ' + esc(d.name) + '</b><br><small class="muted">' + esc(d.specialization || '') + ' • ' + esc(d.experience || '0') + ' yrs</small></div></div>' +
      '<p class="muted" style="margin:8px 0 4px">🏥 ' + esc(d.hospital || '') + '</p>' +
      '<p style="margin-bottom:8px">' + (on ? '<span class="chip green">🟢 On duty — live location</span>' : '<span class="chip">⚪ Off duty</span>') + '</p>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn primary sm" data-act="open-chat" data-id="' + d.id + '" data-name="Dr. ' + esc(d.name) + '">💬 Message</button>' +
      (tel ? '<a class="btn ghost sm" href="' + tel + '">📞 Call</a>' : '') +
      '<button class="btn ghost sm" data-act="locate-dr" data-id="' + d.id + '">📍 Locate</button><button class="btn ghost sm" data-nav="p-appts">📅 Book</button></div></div>';
  }).join('') || '<p class="muted">No doctors yet.</p>';
}
function renderDoctorMap() {
  if (ROLE !== 'patient') return;
  const online = STATE.doctors.filter(isOnline);
  const chips = $('#mapDocs');
  if (chips) chips.innerHTML = online.length ? online.map(d => '<button class="chip active" data-act="focus-dr" data-id="' + d.id + '">👨‍⚕️ Dr. ' + esc(d.name) + ' • ' + ago(d.location.updatedAt) + '</button>').join('') : '<span class="chip red">No doctors on duty right now</span>';
  const info = $('#mapInfo');
  if (info) info.textContent = 'Live GPS • shared only while ON DUTY • deleted on logout • older than 6 min = hidden.';
  const mapEl = $('#docMap');
  if (!mapEl || !mapEl.offsetParent) return;
  if (typeof L === 'undefined') { mapEl.innerHTML = '<p class="muted">Map library could not load.</p>'; return; }
  if (!cvMap) {
    cvMap = L.map('docMap').setView([13.0827, 80.2707], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(cvMap);
    markersLayer = L.layerGroup().addTo(cvMap);
  }
  setTimeout(() => { if (cvMap) cvMap.invalidateSize(); }, 80);
  markersLayer.clearLayers();
  online.forEach(d => {
    const mk = L.marker([d.location.lat, d.location.lng], { icon: L.divIcon({ className: 'doc-pin', html: '👨‍⚕️', iconSize: [34, 34] }) })
      .bindPopup('<b>Dr. ' + esc(d.name) + '</b><br>' + esc(d.specialization || '') + '<br><small>Updated ' + ago(d.location.updatedAt) + '</small><br><a href="https://www.google.com/maps/dir/?api=1&destination=' + d.location.lat + ',' + d.location.lng + '" target="_blank" rel="noopener">🧭 Directions</a>');
    mk.addTo(markersLayer);
    if (focusDoctorId === d.id) { cvMap.setView([d.location.lat, d.location.lng], 14); setTimeout(() => mk.openPopup(), 250); focusDoctorId = null; }
  });
}
document.addEventListener('click', e => {

  const fd = e.target.closest('[data-act="focus-dr"]');
  if (fd) { focusDoctorId = fd.dataset.id; renderDoctorMap(); }
  const ld = e.target.closest('[data-act="locate-dr"]');
  if (ld) {
    const d = STATE.doctors.find(x => x.id === ld.dataset.id);
    if (d && !isOnline(d)) toast('⚠️ Dr. ' + d.name + ' is OFF DUTY — location unavailable.');
    focusDoctorId = ld.dataset.id;
    const m = $('#docMap'); if (m) m.scrollIntoView({ behavior: 'smooth', block: 'center' });
    renderDoctorMap();
  }
});

/* ----- UPCOMING / TIMELINE ----- */
function formatDueDays(dueStr) {
  if (!dueStr) return '';
  const today = new Date(todayStr() + 'T00:00:00');
  const due = new Date(dueStr + 'T00:00:00');
  const diffTime = due - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due in 1 day';
  if (diffDays > 1) return `Due in ${diffDays} days`;
  if (diffDays === -1) return 'Overdue by 1 day';
  if (diffDays < -1) return `Overdue by ${Math.abs(diffDays)} days`;
  return `Due ${fmtD(dueStr)}`;
}

function renderUpcoming() {
  if (ROLE !== 'patient') return;
  const ua = $('#upAppts'); if (!ua) return;
  const appts = STATE.appts.filter(a => a.status === 'upcoming' && a.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date));

  if (!appts.length) {
    ua.innerHTML = `
      <div class="up-empty-state">
        <div class="up-empty-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="up-empty-text">
          <div class="up-empty-title">No upcoming appointments</div>
          <div class="up-empty-desc">You’re all caught up. New appointments will appear here.</div>
        </div>
        <button type="button" class="up-empty-action" data-nav="p-appts">View appointment history &rarr;</button>
      </div>`;
  } else {
    ua.innerHTML = `<div class="up-row-list">${appts.map(a => {
      const q = queueNumberOf(a);
      return `
        <div class="up-row">
          <div class="up-row-icon icon-blue">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="up-row-main">
            <div class="up-row-title-row">
              <span class="up-row-title">Dr. ${esc(a.doctorName)}</span>
              ${q ? `<span class="up-chip queue">🎟️ Q#${q}</span>` : ''}
            </div>
            <div class="up-row-meta">
              <span>📅 ${fmtD(a.date)}</span>
              <span class="up-dot">•</span>
              <span>🕒 ${esc(a.time)}</span>
              ${a.hospital ? `<span class="up-dot">•</span><span>🏥 ${esc(a.hospital)}</span>` : ''}
            </div>
          </div>
          <div class="up-row-right">
            <span class="up-chip badge-confirmed">Confirmed</span>
          </div>
        </div>`;
    }).join('')}</div>`;
  }

  const uf = $('#upFollow');
  const fus = STATE.timeline.filter(tt => tt.type === 'followup' && tt.due && tt.due >= todayStr()).sort((a, b) => a.due.localeCompare(b.due));
  if (!fus.length) {
    uf.innerHTML = `
      <div class="up-empty-state">
        <div class="up-empty-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
        <div class="up-empty-text">
          <div class="up-empty-title">No follow-up reminders</div>
          <div class="up-empty-desc">You have no pending care plan follow-ups at this time.</div>
        </div>
      </div>`;
  } else {
    uf.innerHTML = `<div class="up-row-list">${fus.map(f => {
      const dueBadge = formatDueDays(f.due);
      return `
        <div class="up-row">
          <div class="up-row-icon icon-amber">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="up-row-main">
            <div class="up-row-title">${esc(f.title)}</div>
            <div class="up-row-meta">
              <span>Due ${fmtD(f.due)}</span>
              ${f.description ? `<span class="up-dot">•</span><span>${esc(f.description)}</span>` : ''}
            </div>
          </div>
          <div class="up-row-right">
            <span class="up-chip badge-due">${dueBadge}</span>
          </div>
        </div>`;
    }).join('')}</div>`;
  }

  const um = $('#upMeds');
  const meds = STATE.meds.filter(m => m.active !== false);
  if (!meds.length) {
    um.innerHTML = `
      <div class="up-empty-state">
        <div class="up-empty-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.5 20.5a5 5 0 1 1-7.07-7.07l9.19-9.19a5 5 0 1 1 7.07 7.07z"></path>
            <line x1="8.54" y1="11.46" x2="15.61" y2="18.54"></line>
          </svg>
        </div>
        <div class="up-empty-text">
          <div class="up-empty-title">No active medications</div>
          <div class="up-empty-desc">Your active prescriptions will appear here.</div>
        </div>
      </div>`;
  } else {
    um.innerHTML = `<div class="up-row-list">${meds.map(m => {
      const isVerified = m.verified !== false && m.verified !== 'false';
      const statusBadge = isVerified 
        ? `<span class="up-chip badge-verified">Verified • Ready to take</span>`
        : `<span class="up-chip badge-pending">Verification pending</span>`;
      const dosageText = m.dosage || (m.strength ? `${m.strength}` : 'As prescribed');
      return `
        <div class="up-row">
          <div class="up-row-icon icon-emerald">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.5 20.5a5 5 0 1 1-7.07-7.07l9.19-9.19a5 5 0 1 1 7.07 7.07z"></path>
              <line x1="8.54" y1="11.46" x2="15.61" y2="18.54"></line>
            </svg>
          </div>
          <div class="up-row-main">
            <div class="up-row-title">${esc(m.name)}</div>
            <div class="up-row-meta">
              <span>${esc(dosageText)}</span>
              ${m.durationDays ? `<span class="up-dot">•</span><span>${esc(m.durationDays)} days</span>` : ''}
            </div>
          </div>
          <div class="up-row-right">
            ${statusBadge}
          </div>
        </div>`;
    }).join('')}</div>`;
  }
}
/* ----- TIMELINE (FIX: shows date + TIME, newest first) ----- */
function tlTime(tt) {
  if (!tt || !tt.createdAt) return '';
  const d = new Date(tt.createdAt);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function renderTimeline() {
  const el = $('#tlList'); if (!el || ROLE !== 'patient') return;
  const list = STATE.timeline.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));
  el.innerHTML = list.map(tt => '<div class="tl-item"><span class="tl-year">📅 ' + fmtD(tt.date) + (tlTime(tt) ? ' &nbsp;🕒 ' + tlTime(tt) : '') + '</span><b>' + (tt.icon || '•') + ' ' + esc(tt.title) + '</b><p>' + esc(tt.description || '') + '</p></div>').join('') || '<p class="muted">Submit your first case to start your journey 🚀</p>';
}

/* ----- RICH QR ----- */
function renderQR() {
  if (ROLE !== 'patient') return;
  $('#qrHid').textContent = ME.healthId;
  $('#qrName').textContent = ME.name + ' • ' + ageOf(ME.dob) + ' • ' + (ME.bloodGroup || '');
  const nextAppt = STATE.appts.filter(a => a.status === 'upcoming' && a.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date))[0];
  const q = nextAppt ? queueNumberOf(nextAppt) : null;
  const payload = {
    app: 'MHD-Hospital', healthId: ME.healthId, name: ME.name, age: ageOf(ME.dob), gender: ME.gender,
    bloodGroup: ME.bloodGroup || null, allergies: ME.allergies || null, conditions: ME.conditions || null,
    emergencyContact: (ME.emergencyName || '') + ' ' + (ME.emergencyPhone || ''),
    issuedDate: new Date().toLocaleDateString('en-IN'), issuedTime: new Date().toLocaleTimeString('en-IN'),
    todayQueue: q ? { doctor: nextAppt.doctorName, date: nextAppt.date, time: nextAppt.time, queue: q, hospital: nextAppt.hospital } : null
  };
  const qc = $('#qrContents');
  if (qc) qc.innerHTML = kvRows([['Identity', ME.name + ' • ' + ageOf(ME.dob) + ' • ' + ME.gender], ['Blood Group', ME.bloodGroup || '—'], ['Allergies', ME.allergies || 'None'], ['Conditions', ME.conditions || 'None'], ['Emergency Contact', payload.emergencyContact || '—'], ['Issued (date • time)', payload.issuedDate + ' • ' + payload.issuedTime], ['🎟️ Today Queue', q ? '#' + q + ' — ' + nextAppt.doctorName + ' at ' + nextAppt.time : 'No appointment today'], ['Mode', '🚑 Emergency = critical info only • 📖 Full record = consent required']]);
  const box = $('#qrBox'); if (!box) return;
  box.innerHTML = '';
  try { new QRCode(box, { text: JSON.stringify(payload), width: 190, height: 190, colorDark: '#111', colorLight: '#fff', correctLevel: QRCode.CorrectLevel.M }); } catch (e) { box.textContent = 'QR library failed to load.'; }
}

/* ----- EMERGENCY / PRIVACY ----- */
function openEmergency(withLookup) {
  $('#emOverlay').classList.remove('hidden');
  $('#emLookupRow').classList.toggle('hidden', !withLookup);
  if (!withLookup) { ME._meds = STATE.meds.filter(m => m.active !== false).map(m => m.name).join(', '); renderEmCard(ME); }
}
function renderEmCard(p) {
  $('#emBody').innerHTML = [['🩸 Blood Group', p.bloodGroup || '—'], ['⚠️ Critical Allergies', p.allergies || 'None recorded'], ['💊 Current Medicines', p._meds || '—'], ['🏥 Major Conditions', p.conditions || 'None recorded'], ['🔪 Major History', ((p.surgeries || 'None').split('\n')[0]) || '—'], ['📞 Emergency Contact', (p.emergencyName || '—') + ' ' + (p.emergencyPhone || '')]].map(([k, v]) => '<div class="card" style="margin:0"><b>' + k + '</b><p>' + esc(v) + '</p></div>').join('');
}
document.addEventListener('click', async e => {
  if (e.target.closest('[data-act="emergency"]')) return openEmergency(false);
  if (e.target.closest('[data-act="auth-emergency"]')) {
    if (!auth.currentUser) { toast('Please login first to use Emergency Access (security 🔐).'); return; }
    return openEmergency(true);
  }
  if (e.target.closest('[data-act="close-em"]')) $('#emOverlay').classList.add('hidden');
  if (e.target.closest('[data-act="em-lookup"]')) {
    const hid = $('#emHealthId').value.trim().toUpperCase(); if (!hid) return;
    try {
      const s = await db.collection('users').where('healthId', '==', hid).limit(1).get();
      if (s.empty) return toast('⚠️ Health ID not found.');
      const p = s.docs[0].data(); p.id = s.docs[0].id;
      const ms = await db.collection('medicines').where('patientId', '==', p.id).get();
      p._meds = ms.docs.map(d => d.data().name).filter(n => n).join(', ') || '—';
      await logAccess(p.id, '🚑 Emergency record viewed');
      renderEmCard(p);
    } catch (err) { toast('⚠️ ' + errMsg(err)); }
  }
  if (e.target.closest('[data-act="close-modal"]')) closeModal();
});
function renderConsent() {
  const el = $('#consentList'); if (!el || ROLE !== 'patient') return;
  el.innerHTML = STATE.doctors.map(d => {
    const key = ME.id + '_' + d.id;
    const c = STATE.consents.find(x => x.id === key);
    const allowed = !c || c.status !== 'revoked';
    return '<div class="list-item"><div class="li-main"><b>👨‍⚕️ Dr. ' + esc(d.name) + '</b><small>' + esc(d.specialization || '') + ' • ' + esc(d.hospital || '') + ' • Purpose: Consultation access</small></div><div class="li-actions"><span class="chip ' + (allowed ? 'green' : 'red') + '">' + (allowed ? '✅ Allowed' : '❌ Revoked') + '</span><button class="btn ' + (allowed ? 'danger' : 'primary') + ' sm" data-act="toggle-consent" data-id="' + key + '" data-name="Dr. ' + esc(d.name) + '" data-allowed="' + allowed + '">' + (allowed ? 'Revoke' : 'Allow') + '</button></div></div>';
  }).join('') || '<p class="muted">No doctors registered yet.</p>';
}
document.addEventListener('click', async e => {
  const tt = e.target.closest('[data-act="toggle-consent"]'); if (!tt) return;
  const parts = tt.dataset.id.split('_');
  const allowed = tt.dataset.allowed === 'true';
  try {
    await db.collection('consents').doc(tt.dataset.id).set({ patientId: parts[0], doctorId: parts[1], doctorName: tt.dataset.name, status: allowed ? 'revoked' : 'allowed', updatedAt: Date.now() }, { merge: true });
    await notify(parts[1], allowed ? '🚫 Access Revoked' : '✅ Access Allowed', 'Patient ' + ME.name + ' ' + (allowed ? 'revoked' : 'granted') + ' your access.');
    toast(allowed ? 'Access revoked 🔒' : 'Access allowed ✅');
    const c = await db.collection('consents').where('patientId', '==', ME.id).get();
    STATE.consents = c.docs.map(d => ({ id: d.id, ...d.data() }));
    renderConsent();
  } catch (err) { toast('⚠️ ' + errMsg(err)); }
});
function renderAccess() {
  const el = $('#accessList'); if (!el || ROLE !== 'patient') return;
  el.innerHTML = STATE.access.map(a => '<div class="list-item"><div class="li-main"><b>' + (a.actorRole === 'doctor' ? '👨‍⚕️' : a.actorRole === 'hospital' ? '🏥' : '🤖') + ' ' + esc(a.actorName) + '</b><small>' + esc(a.action) + '</small></div><small class="muted">' + fmtDT(a.createdAt) + '</small></div>').join('') || '<p class="muted">No access events yet.</p>';
}

/* ----- BILLING: PATIENT ----- */
function billItemsStr(b) { return (b.items || []).map(i => esc(i.label) + ' ₹' + esc(i.amount)).join(' • '); }
function renderPBilling() {
  if (ROLE !== 'patient') return;
  const s = $('#pbSummary'), list = $('#pbList');
  const bs = STATE.bills || [];
  const total = bs.reduce((a, b) => a + Number(b.total || 0), 0);
  const paid = bs.filter(b => b.status === 'paid');
  const pend = bs.filter(b => b.status !== 'paid');
  if (s) s.innerHTML = [['Total billed', total, 'mc-blue'], ['Paid', paid.reduce((a, b) => a + Number(b.total || 0), 0), 'mc-green'], ['Pending', pend.reduce((a, b) => a + Number(b.total || 0), 0), 'mc-red']].map(([l, v, c]) => '<div class="mini-card"><span class="mc-ico ' + c + '">₹</span><span><span class="mc-label">' + l + '</span><b>₹' + v + '</b></span></div>').join('');
  if (list) list.innerHTML = bs.map(b => '<div class="list-item"><div class="li-main"><b>' + esc(b.type || 'bill') + ' — ₹' + esc(b.total) + '</b><small>' + billItemsStr(b) + (b.doctorName ? ' • ' + esc(b.doctorName) : '') + (b.hospital ? ' • ' + esc(b.hospital) : '') + ' • ' + fmtDT(b.createdAt) + '</small></div><div class="li-actions">' + (b.status === 'paid' ? '<span class="chip ready">✓ Paid</span>' : '<span class="chip waiting">Pending</span><button class="btn primary sm" data-act="pay-bill" data-id="' + b.id + '">Pay</button>') + '</div></div>').join('') || '<p class="muted">No bills yet — they appear here in real time when your doctor or hospital bills you.</p>';
}
document.addEventListener('click', async e => {
  const pb = e.target.closest('[data-act="pay-bill"]');
  if (pb) { try { await db.collection('bills').doc(pb.dataset.id).update({ status: 'paid', paidAt: Date.now() }); toast('✅ Bill marked as paid'); } catch (err) { toast('⚠️ ' + errMsg(err)); } }
});

/* ============================================================
   HEALTH TRACKING — PATIENT VIEW (read-only)
   ============================================================ */
const TREND_COLORS = { temp: '#ea580c', bp: '#2563eb', hr: '#dc2626', wt: '#16a34a' };
function parseBp(bp) { if (!bp) return null; const m = String(bp).match(/(\d+)\s*\/\s*(\d+)/); return m ? { s: +m[1], d: +m[2] } : null; }
function num(v) { const n = Number(v); return isNaN(n) ? null : n; }
function sparkSVG(vals, color) {
  if (!vals || vals.length < 2) return '<div class="spark muted sm-txt" style="display:flex;align-items:center;justify-content:center">Not enough data</div>';
  const w = 120, h = 36, pad = 4;
  const min = Math.min(...vals), max = Math.max(...vals), range = (max - min) || 1;
  const pts = vals.map((v, i) => (pad + i * (w - 2 * pad) / (vals.length - 1)).toFixed(1) + ',' + (h - pad - ((v - min) / range) * (h - 2 * pad)).toFixed(1)).join(' ');
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none"><polyline fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="' + pts + '"/></svg>';
}
function seriesOf(key) { return STATE.vitals.slice(0, 7).reverse().map(v => key === 'bp' ? (parseBp(v.bp) ? parseBp(v.bp).s : null) : num(v[key])).filter(x => x !== null); }
function deltaHTML(vals, unit) {
  if (vals.length < 2) return '<span class="t-delta flat">—</span>';
  const d = vals[vals.length - 1] - vals[vals.length - 2];
  if (d === 0) return '<span class="t-delta flat">→ no change</span>';
  return d > 0 ? '<span class="t-delta up">↑ ' + Math.abs(d).toFixed(1) + ' ' + unit + '</span>' : '<span class="t-delta down">↓ ' + Math.abs(d).toFixed(1) + ' ' + unit + '</span>';
}
function renderVitals() {
  if (ROLE !== 'patient') return;
  const today = $('#vtToday'); if (today) today.textContent = '📅 ' + new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const lv = STATE.vitals[0] || null;
  const bp = lv ? parseBp(lv.bp) : null;
  const up = $('#ovUpdated');
  if (up) up.textContent = lv ? ('Last updated: ' + fmtDT(lv.createdAt) + (lv.doctorName ? ' • by ' + lv.doctorName : '')) : 'No health data yet — your doctor will add it here.';
  const rows = [
    ['❤️', 'Blood Pressure', bp ? (bp.s + '/' + bp.d) : '—', 'mmHg'],
    ['🌡️', 'Temperature', (lv && num(lv.temp) != null) ? num(lv.temp) : '—', '°F'],
    ['💓', 'Heart Rate', (lv && num(lv.hr) != null) ? num(lv.hr) : '—', 'bpm'],
    ['⚖️', 'Weight', (lv && num(lv.wt) != null) ? num(lv.wt) : '—', 'kg'],
    ['📋', 'Symptoms', lv ? (lv.sym || '—') : '—', '']
  ];
const or = $('#ovRows');
  if (or) or.innerHTML = rows.map(([i, n, v, u]) => '<div class="ov-row"><span class="ov-ico">' + i + '</span><span class="ov-name">' + n + '</span><span class="ov-val">' + esc(v) + (u ? '<small>' + u + '</small>' : '') + '</span></div>').join('');
  const rc = $('#recentVitals');
  if (rc) rc.innerHTML = STATE.vitals.slice(0, 6).map(v => { const p = parseBp(v.bp);
    return '<div class="list-item"><div class="li-main"><b>' + fmtD(v.date) + '</b><small>🌡️ ' + esc(v.temp || '—') + '°F • BP ' + (p ? p.s + '/' + p.d : '—') + ' • ❤️ ' + esc(v.hr || '—') + ' bpm • ⚖️ ' + esc(v.wt || '—') + ' kg' + (v.sym ? ' • ' + esc(v.sym) : '') + '</small></div><small class="muted">' + esc(v.doctorName || '') + '</small></div>'; }).join('') || '<p class="muted">No records yet — your doctor will add them.</p>';
  const tg = $('#trendGrid');
  if (tg) {
    const defs = [
      { key: 'temp', name: '🌡️ Temperature', unit: '°F' },
      { key: 'bp', name: '🩸 Blood Pressure', unit: 'mmHg' },
      { key: 'hr', name: '❤️ Heart Rate', unit: 'bpm' },
      { key: 'wt', name: '⚖️ Weight', unit: 'kg' }
    ];
    tg.innerHTML = defs.map(df => { const vals = seriesOf(df.key); return '<div class="trend-card"><div class="t-name">' + df.name + '</div><div class="t-val">' + (vals.length ? vals[vals.length - 1] : '—') + ' <small class="muted">' + df.unit + '</small></div>' + deltaHTML(vals, df.unit) + sparkSVG(vals, TREND_COLORS[df.key]) + '</div>'; }).join('');
  }
}

/* ============================================================
   AI CHATBOT — 66 COMMON Q&As
   ============================================================ */
const CB_KB = [
 [['book','appointment','slot','schedule'],['📅 To book: open **Appointments** → pick doctor → date (calendar) → time slot → Confirm. Your 🎟️ queue number appears on the dashboard, in your QR, and on the doctor\'s screen.']],
 [['reschedule','change appointment','postpone'],['🔄 To change an appointment: open **Appointments → Upcoming → Cancel**, then book a new slot. Cancelling instantly releases the slot for others.']],
 [['cancel appointment','cancel booking'],['❌ Open **Appointments → Upcoming → Cancel**. The time slot is released immediately and can be rebooked.']],
 [['queue','token','my number','q number'],['🎟️ Your queue number is on the dashboard (Today\'s Schedule), inside your QR, and on the doctor\'s screen. It is assigned per doctor, per day.']],
 [['doctor location','where is','map','locate','gps','on duty'],['🗺️ Open **My Doctors** → the live map is at the bottom. Doctors appear only while 🟢 ON DUTY. You can also 📞 call or 💬 message them from the same page.']],
 [['call','phone','contact doctor','talk to doctor'],['📞 Open **My Doctors** → tap **📞 Call** (dialer opens) or **💬 Message** for secure in-app chat.']],
 [['active medicine','my medicine','tablet','medication','taking'],['💊 Open **Medicines** to see all active medicines. 🟩 = doctor-verified (ready to take), 🔴 = pending verification.']],
 [['add medicine','new medicine','report medicine'],['💊 Open **Medicines** → fill name, dosage, start date & days → **+ Add Medicine**. It stays 🔴 until a doctor verifies it → then turns 🟩 "Ready to take ✓".']],
 [['verify medicine','verified','green medicine','red medicine','pending medicine'],['🟩 A medicine becomes "Ready to take ✓" only after your doctor verifies it. Until then it shows 🔴 pending — do NOT take unverified new medicines.']],
 [['stop medicine','restart medicine','discontinue'],['⏹️ On the **Medicines** page, tap **Stop** to pause a medicine or **Restart** to resume it. Your doctor can see this.']],
 [['dose','dosage','how to take','before food','after food'],['💊 Dosage instructions are shown on each medicine card (e.g. "1 tablet after breakfast"). Follow your doctor\'s verified instructions exactly.']],
 [['missed dose','forgot tablet','skipped medicine'],['⏰ If you missed a dose, do not double-dose. Mark what you actually took using **Mark Taken**, and ask your doctor via 💬 Messages.']],
 [['result','report','lab','test result','xray','x-ray','scan result','blood test'],['Open **My Results** — every result from your doctor & hospital is listed. Tap **View Detail** to see the full document and metadata.']],
 [['scan','upload document','photo document','digitize','paper'],['📷 Document scanning is now done by the **hospital** — upload a photo via the Hospital portal (Upload Result) and it appears in your **My Results** instantly.']],
 [['prescription'],['📋 Prescriptions are added by your doctor during case review. They appear in **My Case** (🟩 section) and as verified medicines in **Medicines**.']],
 [['case','chief complaint','submit case','new case'],['📝 Open **My Case** → fill the form (voice 🎙️ supported) → **Submit Case to Doctor**. Status shows ● Waiting → 🟩 Reviewed.']],
 [['case status','review status','waiting'],['🟡 Your case status is shown on the Dashboard banner and in **My Case**. When the doctor reviews it, you get a notification and it turns 🟩.']],
 [['doctor notes','clinical notes','what did doctor say','review notes'],['🩺 After review, the doctor\'s notes, prescription and tests appear in **My Case** under the 🟩 Doctor-Verified section.']],
 [['follow-up','followup','next visit reminder'],['● Follow-up reminders appear as an amber banner on the Dashboard and in **Upcoming Events** with the due date.']],
 [['health overview','vitals','my bp','blood pressure','temperature','heart rate','weight'],['🩺 Open **Health Overview** — all values are entered by your doctor: BP, Temperature (°F), Heart Rate, Weight and Symptoms, with trends.']],
 [['who entered','who added','health data source'],['🩺 All health data is entered **only by doctors**. Each record shows "by Dr. [name]" and the exact time.']],
 [['emergency','sos','accident now','urgent'],['🚑 Tap the red **EMERGENCY** button (dashboard or sidebar). It shows only critical info: blood group, allergies, medicines, conditions & emergency contact.']],
 [['emergency contact'],['📞 Your emergency contact is shown in Emergency Mode and in your QR. Update it in **Settings → Edit Profile**.']],
 [['blood group','blood type'],['🩸 Your blood group on record: **dynamicBlood** — update it in Settings if it\'s wrong.']],
 [['allergy','allergic'],['⚠️ Your recorded allergies: check **My Case → Allergy History**. They are also shown to doctors and in Emergency Mode.']],
 [['surgery','operation history','past operation'],['🔪 **My Case → Surgery History** lists all recorded operations with year, hospital and doctor.']],
 [['accident','injury history'],['🚗 Accident history is in **My Case → Medical History**.']],
 [['family history','hereditary','parents disease'],['👨‍👩‍👦 **My Case → Medical History → Family History**. Update via Settings if needed.']],
 [['height','weight','bmi'],['📏 Your height & weight are in your profile (Settings). Doctor-measured weight appears in **Health Overview**.']],
 [['pain level'],['📉 Pain tracking is recorded by your doctor during Health Input. Trend charts appear in **Health Overview**.']],
 [['bill','billing','charges','fees','cost'],['💰 Open **Billing** — see total, paid and pending. Tap **Pay** to mark a bill paid. Bills arrive in real time.']],
 [['pay','payment','pay bill'],['💰 In **Billing**, tap **Pay** on any pending bill. It updates instantly for the hospital too.']],
 [['pending bill','due amount'],['💰 Pending bills are highlighted in red in **Billing** and counted on your dashboard.']],
 [['consent','who can see','privacy','revoke access'],['🔐 Open **Privacy & Access** → Consent Center → **Revoke** any doctor. Blocked doctors see "Unauthorized Access Blocked" and it is logged.']],
 [['who accessed','access history','audit','viewed my record'],['👁️ **Privacy & Access → Access History** shows every doctor/hospital view of your record, with name and time.']],
 [['qr','qr code','scan me'],['📱 Open **My QR** — it contains your ID, blood group, allergies, emergency contact, date/time and today\'s 🎟️ queue. Emergency mode shows only critical data.']],
 [['timeline','journey','history timeline'],['🕐 Open **Timeline** — your full medical journey: cases, consultations, prescriptions, results — auto-updated.']],
 [['upcoming events','what is scheduled'],['🗓️ Open **Upcoming** — appointments, follow-up reminders and active medicines in one place.']],
 [['notification','alert','bell'],['🔔 Tap the 🔔 (top right) — new notifications appear under 🆕 New. Opening the bell clears the red dot.']],
 [['profile','my details','my info','edit profile'],['👤 Tap the 👤 icon (top right) for your quick profile card — name, age, blood group, contacts — then **Edit Profile & Settings**.']],
 [['change photo','upload photo','profile picture'],['🖼️ **Settings → My Photo** → choose image → **Save Changes**. Auto-compressed and visible to doctors & hospital.']],
 [['change language','tamil','hindi','telugu','malayalam','kannada','bengali','marathi','gujarati','punjabi'],['🌐 Use the language dropdown (top right or Settings) — 10 Indian languages supported.']],
 [['dark mode','theme','light mode','pink','appearance'],['🎨 Use the theme dropdown (top right or Settings): Light / Dark / Pink. Text size A−/A/A+ is in Settings.']],
 [['password','reset password','forgot password'],['🔑 On the login screen tap **Forgot password?** after entering your email — a reset link is emailed to you.']],
 [['login problem','cannot login','login issue'],['🔑 Check: correct role selected, correct email, internet on. Still stuck? Use Forgot password? or the one-click Demo buttons.']],
 [['register','sign up','create account','health id'],['🆔 On the login screen tap **Register** → choose role → fill details → Create Health ID. Patients get an MHD-XXXXXX ID instantly.']],
 [['aadhaar','aadhar'],['🆔 Aadhaar is required at registration (12 digits) and is always shown masked (XXXX XXXX 1234) for privacy.']],
 [['health id','mhd id'],['🆔 Your MHD Health ID is shown on the Dashboard, in **My Case**, in Settings, and inside your QR. It never changes.']],
 [['update profile','edit details','change phone','change address'],['⚙️ Settings → edit any field → **Save Changes**. Fixed IDs (Health ID / Aadhaar) need hospital admin help.']],
 [['hospital timing','open hours','working hours'],['🏥 MHD Hospital operates 24×7 for emergencies. OP appointments follow booked slots (09:00 AM – 05:00 PM).']],
 [['doctor available','available doctor','duty'],['🟢 **My Doctors** shows who is ON DUTY right now with live location. Off-duty doctors are hidden from the map for privacy.']],
 [['video consultation','video call'],['📹 Book an appointment with type **Video Consultation** — your doctor will connect via the 💬 Messages channel at the slot time.']],
 [['lab test','recommended test','blood test advice'],['Recommended tests appear in **My Case** (🟩 Tests) after your doctor reviews. The hospital uploads results to your **My Results**.']],
 [['diet','food','nutrition'],['🥗 Ask your doctor via 💬 Messages for diet advice specific to your condition. The assistant cannot give medical advice.']],
 [['side effect','medicine reaction'],['⚠️ Contact your doctor immediately via 💬 Messages or 📞 Call for any medicine reaction. For severe reactions use 🚑 Emergency.']],
 [['fever','cold','cough','headache'],['🤖 I manage records, not diagnoses. Please submit a **New Case** describing your symptoms — your doctor will review it.']],
 [['insurance','scheme','ayushman','government scheme'],['🏛️ Scheme suggestions appear on your Dashboard (AI-assisted) based on age, income & conditions. Official confirmation happens via the hospital/government portal.']],
 [['delete account','remove account'],['🗑️ Account deletion needs hospital admin assistance for medical-legal record retention.']],
 [['data safety','data secure','is my data safe'],['🔐 Yes — consent-gated access, full audit trail, masked Aadhaar, and doctor-verified records. Patient owns the data.']],
 [['download record','export','pdf'],['Result documents can be viewed full-screen (tap 👁️ View Detail). Export/print support is on the roadmap.']],
 [['reminder medicine','medicine reminder'],['⏰ Medicine times appear in **Today\'s Schedule** (e.g. after breakfast → 08:00 AM). Tap **Mark Taken** when done.']],
 [['chatbot','what can you do','help'],['🤖 I answer questions about appointments, queue, medicines, results, health overview, billing, privacy, emergency and more — 66+ topics. I never give diagnoses.']],
 [['doctor review my case','review pending','how long review'],['🟡 Reviews are typically done before your consultation. You\'ll get a 🔔 notification the moment Dr. reviews your case.']],
 [['hospital name','about hospital','mhd'],['🏥 **MHD Hospital — My Health Defense Hospital 24×7**, Built For Ministry of Ayush. One Patient. One Medical Journey.']],
 [['pay online','upi','card'],['💳 Bill **Pay** marks payment instantly in this demo. UPI/card gateway integration is on the roadmap.']],
 [['test report detail','open report','see report'],['**My Results → View Detail** opens the full-screen document with type, date, hospital, doctor and verification status.']]
];
function chatbotAnswer(q) {
  q = (q || '').toLowerCase();
  const next = STATE.appts.filter(a => a.status === 'upcoming' && a.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date))[0];
  if ((q.includes('next appointment') || q.includes('my appointment')) && next) {
    const n = queueNumberOf(next);
    return '📅 Your next appointment: <b>' + esc(next.doctorName) + '</b> on <b>' + fmtD(next.date) + '</b> at <b>' + esc(next.time) + '</b>' + (n ? ' — 🎟️ Queue #' + n : '') + '.';
  }
  if (q.includes('dynamicblood')) return '🩸 Blood group on record: <b>' + esc(ME.bloodGroup || 'not recorded') + '</b>';
  let best = null, bestScore = 0;
  CB_KB.forEach(([keys, ans]) => {
    let score = 0;
    keys.forEach(k => { if (q.includes(k)) score += k.length; });
    if (score > bestScore) { bestScore = score; best = ans; }
  });
  if (best) {
    if (best.includes('dynamicBlood')) return best.replace('dynamicBlood', esc(ME.bloodGroup || 'not recorded'));
    return best;
  }
  return '🤖 I know 66+ topics — try: "book appointment", "queue number", "my BP", "add medicine", "my results", "billing", "who accessed my record", "emergency", "change language"… For medical advice please consult your doctor.';
}

/* ----- SEARCH ----- */
const topSearchEl = $('#topSearch');
if (topSearchEl) {
  topSearchEl.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const box = $('#searchResults');
    if (!box) return;
    if (!q) { box.classList.add('hidden'); return; }
    go('p-dash', { silent: true }); box.classList.remove('hidden');
    const hit = s => (s || '').toLowerCase().includes(q);
    let html = '';
    STATE.timeline.filter(tt => hit(tt.title) || hit(tt.description)).forEach(tt => html += '<div class="list-item"><div class="li-main"><b>' + (tt.icon || '•') + ' ' + esc(tt.title) + '</b><small>🕐 ' + esc(tt.description || '') + '</small></div><small class="muted">' + fmtD(tt.date) + '</small></div>');
    STATE.meds.filter(m => hit(m.name)).forEach(m => html += '<div class="list-item"><div class="li-main"><b>💊 ' + esc(m.name) + '</b><small>' + esc(m.dosage || '') + '</small></div>' + medChip(m) + '</div>');
    STATE.reports.filter(r => hit(r.title) || hit(r.type)).forEach(r => html += '<div class="list-item"><div class="li-main"><b>' + (r.fileData ? '📄' : '🧪') + ' ' + esc(r.title) + '</b><small>' + esc(r.type) + '</small></div><button class="btn ghost sm" data-act="view-doc" data-id="' + r.id + '">👁️ View</button></div>');
    const bodyEl = $('#searchResultsBody');
    if (bodyEl) bodyEl.innerHTML = html || '<p class="muted">No matches found.</p>';
  });
}

/* ----- CHATBOT UI ----- */
document.addEventListener('click', e => {

  if (e.target.closest('[data-act="chatbot"]')) $('#cbModal').classList.remove('hidden');
  if (e.target.closest('[data-act="close-cb"]')) $('#cbModal').classList.add('hidden');
  if (e.target.closest('[data-act="send-cb"]')) sendCB();
});
const cbInEl = $('#cbInput');
if (cbInEl) cbInEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendCB(); });
function cbAdd(text, me) { const d = document.createElement('div'); d.className = 'msg ' + (me ? 'me' : 'bot'); d.innerHTML = text; const m = $('#cbMsgs'); if (m) { m.appendChild(d); m.scrollTop = 1e6; } }
function sendCB() { const inEl = $('#cbInput'); if (!inEl) return; const q = inEl.value.trim(); if (!q) return; inEl.value = ''; cbAdd(esc(q), true); setTimeout(() => cbAdd(chatbotAnswer(q)), 350); }

/* ----- PATIENT ↔ DOCTOR CHAT ----- */
document.addEventListener('click', e => {

  const oc = e.target.closest('[data-act="open-chat"]');
  if (oc) openChat(oc.dataset.id, oc.dataset.name);
  if (e.target.closest('[data-act="close-chat"]')) { const cm = $('#chatModal'); if (cm) cm.classList.add('hidden'); }
  if (e.target.closest('[data-act="send-chat"]')) sendChat();
});
const chatInEl = $('#chatInput');
if (chatInEl) chatInEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
function openChat(otherId, otherName) {
  CHAT_WITH = { id: otherId, name: otherName };
  $('#chatTitle').textContent = '💬 ' + otherName;
  $('#chatModal').classList.remove('hidden'); $('#chatMsgs').innerHTML = '';
  const tid = [ME.id, otherId].sort().join('_');
  db.collection('threads').doc(tid).set({ ids: [ME.id, otherId], lastAt: Date.now() }, { merge: true }).catch(() => {});
  if (chatUnsub) chatUnsub();
  chatUnsub = db.collection('threads').doc(tid).collection('m').orderBy('at').onSnapshot(s => {
    $('#chatMsgs').innerHTML = s.docs.map(d => { const m = d.data(); return '<div class="msg ' + (m.from === ME.id ? 'me' : 'them') + '">' + esc(m.text) + '<br><small style="opacity:.7">' + new Date(m.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + '</small></div>'; }).join('');
    $('#chatMsgs').scrollTop = 1e6;
  }, console.error);
}
function sendChat() {
  const tt = $('#chatInput').value.trim(); if (!tt || !CHAT_WITH) return; $('#chatInput').value = '';
  const tid = [ME.id, CHAT_WITH.id].sort().join('_');
  db.collection('threads').doc(tid).collection('m').add({ from: ME.id, fromRole: ROLE, text: tt, at: Date.now() });
  notify(CHAT_WITH.id, '💬 New message', (ROLE === 'doctor' ? 'Dr. ' + ME.name : ME.name) + ': ' + tt.slice(0, 60));
}

/* ============ SETTINGS ============ */
function photoBlockHTML() {
  const icon = ROLE === 'patient' ? '🧑' : ROLE === 'doctor' ? '👨‍⚕️' : '🏥';
  const preview = ME.photo ? '<img id="photoPrev" src="' + ME.photo + '" class="big-avatar" style="object-fit:cover">' : '<div id="photoPrev" class="big-avatar" style="display:flex;align-items:center;justify-content:center">' + icon + '</div>';
  return preview + '<div style="flex:1"><input type="file" id="photoInput" accept="image/*" class="input">' +
    (ME.photo ? '<button class="btn ghost sm" data-act="remove-photo" style="margin-top:6px">Remove photo</button>' : '') +
    '<p class="hint">Pick a photo → auto-compressed → press <b>Save Changes</b>.</p></div>';
}
document.addEventListener('change', e => {
  if (!e.target || e.target.id !== 'photoInput') return;
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      try {
        const cv = document.createElement('canvas'); cv.width = 180; cv.height = 180;
        const ctx = cv.getContext('2d');
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 180, 180);
        pendingPhoto = cv.toDataURL('image/jpeg', 0.65);
        const prev = $('#photoPrev');
        if (prev) prev.outerHTML = '<img id="photoPrev" src="' + pendingPhoto + '" class="big-avatar" style="object-fit:cover">';
        toast('Photo ready — now press "Save Changes" ✅');
      } catch (err) { toast('⚠️ Could not process the image.'); }
    };
    img.onerror = () => toast('⚠️ Invalid image file.');
    img.src = ev.target.result;
  };
  reader.onerror = () => toast('⚠️ Could not read the file.');
  reader.readAsDataURL(file);
});
function renderSettings() {
  try {
    const sp = $('#settingsProfile'); if (!sp) return;
    pendingPhoto = null;
    const pb = $('#photoBlock');
    if (pb) pb.innerHTML = photoBlockHTML();
    const fixed = '<div class="kv" style="margin:8px 0">' + (ROLE === 'patient' ? kvRows([['Health ID (fixed)', ME.healthId || '—'], ['Aadhaar (fixed)', maskAadhaar(ME.aadhaar)], ['Email (fixed)', ME.email || '—']]) : ROLE === 'doctor' ? kvRows([['Reg No (fixed)', ME.regNo || '—'], ['Email (fixed)', ME.email || '—']]) : kvRows([['License', ME.licenseNo || '—'], ['Email (fixed)', ME.email || '—']])) + '</div>';
    let fields = [];
    if (ROLE === 'patient') {
      fields = [['name', 'Full Name'], ['phone', 'Phone'], ['address', 'Address'], ['emergencyName', 'Emergency Contact Name'], ['emergencyPhone', 'Emergency Phone'], ['bloodGroup', 'Blood Group'], ['heightCm', 'Height (cm)'], ['weightKg', 'Weight (kg)'], ['allergies', 'Allergies'], ['conditions', 'Existing Conditions'], ['surgeries', 'Surgeries (one per line)'], ['accidents', 'Accidents'], ['familyHistory', 'Family History'], ['income', 'Annual Income']];
    } else if (ROLE === 'doctor') {
      fields = [['name', 'Doctor Name'], ['specialization', 'Specialization'], ['experience', 'Experience (years)'], ['hospital', 'Hospital'], ['phone', 'Phone (patients can call)']];
    } else {
      fields = [['name', 'Hospital Name'], ['adminName', 'Admin Name'], ['phone', 'Phone'], ['address', 'Address']];
    }
    sp.innerHTML =
      '<label class="label">Date of Birth (year & month dropdown + calendar)</label><input type="date" id="pfDob" class="input">' +
      fields.map(([k, label]) => '<label class="label">' + label + '</label><div class="mic-row"><input class="input" id="pf_' + k + '" data-pf="' + k + '" value="' + esc(ME[k] || '') + '"><button type="button" class="mic" data-act="mic" data-target="pf_' + k + '" title="Voice input">🎙️</button></div>').join('') +
      fixed +
      '<button class="btn primary" data-act="save-profile">💾 Save Changes</button>';
    const dobInput = $('#pfDob');
    if (dobInput) dobInput.value = ME.dob || '';
    mountDatePickers($('#pg-settings'));
  } catch (err) { console.error(err); toast('⚠️ Settings error: ' + err.message); }
}
document.addEventListener('click', async e => {
  if (e.target.closest('[data-act="remove-photo"]')) {
    try {
      await db.collection('users').doc(ME.id).update({ photo: firebase.firestore.FieldValue.delete() });
      delete ME.photo; buildNav(); renderSettings();
      toast('Photo removed ✅');
    } catch (err) { toast('⚠️ ' + errMsg(err)); }
    return;
  }
  if (!e.target.closest('[data-act="save-profile"]')) return;
  const upd = {};
  $$('[data-pf]').forEach(i => upd[i.dataset.pf] = i.value.trim());
  const dobEl = $('#pfDob'); if (dobEl && dobEl.value) upd.dob = dobEl.value;
  if (pendingPhoto) upd.photo = pendingPhoto;
  if (!upd.name) { toast('⚠️ Name cannot be empty.'); return; }
  try {
    await db.collection('users').doc(ME.id).update(upd);
    Object.assign(ME, upd);
    if (ROLE === 'patient') localStorage.setItem('mhd_emergency', JSON.stringify(ME));
    buildNav();
    toast('Profile updated ✅' + (upd.photo ? ' (photo saved)' : ''));
    renderSettings();
  } catch (err) { toast('⚠️ Save failed: ' + errMsg(err)); }
});
document.addEventListener('click', e => {
 const f = e.target.closest('[data-act="font"]'); if (f) { setFont(f.dataset.v); toast('Font size: ' + f.dataset.v); } });

/* ============ DOCTOR ============ */
function bindDoctor() {
  UNBINDS.push(db.collection('cases').where('status', '==', 'waiting').onSnapshot(s => { STATE.cases = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.createdAt - b.createdAt); renderDoctorCases(); renderDocDash(); }, console.error));
  UNBINDS.push(db.collection('cases').where('doctorId', '==', ME.id).onSnapshot(s => { STATE.myReviewed = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.reviewedAt || 0) - (a.reviewedAt || 0)); renderDoctorCases(); renderDocDash(); }, console.error));
  UNBINDS.push(db.collection('appointments').where('doctorId', '==', ME.id).onSnapshot(s => { STATE.appts = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.date || '').localeCompare(b.date || '')); renderDocAppts(); renderDocDash(); }, console.error));
  UNBINDS.push(db.collection('users').where('role', '==', 'patient').onSnapshot(s => { STATE.patients = s.docs.map(d => ({ id: d.id, ...d.data() })); renderPatients(); renderDocDash(); renderVerifyMeds(); renderDChats(); renderDocVitals(); }, console.error));
  UNBINDS.push(db.collection('medicines').where('verified', '==', false).onSnapshot(s => { STATE.unverifiedMeds = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt); renderVerifyMeds(); renderDocDash(); }, console.error));
  UNBINDS.push(db.collection('bills').where('doctorId', '==', ME.id).onSnapshot(s => { STATE.myBills = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt); renderDBilling(); renderDocDash(); }, console.error));
}
function dutyToggleHTML() {
  const on = !!ME.onDuty;
  return '<h4>📍 Duty &amp; Live Location</h4><p class="muted sm-txt">When ON, patients see your live GPS on the Doctor Map. Deleted automatically on logout; older than 6 min = offline.</p>' +
    '<button class="duty-btn ' + (on ? 'duty-on' : 'duty-off') + '" data-act="toggle-duty">' + (on ? '🟢 ON DUTY — location visible (tap to go off duty)' : '⚪ OFF DUTY — tap to go on duty') + '</button>';
}
function renderDutyToggle() { const c = $('#dutyCard'); if (c && ROLE === 'doctor') c.innerHTML = dutyToggleHTML(); }
document.addEventListener('click', e => {
 if (e.target.closest('[data-act="toggle-duty"]')) setDuty(!ME.onDuty); });
function setDuty(on) {
  if (on) {
    if (!navigator.geolocation) return toast('⚠️ Geolocation not supported.');
    ME.onDuty = true; renderDutyToggle();
    toast('🟢 On duty — acquiring GPS…');
    dutyWatch = navigator.geolocation.watchPosition(pos => {
      if (Date.now() - lastLocSend < 20000) return;
      lastLocSend = Date.now();
      ME.location = { lat: pos.coords.latitude, lng: pos.coords.longitude, updatedAt: Date.now() };
      db.collection('users').doc(ME.id).update({ onDuty: true, location: ME.location }).catch(() => {});
    }, () => { toast('⚠️ Location permission denied.'); ME.onDuty = false; renderDutyToggle(); }, { enableHighAccuracy: true, maximumAge: 15000 });
  } else {
    ME.onDuty = false; ME.location = null;
    if (dutyWatch) { navigator.geolocation.clearWatch(dutyWatch); dutyWatch = null; }
    db.collection('users').doc(ME.id).update({ onDuty: false, location: firebase.firestore.FieldValue.delete() }).catch(() => {});
    renderDutyToggle();
    toast('⚪ Off duty — location removed.');
  }
}
function renderDocDash() {
  if (ROLE !== 'doctor') return;
  const today = todayStr();
  const h = new Date().getHours();
  const greet = h < 12 ? t('greetM') : h < 17 ? t('greetA') : t('greetE');
  const todays = STATE.appts.filter(a => a.date === today).sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
  const unread = STATE.notifs.filter(n => !n.read).length;
  const un = (STATE.unverifiedMeds || []).length;
  const wc = $('#docWelcome');
  if (wc) wc.innerHTML = '<div class="doctor-line">' + avatarHTML(ME) +
    '<div><h3 style="margin:0">' + greet + ', Dr. ' + esc(ME.name) + ' 🩺</h3>' +
    '<small class="muted">' + esc(ME.specialization || '') + ' • ' + esc(ME.hospital || '') + ' • Reg: ' + esc(ME.regNo || '—') + '</small></div></div>' +
    '<p class="muted sm-txt" style="margin-top:8px">Click any patient name for their full portal. Use <b>🩺 Health Input</b> to record vitals — patients see it instantly.</p>';
  const st = $('#ddStats');
  if (st) st.innerHTML = [
    ['mc-amber', '🟡', 'Your Waiting Cases', STATE.cases.length],
    ['mc-green', '📅', 'Your Patients Today', todays.filter(a => a.status === 'upcoming').length],
    ['mc-blue', '👥', 'Your Patients', STATE.patients.length],
    ['mc-red', '💊', 'Your Verifications', un],
    ['mc-amber', '💬', 'Unread', unread]
  ].map(([cls, ico, label, val]) => '<div class="mini-card"><span class="mc-ico ' + cls + '">' + ico + '</span><span><span class="mc-label">' + label + '</span><b>' + val + '</b></span></div>').join('');
  renderDutyToggle();
  const cta = $('#verifyCta');
  if (cta) cta.innerHTML = '<h4>💊 Medicine Verification — your confirmation unlocks treatment</h4>' +
    '<p class="muted sm-txt">Patient-reported medicines stay RED until YOU verify them. Once confirmed, they turn GREEN on the patient portal instantly.</p>' +
    '<button class="btn big ' + (un ? 'verify-red' : 'verify-green') + '" data-nav="d-verify">' +
    (un ? '🔴 ' + un + ' MEDICINE' + (un > 1 ? 'S' : '') + ' PENDING — CLICK TO VERIFY NOW' : '✅ ALL MEDICINES VERIFIED — GREAT WORK, DOCTOR') + '</button>';
  const dp2 = $('#ddPending');
  if (dp2) dp2.innerHTML = STATE.cases.map(caseRow).join('') || '<p class="muted">🎉 No pending cases — all caught up!</p>';
  const dt = $('#ddToday');
  if (dt) dt.innerHTML = todays.map((a, i) =>
    '<div class="list-item"><div class="li-main"><b><span class="queue-chip">🎟️ Q#' + (i + 1) + '</span> ' + esc(a.time || '') + ' — ' +
    '<button class="linklike" data-act="view-patient" data-id="' + a.patientId + '">' + esc(a.patientName) + '</button></b>' +
    '<small>' + esc(a.type || '') + ' • ' + esc(a.healthId || '') + (a.reason ? ' • ' + esc(a.reason) : '') + '</small></div>' +
    '<div class="li-actions">' + (a.status === 'upcoming' ? '<button class="btn primary sm" data-act="complete-appt" data-id="' + a.id + '">Done</button>' : '<span class="chip green">' + esc(a.status) + '</span>') + '</div></div>').join('') || '<p class="muted">No appointments today.</p>';
}
function caseRow(c) {
  return '<div class="list-item"><div class="li-main"><b><button class="linklike" data-act="view-patient" data-id="' + c.patientId + '">' + esc(c.patientName) + '</button> <span class="chip blue">' + esc(c.healthId || '') + '</span></b><small>' + esc(c.chiefComplaint) + ' • ' + esc(c.duration || '') + ' • ' + esc(c.severity || '') + ' • ' + fmtDT(c.createdAt) + '</small></div><div class="li-actions"><button class="btn primary sm" data-act="open-case" data-id="' + c.id + '">Review →</button></div></div>';
}
 $$('[data-ctab]').forEach(tt => tt.onclick = () => { $$('[data-ctab]').forEach(x => x.classList.remove('active')); tt.classList.add('active'); CURRENT_CTAB = tt.dataset.ctab; renderDoctorCases(); });
function renderDoctorCases() {
  const el = $('#dcList'); if (!el || ROLE !== 'doctor') return;
  const list = CURRENT_CTAB === 'waiting' ? STATE.cases : (STATE.myReviewed || []);
  el.innerHTML = list.map(caseRow).join('') || '<p class="muted">No cases in this tab.</p>';
}
function renderVerifyMeds() {
  const el = $('#dvList'); if (!el || ROLE !== 'doctor') return;
  const meds = STATE.unverifiedMeds || [];
  el.innerHTML = meds.map(m => {
    const p = STATE.patients.find(x => x.id === m.patientId) || {};
    return '<div class="list-item"><div class="li-main doctor-line">' + avatarHTML(p) + '<div><b>' + esc(m.name) + ' <span class="chip blue">' + esc(p.healthId || '') + '</span></b><br><small class="muted">Patient: ' + esc(p.name || 'Unknown') + ' • ' + esc(m.dosage || '') + ' • ' + fmtDT(m.createdAt) + '</small></div></div><div class="li-actions"><button class="btn verify-red sm" data-act="verify-med" data-id="' + m.id + '" data-pid="' + m.patientId + '" data-name="' + esc(m.name) + '">🔴 PENDING — VERIFY ✓</button></div></div>';
  }).join('') || '<p class="muted">🟩 Everything verified — patients see "Ready to take ✓" in green.</p>';
}
function renderDChats() {
  const el = $('#dChatList'); if (!el || ROLE !== 'doctor') return;
  el.innerHTML = STATE.patients.map(p => {
    const tel = telLink(p.phone || p.emergencyPhone);
    return '<div class="list-item"><div class="li-main doctor-line">' + avatarHTML(p) + '<div><b>' + esc(p.name) + ' <span class="chip blue">' + esc(p.healthId || '') + '</span></b><br><small class="muted">' + ageOf(p.dob) + ' • ' + esc(p.gender || '') + ' • 🩸 ' + esc(p.bloodGroup || '—') + '</small></div></div><div class="li-actions"><button class="btn ghost sm" data-act="view-patient" data-id="' + p.id + '">👤 Full Details</button><button class="btn primary sm" data-act="open-chat" data-id="' + p.id + '" data-name="' + esc(p.name) + '">💬 Chat</button>' + (tel ? '<a class="btn ghost sm" href="' + tel + '">📞</a>' : '') + '</div></div>';
  }).join('') || '<p class="muted">No patients yet.</p>';
}
function renderDBilling() {
  if (ROLE !== 'doctor') return;
  const s = $('#dbSummary'), list = $('#dbList');
  const bs = STATE.myBills || [];
  const total = bs.reduce((a, b) => a + Number(b.total || 0), 0);
  const paid = bs.filter(b => b.status === 'paid');
  const pend = bs.filter(b => b.status !== 'paid');
  if (s) s.innerHTML = [['Total billed by me', total, 'mc-blue'], ['Received (paid)', paid.reduce((a, b) => a + Number(b.total || 0), 0), 'mc-green'], ['Pending', pend.reduce((a, b) => a + Number(b.total || 0), 0), 'mc-red']].map(([l, v, c]) => '<div class="mini-card"><span class="mc-ico ' + c + '">₹</span><span><span class="mc-label">' + l + '</span><b>₹' + v + '</b></span></div>').join('');
  if (list) list.innerHTML = bs.map(b => '<div class="list-item"><div class="li-main"><b>' + esc(b.patientName || '') + ' — ' + esc(b.type || 'bill') + ' ₹' + esc(b.total) + '</b><small>' + billItemsStr(b) + ' • ' + fmtDT(b.createdAt) + '</small></div><div class="li-actions">' + (b.status === 'paid' ? '<span class="chip ready">✓ Paid</span>' : '<span class="chip waiting">Pending</span>') + '</div></div>').join('') || '<p class="muted">No bills yet. Enter a Consultation Fee when reviewing a case.</p>';
}
function renderDocVitals() {
  if (ROLE !== 'doctor') return;
  const sel = $('#dvPatient'); if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = STATE.patients.map(p => '<option value="' + p.id + '">' + esc(p.name) + ' — ' + esc(p.healthId || '') + '</option>').join('') || '<option value="">No patients registered yet</option>';
  if (cur) sel.value = cur;
  const ad = $('#dvDate');
  if (ad && !ad.value) ad.value = todayStr();
  mountDatePickers($('#pg-d-vitals'));
  updateDvDetails();
}
function updateDvDetails() {
  const sel = $('#dvPatient'); if (!sel) return;
  const p = STATE.patients.find(x => x.id === sel.value);
  const dd = $('#dvDetails');
  if (dd) dd.innerHTML = p ? kvRows([['Name', p.name], ['Age', ageOf(p.dob)], ['Gender', p.gender], ['Health ID', p.healthId], ['Blood Group', p.bloodGroup]]) : '<p class="muted">Select a patient to load details.</p>';
  loadDvRecent();
}
async function loadDvRecent() {
  const el = $('#dvRecent'); if (!el) return;
  const sel = $('#dvPatient');
  const pid = sel ? sel.value : '';
  if (!pid) { el.innerHTML = '<p class="muted">No patient selected.</p>'; return; }
  try {
    const s = await db.collection('vitals').where('patientId', '==', pid).get();
    const list = s.docs.map(d => d.data()).sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
    el.innerHTML = list.map(v => { const p = parseBp(v.bp);
      return '<div class="list-item"><div class="li-main"><b>' + fmtD(v.date) + '</b><small>🌡️ ' + esc(v.temp || '—') + '°F • BP ' + (p ? p.s + '/' + p.d : '—') + ' • ❤️ ' + esc(v.hr || '—') + ' • ⚖️ ' + esc(v.wt || '—') + ' kg' + (v.sym ? ' • ' + esc(v.sym) : '') + '</small></div><small class="muted">' + esc(v.doctorName || 'Doctor') + '</small></div>'; }).join('') || '<p class="muted">No health records yet for this patient.</p>';
  } catch (err) { el.innerHTML = '<p class="muted">Could not load records.</p>'; }
}
const dvSel = $('#dvPatient'); if (dvSel) dvSel.addEventListener('change', updateDvDetails);
document.addEventListener('click', async e => {
  if (!e.target.closest('[data-act="save-vitals"]')) return;
  if (ROLE !== 'doctor') return;
  const sel = $('#dvPatient');
  const p = STATE.patients.find(x => x.id === (sel ? sel.value : ''));
  if (!p) return toast('⚠️ Select a patient first.');
  const bp = $('#dvBp').value.trim(), temp = $('#dvTemp').value.trim(), hr = $('#dvHr').value.trim(), wt = $('#dvWt').value.trim(), sym = $('#dvSym').value.trim();
  if (!bp && !temp && !hr && !wt && !sym) return toast('⚠️ Enter at least one health value.');
  if (bp && !parseBp(bp)) return toast('⚠️ BP format should be like 120/80');
  try {
    await db.collection('vitals').add({
      patientId: p.id, patientName: p.name, healthId: p.healthId,
      date: $('#dvDate').value || todayStr(),
      temp, bp, hr, wt, sym,
      enteredBy: 'doctor', doctorId: ME.id, doctorName: 'Dr. ' + ME.name,
      createdAt: Date.now()
    });
    await logAccess(p.id, '👨‍⚕️ Dr. ' + ME.name + ' added a health record');
    await notify(p.id, '🩺 New Health Record Added', 'Dr. ' + ME.name + ' updated your health data. Open Health Overview to view.');
    $('#dvBp').value = ''; $('#dvTemp').value = ''; $('#dvHr').value = ''; $('#dvWt').value = ''; $('#dvSym').value = '';
    toast('✅ Saved — the patient can see it on their portal now.');
    loadDvRecent();
  } catch (err) { toast('⚠️ ' + errMsg(err)); }
});

/* ----- CASE DETAIL ----- */
document.addEventListener('click', async e => {
  const oc = e.target.closest('[data-act="open-case"]'); if (!oc) return;
  const c = STATE.cases.find(x => x.id === oc.dataset.id) || (STATE.myReviewed || []).find(x => x.id === oc.dataset.id);
  if (!c) return;
  try {
    const consentDoc = await db.collection('consents').doc(c.patientId + '_' + ME.id).get();
    if (consentDoc.exists && consentDoc.data().status === 'revoked') {
      await logAccess(c.patientId, '🚫 Attempted access — BLOCKED by patient consent');
      return toast('🚫 Unauthorized Access Blocked — patient revoked your access.');
    }
    await logAccess(c.patientId, '👨‍⚕️ Dr. ' + ME.name + ' viewed your case');
    CURRENT_CASE = c;
    await renderCaseDetail();
  } catch (err) { toast('⚠️ ' + errMsg(err)); }
});
async function renderCaseDetail() {
  go('d-case', { silent: true });
  const c = CURRENT_CASE;
  $('#cdHead').innerHTML = '<div class="card"><div class="kv">' + kvRows([['Patient', c.patientName], ['Health ID', c.healthId], ['Status', c.status === 'waiting' ? '● Waiting' : '🟩 Reviewed'], ['Submitted', fmtDT(c.createdAt)]]) + '</div><button class="btn ghost sm" data-act="view-patient" data-id="' + c.patientId + '" style="margin-top:8px">👤 View Full Patient Profile</button></div>';
  let p = {};
  try { const pdoc = await db.collection('users').doc(c.patientId).get(); if (pdoc.exists) p = pdoc.data(); } catch (e) {}
  let meds = [];
  try { const ms = await db.collection('medicines').where('patientId', '==', c.patientId).get(); meds = ms.docs.map(d => d.data()); } catch (e) {}
  let lastV = null;
  try { const vit = await db.collection('vitals').where('patientId', '==', c.patientId).get(); lastV = vit.docs.map(d => d.data()).sort((a, b) => b.createdAt - a.createdAt)[0]; } catch (e) {}
  let docs = [];
  try { const rs = await db.collection('reports').where('patientId', '==', c.patientId).get(); docs = rs.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt); } catch (e) {}
  $('#cdSummary').innerHTML = kvRows([['Age / Gender / Blood', ageOf(p.dob) + ' • ' + (p.gender || '—') + ' • ' + (p.bloodGroup || '—')], ['⚠️ Allergies', p.allergies || 'None recorded'], ['🏥 Chronic Conditions', p.conditions || 'None recorded'], ['🔪 Past Surgeries', (p.surgeries || 'None').split('\n')[0] || '—'], ['💊 Active Medicines', meds.filter(m => m.active !== false).map(m => m.name).join(', ') || '—'], ['📎 Test Results / Documents', docs.length + ' total (' + docs.filter(d => d.verified).length + ' verified)'], ['📈 Latest Vitals (doctor-entered)', lastV ? ((lastV.bp || '—') + ' BP • ' + (lastV.temp || '—') + '°F • ' + (lastV.hr || '—') + ' hr • ' + (lastV.wt || '—') + ' kg' + (lastV.sym ? ' • ' + lastV.sym : '')) : '—'], ['🚗 Accidents', p.accidents || '—']]) + '<small class="muted">AI-generated from records — verify clinically. Not a diagnosis.</small>';
  $('#cdBlue').innerHTML = kvRows([['1️⃣ Chief Complaint', c.chiefComplaint], ['2️⃣ Symptoms', c.symptoms], ['🧍 Area', c.area], ['3️⃣ Duration', c.duration], ['Severity', c.severity], ['4️⃣ Previous Treatment', c.prevTreatment], ['5️⃣ Existing', c.existing], ['6️⃣ Current Meds', c.currentMeds], ['7️⃣ Allergies', c.allergyNote], ['8️⃣ Surgeries', c.surgeryNote], ['9️⃣ Family', c.familyHistory], ['🔟 Other', c.other]]);
  if (c.status === 'reviewed') { $('#cdNotes').value = c.doctorNotes || ''; $('#cdObs').value = c.observations || ''; $('#cdTests').value = c.tests || ''; $('#cdFollow').value = c.followupDays || ''; $('#cdFee').value = c.fee || ''; }
  else { $('#cdNotes').value = ''; $('#cdObs').value = ''; $('#cdTests').value = ''; $('#cdFollow').value = ''; $('#cdFee').value = ''; }
  $('#prescRows').innerHTML = prescRowHTML();
  $('#cdDocs').innerHTML = docs.length ? docs.map(d =>
    '<div class="doc-thumb-item" data-act="view-doc" data-id="' + d.id + '">' +
    (d.fileData ? '<img src="' + d.fileData + '" alt="">' : '<div style="height:82px;display:flex;align-items:center;justify-content:center;font-size:26px;background:#fff;border-radius:8px">🧪</div>') +
    '<small>' + esc(d.title || d.type) + '</small>' + docStatusChip(d) + '</div>').join('') :
    '<p class="muted">No results/documents uploaded for this patient yet.</p>';
  $('#cdMedVerify').innerHTML = meds.map(m => '<div class="list-item"><div class="li-main"><b>' + esc(m.name) + '</b><small>' + esc(m.dosage || '') + ' • by ' + esc(m.prescribedBy || '') + '</small></div><div class="li-actions">' + (m.verified ? '<span class="chip ready">🟩 Verified ✓ ' + esc(m.verifiedBy || '') + '</span>' : '<button class="btn verify-red sm" data-act="verify-med" data-id="' + m.id + '" data-pid="' + c.patientId + '" data-name="' + esc(m.name) + '">🔴 PENDING — VERIFY ✓</button>') + '</div></div>').join('') || '<p class="muted">No medicines.</p>';
}
function prescRowHTML() { return '<div class="presc-row"><input class="input p-name" placeholder="Medicine"><input class="input p-dose" placeholder="Dose/instructions"><input class="input p-days" placeholder="Days"><input class="input p-inst" placeholder="Before/after food…"></div>'; }
document.addEventListener('click', e => {

  if (e.target.closest('[data-act="add-presc-row"]')) $('#prescRows').insertAdjacentHTML('beforeend', prescRowHTML());
  const vm = e.target.closest('[data-act="verify-med"]');
  if (vm) {
    db.collection('medicines').doc(vm.dataset.id).update({ verified: true, verifiedBy: 'Dr. ' + ME.name, verifiedAt: Date.now() }).then(() => {
      logAccess(vm.dataset.pid, '👨‍⚕️ Dr. ' + ME.name + ' verified medicine: ' + vm.dataset.name);
      notify(vm.dataset.pid, '🟩 Medicine Verified — Ready to Take', 'Dr. ' + ME.name + ' verified: ' + vm.dataset.name + '. Safe to take as prescribed.');
      toast('🟩 Verified! Patient portal now GREEN — "Ready to take ✓"');
    }).catch(err => toast('⚠️ ' + errMsg(err)));
  }
});
document.addEventListener('click', async e => {
  if (!e.target.closest('[data-act="submit-review"]')) return;
  const c = CURRENT_CASE; if (!c) return;
  const meds = [...$$('#prescRows .presc-row')].map(r => ({ name: r.querySelector('.p-name').value.trim(), dose: r.querySelector('.p-dose').value.trim(), days: r.querySelector('.p-days').value.trim(), inst: r.querySelector('.p-inst').value.trim() })).filter(m => m.name);
  const share = $('#cdShare').checked;
  const fee = Number($('#cdFee').value) || 0;
  try {
    await db.collection('cases').doc(c.id).update({
      status: 'reviewed', doctorId: ME.id, doctorName: ME.name, reviewedAt: Date.now(), fee: fee || 0,
      doctorNotes: $('#cdNotes').value.trim(), observations: $('#cdObs').value.trim(),
      prescriptionText: meds.map(m => m.name + ' — ' + m.dose + (m.days ? ' (' + m.days + 'd)' : '')).join('; '),
      tests: $('#cdTests').value.trim(), followupDays: $('#cdFollow').value, sharedWithPatient: share
    });
    for (const m of meds) await db.collection('medicines').add({ patientId: c.patientId, name: m.name, dosage: (m.dose + ' ' + m.inst).trim(), startDate: todayStr(), durationDays: m.days, prescribedBy: 'Dr. ' + ME.name, verified: true, verifiedBy: 'Dr. ' + ME.name, source: 'doctor', active: true, createdAt: Date.now() });
    await db.collection('timeline').add({ patientId: c.patientId, date: todayStr(), type: 'consult', icon: '👨‍⚕️', title: 'Consultation — Dr. ' + ME.name, description: $('#cdNotes').value.trim() || c.chiefComplaint, createdAt: Date.now() });
    if (meds.length) await db.collection('timeline').add({ patientId: c.patientId, date: todayStr(), type: 'prescription', icon: '💊', title: 'Prescription added', description: meds.map(m => m.name).join(', '), createdAt: Date.now() });
    const fu = Number($('#cdFollow').value);
    if (fu > 0) {
      const due = new Date(Date.now() + fu * 86400000).toISOString().slice(0, 10);
      await db.collection('timeline').add({ patientId: c.patientId, date: todayStr(), type: 'followup', icon: '🔔', title: 'Follow-up after ' + fu + ' days', description: 'Due: ' + fmtD(due), due, createdAt: Date.now() });
    }
    if (fee > 0) {
      await db.collection('bills').add({ patientId: c.patientId, patientName: c.patientName, healthId: c.healthId, doctorId: ME.id, doctorName: 'Dr. ' + ME.name, hospital: ME.hospital || '', type: 'consultation', items: [{ label: 'Consultation fee — Dr. ' + ME.name, amount: fee }], total: fee, status: 'pending', createdAt: Date.now() });
      await notify(c.patientId, '💰 New Bill — Consultation', 'Dr. ' + ME.name + ' billed ₹' + fee + '. Open Billing to view & pay.');
    }
    if (share) await notify(c.patientId, '✅ Doctor Reviewed Your Case', 'Dr. ' + ME.name + ' verified your case and added clinical information.');
    await logAccess(c.patientId, '👨‍⚕️ Dr. ' + ME.name + ' reviewed your case & updated prescription');
    toast('✅ Verified & sent to patient!' + (fee > 0 ? ' Bill ₹' + fee + ' created.' : ''));
    STATE.cases = STATE.cases.filter(x => x.id !== c.id);
    renderDoctorCases(); go('d-cases', { silent: true });
  } catch (err) { toast('⚠️ ' + errMsg(err)); }
});

/* ----- PATIENTS (doctor) ----- */
const dpSearchEl = $('#dpSearch');
if (dpSearchEl) {
  dpSearchEl.addEventListener('input', renderPatients);
}
function renderPatients() {
  const el = $('#dpList'); if (!el || ROLE !== 'doctor') return;
  const q = ($('#dpSearch').value || '').trim().toLowerCase();
  el.innerHTML = STATE.patients.filter(p => !q || (p.name || '').toLowerCase().includes(q) || (p.healthId || '').toLowerCase().includes(q)).map(p =>
    '<div class="card"><div class="doctor-line">' + avatarHTML(p) + '<div><b>' + esc(p.name) + '</b><br><small class="muted">' + esc(p.healthId || '') + ' • ' + ageOf(p.dob) + ' • ' + esc(p.gender || '') + ' • 🩸 ' + esc(p.bloodGroup || '—') + '</small></div></div><p class="muted" style="margin:8px 0">⚠️ ' + esc((p.allergies || 'None').slice(0, 60)) + '</p><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn ghost sm" data-act="view-patient" data-id="' + p.id + '">👤 Full Profile</button><button class="btn primary sm" data-act="open-chat" data-id="' + p.id + '" data-name="' + esc(p.name) + '">💬 Chat</button></div></div>').join('') || '<p class="muted">No patients found.</p>';
}
function renderDocAppts() {
  const el = $('#daList'); if (!el || ROLE !== 'doctor') return;
  el.innerHTML = STATE.appts.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(a => '<div class="list-item"><div class="li-main"><b>' + fmtD(a.date) + ' ' + esc(a.time || '') + ' — <button class="linklike" data-act="view-patient" data-id="' + a.patientId + '">' + esc(a.patientName) + '</button></b><small>' + esc(a.type || '') + ' • ' + esc(a.reason || '') + '</small></div><div class="li-actions"><span class="chip ' + (a.status === 'upcoming' ? 'blue' : a.status === 'completed' ? 'green' : 'red') + '">' + esc(a.status) + '</span>' + (a.status === 'upcoming' ? '<button class="btn primary sm" data-act="complete-appt" data-id="' + a.id + '">Mark Done</button>' : '') + '</div></div>').join('') || '<p class="muted">No appointments.</p>';
}

/* ----- PROFILE MODALS ----- */
document.addEventListener('click', e => {

  const vp = e.target.closest('[data-act="view-patient"]');
  if (vp) openPatientProfile(vp.dataset.id);
  const hd = e.target.closest('[data-act="h-view-doctor"]');
  if (hd) openDoctorProfile(hd.dataset.id);
  const vd = e.target.closest('[data-act="view-doc"]');
  if (vd) openDocViewer(vd.dataset.id);
  if (e.target.closest('[data-act="go-settings"]')) { closeModal(); go('p-settings'); }
});
async function openPatientProfile(pid) {
  let p = STATE.patients.find(x => x.id === pid);
  if (!p) { try { const d = await db.collection('users').doc(pid).get(); if (d.exists) p = { id: d.id, ...d.data() }; } catch (e) {} }
  if (!p) return toast('⚠️ Patient not found.');
  logAccess(pid, (ROLE === 'doctor' ? '👨‍⚕️ Dr. ' : '🏥 ') + ME.name + ' viewed your full profile');
  showModal('<div class="doctor-line">' + avatarHTML(p) + '<h3 style="margin:0">' + esc(p.name) + ' <span class="chip blue">' + esc(p.healthId || '') + '</span></h3></div><p class="muted">Loading complete profile…</p>' + modalCloseBtn());
  let meds = [], cases = [], reports = [], vitals = [], bills = [];
  try { const r = await db.collection('medicines').where('patientId', '==', pid).get(); meds = r.docs.map(d => d.data()).sort((a, b) => b.createdAt - a.createdAt); } catch (e) {}
  try { const r = await db.collection('cases').where('patientId', '==', pid).get(); cases = r.docs.map(d => d.data()).sort((a, b) => b.createdAt - a.createdAt); } catch (e) {}
  try { const r = await db.collection('reports').where('patientId', '==', pid).get(); reports = r.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt); } catch (e) {}
  try { const r = await db.collection('vitals').where('patientId', '==', pid).get(); vitals = r.docs.map(d => d.data()).sort((a, b) => b.createdAt - a.createdAt); } catch (e) {}
  try { const r = await db.collection('bills').where('patientId', '==', pid).get(); bills = r.docs.map(d => d.data()).sort((a, b) => b.createdAt - a.createdAt); } catch (e) {}
  const lv = vitals[0]; const bp = lv ? parseBp(lv.bp) : null;
  const tel = telLink(p.phone);
  const billTot = bills.reduce((a, b) => a + Number(b.total || 0), 0);
  $('#modalCard').innerHTML =
    '<div class="doctor-line" style="margin-bottom:10px">' + avatarHTML(p) + '<div><h3 style="margin:0">' + esc(p.name) + ' <span class="chip blue">' + esc(p.healthId || '') + '</span></h3><small class="muted">' + ageOf(p.dob) + ' • ' + esc(p.gender || '') + ' • 🩸 ' + esc(p.bloodGroup || '—') + (tel ? ' • <a href="' + tel + '">📞 ' + esc(p.phone || '') + '</a>' : '') + '</small></div></div>' +
    '<h4>📝 Registration Details (everything the patient filled)</h4><div class="kv">' + kvRows([['Full Name', p.name], ['Date of Birth', fmtD(p.dob) + ' (' + ageOf(p.dob) + ')'], ['Gender', p.gender], ['Blood Group', p.bloodGroup], ['Phone', p.phone], ['Email', p.email], ['Address', p.address], ['Aadhaar (masked)', maskAadhaar(p.aadhaar)], ['Emergency Contact', (p.emergencyName || '—') + ' ' + (p.emergencyPhone || '')], ['Height / Weight', (p.heightCm || '—') + ' cm • ' + (p.weightKg || '—') + ' kg'], ['⚠️ Allergies', p.allergies || 'None'], ['🏥 Existing Conditions', p.conditions || 'None'], ['🔪 Surgeries', p.surgeries || 'None'], ['🚗 Accidents', p.accidents || 'None'], ['👨‍👩‍👦 Family History', p.familyHistory || 'None'], ['💰 Annual Income', p.income ? '₹' + p.income : '—']]) + '</div>' +
    '<h4 style="margin-top:12px">🩺 Latest Health Record (doctor-entered)</h4><div class="kv">' + kvRows(lv ? [['Date', fmtD(lv.date) + ' • by ' + (lv.doctorName || 'Doctor')], ['BP', bp ? bp.s + '/' + bp.d : '—'], ['Temperature', (lv.temp || '—') + ' °F'], ['Heart Rate', (lv.hr || '—') + ' bpm'], ['Weight', (lv.wt || '—') + ' kg'], ['Symptoms', lv.sym || '—']] : [['Status', 'No health records yet']]) + '</div>' +
    '<h4 style="margin-top:12px">💊 Medicines (' + meds.length + ')</h4>' + (meds.length ? '<div class="kv">' + meds.slice(0, 8).map(m => '<div class="krow"><span>' + esc(m.name) + ' <small class="muted">' + esc(m.dosage || '') + '</small></span>' + medChip(m) + '</div>').join('') + '</div>' : '<p class="muted">None</p>') +
    '<h4 style="margin-top:12px">📋 Cases (' + cases.length + ')</h4>' + (cases.length ? '<div class="kv">' + cases.slice(0, 6).map(c => '<div class="krow"><span>' + esc(c.chiefComplaint) + ' <small class="muted">' + fmtDT(c.createdAt) + '</small></span><b>' + (c.status === 'reviewed' ? '🟩 Dr. ' + esc(c.doctorName || '') : '🟡 waiting') + '</b></div>').join('') + '</div>' : '<p class="muted">None</p>') +
    '<h4 style="margin-top:12px">Test Results (' + reports.length + ') — tap to view detail</h4>' + (reports.length ? '<div class="doc-thumbs">' + reports.slice(0, 8).map(r => '<div class="doc-thumb-item" data-act="view-doc" data-id="' + r.id + '">' + (r.fileData ? '<img src="' + r.fileData + '" alt="">' : '<div style="height:82px;display:flex;align-items:center;justify-content:center;font-size:26px;background:#fff;border-radius:8px">🧪</div>') + '<small>' + esc(r.title || r.type) + '</small>' + docStatusChip(r) + '</div>').join('') + '</div>' : '<p class="muted">None</p>') +
    '<h4 style="margin-top:12px">💰 Billing (₹' + billTot + ' total)</h4>' + (bills.length ? '<div class="kv">' + bills.slice(0, 5).map(b => '<div class="krow"><span>' + esc(b.type) + ' — ' + billItemsStr(b) + '</span><b>' + (b.status === 'paid' ? '✓ Paid' : 'Pending') + '</b></div>').join('') + '</div>' : '<p class="muted">None</p>') +
    '<small class="muted">🔐 This view has been logged in the patient\'s audit trail.</small>' + modalCloseBtn();
}
async function openDoctorProfile(did) {
  let d = STATE.doctors.find(x => x.id === did);
  if (!d) { try { const doc = await db.collection('users').doc(did).get(); if (doc.exists) d = { id: doc.id, ...doc.data() }; } catch (e) {} }
  if (!d) return toast('⚠️ Doctor not found.');
  showModal('<h3>👨‍⚕️ Dr. ' + esc(d.name) + '</h3><p class="muted">Loading…</p>' + modalCloseBtn());
  let appts = [], reviewed = 0, earnings = 0;
  try { const r = await db.collection('appointments').where('doctorId', '==', did).get(); appts = r.docs.map(x => x.data()); } catch (e) {}
  try { const r = await db.collection('cases').where('doctorId', '==', did).get(); reviewed = r.size; } catch (e) {}
  try { const r = await db.collection('bills').where('doctorId', '==', did).get(); earnings = r.docs.map(x => x.data()).filter(b => b.status === 'paid').reduce((a, b) => a + Number(b.total || 0), 0); } catch (e) {}
  $('#modalCard').innerHTML =
    '<div class="doctor-line" style="margin-bottom:10px">' + avatarHTML(d) + '<div><h3 style="margin:0">Dr. ' + esc(d.name) + ' ' + (isOnline(d) ? '<span class="chip green">🟢 On duty</span>' : '<span class="chip">⚪ Off duty</span>') + '</h3><small class="muted">' + esc(d.specialization || '') + '</small></div></div>' +
    '<h4>📝 Registration Details (everything the doctor filled)</h4><div class="kv">' + kvRows([['Name', 'Dr. ' + d.name], ['Specialization', d.specialization], ['Hospital', d.hospital], ['Medical Reg No', d.regNo], ['Experience', (d.experience || '—') + ' years'], ['Phone', d.phone || '—'], ['Email', d.email || '—']]) + '</div>' +
    '<h4 style="margin-top:12px">📊 Activity &amp; Earnings</h4><div class="kv">' + kvRows([['Total Appointments', appts.length], ['Cases Reviewed', reviewed], ['Earnings (paid)', '₹' + earnings], ['Duty Status', isOnline(d) ? '🟢 On duty (live location)' : '⚪ Off duty']]) + '</div>' +
    '<h4 style="margin-top:12px">📅 Recent Appointments</h4>' + (appts.length ? '<div class="kv">' + appts.sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 6).map(a => '<div class="krow"><span>' + esc(a.patientName) + '</span><small>' + fmtD(a.date) + ' ' + esc(a.time) + ' • ' + esc(a.status) + '</small></div>').join('') + '</div>' : '<p class="muted">None yet</p>') +
    modalCloseBtn();
}

/* ============ HOSPITAL ============ */
function bindHospital() {
  let inFlight = false, queued = false;
  const refresh = async () => {
    if (inFlight) { queued = true; return; }
    inFlight = true;
    try {
      const [as, cs, ms, bs, rs, ds, ps] = await Promise.all([
        db.collection('appointments').get(), db.collection('cases').get(), db.collection('medicines').get(),
        db.collection('bills').get(), db.collection('reports').get(),
        db.collection('users').where('role', '==', 'doctor').get(), db.collection('users').where('role', '==', 'patient').get()
      ]);
      STATE.appts = as.docs.map(x => ({ id: x.id, ...x.data() }));
      STATE.allCases = cs.docs.map(x => ({ id: x.id, ...x.data() })).sort((a, b) => b.createdAt - a.createdAt);
      STATE.medsAll = ms.docs.map(x => ({ id: x.id, ...x.data() })).sort((a, b) => b.createdAt - a.createdAt);
      STATE.billsAll = bs.docs.map(x => ({ id: x.id, ...x.data() })).sort((a, b) => b.createdAt - a.createdAt);
      STATE.reportsAll = rs.docs.map(x => ({ id: x.id, ...x.data() })).sort((a, b) => b.createdAt - a.createdAt);
      STATE.doctors = ds.docs.map(x => ({ id: x.id, ...x.data() }));
      STATE.patients = ps.docs.map(x => ({ id: x.id, ...x.data() }));
      renderHospital(); renderHPatients(); renderHDoctors(); renderHCases(); renderHMeds(); renderHDocs(); renderHAppts(); renderHBilling(); fillUploadDropdowns();
    } catch (e) { console.error(e); }
    inFlight = false;
    if (queued) { queued = false; refresh(); }
  };
  UNBINDS.push(db.collection('appointments').onSnapshot(refresh, console.error));
  UNBINDS.push(db.collection('cases').onSnapshot(refresh, console.error));
  UNBINDS.push(db.collection('medicines').onSnapshot(refresh, console.error));
  UNBINDS.push(db.collection('bills').onSnapshot(refresh, console.error));
  UNBINDS.push(db.collection('reports').onSnapshot(refresh, console.error));
  UNBINDS.push(db.collection('users').onSnapshot(refresh, console.error));
  refresh();
}
function tableHTML(headers, rows) {
  if (!rows.length) return '<p class="muted">No records yet.</p>';
  return '<div style="overflow-x:auto"><table><tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr>' + rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</table></div>';
}
function renderHospital() {
  if (ROLE !== 'hospital') return;
  const today = todayStr();
  const unDocs = (STATE.reportsAll || []).filter(r => r.fileData && !r.verified).length;
  $('#hhStats').innerHTML = [['👥 Patients', STATE.patients.length], ['👨‍⚕️ Doctors', STATE.doctors.length], ['📅 Today\'s Appointments', STATE.appts.filter(a => a.date === today).length]].map(([k, v]) => '<div class="card center"><h4>' + k + '</h4><p style="font-size:30px;font-weight:800;color:var(--primary)">' + v + '</p></div>').join('');
  const todayRows = STATE.appts.filter(a => a.date === today).map(a => [esc(a.patientName), esc(a.doctorName), esc(a.time), esc(a.type || ''), '<span class="chip ' + (a.status === 'upcoming' ? 'blue' : a.status === 'completed' ? 'green' : 'red') + '">' + esc(a.status) + '</span>']);
  $('#hhQueue').innerHTML = tableHTML(['Patient', 'Doctor', 'Time', 'Type', 'Status'], todayRows) +
    (unDocs ? '<p class="hint" style="margin-top:8px">' + unDocs + ' patient document(s) awaiting verification — open <b>Verify Documents</b>.</p>' : '');
}
function renderHAppts() {
  if (ROLE !== 'hospital') return;
  const sum = $('#hApptSummary'), groups = $('#hApptGroups');
  if (!groups) return;
  const total = STATE.appts.length;
  const completed = STATE.appts.filter(a => a.status === 'completed').length;
  const upcoming = STATE.appts.filter(a => a.status === 'upcoming').length;
  const cancelled = STATE.appts.filter(a => a.status === 'cancelled').length;
  if (sum) sum.innerHTML = [
    ['mc-blue', '📅', 'Total', total], ['mc-green', '✅', 'Completed', completed], ['mc-red', '🕒', 'Incomplete (Upcoming)', upcoming]
  ].map(([cls, ico, label, val]) => '<div class="mini-card"><span class="mc-ico ' + cls + '">' + ico + '</span><span><span class="mc-label">' + label + '</span><b>' + val + '</b></span></div>').join('');
  const byDate = {};
  STATE.appts.forEach(a => { const d = a.date || 'Unknown'; (byDate[d] = byDate[d] || []).push(a); });
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
  groups.innerHTML = dates.map(d => {
    const list = byDate[d].sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
    const cDone = list.filter(a => a.status === 'completed').length;
    const cUp = list.filter(a => a.status === 'upcoming').length;
    const cCan = list.filter(a => a.status === 'cancelled').length;
    return '<div class="date-group"><div class="date-head"><span>📅 ' + fmtD(d) + '</span>' +
      '<span class="d-stats"><span class="chip blue">' + list.length + ' total</span>' +
      '<span class="chip green">✅ ' + cDone + ' complete</span>' +
      '<span class="chip amber">🕒 ' + cUp + ' incomplete</span>' +
      (cCan ? '<span class="chip red">⛔ ' + cCan + ' cancelled</span>' : '') + '</span></div>' +
      list.map(a => '<div class="list-item"><div class="li-main"><b>' + esc(a.time || '') + ' — ' + esc(a.patientName || '') + ' <span class="chip blue">' + esc(a.healthId || '') + '</span></b>' +
      '<small>' + esc(a.doctorName || '') + ' • ' + esc(a.department || '—') + ' • ' + esc(a.type || '') + '</small></div>' +
      '<div class="li-actions"><span class="chip ' + (a.status === 'upcoming' ? 'blue' : a.status === 'completed' ? 'green' : 'red') + '">' + esc(a.status) + '</span></div></div>').join('') + '</div>';
  }).join('') || '<p class="muted">No appointments booked yet.</p>';
}
const hps = $('#hPatSearch');
if (hps) hps.addEventListener('input', renderHPatients);
function renderHPatients() {
  if (ROLE !== 'hospital') return;
  const el = $('#hPatList'); if (!el) return;
  const q = ($('#hPatSearch') && $('#hPatSearch').value || '').trim().toLowerCase();
  const list = STATE.patients.filter(p => !q || (p.name || '').toLowerCase().includes(q) || (p.healthId || '').toLowerCase().includes(q));
  el.innerHTML = list.map(p => { const pm = STATE.medsAll.filter(m => m.patientId === p.id);
    return '<div class="list-item"><div class="li-main doctor-line">' + avatarHTML(p) + '<div><b>' + esc(p.name) + ' <span class="chip blue">' + esc(p.healthId || '') + '</span></b><br><small class="muted">' + ageOf(p.dob) + ' • ' + esc(p.gender || '') + ' • 🩸 ' + esc(p.bloodGroup || '—') + ' • 💊 ' + pm.length + ' (' + pm.filter(m => m.verified).length + ' verified)</small></div></div><div class="li-actions"><button class="btn primary sm" data-act="view-patient" data-id="' + p.id + '">👁️ View Full Details</button></div></div>'; }).join('') || '<p class="muted">No patients found.</p>';
}
function renderHDoctors() {
  if (ROLE !== 'hospital') return;
  const rows = STATE.doctors.map(d => ['👨‍⚕️ ' + esc(d.name), esc(d.specialization || ''), esc(d.hospital || ''), esc(d.experience || '—') + ' yrs', esc(d.regNo || ''), esc(d.phone || '—'), isOnline(d) ? '🟢 On duty' : '⚪ Off duty', '<button class="btn ghost sm" data-act="h-view-doctor" data-id="' + d.id + '">👁️ View</button>']);
  $('#hDocTable').innerHTML = tableHTML(['Doctor', 'Specialization', 'Hospital', 'Experience', 'Reg No', 'Phone', 'Duty', 'Details'], rows);
}
function renderHCases() {
  if (ROLE !== 'hospital') return;
  const rows = STATE.allCases.map(c => [esc(c.patientName) + '<br><small class="muted">' + esc(c.healthId || '') + '</small>', esc(c.chiefComplaint), esc(c.severity || '—'), esc(c.duration || '—'), c.status === 'reviewed' ? '<span class="chip green">🟩 Dr. ' + esc(c.doctorName || '') + '</span>' : '<span class="chip amber">● Waiting</span>', fmtDT(c.createdAt)]);
  $('#hCaseTable').innerHTML = tableHTML(['Patient', 'Chief Complaint', 'Severity', 'Duration', 'Status', 'Submitted'], rows);
}
function renderHMeds() {
  if (ROLE !== 'hospital') return;
  const rows = STATE.medsAll.map(m => {
    const p = STATE.patients.find(x => x.id === m.patientId) || {};
    return [esc(m.name), esc(p.name || '—') + '<br><small class="muted">' + esc(p.healthId || '') + '</small>', esc(m.dosage || ''), esc(m.source === 'doctor' ? '👨‍⚕️ Doctor' : '🟦 Patient'), m.verified ? '<span class="chip ready">🟩 ' + esc(m.verifiedBy || '') + '</span>' : '<span class="chip waiting">🔴 Pending</span>', fmtDT(m.createdAt)];
  });
  $('#hMedTable').innerHTML = tableHTML(['Medicine', 'Patient', 'Dosage', 'Source', 'Verification', 'Added'], rows);
}
/* ----- DOCUMENT VERIFICATION (hospital) ----- */
function renderHDocs() {
  if (ROLE !== 'hospital') return;
  const el = $('#hDocList'); if (!el) return;
  const docs = (STATE.reportsAll || []).filter(r => r.fileData);
  el.innerHTML = docs.map(r => {
    const p = STATE.patients.find(x => x.id === r.patientId) || {};
    return '<div class="list-item"><div class="li-main doctor-line"><img src="' + r.fileData + '" class="doc-thumb" data-act="view-doc" data-id="' + r.id + '">' +
      '<div><b>' + esc(r.title || r.type) + ' <span class="chip blue">' + esc(p.healthId || '') + '</span></b><br><small class="muted">Patient: ' + esc(p.name || 'Unknown') + ' • ' + esc(r.type) + ' • ' + fmtD(r.date) + ' • uploaded ' + fmtDT(r.createdAt) + '</small></div></div>' +
      '<div class="li-actions">' + docStatusChip(r) +
      '<button class="btn ghost sm" data-act="view-doc" data-id="' + r.id + '">👁️ View</button>' +
      (!r.verified ? '<button class="btn primary sm" data-act="h-verify-doc" data-id="' + r.id + '">✅ Verify</button>' : '') +
      '</div></div>';
  }).join('') || '<p class="muted">No scanned documents yet.</p>';
}
document.addEventListener('click', async e => {
  const hv = e.target.closest('[data-act="h-verify-doc"]');
  if (hv) {
    try {
      const s = await db.collection('reports').doc(hv.dataset.id).get();
      if (!s.exists) return toast('⚠️ Document not found.');
      const r = s.data();
      await db.collection('reports').doc(hv.dataset.id).update({ verified: true, verifiedBy: ME.name, verifiedAt: Date.now() });
      await logAccess(r.patientId, '🏥 ' + ME.name + ' verified result: ' + (r.title || ''));
      await notify(r.patientId, '🟩 Result Verified', (r.title || 'Your result') + ' has been verified by ' + ME.name + '.');
      closeModal();
      renderHDocs();
      toast('🟩 Result verified — now on the patient\'s Results page.');
    } catch (err) { toast('⚠️ ' + errMsg(err)); }
  }
});
/* ----- BILLING: HOSPITAL ----- */
function renderHBilling() {
  if (ROLE !== 'hospital') return;
  const s = $('#hbSummary'), list = $('#hbList');
  const bs = STATE.billsAll || [];
  const total = bs.reduce((a, b) => a + Number(b.total || 0), 0);
  const paid = bs.filter(b => b.status === 'paid');
  const pend = bs.filter(b => b.status !== 'paid');
  if (s) s.innerHTML = [['Total Revenue', total, 'mc-blue'], ['Collected (paid)', paid.reduce((a, b) => a + Number(b.total || 0), 0), 'mc-green'], ['Pending', pend.reduce((a, b) => a + Number(b.total || 0), 0), 'mc-red']].map(([l, v, c]) => '<div class="mini-card"><span class="mc-ico ' + c + '">₹</span><span><span class="mc-label">' + l + '</span><b>₹' + v + '</b></span></div>').join('');
  if (list) list.innerHTML = bs.map(b => '<div class="list-item"><div class="li-main"><b>' + esc(b.patientName || '') + ' — ' + esc(b.type || 'bill') + ' ₹' + esc(b.total) + '</b><small>' + billItemsStr(b) + (b.doctorName ? ' • ' + esc(b.doctorName) : '') + ' • ' + fmtDT(b.createdAt) + '</small></div><div class="li-actions">' + (b.status === 'paid' ? '<span class="chip ready">✓ Paid</span>' : '<span class="chip waiting">Pending</span>') + '</div></div>').join('') || '<p class="muted">No bills yet.</p>';
}
document.addEventListener('click', async e => {
  if (!e.target.closest('[data-act="h-add-bill"]')) return;
  const hid = $('#hbHid').value.trim().toUpperCase();
  const item = $('#hbItem').value.trim();
  const amount = Number($('#hbAmount').value) || 0;
  if (!hid || !item || !amount) return toast('⚠️ Health ID, item and amount are required.');
  try {
    const ps = await db.collection('users').where('healthId', '==', hid).limit(1).get();
    if (ps.empty) return toast('⚠️ Health ID not found.');
    const p = ps.docs[0].data();
    await db.collection('bills').add({ patientId: ps.docs[0].id, patientName: p.name, healthId: p.healthId, doctorName: '', hospital: ME.name, type: $('#hbType').value, items: [{ label: item, amount }], total: amount, status: 'pending', createdAt: Date.now() });
    await notify(ps.docs[0].id, '💰 New Bill from ' + ME.name, item + ' — ₹' + amount + '. Open Billing to view & pay.');
    $('#hbHid').value = ''; $('#hbItem').value = ''; $('#hbAmount').value = '';
    toast('✅ Bill added — visible in patient portal in real time');
  } catch (err) { toast('⚠️ ' + errMsg(err)); }
});
/* ----- HOSPITAL UPLOAD RESULT (FIX: Patient + Doctor dropdowns) ----- */
function fillUploadDropdowns() {
  if (ROLE !== 'hospital') return;
  const psel = $('#huHid'), dsel = $('#huDoctor');
  if (!psel || !dsel) return;
  const pv = psel.value, dv = dsel.value;
  const pOpts = (STATE.patients || []).map(p => '<option value="' + p.id + '">' + esc(p.name || 'Patient') + ' — ' + esc(p.healthId || '') + '</option>').join('');
  psel.innerHTML = '<option value="">— Select patient —</option>' + (pOpts || '<option value="" disabled>No patients registered yet</option>');
  const dOpts = (STATE.doctors || []).map(d => '<option value="Dr. ' + esc(d.name || '') + '">Dr. ' + esc(d.name || '') + (d.specialization ? ' — ' + esc(d.specialization) : '') + '</option>').join('');
  dsel.innerHTML = '<option value="">— Select doctor —</option>' + (dOpts || '<option value="" disabled>No doctors registered yet</option>');
  if (pv && (STATE.patients || []).some(p => p.id === pv)) psel.value = pv;
  if (dv && (STATE.doctors || []).some(d => 'Dr. ' + d.name === dv)) dsel.value = dv;
}
document.addEventListener('change', async e => {
  if (!e.target || e.target.id !== 'huFile') return;
  const file = e.target.files && e.target.files[0];
  if (!file) { pendingHu = null; $('#huPreview').classList.add('hidden'); return; }
  try {
    pendingHu = await compressImage(file);
    $('#huPreviewImg').src = pendingHu;
    $('#huPreview').classList.remove('hidden');
    toast('✅ Document photo attached.');
  } catch (err) { pendingHu = null; $('#huPreview').classList.add('hidden'); toast('⚠️ ' + (err.message || 'Image error')); }
});
document.addEventListener('click', async e => {
  if (!e.target.closest('[data-act="h-upload"]')) return;
  const pid = $('#huHid').value;
  const title = $('#huTitle').value.trim();
  if (!pid) return toast('⚠️ Please select a patient from the dropdown.');
  if (!title) return toast('⚠️ Result title is required.');
  const p = (STATE.patients || []).find(x => x.id === pid);
  if (!p) return toast('⚠️ Patient not found — please reselect.');
  try {
    const rec = { patientId: p.id, patientName: p.name, healthId: p.healthId, title, type: $('#huType').value, date: $('#huDate').value || todayStr(), hospital: ME.name, doctor: $('#huDoctor').value, note: $('#huNote').value.trim(), verified: true, uploadedBy: ME.name, uploadedByRole: 'hospital', createdAt: Date.now() };
    if (pendingHu) { rec.fileData = pendingHu; rec.source = 'scan'; }
    await db.collection('reports').add(rec);
    await db.collection('timeline').add({ patientId: p.id, date: todayStr(), type: 'report', icon: '🧪', title, description: $('#huType').value + ' — ' + ME.name, createdAt: Date.now() });
    await logAccess(p.id, '🏥 ' + ME.name + ' uploaded a result: ' + title);
    await notify(p.id, 'New Result Available', title + ' — added by ' + ME.name + '. Open My Results to view.');
    $('#huHid').value = ''; $('#huTitle').value = ''; $('#huNote').value = ''; $('#huDoctor').value = '';
    $('#huFile').value = ''; pendingHu = null; $('#huPreview').classList.add('hidden');
    toast('✅ Result uploaded — now on the patient\'s Results page');
  } catch (err) { toast('⚠️ ' + errMsg(err)); }
});

/* ----- VOICE SCRIBE ----- */
document.addEventListener('click', e => {

  const m = e.target.closest('[data-act="mic"]'); if (!m) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return toast('Voice input not supported (use Chrome).');
  try {
    const rec = new SR(); rec.lang = CUR_LANG === 'ta' ? 'ta-IN' : CUR_LANG === 'hi' ? 'hi-IN' : 'en-IN'; rec.interimResults = false;
    m.classList.add('rec'); toast('🎙️ Listening… speak now');
    rec.onresult = ev => { const t2 = document.getElementById(m.dataset.target); t2.value = (t2.value ? t2.value + ' ' : '') + ev.results[0][0].transcript; };
    rec.onend = () => m.classList.remove('rec');
    rec.onerror = () => { m.classList.remove('rec'); toast('⚠️ Mic error.'); };
    rec.start();
  } catch (err) { m.classList.remove('rec'); toast('⚠️ Could not start mic.'); }
});

/* ----- MOUNT DATE PICKERS + OVERLAY CLOSE ----- */
mountDatePickers();
 $$('.overlay').forEach(ov => ov.addEventListener('click', e => { if (e.target === ov) ov.classList.add('hidden'); }));


document.addEventListener('click', e => {
  // Profile dropdown toggle
  if (e.target.closest('[data-act="profile-quick"]')) {
    const pDrop = $('#profDrop');
    if (pDrop) {
      pDrop.classList.toggle('hidden');
      $('#pdName').textContent = ME ? ME.name : 'User';
      $('#pdId').textContent = (ME && ME.healthId) ? ME.healthId : (ME && ME.specialization ? ME.specialization : (ROLE === 'patient' ? 'MHD-DEMO001' : ''));
      if (ME && ME.photo) {
        $('#pdAv').style.backgroundImage = 'url(' + ME.photo + ')';
        $('#pdAv').innerHTML = '';
      } else {
        $('#pdAv').style.backgroundImage = '';
        $('#pdAv').innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
      }
    }
    // Prevent this click from triggering the outside-click handler below in the same event loop
    return;
  }
  
  // Profile menu outside click
  if (!e.target.closest('.profile-drop') && !e.target.closest('[data-act="profile-quick"]')) {
    const pDrop = $('#profDrop');
    if (pDrop) {
      pDrop.classList.add('hidden');
      $('#pdLangMenu').classList.remove('active');
      $('#pdThemeMenu').classList.remove('active');
    }
  }

  // Profile menu actions
  const pdAct = e.target.closest('.profile-drop [data-act]');
  if (pdAct) {
    const act = pdAct.dataset.act;
    if (act === 'pd-profile') { $('#profDrop').classList.add('hidden'); if(typeof openQuickProfile === 'function') openQuickProfile(); return; }
    if (act === 'pd-settings') { $('#profDrop').classList.add('hidden'); go('p-settings'); return; }
    if (act === 'pd-lang') { $('#pdLangMenu').classList.toggle('active'); $('#pdThemeMenu').classList.remove('active'); return; }
    if (act === 'pd-theme') { $('#pdThemeMenu').classList.toggle('active'); $('#pdLangMenu').classList.remove('active'); return; }
  }

  // Sub-menu selections
  const langSel = e.target.closest('.profile-drop [data-lang-val]');
  if (langSel) {
    if (typeof setLanguage === 'function') setLanguage(langSel.dataset.langVal);
    const span = document.querySelector('[data-act="pd-lang"] span');
    if (span) span.innerHTML = '&rarr; ' + langSel.textContent;
    $('#pdLangMenu').classList.remove('active');
    return;
  }
  
  const themeSelBtn = e.target.closest('.profile-drop [data-theme-val]');
  if (themeSelBtn) {
    const v = themeSelBtn.dataset.themeVal;
    if (v === 'system') {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (typeof applyTheme === 'function') applyTheme(isDark ? 'dark' : 'light');
    } else {
      if (typeof applyTheme === 'function') applyTheme(v);
    }
    const span = document.querySelector('[data-act="pd-theme"] span');
    if (span) span.innerHTML = '&rarr; ' + themeSelBtn.textContent;
    $('#pdThemeMenu').classList.remove('active');
    return;
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const pDrop = $('#profDrop');
    if (pDrop && !pDrop.classList.contains('hidden')) {
      pDrop.classList.add('hidden');
      $('#pdLangMenu').classList.remove('active');
      $('#pdThemeMenu').classList.remove('active');
    }
  }
});
