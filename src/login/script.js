import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './style.css'

import notyf from '../notyf-config'
import userService from '../services/userService';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const loginBtn = document.getElementById('loginBtn');
    const loginBtnOriginalContent = loginBtn.innerHTML;

        // Disable the button and show spinner
        loginBtn.disabled = true;
        loginBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        `;

    try {
        const res = await userService.login({ email, password })
        localStorage.setItem('token', res.data.access_token);
        window.location.href = '/';

    } catch (error) {
        console.error('Login Error:', error);
        notyf.error('Invalid credentials')
    } finally {
        // Revert button to original state
        loginBtn.disabled = false;
        loginBtn.innerHTML = loginBtnOriginalContent;
      }
});