const shopContent = document.getElementById("shopContent");
const cartCounter = document.getElementById("cart-counter");
const cart = [];

// 4.1 - Contador de productos en el botón del carrito
const updateCartCounter = () => {
  // Sumamos las cantidades de cada producto, no la cantidad de items del array
  const totalUnits = cart.reduce((acc, product) => acc + product.quanty, 0);

  cartCounter.innerText = totalUnits;
  // Si el carrito está vacío escondemos el globito rojo
  cartCounter.style.display = totalUnits === 0 ? "none" : "grid";
};

productos.forEach((product) => {
  const content = document.createElement("div");
  content.className = "card";
  content.innerHTML = `
    <img src="${product.img}">
    <h3>${product.productName}</h3>
    <p class="price">${product.price} $</p>
  `;
  shopContent.append(content);

  const buyButton = document.createElement("button");
  buyButton.innerText = "Buy";

  content.append(buyButton);

  buyButton.addEventListener("click", () => {
    const repeat = cart.some((repeatProduct) => repeatProduct.id === product.id);

    if (repeat) {
      cart.map((prod) => {
        if (prod.id === product.id) {
          prod.quanty++;
        }
      });
    } else {
      cart.push({
        id: product.id,
        productName: product.productName,
        price: product.price,
        quanty: product.quanty,
        img: product.img,
      });
    }

    updateCartCounter();
  });
});

// Estado inicial del contador (carrito vacío)
updateCartCounter();
