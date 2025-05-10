const token = localStorage.getItem('token');

if (!token) {
    alert('No estás autenticado. Redirigiendo al login...');
    window.location.href = '/public/login.html';
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
                window.location.href = '/public/logint.html';
            }
            throw new Error('Error de autenticación');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const contenedorProductos = document.getElementById("main");
    const carritoItems = document.querySelector(".carrito-items");
    const totalElement = document.getElementById("total");
    const token = localStorage.getItem('token');

    if (!token) {
        alert('No estás autenticado. Redirigiendo al login...');
        window.location.href = '/public/login.html';
        return;
    }

    let total = 0;
    let carrito = [];

    // Cargar carrito desde backend
    function cargarCarritoDesdeBackend() {
        fetch("http://localhost:3000/api/carrito", {
            method: "GET",
            headers: {
                "Authorization": token
            }
        })
        .then(res => res.json())
        .then(data => {
            carrito = data.carrito || [];
            mostrarCarrito();
        })
        .catch(error => console.error("Error al cargar carrito:", error));
    }

    // Guardar carrito en backend
    function guardarCarritoEnBackend() {
        fetch("http://localhost:3000/api/carrito", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ carrito })
        }).catch(error => console.error("Error al guardar carrito:", error));
    }

    // Mostrar productos
    if (!window.listaProductosDisponibles) {
        console.error("Productos no disponibles.");
        return;
    }

    contenedorProductos.innerHTML = "";

    window.listaProductosDisponibles.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjeta");

        tarjeta.innerHTML = `
            <div class="fototarjeta">
                <img class="imgtarjeta1" src="${producto.imagen}" alt="${producto.nombre}">
            </div>
            <div class="nombre">
                <label class="id">ID: ${producto.codigo_local}</label>
                <label class="name">${producto.nombre}</label>
            </div>
            <div class="botones">
                <button class="ver"><a href="descripcion.html?id=${producto.id}">VER</a></button>
                <button class="add" data-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio_compra}" data-imagen="${producto.imagen}">+</button>
            </div>
        `;

        contenedorProductos.appendChild(tarjeta);
    });

    contenedorProductos.addEventListener("click", function (e) {
        if (e.target.classList.contains("add")) {
            const id = e.target.dataset.id;
            const nombre = e.target.dataset.nombre;
            const precio = parseFloat(e.target.dataset.precio);
            const imagen = e.target.dataset.imagen;

            agregarAlCarrito({ id, nombre, precio, imagen });
        }
    });

    carritoItems.addEventListener("click", function (e) {
        if (e.target.classList.contains("eliminar-item")) {
            const id = e.target.dataset.id;
            eliminarDelCarrito(id);
        }
    });

    function agregarAlCarrito(producto) {
        const productoExistente = carrito.find(p => p.id === producto.id);

        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            producto.cantidad = 1;
            carrito.push(producto);
        }

        mostrarCarrito();
        guardarCarritoEnBackend();
    }

    function eliminarDelCarrito(id) {
        carrito = carrito.filter(item => item.id !== id);

        mostrarCarrito();
        guardarCarritoEnBackend();
    }

    function mostrarCarrito() {
        carritoItems.innerHTML = "";
        total = 0;

        carrito.forEach(item => {
            const itemCarrito = document.createElement("div");
            itemCarrito.classList.add("carrito-item");

            itemCarrito.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}" width="50">
                <span class="nombre-item">${item.nombre}</span>
                <span class="precio-item">$${item.precio.toFixed(2)}</span>
                <span class="cantidad-item">Cantidad: ${item.cantidad}</span>
                <button class="eliminar-item" data-id="${item.id}">Eliminar</button>
            `;

            carritoItems.appendChild(itemCarrito);
            total += item.precio * item.cantidad;
        });

        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    
    document.getElementById("finalizar-compra").addEventListener("click", () => {
        if (carrito.length === 0) {
            alert("El carrito está vacío.");
            return;
        }
    
        const venta = {
            productos: carrito,
            fecha: new Date(),
            total: total,
            despachado: false
        };
    
        // Registrar la venta en el backend
        fetch("http://localhost:3000/api/ventas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(venta)
        })
        .then(res => {
            if (!res.ok) throw new Error("Error al registrar la venta");
            return res.json();
        })
        .then(data => {
            // Una vez que la venta se registra, proceder a actualizar el inventario
            actualizarInventario(carrito);
    
            alert("Venta registrada con éxito");
            carrito = []; // Vaciar el carrito
            mostrarCarrito(); // Actualizar la vista del carrito
            guardarCarritoEnBackend(); // Guardar el carrito vacío en el backend
            window.location.href = "./almacen.html"; // Redirigir al almacén
        })
        .catch(err => {
            console.error("Error al vender:", err);
            alert("No se pudo completar la venta");
        });
    });
    
    // Función para actualizar el inventario de productos vendidos
    function actualizarInventario(carrito) {
        carrito.forEach(producto => {
            // Enviar solicitud para reducir el inventario del producto vendido
            fetch(`http://localhost:3000/api/almacen/${producto.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify({
                    cantidad: -producto.cantidad // Restar la cantidad vendida
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Error al actualizar el inventario");
                return res.json();
            })
            .then(data => {
                console.log(`Inventario actualizado para ${producto.nombre}`);
            })
            .catch(err => {
                console.error("Error al actualizar el inventario:", err);
            });
        });
    }
    
});
