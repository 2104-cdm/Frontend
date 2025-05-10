document.addEventListener('DOMContentLoaded', () => {
    cargarVentasPendientes();  // Cargar las ventas pendientes al cargar la página
    cargarProductos();  // Cargar los productos disponibles al cargar la página
});

// Cargar las ventas pendientes
function cargarVentasPendientes() {
    // Cargar las ventas pendientes desde la base de datos
    const contenedor = document.getElementById('ventas-pendientes');
    // Obtener el contenedor donde se mostrarán las ventas
    contenedor.innerHTML = '';  // Limpiar el contenedor

    if (!window.productosVendidos || window.productosVendidos.length === 0) {
        // Si no hay ventas pendientes, mostrar un mensaje
        // y salir de la función
        contenedor.innerHTML = '<p class="no-ventas">No hay ventas pendientes de despacho</p>';
        // Mostrar un mensaje si no hay ventas pendientes
        return;
    }

    window.productosVendidos.forEach((venta, index) => {
        // Iterar sobre cada venta y crear un elemento para mostrarla
        // Si la venta ya fue despachada, no la mostramos
        if (venta.despachado) return;  // Si la venta ya fue despachada, no la mostramos

        const ventaElement = document.createElement('div');
        // Crear un nuevo elemento div para cada venta
        ventaElement.classList.add('venta-card');
        // Añadir la clase 'venta-card' para aplicar estilos

        // Mostrar información de la venta
        ventaElement.innerHTML = `
            <div class="venta-header">
                <h3>Venta #${index + 1}</h3>
                <p>Fecha: ${formatearFecha(venta.fecha)}</p>
            </div>
            <div class="venta-productos">
                <h4>Productos:</h4>
                <ul>
                    ${venta.productos.map(producto => `
                        <li>
                            <span>${producto.nombre}</span>
                            <span>x${producto.cantidad}</span>
                            <span>$${(producto.precio * producto.cantidad).toFixed(2)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="venta-footer">
                <p class="venta-total">Total: $${venta.total.toFixed(2)}</p>
                <button class="despachar-btn" data-index="${index}">Despachar</button>
            </div>
        `;

        contenedor.appendChild(ventaElement);
    });

    // Añadir el evento de despachar a los botones de "Despachar"
    document.querySelectorAll('.despachar-btn').forEach(btn => {
        // Iterar sobre cada botón de despachar y añadir el evento
        // para despachar la venta correspondiente
        btn.addEventListener('click', () => {
            // Obtener el índice de la venta desde el botón
            // y llamar a la función para despachar la venta
            const index = parseInt(btn.dataset.index);
            // Convertir el índice a número entero
            despacharVenta(index);  // Llamar a la función para despachar la venta
        });
    });
}

// Función para despachar una venta
function despacharVenta(index) {
    const venta = window.productosVendidos[index];

    // Actualizar el estado de la venta a "despachado"
    venta.despachado = true;
    venta.fechaDespacho = new Date();

    // Enviar la actualización al backend
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3000/api/ventas/${venta.id}/despachar`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify({
            despachado: true,
            fechaDespacho: venta.fechaDespacho,
        }),
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Error al despachar la venta en el servidor');
        }
        return res.json();
    })
    .then(data => {
        alert(`Venta #${index + 1} despachada con éxito`);
        cargarVentasPendientes();  // Recargar las ventas pendientes para reflejar los cambios
    })
    .catch(error => {
        console.error('Error:', error);
        alert('No se pudo despachar la venta');
    });
}

// Función para formatear la fecha
function formatearFecha(fecha) {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleString();
}

// Verificar si el token de autenticación existe
const token = localStorage.getItem('token');

if (!token) {
    alert('No estás autenticado. Redirigiendo al login...');
    window.location.href = '/public/logint.html'; // Redirigir al login si no hay token
} else {
    // Cargar productos disponibles desde el servidor
    fetch('http://localhost:3000/api/almacen', {
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
                window.location.href = './public/logint.html'; // Redirigir al login si la sesión ha expirado
            }
            throw new Error('Error de autenticación');
        }
        return response.json();
    })
    .then(data => {
        // Mostrar los productos o cualquier mensaje que devuelva el servidor
        alert(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Cargar las ventas pendientes al recargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetch("http://localhost:3000/api/ventas", {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    })
    .then(res => res.json())
    .then(data => {
        window.productosVendidos = data; // Cargar las ventas en memoria
        cargarVentasPendientes(); // Llamar a la función que muestra las ventas pendientes
    })
    .catch(err => {
        console.error("Error al obtener ventas:", err);
    });
});
