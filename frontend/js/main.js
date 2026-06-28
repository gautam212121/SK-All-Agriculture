// Theme check (Immediately invoked to prevent screen flashing)
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
})();

// SK All Agriculture Parts Decoupled Storefront Client Engine

document.addEventListener('DOMContentLoaded', async function() {
    // 1. Load Shared Components (Header, Footer) and Sync Session
    await loadSharedComponents();
    
    // 2. Identify and Initialize Active Page Renderer
    if (document.getElementById('home-categories-grid')) {
        renderHomePage();
    } else if (document.getElementById('shop-products-grid')) {
        renderShopPage();
    } else if (document.getElementById('product-detail-container')) {
        renderProductDetailPage();
    } else if (document.getElementById('cart-items-container')) {
        renderCartPage();
    } else if (document.getElementById('checkout-form')) {
        renderCheckoutPage();
    } else if (document.getElementById('success-receipt-card')) {
        renderSuccessPage();
    } else if (document.getElementById('orders-history-container')) {
        renderOrdersPage();
    } else if (document.getElementById('order-detail-container')) {
        renderOrderDetailPage();
    } else if (document.getElementById('profile-container')) {
        renderProfilePage();
    } else if (document.getElementById('login-form')) {
        initLoginForm();
    } else if (document.getElementById('register-form')) {
        initRegisterForm();
    }
});

// GLOBAL STATE
let currentSession = { user: null, admin: null, cartCount: 0 };

// =========================================================================
// 1. SHARED COMPONENTS LOADER & SESSION SYNC
// =========================================================================
async function loadSharedComponents() {
    // A. Load Header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        try {
            const res = await fetch('/components/header.html');
            headerPlaceholder.innerHTML = await res.text();
            
            // Bind Theme Toggle Event Listener
            initThemeToggle();
            
            // Bind Mobile Menu Drawer Event Listeners
            initMobileNavDrawer();

            // Bind Mobile Search Overlay Event Listeners
            initMobileSearch();
        } catch (err) {
            console.error('Failed to load header component:', err);
        }
    }

    // B. Load Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        try {
            const res = await fetch('/components/footer.html');
            footerPlaceholder.innerHTML = await res.text();
        } catch (err) {
            console.error('Failed to load footer component:', err);
        }
    }

    // C. Fetch Session & Sync Navbar Elements
    try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success) {
            currentSession.user = data.user;
            currentSession.admin = data.admin;
            currentSession.cartCount = data.cartCount;
            
            syncNavbarUI();
        }
    } catch (err) {
        console.warn('Session synchronization failed. API offline or CORS issue.');
    }
}

// Binds event triggers for the responsive mobile drawer sidebar
function initMobileNavDrawer() {
    const toggle = document.getElementById('mobile-nav-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-drawer-overlay');
    const close = document.getElementById('mobile-drawer-close');

    if (toggle && drawer && overlay) {
        toggle.addEventListener('click', function() {
            drawer.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock scrolling
        });

        const closeDrawer = function() {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        };

        if (close) close.addEventListener('click', closeDrawer);
        overlay.addEventListener('click', closeDrawer);

        // Close drawer when clicking links (except dynamic buttons)
        const links = drawer.querySelectorAll('.mobile-drawer-link');
        links.forEach(link => {
            if (link.getAttribute('id') !== 'mobile-drawer-logout-btn') {
                link.addEventListener('click', closeDrawer);
            }
        });
    }
}

// Binds event triggers for the responsive mobile search overlay
function initMobileSearch() {
    const searchToggle = document.getElementById('mobile-search-toggle');
    const searchOverlay = document.getElementById('mobile-search-overlay');
    const closeSearch = document.getElementById('close-mobile-search');

    if (searchToggle && searchOverlay && closeSearch) {
        searchToggle.addEventListener('click', function() {
            searchOverlay.style.display = 'flex';
            const input = searchOverlay.querySelector('input');
            if (input) input.focus();
        });

        closeSearch.addEventListener('click', function() {
            searchOverlay.style.display = 'none';
        });
    }
}

// Synchronizes Navbar Buttons, Badges, and Logout hooks (Desktop & Mobile)
function syncNavbarUI() {
    // Sync Cart Badge
    const cartBadges = document.querySelectorAll('.cart-badge');
    cartBadges.forEach(badge => {
        if (currentSession.cartCount > 0) {
            badge.textContent = currentSession.cartCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });

    const loginBtn = document.getElementById('header-login-btn');
    const profileMenu = document.getElementById('header-profile-menu');
    const usernameText = document.getElementById('header-username-text');
    const avatarInitials = document.getElementById('header-avatar-initials');

    // Mobile Drawer Auth Selectors
    const mobAuthLinks = document.getElementById('mobile-drawer-auth-links');
    const mobProfileLinks = document.getElementById('mobile-drawer-profile-links');

    // Sync Auth Dropdowns (Desktop & Mobile Drawer)
    if (currentSession.user) {
        // Desktop Header sync
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileMenu) {
            profileMenu.style.display = 'block';
            usernameText.textContent = currentSession.user.name.split(' ')[0];
            avatarInitials.textContent = currentSession.user.name.charAt(0).toUpperCase();
        }

        // Mobile Drawer sync
        if (mobAuthLinks) mobAuthLinks.style.display = 'none';
        if (mobProfileLinks) mobProfileLinks.style.display = 'block';

        // Bind Desktop Logout
        const logoutBtn = document.getElementById('header-logout-btn');
        if (logoutBtn) {
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            newLogoutBtn.addEventListener('click', handleLogoutTrigger);
        }

        // Bind Mobile Logout
        const mobLogoutBtn = document.getElementById('mobile-drawer-logout-btn');
        if (mobLogoutBtn) {
            const newMobLogoutBtn = mobLogoutBtn.cloneNode(true);
            mobLogoutBtn.parentNode.replaceChild(newMobLogoutBtn, mobLogoutBtn);
            newMobLogoutBtn.addEventListener('click', handleLogoutTrigger);
        }
    } else {
        // Desktop Header sync
        if (loginBtn) loginBtn.style.display = 'block';
        if (profileMenu) profileMenu.style.display = 'none';

        // Mobile Drawer sync
        if (mobAuthLinks) mobAuthLinks.style.display = 'block';
        if (mobProfileLinks) mobProfileLinks.style.display = 'none';
    }
}

// Shared Logout Action handler
async function handleLogoutTrigger() {
    try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            showToast('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        }
    } catch (err) {
        showToast('Logout failed.', 'error');
    }
}

// =========================================================================
// 2. HOMEPAGE RENDERER
// =========================================================================
async function renderHomePage() {
    try {
        // Initialize Hero Banner Slider
        await initHeroSlider();

        const res = await fetch('/api/home');
        const data = await res.json();
        if (!data.success) return;

        // A. Render Categories
        const catGrid = document.getElementById('home-categories-grid');
        catGrid.innerHTML = '';
        data.categories.forEach(cat => {
            catGrid.innerHTML += `
                <div class="category-card">
                    <div class="category-img-container">
                        <img src="${cat.image.replace('.png', '.svg')}" alt="${cat.name}">
                    </div>
                    <h3 class="category-name">${cat.name}</h3>
                    <p class="category-desc">${cat.description || 'Premium quality durable replacement parts.'}</p>
                    <a href="/shop.html?category=${cat.slug}" class="category-btn">Explore Parts ➔</a>
                </div>
            `;
        });

        // B. Render Popular Products
        const popularGrid = document.getElementById('home-popular-grid');
        popularGrid.innerHTML = '';
        data.popularProducts.forEach(prod => {
            popularGrid.innerHTML += renderProductCard(prod);
        });

        // C. Render New Arrivals
        const arrivalsGrid = document.getElementById('home-arrivals-grid');
        arrivalsGrid.innerHTML = '';
        data.newArrivals.forEach(prod => {
            arrivalsGrid.innerHTML += renderProductCard(prod);
        });

        // D. Re-bind AJAX Add-To-Cart Forms
        initAjaxAddToCart();

        // E. Bind Technical Inquiry Form
        initInquiryForm();

    } catch (err) {
        console.error('Failed to render homepage data:', err);
    }
}

// Product Card HTML String Generator
function renderProductCard(prod) {
    const isDiscount = prod.discount_price !== null;
    const badgeText = isDiscount ? 'Offer' : 'Premium';
    const badgeClass = isDiscount ? 'product-badge discount' : 'product-badge';
    
    const priceHtml = isDiscount 
        ? `<span class="product-price">₹${prod.discount_price}</span><span class="product-old-price">₹${prod.price}</span>`
        : `<span class="product-price">₹${prod.price}</span>`;

    return `
        <div class="product-card">
            <span class="${badgeClass}">${badgeText}</span>
            <a href="/product.html?slug=${prod.slug}" class="product-img-wrap">
                <img src="${prod.main_image.replace('.png', '.svg')}" alt="${prod.name}">
            </a>
            <div class="product-info">
                <span class="product-brand">${prod.brand}</span>
                <h3 class="product-title"><a href="/product.html?slug=${prod.slug}">${prod.name}</a></h3>
                <div class="product-meta-row">
                    <span>SKU: ${prod.sku}</span>
                    <span>${prod.material.split(' ')[0]}</span>
                </div>
                <div class="product-price-row">
                    ${priceHtml}
                </div>
                <form class="ajax-add-to-cart-form">
                    <input type="hidden" name="productId" value="${prod.id}">
                    <input type="hidden" name="quantity" value="1">
                    <button type="submit" class="btn-card-add">🛒 Add to Cart</button>
                </form>
            </div>
        </div>
    `;
}

// =========================================================================
// 3. SHOP CATALOG RENDERER
// =========================================================================
async function renderShopPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search') || '';
    const category = urlParams.get('category') || '';
    const brand = urlParams.get('brand') || '';
    const sort = urlParams.get('sort') || '';

    // Set search input value in navbar
    const navSearchInput = document.getElementById('nav-search-input');
    if (navSearchInput) navSearchInput.value = search;

    try {
        const queryStr = new URLSearchParams({ search, category, brand, sort }).toString();
        const res = await fetch(`/api/products?${queryStr}`);
        const data = await res.json();
        if (!data.success) return;

        // A. Render Categories Filter Sidebar
        const catFilterList = document.getElementById('shop-categories-filter');
        if (catFilterList) {
            catFilterList.innerHTML = `
                <li>
                    <a href="/shop.html${brand ? '?brand=' + brand : ''}${sort ? (brand ? '&' : '?') + 'sort=' + sort : ''}" 
                       style="font-size: 14px; display: flex; justify-content: space-between; color: ${!category ? 'var(--accent-gold)' : 'var(--text-light)'}; font-weight: ${!category ? '700' : '400'};">
                        <span>All Categories</span>
                    </a>
                </li>
            `;
            data.categories.forEach(cat => {
                catFilterList.innerHTML += `
                    <li>
                        <a href="/shop.html?category=${cat.slug}${brand ? '&brand=' + brand : ''}${sort ? '&sort=' + sort : ''}" 
                           style="font-size: 14px; display: flex; justify-content: space-between; color: ${category === cat.slug ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-weight: ${category === cat.slug ? '700' : '400'};">
                            <span>${cat.name}</span>
                        </a>
                    </li>
                `;
            });
        }

        // B. Render Brands Filter Sidebar
        const brandFilterList = document.getElementById('shop-brands-filter');
        if (brandFilterList) {
            brandFilterList.innerHTML = `
                <li>
                    <a href="/shop.html${category ? '?category=' + category : ''}${sort ? (category ? '&' : '?') + 'sort=' + sort : ''}" 
                       style="font-size: 14px; color: ${!brand ? 'var(--accent-gold)' : 'var(--text-light)'}; font-weight: ${!brand ? '700' : '400'};">
                        All Brands
                    </a>
                </li>
            `;
            data.brands.forEach(b => {
                brandFilterList.innerHTML += `
                    <li>
                        <a href="/shop.html?brand=${b}${category ? '&category=' + category : ''}${sort ? '&sort=' + sort : ''}" 
                           style="font-size: 14px; color: ${brand === b ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-weight: ${brand === b ? '700' : '400'};">
                            ${b}
                        </a>
                    </li>
                `;
            });
        }

        // C. Sync Sort Dropdown Selection & onchange listener
        const sortSelect = document.getElementById('shop-sort');
        if (sortSelect) {
            sortSelect.value = `/shop.html?${category ? 'category=' + category + '&' : ''}${brand ? 'brand=' + brand + '&' : ''}sort=${sort}`;
            
            // Reconstruct options with correct category and brand links
            sortSelect.innerHTML = `
                <option value="/shop.html?${category ? 'category=' + category + '&' : ''}${brand ? 'brand=' + brand + '&' : ''}" ${!sort ? 'selected' : ''}>Default Listing</option>
                <option value="/shop.html?${category ? 'category=' + category + '&' : ''}${brand ? 'brand=' + brand + '&' : ''}sort=price_asc" ${sort === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
                <option value="/shop.html?${category ? 'category=' + category + '&' : ''}${brand ? 'brand=' + brand + '&' : ''}sort=price_desc" ${sort === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
                <option value="/shop.html?${category ? 'category=' + category + '&' : ''}${brand ? 'brand=' + brand + '&' : ''}sort=newest" ${sort === 'newest' ? 'selected' : ''}>New Arrivals</option>
            `;
        }

        // D. Update Counts Header
        const countsText = document.getElementById('shop-counts-text');
        if (countsText) {
            let desc = `Showing <span style="color: var(--text-light); font-weight: 600;">${data.products.length}</span> replacement parts`;
            if (search) {
                desc += ` for "<span style="color: var(--accent-gold); font-weight: 600;">${search}</span>"`;
            }
            countsText.innerHTML = desc;
        }

        // E. Render Product Cards Grid
        const productsGrid = document.getElementById('shop-products-grid');
        productsGrid.innerHTML = '';
        if (data.products.length > 0) {
            data.products.forEach(prod => {
                productsGrid.innerHTML += renderProductCard(prod);
            });
            initAjaxAddToCart();
        } else {
            productsGrid.style.display = 'block';
            productsGrid.innerHTML = `
                <div style="background-color: var(--bg-surface); border: 1px dashed var(--border-light); border-radius: var(--radius-lg); padding: 80px 40px; text-align: center; width: 100%;">
                    <span style="font-size: 48px;">🔍</span>
                    <h3 style="font-family: 'Outfit', sans-serif; font-size: 22px; margin-top: 16px; margin-bottom: 8px;">No Spare Parts Found</h3>
                    <p style="color: var(--text-muted); font-size: 14px; max-width: 420px; margin: 0 auto 24px auto;">We couldn't find any products matching your active filters or search terms.</p>
                    <a href="/shop.html" class="btn-accent" style="display: inline-block;">Reset Search Catalog</a>
                </div>
            `;
        }

        // F. Initialize Mobile Filter Drawer
        initShopFilterDrawer();

    } catch (err) {
        console.error('Failed to render shop page catalog:', err);
    }
}

// =========================================================================
// 4. PRODUCT DETAIL RENDERER
// =========================================================================
async function renderProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        window.location.href = '/shop.html';
        return;
    }

    try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.status === 404) {
            window.location.href = '/404.html';
            return;
        }
        const data = await res.json();
        if (!data.success) return;

        const prod = data.product;

        // A. Render Breadcrumbs
        const breadcrumbs = document.getElementById('product-breadcrumbs');
        if (breadcrumbs) {
            breadcrumbs.innerHTML = `
                <a href="/index.html" style="color: var(--text-light);">Home</a> &nbsp;/&nbsp;
                <a href="/shop.html" style="color: var(--text-light);">Spare Parts</a> &nbsp;/&nbsp;
                <a href="/shop.html?category=${prod.category_slug}" style="color: var(--text-light); text-transform: capitalize;">${prod.category_name}</a> &nbsp;/&nbsp;
                <span style="color: var(--accent-gold); font-weight: 600;">${prod.name}</span>
            `;
        }

        // B. Render Images Gallery (Thumbnails switcher)
        const mainImgView = document.getElementById('product-main-img-view');
        if (mainImgView) mainImgView.src = prod.main_image.replace('.png', '.svg');

        const thumbsRow = document.getElementById('product-thumbs-row');
        if (thumbsRow) {
            thumbsRow.innerHTML = '';
            if (data.extraImages && data.extraImages.length > 0) {
                // Add default main image thumbnail
                thumbsRow.innerHTML += `
                    <div class="detail-thumb active" onclick="swapDetailMainImage('${prod.main_image.replace('.png', '.svg')}', this)">
                        <img src="${prod.main_image.replace('.png', '.svg')}" alt="Main Thumb">
                    </div>
                `;
                // Loop extra images
                data.extraImages.forEach((img, idx) => {
                    thumbsRow.innerHTML += `
                        <div class="detail-thumb" onclick="swapDetailMainImage('${img.image_url.replace('.png', '.svg')}', this)">
                            <img src="${img.image_url.replace('.png', '.svg')}" alt="Angle Thumb ${idx + 1}">
                        </div>
                    `;
                });
            }
        }

        // C. Render Product Metadata (Titles, Badges, Stock indicators)
        const brandText = document.getElementById('product-brand-text');
        if (brandText) brandText.textContent = prod.brand;

        const titleText = document.getElementById('product-title-text');
        if (titleText) titleText.textContent = prod.name;

        const badgesRow = document.getElementById('product-badges-row');
        if (badgesRow) {
            const stockHtml = prod.stock > 0
                ? `<span class="detail-pill stock-green"><span class="status-pulse-dot"></span> In Stock (${prod.stock} units)</span>`
                : `<span class="detail-pill stock-red"><span class="status-pulse-dot red"></span> Out of Stock</span>`;
            
            badgesRow.innerHTML = `
                <span class="detail-pill">${prod.quality_type}</span>
                <span class="detail-pill">SKU: ${prod.sku}</span>
                ${stockHtml}
            `;
        }

        // D. Render Prices Box
        const priceBox = document.getElementById('product-price-box');
        if (priceBox) {
            const isDiscount = prod.discount_price !== null;
            if (isDiscount) {
                priceBox.innerHTML = `
                    <span class="detail-price">₹${prod.discount_price}</span>
                    <span class="detail-old-price">₹${prod.price}</span>
                    <span class="detail-save-badge">Save ₹${(prod.price - prod.discount_price).toFixed(0)}</span>
                `;
            } else {
                priceBox.innerHTML = `<span class="detail-price">₹${prod.price}</span>`;
            }
        }

        // E. Render Short & Detailed Descriptions
        const shortDesc = document.getElementById('product-short-desc');
        if (shortDesc) shortDesc.textContent = prod.short_description || 'High-performance agricultural machine spare part.';

        const fullDescSection = document.getElementById('product-full-desc-section');
        const fullDescText = document.getElementById('product-full-desc-text');
        if (prod.description && fullDescSection && fullDescText) {
            fullDescSection.style.display = 'block';
            fullDescText.textContent = prod.description;
        }

        // F. Render Specifications Table
        const specsTable = document.getElementById('product-specs-table');
        if (specsTable) {
            let tableHtml = `
                <tr>
                    <td class="spec-label">Forged Material</td>
                    <td class="spec-value">${prod.material}</td>
                </tr>
                <tr>
                    <td class="spec-label">Net Weight</td>
                    <td class="spec-value">${prod.weight}</td>
                </tr>
                <tr>
                    <td class="spec-label">Compatible Model</td>
                    <td class="spec-value">${prod.compatible_model}</td>
                </tr>
                <tr>
                    <td class="spec-label">Part Usage / Application</td>
                    <td class="spec-value">${prod.part_usage}</td>
                </tr>
                <tr>
                    <td class="spec-label">Standard Quality Grade</td>
                    <td class="spec-value">${prod.quality_type}</td>
                </tr>
            `;
            if (prod.warranty) {
                tableHtml += `
                    <tr>
                        <td class="spec-label">Warranty Period</td>
                        <td class="spec-value" style="color: var(--accent-gold);">${prod.warranty}</td>
                    </tr>
                `;
            }
            specsTable.innerHTML = tableHtml;
        }

        // G. Render Actions (Add To Cart Spinners)
        const actionsContainer = document.getElementById('product-actions-container');
        if (actionsContainer) {
            if (prod.stock > 0) {
                actionsContainer.innerHTML = `
                    <form class="ajax-add-to-cart-form" style="width: 100%;">
                        <input type="hidden" name="productId" value="${prod.id}">
                        <div class="detail-actions-row">
                            <div class="qty-spinner">
                                <button type="button" class="btn-minus">−</button>
                                <input type="number" name="quantity" value="1" min="1" max="${prod.stock}" readonly>
                                <button type="button" class="btn-plus">+</button>
                            </div>
                            <button type="submit" class="btn-detail-add">🛒 Add to Shopping Cart</button>
                        </div>
                    </form>
                `;
                initQuantitySpinners();
                initAjaxAddToCart();
            } else {
                actionsContainer.innerHTML = `
                    <div class="detail-actions-row">
                        <button class="btn-detail-add" disabled style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-light); color: var(--text-muted); cursor: not-allowed; box-shadow: none;">Out of Stock</button>
                    </div>
                `;
            }
        }

        // H. Render Related Products
        const relatedSection = document.getElementById('product-related-section');
        const relatedGrid = document.getElementById('product-related-grid');
        if (data.relatedProducts && data.relatedProducts.length > 0 && relatedSection && relatedGrid) {
            relatedSection.style.display = 'block';
            relatedGrid.innerHTML = '';
            data.relatedProducts.forEach(r => {
                relatedGrid.innerHTML += renderProductCard(r);
            });
            initAjaxAddToCart();
        }

    } catch (err) {
        console.error('Failed to render product details page:', err);
    }
}

// Gallery Swap Image trigger
window.swapDetailMainImage = function(src, thumbElement) {
    const main = document.getElementById('product-main-img-view');
    if (main) main.src = src;
    document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
    if (thumbElement) thumbElement.classList.add('active');
};

// =========================================================================
// 5. CART PAGE RENDERER
// =========================================================================
async function renderCartPage() {
    // Read optional error message from URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorMsg = urlParams.get('error');
    const alertPlaceholder = document.getElementById('cart-alert-placeholder');
    if (errorMsg && alertPlaceholder) {
        alertPlaceholder.innerHTML = `<div class="alert alert-danger">${decodeURIComponent(errorMsg)}</div>`;
    }

    try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        if (!data.success) return;

        const wrapper = document.getElementById('cart-items-container');
        if (!wrapper) return;

        if (data.cartItems.length > 0) {
            wrapper.innerHTML = `
                <div class="cart-layout">
                    <!-- ITEMS TABLE -->
                    <div class="cart-table-card">
                        <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 12px; margin-bottom: 20px; display: flex; font-size: 13px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                            <div style="flex-grow: 1;">Spare Part Details</div>
                            <div style="width: 150px; text-align: center;">Quantity</div>
                            <div style="width: 120px; text-align: right;">Total Price</div>
                        </div>
                        <div id="cart-rows-placeholder"></div>
                    </div>

                    <!-- INVOICE SUMMARY -->
                    <div class="cart-summary-card">
                        <h3 style="font-family: 'Outfit', sans-serif; font-size: 20px; margin-bottom: 24px; border-bottom: 1px solid var(--border-light); padding-bottom: 12px;">Order Summary</h3>
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span style="font-weight: 600;">₹${data.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Platform Service Fee</span>
                            <span style="font-weight: 600; color: var(--accent-gold);">${data.platformFee > 0 ? `₹${data.platformFee.toFixed(2)}` : 'Free'}</span>
                        </div>
                        <div class="summary-row">
                            <span>Delivery Mode</span>
                            <span style="color: var(--accent-gold); font-weight: 600;">COD Only</span>
                        </div>
                        <div class="summary-row total-row">
                            <span>Estimated Total</span>
                            <span style="font-family: 'Outfit', sans-serif;">₹${data.total.toFixed(2)}</span>
                        </div>
                        <div style="margin-top: 30px;">
                            <a href="/checkout.html" class="btn-accent" style="display: block; text-align: center; padding: 14px 0;">
                                Proceed to Checkout (COD)
                            </a>
                        </div>
                        <div style="margin-top: 16px; text-align: center;">
                            <a href="/shop.html" style="font-size: 13px; color: var(--text-muted);">← Continue Shopping Catalog</a>
                        </div>
                    </div>
                </div>
            `;

            // Render Rows
            const rowsPlaceholder = document.getElementById('cart-rows-placeholder');
            data.cartItems.forEach(item => {
                rowsPlaceholder.innerHTML += `
                    <div class="cart-item-row" data-product-id="${item.id}">
                        <div style="display: flex; align-items: center; gap: 20px; flex-grow: 1;">
                            <div class="cart-item-img">
                                <img src="${item.main_image.replace('.png', '.svg')}" alt="${item.name}">
                            </div>
                            <div>
                                <span class="cart-item-brand">${item.brand}</span>
                                <h3 class="cart-item-title"><a href="/product.html?slug=${item.slug}" style="color: var(--text-light);">${item.name}</a></h3>
                                <div style="font-size: 12px; color: var(--text-muted); display: flex; gap: 12px; margin-top: 4px;">
                                    <span>SKU: ${item.sku}</span>
                                    <span>Price: ₹${item.activePrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div style="width: 150px; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                            <div class="qty-spinner">
                                <button type="button" class="btn-minus">−</button>
                                <input type="number" value="${item.quantity}" min="1" max="${item.stock}" readonly>
                                <button type="button" class="btn-plus">+</button>
                            </div>
                            ${item.stock <= 3 ? `<span style="font-size: 10px; color: var(--accent-gold); font-weight: 600;">Only ${item.stock} left</span>` : ''}
                        </div>
                        <div style="width: 120px; text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                            <span class="cart-item-price">₹${item.total.toFixed(2)}</span>
                            <button type="button" class="cart-item-action btn-remove-cart" data-product-id="${item.id}" style="background: none; border: none; font-size: 13px; font-weight: 500; font-family: inherit;">
                                🗑️ Remove
                            </button>
                        </div>
                    </div>
                `;
            });

            initQuantitySpinners();
            initRemoveCartTriggers();

        } else {
            wrapper.innerHTML = `
                <div style="background-color: var(--bg-surface); border: 1px dashed var(--border-light); border-radius: var(--radius-lg); padding: 100px 40px; text-align: center;">
                    <span style="font-size: 64px;">🛒</span>
                    <h2 style="font-family: 'Outfit', sans-serif; font-size: 24px; margin-top: 24px; margin-bottom: 10px;">Your Shopping Cart is Empty</h2>
                    <p style="color: var(--text-muted); font-size: 14px; max-width: 420px; margin: 0 auto 30px auto;">It looks like you haven't added any tractor or rotavator replacement parts to your cart yet.</p>
                    <a href="/shop.html" class="btn-accent" style="display: inline-block; padding: 12px 36px;">Browse Spare Parts Catalog</a>
                </div>
            `;
        }

    } catch (err) {
        console.error('Failed to render cart page:', err);
    }
}

// Cart Item removal
function initRemoveCartTriggers() {
    const removeButtons = document.querySelectorAll('.btn-remove-cart');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            const productId = btn.getAttribute('data-product-id');
            try {
                const res = await fetch('/api/cart/remove', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(data.message, 'success');
                    renderCartPage(); // Re-render
                    
                    // Sync badge count
                    currentSession.cartCount = data.cartCount;
                    syncNavbarUI();
                }
            } catch (err) {
                showToast('Failed to remove item.', 'error');
            }
        });
    });
}

// =========================================================================
// 6. CHECKOUT PAGE RENDERER
// =========================================================================
async function renderCheckoutPage() {
    // Check auth first
    try {
        const checkRes = await fetch('/api/auth/me');
        const checkData = await checkRes.json();
        if (!checkData.success || !checkData.user) {
            window.location.href = '/login.html?redirectTo=/checkout.html';
            return;
        }
    } catch (e) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const res = await fetch('/api/checkout');
        if (res.status === 400) {
            window.location.href = '/cart.html';
            return;
        }
        const data = await res.json();
        if (!data.success) return;

        // A. Render Saved Addresses
        const addressGrid = document.getElementById('checkout-address-grid');
        const selectedAddressIdInput = document.getElementById('selected_address_id');
        const newAddressForm = document.getElementById('checkout-new-address-form');

        if (addressGrid) {
            addressGrid.innerHTML = '';
            if (data.addresses && data.addresses.length > 0) {
                // Pre-fill hidden input with first address
                if (selectedAddressIdInput) selectedAddressIdInput.value = data.addresses[0].id;
                
                // Loop saved addresses
                data.addresses.forEach((addr, idx) => {
                    addressGrid.innerHTML += `
                        <div class="address-card ${idx === 0 ? 'selected' : ''}" data-address-id="${addr.id}">
                            <div class="address-name">${addr.recipient_name}</div>
                            <div class="address-text">
                                ${addr.address_line}<br>
                                ${addr.city}, ${addr.state} - ${addr.pincode}<br>
                                📞 ${addr.phone}
                            </div>
                            ${addr.is_default ? `<span class="status-badge delivered" style="font-size: 9px; padding: 2px 6px;">Default</span>` : ''}
                        </div>
                    `;
                });
                
                // Add "Use New Address" card trigger
                addressGrid.innerHTML += `
                    <div class="address-card" data-address-id="new" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border-style: dashed; background: transparent;">
                        <span style="font-size: 24px; color: var(--accent-gold); margin-bottom: 6px;">➕</span>
                        <div class="address-name" style="color: var(--accent-gold);">Use a New Address</div>
                        <div class="address-text" style="font-size: 11px;">Fill out the shipping details below</div>
                    </div>
                `;
            } else {
                // No saved addresses: set selector input to empty and make new form visible and required
                if (selectedAddressIdInput) selectedAddressIdInput.value = '';
                if (newAddressForm) {
                    newAddressForm.style.display = 'grid';
                    toggleRequiredFields(newAddressForm, true);
                }
            }
            
            initAddressSelector();
        }

        // B. Render Invoice Summary
        const invoiceItems = document.getElementById('checkout-invoice-items');
        if (invoiceItems) {
            invoiceItems.innerHTML = '';
            data.cartItems.forEach(item => {
                invoiceItems.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; font-size: 13px;">
                        <div style="flex-grow: 1;">
                            <span style="font-weight: 600; color: var(--text-light);">${item.name}</span>
                            <div style="font-size: 11px; color: var(--text-muted);">${item.brand} &bull; Qty: ${item.quantity}</div>
                        </div>
                        <span style="font-weight: 600; font-family: 'Outfit', sans-serif;">₹${item.total.toFixed(2)}</span>
                    </div>
                `;
            });
        }

        const invoiceSubtotal = document.getElementById('checkout-subtotal');
        if (invoiceSubtotal) invoiceSubtotal.textContent = `₹${data.subtotal.toFixed(2)}`;

        const invoicePlatformFee = document.getElementById('checkout-platform-fee');
        if (invoicePlatformFee) {
            if (data.platformFee > 0) {
                invoicePlatformFee.textContent = `₹${data.platformFee.toFixed(2)}`;
                invoicePlatformFee.style.color = 'var(--text-light)';
            } else {
                invoicePlatformFee.textContent = 'Free';
                invoicePlatformFee.style.color = 'var(--accent-gold)';
            }
        }

        const invoiceGrandTotal = document.getElementById('checkout-grand-total');
        if (invoiceGrandTotal) invoiceGrandTotal.textContent = `₹${data.total.toFixed(2)}`;

        // C. Initialize Location Pinning
        initGeolocation();

        // D. Bind Submit order action
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = checkoutForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Processing Order...';

                // Read form inputs
                const formData = {
                    selected_address_id: document.getElementById('selected_address_id').value,
                    recipient_name: document.getElementById('recipient_name') ? document.getElementById('recipient_name').value : '',
                    phone: document.getElementById('phone') ? document.getElementById('phone').value : '',
                    address_line: document.getElementById('address_line') ? document.getElementById('address_line').value : '',
                    city: document.getElementById('city') ? document.getElementById('city').value : '',
                    state: document.getElementById('state') ? document.getElementById('state').value : '',
                    pincode: document.getElementById('pincode') ? document.getElementById('pincode').value : '',
                    latitude: document.getElementById('latitude').value,
                    longitude: document.getElementById('longitude').value,
                    save_address: document.getElementById('save_address') && document.getElementById('save_address').checked ? 'on' : ''
                };

                try {
                    const placeRes = await fetch('/api/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    const placeData = await placeRes.json();
                    if (placeData.success) {
                        // Order Placed successfully, redirect to success.html
                        window.location.href = '/success.html';
                    } else {
                        showToast(placeData.message || 'Order placement failed.', 'error');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Place COD Order ➔';
                    }
                } catch (err) {
                    showToast('Connection error. Please try again.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Place COD Order ➔';
                }
            });
        }

    } catch (err) {
        console.error('Checkout initialization failed:', err);
    }
}

// =========================================================================
// 7. SUCCESS RECEIPT PAGE RENDERER
// =========================================================================
async function renderSuccessPage() {
    try {
        const res = await fetch('/api/orders/last-success');
        const data = await res.json();
        if (!data.success) {
            window.location.href = '/index.html';
            return;
        }

        const order = data.order;

        // Render invoice summaries
        const successOrderId = document.getElementById('success-order-id');
        if (successOrderId) successOrderId.textContent = `#${order.id}`;

        const successGrandTotal = document.getElementById('success-grand-total');
        if (successGrandTotal) successGrandTotal.textContent = `₹${order.total.toFixed(2)}`;

        // Configure WhatsApp button
        const waBtn = document.getElementById('success-wa-btn');
        if (waBtn) waBtn.href = order.waLink;

        // Start countdown redirection
        let seconds = 3;
        const countdownNumber = document.getElementById('success-countdown-number');
        const countdownWrapper = document.getElementById('success-countdown-wrapper');

        const timer = setInterval(() => {
            seconds--;
            if (countdownNumber) countdownNumber.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(timer);
                if (countdownWrapper) {
                    countdownWrapper.innerHTML = "Opening WhatsApp now. If it didn't open, please click the button above.";
                }
                // Open WhatsApp Web/App
                window.location.href = order.waLink;
            }
        }, 1000);

        // Sync badge
        currentSession.cartCount = 0;
        syncNavbarUI();

    } catch (err) {
        console.error('Success page rendering failed:', err);
        window.location.href = '/index.html';
    }
}

// =========================================================================
// 8. ORDERS HISTORY PAGE RENDERER
// =========================================================================
async function renderOrdersPage() {
    try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (!data.success) return;

        // Render bio in sidebar
        const user = currentSession.user;
        const sidebarBio = document.getElementById('orders-sidebar-bio');
        if (sidebarBio && user) {
            sidebarBio.innerHTML = `
                <div class="profile-user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 18px; margin-bottom: 4px;">${user.name}</h3>
                <p style="color: var(--text-muted); font-size: 13px;">${user.email}</p>
            `;
        }

        const tableBody = document.getElementById('orders-table-body');
        const emptyState = document.getElementById('orders-empty-state');

        if (data.orders.length > 0) {
            if (emptyState) emptyState.style.display = 'none';
            if (tableBody) {
                tableBody.innerHTML = '';
                data.orders.forEach(order => {
                    const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'});
                    tableBody.innerHTML += `
                        <tr>
                            <td style="font-weight: 700;">#${order.id}</td>
                            <td style="font-size: 13px;">${dateStr}</td>
                            <td style="font-size: 13px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${order.recipient_name}</td>
                            <td style="font-weight: 600; font-family: 'Outfit', sans-serif;">₹${order.total_amount.toFixed(2)}</td>
                            <td>
                                <span class="status-badge ${order.status.toLowerCase()}">
                                    ${order.status}
                                </span>
                            </td>
                            <td>
                                <a href="/order-details.html?id=${order.id}" class="admin-btn admin-btn-secondary" style="padding: 6px 12px; font-size: 12px; border-radius: var(--radius-sm);">
                                    Details
                                </a>
                            </td>
                        </tr>
                    `;
                });
            }
        } else {
            if (tableBody) tableBody.closest('table').style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        }

    } catch (err) {
        console.error('Failed to load orders history:', err);
    }
}

// =========================================================================
// 9. ORDER DETAILS PAGE RENDERER (With Front-End WhatsApp Resend)
// =========================================================================
async function renderOrderDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        window.location.href = '/orders.html';
        return;
    }

    try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        const data = await res.json();
        if (!data.success) return;

        const order = data.order;
        const items = data.items;

        // Render sidebar bio
        const user = currentSession.user;
        const sidebarBio = document.getElementById('order-detail-sidebar-bio');
        if (sidebarBio && user) {
            sidebarBio.innerHTML = `
                <div class="profile-user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 18px; margin-bottom: 4px;">${user.name}</h3>
                <p style="color: var(--text-muted); font-size: 13px;">${user.email}</p>
            `;
        }

        // Render meta title
        const detailTitle = document.getElementById('order-detail-title');
        if (detailTitle) detailTitle.textContent = `Order #${order.id}`;

        const detailDate = document.getElementById('order-detail-date');
        if (detailDate) {
            detailDate.textContent = 'Placed on ' + new Date(order.created_at).toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        }

        const detailStatusBadge = document.getElementById('order-detail-status-badge');
        if (detailStatusBadge) {
            detailStatusBadge.textContent = order.status;
            detailStatusBadge.className = `status-badge ${order.status.toLowerCase()}`;
        }

        // Render Shipping details
        const shipName = document.getElementById('order-ship-name');
        if (shipName) shipName.textContent = order.recipient_name;

        const shipAddress = document.getElementById('order-ship-address');
        if (shipAddress) shipAddress.textContent = order.shipping_address;

        const shipPhone = document.getElementById('order-ship-phone');
        if (shipPhone) shipPhone.textContent = `Phone: ${order.phone}`;

        // Render Geolocation Map
        const geoBox = document.getElementById('order-geo-box');
        if (geoBox) {
            if (order.latitude && order.longitude) {
                geoBox.innerHTML = `
                    <div style="color: #4caf50; font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 10px;">
                        <span>📍</span> GPS coordinates Pinned Successfully
                    </div>
                    <a href="https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}" 
                       class="admin-btn admin-btn-secondary" 
                       target="_blank" 
                       style="align-self: flex-start; font-size: 13px; padding: 8px 16px; border-color: var(--accent-gold); color: var(--accent-gold);">
                        🗺️ View on Google Maps
                    </a>
                `;
            } else {
                geoBox.innerHTML = `<div style="color: var(--text-muted); font-style: italic;">No farm GPS coordinates pinned for this order.</div>`;
            }
        }

        // Render Item rows
        const itemsTableBody = document.getElementById('order-items-table-body');
        if (itemsTableBody) {
            itemsTableBody.innerHTML = '';
            items.forEach(item => {
                itemsTableBody.innerHTML += `
                    <tr class="item-invoice-row" data-name="${item.name}" data-brand="${item.brand}" data-qty="${item.quantity}" data-price="${item.price}">
                        <td style="display: flex; align-items: center; gap: 14px; padding: 12px 0;">
                            <img src="${item.main_image.replace('.png', '.svg')}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                            <div>
                                <a href="/product.html?slug=${item.slug}" style="font-weight: 600; font-size: 14px;">${item.name}</a>
                                <div style="font-size: 11px; color: var(--accent-gold); font-weight: 700; text-transform: uppercase;">${item.brand}</div>
                            </div>
                        </td>
                        <td style="text-align: center; font-size: 13px; color: var(--text-muted);">${item.sku}</td>
                        <td style="text-align: center; font-family: 'Outfit', sans-serif;">₹${item.price.toFixed(2)}</td>
                        <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
                        <td style="text-align: right; font-weight: 700; font-family: 'Outfit', sans-serif; padding: 12px 0;">₹${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `;
            });
        }

        // Render Summary Pricing
        const feeText = document.getElementById('order-platform-fee-text');
        if (feeText) {
            if (order.platform_fee > 0) {
                feeText.textContent = `₹${order.platform_fee.toFixed(2)}`;
                feeText.style.color = 'var(--text-light)';
            } else {
                feeText.textContent = 'Free';
                feeText.style.color = 'var(--accent-gold)';
            }
        }

        const grandText = document.getElementById('order-grand-total-text');
        if (grandText) grandText.textContent = `₹${order.total_amount.toFixed(2)}`;

        // Bind Resend WhatsApp receiver click
        const resendBtn = document.getElementById('btn-resend-whatsapp');
        if (resendBtn) {
            resendBtn.addEventListener('click', function() {
                // Compile receipt text dynamically
                let waMessage = `🚜 *SK All Agriculture Parts Order #${order.id}* 🚜\n\n`;
                
                const rows = document.querySelectorAll('.item-invoice-row');
                rows.forEach(row => {
                    const name = row.getAttribute('data-name');
                    const brand = row.getAttribute('data-brand');
                    const qty = row.getAttribute('data-qty');
                    const price = parseFloat(row.getAttribute('data-price'));
                    waMessage += `* ${name} (${brand}) x${qty} = ₹${(price * qty).toFixed(2)}\n`;
                });
                
                waMessage += `-----------------------------------------\n`;
                waMessage += `platform fee: ${order.platform_fee > 0 ? `₹${order.platform_fee.toFixed(2)}` : 'Free'}\n\n`;
                waMessage += `💰 *Total: ₹${order.total_amount.toFixed(2)}*\n`;
                waMessage += `👤 *Name:* ${order.recipient_name}\n`;
                waMessage += `📞 *Phone:* ${order.phone}\n`;
                waMessage += `🏠 *Address:* ${order.shipping_address}\n`;

                if (order.latitude && order.longitude) {
                    waMessage += `📍 *Location:* https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}\n`;
                }

                const encodedMsg = encodeURIComponent(waMessage);
                const adminNumber = "9026754812";
                window.open(`https://api.whatsapp.com/send?phone=91${adminNumber}&text=${encodedMsg}`, '_blank');
            });
        }

    } catch (err) {
        console.error('Failed to load order detail sheet:', err);
    }
}

// =========================================================================
// 10. PROFILE PAGE RENDERER
// =========================================================================
async function renderProfilePage() {
    try {
        const res = await fetch('/api/profile');
        if (res.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        const data = await res.json();
        if (!data.success) return;

        const user = data.user;

        // A. Render Bio in Sidebar & forms
        const sidebarBio = document.getElementById('profile-sidebar-bio');
        if (sidebarBio) {
            sidebarBio.innerHTML = `
                <div class="profile-user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 18px; margin-bottom: 4px;">${user.name}</h3>
                <p style="color: var(--text-muted); font-size: 13px;">${user.email}</p>
            `;
        }

        const profName = document.getElementById('profile-name-text');
        if (profName) profName.textContent = user.name;

        const profPhone = document.getElementById('profile-phone-text');
        if (profPhone) profPhone.textContent = user.phone;

        const profEmail = document.getElementById('profile-email-text');
        if (profEmail) profEmail.textContent = user.email;

        // B. Render Addresses List
        renderProfileAddresses(data.addresses);

        // C. Bind Add Address Form
        const addAddrForm = document.getElementById('profile-add-address-form');
        if (addAddrForm) {
            // Remove previous listeners if double loaded
            const newForm = addAddrForm.cloneNode(true);
            addAddrForm.parentNode.replaceChild(newForm, addAddrForm);
            
            newForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = {
                    recipient_name: document.getElementById('recipient_name').value,
                    phone: document.getElementById('phone').value,
                    address_line: document.getElementById('address_line').value,
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value,
                    pincode: document.getElementById('pincode').value
                };

                try {
                    const saveRes = await fetch('/api/profile/address/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
                    const saveData = await saveRes.json();
                    if (saveData.success) {
                        showToast(saveData.message, 'success');
                        newForm.reset();
                        
                        // Re-fetch profiles to update addresses grid
                        const refreshRes = await fetch('/api/profile');
                        const refreshData = await refreshRes.json();
                        if (refreshData.success) {
                            renderProfileAddresses(refreshData.addresses);
                        }
                    } else {
                        showToast(saveData.message || 'Failed to save address.', 'error');
                    }
                } catch (err) {
                    showToast('Connection error.', 'error');
                }
            });
        }

    } catch (err) {
        console.error('Failed to load customer profile details:', err);
    }
}

// Render Address book lists in Profile Page
function renderProfileAddresses(addresses) {
    const addressGrid = document.getElementById('profile-address-grid');
    if (!addressGrid) return;

    addressGrid.innerHTML = '';
    if (addresses && addresses.length > 0) {
        addresses.forEach(addr => {
            addressGrid.innerHTML += `
                <div class="address-card" style="cursor: default;">
                    <div class="address-name">${addr.recipient_name}</div>
                    <div class="address-text">
                        ${addr.address_line}<br>
                        ${addr.city}, ${addr.state} - ${addr.pincode}<br>
                        📞 ${addr.phone}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px;">
                        ${addr.is_default ? `<span class="status-badge delivered" style="font-size: 9px; padding: 2px 6px;">Default Address</span>` : '<span></span>'}
                        <button type="button" class="btn-delete-address" data-address-id="${addr.id}" style="background: none; border: none; color: #e53935; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        });

        // Bind delete address buttons
        const delButtons = document.querySelectorAll('.btn-delete-address');
        delButtons.forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = btn.getAttribute('data-address-id');
                const conf = confirm('Delete this address?');
                if (!conf) return;

                try {
                    const delRes = await fetch(`/api/profile/address/delete/${id}`, { method: 'POST' });
                    const delData = await delRes.json();
                    if (delData.success) {
                        showToast(delData.message, 'success');
                        
                        // Re-fetch
                        const refRes = await fetch('/api/profile');
                        const refData = await refRes.json();
                        if (refData.success) {
                            renderProfileAddresses(refData.addresses);
                        }
                    }
                } catch (err) {
                    showToast('Failed to delete address.', 'error');
                }
            });
        });

    } else {
        addressGrid.innerHTML = `<p style="color: var(--text-muted); font-size: 14px; grid-column: span 2; font-style: italic;">No addresses saved in your profile yet. Add a new address below.</p>`;
    }
}

// =========================================================================
// 11. LOGIN & REGISTER FORM INITIALIZERS
// =========================================================================
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';
    const redirectTo = urlParams.get('redirectTo') || '';

    // Adjust forms presentation dynamically for Admin vs Customer
    const authTypeTitle = document.getElementById('auth-type-title');
    const authTypeDesc = document.getElementById('auth-type-desc');
    const usernameContainer = document.getElementById('username-input-container');
    const emailContainer = document.getElementById('email-input-container');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const pathLinks = document.getElementById('auth-pathway-links');

    if (isAdmin) {
        if (authTypeTitle) authTypeTitle.textContent = 'Admin Control Center';
        if (authTypeDesc) authTypeDesc.textContent = 'Sign in to manage spare parts, inventory, and orders.';
        if (usernameContainer) usernameContainer.style.display = 'flex';
        if (emailContainer) emailContainer.style.display = 'none';
        
        // Remove required constraints from hidden fields
        if (usernameContainer) usernameContainer.querySelector('input').setAttribute('required', 'required');
        if (emailContainer) emailContainer.querySelector('input').removeAttribute('required');
        
        if (submitBtn) submitBtn.innerHTML = 'Secure Admin Login 🔑';
        if (pathLinks) {
            pathLinks.innerHTML = `
                <a href="/login.html" style="color: var(--accent-gold); font-weight: 500;">← Return to Customer Storefront Login</a>
                <div style="margin-top: 8px;"><a href="/index.html" style="font-size: 12px; color: var(--text-muted);">← Back to Homepage</a></div>
            `;
        }
    } else {
        if (authTypeTitle) authTypeTitle.textContent = 'Customer Sign In';
        if (authTypeDesc) authTypeDesc.textContent = 'Sign in to browse our catalog, manage cart, and place orders.';
        if (usernameContainer) usernameContainer.style.display = 'none';
        if (emailContainer) emailContainer.style.display = 'flex';
        
        if (usernameContainer) usernameContainer.querySelector('input').removeAttribute('required');
        if (emailContainer) emailContainer.querySelector('input').setAttribute('required', 'required');
        
        if (submitBtn) submitBtn.innerHTML = 'Sign In ➔';
    }

    // Submit form
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const targetUrl = isAdmin ? '/api/auth/admin/login' : '/api/auth/login';
        const bodyData = isAdmin 
            ? { username: document.getElementById('username').value, password: document.getElementById('password').value }
            : { email: document.getElementById('email').value, password: document.getElementById('password').value };

        try {
            const res = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
            const data = await res.json();
            
            if (data.success) {
                showToast(data.message, 'success');
                setTimeout(() => {
                    if (isAdmin) {
                        window.location.href = '/admin/dashboard.html';
                    } else {
                        window.location.href = redirectTo || '/index.html';
                    }
                }, 1000);
            } else {
                showToast(data.message || 'Login failed.', 'error');
            }
        } catch (err) {
            showToast('Connection error. Try again.', 'error');
        }
    });
}

function initRegisterForm() {
    const regForm = document.getElementById('register-form');
    
    regForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (data.success) {
                showToast(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/login.html?success=' + encodeURIComponent('Registration successful! Please login.');
                }, 1500);
            } else {
                showToast(data.message || 'Registration failed.', 'error');
            }
        } catch (err) {
            showToast('Connection error. Try again.', 'error');
        }
    });
}

// =========================================================================
// 12. FRONTEND AUXILIARY UTILITIES & GEOLOCATION
// =========================================================================

// AJAX cart addition listener
function initAjaxAddToCart() {
    const forms = document.querySelectorAll('.ajax-add-to-cart-form');
    forms.forEach(form => {
        // Clear previous listeners by replacing node
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = newForm.querySelector('button[type="submit"]');
            const originalHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Adding...';

            const productId = newForm.querySelector('input[name="productId"]').value;
            const qtyInput = newForm.querySelector('input[name="quantity"]');
            const quantity = qtyInput ? qtyInput.value : 1;

            try {
                const res = await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, quantity })
                });
                const data = await res.json();
                if (data.success) {
                    currentSession.cartCount = data.cartCount;
                    syncNavbarUI();
                    showToast(data.message, 'success');
                } else {
                    showToast(data.message || 'Failed to add item.', 'error');
                }
            } catch (err) {
                showToast('Connection error.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHtml;
            }
        });
    });
}

// Quantity Spinner initializations
function initQuantitySpinners() {
    const spinners = document.querySelectorAll('.qty-spinner');
    
    spinners.forEach(spinner => {
        const input = spinner.querySelector('input');
        const minus = spinner.querySelector('.btn-minus');
        const plus = spinner.querySelector('.btn-plus');
        const isCartPage = spinner.closest('.cart-item-row') !== null;
        
        if (!input || !minus || !plus) return;
        
        // Remove previous listeners
        const newMinus = minus.cloneNode(true);
        const newPlus = plus.cloneNode(true);
        minus.parentNode.replaceChild(newMinus, minus);
        plus.parentNode.replaceChild(newPlus, plus);
        
        newMinus.addEventListener('click', function() {
            let val = parseInt(input.value) || 1;
            if (val > 1) {
                input.value = val - 1;
                triggerDecoupledQuantityChange(input, isCartPage);
            }
        });
        
        newPlus.addEventListener('click', function() {
            let val = parseInt(input.value) || 1;
            const max = parseInt(input.getAttribute('max')) || 999;
            if (val < max) {
                input.value = val + 1;
                triggerDecoupledQuantityChange(input, isCartPage);
            }
        });

        input.addEventListener('change', function() {
            let val = parseInt(input.value) || 1;
            const max = parseInt(input.getAttribute('max')) || 999;
            if (val < 1) input.value = 1;
            if (val > max) input.value = max;
            triggerDecoupledQuantityChange(input, isCartPage);
        });
    });
}

// Cart quantity change updater
async function triggerDecoupledQuantityChange(input, isCartPage) {
    if (!isCartPage) return;
    
    const row = input.closest('.cart-item-row');
    const productId = row.getAttribute('data-product-id');
    const quantity = input.value;
    
    try {
        const res = await fetch('/api/cart/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity })
        });
        const data = await res.json();
        if (data.success) {
            renderCartPage(); // Refresh totals
        } else {
            showToast(data.message || 'Failed to update stock count.', 'error');
            renderCartPage();
        }
    } catch (err) {
        showToast('Connection error.', 'error');
    }
}

// Checkout address selectors
function initAddressSelector() {
    const cards = document.querySelectorAll('.checkout-address-selector .address-card');
    const input = document.getElementById('selected_address_id');
    const newForm = document.getElementById('checkout-new-address-form');

    if (!input) return;

    cards.forEach(card => {
        card.addEventListener('click', function() {
            cards.forEach(c => c.classList.remove('selected'));
            const id = card.getAttribute('data-address-id');
            
            if (id === 'new') {
                card.classList.add('selected');
                input.value = '';
                if (newForm) {
                    newForm.style.display = 'grid';
                    toggleRequiredFields(newForm, true);
                }
            } else {
                card.classList.add('selected');
                input.value = id;
                if (newForm) {
                    newForm.style.display = 'none';
                    toggleRequiredFields(newForm, false);
                }
            }
        });
    });
}

function toggleRequiredFields(form, isRequired) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (isRequired) {
            input.setAttribute('required', 'required');
        } else {
            input.removeAttribute('required');
        }
    });
}

// Geolocation Pinning
function initGeolocation() {
    const pinBtn = document.getElementById('btn-pin-location');
    const statusText = document.getElementById('geo-status-text');
    const latInput = document.getElementById('latitude');
    const lngInput = document.getElementById('longitude');

    if (!pinBtn) return;

    pinBtn.addEventListener('click', function() {
        if (statusText) {
            statusText.textContent = 'Acquiring coordinates...';
            statusText.className = 'geo-status-text warning';
        }

        if (!navigator.geolocation) {
            if (statusText) {
                statusText.textContent = 'Geolocation not supported by browser.';
                statusText.className = 'geo-status-text error';
            }
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                if (latInput) latInput.value = lat;
                if (lngInput) lngInput.value = lng;

                if (statusText) {
                    statusText.textContent = `📍 farm location pinned (lat: ${lat.toFixed(4)}, lng: ${lng.toFixed(4)})`;
                    statusText.className = 'geo-status-text success';
                }
                
                pinBtn.innerHTML = '✓ location Pinned';
                pinBtn.style.background = 'rgba(76, 175, 80, 0.1)';
                pinBtn.style.borderColor = '#4caf50';
                pinBtn.style.color = '#4caf50';
            },
            (error) => {
                console.warn('Geolocation error:', error);
                let msg = 'Could not retrieve coordinates. Fill address details manually.';
                if (error.code === error.PERMISSION_DENIED) {
                    msg = 'Permission denied. Please allow location access to pin farm.';
                }
                if (statusText) {
                    statusText.textContent = msg;
                    statusText.className = 'geo-status-text error';
                }
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    });
}

// Global Toast notification injector
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
    toast.style.margin = '0';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    toast.style.animation = 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    toast.style.minWidth = '280px';
    
    toast.innerHTML = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// Binds the homepage technical inquiry form to save inquiries in the database
function initInquiryForm() {
    const form = document.querySelector('.inquiry-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const bodyData = {
            name: document.getElementById('iq_name').value,
            phone: document.getElementById('iq_phone').value,
            machine: document.getElementById('iq_machine').value,
            message: document.getElementById('iq_msg').value
        };

        try {
            const res = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message, 'success');
                form.reset();
            } else {
                showToast(data.message || 'Submission failed.', 'error');
            }
        } catch (err) {
            showToast('Connection error. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Initializes storefront dark/light theme toggle
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (!toggleBtn) return;

    // Set initial emoji based on active theme
    const isLight = document.body.classList.contains('light-theme');
    toggleBtn.textContent = isLight ? '🌙' : '☀️';

    toggleBtn.addEventListener('click', function() {
        const currentlyLight = document.body.classList.toggle('light-theme');
        toggleBtn.textContent = currentlyLight ? '🌙' : '☀️';
        localStorage.setItem('theme', currentlyLight ? 'light' : 'dark');
    });
}

// =========================================================================
// 12. HERO BANNER CAROUSEL SLIDER
// =========================================================================
async function initHeroSlider() {
    const slidesContainer = document.getElementById('hero-slides-container');
    const prevBtn = document.getElementById('hero-slider-prev');
    const nextBtn = document.getElementById('hero-slider-next');
    const dotsContainer = document.getElementById('hero-slider-dots');
    
    if (!slidesContainer) return;

    try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        
        if (data.success && data.banners && data.banners.length > 0) {
            // Render slides
            slidesContainer.innerHTML = '';
            
            // Empty dots
            if (dotsContainer) dotsContainer.innerHTML = '';
            
            data.banners.forEach((banner, index) => {
                const isActive = index === 0 ? 'active' : '';
                const linkUrl = banner.link_url || '/shop.html';
                
                // Construct slide HTML
                slidesContainer.innerHTML += `
                    <div class="hero-slide ${isActive}">
                        <div class="container">
                            <div class="hero-layout">
                                <div class="hero-content">
                                    <span class="hero-tag">🌾 Professional Agricultural Equipment</span>
                                    <h1 class="hero-title">${banner.title}</h1>
                                    <p class="hero-desc">${banner.subtitle || ''}</p>
                                    
                                    <div class="hero-actions">
                                        <a href="${linkUrl}" class="btn-accent">Explore Spare Parts</a>
                                        <a href="#categories-section" class="btn-login" style="padding: 12px 28px;">Browse Categories</a>
                                    </div>

                                    <div class="hero-badge-grid">
                                        <div class="hero-badge-item">
                                            <h3>100%</h3>
                                            <p>Forged Steel</p>
                                        </div>
                                        <div class="hero-badge-item">
                                            <h3>Free</h3>
                                            <p>Platform Fee</p>
                                        </div>
                                        <div class="hero-badge-item">
                                            <h3>COD</h3>
                                            <p>Cash on Delivery</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="hero-image-container">
                                    <div class="hero-image-glow"></div>
                                    <img src="${banner.image_url.replace('.png', '.svg')}" alt="${banner.title}" class="hero-image">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Construct dot HTML
                if (dotsContainer) {
                    const activeDot = index === 0 ? 'active' : '';
                    dotsContainer.innerHTML += `<span class="dot ${activeDot}" data-slide="${index}"></span>`;
                }
            });

            // If there are multiple banners, show controls and start carousel
            if (data.banners.length > 1) {
                if (prevBtn) prevBtn.style.display = 'flex';
                if (nextBtn) nextBtn.style.display = 'flex';
                if (dotsContainer) dotsContainer.style.display = 'flex';
                
                setupSliderCarousel(data.banners.length);
            }
        }
    } catch (err) {
        console.error('Failed to initialize hero slider:', err);
    }
}

function setupSliderCarousel(slideCount) {
    const container = document.getElementById('hero-slides-container');
    const prevBtn = document.getElementById('hero-slider-prev');
    const nextBtn = document.getElementById('hero-slider-next');
    const dots = document.querySelectorAll('#hero-slider-dots .dot');
    
    let currentIndex = 0;
    let timer = null;

    function goToSlide(index) {
        if (index < 0) {
            currentIndex = slideCount - 1;
        } else if (index >= slideCount) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        // Apply slide animation
        if (container) {
            container.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        // Update active classes on slides
        const slides = document.querySelectorAll('.hero-slide');
        slides.forEach((slide, idx) => {
            if (idx === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Update active dots
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        resetTimer();
    }

    function resetTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000); // Auto slide every 5 seconds
    }

    // Prev/Next Click listeners
    if (prevBtn) {
        const newPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        newPrev.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
        });
    }

    if (nextBtn) {
        const newNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        newNext.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
        });
    }

    // Dots click listeners
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-slide'));
            goToSlide(index);
        });
    });

    // Start auto slide
    resetTimer();
}

// Binds event triggers for the responsive mobile shop filters drawer
function initShopFilterDrawer() {
    const filterBtn = document.getElementById('mobile-filter-btn');
    const sidebar = document.querySelector('.shop-sidebar');
    const overlay = document.getElementById('filter-drawer-overlay');
    const closeBtn = document.getElementById('close-filter-drawer');

    if (filterBtn && sidebar && overlay) {
        const openDrawer = function() {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeDrawer = function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        // Clone buttons to clear old event listeners if double loaded
        const newFilterBtn = filterBtn.cloneNode(true);
        filterBtn.parentNode.replaceChild(newFilterBtn, filterBtn);

        const newOverlay = overlay.cloneNode(true);
        overlay.parentNode.replaceChild(newOverlay, overlay);

        newFilterBtn.addEventListener('click', openDrawer);
        newOverlay.addEventListener('click', closeDrawer);

        if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            newCloseBtn.addEventListener('click', closeDrawer);
        }

        // Close drawer when clicking filter links
        const filterLinks = sidebar.querySelectorAll('a');
        filterLinks.forEach(link => {
            link.addEventListener('click', closeDrawer);
        });
    }
}

