let product = [];

async function loadProducts() {
  try {
    const response = await fetch('http://localhost:4000/api/v1/product/show', {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch data from the API');
    const data = await response.json();
    localStorage.setItem('addedProduct', JSON.stringify(data.product));

    if (data && data.product && data.product.length > 0) {
      product = data.product;
      displayProducts(product);
    } else {
      showStatusMessage("No products available to display.", false);
    }
  } catch (error) {
    console.error("Error:", error);
    showStatusMessage("An error occurred while loading products.", false);
  }
}

function filterProducts(category) {
  const buttons = document.querySelectorAll('.filter-button');
  buttons.forEach(btn => btn.classList.remove('active'));

  const activeButton = document.querySelector(`button[onclick="filterProducts('${category}')"]`);
  if (activeButton) activeButton.classList.add('active');

  const filtered = category === 'all' ? product : product.filter(p => p.category === category);
  displayProducts(filtered);
}

function displayProducts(productsList) {
  const container = document.getElementById('product-list');
  container.innerHTML = '';

  if (productsList.length === 0) {
    container.innerHTML = '<p>No products to display.</p>';
    return;
  }

  productsList.forEach(product => {
    const item = document.createElement('div');
    item.classList.add('col-md-3');
    item.innerHTML = `
      <div class="product-item">
        <img src="${product.image}" alt="${product.name}" class="img-fluid" style="height: 200px; width: 100%; object-fit: cover;">
        <div class="product-info">
          <h4>${product.name}</h4>
          <p>${product.category}</p>
          <p>${product.description}</p>
          <p>Available: ${product.quantity}</p>
          <input placeholder="Enter quantity" type="number" min="1" id="myquantity-${product._id}">
          <p>₪${product.price}</p>
          <button class="btn btn-primary" onclick="addToCart('${product._id}', document.getElementById('myquantity-${product._id}').value)">Add to Cart</button>
        </div>
      </div>
    `;

    const input = item.querySelector(`#myquantity-${product._id}`);
    input.addEventListener("input", () => {
      if (input.value < 1) input.value = 1;
    });

    container.appendChild(item);
  });
}

async function addToCart(productId, quantity) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'SignInPage.html';
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/v1/order/add/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: parseInt(quantity) })
    });

    const result = await response.json();

    if (response.ok) {
      localStorage.setItem('cart', JSON.stringify(result.cart));
      localStorage.setItem('products', JSON.stringify(result.cart.products));
      showStatusMessage(result.message, true);
      updateCartDisplay();
    } else {
      showStatusMessage(result.message || "Failed to add product to cart.", false);
    }
  } catch (error) {
    console.error("Error:", error);
    showStatusMessage("An error occurred while adding the product to the cart.", false);
  }
}

function updateCartDisplay() {
  const cartCount = document.getElementById('cart-count');
  const cartItemsList = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  const cartData = JSON.parse(localStorage.getItem('cart')) || { products: [], totalPrice: 0 };
  const addedProduct = JSON.parse(localStorage.getItem('addedProduct')) || [];

  const cart = cartData.products;
  cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  cartItemsList.innerHTML = '';

  let total = 0;
  cart.forEach(product => {
    const fullProduct = addedProduct.find(p => p._id === product.productId);
    if (!fullProduct) return;

    const item = document.createElement('li');
    item.classList.add('list-group-item');
    item.innerHTML = `
      ${fullProduct.name} - ₪${fullProduct.price} x ${product.quantity}
      <button class="btn btn-danger btn-sm float-end" onclick="removeFromCart('${product.productId}')">delete</button>
    `;
    cartItemsList.appendChild(item);
    total += product.quantity * fullProduct.price;
  });

  cartTotal.textContent = `₪${total.toFixed(2)}`;
}

async function removeFromCart(productId) {
  try {
    const response = await fetch(`http://localhost:4000/api/v1/order/delete/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    const result = await response.json();
    if (response.ok) {
      let cartData = JSON.parse(localStorage.getItem('cart')) || { products: [], totalPrice: 0 };
      cartData.products = cartData.products.filter(item => item.productId !== productId);
      localStorage.setItem('cart', JSON.stringify(cartData));

      showStatusMessage(result.message, true);
      updateCartDisplay();
    } else {
      showStatusMessage(result.message || "Failed to remove product.", false);
    }
  } catch (error) {
    console.error("Error:", error);
    showStatusMessage("An error occurred while removing the product.", false);
  }
}

function searchProducts() {
  const query = document.querySelector('.search-box').value.trim().toLowerCase();
  if (query === '') {
    displayProducts(product);
  } else {
    const filtered = product.filter(p => p.name.toLowerCase().includes(query));
    if (filtered.length > 0) {
      displayProducts(filtered);
    } else {
      document.getElementById('product-list').innerHTML = '<p>No products found.</p>';
    }
  }
}

document.getElementById('cart-btn').addEventListener('click', () => {
  document.getElementById('cart-modal').style.display = 'flex';
});

document.getElementById('close-cart').addEventListener('click', () => {
  document.getElementById('cart-modal').style.display = 'none';
});

document.getElementById('checkout-btn').addEventListener('click', () => {
  window.location.href = 'checkout.html';
});

document.querySelector('.search-box').addEventListener('input', searchProducts);

window.onload = function () {
  loadProducts();
  updateCartDisplay();
};


