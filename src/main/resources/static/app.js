const SHIPPING_FEE = 30000;
const cartKey = "diy-shop-cart";

const state = {
    products: [],
    categories: [],
    cart: loadCart()
};

const elements = {
    tabs: document.querySelectorAll(".tab"),
    views: {
        shop: document.querySelector("#shopView"),
        checkout: document.querySelector("#checkoutView"),
        track: document.querySelector("#trackView")
    },
    message: document.querySelector("#message"),
    productGrid: document.querySelector("#productGrid"),
    productTemplate: document.querySelector("#productTemplate"),
    searchInput: document.querySelector("#searchInput"),
    categorySelect: document.querySelector("#categorySelect"),
    cartCount: document.querySelector("#cartCount"),
    cartItems: document.querySelector("#cartItems"),
    subtotalValue: document.querySelector("#subtotalValue"),
    shippingValue: document.querySelector("#shippingValue"),
    totalValue: document.querySelector("#totalValue"),
    clearCartButton: document.querySelector("#clearCartButton"),
    checkoutForm: document.querySelector("#checkoutForm"),
    placeOrderButton: document.querySelector("#placeOrderButton"),
    orderSuccess: document.querySelector("#orderSuccess"),
    trackForm: document.querySelector("#trackForm"),
    trackingResult: document.querySelector("#trackingResult")
};

init();

async function init() {
    bindEvents();
    renderCart();
    await loadCategories();
    await loadProducts();
}

function bindEvents() {
    elements.tabs.forEach((tab) => {
        tab.addEventListener("click", () => showView(tab.dataset.view));
    });

    elements.searchInput.addEventListener("input", debounce(loadProducts, 250));
    elements.categorySelect.addEventListener("change", loadProducts);
    elements.clearCartButton.addEventListener("click", clearCart);
    elements.checkoutForm.addEventListener("submit", placeOrder);
    elements.trackForm.addEventListener("submit", trackOrder);
}

async function loadCategories() {
    try {
        state.categories = await requestJson("/api/categories");
        elements.categorySelect.innerHTML = '<option value="">All categories</option>';

        state.categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.nameEn;
            elements.categorySelect.append(option);
        });
    } catch (error) {
        showMessage(error.message);
    }
}

async function loadProducts() {
    const params = new URLSearchParams();
    const keyword = elements.searchInput.value.trim();
    const categoryId = elements.categorySelect.value;

    if (keyword) {
        params.set("keyword", keyword);
    }

    if (categoryId) {
        params.set("categoryId", categoryId);
    }

    const url = `/api/products${params.toString() ? `?${params}` : ""}`;

    try {
        state.products = await requestJson(url);
        renderProducts();
        renderCart();
    } catch (error) {
        showMessage(error.message);
    }
}

function renderProducts() {
    elements.productGrid.innerHTML = "";

    if (state.products.length === 0) {
        elements.productGrid.innerHTML = '<div class="empty-state">No products found.</div>';
        return;
    }

    state.products.forEach((product) => {
        const node = elements.productTemplate.content.firstElementChild.cloneNode(true);
        const image = node.querySelector("img");
        const fallback = node.querySelector(".image-fallback");
        const title = node.querySelector("h2");
        const quantityInput = node.querySelector('input[type="number"]');
        const addButton = node.querySelector("button");
        const stock = node.querySelector(".stock");

        title.textContent = product.nameEn;
        node.querySelector(".product-name-vi").textContent = product.nameVi;
        node.querySelector(".category-name").textContent = product.category.nameEn;
        node.querySelector(".price").textContent = formatMoney(product.price);
        stock.textContent = product.inStock ? `${product.inventoryQuantity} available` : "Out of stock";
        stock.classList.toggle("out", !product.inStock);
        fallback.textContent = product.nameEn;

        if (product.primaryImageUrl) {
            image.src = product.primaryImageUrl;
            image.alt = product.nameEn;
            image.addEventListener("error", () => image.classList.add("hidden"), { once: true });
        } else {
            image.classList.add("hidden");
        }

        quantityInput.max = product.inventoryQuantity;
        quantityInput.disabled = !product.inStock;
        addButton.disabled = !product.inStock;
        addButton.addEventListener("click", () => addToCart(product, Number(quantityInput.value)));

        elements.productGrid.append(node);
    });
}

function renderCart() {
    const cartItems = getCartItems();
    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const total = cartItems.length > 0 ? subtotal + SHIPPING_FEE : 0;

    elements.cartCount.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    elements.subtotalValue.textContent = formatMoney(subtotal);
    elements.shippingValue.textContent = cartItems.length > 0 ? formatMoney(SHIPPING_FEE) : formatMoney(0);
    elements.totalValue.textContent = formatMoney(total);
    elements.placeOrderButton.disabled = cartItems.length === 0;

    elements.cartItems.innerHTML = "";

    if (cartItems.length === 0) {
        elements.cartItems.innerHTML = '<div class="empty-state">Your cart is empty.</div>';
        return;
    }

    cartItems.forEach(({ product, quantity }) => {
        const row = document.createElement("div");
        row.className = "cart-row";
        row.innerHTML = `
            <div>
                <h3>${escapeHtml(product.nameEn)}</h3>
                <p>${formatMoney(product.price)}</p>
            </div>
            <div class="cart-controls">
                <input type="number" min="1" max="${product.inventoryQuantity}" value="${quantity}" aria-label="Quantity for ${escapeHtml(product.nameEn)}">
                <button class="icon-button" type="button" aria-label="Remove ${escapeHtml(product.nameEn)}">x</button>
            </div>
        `;

        row.querySelector("input").addEventListener("change", (event) => {
            updateCartQuantity(product.id, Number(event.target.value));
        });
        row.querySelector("button").addEventListener("click", () => removeFromCart(product.id));

        elements.cartItems.append(row);
    });
}

function addToCart(product, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1) {
        showMessage("Quantity must be at least 1.");
        return;
    }

    const existingQuantity = state.cart[product.id] || 0;
    const nextQuantity = existingQuantity + quantity;

    if (nextQuantity > product.inventoryQuantity) {
        showMessage(`Only ${product.inventoryQuantity} available for ${product.nameEn}.`);
        return;
    }

    state.cart[product.id] = nextQuantity;
    saveCart();
    renderCart();
    showMessage(`${product.nameEn} added to cart.`, false);
}

function updateCartQuantity(productId, quantity) {
    const product = state.products.find((item) => item.id === Number(productId));

    if (!product || quantity < 1) {
        removeFromCart(productId);
        return;
    }

    state.cart[productId] = Math.min(quantity, product.inventoryQuantity);
    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    delete state.cart[productId];
    saveCart();
    renderCart();
}

function clearCart() {
    state.cart = {};
    saveCart();
    renderCart();
}

async function placeOrder(event) {
    event.preventDefault();

    const items = getCartItems();
    if (items.length === 0) {
        showMessage("Your cart is empty.");
        return;
    }

    const formData = new FormData(elements.checkoutForm);
    const payload = {
        recipientFullName: formData.get("recipientFullName"),
        phoneNumber: formData.get("phoneNumber"),
        email: formData.get("email"),
        provinceCity: formData.get("provinceCity"),
        district: formData.get("district"),
        ward: formData.get("ward"),
        streetAddress: formData.get("streetAddress"),
        customerNote: formData.get("customerNote"),
        paymentMethod: formData.get("paymentMethod"),
        items: items.map(({ product, quantity }) => ({
            productId: product.id,
            quantity
        }))
    };

    elements.placeOrderButton.disabled = true;

    try {
        const order = await requestJson("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        clearCart();
        elements.checkoutForm.reset();
        renderOrderSuccess(order);
        await loadProducts();
    } catch (error) {
        showMessage(error.message);
    } finally {
        renderCart();
    }
}

function renderOrderSuccess(order) {
    elements.orderSuccess.classList.remove("hidden");
    elements.orderSuccess.innerHTML = `
        <h2>Order created</h2>
        <div class="order-code">${escapeHtml(order.orderCode)}</div>
        <p>${escapeHtml(order.recipientFullName)} - ${escapeHtml(order.phoneNumber)}</p>
        <p>${order.paymentMethod.replace("_", " ")} · ${order.orderStatus} · ${order.paymentStatus}</p>
        <strong>${formatMoney(order.totalAmount)}</strong>
        ${renderOrderLines(order.items)}
    `;
}

async function trackOrder(event) {
    event.preventDefault();

    const formData = new FormData(elements.trackForm);
    const params = new URLSearchParams({
        orderCode: formData.get("orderCode").trim(),
        phoneNumber: formData.get("phoneNumber").trim()
    });

    try {
        const order = await requestJson(`/api/orders/track?${params}`);
        elements.trackingResult.classList.remove("hidden");
        elements.trackingResult.innerHTML = `
            <h2>${escapeHtml(order.orderCode)}</h2>
            <p>${escapeHtml(order.recipientFullName)} - ${escapeHtml(order.phoneNumber)}</p>
            <p>${order.paymentMethod.replace("_", " ")} · ${order.orderStatus} · ${order.paymentStatus}</p>
            <dl class="totals">
                <div><dt>Subtotal</dt><dd>${formatMoney(order.subtotal)}</dd></div>
                <div><dt>Shipping</dt><dd>${formatMoney(order.shippingFee)}</dd></div>
                <div class="grand-total"><dt>Total</dt><dd>${formatMoney(order.totalAmount)}</dd></div>
            </dl>
            ${renderOrderLines(order.items)}
        `;
    } catch (error) {
        elements.trackingResult.classList.add("hidden");
        showMessage(error.message);
    }
}

function renderOrderLines(items) {
    return `
        <div class="order-lines">
            ${items.map((item) => `
                <div class="order-line">
                    <span>${escapeHtml(item.productNameEn)} x ${item.quantity}</span>
                    <strong>${formatMoney(item.lineTotal)}</strong>
                </div>
            `).join("")}
        </div>
    `;
}

function getCartItems() {
    return Object.entries(state.cart)
        .map(([productId, quantity]) => ({
            product: state.products.find((product) => product.id === Number(productId)),
            quantity
        }))
        .filter((item) => item.product && item.quantity > 0);
}

function showView(viewName) {
    elements.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewName));
    Object.entries(elements.views).forEach(([name, view]) => {
        view.classList.toggle("active", name === viewName);
    });
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(data?.message || "Request failed");
    }

    return data;
}

function loadCart() {
    try {
        return JSON.parse(localStorage.getItem(cartKey)) || {};
    } catch {
        return {};
    }
}

function saveCart() {
    localStorage.setItem(cartKey, JSON.stringify(state.cart));
}

function showMessage(text, isError = true) {
    elements.message.textContent = text;
    elements.message.style.background = isError ? "#fff4e8" : "#eef8f2";
    elements.message.style.color = isError ? "#9a3412" : "#1e5c49";
    elements.message.classList.remove("hidden");

    window.setTimeout(() => {
        elements.message.classList.add("hidden");
    }, 2800);
}

function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0
    }).format(Number(value));
}

function debounce(callback, delay) {
    let timeoutId;

    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), delay);
    };
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
