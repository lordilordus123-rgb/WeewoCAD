const submitBtn = document.getElementById('myButton');
const userInput = document.getElementById('userInput');
const passwordInput = document.getElementById('passwordInput');
const msg = document.getElementById('msg');

function showMessage(text, color = 'white') {
	if (!msg) return;
	msg.textContent = text;
	msg.style.color = color;
}

if (submitBtn) {
	submitBtn.addEventListener('click', async function (e) {
		e.preventDefault();
		const user = userInput ? userInput.value.trim() : '';
		const password = passwordInput ? passwordInput.value.trim() : '';

		if (!user || !password) {
			showMessage('Bitte Benutzername/E‑Mail und Passwort eingeben', '#ffdddd');
			return;
		}

		try {
			const res = await fetch('/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user, password })
			});

			let data = {};
			try {
				data = await res.json();
			} catch (parseErr) {
				console.error('JSON Parse Error:', parseErr);
				console.error('Response status:', res.status);
				showMessage('Server-Fehler (ungültige Antwort)', '#ffdddd');
				return;
			}

			if (res.status === 200) {
				// Login erfolgreich => weiterleiten
				window.location.href = 'serverview-index.html';
			} else if (res.status === 404) {
				showMessage(data.message || 'Account nicht gefunden. Registrieren?', '#ffeedb');
				// Link zur Registrierung anzeigen
				if (msg) {
					const a = document.createElement('a');
					a.href = 'WeewooCAD-register.html';
					a.textContent = ' Registrieren';
					a.style.color = '#fff';
					a.style.marginLeft = '6px';
					msg.appendChild(a);
				}
			} else if (res.status === 403) {
				showMessage(data.message || 'Bitte bestätige deine E‑Mail. Prüfe Postfach.', '#ffeedb');
			} else if (res.status === 401) {
				showMessage(data.message || 'Ungültiges Passwort', '#ffdddd');
			} else {
				showMessage(data.message || 'Fehler beim Einloggen', '#ffdddd');
			}
		} catch (err) {
			showMessage('Netzwerkfehler: ' + err.message, '#ffdddd');
			console.error('Login error:', err);
		}
	});

	[userInput, passwordInput].forEach((el) => {
		if (!el) return;
		el.addEventListener('keydown', (ev) => {
			if (ev.key === 'Enter') submitBtn.click();
		});
	});
}