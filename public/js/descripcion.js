document.addEventListener("DOMContentLoaded", () => {
    const imagenGrande = document.querySelector(".imagen-grande img");
    const miniaturas = document.querySelectorAll(".miniaturas img");
    const titulo = document.querySelector(".cont-descripcion h1");
    const descripcionCont = document.querySelector(".descripcion-producto p");

    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = urlParams.get("id");

    const token = localStorage.getItem("token"); 

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
        const producto = data.find(p => p.id == idProducto || p.id_producto == idProducto);

        if (!producto) {
            console.error("Producto no encontrado");
            descripcionCont.textContent = "Producto no encontrado.";
            return;
        }

        titulo.textContent = producto.nombre;

        imagenGrande.src = producto.url;
        imagenGrande.alt = producto.nombre;

      
        miniaturas.forEach(img => {
            img.src = producto.url;
            img.alt = producto.nombre;
        });

      
        descripcionCont.textContent = producto.descripcion || "Sin descripción disponible.";
    })
    .catch(error => {
        console.error("Error al cargar detalle del producto:", error);
        descripcionCont.textContent = "Error al cargar la información del producto.";
    });
});
