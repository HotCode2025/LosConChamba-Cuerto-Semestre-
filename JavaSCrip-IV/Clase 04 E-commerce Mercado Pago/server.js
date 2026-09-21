/*
  Parte 2 - Servidor del e-commerce (Los Sin Chamba)

  Hace dos cosas:
    1. Sirve el frontend estático de la carpeta /public.
    2. Expone /create_preference, el endpoint que le pide a Mercado Pago
       la "preferencia" de pago con los productos del carrito.

  El ACCESS_TOKEN se lee del archivo .env y nunca sale del servidor.
*/

const path = require("path");
const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const PORT = process.env.PORT || 3000;
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "";
const PUBLIC_KEY = process.env.MP_PUBLIC_KEY || "";
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Mercado Pago no acepta volver a localhost automáticamente
const isLocalUrl = (url) => url.includes("localhost") || url.includes("127.0.0.1");

// Validamos lo que llega del navegador: nunca confiar en el carrito del cliente
const parseItems = (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("El carrito está vacío");
  }

  return rawItems.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unit_price);

    if (!item.title || !Number.isInteger(quantity) || quantity < 1 || !(unitPrice > 0)) {
      throw new Error(`Producto inválido en el carrito: ${item.title || "sin nombre"}`);
    }

    return {
      id: String(item.id ?? ""),
      title: String(item.title),
      quantity,
      unit_price: unitPrice,
      currency_id: item.currency_id || "ARS",
    };
  });
};

// Parte 6 - El frontend pide la public_key acá (es pública, se puede exponer)
app.get("/api/public-key", (req, res) => {
  res.json({ publicKey: PUBLIC_KEY });
});

// Parte 4 - Creación de la preferencia de pago
app.post("/create_preference", async (req, res) => {
  if (!ACCESS_TOKEN) {
    return res.status(500).json({
      error: "Falta MP_ACCESS_TOKEN. Copiá .env.example a .env y pegá tus credenciales de prueba (Parte 6).",
    });
  }

  try {
    const items = parseItems(req.body.items);

    const body = {
      items,
      back_urls: {
        success: `${PUBLIC_URL}/resultado.html`,
        failure: `${PUBLIC_URL}/resultado.html`,
        pending: `${PUBLIC_URL}/resultado.html`,
      },
    };

    // auto_return solo funciona con una URL pública (no con localhost)
    if (!isLocalUrl(PUBLIC_URL)) {
      body.auto_return = "approved";
    }

    const preference = await new Preference(client).create({ body });

    res.json({
      id: preference.id,
      init_point: preference.init_point,
    });
  } catch (error) {
    console.error("❌ Error creando la preferencia:", error);
    res.status(400).json({ error: error.message || "No se pudo crear la preferencia" });
  }
});

app.listen(PORT, () => {
  console.log(`🛒 Tienda funcionando en http://localhost:${PORT}`);

  if (!ACCESS_TOKEN || !PUBLIC_KEY) {
    console.warn("⚠️  Faltan credenciales de Mercado Pago en el archivo .env (MP_ACCESS_TOKEN / MP_PUBLIC_KEY)");
  }
});
