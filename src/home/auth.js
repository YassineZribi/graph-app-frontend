import userService from "../services/userService";
import { sleep } from "../utils";

async function verifyToken() {
    const token = localStorage.getItem('token');
    const loader = document.getElementById('loader');
    const userCredantialsParagraph = document.getElementById('user-credantials');

    if (!token) {
        // Redirect immediately if no token exists
        window.location.href = '/login/';
        return;
    }

    try {
        const res = await userService.getProfile()

        // sleep(3000)

        // Token is valid, show the dashboard content
        // loader.style.display = 'none';
        loader.remove()
        
        userCredantialsParagraph.innerHTML = `${res.data.first_name} ${res.data.last_name} <span class="text-white-50">(${res.data.email})</span>`


    } catch (error) {
        // Invalid or expired token
        console.error('Auth Verification Error:', error);
        localStorage.removeItem('token');
        // window.location.href = '/login/';
    }
}

// Logout Logic
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login/';
});

// Verify token on page load
verifyToken();
