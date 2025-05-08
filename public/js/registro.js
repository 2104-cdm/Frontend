document.getElementById('register-form').addEventListener('submit', async (e) => {
    //prevenir el comportamiento por defecto del formulario osea no envia los datos
    // y no recarga la pagina
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //significa que el contenido que se va a enviar es en formato json
                // y el servidor lo va a entender como tal
            },
            body: JSON.stringify({ email, password }),
            //convierte el objeto en una cadena JSON para enviarlo al servidor
        });


        const data = await response.json();
        //convierte la respuesta del servidor en un objeto JSON
        //y lo guarda en la variable data
        
        if (!response.ok){
            alert(data.message || 'Error en el registro');
            //si la respuesta no es ok, significa que hubo un error en el registro
            //y se muestra un mensaje de error
            console.error('Error:', data.message || 'Error en el registro');
            return;
        }
        if (response.ok) {
            alert(data.message);
            window.location.href = 'logint.html'; // Redirigir al login después del registro exitoso
        } else {
            alert(data.message || 'Error en el registro');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el registro');
    }
});
