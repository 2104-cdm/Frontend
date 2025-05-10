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
                window.location.href = '/public/login.html';
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

    let total = 0;
    let carrito = [];

    const token = localStorage.getItem('token');

    // Cargar carrito desde el backend
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
        .catch(error => console.error("Error al cargar desde el backend:", error));
    }

    // Guardar carrito en el backend
    function guardarCarritoEnBackend() {
        fetch("http://localhost:3000/api/carrito", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ carrito })
        }).catch(error => console.error("Error al guardar en el backend:", error));
    }

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
                <div class="conteniendo-items">
                    <div class="img-carrito">
                        <img src="${item.imagen}" alt="${item.nombre}" width="50">
                    </div>

                    <div class="cont-item-precio">
                        <div class="item-nombre">
                            <span class="nombre-item">${item.nombre}</span>
                        </div>


                        <div class="item-precio">
                            <span class="precio-item">$${item.precio.toFixed(2)}</span>
                        </div>

                        <div class="item-cantidad">
                            <span class="cantidad-item">Cant: ${item.cantidad}</span>
                            <button class="eliminar-item" data-id="${item.id}">X</button>
                        </div>

                    </div>
                </div>

            `;

            carritoItems.appendChild(itemCarrito);
            total += item.precio * item.cantidad;
        });

        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    cargarCarritoDesdeBackend(); 
});
