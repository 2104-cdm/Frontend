// login.js
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        
        const response = await fetch('http://localhost:3000/api/login', {  
            method: 'POST',   
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }) 
        });

        const data = await response.json();

        if (data.token) {
            // Guardar el token en localStorage
            localStorage.setItem('token', data.token);
            window.location.href = 'tienda.html';  // Redirigir a la tienda
        } else {
            alert('Correo o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al iniciar sesión');
    }
});
 