// --- CONFIGURACIÓN INICIAL ---
let fichas = 1000;
let aciertos = 0;
let errores = 0;
let girando = false;
let rotacionActual = 0;
const frecuenciaNumeros = new Array(10).fill(0); // Para el gráfico

// Elementos del DOM
const wheel = document.getElementById('wheel');
const fichasDisplay = document.getElementById('fichas');
const aciertosDisplay = document.getElementById('aciertos');
const erroresDisplay = document.getElementById('errores');
const mensaje = document.getElementById('resultado-texto');
const historialLista = document.getElementById('historial-lista');

// --- 1. INICIALIZAR GRÁFICO (Chart.js) ---
const ctx = document.querySelector('canvas').getContext('2d');
const chartResultados = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        datasets: [{
            label: 'Frecuencia',
            data: frecuenciaNumeros,
            backgroundColor: '#f1c40f',
            borderRadius: 5
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } }
    }
});

// --- 2. CREAR NÚMEROS EN LA RULETA ---
function crearNumerosRuleta() {
    for (let i = 1; i <= 10; i++) {
        const numContainer = document.createElement('div');
        numContainer.className = 'wheel-number';
        // Centramos el número en su sección (cada sección 36°, centro en +18°)
        numContainer.style.transform = `rotate(${(i - 1) * 36 + 18}deg)`;
        
        const span = document.createElement('span');
        span.innerText = i;
        numContainer.appendChild(span);
        wheel.appendChild(numContainer);
    }
}
crearNumerosRuleta();

// --- 3. CREAR BOTONES DE INTERACCIÓN ---
const botonesContainer = document.getElementById('botones');
for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.className = "btn-apuesta";
    btn.onclick = () => iniciarGiro(i);
    botonesContainer.appendChild(btn);
}

// --- 4. LÓGICA DEL JUEGO ---
function iniciarGiro(numeroElegido) {
    if (fichas < 10 || girando) return;

    girando = true;
    fichas -= 10; // Costo inicial del tiro
    actualizarMarcadores();
    
    mensaje.innerText = "La suerte no tiene patrones... girando...";
    mensaje.style.color = "#f1c40f";

    // Determinar ganador aleatorio (1-10)
    const ganador = Math.floor(Math.random() * 10) + 1;
    
    // Calcular grados
    // Cada sección mide 36 grados. El centro de la sección 1 está en 18 grados.
    const gradosPorSeccion = 36;
    const centroSeccion = (ganador - 1) * gradosPorSeccion + (gradosPorSeccion / 2);
    const rotacionObjetivo = 360 - centroSeccion;
    
    // Sumamos vueltas completas para el efecto de giro
    // Aseguramos que siempre gire hacia adelante sumando vueltas a la rotación actual
    const vueltasAdicionales = 1800; // 5 vueltas
    rotacionActual += vueltasAdicionales + rotacionObjetivo - (rotacionActual % 360); 

    wheel.style.transition = "transform 4s cubic-bezier(0.15, 0, 0.2, 1)";
    wheel.style.transform = `rotate(${rotacionActual}deg)`;

    // Esperar a que la ruleta se detenga
    setTimeout(() => {
        procesarResultado(numeroElegido, ganador);
    }, 4200);
}

function procesarResultado(elegido, ganador) {
    girando = false;
    
    // Actualizar datos para el gráfico
    frecuenciaNumeros[ganador - 1]++;
    chartResultados.update();

    // Lógica de recompensas
    if (elegido === ganador) {
        fichas += 100; // Si acierta, gana 10 veces su apuesta
        aciertos++;
        mensaje.innerText = `¡INCREÍBLE! Salió el ${ganador}. Ganas +100 fichas.`;
        mensaje.style.color = "#2ecc71";
    } else {
        // Ya perdió 10 al inicio, podemos quitarle otros 10 como decía el código original
        // o dejarlo así. El código original decía "fichas -= 10" adicional.
        fichas -= 10; 
        errores++;
        mensaje.innerText = `FALLASTE. Salió el ${ganador}.`;
        mensaje.style.color = "#e74c3c";
    }

    // Historial visual
    const item = document.createElement('span');
    item.className = 'historial-item';
    item.innerText = ganador;
    historialLista.prepend(item);

    actualizarMarcadores();
}

function actualizarMarcadores() {
    fichasDisplay.innerText = fichas;
    aciertosDisplay.innerText = aciertos;
    erroresDisplay.innerText = errores;
    
    if (fichas <= 0) {
        mensaje.innerText = "¡TE QUEDASTE SIN FICHAS! Recargando...";
        setTimeout(() => {
            fichas = 1000;
            actualizarMarcadores();
        }, 2000);
    }
}