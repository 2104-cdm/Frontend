document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Traer token (ajusta según cómo lo almacenas)
    const token = localStorage.getItem('token'); 
    if (!token) {
        alert('No estás autenticado.');
        window.location.href = 'producto.html';
        return;
    }

    // Verificar si es admin
    try {
        const roleResponse = await fetch('http://localhost:3000/api/roles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });

        const isAdmin = await roleResponse.json();

        if (!isAdmin || isAdmin === false || isAdmin === 'false') {
            alert('No tienes permisos para registrar usuarios.');
            window.location.href = 'producto.html';
            return;
        }

    } catch (error) {
        console.error('Error al verificar el rol:', error);
        alert('Error al verificar el rol. Redirigiendo...');
        window.location.href = 'producto.html';
        return;
    }

    // Si es admin, continúa con el registro
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/usuarios/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, nombre })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Error en el registro');
            console.error('Error:', data.message || 'Error en el registro');
            return;
        }

        alert(data.message);
        window.location.href = 'logint.html';

    } catch (error) {
        console.error('Error:', error);
        alert('Error en el registro');
    }
});
