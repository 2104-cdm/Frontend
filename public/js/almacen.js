document.addEventListener('DOMContentLoaded', () => {
    cargarVentasPendientes();
});

function cargarVentasPendientes() {
    const contenedor = document.getElementById('ventas-pendientes');
    contenedor.innerHTML = '';
    
    
    if (!window.productosVendidos || window.productosVendidos.length === 0) {
        contenedor.innerHTML = '<p class="no-ventas">No hay ventas pendientes de despacho</p>';
        return;
    }
    
   
    window.productosVendidos.forEach((venta, index) => {
        if (venta.despachado) return; 
        
        const ventaElement = document.createElement('div');
        ventaElement.classList.add('venta-card');
        
        
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
    
    
    document.querySelectorAll('.despachar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            despacharVenta(index);
        });
    });
}

function despacharVenta(index) {
    
    window.productosVendidos[index].despachado = true;
    window.productosVendidos[index].fechaDespacho = new Date();
    
    
    alert(`Venta #${index + 1} despachada con éxito`);
    
    
    cargarVentasPendientes();
}

function formatearFecha(fecha) {
    
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleString();
}
const token = localStorage.getItem('token');

if (!token) {
    alert('No estás autenticado. Redirigiendo al login...');
    window.location.href = '/public/logint.html'; // Redirigir al login si no hay token
} else {
    
    fetch('http://localhost:3000/api/almacen', {
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
                window.location.href = '/public/logint.html';
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
