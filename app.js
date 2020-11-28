const cartBtn = document.querySelector(".cart-btn");
const closeCart = document.querySelector(".close-cart");
const clearCart = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

let buttonsDOM = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
cartBtn.addEventListener("click", () => {
  cartOverlay.classList.add("transparentBsg");
  cartDOM.classList.add("showCart");
});

closeCart.addEventListener("click", () => {
  cartOverlay.classList.remove("transparentBsg");
  cartDOM.classList.remove("showCart");
});
// getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch(
        "./setup-files-js-comfy-house-master/products.json"
      );
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { id } = item.sys;
        const { title, price } = item.fields;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}
//
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    let result;
    return products.find((product) => product.id == id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}
// Display the products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
        <article class="product">
          <div class="img-container">
            <img src=${product.image} alt="" class="product-img" />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
       `;
    });
    productsDOM.innerHTML = result;
  }
  getBagBtn() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id == id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disable = true;
      } else {
        button.addEventListener("click", (e) => {
          e.target.innerText = "In Cart";
          e.target.disabled = true;
          console.log(Storage.getProduct(id));
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          cart = [...cart, cartItem];
          Storage.saveCart(cart);
          this.setCartValue(cart);
          this.addCartItem(cartItem);
          this.showCart();
        });
      }
    });
  }
  showCart() {
    cartOverlay.classList.add("transparentBsg");
    cartDOM.classList.add("showCart");
  }

  addCartItem(item) {
    let syntax = `<div class="cart-item">
      <img src=${item.image} alt="" />
      <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>Remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up arrow" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down arrow" data-id=${item.id}></i>
      </div>
    </div>`;
    cartContent.innerHTML += syntax;
  }

  setCartValue(cart) {
    let total = 0;
    let price = 0;
    cart.forEach((item) => {
      total += item.amount;
      price += item.amount * item.price;
    });
    cartItems.innerText = total;
    cartTotal.innerText = price;
  }

  setupApp() {
    this.setCartValue(cart);
    cart.forEach((item) => this.addCartItem(item));
  }

  cartLogic() {
    clearCart.addEventListener("click", () => {
      this.clear();
    });
    cartContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
        this.removeItem(e.target.dataset.id);
        cartContent.removeChild(e.target.parentElement.parentElement);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let addAmount = e.target;
        let id = e.target.dataset.id;
        let tempItem = cart.find((item) => item.id == id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValue(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = e.target;
        let id = e.target.dataset.id;
        let tempItem = cart.find((item) => item.id == id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValue(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(e.target.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clear() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    cartOverlay.classList.remove("transparentBsg");
    cartDOM.classList.remove("showCart");
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id != id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    console.log(button);
    button.disabled = false;
    button.innerHTML = ` <i class="fas fa-shopping-cart"></i>
              add to bag`;
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id == id);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  ui.setupApp();
  const products = new Products();
  products
    .getProducts()
    .then((data) => {
      ui.displayProducts(data);
      Storage.saveProducts(data);
    })
    .then(() => {
      ui.getBagBtn();
      ui.cartLogic();
    });
});
