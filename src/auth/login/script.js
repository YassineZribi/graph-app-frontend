import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../style.css'

import notyf from '../../notyf-config'
import userService from '../../services/userService';

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
        notyf.error(error.response?.data?.message || error.message)
    } finally {
        // Revert button to original state
        loginBtn.disabled = false;
        loginBtn.innerHTML = loginBtnOriginalContent;
      }
});

document.addEventListener('DOMContentLoaded', () => {
    const accountCreated = sessionStorage.getItem('accountCreated');

    if (accountCreated) {
      notyf.success({duration: 6000, dismissible: true, message: "Account created!", className: "toast-custom-notyf"});

      // Remove the flag after showing the toast
      sessionStorage.removeItem('accountCreated');

    }
  });