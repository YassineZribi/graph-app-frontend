import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '../style.css'

import notyf from '../../notyf-config'
import userService from '../../services/userService';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const registerBtn = document.getElementById('registerBtn');
    const registerBtnOriginalContent = registerBtn.innerHTML;

        // Disable the button and show spinner
        registerBtn.disabled = true;
        registerBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        `;

    try {
        const res = await userService.register({ first_name, last_name, email, password })
        sessionStorage.setItem('accountCreated', 'true');
        window.location.href = '/login';

    } catch (error) {
        console.error('Register Error:', error);
        notyf.error(error.response?.data?.message || error.message)
    } finally {
        // Revert button to original state
        registerBtn.disabled = false;
        registerBtn.innerHTML = registerBtnOriginalContent;
      }
});