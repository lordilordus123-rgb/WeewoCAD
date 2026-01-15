const regBtn = document.getElementById('regButton');
const regUsernameInput = document.getElementById('regUsernameInput');
const regEmailInput = document.getElementById('regEmailInput');
const regPasswordInput = document.getElementById('regPasswordInput');
const regMsg = document.getElementById('regMsg');

function showRegMessage(text, color = 'white') {
  if (!regMsg) return;
  regMsg.textContent = text;
  regMsg.style.color = color;
}

if (regBtn) {
  regBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const username = regUsernameInput ? regUsernameInput.value.trim() : '';
    const email = regEmailInput ? regEmailInput.value.trim() : '';
    const password = regPasswordInput ? regPasswordInput.value.trim() : '';

    if (!username || !email || !password) {
      showRegMessage('Bitte Benutzername, E‑Mail und Passwort eingeben', '#ffdddd');
      return;
    }

    // einfache Email-Validierung
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      showRegMessage('Bitte eine gültige E‑Mail eingeben', '#ffdddd');
      return;
    }

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error('JSON Parse Error:', parseErr);
        showRegMessage('Server-Fehler (ungültige Antwort)', '#ffdddd');
        return;
      }
      if (res.status === 201) {
        const confirmationText = data.confirmed 
          ? 'Registrierung erfolgreich — Weiterleitung...'
          : 'Registrierung erfolgreich — Prüfe deine E‑Mail zum Aktivieren deines Kontos';
        showRegMessage(confirmationText, '#ddffdd');
        if (data.confirmed) {
          setTimeout(() => { window.location.href = 'serverview-index.html'; }, 900);
        } else {
          setTimeout(() => { window.location.href = 'WeewooCAD-login.html'; }, 3000);
        }
      } else if (res.status === 409) {
        showRegMessage(data.message || 'Benutzername oder E‑Mail bereits vergeben', '#ffeedb');
      } else {
        showRegMessage(data.message || 'Fehler bei der Registrierung', '#ffdddd');
      }
    } catch (err) {
      showRegMessage('Netzwerkfehler', '#ffdddd');
      console.error(err);
    }
  });
}

[regUsernameInput, regEmailInput, regPasswordInput].forEach((el) => {
  if (!el) return;
  el.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') regBtn.click();
  });
});
