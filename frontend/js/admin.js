// Theme check (Immediately invoked to prevent screen flashing)
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
})();

// SK All Agriculture Parts Decoupled Client Admin Control Engine

document.addEventListener('DOMContentLoaded', async function() {
    // 1. Check Administrative Authentication and load layouts
    await loadAdminComponents();
    
    // 2. Route to Active Panel Handler
    const wrapper = document.getElementById('admin-wrapper');
    if (!wrapper) return;
    
    const activePage = wrapper.getAttribute('data-active-page');
    
    if (activePage === 'dashboard') {
        renderAdminDashboard();
    } else if (activePage === 'products') {
        renderAdminProductsList();
    } else if (activePage === 'add-product') {
        initAdminAddProductPage();
    } else if (activePage === 'edit-product') {
        initAdminEditProductPage();
    } else if (activePage === 'categories') {
        renderAdminCategoriesPage();
    } else if (activePage === 'orders') {
        renderAdminOrdersPage();
    } else if (activePage === 'order-details') {
        renderAdminOrderDetailPage();
    } else if (activePage === 'users') {
        renderAdminUsersPage();
    } else if (activePage === 'inventory') {
        renderAdminInventoryPage();
    } else if (activePage === 'settings') {
        renderAdminSettingsPage();
    } else if (activePage === 'inquiries') {
        renderAdminInquiriesPage();
    } else if (activePage === 'banners') {
        renderAdminBannersPage();
    }
});

let adminSession = { name: 'Admin', username: 'admin' };

// =========================================================================
// 1. LAYOUT COMPONENT LOADERS & AUTH GUARD
// =========================================================================
async function loadAdminComponents() {
    const wrapper = document.getElementById('admin-wrapper');
    if (!wrapper) return;

    // A. Fetch session to verify Admin is logged in
    try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!data.success || !data.admin) {
            // Redirect to admin login
            window.location.href = '/login.html?admin=true';
            return;
        }
        
        adminSession = data.admin;
    } catch (err) {
        console.error('Failed to verify administrative session:', err);
        window.location.href = '/login.html?admin=true';
        return;
    }

    // B. Load Sidebar
    const sidebarPlaceholder = document.getElementById('admin-sidebar-placeholder');
    if (sidebarPlaceholder) {
        try {
            sidebarPlaceholder.className = 'admin-sidebar';
            const res = await fetch('/components/admin-sidebar.html');
            sidebarPlaceholder.innerHTML = await res.text();
            
            // Highlight active sidebar listing
            const activePage = wrapper.getAttribute('data-active-page');
            const menuItem = document.getElementById(`menu-${activePage}`);
            if (menuItem) menuItem.classList.add('active');
            
            // Bind admin logout button
            const logoutBtn = document.getElementById('admin-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async function() {
                    const conf = confirm('Logout of Admin Panel?');
                    if (!conf) return;
                    try {
                        const logoutRes = await fetch('/api/auth/admin/logout', { method: 'POST' });
                        const logoutData = await logoutRes.json();
                        if (logoutData.success) {
                            window.location.href = '/login.html?admin=true&success=' + encodeURIComponent('Administrative logout successful.');
                        }
                    } catch (e) {
                        alert('Logout failed.');
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load admin sidebar:', e);
        }
    }

    // C. Load Header top bar
    const headerPlaceholder = document.getElementById('admin-header-placeholder');
    if (headerPlaceholder) {
        try {
            headerPlaceholder.className = 'admin-header';
            const res = await fetch('/components/admin-header.html');
            headerPlaceholder.innerHTML = await res.text();
            
            // Set dynamic titles
            const pageTitle = wrapper.getAttribute('data-title') || 'Admin Panel';
            const pageDesc = wrapper.getAttribute('data-desc') || 'Administrative console.';
            
            document.getElementById('admin-page-title').textContent = pageTitle;
            document.getElementById('admin-page-desc').textContent = pageDesc;
            document.getElementById('admin-profile-name').textContent = adminSession.name;

            // Bind Theme Toggle Event Listener
            initAdminThemeToggle();
        } catch (e) {
            console.error('Failed to load admin header:', e);
        }
    }

    // D. Initialize Mobile Sidebar Drawer Toggles (after both Sidebar & Header are loaded)
    initMobileAdminSidebar();
}

// Binds event triggers for the collapsible admin sidebar drawer on mobile viewports
function initMobileAdminSidebar() {
    const toggle = document.getElementById('admin-menu-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    const close = document.getElementById('admin-sidebar-close');

    if (!sidebar) return;

    // Dynamically create mobile sidebar overlay if not present
    let overlay = document.getElementById('admin-sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'admin-sidebar-overlay';
        overlay.className = 'admin-sidebar-overlay';
        document.body.appendChild(overlay);
    }

    if (toggle && overlay) {
        toggle.addEventListener('click', function() {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock background scrolling
        });

        const closeSidebar = function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore background scrolling
        };

        if (close) close.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);

        // Close sidebar on navigation clicks
        const menuLinks = sidebar.querySelectorAll('.admin-menu-item a');
        menuLinks.forEach(link => {
            link.addEventListener('click', closeSidebar);
        });
    }
}

// =========================================================================
// 2. DASHBOARD ANALYTICS RENDERER
// =========================================================================
async function renderAdminDashboard() {
    try {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        if (!data.success) return;

        // A. Populate widgets
        const widgets = data.analytics;
        document.getElementById('dash-revenue').textContent = `₹${widgets.totalSales.toFixed(2)}`;
        document.getElementById('dash-orders-count').textContent = widgets.totalOrders;
        document.getElementById('dash-pending-count').textContent = widgets.pendingOrders;
        document.getElementById('dash-outofstock-count').textContent = widgets.outOfStockCount;

        // B. Render recent orders
        const tableBody = document.getElementById('dash-recent-orders-body');
        if (tableBody) {
            tableBody.innerHTML = '';
            if (data.recentOrders.length > 0) {
                data.recentOrders.forEach(order => {
                    const mapBtn = order.latitude && order.longitude
                        ? `<a href="https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}" class="admin-btn admin-btn-secondary" target="_blank" style="padding: 6px 8px; font-size: 12px;" title="View Farm GPS Coordinates">📍 Map</a>`
                        : '';
                    
                    tableBody.innerHTML += `
                        <tr>
                            <td style="font-weight: 700; color: var(--accent);">#${order.id}</td>
                            <td style="font-weight: 600;">${order.user_name}</td>
                            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: var(--text-gray);">${order.shipping_address}</td>
                            <td style="font-weight: 700; font-family: 'Outfit', sans-serif;">₹${order.total_amount.toFixed(2)}</td>
                            <td>
                                <span class="status-badge ${order.status.toLowerCase()}" style="font-size: 11px; padding: 3px 8px;">
                                    ${order.status}
                                </span>
                            </td>
                            <td>
                                <div style="display: flex; gap: 8px;">
                                    <a href="/admin/order-details.html?id=${order.id}" class="admin-btn admin-btn-secondary" style="padding: 6px 12px; font-size: 12px;">Manage</a>
                                    ${mapBtn}
                                </div>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-gray); font-style: italic;">No orders placed yet.</td></tr>`;
            }
        }

    } catch (err) {
        console.error('Failed to render admin dashboard APIs:', err);
    }
}

// =========================================================================
// 3. PRODUCTS CATALOG CRUD
// =========================================================================
async function renderAdminProductsList() {
    try {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        if (!data.success) return;

        const tbody = document.getElementById('admin-products-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (data.products.length > 0) {
            data.products.forEach(prod => {
                const stockBadgeClass = prod.stock === 0 
                    ? 'stock-badge out-of-stock' 
                    : (prod.stock <= 5 ? 'stock-badge low-stock' : 'stock-badge in-stock');
                const stockText = prod.stock === 0 
                    ? 'Out of Stock' 
                    : (prod.stock <= 5 ? `Low Stock (${prod.stock})` : `In Stock (${prod.stock})`);
                
                const priceHtml = prod.discount_price !== null
                    ? `<div style="font-weight: 700;">₹${prod.discount_price}</div><div style="font-size: 11px; text-decoration: line-through; color: var(--text-gray);">₹${prod.price}</div>`
                    : `<div style="font-weight: 700;">₹${prod.price}</div>`;

                tbody.innerHTML += `
                    <tr>
                        <td style="display: flex; align-items: center; gap: 14px;">
                            <img src="${prod.main_image.replace('.png', '.svg')}" alt="${prod.name}" style="width: 54px; height: 54px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--admin-border);">
                            <div>
                                <div style="font-weight: 600; font-size: 15px;">${prod.name}</div>
                                <div style="font-size: 11px; color: var(--accent); font-weight: 700; text-transform: uppercase;">${prod.brand}</div>
                            </div>
                        </td>
                        <td style="font-size: 13px; color: var(--text-gray);">${prod.category_name}</td>
                        <td style="font-family: monospace; font-size: 13px; font-weight: 600;">${prod.sku}</td>
                        <td style="font-family: 'Outfit', sans-serif;">${priceHtml}</td>
                        <td><span class="${stockBadgeClass}">${stockText}</span></td>
                        <td>
                            <span class="status-badge ${prod.is_active ? 'delivered' : 'cancelled'}" style="font-size: 10px; padding: 2px 6px;">
                                ${prod.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                <a href="/admin/edit-product.html?id=${prod.id}" class="admin-btn admin-btn-secondary" style="padding: 6px 12px; font-size: 13px;">✏️ Edit</a>
                                <button type="button" class="admin-btn admin-btn-danger btn-delete-product" data-product-id="${prod.id}" data-name="${prod.name}" style="padding: 6px 12px; font-size: 13px;">🗑️ Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            // Bind Deletions
            bindDeleteProductTriggers();

        } else {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px 0; color: var(--text-gray);">No products uploaded yet.</td></tr>`;
        }
    } catch (err) {
        console.error('Failed to load products list:', err);
    }
}

function bindDeleteProductTriggers() {
    const delButtons = document.querySelectorAll('.btn-delete-product');
    delButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = btn.getAttribute('data-product-id');
            const name = btn.getAttribute('data-name');
            const conf = confirm(`Are you absolutely sure you want to delete "${name}"? This action cannot be undone.`);
            if (!conf) return;

            try {
                const res = await fetch(`/api/admin/products/delete/${id}`, { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    alert('Product deleted successfully.');
                    renderAdminProductsList();
                }
            } catch (err) {
                alert('Delete failed.');
            }
        });
    });
}

// =========================================================================
// 4. ADD PRODUCT PAGE INITIALIZER
// =========================================================================
async function initAdminAddProductPage() {
    // A. Fetch categories list to populate dropdown
    try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (!data.success) return;

        const select = document.getElementById('category_id');
        if (select) {
            select.innerHTML = '<option value="">-- Select Category --</option>';
            data.categories.forEach(cat => {
                select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            });
        }
    } catch (err) {
        console.error('Failed to load category select box options:', err);
    }

    // B. Setup image previews
    setupFormImagePreviews();

    // C. Bind add form submit
    const addForm = document.getElementById('admin-add-product-form');
    if (addForm) {
        addForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = addForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving Spare Part...';

            const formData = new FormData(addForm);
            
            // Explicitly set checkboxes value
            const isActiveInput = document.getElementById('is_active');
            formData.set('is_active', isActiveInput && isActiveInput.checked ? '1' : '0');

            try {
                const saveRes = await fetch('/api/admin/products/add', {
                    method: 'POST',
                    body: formData
                });
                const saveData = await saveRes.json();
                if (saveData.success) {
                    alert('Product added successfully!');
                    window.location.href = '/admin/products.html';
                } else {
                    alert('Error: ' + saveData.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save Spare Part';
                }
            } catch (err) {
                alert('Connection error. Could not save product.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Spare Part';
            }
        });
    }
}

// Helper to bind image previews
function setupFormImagePreviews() {
    const mainInput = document.getElementById('main_image_input');
    const mainPreview = document.getElementById('main_image_preview');
    if (mainInput && mainPreview) {
        mainInput.addEventListener('change', function() {
            mainPreview.innerHTML = '';
            if (this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    mainPreview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin-top: 10px;" />`;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    const extraInput = document.getElementById('extra_images_input');
    const extraPreview = document.getElementById('extra_images_preview');
    if (extraInput && extraPreview) {
        extraInput.addEventListener('change', function() {
            extraPreview.innerHTML = '';
            if (this.files.length > 0) {
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.gap = '10px';
                container.style.flexWrap = 'wrap';
                container.style.marginTop = '10px';

                Array.from(this.files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.width = '80px';
                        img.style.height = '60px';
                        img.style.objectFit = 'cover';
                        img.style.borderRadius = '6px';
                        img.style.border = '1px solid rgba(255,255,255,0.1)';
                        container.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                });
                extraPreview.appendChild(container);
            }
        });
    }
}

// =========================================================================
// 5. EDIT PRODUCT PAGE INITIALIZER
// =========================================================================
async function initAdminEditProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        window.location.href = '/admin/products.html';
        return;
    }

    try {
        const res = await fetch(`/api/admin/products/edit/${id}`);
        if (res.status === 404) {
            window.location.href = '/admin/products.html';
            return;
        }
        const data = await res.json();
        if (!data.success) return;

        const prod = data.product;

        // Populate Categories Select
        const select = document.getElementById('category_id');
        if (select) {
            select.innerHTML = '<option value="">-- Select Category --</option>';
            data.categories.forEach(cat => {
                select.innerHTML += `<option value="${cat.id}" ${prod.category_id === cat.id ? 'selected' : ''}>${cat.name}</option>`;
            });
        }

        // Pre-fill inputs
        document.getElementById('name').value = prod.name;
        document.getElementById('sku').value = prod.sku;
        document.getElementById('brand').value = prod.brand;
        document.getElementById('stock').value = prod.stock;
        document.getElementById('price').value = prod.price;
        document.getElementById('discount_price').value = prod.discount_price !== null ? prod.discount_price : '';
        document.getElementById('short_description').value = prod.short_description;
        document.getElementById('description').value = prod.description || '';
        document.getElementById('material').value = prod.material;
        document.getElementById('weight').value = prod.weight;
        document.getElementById('compatible_model').value = prod.compatible_model;
        document.getElementById('part_usage').value = prod.part_usage;
        document.getElementById('quality_type').value = prod.quality_type;
        document.getElementById('warranty').value = prod.warranty || '';
        
        const activeCheck = document.getElementById('is_active');
        if (activeCheck) activeCheck.checked = prod.is_active === 1;

        // Render current main image
        const currentMainImg = document.getElementById('current-main-img');
        if (currentMainImg) currentMainImg.src = prod.main_image.replace('.png', '.svg');

        // Render current extra images
        const currentExtras = document.getElementById('current-extras-container');
        if (currentExtras) {
            currentExtras.innerHTML = '';
            if (data.extraImages && data.extraImages.length > 0) {
                data.extraImages.forEach(img => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'extra-image-wrapper';
                    wrapper.style.position = 'relative';
                    wrapper.style.display = 'inline-block';
                    wrapper.style.marginRight = '8px';
                    wrapper.style.marginBottom = '8px';
                    
                    wrapper.innerHTML = `
                        <img src="${img.image_url.replace('.png', '.svg')}" style="width: 60px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid var(--admin-border);" />
                        <button type="button" class="btn-delete-extra-image" data-image-id="${img.id}" style="position: absolute; top: -5px; right: -5px; background: #ff4d4f; color: white; border: none; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 11px; cursor: pointer; font-weight: bold; line-height: 1; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 10;">×</button>
                    `;
                    
                    // Bind deletion trigger
                    wrapper.querySelector('.btn-delete-extra-image').addEventListener('click', async function(e) {
                        e.preventDefault();
                        const imageId = this.getAttribute('data-image-id');
                        if (!confirm('Are you sure you want to delete this secondary image?')) return;
                        
                        try {
                            const delRes = await fetch(`/api/admin/products/delete-image/${imageId}`, {
                                method: 'POST'
                            });
                            const delData = await delRes.json();
                            if (delData.success) {
                                wrapper.remove();
                                alert('Image deleted successfully.');
                            } else {
                                alert('Error: ' + delData.message);
                            }
                        } catch (err) {
                            alert('Failed to delete image.');
                        }
                    });
                    
                    currentExtras.appendChild(wrapper);
                });
                
                const labelSpan = document.createElement('span');
                labelSpan.style.cssText = 'font-size: 12px; color: var(--text-gray); align-self: center; margin-left: 4px; display: block; width: 100%; margin-top: 4px;';
                labelSpan.textContent = 'Existing secondary angles (click × to delete)';
                currentExtras.appendChild(labelSpan);
            } else {
                currentExtras.innerHTML = '<span style="font-size: 12px; color: var(--text-gray); font-style: italic;">No secondary images uploaded yet.</span>';
            }
        }

        // Previews
        setupFormImagePreviews();

        // Bind update
        const editForm = document.getElementById('admin-edit-product-form');
        if (editForm) {
            editForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = editForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Updating Spare Part...';

                const formData = new FormData(editForm);
                formData.set('is_active', activeCheck && activeCheck.checked ? '1' : '0');

                try {
                    const saveRes = await fetch(`/api/admin/products/edit/${id}`, {
                        method: 'POST',
                        body: formData
                    });
                    const saveData = await saveRes.json();
                    if (saveData.success) {
                        alert('Spare part updated successfully.');
                        window.location.href = '/admin/products.html';
                    } else {
                        alert('Error: ' + saveData.message);
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Update Spare Part';
                    }
                } catch (err) {
                    alert('Connection error.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Update Spare Part';
                }
            });
        }

    } catch (err) {
        console.error('Failed to load edit product form:', err);
    }
}

// =========================================================================
// 6. CATEGORIES PAGE RENDERER (With Edit and Delete Operations)
// =========================================================================
async function renderAdminCategoriesPage() {
    try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (!data.success) return;

        const tbody = document.getElementById('admin-categories-table-body');
        if (tbody) {
            tbody.innerHTML = '';
            if (data.categories.length > 0) {
                data.categories.forEach(cat => {
                    tbody.innerHTML += `
                        <tr>
                            <td>
                                <img src="${cat.image.replace('.png', '.svg')}" alt="${cat.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 50%; border: 1px solid var(--admin-border); background: rgba(255,255,255,0.02);">
                            </td>
                            <td style="font-weight: 600; color: var(--accent);">${cat.name}</td>
                            <td style="font-size: 13px; font-family: monospace; color: var(--text-gray);">${cat.slug}</td>
                            <td style="font-size: 13px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-gray);" title="${cat.description || ''}">${cat.description || 'No description.'}</td>
                            <td style="text-align: center; font-weight: 700;">
                                <span class="stock-badge in-stock" style="font-size: 12px; padding: 4px 10px;">
                                    ${cat.product_count} parts
                                </span>
                            </td>
                            <td style="text-align: right;">
                                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                    <button type="button" class="admin-btn admin-btn-secondary btn-edit-category" data-id="${cat.id}" data-name="${cat.name}" data-description="${cat.description || ''}" data-image="${cat.image}" style="padding: 6px 10px; font-size: 12px;">✏️ Edit</button>
                                    <button type="button" class="admin-btn admin-btn-danger btn-delete-category" data-id="${cat.id}" data-name="${cat.name}" style="padding: 6px 10px; font-size: 12px;">🗑️ Delete</button>
                                </div>
                            </td>
                        </tr>
                    `;
                });

                // Bind Edit and Delete button triggers
                bindCategoryActions();
            } else {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-gray); font-style: italic;">No categories defined yet.</td></tr>`;
            }
        }

        // Bind Add Category form
        const addCatForm = document.getElementById('admin-add-category-form');
        if (addCatForm) {
            const iconInput = document.getElementById('cat_image_input');
            const iconPreview = document.getElementById('cat_image_preview');
            const cancelBtn = document.getElementById('cat-cancel-btn');
            const formTitle = document.getElementById('form-title');
            const submitBtn = document.getElementById('cat-submit-btn');
            const editIdInput = document.getElementById('edit_category_id');

            // Setup local icon preview
            if (iconInput && iconPreview) {
                // Clear old listener if re-rendered by cloning
                const newIconInput = iconInput.cloneNode(true);
                iconInput.parentNode.replaceChild(newIconInput, iconInput);

                newIconInput.addEventListener('change', function() {
                    iconPreview.innerHTML = '';
                    if (this.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            iconPreview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100px; border-radius: 6px; margin-top: 10px;" />`;
                        };
                        reader.readAsDataURL(this.files[0]);
                    }
                });
            }

            // Setup cancel edit button listener
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    resetCategoryForm();
                });
            }

            function resetCategoryForm() {
                addCatForm.reset();
                if (editIdInput) editIdInput.value = '';
                if (formTitle) formTitle.textContent = 'Add New Division';
                if (submitBtn) {
                    submitBtn.textContent = 'Save Category Division';
                    submitBtn.style.backgroundColor = 'var(--accent)';
                }
                if (cancelBtn) cancelBtn.style.display = 'none';
                if (iconPreview) iconPreview.innerHTML = '';
                const fileInput = document.getElementById('cat_image_input');
                if (fileInput) fileInput.setAttribute('required', 'required'); // Restore required for Add mode
            }

            // Handle Form Submit (Both Add and Edit)
            // Clone form to avoid duplicate event listeners on re-render
            const newForm = addCatForm.cloneNode(true);
            addCatForm.parentNode.replaceChild(newForm, addCatForm);

            // Re-get the references from the new cloned form
            const freshIconInput = document.getElementById('cat_image_input');
            const freshIconPreview = document.getElementById('cat_image_preview');
            const freshCancelBtn = document.getElementById('cat-cancel-btn');
            const freshSubmitBtn = document.getElementById('cat-submit-btn');
            const freshEditIdInput = document.getElementById('edit_category_id');

            if (freshIconInput && freshIconPreview) {
                freshIconInput.addEventListener('change', function() {
                    freshIconPreview.innerHTML = '';
                    if (this.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            freshIconPreview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100px; border-radius: 6px; margin-top: 10px;" />`;
                        };
                        reader.readAsDataURL(this.files[0]);
                    }
                });
            }
            if (freshCancelBtn) {
                freshCancelBtn.addEventListener('click', function() {
                    newForm.reset();
                    if (freshEditIdInput) freshEditIdInput.value = '';
                    const formTitle = document.getElementById('form-title');
                    if (formTitle) formTitle.textContent = 'Add New Division';
                    if (freshSubmitBtn) {
                        freshSubmitBtn.textContent = 'Save Category Division';
                        freshSubmitBtn.style.backgroundColor = 'var(--accent)';
                    }
                    freshCancelBtn.style.display = 'none';
                    if (freshIconPreview) freshIconPreview.innerHTML = '';
                    if (freshIconInput) freshIconInput.setAttribute('required', 'required');
                });
            }

            newForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const isEdit = freshEditIdInput && freshEditIdInput.value;
                const targetUrl = isEdit 
                    ? `/api/admin/categories/edit/${freshEditIdInput.value}`
                    : '/api/admin/categories/add';

                const submitBtnLabel = isEdit ? 'Updating...' : 'Saving...';
                freshSubmitBtn.disabled = true;
                freshSubmitBtn.textContent = submitBtnLabel;

                const formData = new FormData(newForm);
                
                try {
                    const saveRes = await fetch(targetUrl, {
                        method: 'POST',
                        body: formData
                    });
                    const saveData = await saveRes.json();
                    if (saveData.success) {
                        alert(isEdit ? 'Category updated successfully!' : 'Category added successfully!');
                        newForm.reset();
                        if (freshEditIdInput) freshEditIdInput.value = '';
                        const formTitle = document.getElementById('form-title');
                        if (formTitle) formTitle.textContent = 'Add New Division';
                        if (freshSubmitBtn) {
                            freshSubmitBtn.textContent = 'Save Category Division';
                            freshSubmitBtn.style.backgroundColor = 'var(--accent)';
                        }
                        if (freshCancelBtn) freshCancelBtn.style.display = 'none';
                        if (freshIconPreview) freshIconPreview.innerHTML = '';
                        if (freshIconInput) freshIconInput.setAttribute('required', 'required');
                        
                        renderAdminCategoriesPage(); // Refresh table
                    } else {
                        alert('Error: ' + saveData.message);
                    }
                } catch (err) {
                    alert('Connection error.');
                } finally {
                    freshSubmitBtn.disabled = false;
                    freshSubmitBtn.textContent = isEdit ? 'Update Category Division' : 'Save Category Division';
                }
            });
        }

    } catch (err) {
        console.error('Failed to render categories:', err);
    }
}

// Binds Edit and Delete triggers on Categories page
function bindCategoryActions() {
    // A. Edit Buttons
    const editBtns = document.querySelectorAll('.btn-edit-category');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const desc = btn.getAttribute('data-description');
            const img = btn.getAttribute('data-image');

            // Set Form to Edit Mode
            const editIdInput = document.getElementById('edit_category_id');
            const nameInput = document.getElementById('cat_name');
            const descInput = document.getElementById('cat_desc');
            const fileInput = document.getElementById('cat_image_input');
            const iconPreview = document.getElementById('cat_image_preview');
            const formTitle = document.getElementById('form-title');
            const submitBtn = document.getElementById('cat-submit-btn');
            const cancelBtn = document.getElementById('cat-cancel-btn');

            if (editIdInput) editIdInput.value = id;
            if (nameInput) nameInput.value = name;
            if (descInput) descInput.value = desc;
            
            // In Edit Mode, image is optional (default is to keep the current one)
            if (fileInput) fileInput.removeAttribute('required');
            
            // Show preview of current image
            if (iconPreview && img) {
                iconPreview.innerHTML = `
                    <div style="margin-top: 10px;">
                        <span style="font-size: 11px; color: var(--text-gray); display: block; margin-bottom: 6px;">Current Icon:</span>
                        <img src="${img.replace('.png', '.svg')}" style="max-width: 80px; max-height: 80px; border-radius: 6px; border: 1px solid var(--admin-border);" />
                    </div>
                `;
            }

            // Update Form UI Labels
            if (formTitle) formTitle.textContent = `Edit Division: ${name}`;
            if (submitBtn) {
                submitBtn.textContent = 'Update Category Division';
                submitBtn.style.backgroundColor = '#2e7d32'; // Green theme for edit update
            }
            if (cancelBtn) cancelBtn.style.display = 'block';

            // Scroll form into view for mobile users
            const formCard = document.getElementById('admin-add-category-form');
            if (formCard) {
                formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    // B. Delete Buttons
    const deleteBtns = document.querySelectorAll('.btn-delete-category');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');

            const conf = confirm(`⚠️ WARNING: Are you absolutely sure you want to delete category "${name}"?\n\nDeleting this category will AUTOMATICALLY delete all products listed under it. This action cannot be undone.`);
            if (!conf) return;

            try {
                const res = await fetch(`/api/admin/categories/delete/${id}`, { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    alert('Category division and its associated products deleted successfully.');
                    
                    // If the form was in Edit Mode for this category, reset it
                    const editIdInput = document.getElementById('edit_category_id');
                    if (editIdInput && editIdInput.value === id) {
                        const cancelBtn = document.getElementById('cat-cancel-btn');
                        if (cancelBtn) cancelBtn.click();
                    }
                    
                    renderAdminCategoriesPage(); // Refresh table
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (err) {
                alert('Delete failed.');
            }
        });
    });
}

// =========================================================================
// 7. ORDERS PAGE RENDERER
// =========================================================================
async function renderAdminOrdersPage() {
    try {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();
        if (!data.success) return;

        const tbody = document.getElementById('admin-orders-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (data.orders.length > 0) {
            data.orders.forEach(order => {
                const dateObj = new Date(order.created_at);
                const dateStr = dateObj.toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'});
                const timeStr = dateObj.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'});
                
                const mapBtn = order.latitude && order.longitude
                    ? `<a href="https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}" class="admin-btn admin-btn-secondary" target="_blank" style="padding: 6px 10px; font-size: 13px; border-color: #25D366; color: #25D366; background: rgba(37, 211, 102, 0.05);" title="Open Farm Pinned Coordinates in Google Maps">📍 Map</a>`
                    : '';

                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight: 700; color: var(--accent);">#${order.id}</td>
                        <td style="font-weight: 600;">${order.user_name}</td>
                        <td style="font-size: 13px; color: var(--text-gray);">
                            ${dateStr}<br>
                            <span style="font-size: 11px;">${timeStr}</span>
                        </td>
                        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: var(--text-gray);" title="${order.shipping_address}">
                            ${order.shipping_address}
                        </td>
                        <td style="font-weight: 700; font-family: 'Outfit', sans-serif;">₹${order.total_amount.toFixed(2)}</td>
                        <td>
                            <span class="status-badge ${order.status.toLowerCase()}" style="font-size: 11px; padding: 4px 10px;">
                                ${order.status}
                            </span>
                        </td>
                        <td>
                            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                <a href="/admin/order-details.html?id=${order.id}" class="admin-btn admin-btn-secondary" style="padding: 6px 12px; font-size: 13px;">⚙️ Manage</a>
                                ${mapBtn}
                            </div>
                        </td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px 0; color: var(--text-gray);">No orders received yet.</td></tr>`;
        }

    } catch (err) {
        console.error('Failed to load admin order records:', err);
    }
}

// =========================================================================
// 8. ORDER DETAILS MANAGEMENT PAGE RENDERER
// =========================================================================
async function renderAdminOrderDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        window.location.href = '/admin/orders.html';
        return;
    }

    try {
        const res = await fetch(`/api/admin/orders/${id}`);
        if (res.status === 404) {
            window.location.href = '/admin/orders.html';
            return;
        }
        const data = await res.json();
        if (!data.success) return;

        const order = data.order;
        const items = data.items;

        // Render meta Title info
        document.getElementById('admin-order-id-heading').textContent = `Order #${order.id} Management`;
        document.getElementById('admin-order-date').textContent = 'Placed on ' + new Date(order.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Render customer details
        document.getElementById('cust-name').textContent = order.user_name;
        document.getElementById('cust-email').textContent = order.user_email;
        document.getElementById('cust-phone').textContent = `+91 ${order.user_phone}`;
        document.getElementById('btn-chat-whatsapp').href = `https://api.whatsapp.com/send?phone=91${order.phone}`;

        // Render shipping address
        document.getElementById('ship-address-text').textContent = order.shipping_address;

        // Render GPS coordinates card
        const gpsContainer = document.getElementById('ship-gps-container');
        if (gpsContainer) {
            if (order.latitude && order.longitude) {
                gpsContainer.innerHTML = `
                    <div style="font-size: 13px; color: #4caf50; font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 12px;">
                        <span>📍</span> coordinates Pinned (lat: ${parseFloat(order.latitude).toFixed(4)}, lng: ${parseFloat(order.longitude).toFixed(4)})
                    </div>
                    <a href="https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}" 
                       class="admin-btn admin-btn-secondary" 
                       target="_blank" 
                       style="font-size: 12px; padding: 8px 16px; border-color: var(--accent); color: var(--accent);">
                        🗺️ Navigate on Google Maps
                    </a>
                `;
            } else {
                gpsContainer.innerHTML = `<p style="font-size: 13px; color: var(--text-gray); font-style: italic;">No GPS coordinates pinned for this order.</p>`;
            }
        }

        // Render items table
        const tbody = document.getElementById('order-items-tbody');
        if (tbody) {
            tbody.innerHTML = '';
            items.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                        <td style="display: flex; align-items: center; gap: 12px;">
                            <img src="${item.main_image.replace('.png', '.svg')}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--admin-border);">
                            <div>
                                <div style="font-weight: 600; font-size: 14px;">${item.name}</div>
                                <div style="font-size: 11px; color: var(--accent); font-weight: 700; text-transform: uppercase;">${item.brand}</div>
                            </div>
                        </td>
                        <td style="text-align: center; font-family: monospace; font-size: 13px;">${item.sku}</td>
                        <td style="text-align: center; font-family: 'Outfit', sans-serif;">₹${item.price.toFixed(2)}</td>
                        <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
                        <td style="text-align: right; font-weight: 700; font-family: 'Outfit', sans-serif;">₹${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `;
            });
        }

        // Summary Price tallies
        document.getElementById('summary-platform-fee').textContent = `₹${order.platform_fee.toFixed(2)}`;
        document.getElementById('summary-grand-total').textContent = `₹${order.total_amount.toFixed(2)}`;

        // Pre-select Status boxes
        document.getElementById('status').value = order.status;
        document.getElementById('payment_status').value = order.payment_status;

        // Bind update status form submission
        const statusForm = document.getElementById('admin-order-status-form');
        if (statusForm) {
            statusForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = statusForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Updating...';

                const bodyData = {
                    status: document.getElementById('status').value,
                    payment_status: document.getElementById('payment_status').value
                };

                try {
                    const statusRes = await fetch(`/api/admin/orders/${id}/status`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bodyData)
                    });
                    const statusData = await statusRes.json();
                    if (statusData.success) {
                        alert('Order status updated successfully.');
                        window.location.reload();
                    } else {
                        alert('Failed: ' + statusData.message);
                    }
                } catch (err) {
                    alert('Connection error.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Update Order Status';
                }
            });
        }

    } catch (err) {
        console.error('Failed to load order details management page:', err);
    }
}

// =========================================================================
// 9. CUSTOMERS DIRECTORY PAGE RENDERER
// =========================================================================
async function renderAdminUsersPage() {
    try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (!data.success) return;

        const tbody = document.getElementById('admin-users-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (data.users.length > 0) {
            data.users.forEach(cust => {
                tbody.innerHTML += `
                    <tr>
                        <td style="display: flex; align-items: center; gap: 14px;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background-color: var(--accent); color: var(--bg-admin-dark); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px;">
                                ${cust.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style="font-weight: 600; font-size: 15px;">${cust.name}</div>
                                <div style="font-size: 11px; color: var(--text-gray);">${cust.email}</div>
                            </div>
                        </td>
                        <td style="font-weight: 600; font-family: monospace; font-size: 13px;">+91 ${cust.phone}</td>
                        <td style="font-weight: 600;">${cust.order_count} orders</td>
                        <td style="font-weight: 700; color: #4caf50; font-family: 'Outfit', sans-serif;">₹${(cust.total_spent || 0).toFixed(2)}</td>
                        <td style="text-align: right;">
                            <a href="https://api.whatsapp.com/send?phone=91${cust.phone}" 
                               class="admin-btn admin-btn-secondary" 
                               target="_blank" 
                               style="padding: 6px 12px; font-size: 12px; border-color: #25D366; color: #25D366; background: rgba(37, 211, 102, 0.05);">
                                💬 WhatsApp Chat
                            </a>
                        </td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px 0; color: var(--text-gray);">No customers registered yet.</td></tr>`;
        }

    } catch (err) {
        console.error('Failed to load customers database:', err);
    }
}

// =========================================================================
// 10. STOCK INVENTORY QUICK UPDATE PAGE RENDERER
// =========================================================================
async function renderAdminInventoryPage() {
    try {
        const res = await fetch('/api/admin/inventory');
        const data = await res.json();
        if (!data.success) return;

        const tbody = document.getElementById('admin-inventory-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (data.products.length > 0) {
            data.products.forEach(prod => {
                const stockBadgeClass = prod.stock === 0 
                    ? 'stock-badge out-of-stock' 
                    : (prod.stock <= 5 ? 'stock-badge low-stock' : 'stock-badge in-stock');
                const stockText = prod.stock === 0 
                    ? 'Out of Stock' 
                    : (prod.stock <= 5 ? `Low Stock (${prod.stock})` : `In Stock (${prod.stock})`);

                tbody.innerHTML += `
                    <tr>
                        <td style="display: flex; align-items: center; gap: 14px;">
                            <img src="${prod.main_image.replace('.png', '.svg')}" alt="${prod.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--admin-border);">
                            <div>
                                <div style="font-weight: 600; font-size: 14px;">${prod.name}</div>
                                <div style="font-size: 11px; color: var(--accent); font-weight: 700; text-transform: uppercase;">${prod.brand}</div>
                            </div>
                        </td>
                        <td style="font-size: 13px; color: var(--text-gray);">${prod.category_name}</td>
                        <td style="font-family: monospace; font-size: 13px; font-weight: 600;">${prod.sku}</td>
                        <td style="font-weight: 600; font-family: 'Outfit', sans-serif;">₹${prod.price.toFixed(2)}</td>
                        <td><span class="stock-badge-indicator ${stockBadgeClass}">${stockText}</span></td>
                        <td>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                                <input type="number" 
                                       value="${prod.stock}" 
                                       min="0" 
                                       class="admin-form-control stock-quick-input" 
                                       style="width: 80px; text-align: center; padding: 6px; background: rgba(0,0,0,0.3);" 
                                       aria-label="Stock count for SKU ${prod.sku}">
                                
                                <button type="button" 
                                        class="admin-btn admin-btn-primary btn-update-stock" 
                                        data-product-id="${prod.id}" 
                                        style="padding: 6px 12px; font-size: 13px; font-weight: 700;">
                                    💾 Save
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            // Bind Quick Save Buttons
            initQuickInventoryUpdateActions();

        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px 0; color: var(--text-gray);">No parts in database.</td></tr>`;
        }

    } catch (err) {
        console.error('Failed to load inventory stock list:', err);
    }
}

function initQuickInventoryUpdateActions() {
    const buttons = document.querySelectorAll('.btn-update-stock');
    buttons.forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = btn.getAttribute('data-product-id');
            const row = btn.closest('tr');
            const input = row.querySelector('.stock-quick-input');
            const stock = input.value;
            const badge = row.querySelector('.stock-badge-indicator');

            btn.disabled = true;
            input.disabled = true;
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '...';

            try {
                const res = await fetch('/api/admin/inventory/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, stock })
                });
                const data = await res.json();
                if (data.success) {
                    btn.innerHTML = '✓';
                    btn.style.backgroundColor = '#4caf50';
                    btn.style.color = '#ffffff';
                    
                    // Update badges dynamically
                    const stockNum = parseInt(stock);
                    if (stockNum === 0) {
                        badge.textContent = 'Out of Stock';
                        badge.className = 'stock-badge-indicator stock-badge out-of-stock';
                    } else if (stockNum <= 5) {
                        badge.textContent = `Low Stock (${stockNum})`;
                        badge.className = 'stock-badge-indicator stock-badge low-stock';
                    } else {
                        badge.textContent = `In Stock (${stockNum})`;
                        badge.className = 'stock-badge-indicator stock-badge in-stock';
                    }

                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                        btn.disabled = false;
                    }, 1500);
                } else {
                    alert('Failed: ' + data.message);
                    btn.innerHTML = originalHtml;
                    btn.disabled = false;
                }
            } catch (err) {
                alert('Connection error.');
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            } finally {
                input.disabled = false;
            }
        });
    });
}

// =========================================================================
// 11. SETTINGS PAGE PROFILE UPDATE RENDERER
// =========================================================================
function renderAdminSettingsPage() {
    // Pre-fill profile fields
    const usernameInput = document.getElementById('username');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');

    if (usernameInput) usernameInput.value = adminSession.username;
    if (nameInput) nameInput.value = adminSession.name;
    if (emailInput) emailInput.value = adminSession.email;

    // Bind profile form submit
    const profileForm = document.getElementById('admin-profile-settings-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            const bodyData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            try {
                const res = await fetch('/api/admin/settings/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });
                const data = await res.json();
                
                if (data.success) {
                    alert('Profile updated successfully!');
                    
                    // Update dynamic session state
                    adminSession.name = bodyData.name;
                    adminSession.email = bodyData.email;
                    
                    // Re-render header
                    document.getElementById('admin-profile-name').textContent = adminSession.name;
                    
                    // Clear password field
                    document.getElementById('password').value = '';
                } else {
                    alert('Failed to update: ' + data.message);
                }
            } catch (err) {
                alert('Connection error.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '💾 Save Profile Settings';
            }
        });
    }
}

// =========================================================================
// 16. TECHNICAL INQUIRIES PAGE RENDERER
// =========================================================================
async function renderAdminInquiriesPage() {
    try {
        const res = await fetch('/api/admin/inquiries');
        const data = await res.json();
        if (!data.success) return;

        const container = document.getElementById('inquiries-container');
        if (!container) return;

        container.innerHTML = '';
        if (data.inquiries.length > 0) {
            data.inquiries.forEach(iq => {
                const dateObj = new Date(iq.created_at);
                const dateStr = dateObj.toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'});
                const timeStr = dateObj.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'});
                const initial = iq.name ? iq.name.charAt(0).toUpperCase() : '👤';

                const machineHtml = iq.machine 
                    ? `<div class="inquiry-meta-item">🚜 <strong>Machine:</strong> ${iq.machine}</div>`
                    : '';

                const waLink = `https://api.whatsapp.com/send?phone=91${iq.phone}&text=${encodeURIComponent(`Hello ${iq.name}, this is SK All Agriculture Parts Support. We received your technical inquiry regarding: "${iq.message.substring(0, 60)}...". How can we assist you today?`)}`;

                container.innerHTML += `
                    <div class="inquiry-card" data-inquiry-id="${iq.id}">
                        <div class="inquiry-header">
                            <div class="inquiry-user-info">
                                <div class="inquiry-avatar">${initial}</div>
                                <div>
                                    <div class="inquiry-name">${iq.name}</div>
                                    <div class="inquiry-date">Submitted on ${dateStr} at ${timeStr}</div>
                                </div>
                            </div>
                            <div class="inquiry-meta-details">
                                <div class="inquiry-meta-item">📞 <strong>Phone:</strong> ${iq.phone}</div>
                                ${machineHtml}
                            </div>
                        </div>
                        <div class="inquiry-message-bubble">
                            ${iq.message}
                        </div>
                        <div class="inquiry-actions">
                            <a href="${waLink}" target="_blank" class="admin-btn" style="background-color: #25D366; color: white; padding: 6px 12px; font-size: 12px;">
                                💬 WhatsApp Chat
                            </a>
                            <button type="button" class="admin-btn admin-btn-danger btn-delete-inquiry" data-id="${iq.id}" data-name="${iq.name}" style="padding: 6px 12px; font-size: 12px;">
                                🗑️ Delete Inquiry
                            </button>
                        </div>
                    </div>
                `;
            });

            bindInquiryDeleteTriggers();
        } else {
            container.innerHTML = `
                <div style="background-color: var(--bg-admin-card); border: 1px dashed var(--admin-border); border-radius: var(--radius-lg); padding: 60px 20px; text-align: center; color: var(--text-gray);">
                    <span style="font-size: 48px; display: block; margin-bottom: 14px;">💬</span>
                    <h3 style="font-family: 'Outfit', sans-serif; font-size: 18px; margin-bottom: 6px; color: var(--text-light);">No Technical Inquiries</h3>
                    <p style="font-size: 13px; max-width: 380px; margin: 0 auto;">When customers submit spare part compatibility questions from the homepage form, they will appear here as comment threads.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error('Failed to load technical inquiries:', err);
    }
}

function bindInquiryDeleteTriggers() {
    const deleteBtns = document.querySelectorAll('.btn-delete-inquiry');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const conf = confirm(`Are you sure you want to delete the technical inquiry submitted by "${name}"?`);
            if (!conf) return;

            try {
                const res = await fetch(`/api/admin/inquiries/delete/${id}`, { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    alert('Inquiry deleted successfully.');
                    renderAdminInquiriesPage(); // Refresh list
                } else {
                    alert('Failed: ' + data.message);
                }
            } catch (err) {
                alert('Connection error.');
            }
        });
    });
}

// Initializes admin dark/light theme toggle
function initAdminThemeToggle() {
    const toggleBtn = document.getElementById('admin-theme-toggle-btn');
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
// 18. BANNER MANAGEMENT RENDERER
// =========================================================================
async function renderAdminBannersPage() {
    // A. Fetch and Render Banners List
    await loadBannersList();

    // B. Setup Image Preview
    const bannerImageInput = document.getElementById('banner_image_input');
    const bannerImagePreview = document.getElementById('banner_image_preview');
    const cancelBtn = document.getElementById('banner-cancel-btn');
    const editIdInput = document.getElementById('edit_banner_id');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('banner-submit-btn');

    if (bannerImageInput && bannerImagePreview) {
        // Clear old listener by cloning
        const newImageInput = bannerImageInput.cloneNode(true);
        bannerImageInput.parentNode.replaceChild(newImageInput, bannerImageInput);

        newImageInput.addEventListener('change', function() {
            bannerImagePreview.innerHTML = '';
            if (this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    bannerImagePreview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 120px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); margin-top: 10px;" />`;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // C. Setup cancel edit button listener
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            resetBannerForm();
        });
    }

    function resetBannerForm() {
        const form = document.getElementById('admin-add-banner-form');
        if (form) form.reset();
        if (editIdInput) editIdInput.value = '';
        if (formTitle) formTitle.textContent = 'Add New Banner';
        if (submitBtn) {
            submitBtn.textContent = '💾 Upload Banner';
            submitBtn.style.backgroundColor = 'var(--accent)';
        }
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (bannerImagePreview) bannerImagePreview.innerHTML = '';
        const fileInput = document.getElementById('banner_image_input');
        if (fileInput) fileInput.setAttribute('required', 'required'); // Restore required for Add mode
    }

    // D. Bind Add/Edit Banner Form Submission
    const addBannerForm = document.getElementById('admin-add-banner-form');
    if (addBannerForm) {
        // Clone form to avoid duplicate event listeners
        const newForm = addBannerForm.cloneNode(true);
        addBannerForm.parentNode.replaceChild(newForm, addBannerForm);

        // Re-bind file preview & cancel triggers on the fresh form
        const freshImageInput = document.getElementById('banner_image_input');
        const freshImagePreview = document.getElementById('banner_image_preview');
        const freshCancelBtn = document.getElementById('banner-cancel-btn');
        const freshSubmitBtn = document.getElementById('banner-submit-btn');
        const freshEditIdInput = document.getElementById('edit_banner_id');
        const freshFormTitle = document.getElementById('form-title');

        if (freshImageInput && freshImagePreview) {
            freshImageInput.addEventListener('change', function() {
                freshImagePreview.innerHTML = '';
                if (this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        freshImagePreview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 120px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); margin-top: 10px;" />`;
                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }

        if (freshCancelBtn) {
            freshCancelBtn.addEventListener('click', function() {
                newForm.reset();
                if (freshEditIdInput) freshEditIdInput.value = '';
                if (freshFormTitle) freshFormTitle.textContent = 'Add New Banner';
                if (freshSubmitBtn) freshSubmitBtn.textContent = '💾 Upload Banner';
                freshCancelBtn.style.display = 'none';
                if (freshImagePreview) freshImagePreview.innerHTML = '';
                if (freshImageInput) freshImageInput.setAttribute('required', 'required');
            });
        }

        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const isEdit = freshEditIdInput && freshEditIdInput.value;
            const targetUrl = isEdit 
                ? `/api/admin/banners/edit/${freshEditIdInput.value}`
                : '/api/admin/banners/add';

            freshSubmitBtn.disabled = true;
            freshSubmitBtn.textContent = isEdit ? 'Updating Banner...' : 'Uploading Banner...';

            const formData = new FormData(newForm);
            
            // Explicitly set checkbox value
            const isActiveInput = document.getElementById('banner_is_active');
            formData.set('is_active', isActiveInput && isActiveInput.checked ? '1' : '0');

            try {
                const res = await fetch(targetUrl, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    alert(isEdit ? 'Banner updated successfully!' : 'Banner uploaded successfully!');
                    newForm.reset();
                    if (freshEditIdInput) freshEditIdInput.value = '';
                    if (freshFormTitle) freshFormTitle.textContent = 'Add New Banner';
                    if (freshSubmitBtn) freshSubmitBtn.textContent = '💾 Upload Banner';
                    if (freshCancelBtn) freshCancelBtn.style.display = 'none';
                    if (freshImagePreview) freshImagePreview.innerHTML = '';
                    if (freshImageInput) freshImageInput.setAttribute('required', 'required');
                    await loadBannersList(); // Reload list
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (err) {
                alert('Connection error. Could not save banner.');
            } finally {
                freshSubmitBtn.disabled = false;
                if (!isEdit && freshSubmitBtn) freshSubmitBtn.textContent = '💾 Upload Banner';
            }
        });
    }
}

async function loadBannersList() {
    try {
        const res = await fetch('/api/admin/banners');
        const data = await res.json();
        if (!data.success) return;

        const tbody = document.getElementById('admin-banners-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (data.banners && data.banners.length > 0) {
            data.banners.forEach(banner => {
                const activeBadgeClass = banner.is_active ? 'delivered' : 'cancelled';
                const activeText = banner.is_active ? 'Active' : 'Inactive';
                const linkText = banner.link_url ? banner.link_url : '<span style="color: var(--text-gray); font-style: italic;">None</span>';

                tbody.innerHTML += `
                    <tr>
                        <td>
                            <img src="${banner.image_url.replace('.png', '.svg')}" alt="${banner.title}" style="width: 90px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--admin-border);" />
                        </td>
                        <td>
                            <div style="font-weight: 600; font-size: 14px; color: var(--text-light);">${banner.title}</div>
                            <div style="font-size: 11px; color: var(--text-gray); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${banner.subtitle || ''}</div>
                        </td>
                        <td style="font-family: monospace; font-size: 12px; color: var(--accent);">${linkText}</td>
                        <td style="text-align: center; font-weight: 600;">${banner.display_order}</td>
                        <td style="text-align: center;">
                            <span class="status-badge ${activeBadgeClass}" style="font-size: 10px; padding: 2px 6px;">
                                ${activeText}
                            </span>
                        </td>
                        <td>
                            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                <button type="button" class="admin-btn admin-btn-secondary btn-edit-banner" 
                                    data-id="${banner.id}" 
                                    data-title="${banner.title}" 
                                    data-subtitle="${banner.subtitle || ''}" 
                                    data-link="${banner.link_url || ''}" 
                                    data-order="${banner.display_order}" 
                                    data-active="${banner.is_active}" 
                                    data-image="${banner.image_url}" 
                                    style="padding: 4px 10px; font-size: 12px;">✏️ Edit</button>
                                <button type="button" class="admin-btn admin-btn-danger btn-delete-banner" data-id="${banner.id}" data-title="${banner.title}" style="padding: 4px 10px; font-size: 12px;">🗑️ Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            // Bind Banner Actions (Edit and Delete)
            bindBannerActions();

        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px 0; color: var(--text-gray); font-style: italic;">No banners uploaded yet.</td></tr>`;
        }
    } catch (err) {
        console.error('Failed to load banners list:', err);
    }
}

function bindBannerActions() {
    // A. Edit Buttons
    const editBtns = document.querySelectorAll('.btn-edit-banner');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = btn.getAttribute('data-id');
            const title = btn.getAttribute('data-title');
            const subtitle = btn.getAttribute('data-subtitle');
            const link = btn.getAttribute('data-link');
            const order = btn.getAttribute('data-order');
            const active = btn.getAttribute('data-active');
            const img = btn.getAttribute('data-image');

            // Set Form to Edit Mode
            const editIdInput = document.getElementById('edit_banner_id');
            const titleInput = document.getElementById('banner_title');
            const subtitleInput = document.getElementById('banner_subtitle');
            const linkInput = document.getElementById('banner_link');
            const orderInput = document.getElementById('banner_order');
            const activeInput = document.getElementById('banner_is_active');
            const fileInput = document.getElementById('banner_image_input');
            const imagePreview = document.getElementById('banner_image_preview');
            const formTitle = document.getElementById('form-title');
            const submitBtn = document.getElementById('banner-submit-btn');
            const cancelBtn = document.getElementById('banner-cancel-btn');

            if (editIdInput) editIdInput.value = id;
            if (titleInput) titleInput.value = title;
            if (subtitleInput) subtitleInput.value = subtitle;
            if (linkInput) linkInput.value = link;
            if (orderInput) orderInput.value = order;
            if (activeInput) activeInput.checked = (active === '1' || active === 'true');
            
            // In Edit Mode, image is optional
            if (fileInput) fileInput.removeAttribute('required');
            
            // Show preview of current image
            if (imagePreview && img) {
                imagePreview.innerHTML = `
                    <div style="margin-top: 10px;">
                        <span style="font-size: 11px; color: var(--text-gray); display: block; margin-bottom: 6px;">Current Banner Image:</span>
                        <img src="${img.replace('.png', '.svg')}" style="max-width: 120px; max-height: 80px; border-radius: 6px; border: 1px solid var(--admin-border);" />
                    </div>
                `;
            }

            // Update Form UI Labels
            if (formTitle) formTitle.textContent = `Edit Banner: ${title}`;
            if (submitBtn) {
                submitBtn.textContent = 'Update Banner';
                submitBtn.style.backgroundColor = '#2196f3'; // Blue for update
            }
            if (cancelBtn) cancelBtn.style.display = 'block';
        });
    });

    // B. Delete Buttons
    const deleteBtns = document.querySelectorAll('.btn-delete-banner');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            const title = this.getAttribute('data-title');
            if (!confirm(`Are you sure you want to delete the banner "${title}"?`)) return;

            try {
                const res = await fetch(`/api/admin/banners/delete/${id}`, { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    alert('Banner deleted successfully.');
                    await loadBannersList(); // Refresh
                } else {
                    alert('Failed to delete banner: ' + data.message);
                }
            } catch (err) {
                alert('Connection error.');
            }
        });
    });
}


