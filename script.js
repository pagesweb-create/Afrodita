// --- CONFIGURACIÓN DE SUPABASE ---
const PROJECT_ID = 'miurdhrovfwvxglxkewb'; 
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_KEY = 'sb_publishable_Vxu6KBR8dWeZigQP8azHEg_NB78U2YT';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let productosDB = []; 
let carrito = [];

// --- CARGAR PRODUCTOS ---
async function obtenerProductos() {
    try {
        const { data, error } = await _supabase
            .from('productos')
            .select('*');

        if (error) {
            console.error("Error cargando productos:", error.message);
            return;
        }

        productosDB = data || [];
        mostrarProductos(productosDB);
    } catch (err) {
        console.error("Error de conexión:", err);
    }
}

function mostrarProductos(lista) {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;
    contenedor.innerHTML = "";

    lista.forEach(p => {
        const nombre = p.nombre || "Sin nombre";
        const precio = p.precio || 0;
        const imagen = p['imagen url'] || 'https://via.placeholder.com/300';
        
        // CAMBIO AQUÍ: Ahora busca 'tonos' en tu base de datos. Si no hay, pone 'Único'
        const tonosTexto = p['tonos'] || p['tallas'] || "Único"; 
        const listaTonos = tonosTexto.split(',');

        let selectTonos = `<select id="talla-${p.id}" class="talla-selector">`;
        listaTonos.forEach(t => {
            // CAMBIO AQUÍ: El usuario verá "Tono: Lila" en vez de "Talla: Lila"
            selectTonos += `<option value="${t.trim()}">Tono: ${t.trim()}</option>`;
        });
        selectTonos += `</select>`;

        contenedor.innerHTML += `
            <div class="card">
                <img src="${imagen}" alt="${nombre}">
                <h4 style="margin: 10px 0; font-size: 14px; color: #333;">${nombre}</h4>
                <p style="color: #ffb6c1; font-weight: bold; font-size: 16px;">$${precio.toLocaleString()}</p>
                ${selectTonos}
                <button class="btn-comprar" onclick="agregarAlCarrito(${p.id})">Añadir al Carrito</button>
            </div>
        `;
    });
}

// --- FILTROS Y BÚSQUEDA ---
function filtrar(cat) {
    const menu = document.getElementById('menu-sidebar');
    if (menu) menu.classList.add('menu-hidden');

    const titulo = document.getElementById('titulo-categoria');
    if (titulo) titulo.innerText = cat === 'todos' ? 'Nuestra Colección' : cat;
    
    const filtrados = cat === 'todos' 
        ? productosDB 
        : productosDB.filter(p => p.categoria?.toLowerCase() === cat.toLowerCase());
    
    mostrarProductos(filtrados);
}

function buscarProductos() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const filtrados = productosDB.filter(p => p.nombre.toLowerCase().includes(texto));
    mostrarProductos(filtrados);
}

// --- LÓGICA DEL CARRITO ---
function agregarAlCarrito(id) {
    const producto = productosDB.find(p => p.id === id);
    const selectorTalla = document.getElementById(`talla-${id}`);
    const tallaSeleccionada = selectorTalla ? selectorTalla.value : "Único";
    
    const item = {
        ...producto,
        tallaElegida: tallaSeleccionada,
        tempId: Date.now()
    };

    carrito.push(item);
    actualizarCarritoUI();
    
    const burbuja = document.getElementById('cart-burbuja');
    if (burbuja) {
        burbuja.style.transform = "scale(1.2)";
        setTimeout(() => burbuja.style.transform = "scale(1)", 200);
    }
}

function actualizarCarritoUI() {
    const lista = document.getElementById('items-carrito');
    const totalElemento = document.getElementById('total-precio');
    const cuentaBurbuja = document.getElementById('cuenta-carrito');
    
    if (!lista || !totalElemento || !cuentaBurbuja) return;

    lista.innerHTML = "";
    let total = 0;

    carrito.forEach(item => {
        total += item.precio;
        lista.innerHTML += `
            <div class="item-carrito">
                <img src="${item['imagen url']}" class="img-carrito">
                <div style="flex-grow:1; text-align:left; margin-left:10px;">
                    <p style="font-size: 12px; font-weight: bold; margin:0;">${item.nombre}</p>
                    <p style="font-size: 11px; color: #ffb6c1; margin:0;">Tono: ${item.tallaElegida} - $${item.precio.toLocaleString()}</p>
                </div>
                <button class="btn-quitar" onclick="quitarDelCarrito(${item.tempId})">✕</button>
            </div>
        `;
    });

    totalElemento.innerText = total.toLocaleString();
    cuentaBurbuja.innerText = carrito.length;
}

function quitarDelCarrito(tempId) {
    carrito = carrito.filter(item => item.tempId !== tempId);
    actualizarCarritoUI();
}

// --- INTERFAZ ---
function toggleMenu() {
    const menu = document.getElementById('menu-sidebar');
    if (menu) menu.classList.toggle('menu-hidden');
}

function toggleCarrito() {
    const sideCarrito = document.getElementById('carrito-sidebar');
    if (sideCarrito) sideCarrito.classList.toggle('carrito-hidden');
}

// --- WHATSAPP ---
function enviarWhatsApp() {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    let mensaje = "¡Hola Afrodita Makeup! ✨ Quisiera realizar este pedido:\n\n";
    carrito.forEach(item => {
        // CAMBIO AQUÍ: En el mensaje de WhatsApp ahora dirá "Tono"
        mensaje += `• ${item.nombre} (Tono: ${item.tallaElegida}) - $${item.precio.toLocaleString()}\n`;
    });
    mensaje += `\n*Total: $${document.getElementById('total-precio').innerText}*`;

    const url = `https://wa.me/573173046223?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

obtenerProductos();
