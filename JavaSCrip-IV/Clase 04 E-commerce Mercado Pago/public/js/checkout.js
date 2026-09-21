/*
  4.2 - Método de pago con Mercado Pago (frontend)

  El flujo es siempre el mismo:
    1. El navegador le manda el carrito al backend (server.js).
    2. El backend crea la "preferencia" usando el ACCESS_TOKEN (secreto).
    3. El backend devuelve el id de esa preferencia.
    4. Con ese id y la PUBLIC_KEY dibujamos el botón oficial de Mercado Pago.

  El access token NUNCA viaja al navegador: solo vive en el servidor.
*/

// Si abrimos el index.html con doble click (file://) apuntamos al server local.
// Si entramos por http://localhost:3000 usamos el mismo origen.
const API_URL = window.location.protocol === "file:" ? "http://localhost:3000" : "";

let mpPublicKey = null;
let walletBrick = null;

// Le pedimos la public_key al backend para no hardcodearla en el código
const getPublicKey = async () => {
  if (mpPublicKey !== null) return mpPublicKey;

  const response = await fetch(`${API_URL}/api/public-key`);
  const data = await response.json();

  mpPublicKey = data.publicKey || "";
  return mpPublicKey;
};

// Parte 4 - El frontend le pide al backend que cree la preferencia
const createPreference = async () => {
  const response = await fetch(`${API_URL}/create_preference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: cart.map((product) => ({
        id: String(product.id),
        title: product.productName,
        quantity: product.quanty,
        unit_price: product.price,
        currency_id: "ARS",
      })),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "El servidor no pudo crear la preferencia");
  }

  return data; // { id, init_point }
};

// Parte 5 - Botón de Mercado Pago (Wallet Brick)
const renderMercadoPagoButton = async (preference, container) => {
  if (walletBrick) {
    walletBrick.unmount();
    walletBrick = null;
  }

  container.innerHTML = "";

  const publicKey = await getPublicKey();

  // Plan B: si falta la public_key o no cargó el SDK, redirigimos al Checkout Pro
  if (!publicKey || typeof MercadoPago === "undefined") {
    const link = document.createElement("a");
    link.className = "checkout-btn";
    link.href = preference.init_point;
    link.target = "_blank";
    link.rel = "noopener";
    link.innerText = "Ir a Mercado Pago";
    container.append(link);
    return;
  }

  const mp = new MercadoPago(publicKey, { locale: "es-AR" });

  walletBrick = await mp.bricks().create("wallet", container.id, {
    initialization: { preferenceId: preference.id },
    customization: { texts: { valueProp: "smart_option" } },
  });
};

// Bloque que se agrega al footer del modal cuando hay productos en el carrito
const createCheckoutSection = () => {
  const section = document.createElement("div");
  section.className = "checkout";

  const payButton = document.createElement("button");
  payButton.className = "checkout-btn";
  payButton.innerText = "Pagar con Mercado Pago";

  const status = document.createElement("p");
  status.className = "checkout-status";

  const walletContainer = document.createElement("div");
  walletContainer.id = "wallet_container";

  section.append(payButton, status, walletContainer);

  payButton.addEventListener("click", async () => {
    payButton.disabled = true;
    status.innerText = "Generando la orden de pago...";

    try {
      const preference = await createPreference();
      await renderMercadoPagoButton(preference, walletContainer);

      payButton.style.display = "none";
      status.innerText = "Elegí cómo querés pagar 👇";
    } catch (error) {
      console.error(error);
      status.innerText = `No se pudo generar el pago: ${error.message}`;
      payButton.disabled = false;
    }
  });

  return section;
};
