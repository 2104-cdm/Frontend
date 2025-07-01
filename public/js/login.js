// login.js
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
 
    try {
        
        const response = await fetch('http://localhost:3000/api/login/iniciarSeccion', {  
            method: 'POST',   
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }) 
        });

        const data = await response.json();
        
        if (data.token) {
            
            localStorage.setItem('token', data.token);
            window.location.href = '/public/producto.html';  
        }

       
        
        else {
            alert('Correo o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al iniciar sesión');
    }
});



