// producto.js

const token = localStorage.getItem('token');

if (!token) {
    alert('No estás autenticado. Redirigiendo al login...');
    window.location.href = '/public/logint.html'; // Redirigir al login si no hay token
} else {
    
    fetch('http://localhost:3000/api/tienda', {
        method: 'GET',
        headers: {
            'Authorization': token, 
            // Enviar el token en la cabecera de autorización
            // El servidor lo espera en la cabecera Authorization 
        },
    })
    .then(response => {
        //
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Si la respuesta no es ok y el estado es 401 o 403, redirigir al login
                alert('Sesión expirada o no autorizada. Redirigiendo al login.');
                localStorage.removeItem('token');
                window.location.href = '/public/login.html';
            }
            throw new Error('Error de autenticación');
            // Si la respuesta no es ok, lanzar un error
            //y no se ejecuta el siguiente then
            //y se va al catch
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
