const token = localStorage.getItem('token');

if (!token) {
    alert('No estás autenticado. Redirigiendo al login...');
    window.location.href = '/public/logint.html';
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
      mostrarProducto();
      isdmin ()
      
    if (!token) {
        alert('No estás autenticado. Redirigiendo al login...');
        window.location.href = '/public/logint.html';
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


    
function mostrarProducto() {
    fetch("http://localhost:3000/api/productos", {
        method: "GET",
        headers: {
            "Authorization": token
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Error al obtener productos");
        }
        return res.json();
    })
    .then(data => {
        console.log("Productos recibidos:", data);

        
        window.data = data;

        if (!data || !Array.isArray(data)) {
            console.error("Productos no disponibles o formato incorrecto.");
            return;
        }

        contenedorProductos.innerHTML = "";

        data.forEach(producto => {
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("tarjeta");

            tarjeta.innerHTML = `
                <div class="fototarjeta">
                    <img class="imgtarjeta1" src="${producto.url}" alt="${producto.nombre}">
                </div>
                <div class="nombre">
                    <label class="id">ID: ${producto.id_producto}</label>
                    <label class="name">${producto.nombre}</label>
                </div>
                <div class="botones">
                    <button class="ver"><a href="descripcion.html?id=${producto.id}">VER</a></button>
                    <button class="add" data-id="${producto.id_producto}" data-nombre="${producto.nombre}" data-precio="${producto.id_producto}" data-imagen="${producto.url}">+</button>
                </div>
            `;

            contenedorProductos.appendChild(tarjeta);
        });
    })
    .catch(error => console.error("Error al cargar productos:", error));
}

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
        
        return fetch("http://localhost:3000/api/bd", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(venta) // Usa los mismos datos que enviaste
        });
    })
    .then(res => {
        if (!res.ok) throw new Error("Error al guardar en base de datos");
        return res.json();
    })
    .then(data => {
        console.log("Venta guardada en base de datos:", data);
        actualizarInventario(carrito);
        alert("Venta registrada con éxito");

        carrito = [];
        mostrarCarrito();
        guardarCarritoEnBackend();
        window.location.href = "./almacen.html";
    })
    .catch(err => {
        console.error("Error en el proceso de venta:", err);
        alert("No se pudo completar la venta.");
    });
});


   
    // fetch('http://localhost:3000/api/bd', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': token
    //     },
    //     body: JSON.stringify(venta)
    // })
    // .then(res => {
    //     if (!res.ok) throw new Error('Error al registrar en la base de datos');
    //     return res.json();
    // })
    // .then(data => {
    //     console.log('Venta guardada en base de datos:', data);
    // })
    // .catch(error => {
    //     console.error('Error al vender:', error);
    //     alert('Error al guardar la venta en la base de datos');
    // });


    
    
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
    

                   
    async function isAdmin() {
    const elemento = document.getElementById('registro-boton');
    
    try {
        const response = await fetch('http://localhost:3000/api/roles', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token // Asegúrate de que `token` esté definido
            }
        });

        const data = await response.json();

        console.log('Data:', data);

        // Asegúrate de que el backend envíe true/false como booleano
        if (data === true || data === 'true') {
            // Es admin, puede ver el botón
            elemento.classList.add('ver');
        } else {
            // No es admin, redirige
            window.location.href = 'producto.html';
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al verificar el rol.');
    }
}

    
      
});
 function agregarDescricion(){
    carritoItems.innerHTML = "";

        carrito.forEach(item => {
            const itemCarrito = document.createElement("div");
            itemCarrito.classList.add("producto-a-detalle");

            itemCarrito.innerHTML = `
                <div class="galeria-principal">
            <div class="imagen-grande">
                <img src="${item.imagen}" alt="${item.nombre}">
            </div>

            <div class="cont-miniaturas">

                <div class="miniaturas">
                    <img src="${item.imagen}" alt="${item.nombre}">
                </div>
    
                <div class="miniaturas">
                    <img src="${item.imagen}" alt="${item.nombre}">
                </div>
    
                <div class="miniaturas">
                    <img src="${item.imagen}" alt="${item.nombre}">
                </div>

            </div>


        </div>

        <div class="cont-descripcion">
            <h1>${item.nombre}</h1>

            <div class="descripcion-producto">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Quisquam, voluptatibus.Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Quisquam, voluptatibus</p>
            </div>

            <div class="botones-accion">
                <button class="back">BACK</button>
                <button class="cart-boton">CART</button>
            </div>

        </div>

            `;

            
        });


    }