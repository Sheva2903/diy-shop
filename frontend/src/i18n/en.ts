import type { vi } from "./vi";

type Translations = {
  [K in keyof typeof vi]: { [P in keyof (typeof vi)[K]]: string };
};

export const en: Translations = {
  nav: {
    home: "Home",
    catalog: "Products",
    trackOrder: "Track order",
    cart: "Cart",
    menu: "Menu",
    closeMenu: "Close menu",
    categories: "Categories"
  },
  home: {
    heroTitle: "Craft a masterpiece of your own",
    heroSubtitle: "Handmade goods, made with care and ready to ship every day.",
    heroCta: "Explore now",
    categoriesTitle: "Featured categories",
    featuredTitle: "Featured products",
    viewAll: "View all",
    inspirationTitle: "Creative inspiration",
    inspirationBody:
      "Every piece is shaped by hand and carries the story of the person who made it. Find the one that tells yours.",
    inspirationCta: "See the collection"
  },
  catalog: {
    title: "All products",
    resultCount_one: "{{count}} product",
    resultCount_other: "{{count}} products",
    filters: "Filters",
    category: "Category",
    allCategories: "All categories",
    priceRange: "Price range",
    minPrice: "Lowest price",
    maxPrice: "Highest price",
    sort: "Sort by",
    sortNewest: "Newest",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    apply: "Apply",
    clear: "Clear filters",
    loadMore: "Load more",
    search: "Search products",
    searchPlaceholder: "Candle, keychain, painting...",
    emptyTitle: "No matching products",
    emptyDescription: "Try a different search or clear some filters."
  },
  product: {
    outOfStock: "Out of stock",
    lowStock: "{{count}} left in stock",
    quantity: "Quantity",
    addToCart: "Add to cart",
    addedToCart: "Added to cart",
    description: "Description",
    shippingInfo: "Shipping information",
    nationwide: "Nationwide delivery",
    codAvailable: "Cash on delivery available",
    related: "You might also like",
    notFoundTitle: "Product not found",
    notFoundDescription: "This product is no longer available.",
    increase: "Increase quantity",
    decrease: "Decrease quantity",
    imageOf: "Image of {{name}}"
  },
  cart: {
    title: "Shopping cart",
    emptyTitle: "Your cart is empty.",
    emptyDescription: "Browse our handmade goods and add something you love.",
    emptyCta: "Explore products",
    remove: "Remove item",
    summary: "Order summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    shippingAtCheckout: "Calculated at checkout",
    total: "Total",
    checkout: "Proceed to checkout",
    outOfStockWarning: "Some items are out of stock. Remove them to continue.",
    continueShopping: "Continue shopping"
  },
  checkout: {
    title: "Checkout",
    shippingSection: "Shipping information",
    fullName: "Full name",
    phone: "Phone number",
    email: "Email",
    province: "Province / City",
    district: "District",
    ward: "Ward",
    street: "Street address",
    note: "Note for the courier",
    notePlaceholder: "E.g. deliver during office hours",
    paymentSection: "Payment method",
    cod: "Cash on delivery (COD)",
    codDescription: "Pay in cash when your order arrives.",
    bankTransfer: "Bank transfer",
    bankTransferDescription: "Transfer first; the order is confirmed once payment arrives.",
    bankInstructions:
      "Transfer with the reference: {{content}}. Your order is confirmed once we receive the payment.",
    summary: "Order summary",
    placeOrder: "Place order",
    submitting: "Processing...",
    submitError: "Could not create the order. Please try again.",
    emptyCart: "Your cart is empty",
    emptyCartDescription: "Add products to your cart before checking out.",
    selectProvince: "Select province / city",
    selectDistrict: "Select district",
    selectWard: "Select ward",
    loadingAddress: "Loading..."
  },
  confirmation: {
    title: "Order placed!",
    subtitle: "Thank you for shopping with DIY Shop.",
    orderCode: "Order code",
    copy: "Copy",
    copied: "Order code copied",
    saveCodeNote: "Save this order code so you can track it later.",
    recipient: "Recipient",
    address: "Address",
    paymentMethod: "Payment method",
    items: "Items ordered",
    total: "Total",
    trackOrder: "Track order",
    continueShopping: "Continue shopping",
    noOrderTitle: "No order to show",
    noOrderDescription: "Use the tracking page to look up your order."
  },
  bank: {
    title: "Bank transfer instructions",
    bankName: "Bank",
    accountNumber: "Account number",
    accountName: "Account holder",
    amount: "Amount",
    content: "Transfer reference",
    dueAt: "Pay before",
    qrAlt: "VietQR code for the bank transfer"
  },
  tracking: {
    title: "Track your order",
    description: "Enter the order code and the phone number used at checkout.",
    orderCode: "Enter your order code",
    orderCodePlaceholder: "E.g. DS20260728-ABC123",
    phone: "Phone number",
    phonePlaceholder: "Phone number used when ordering",
    submit: "Track",
    searching: "Searching...",
    required: "Please enter both the order code and the phone number.",
    notFound: "No order found with this code. Check the code or contact the shop.",
    orderDate: "Order date",
    orderStatus: "Order status",
    paymentStatus: "Payment status",
    items: "Items",
    shippingTo: "Shipping to",
    total: "Total",
    cancelledReason: "Cancellation reason"
  },
  orderStatus: {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    SHIPPING: "Shipping",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled"
  },
  paymentStatus: {
    UNPAID: "Unpaid",
    PAID: "Paid",
    FAILED: "Failed"
  },
  paymentMethod: {
    COD: "Cash on delivery",
    BANK_TRANSFER: "Bank transfer"
  },
  validation: {
    required: "This field is required",
    maxLength: "Must not exceed {{max}} characters",
    invalidEmail: "Invalid email address"
  },
  footer: {
    about: "About us",
    shipping: "Shipping",
    returns: "Returns",
    privacy: "Privacy policy",
    rights: "All rights reserved."
  },
  state: {
    loading: "Loading...",
    errorTitle: "This content could not load",
    errorDescription: "Please try again in a moment.",
    retry: "Try again",
    notFoundTitle: "Page not found",
    notFoundDescription: "This address is no longer available.",
    backHome: "Back to home"
  }
};
