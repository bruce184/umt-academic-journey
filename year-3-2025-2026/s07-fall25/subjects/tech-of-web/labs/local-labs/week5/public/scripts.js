// Minimal client-side JS for week5 lab
document.addEventListener('DOMContentLoaded', () => {
  const home = document.getElementById('nav-home');
  if (home) {
    home.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Calculator handler (if present on page)
  const calcForm = document.getElementById('calc-form');
  if (calcForm) {
    calcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const n1 = parseFloat(document.getElementById('num1').value || 0);
      const n2 = parseFloat(document.getElementById('num2').value || 0);
      const op = document.getElementById('op').value;
      let result = '';
      switch (op) {
        case '+': result = n1 + n2; break;
        case '-': result = n1 - n2; break;
        case '*': result = n1 * n2; break;
        case '/': result = n2 !== 0 ? n1 / n2 : 'Error (div by 0)'; break;
        default: result = 'Invalid op';
      }
      const out = document.getElementById('result');
      if (out) out.textContent = result;
    });
  }

  // Optional: client-side simple validation for signup form
  // Support two possible markup variants: id 'signup-form' or 'frmSignup'
  const signup = document.getElementById('signup-form') || document.getElementById('frmSignup');
  if (signup) {
    // live validation helpers
    // Support alternate input ids: 'name' or 'username'; 'password2' or 'repeat'
    const nameEl = document.getElementById('name') || document.getElementById('username');
    const emailEl = document.getElementById('email');
    const passEl = document.getElementById('password');
    const pass2El = document.getElementById('password2') || document.getElementById('repeat');

    function setValid(el) {
      el.classList.remove('is-invalid');
      el.classList.add('is-valid');
    }
    function setInvalid(el) {
      el.classList.remove('is-valid');
      el.classList.add('is-invalid');
    }

    function validateUsername() {
      const v = (nameEl && nameEl.value || '').trim();
      if (v.length >= 3) setValid(nameEl);
      else setInvalid(nameEl);
      return v.length >= 3;
    }

    function validateEmail() {
      const v = (emailEl && (emailEl.value || '').trim()) || '';
      // simple email check
      const ok = v.includes('@') && v.indexOf('@') > 0;
      if (ok) setValid(emailEl); else setInvalid(emailEl);
      return ok;
    }

    function validatePassword() {
      const v = (passEl && (passEl.value || '')) || '';
      const ok = v.length >= 6;
      if (ok) setValid(passEl); else setInvalid(passEl);
      return ok;
    }

    function validatePasswordsMatch() {
      const ok = passEl && pass2El && passEl.value && passEl.value === pass2El.value;
      if (ok) {
        setValid(pass2El);
      } else {
        setInvalid(pass2El);
      }
      return ok;
    }

    [nameEl, emailEl, passEl, pass2El].forEach(el => {
      if (!el) return;
      el.addEventListener('input', () => {
        if (el === nameEl) validateUsername();
        if (el === emailEl) validateEmail();
        if (el === passEl) {
          validatePassword();
          validatePasswordsMatch();
        }
        if (el === pass2El) validatePasswordsMatch();
      });
    });

    signup.addEventListener('submit', (e) => {
      const ok = validateUsername() && validateEmail() && validatePassword() && validatePasswordsMatch();
      if (!ok) {
        e.preventDefault();
        // focus first invalid
        const firstInvalid = signup.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return false;
      }
      return true; // allow submit; server will render success message
    });
  }
});
