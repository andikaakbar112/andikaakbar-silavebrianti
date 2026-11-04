document.addEventListener("DOMContentLoaded", async () => {

    // =====================================
    // 1. KONFIGURASI SUPABASE
    // =====================================
  
    const SUPABASE_URL = "https://aaihvahqkzgnuamhsukw.supabase.co";
  
    // GANTI TEKS DI BAWAH DENGAN SB_PUBLISHABLE KEY MILIKMU
    const SUPABASE_ANON_KEY = "sb_publishable_JaRHBxY1_vlkqGkP67ZjVQ_3qVFgBcX";
  
    const ADMIN_EMAILS = [
      "andikaakbar213@gmail.com",
      "silavebrianti27@gmail.com"
    ];
  
    const BUCKET_NAME = "Kenangan";
    const TABLE_NAME = "photos";
  
    // =====================================
    // 2. ELEMEN HTML
    // =====================================
  
    const $ = (id) => document.getElementById(id);
  
    const gallery = $("gallery");
    const galleryStatus = $("gallery-status");
  
    const loginModal = $("login-modal");
    const adminModal = $("admin-modal");
    const photoModal = $("photo-modal");
 // =====================================
// 3. PERIKSA SUPABASE
// =====================================

if (!window.supabase) {
  if (galleryStatus) {
      galleryStatus.textContent =
          "Library Supabase gagal dimuat. Periksa koneksi internet.";
  }

  console.error("Supabase library tidak ditemukan.");
  return;
}

if (
  !SUPABASE_URL.startsWith("https://aaihvahqkzgnuamhsukw.supabase.co") ||
  !SUPABASE_ANON_KEY.startsWith("sb_publishable_JaRHBxY1_vlkqGkP67ZjVQ_3qVFgBcX")
) {
  if (galleryStatus) {
      galleryStatus.textContent =
          "Periksa Project URL dan Publishable Key Supabase.";
  }

  console.error("Konfigurasi Supabase belum benar.");
  return;
}
  
    const db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
      
      console.log("Supabase berhasil diinisialisasi.");
      console.log("Project URL:", SUPABASE_URL);
  
    let currentUser = null;
    let photos = [];
    let selectedPhoto = null;
    let activeCategory = "Semua";
  
    // =====================================
    // 4. FUNGSI BANTU
    // =====================================
  
    const show = (element) => {
      element?.classList.remove("hidden");
    };
  
    const hide = (element) => {
      element?.classList.add("hidden");
    };
  
    const setStatus = (id, message, isError = false) => {
      const element = $(id);
  
      if (element) {
        element.textContent = message;
        element.style.color = isError ? "#b23b52" : "";
      }
    };
  
    const escapeHTML = (value = "") => {
      return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char]));
    };
  
    const formatDate = (date) => {
      if (!date) return "Tanggal tidak tersedia";
  
      return new Date(`${date}T00:00:00`).toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      );
    };
  
    const isAdmin = () => {
      return currentUser &&
        ADMIN_EMAILS.includes(currentUser.email?.toLowerCase());
    };
  
    // =====================================
    // 5. MEMUAT FOTO
    // =====================================
  
    async function loadPhotos() {
      if (!gallery || !galleryStatus) return;
  
      galleryStatus.textContent = "Memuat kenangan...";
  
      const { data, error } = await db
        .from(TABLE_NAME)
        .select("*")
        .order("photo_date", {
          ascending: false,
          nullsFirst: false
        })
        .order("created_at", {
          ascending: false
        });
  
      if (error) {
        console.error(error);
  
        galleryStatus.textContent =
          "Galeri belum bisa dimuat. Periksa koneksi dan izin SELECT Supabase.";
  
        gallery.innerHTML = `
          <div class="empty-state">
            Foto belum dapat ditampilkan. Coba muat ulang halaman.
          </div>
        `;
  
        return;
      }
  
      photos = data || [];
  
      renderGallery();
    }
  
    // =====================================
    // 6. MENAMPILKAN GALERI
    // =====================================
  
    function renderGallery() {
      const visiblePhotos = photos.filter((photo) => {
        return activeCategory === "Semua" ||
          photo.category === activeCategory;
      });
  
      gallery.innerHTML = "";
  
      galleryStatus.textContent =
        `${visiblePhotos.length} kenangan`;
  
      if (!visiblePhotos.length) {
        gallery.innerHTML = `
          <div class="empty-state">
            ${
              photos.length
                ? "Belum ada foto dalam kategori ini."
                : "Belum ada foto. Login admin untuk menambahkan kenangan pertama."
            }
          </div>
        `;
  
        return;
      }
  
      visiblePhotos.forEach((photo) => {
        const { data } = db.storage
          .from(BUCKET_NAME)
          .getPublicUrl(photo.image_path);
  
        const card = document.createElement("article");
  
        card.className = "photo-card";
        card.tabIndex = 0;
  
        card.innerHTML = `
          <img
            src="${escapeHTML(data.publicUrl)}"
            alt="${escapeHTML(photo.title)}"
            loading="lazy"
          >
  
          <div class="photo-info">
            <h3>${escapeHTML(photo.title)}</h3>
  
            <p>${escapeHTML(formatDate(photo.photo_date))}</p>
  
            <span class="photo-category">
              ${escapeHTML(photo.category || "Kenangan")}
            </span>
          </div>
        `;
  
        card.addEventListener("click", () => {
          openPhoto(photo);
        });
  
        card.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPhoto(photo);
          }
        });
  
        gallery.appendChild(card);
      });
    }
  
    // =====================================
    // 7. DETAIL FOTO
    // =====================================
  
    function openPhoto(photo) {
      selectedPhoto = photo;
  
      const { data } = db.storage
        .from(BUCKET_NAME)
        .getPublicUrl(photo.image_path);
  
      $("detail-image").src = data.publicUrl;
      $("detail-title").textContent = photo.title || "";
      $("detail-date").textContent = formatDate(photo.photo_date);
  
      $("detail-caption").textContent =
        photo.description || "Tidak ada cerita untuk foto ini.";
  
      if (isAdmin()) {
        show($("delete-photo"));
      } else {
        hide($("delete-photo"));
      }
  
      show(photoModal);
    }
  
    // =====================================
    // 8. TOMBOL LOGIN ADMIN
    // =====================================
  
    $("open-login")?.addEventListener("click", () => {
      setStatus("login-status", "");
      show(loginModal);
    });
  
    // =====================================
    // 9. TUTUP MODAL
    // =====================================
  
    document.querySelectorAll("[data-close]").forEach((button) => {
      button.addEventListener("click", () => {
        hide($(button.dataset.close));
      });
    });
  
    [loginModal, adminModal, photoModal].forEach((modal) => {
      modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
          hide(modal);
        }
      });
    });
  
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        [loginModal, adminModal, photoModal].forEach(hide);
      }
    });
  
    // =====================================
    // 10. FILTER KATEGORI
    // =====================================
  
    document.querySelectorAll(".filter").forEach((button) => {
      button.addEventListener("click", () => {
  
        document.querySelectorAll(".filter").forEach((item) => {
          item.classList.remove("active");
        });
  
        button.classList.add("active");
  
        activeCategory =
          button.dataset.category || "Semua";
  
        renderGallery();
      });
    });
  
    // =====================================
    // 11. LOGIN SUPABASE
    // =====================================
  
    $("login-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      setStatus("login-status", "Memeriksa akun...");
  
      const email = $("admin-email").value.trim().toLowerCase();
      const password = $("admin-password").value;
  
      if (!ADMIN_EMAILS.includes(email)) {
        setStatus(
          "login-status",
          "Email ini tidak terdaftar sebagai admin.",
          true
        );
  
        return;
      }
  
      const { data, error } = await db.auth.signInWithPassword({
        email,
        password
      });
  
      if (error) {
        setStatus("login-status", error.message, true);
        return;
      }
  
      currentUser = data.user;
  
      hide(loginModal);
      show(adminModal);
  
      $("login-form").reset();
  
      await loadPhotos();
    });
  
    // =====================================
    // 12. LOGOUT ADMIN
    // =====================================
  
    $("logout-button")?.addEventListener("click", async () => {
      const { error } = await db.auth.signOut();
  
      if (error) {
        setStatus("upload-status", error.message, true);
        return;
      }
  
      currentUser = null;
  
      hide(adminModal);
      hide(photoModal);
  
      renderGallery();
    });
  
    // =====================================
    // 13. PREVIEW FOTO
    // =====================================
  
    $("photo-file")?.addEventListener("change", () => {
      const file = $("photo-file").files?.[0];
      const preview = $("image-preview");
  
      if (!file) {
        preview.removeAttribute("src");
        hide(preview);
        return;
      }
  
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      ) {
        setStatus(
          "upload-status",
          "Gunakan JPG, PNG, atau WebP.",
          true
        );
  
        $("photo-file").value = "";
        hide(preview);
  
        return;
      }
  
      if (file.size > 8 * 1024 * 1024) {
        setStatus(
          "upload-status",
          "Ukuran foto maksimal 8 MB.",
          true
        );
  
        $("photo-file").value = "";
        hide(preview);
  
        return;
      }
  
      preview.src = URL.createObjectURL(file);
  
      show(preview);
  
      setStatus("upload-status", "");
    });
  
    // =====================================
    // 14. UPLOAD FOTO
    // =====================================
  
    $("upload-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      if (!isAdmin()) {
        setStatus(
          "upload-status",
          "Silakan login menggunakan akun admin.",
          true
        );
  
        return;
      }
  
      const file = $("photo-file").files?.[0];
  
      if (!file) {
        setStatus(
          "upload-status",
          "Pilih foto terlebih dahulu.",
          true
        );
  
        return;
      }
  
      const button = $("upload-button");
  
      button.disabled = true;
      button.textContent = "Mengunggah...";
  
      setStatus("upload-status", "Sedang mengunggah foto...");
  
      const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "-");
  
      const imagePath = `${Date.now()}-${safeName}`;
  
      const uploadResult = await db.storage
        .from(BUCKET_NAME)
        .upload(imagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        });
  
      if (uploadResult.error) {
        setStatus(
          "upload-status",
          uploadResult.error.message,
          true
        );
  
        button.disabled = false;
        button.textContent = "Upload Foto";
  
        return;
      }
  
      const insertResult = await db
        .from(TABLE_NAME)
        .insert({
          title: $("photo-title").value.trim(),
          description: $("photo-caption").value.trim() || null,
          image_path: imagePath,
          category: $("photo-category").value,
          photo_date: $("photo-date").value,
          created_by: currentUser.id
        });
  
      if (insertResult.error) {
        await db.storage
          .from(BUCKET_NAME)
          .remove([imagePath]);
  
        setStatus(
          "upload-status",
          insertResult.error.message,
          true
        );
  
      } else {
        $("upload-form").reset();
  
        hide($("image-preview"));
  
        setStatus(
          "upload-status",
          "Foto berhasil ditambahkan."
        );
  
        await loadPhotos();
      }
  
      button.disabled = false;
      button.textContent = "Upload Foto";
    });
  
    // =====================================
    // 15. HAPUS FOTO
    // =====================================
  
    $("delete-photo")?.addEventListener("click", async () => {
      if (!isAdmin() || !selectedPhoto) return;
  
      if (!confirm("Yakin ingin menghapus foto ini?")) {
        return;
      }
  
      const button = $("delete-photo");
  
      button.disabled = true;
  
      const storageResult = await db.storage
        .from(BUCKET_NAME)
        .remove([selectedPhoto.image_path]);
  
      if (storageResult.error) {
        setStatus(
          "upload-status",
          storageResult.error.message,
          true
        );
  
        button.disabled = false;
        return;
      }
  
      const rowResult = await db
        .from(TABLE_NAME)
        .delete()
        .eq("id", selectedPhoto.id);
  
      if (rowResult.error) {
        setStatus(
          "upload-status",
          rowResult.error.message,
          true
        );
  
        button.disabled = false;
        return;
      }
  
      selectedPhoto = null;
  
      hide(photoModal);
  
      button.disabled = false;
  
      await loadPhotos();
    });
  
    // =====================================
    // 16. CEK SESSION LOGIN
    // =====================================
  
    const { data: sessionData } = await db.auth.getSession();
  
    currentUser = sessionData.session?.user || null;
  
    if (currentUser && !isAdmin()) {
      await db.auth.signOut();
      currentUser = null;
    }
  
    // =====================================
    // 17. TAMPILKAN GALERI
    // =====================================
  
    await loadPhotos();
  
  });