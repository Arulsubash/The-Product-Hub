document.addEventListener("DOMContentLoaded", () => {
  const addProductOverlay = document.getElementById("overlay");
  const passwordOverlay = document.getElementById("overlay-password");
  const productList = document.getElementById("product-list");
  const searchInput = document.getElementById("search");
  const filterItems = document.querySelectorAll(".dropdown-item");

  let actionType = null;
  let removeModeActive = false;
  let selectedProductCard = null;

  //Local Storage Functions
  const saveProductsToLocalStorage = (products) => {
    localStorage.setItem("products", JSON.stringify(products));
  };

  const loadProductsFromLocalStorage = () => {
    const productsJSON = localStorage.getItem("products");
    return productsJSON ? JSON.parse(productsJSON) : [];
  };

  const saveCartToLocalStorage = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const loadCartFromLocalStorage = () => {
    const cartJSON = localStorage.getItem("cart");
    return cartJSON ? JSON.parse(cartJSON) : [];
  };

  //Rendering Functions
  const renderProductCards = (products) => {
    if (!productList) return;

    document.querySelectorAll(".col").forEach(card => card.remove());
    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "col";
      productCard.innerHTML = `
        <div class="card h-100 shadow-sm border-0">
          <img src="${product.image}" class="card-img-top" alt="${product.name}">
          <div class="card-body" style="text-align: center;">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">Category: ${product.category}</p>
            <p class="card-text">Price: ₹${product.price}</p>
            <p class="card-text">${product.description}</p>
            <button class="add-to-cart btn btn-primary">Add to Cart</button>
          </div>
        </div>
      `;

      const addToCartButton = productCard.querySelector('.add-to-cart');
      if (addToCartButton) {
        addToCartButton.addEventListener('click', (e) => {
          e.stopPropagation();
          addToCart(product);
        });
      }

      productCard.addEventListener('click', () => {
        if (removeModeActive) {
          if (selectedProductCard) {
            selectedProductCard.classList.remove('selected');
          }
          selectedProductCard = productCard;
          selectedProductCard.classList.add('selected');
        }
      });

      fragment.appendChild(productCard);
    });

    productList.appendChild(fragment);
  };

  const renderCartItems = () => {
    const cartList = document.getElementById("cart-items");
    const cartItems = loadCartFromLocalStorage();

    if (!cartList) return;

    cartList.innerHTML = '';

    cartItems.forEach((item) => {
      const cartItemDiv = document.createElement('div');
      cartItemDiv.className = 'cart-item d-flex justify-content-between align-items-center mb-3';
      cartItemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
        <div class="ms-3 text-start flex-grow-1">
            <h5>${item.name}</h5>
            <p class="mb-0">Price: ₹${item.price}</p>
            <p class="mb-0">Quantity: ${item.quantity}</p>
        </div>
        <button class="remove-from-cart btn btn-danger" data-name="${item.name}">Remove</button>
      `;
      cartList.appendChild(cartItemDiv);
    });

    document.querySelectorAll('.remove-from-cart').forEach(button => {
      button.addEventListener('click', (e) => {
        const productName = e.target.dataset.name;
        removeFromCart(productName);
      });
    });

    calculateTotal();
  };

  const calculateTotal = () => {
    const totalAmountSpan = document.getElementById("total-amount");
    const cartItems = loadCartFromLocalStorage();

    if (!totalAmountSpan) return;

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmountSpan.textContent = total.toFixed(2);
  };

  //Cart and Product Management Functions
  const addToCart = (product) => {
    const cartItems = loadCartFromLocalStorage();
    const existingProductIndex = cartItems.findIndex(item => item.name === product.name);

    if (existingProductIndex > -1) {
      cartItems[existingProductIndex].quantity += 1;
    } else {
      const newCartItem = { ...product, quantity: 1 };
      cartItems.push(newCartItem);
    }

    saveCartToLocalStorage(cartItems);

    if (document.getElementById("cart-root")) {
      renderCartItems();
    }

    alert(`${product.name} has been added to the cart!`);
  };

  const removeFromCart = (productName) => {
    let cartItems = loadCartFromLocalStorage();
    cartItems = cartItems.filter(item => item.name !== productName);
    saveCartToLocalStorage(cartItems);
    renderCartItems();
  };

  const removeProduct = (productCard) => {
    const productName = productCard.querySelector('.card-title').textContent;
    let existingProducts = loadProductsFromLocalStorage();
    existingProducts = existingProducts.filter(p => p.name !== productName);
    saveProductsToLocalStorage(existingProducts);
    renderProductCards(existingProducts);

    //function to remove the item from the cart
    removeFromCart(productName);
    
    selectedProductCard = null;
    productCard.remove();
  };

  //Password Handling
  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && (e.key === 'A' || e.key === 'R')) {
      e.preventDefault();
      actionType = (e.key === 'A') ? 'add' : 'remove';
      if (passwordOverlay) passwordOverlay.style.display = "block";
    }

    if (removeModeActive && e.key === 'Delete') {
      if (selectedProductCard) {
        if (confirm(`Are you sure you want to remove ${selectedProductCard.querySelector('.card-title').textContent}?`)) {
          removeProduct(selectedProductCard);
        }
      } else {
        alert('Please select a product to remove by clicking on it.');
      }
    }
  });

  //event listeners
  const submitPasswordBtn = document.getElementById("submit-password-button");
  if (submitPasswordBtn) {
    submitPasswordBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const passwordInput = document.getElementById("password-input");
      const pass = passwordInput.value;
      if (pass === "Subash2006") {
        passwordOverlay.style.display = "none";
        passwordInput.value = "";

        if (actionType === 'add') {
          addProductOverlay.style.display = "block";
        } else if (actionType === 'remove') {
          removeModeActive = true;
          document.getElementById("headline").textContent = "Select a product to remove";
          document.getElementById("subhead").textContent = "Click on a product and press the 'Delete' key to remove it.";
          document.getElementById("search-containner").style.display = 'none';
          document.querySelectorAll('.col').forEach(card => {
            card.classList.add('product-removable');
          });
        }
        actionType = null;
      } else {
        alert("Incorrect Password");
        passwordInput.value = "";
      }
    });
  }

  const cancelPasswordBtn = document.getElementById("cancel-password-button");
  if (cancelPasswordBtn) {
    cancelPasswordBtn.addEventListener("click", () => {
      passwordOverlay.style.display = "none";
      if (removeModeActive) {
        removeModeActive = false;
        document.getElementById("headline").textContent = "Our Collections";
        document.getElementById("subhead").textContent = "Discover our collection of available products";
        document.getElementById("search-containner").style.display = 'block';
        document.querySelectorAll('.col.product-removable').forEach(card => {
          card.classList.remove('selected');
        });
      }
    });
  }

  const addBtn = document.getElementById("add-button");
  if (addBtn) {
    addBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const productName = document.getElementById("product-name").value;
      const productPrice = parseFloat(document.getElementById("product-price").value);
      const productCategory = document.getElementById("product-category").value;
      const productImage = document.getElementById("product-image").value;
      const productDescription = document.getElementById("product-description").value;

      if (productName && productPrice && productCategory && productImage && productDescription) {
        const newProduct = { name: productName, price: productPrice, category: productCategory, image: productImage, description: productDescription };
        const existingProducts = loadProductsFromLocalStorage();
        existingProducts.push(newProduct);
        saveProductsToLocalStorage(existingProducts);
        renderProductCards(existingProducts);
        addProductOverlay.style.display = "none";
        document.getElementById("product-name").value = "";
        document.getElementById("product-price").value = "";
        document.getElementById("product-category").value = "";
        document.getElementById("product-image").value = "";
        document.getElementById("product-description").value = "";
      } else {
        alert("Please fill in all fields");
      }
    });
  }

  //Initialization
  if (productList) {
    renderProductCards(loadProductsFromLocalStorage());
  }
  if (document.getElementById("cart-root")) {
    renderCartItems();
  }

  //Search and Filter
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const allProducts = loadProductsFromLocalStorage();
      const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
      renderProductCards(filteredProducts);
    });
  }

  filterItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const category = e.target.textContent;
      const allProducts = loadProductsFromLocalStorage();
      if (category === "All") {
        renderProductCards(allProducts);
      } else {
        const filteredProducts = allProducts.filter(product => product.category.toLowerCase() === category.toLowerCase());
        renderProductCards(filteredProducts);
      }
    });
  });

});