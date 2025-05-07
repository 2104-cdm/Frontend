// tienda.js

const token = localStorage.getItem('token');

if (!token) {
    alert('No estás autenticado. Redirigiendo al login...');
    window.location.href = '/public/logint.html'; // Redirigir al login si no hay token
} else {
    
    fetch('http://localhost:3000/api/tienda', {
        method: 'GET',
        headers: {
            'Authorization': token,  
        },
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('Sesión expirada o no autorizada. Redirigiendo al login.');
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
            }
            throw new Error('Error de autenticación');
        }
        return response.json();
    })
    .then(data => {
        // Mostrar productos o mensaje
        alert(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
