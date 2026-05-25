
let products = [
  {
    name : "Áo thun basic",
    img  : "Picture/ao.jpg",
    originalPrice: 300_000,
    price: 250_000
  },
  {
    name : "Quần jeans",
    img  : "Picture/quan.jpg",
    originalPrice: 480_000,
    price: 480_000
  },
  {
    name : "Giày sneaker",
    img  : "Picture/giay.jpg",
    originalPrice: 1_200_000,
    price: 920_000
  },
  {
    name : "Balo du lịch",
    img  : "Picture/balo.jpg",
    originalPrice: 650_000,
    price: 650_000
  },
  {
    name : "Mũ bucket",
    img  : "Picture/mu.jpg",
    originalPrice: 200_000,
    price: 180_000
  },
  {
    name : "Kính mắt thời trang",
    img  : "Picture/kinh.jpg",
    originalPrice: 500_000,
    price: 350_000
  }
];

let isDeleteMode = false; // Trạng thái chế độ xóa hàng loạt

// ─── Lấy DOM elements ─────────────────────────────────────────
const productGrid       = document.getElementById("productGrid");
const emptyState        = document.getElementById("emptyState");
const countDisplay      = document.getElementById("countDisplay");

// Các nút điều khiển chế độ ở Header & Toolbar
const btnToggleDeleteMode = document.getElementById("btnToggleDeleteMode");
const bulkControls       = document.getElementById("bulkControls");
const chkSelectAll       = document.getElementById("chkSelectAll");
const selectedCountDisplay = document.getElementById("selectedCount");
const btnOpenConfirmBulk  = document.getElementById("btnOpenConfirmBulk");
const btnExitDeleteMode   = document.getElementById("btnExitDeleteMode");

// Modal thêm/sửa
const modalOverlay      = document.getElementById("modalOverlay");
const modalTitle        = document.getElementById("modalTitle");
const inputName         = document.getElementById("inputName");
const inputImg          = document.getElementById("inputImg");
const inputOriginalPrice = document.getElementById("inputOriginalPrice");
const inputPrice        = document.getElementById("inputPrice");
const imgPreview        = document.getElementById("imgPreview");
const editIndex         = document.getElementById("editIndex");

// Modal xác nhận xóa
const confirmOverlay    = document.getElementById("confirmOverlay");
const confirmText       = document.getElementById("confirmText");
const btnConfirmDelete  = document.getElementById("btnConfirmDelete");

// Toast
const toast             = document.getElementById("toast");

// ─── Format tiền VNĐ ─────────────────────────────────────────
function formatPrice(value) {
  return Number(value).toLocaleString("vi-VN") + " ₫";
}

// ─── Render toàn bộ danh sách ─────────────────────────────────
function renderProducts() {
  productGrid.innerHTML = "";

  if (products.length === 0) {
    emptyState.style.display   = "block";
    productGrid.style.display  = "none";
    exitDeleteMode(); // Hủy chế độ xóa nếu không còn sản phẩm
  } else {
    emptyState.style.display   = "none";
    productGrid.style.display  = "grid";

    products.forEach((p, i) => {
      const card = createCard(p, i);
      productGrid.appendChild(card);
    });
  }

  countDisplay.textContent = products.length;
  updateBulkDeleteUI();
}

// ─── Tạo 1 card sản phẩm ─────────────────────────────────────
function createCard(product, index) {
  const card = document.createElement("div");
  card.className = "card";
  if (isDeleteMode) card.classList.add("delete-mode-active");
  card.setAttribute("data-index", index);

  // Tính toán phần trăm giảm giá
  let discountBadgeHTML = "";
  let originalPriceHTML = "";
  
  const origPrice = parseFloat(product.originalPrice) || product.price;
  if (origPrice > product.price) {
    const discountPercent = Math.round(((origPrice - product.price) / origPrice) * 100);
    discountBadgeHTML = `<span class="badge-discount">-${discountPercent}%</span>`;
    originalPriceHTML = `<span class="price-old">${formatPrice(origPrice)}</span>`;
  }

  // card-actions bây giờ chỉ chứa duy nhất nút Sửa (Đã loại bỏ hoàn toàn nút Xóa lẻ)
  card.innerHTML = `
    <div class="card-checkbox-wrap">
      <input type="checkbox" class="product-checkbox" data-index="${index}" onchange="onProductSelectChange()" />
    </div>

    <div class="card-img-wrap">
      ${discountBadgeHTML}
      <img src="${product.img}" alt="${product.name}"
           onerror="this.src='https://placehold.co/400x400?text=No+Image'" />
    </div>
    <div class="card-body">
      <p class="card-name">${product.name}</p>
      <div class="card-price-group">
        <span class="card-price">${formatPrice(product.price)}</span>
        ${originalPriceHTML}
      </div>
      <div class="card-actions">
        <button class="btn-edit" onclick="openEditModal(${index})">✏️ Chỉnh sửa</button>
      </div>
    </div>
  `;

  return card;
}

// ─── Quản lý Chế độ xóa hàng loạt ────────────────────────────
btnToggleDeleteMode.addEventListener("click", () => {
  if (products.length === 0) {
    showToast("⚠️ Không có sản phẩm nào để xóa!");
    return;
  }
  if (!isDeleteMode) {
    enterDeleteMode();
  } else {
    exitDeleteMode();
  }
});

btnExitDeleteMode.addEventListener("click", exitDeleteMode);

function enterDeleteMode() {
  isDeleteMode = true;
  btnToggleDeleteMode.classList.add("active");
  bulkControls.style.display = "flex";
  chkSelectAll.checked = false;
  renderProducts();
}

function exitDeleteMode() {
  isDeleteMode = false;
  btnToggleDeleteMode.classList.remove("active");
  bulkControls.style.display = "none";
  renderProducts();
}

// Sự kiện khi nhấn nút "Chọn tất cả"
chkSelectAll.addEventListener("change", (e) => {
  const checkboxes = document.querySelectorAll(".product-checkbox");
  checkboxes.forEach(cb => cb.checked = e.target.checked);
  updateBulkDeleteUI();
});

// Hàm kiểm tra và đếm số lượng checkbox đang được chọn
function onProductSelectChange() {
  const checkboxes = document.querySelectorAll(".product-checkbox");
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  chkSelectAll.checked = allChecked;
  updateBulkDeleteUI();
}

// Cập nhật giao diện đếm số mục được chọn và trạng thái nút Xóa
function updateBulkDeleteUI() {
  if (!isDeleteMode) return;
  const checkedBoxes = document.querySelectorAll(".product-checkbox:checked");
  selectedCountDisplay.textContent = checkedBoxes.length;
  
  if (checkedBoxes.length > 0) {
    btnOpenConfirmBulk.disabled = false;
    btnOpenConfirmBulk.classList.add("ready");
  } else {
    btnOpenConfirmBulk.disabled = true;
    btnOpenConfirmBulk.classList.remove("ready");
  }
}

// ─── Mở modal THÊM ───────────────────────────────────────────
document.getElementById("btnOpenModal").addEventListener("click", () => {
  modalTitle.textContent         = "Thêm sản phẩm";
  editIndex.value                = -1;
  inputName.value                = "";
  inputImg.value                 = "";
  inputOriginalPrice.value       = "";
  inputPrice.value               = "";
  imgPreview.src                 = "";
  imgPreview.classList.remove("has-src");
  openModal(modalOverlay);
});

// ─── Mở modal SỬA ────────────────────────────────────────────
function openEditModal(index) {
  const p = products[index];
  modalTitle.textContent         = "Chỉnh sửa sản phẩm";
  editIndex.value                = index;
  inputName.value                = p.name;
  inputImg.value                 = p.img;
  inputOriginalPrice.value       = p.originalPrice || p.price;
  inputPrice.value               = p.price;
  updatePreview(p.img);
  openModal(modalOverlay);
}

// ─── Cập nhật preview ảnh khi nhập URL ───────────────────────
inputImg.addEventListener("input", () => {
  updatePreview(inputImg.value.trim());
});

function updatePreview(src) {
  if (src) {
    imgPreview.src = src;
    imgPreview.classList.add("has-src");
  } else {
    imgPreview.src = "";
    imgPreview.classList.remove("has-src");
  }
}

// ─── Lưu sản phẩm (Thêm hoặc Sửa) ───────────────────────────
document.getElementById("btnSave").addEventListener("click", () => {
  const name          = inputName.value.trim();
  const img           = inputImg.value.trim();
  const price         = parseFloat(inputPrice.value);
  let originalPrice   = parseFloat(inputOriginalPrice.value);

  if (!name) { showToast("⚠️ Vui lòng nhập tên sản phẩm!"); return; }
  if (!img)  { showToast("⚠️ Vui lòng nhập URL hình ảnh!"); return; }
  if (isNaN(price) || price < 0) { showToast("⚠️ Giá sau giảm không hợp lệ!"); return; }
  
  if (isNaN(originalPrice) || originalPrice < price) {
    originalPrice = price;
  }

  const idx = parseInt(editIndex.value);

  if (idx === -1) {
    products.push({ name, img, originalPrice, price });
    showToast("✅ Đã thêm sản phẩm mới!");
  } else {
    products[idx] = { name, img, originalPrice, price };
    showToast("✅ Đã cập nhật sản phẩm!");
  }

  closeModal(modalOverlay);
  renderProducts();
});

// ─── Xác nhận xóa hàng loạt ─────────────────────────────────
btnOpenConfirmBulk.addEventListener("click", () => {
  const checkedBoxes = document.querySelectorAll(".product-checkbox:checked");
  if (checkedBoxes.length === 0) return;
  
  confirmText.textContent = `Bạn có chắc chắn muốn xóa ${checkedBoxes.length} sản phẩm đã chọn không? Hành động này không thể hoàn tác.`;
  openModal(confirmOverlay);
});

// Thực thi xóa hàng loạt khi ấn nút trên Modal Xác nhận
btnConfirmDelete.addEventListener("click", () => {
  const checkedBoxes = document.querySelectorAll(".product-checkbox:checked");
  
  // Sắp xếp các index cần xóa giảm dần để không làm lệch index mảng khi dùng splice
  const indexesToDelete = Array.from(checkedBoxes)
    .map(cb => parseInt(cb.getAttribute("data-index")))
    .sort((a, b) => b - a);

  indexesToDelete.forEach(idx => {
    products.splice(idx, 1);
  });

  showToast(`🗑 Đã xóa thành công ${checkedBoxes.length} sản phẩm!`);
  
  closeModal(confirmOverlay);
  renderProducts();
});

// ─── Đóng / Mở modal ─────────────────────────────────────────
function openModal(overlay)  { overlay.classList.add("active"); }
function closeModal(overlay) { overlay.classList.remove("active"); }

document.getElementById("btnCloseModal").addEventListener("click",   () => closeModal(modalOverlay));
document.getElementById("btnCancelModal").addEventListener("click",  () => closeModal(modalOverlay));
document.getElementById("btnCloseConfirm").addEventListener("click", () => closeModal(confirmOverlay));
document.getElementById("btnCancelConfirm").addEventListener("click",() => closeModal(confirmOverlay));

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal(modalOverlay);
});
confirmOverlay.addEventListener("click", (e) => {
  if (e.target === confirmOverlay) closeModal(confirmOverlay);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal(modalOverlay);
    closeModal(confirmOverlay);
  }
});

// ─── Toast thông báo ─────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ─── Khởi chạy ───────────────────────────────────────────────
renderProducts();
