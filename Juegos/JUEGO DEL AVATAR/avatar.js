// ============================================================
//  LA LEYENDA DE AANG — LÓGICA DEL JUEGO
//  Clase 4: Programación Orientada a Objetos (Clases y Objetos)
//
//  Equipo: Lautaro (SM + Dev), Samira, Gabriel, Leandro
//  SCRUM con dailies en Discord + Live Share. Detalle en SCRUM.md
// ============================================================
//
//  ANTES (clases 1 a 3):
//      const jugador   = { nombre: '', emoji: '', vidas: 3 };
//      const personajes = { aang: {...}, katara: {...} };
//      ...y las 4 tarjetas de personaje escritas a mano en el HTML.
//
//  AHORA (POO):
//      Una CLASE es el molde (el "plano de la casa").
//      Cada personaje es un OBJETO fabricado con ese molde.
//      Los ATRIBUTOS son sus datos (nombre, emoji, vidas...).
//      Los MÉTODOS son sus acciones (atacar, recibir golpe, dibujarse...).
//
//      Resultado: agregar un personaje nuevo es UNA línea de código y no
//      se toca el HTML. Sirve para 4, para 100 o para 1000 personajes.
// ============================================================
//
//  RELACIÓN CON LA TEORÍA DE LA CLASE (video "Clases y Objetos"):
//
//      El video explica la POO con dos ejemplos:
//        · "Plano de Casa" (clase) → cada "Casa" construida (objeto).
//        · Clase "Animal" (molde)  → objetos "Perro", "Gato", "Elefante".
//
//      Acá el mismo patrón se repite tres veces:
//        · class Ataque    (molde) → objetos Puño, Patada, Barrida.
//        · class Personaje (molde) → objetos Aang, Katara, Sokka, Haru...
//        · class Juego     (molde) → el objeto "juego" que arranca al final.
//
//      Así como una Casa tiene ATRIBUTOS (color, cant. de ventanas) y
//      MÉTODOS (abrirPuerta, pintar), y un Animal tiene ATRIBUTOS (tamaño,
//      peso) y MÉTODOS (hacerSonido, comer, dormir) — acá un Personaje
//      tiene ATRIBUTOS (nombre, emoji, vidas) y MÉTODOS (recibirGolpe,
//      curarse, crearTarjeta). Ver el detalle en cada clase más abajo.
// ============================================================

'use strict';


/* ============================================================
   1) CLASE Ataque — el molde de los movimientos
   ------------------------------------------------------------
   ATRIBUTOS : id, nombre, emoji, venceA, colorClaro, colorOscuro
   MÉTODOS   : leGanaA(), empataCon(), crearBoton()

   Analogía del video: esta clase es el "plano", igual que "Plano de
   Casa". Puño, Patada y Barrida (más abajo, en el array ATAQUES) son
   las "Casas" ya construidas: mismos atributos, distinto valor cada uno.
   ============================================================ */
class Ataque {

    constructor({ id, nombre, emoji, venceA, colorClaro, colorOscuro }) {
        this.id          = id;            // identificador interno ('puno')
        this.nombre      = nombre;        // lo que se lee en pantalla ('Puño')
        this.emoji       = emoji;         // ícono del movimiento
        this.venceA      = venceA;        // id del ataque al que le gana
        this.colorClaro  = colorClaro;    // arriba del degradado del botón
        this.colorOscuro = colorOscuro;   // abajo del degradado del botón
    }

    // Getter: un atributo calculado a partir de otros dos
    get etiqueta() {
        return `${this.emoji} ${this.nombre}`;
    }

    // MÉTODO: ¿este ataque le gana al otro? (piedra-papel-tijera)
    leGanaA(otroAtaque) {
        return this.venceA === otroAtaque.id;
    }

    // MÉTODO: ¿son el mismo movimiento?
    empataCon(otroAtaque) {
        return this.id === otroAtaque.id;
    }

    // MÉTODO: el ataque construye su propio botón, con su color y su evento.
    // Por eso agregar un movimiento nuevo no obliga a tocar el HTML ni el CSS.
    crearBoton(alHacerClick) {
        const boton = document.createElement('button');
        boton.id = `boton-${this.id}`;
        boton.textContent = `${this.nombre} ${this.emoji}`;
        boton.style.setProperty('--color-claro', this.colorClaro);
        boton.style.setProperty('--color-oscuro', this.colorOscuro);
        boton.addEventListener('click', () => alHacerClick(this));
        return boton;
    }
}


/* ============================================================
   2) CLASE Personaje — el molde de los peleadores
   ------------------------------------------------------------
   ATRIBUTOS : id, nombre, emoji, titulo, descripcion, foto,
               tinte, vidasMax, vidas
   MÉTODOS   : estaVivo(), enPeligro(), recibirGolpe(), curarse(),
               porcentajeVida(), presentarse(), elegirAtaque(),
               coincideCon(), clonar(), crearAvatar(), crearTarjeta(),
               crearTarjetaArena(), refrescarVida()

   Analogía del video: esta clase cumple el mismo rol que la clase
   "Animal" del ejemplo (molde para Perro, Gato, Elefante...). Cada
   Personaje (Aang, Katara, Sokka, Haru) es un objeto distinto hecho
   con el mismo molde: mismos ATRIBUTOS (nombre, emoji, vidas...),
   valores propios; mismos MÉTODOS (recibirGolpe, curarse...), pero
   cada uno los ejecuta sobre SUS PROPIOS datos.
   ============================================================ */
class Personaje {

    // Todo lo que se guarda acá adentro con "this." es un ATRIBUTO: un
    // dato propio de CADA objeto (como el color o el peso del Animal del
    // video). Las funciones definidas más abajo en la clase son los
    // MÉTODOS: las acciones que ese objeto puede hacer.
    constructor({ id, nombre, emoji, titulo = '', descripcion = '', foto, tinte = 'rgba(255, 255, 255, 0.03)', vidas = 3 }) {
        this.id          = id;           // 'aang'  → también el nombre del .webp
        this.nombre      = nombre;       // 'Aang'
        this.emoji       = emoji;        // respaldo si la foto no carga
        this.titulo      = titulo;       // 'Maestro Aire'
        this.descripcion = descripcion;  // tooltip de la tarjeta
        this.tinte       = tinte;        // color de fondo de su tarjeta
        this.vidasMax    = vidas;        // vidas con las que arranca
        this.vidas       = vidas;        // vidas actuales

        // Si no le pasamos foto, la busca sola en /img. Si le pasamos
        // foto: null, el personaje se dibuja directamente con su emoji.
        this.foto = (foto === undefined) ? `./img/${id}.webp` : foto;

        // El personaje se guarda las referencias de SU tarjeta en la arena,
        // así después sabe actualizar su propia barra de vida.
        this.barraVida  = null;
        this.textoVidas = null;
    }

    // ---------- MÉTODOS DE COMBATE ----------

    estaVivo() {
        return this.vidas > 0;
    }

    enPeligro() {
        return this.vidas === 1;
    }

    // Pierde vida y actualiza su barra en pantalla. Nunca baja de 0.
    recibirGolpe(dano = 1) {
        this.vidas = Math.max(this.vidas - dano, 0);
        this.refrescarVida();
        return this.vidas;
    }

    curarse() {
        this.vidas = this.vidasMax;
        this.refrescarVida();
    }

    porcentajeVida() {
        return (this.vidas / this.vidasMax) * 100;
    }

    presentarse() {
        return `${this.nombre} ${this.emoji}`;
    }

    // La "inteligencia" del personaje: elige un movimiento al azar
    elegirAtaque(ataques) {
        return ataques[Math.floor(Math.random() * ataques.length)];
    }

    // Para el buscador del catálogo
    coincideCon(texto) {
        const buscado = texto.toLowerCase();
        return this.nombre.toLowerCase().includes(buscado)
            || this.titulo.toLowerCase().includes(buscado);
    }

    // Devuelve una COPIA nueva del personaje. Es clave: si el jugador y el
    // enemigo eligen el mismo personaje del catálogo, sin clonar estarían
    // compartiendo el mismo objeto (y las mismas vidas).
    // Es como construir DOS casas con el mismo plano: se parecen, pero
    // si a una le rompés una ventana, la otra sigue intacta porque son
    // objetos distintos, aunque vengan del mismo molde (misma clase).
    clonar() {
        return new Personaje({
            id: this.id,
            nombre: this.nombre,
            emoji: this.emoji,
            titulo: this.titulo,
            descripcion: this.descripcion,
            foto: this.foto,
            tinte: this.tinte,
            vidas: this.vidasMax
        });
    }

    // ---------- MÉTODOS DE DIBUJO (el objeto se dibuja a sí mismo) ----------

    // Foto del personaje con el emoji de respaldo detrás
    crearAvatar(grande = false) {
        const contenedor = document.createElement('span');
        contenedor.classList.add('avatar-img');
        if (grande) contenedor.classList.add('avatar-img-arena');

        const emoji = document.createElement('span');
        emoji.classList.add('emoji-fallback');
        emoji.textContent = this.emoji;

        if (this.foto) {
            const img = document.createElement('img');
            img.alt = this.nombre;
            emoji.classList.add('oculto');

            // Si falta el archivo en /img, se oculta la foto y aparece el emoji
            img.addEventListener('error', () => {
                img.classList.add('oculto');
                emoji.classList.remove('oculto');
            });

            img.src = this.foto;
            contenedor.append(img, emoji);
        } else {
            contenedor.append(emoji);
        }

        return contenedor;
    }

    // Tarjeta de la pantalla de selección
    crearTarjeta() {
        const tarjeta = document.createElement('label');
        tarjeta.classList.add('personaje-card');
        tarjeta.style.setProperty('--tinte', this.tinte);
        tarjeta.title = this.descripcion;
        tarjeta.htmlFor = `pj-${this.id}`;

        const radio = document.createElement('input');
        radio.type  = 'radio';
        radio.name  = 'personaje';
        radio.id    = `pj-${this.id}`;
        radio.value = this.id;

        const nombre = document.createElement('span');
        nombre.classList.add('nombre');
        nombre.textContent = this.nombre;

        const titulo = document.createElement('span');
        titulo.classList.add('subtitulo');
        titulo.textContent = this.titulo;

        tarjeta.append(this.crearAvatar(), radio, nombre, titulo);
        return tarjeta;
    }

    // <option> para el selector alternativo. Es la misma idea que
    // crearTarjeta(): el objeto se dibuja a sí mismo, solo que en otro
    // formato de HTML. Ambos leen los mismos atributos (id, nombre, emoji).
    crearOpcion() {
        const opcion = document.createElement('option');
        opcion.value = this.id;
        opcion.textContent = `${this.emoji} ${this.nombre} — ${this.titulo}`;
        return opcion;
    }

    // Tarjeta de la arena (foto grande + barra de vida)
    crearTarjetaArena() {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('arena-card');

        const nombre = document.createElement('span');
        nombre.classList.add('nombre');
        nombre.textContent = this.nombre;

        const barra = document.createElement('div');
        barra.classList.add('barra-vida');
        this.barraVida = document.createElement('div');
        this.barraVida.classList.add('barra-vida-fill');
        barra.append(this.barraVida);

        const texto = document.createElement('div');
        texto.classList.add('vidas-texto');
        this.textoVidas = document.createElement('span');
        texto.append('Vidas: ', this.textoVidas, `/${this.vidasMax}`);

        tarjeta.append(this.crearAvatar(true), nombre, barra, texto);
        this.refrescarVida();
        return tarjeta;
    }

    // Sincroniza la barra y el número de vidas con el estado real del objeto
    refrescarVida() {
        if (!this.barraVida) return;
        this.barraVida.style.width = `${this.porcentajeVida()}%`;
        this.barraVida.classList.toggle('critica', this.enPeligro());
        this.textoVidas.textContent = this.vidas;
    }
}


/* ============================================================
   3) LOS OBJETOS — acá se fabrican los ataques y los personajes
   ------------------------------------------------------------
   Cada "new" crea un objeto a partir del molde.
   Para sumar un personaje: copiás una línea, cambiás los datos, listo.
   ============================================================ */

const ATAQUES = [
    new Ataque({ id: 'puno',    nombre: 'Puño',    emoji: '👊', venceA: 'barrida', colorClaro: '#f16565', colorOscuro: '#dc2626' }),
    new Ataque({ id: 'patada',  nombre: 'Patada',  emoji: '🦵', venceA: 'puno',    colorClaro: '#3b9bf0', colorOscuro: '#2563eb' }),
    new Ataque({ id: 'barrida', nombre: 'Barrida', emoji: '🌀', venceA: 'patada',  colorClaro: '#34d67f', colorOscuro: '#16a34a' })
];

const PERSONAJES = [
    new Personaje({
        id: 'aang', nombre: 'Aang', emoji: '🌪️', titulo: 'Maestro Aire',
        descripcion: 'Usa su bastón y el elemento aire para ataques rápidos y movilidad.',
        tinte: 'rgba(252, 211, 77, 0.14)'
    }),
    new Personaje({
        id: 'katara', nombre: 'Katara', emoji: '💧', titulo: 'Maestra Agua',
        descripcion: 'Utiliza un frasco de agua y artes marciales con control de agua.',
        tinte: 'rgba(56, 189, 248, 0.14)'
    }),
    new Personaje({
        id: 'sokka', nombre: 'Sokka', emoji: '🪃', titulo: 'Guerrero',
        descripcion: 'Pelea cuerpo a cuerpo con su bumerán y espada de hueso/meteorito.',
        tinte: 'rgba(214, 178, 140, 0.14)'
    }),
    new Personaje({
        id: 'haru', nombre: 'Haru', emoji: '🪨', titulo: 'Maestro Tierra',
        descripcion: 'Usa el dominio de la tierra para arrojar rocas a los enemigos.',
        tinte: 'rgba(34, 197, 94, 0.14)'
    }),
    // Zuko y Toph: mismo molde Personaje, foto todavía no subida a /img
    // (zuko.webp y toph.webp), así que por ahora se dibujan con su emoji.
    new Personaje({
        id: 'zuko', nombre: 'Zuko', emoji: '🔥', titulo: 'Maestro Fuego',
        descripcion: 'Príncipe desterrado de la Nación del Fuego, domina las llamas con precisión.',
        tinte: 'rgba(239, 68, 68, 0.14)'
    }),
    new Personaje({
        id: 'toph', nombre: 'Toph', emoji: '🪨', titulo: 'Maestra Tierra',
        descripcion: 'Maestra Tierra ciega que "ve" con vibraciones; inventora del metalcontrol.',
        tinte: 'rgba(34, 197, 94, 0.14)'
    })
];


/* ============================================================
   4) CLASE Juego — el molde de la partida
   ------------------------------------------------------------
   ATRIBUTOS : catalogo, ataques, jugador, enemigo, terminado + DOM
   MÉTODOS   : iniciar(), dibujarCatalogo(), comenzarCombate(),
               atacar(), revisarFinDelJuego(), reiniciar(), etc.

   Esta clase no representa una "cosa" del mundo real como Casa o Animal,
   sino la PARTIDA en sí: agrupa todo lo que antes (clases 1 a 3) eran
   variables sueltas (jugador, enemigo, terminado) en un solo objeto,
   el que se crea al final del archivo con "new Juego(...)".
   ============================================================ */
class Juego {

    constructor({ catalogo, ataques }) {
        this.catalogo  = catalogo;   // todos los personajes disponibles
        this.ataques   = ataques;    // todos los movimientos posibles
        this.jugador   = null;       // se llena al empezar el combate
        this.enemigo   = null;
        this.terminado = false;

        // Referencias al DOM: se buscan una sola vez al arrancar (DRY)
        this.seccionPersonaje   = document.getElementById('seleccionar-personaje');
        this.seccionAtaque      = document.getElementById('seleccionar-ataque');
        this.seccionMensajes    = document.getElementById('mensajes');
        this.seccionReiniciar   = document.getElementById('reiniciar');
        this.seccionDespedida   = document.getElementById('despedida');
        this.listaPersonajes    = document.getElementById('lista-personajes');
        this.listaAtaques       = document.getElementById('lista-ataques');
        this.listaMovimientos   = document.getElementById('lista-movimientos');
        this.contadorPersonajes = document.getElementById('contador-personajes');
        this.buscador           = document.getElementById('buscador-personajes');
        this.selectorPersonaje  = document.getElementById('selector-personaje');
        this.arena              = document.getElementById('arena');
        this.contenedorMensajes = document.getElementById('contenedor-mensajes');
        this.modalReglas        = document.getElementById('modal-reglas');
        this.modalCrear         = document.getElementById('modal-crear-personaje');
        this.formNuevoPersonaje = document.getElementById('form-nuevo-personaje');
    }

    // ---------- ARRANQUE ----------

    iniciar() {
        this.dibujarCatalogo();
        this.dibujarAtaques();
        this.dibujarReglas();
        this.conectarEventos();
    }

    // Dibuja TODAS las tarjetas de personaje a partir de los objetos.
    // Con 4 o con 1000 el código es exactamente el mismo.
    dibujarCatalogo(filtro = '') {
        const texto    = filtro.trim();
        const visibles = texto ? this.catalogo.filter(p => p.coincideCon(texto)) : this.catalogo;

        // Un fragmento arma todo en memoria y lo inserta de una sola vez:
        // así el navegador no se traba aunque haya miles de tarjetas.
        const fragmento = document.createDocumentFragment();
        visibles.forEach(personaje => fragmento.append(personaje.crearTarjeta()));
        this.listaPersonajes.replaceChildren(fragmento);

        this.contadorPersonajes.textContent = (visibles.length === this.catalogo.length)
            ? `${this.catalogo.length} personajes disponibles`
            : `${visibles.length} de ${this.catalogo.length} personajes`;

        // El buscador aparece solo cuando el catálogo se hace grande
        this.buscador.classList.toggle('oculto', this.catalogo.length <= 8);

        this.dibujarSelector(visibles);
    }

    // El <select> es una segunda forma de elegir personaje, además de las
    // tarjetas. Se arma con el mismo catálogo (crearOpcion() en vez de
    // crearTarjeta()), y queda sincronizado con la tarjeta seleccionada.
    dibujarSelector(visibles = this.catalogo) {
        const elegidoActual = this.selectorPersonaje.value;

        const fragmento = document.createDocumentFragment();
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '— Elegí un personaje —';
        fragmento.append(placeholder);
        visibles.forEach(personaje => fragmento.append(personaje.crearOpcion()));

        this.selectorPersonaje.replaceChildren(fragmento);

        // Si el personaje que estaba elegido sigue en la lista filtrada,
        // se lo dejamos marcado en el selector.
        if (visibles.some(p => p.id === elegidoActual)) {
            this.selectorPersonaje.value = elegidoActual;
        }
    }

    // Los botones de ataque también salen de los objetos
    dibujarAtaques() {
        const fragmento = document.createDocumentFragment();
        this.ataques.forEach(ataque => {
            fragmento.append(ataque.crearBoton(elegido => this.atacar(elegido)));
        });
        this.listaAtaques.replaceChildren(fragmento);
    }

    // Y el reglamento del modal se escribe solo leyendo los ataques
    dibujarReglas() {
        const fragmento = document.createDocumentFragment();

        this.ataques.forEach(ataque => {
            const vence  = this.ataques.find(otro => otro.id === ataque.venceA);
            const pierde = this.ataques.find(otro => otro.venceA === ataque.id);

            const destacado = document.createElement('strong');
            destacado.textContent = ataque.nombre;

            const item = document.createElement('li');
            item.append(
                destacado,
                ` ${ataque.emoji} vence a ${vence ? vence.nombre : '—'}`,
                ` y pierde contra ${pierde ? pierde.nombre : '—'}.`
            );
            fragmento.append(item);
        });

        this.listaMovimientos.replaceChildren(fragmento);
    }

    conectarEventos() {
        document.getElementById('boton-personaje').addEventListener('click', () => this.comenzarCombate());
        document.getElementById('boton-reiniciar').addEventListener('click', () => this.reiniciar());
        document.getElementById('boton-reglas-personaje').addEventListener('click', () => this.mostrarReglas(true));
        document.getElementById('boton-reglas-arena').addEventListener('click', () => this.mostrarReglas(true));
        document.getElementById('boton-cerrar-reglas').addEventListener('click', () => this.mostrarReglas(false));
        document.getElementById('modal-reglas-fondo').addEventListener('click', () => this.mostrarReglas(false));

        this.buscador.addEventListener('input', () => this.dibujarCatalogo(this.buscador.value));
        document.addEventListener('keydown', evento => {
            if (evento.key === 'Escape') {
                this.mostrarReglas(false);
                this.mostrarCrearPersonaje(false);
            }
        });

        // ---- Selector <-> tarjetas: son dos vistas del MISMO estado ----
        // Elegir del <select> marca el radio de la tarjeta correspondiente.
        this.selectorPersonaje.addEventListener('change', () => {
            const radio = this.selectorPersonaje.value
                ? document.getElementById(`pj-${this.selectorPersonaje.value}`)
                : null;
            if (radio) radio.checked = true;
        });

        // Clickear una tarjeta actualiza el <select> (delegación de eventos:
        // un solo listener sirve para 4 o para 1000 tarjetas).
        this.listaPersonajes.addEventListener('change', evento => {
            if (evento.target.name === 'personaje') {
                this.selectorPersonaje.value = evento.target.value;
            }
        });

        // ---- Crear personaje (instanciar un objeto nuevo en vivo) ----
        document.getElementById('boton-crear-personaje').addEventListener('click', () => this.mostrarCrearPersonaje(true));
        document.getElementById('boton-cerrar-crear').addEventListener('click', () => this.mostrarCrearPersonaje(false));
        document.getElementById('modal-crear-fondo').addEventListener('click', () => this.mostrarCrearPersonaje(false));
        this.formNuevoPersonaje.addEventListener('submit', evento => {
            evento.preventDefault();
            this.crearPersonajePersonalizado();
        });

        // ---- Terminar el juego ----
        document.getElementById('boton-terminar-juego').addEventListener('click', () => this.terminarJuego());
        document.getElementById('boton-volver-inicio').addEventListener('click', () => location.reload());
    }

    // ---------- COMBATE ----------

    comenzarCombate() {
        const elegido = document.querySelector('input[name="personaje"]:checked');

        if (!elegido) {
            this.seccionMensajes.classList.remove('oculto');
            this.mostrarMensaje('⚠️ Por favor, elegí un personaje primero.', 'tie');
            return;
        }

        // clonar() para que el catálogo quede intacto: peleamos con copias
        this.jugador = this.buscarPersonaje(elegido.value).clonar();
        this.enemigo = this.personajeAleatorio().clonar();

        // La arena se arma pidiéndole a cada personaje que se dibuje
        this.arena.replaceChildren(
            this.jugador.crearTarjetaArena(),
            this.crearSeparadorVS(),
            this.enemigo.crearTarjetaArena()
        );

        this.terminado = false;
        this.seccionPersonaje.classList.add('oculto');
        this.seccionAtaque.classList.remove('oculto');
        this.seccionMensajes.classList.remove('oculto');

        this.mostrarMensaje(
            `Sos ${this.jugador.presentarse()} — el enemigo es ${this.enemigo.presentarse()}. ¡Que empiece el combate!`
        );
    }

    buscarPersonaje(id) {
        return this.catalogo.find(personaje => personaje.id === id);
    }

    personajeAleatorio() {
        return this.catalogo[Math.floor(Math.random() * this.catalogo.length)];
    }

    // Resuelve una ronda: mi movimiento contra uno aleatorio del enemigo
    atacar(ataqueJugador) {
        if (this.terminado || !this.jugador) return;

        const ataqueEnemigo = this.enemigo.elegirAtaque(this.ataques);
        let resultado;
        let claseMensaje;

        if (ataqueJugador.empataCon(ataqueEnemigo)) {
            resultado    = 'EMPATE';
            claseMensaje = 'tie';
        } else if (ataqueJugador.leGanaA(ataqueEnemigo)) {
            resultado    = 'GANASTE';
            claseMensaje = 'win';
            this.enemigo.recibirGolpe();
        } else {
            resultado    = 'PERDISTE';
            claseMensaje = 'lose';
            this.jugador.recibirGolpe();
        }

        this.mostrarMensaje(
            `${this.jugador.nombre} usó ${ataqueJugador.etiqueta} ` +
            `vs ${this.enemigo.nombre} con ${ataqueEnemigo.etiqueta} — ${resultado}`,
            claseMensaje
        );

        this.revisarFinDelJuego();
    }

    revisarFinDelJuego() {
        if (this.jugador.estaVivo() && this.enemigo.estaVivo()) return;

        if (!this.jugador.estaVivo() && !this.enemigo.estaVivo()) {
            this.finalizar('🤝 Empate final: ambos cayeron al mismo tiempo.');
        } else if (!this.jugador.estaVivo()) {
            this.finalizar(`💀 ${this.enemigo.nombre} te derrotó. ¡Perdiste!`);
        } else {
            this.finalizar(`🏆 ¡Venciste a ${this.enemigo.nombre}! Sos el Avatar.`);
        }
    }

    finalizar(mensaje) {
        this.terminado = true;
        this.mostrarMensaje(mensaje, 'final');
        this.listaAtaques.querySelectorAll('button').forEach(boton => boton.disabled = true);
        this.seccionReiniciar.classList.remove('oculto');
    }

    mostrarMensaje(texto, clase) {
        const parrafo = document.createElement('p');
        parrafo.textContent = texto;
        if (clase) parrafo.classList.add(clase);
        this.contenedorMensajes.prepend(parrafo);
    }

    reiniciar() {
        this.jugador   = null;
        this.enemigo   = null;
        this.terminado = false;

        this.contenedorMensajes.replaceChildren();
        this.arena.replaceChildren();
        this.listaAtaques.querySelectorAll('button').forEach(boton => boton.disabled = false);
        document.querySelectorAll('input[name="personaje"]').forEach(radio => radio.checked = false);

        this.seccionPersonaje.classList.remove('oculto');
        this.seccionAtaque.classList.add('oculto');
        this.seccionMensajes.classList.add('oculto');
        this.seccionReiniciar.classList.add('oculto');
    }

    mostrarReglas(mostrar) {
        this.modalReglas.classList.toggle('oculto', !mostrar);
    }

    mostrarCrearPersonaje(mostrar) {
        this.modalCrear.classList.toggle('oculto', !mostrar);
        if (!mostrar) this.formNuevoPersonaje.reset();
    }

    // Traduce el elemento elegido en el <select> a los atributos visuales
    // del Personaje (emoji, tinte, título). Es solo un mapa de datos, no
    // cambia nada de la clase Personaje en sí.
    datosDelElemento(elemento) {
        const elementos = {
            fuego:  { emoji: '🔥', tinte: 'rgba(239, 68, 68, 0.14)',  titulo: 'Maestro/a Fuego' },
            agua:   { emoji: '💧', tinte: 'rgba(56, 189, 248, 0.14)', titulo: 'Maestro/a Agua' },
            aire:   { emoji: '🌪️', tinte: 'rgba(252, 211, 77, 0.14)', titulo: 'Maestro/a Aire' },
            tierra: { emoji: '🌱', tinte: 'rgba(34, 197, 94, 0.14)',  titulo: 'Maestro/a Tierra' }
        };
        return elementos[elemento] ?? elementos.fuego;
    }

    // Lee el formulario y hace exactamente lo que explica la teoría de
    // "instanciar": new Personaje({...}) crea el objeto, agregarPersonajes()
    // lo suma al catálogo, y el propio objeto se dibuja solo (crearTarjeta()).
    crearPersonajePersonalizado() {
        const datosForm = new FormData(this.formNuevoPersonaje);
        const nombre     = datosForm.get('nombre').trim();
        const elemento   = datosForm.get('elemento');

        if (!nombre) return;

        const { emoji, tinte, titulo } = this.datosDelElemento(elemento);
        const id = `${nombre.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

        const nuevoPersonaje = new Personaje({
            id, nombre, emoji, titulo,
            descripcion: `Personaje creado por el jugador. Elemento: ${elemento}.`,
            foto: null,   // no tiene .webp propio, se dibuja con su emoji
            tinte
        });

        this.agregarPersonajes(nuevoPersonaje);
        this.mostrarCrearPersonaje(false);
        this.mostrarMensajeTemporal(`✨ Se creó a ${nuevoPersonaje.presentarse()} y ya está en el catálogo.`);
    }

    // Mensaje corto que no depende de que el combate haya arrancado
    // (a diferencia de mostrarMensaje(), que escribe en la sección de combate).
    mostrarMensajeTemporal(texto) {
        this.contadorPersonajes.textContent = texto;
        setTimeout(() => this.dibujarCatalogo(this.buscador.value), 2200);
    }

    // "Terminar el juego": oculta todo lo demás y muestra la despedida.
    // No borra el catálogo ni el progreso, solo saca la interfaz de juego.
    terminarJuego() {
        this.seccionPersonaje.classList.add('oculto');
        this.seccionAtaque.classList.add('oculto');
        this.seccionMensajes.classList.add('oculto');
        this.seccionReiniciar.classList.add('oculto');
        this.seccionDespedida.classList.remove('oculto');
    }

    crearSeparadorVS() {
        const separador = document.createElement('div');
        separador.classList.add('vs');
        separador.textContent = 'VS';
        return separador;
    }

    // Suma personajes al catálogo en caliente y redibuja la selección
    agregarPersonajes(...nuevos) {
        this.catalogo.push(...nuevos.flat());
        this.dibujarCatalogo(this.buscador.value);
        return this.catalogo.length;
    }
}


/* ============================================================
   5) FABRICAR 100, 1000 O LOS PERSONAJES QUE SEAN
   ------------------------------------------------------------
   Esto es lo que la POO nos regala: un for y el molde hacen el resto.
   Es la consigna final del video: "generar 100, 1000 o los personajes
   que sean" a partir de UNA clase, sin escribir cada objeto a mano.
   Probalo en la consola del navegador (F12):

        juego.agregarPersonajes(fabricarPersonajes(100));
        juego.agregarPersonajes(fabricarPersonajes(1000, { nombre: 'Clon' }));
   ============================================================ */
function fabricarPersonajes(cantidad, molde = {}) {
    const {
        nombre = 'Guerrero',
        emoji  = '🥷',
        titulo = 'Nación del Fuego',
        tinte  = 'rgba(239, 68, 68, 0.14)',
        vidas  = 3
    } = molde;

    const lote = [];
    const base = nombre.toLowerCase().replace(/\s+/g, '-');

    for (let i = 1; i <= cantidad; i++) {
        lote.push(new Personaje({
            id:          `${base}-${i}`,
            nombre:      `${nombre} ${i}`,
            emoji,
            titulo,
            descripcion: `${nombre} número ${i}, salido del mismo molde.`,
            foto:        null,   // no tiene .webp: se dibuja con su emoji
            tinte,
            vidas
        }));
    }

    return lote;
}


/* ============================================================
   6) ARRANQUE DEL JUEGO
   ============================================================ */
const juego = new Juego({ catalogo: PERSONAJES, ataques: ATAQUES });
juego.iniciar();

// Los dejamos a mano para poder jugar desde la consola del navegador
window.juego              = juego;
window.Personaje          = Personaje;
window.Ataque             = Ataque;
window.fabricarPersonajes = fabricarPersonajes;