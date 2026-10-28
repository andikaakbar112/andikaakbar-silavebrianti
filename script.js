// =========================================
// MAS & DEDE BOCIL
// SCRIPT.JS
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // 1. FILTER GALERI
    // =====================================

    const filterButtons = document.querySelectorAll(".filter");
    const memoryCards = document.querySelectorAll(".memory-card");

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const category = button.dataset.category;

            // Tombol aktif
            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            // Filter foto
            memoryCards.forEach(card => {

                const cardCategory =
                    card.dataset.category;

                if (
                    category === "Semua" ||
                    cardCategory === category
                ) {
                    card.style.display = "block";

                    setTimeout(() => {
                        card.classList.add("show");
                    }, 20);

                } else {
                    card.classList.remove("show");
                    card.style.display = "none";
                }

            });

        });

    });


    // =====================================
    // 2. KLIK FOTO → PESAN HANGAT
    // =====================================

    memoryCards.forEach(card => {

        card.addEventListener("click", event => {

            // Jangan melakukan apa-apa kalau klik elemen
            // yang memang merupakan tombol/link
            if (
                event.target.tagName === "BUTTON" ||
                event.target.tagName === "A"
            ) {
                return;
            }

            card.classList.toggle("show-note");

        });

    });


    // =====================================
    // 3. ANIMASI FOTO SAAT SCROLL
    // =====================================

    const cards = document.querySelectorAll(
        ".memory-card"
    );

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "scroll-visible"
                    );

                    observer.unobserve(
                        entry.target
                    );

                }

            });

        },
        {
            threshold: 0.15
        }
    );

    cards.forEach(card => {
        observer.observe(card);
    });


    // =====================================
    // 4. TOMBOL ADMIN
    // =====================================

    const openLogin =
        document.getElementById("open-login");

    const loginModal =
        document.getElementById("login-modal");

    const adminModal =
        document.getElementById("admin-modal");

    if (openLogin && loginModal) {

        openLogin.addEventListener("click", () => {

            loginModal.classList.remove("hidden");

        });

    }


    // =====================================
    // 5. TUTUP MODAL
    // =====================================

    const closeButtons =
        document.querySelectorAll(".modal-close");

    closeButtons.forEach(button => {

        button.addEventListener("click", () => {

            const modalId =
                button.dataset.close;

            const modal =
                document.getElementById(modalId);

            if (modal) {
                modal.classList.add("hidden");
            }

        });

    });


    // =====================================
    // 6. TUTUP MODAL KETIKA KLIK LUAR
    // =====================================

    document.querySelectorAll(".modal").forEach(modal => {

        modal.addEventListener("click", event => {

            if (event.target === modal) {

                modal.classList.add("hidden");

            }

        });

    });


    // =====================================
    // 7. TUTUP DENGAN ESC
    // =====================================

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            document.querySelectorAll(".modal")
                .forEach(modal => {

                    modal.classList.add("hidden");

                });

        }

    });


    // =====================================
    // 8. PREVIEW FOTO SAAT UPLOAD
    // =====================================

    const photoFile =
        document.getElementById("photo-file");

    const imagePreview =
        document.getElementById("image-preview");

    if (photoFile && imagePreview) {

        photoFile.addEventListener("change", () => {

            const file =
                photoFile.files[0];

            if (!file) {
                imagePreview.classList.add("hidden");
                return;
            }

            const imageURL =
                URL.createObjectURL(file);

            imagePreview.src = imageURL;

            imagePreview.classList.remove(
                "hidden"
            );

        });

    }


    // =====================================
    // 9. DETAIL FOTO
    // =====================================

    const detailImage =
        document.getElementById("detail-image");

    const detailTitle =
        document.getElementById("detail-title");

    const detailDate =
        document.getElementById("detail-date");

    const detailCaption =
        document.getElementById("detail-caption");

    const photoModal =
        document.getElementById("photo-modal");


    memoryCards.forEach(card => {

        const image =
            card.querySelector("img");

        if (!image) return;

        image.addEventListener("dblclick", event => {

            event.stopPropagation();

            if (!photoModal) return;

            if (detailImage) {
                detailImage.src = image.src;
            }

            const title =
                card.querySelector("h3");

            const date =
                card.querySelector(".memory-date");

            const note =
                card.querySelector(".memory-note");


            if (detailTitle && title) {
                detailTitle.textContent =
                    title.textContent;
            }

            if (detailDate && date) {
                detailDate.textContent =
                    date.textContent;
            }

            if (detailCaption && note) {
                detailCaption.textContent =
                    note.textContent;
            }

            photoModal.classList.remove(
                "hidden"
            );

        });

    });


    // =====================================
    // 10. TOMBOL LOGOUT
    // =====================================

    const logoutButton =
        document.getElementById("logout-button");

    if (logoutButton) {

        logoutButton.addEventListener("click", () => {

            if (adminModal) {
                adminModal.classList.add(
                    "hidden"
                );
            }

            alert("Kamu sudah keluar dari Admin ♡");

        });

    }


    // =====================================
    // 11. EFEK KLIK HATI
    // =====================================

    memoryCards.forEach(card => {

        card.addEventListener("click", event => {

            const heart =
                document.createElement("span");

            heart.textContent = "♡";

            heart.className =
                "click-heart";

            heart.style.left =
                event.clientX + "px";

            heart.style.top =
                event.clientY + "px";

            document.body.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 900);

        });

    });


    // =====================================
    // 12. TOMBOL KEMBALI KE ATAS
    // =====================================

    let backToTop =
        document.querySelector(".back-to-top");

    if (!backToTop) {

        backToTop =
            document.createElement("button");

        backToTop.className =
            "back-to-top";

        backToTop.innerHTML = "↑";

        document.body.appendChild(
            backToTop
        );

    }

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            backToTop.classList.add("show");

        } else {

            backToTop.classList.remove("show");

        }

    });

    backToTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });


    // =====================================
    // SELESAI
    // =====================================

    console.log(
        "♡ Web Andika Akbar & Sila Vebrianti aktif ♡"
    );

});