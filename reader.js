document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DEKLARASI ELEMEN & VARIABEL ---
    const contentArea = document.getElementById('content-area');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressIndicator = document.getElementById('progress-indicator');
    const tocBtn = document.getElementById('toc-btn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const tocNav = document.getElementById('toc-nav');
    
    // Elemen Pengaturan (sudah disederhanakan)
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOverlay = document.getElementById('settings-panel-overlay');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const fontDecreaseBtn = document.getElementById('font-decrease-btn');
    const fontIncreaseBtn = document.getElementById('font-increase-btn');
    const fontSizeDisplay = document.getElementById('font-size-display');

    const spine = [
        'cover1.xhtml', 'cover2.xhtml', 'main.xhtml', 'mesopotamia.xhtml',
        'katabasis.xhtml', 'diyu.xhtml', 'mediumship.xhtml', 'jiwa.xhtml',
        'penyihir-endor.xhtml', 'closing_image.xhtml'
    ];

    const tocData = [
        { href: "cover1.xhtml", text: "Cover" }, { href: "cover2.xhtml", text: "Quote" },
        { href: "main.xhtml", text: "Konten" }, { href: "mesopotamia.xhtml", text: "MESOPOTAMIA" },
        { href: "katabasis.xhtml", text: "KATABASIS" }, { href: "diyu.xhtml", text: "DIYU 地獄" },
        { href: "mediumship.xhtml", text: "MEDIUMSHIP" }, { href: "jiwa.xhtml", text: "JIWA" },
        { href: "penyihir-endor.xhtml", text: "PENYIHIR ENDOR" }, { href: "closing_image.xhtml", text: "End Cover" }
    ];

    let currentIndex = 0;
    
    // Variabel untuk pengaturan font size
    let currentFontSize = 1.0; // dalam 'em'
    const FONT_SIZE_STEP = 0.1;
    const MIN_FONT_SIZE = 0.7;
    const MAX_FONT_SIZE = 1.5;

    // --- 2. FUNGSI-FUNGSI INTI ---

    async function loadContent(index) {
        if (index < 0 || index >= spine.length) return;
        currentIndex = index;
        const file = spine[currentIndex];
        contentArea.innerHTML = '<div class="loader">⏳Memuat konten...</div>';

        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Gagal memuat ${file}: ${response.statusText}`);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'application/xhtml+xml');
            const bodyContent = doc.querySelector('body').innerHTML;
            contentArea.innerHTML = bodyContent;
            document.getElementById('main-content').scrollTop = 0;
            updateUI();
        } catch (error) {
            console.error("Error saat memuat konten:", error);
            contentArea.innerHTML = `<div class="loader" style="color: red;">Gagal memuat file: ${file}.</div>`;
        }
    }
    
    function updateUI() {
        progressIndicator.textContent = `${currentIndex + 1} / ${spine.length}`;
        prevBtn.disabled = (currentIndex === 0);
        nextBtn.disabled = (currentIndex === spine.length - 1);
        updateActiveTocLink();
    }

    function populateTOC() {
        const ol = document.createElement('ol');
        tocData.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.innerHTML = item.text;
            a.dataset.href = item.href;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const targetIndex = spine.indexOf(e.target.dataset.href);
                if (targetIndex !== -1) {
                    loadContent(targetIndex);
                    sidebar.classList.remove('open');
                }
            });
            li.appendChild(a);
            ol.appendChild(li);
        });
        tocNav.appendChild(ol);
    }
    
    function updateActiveTocLink() {
        const currentFile = spine[currentIndex];
        const links = tocNav.querySelectorAll('a');
        links.forEach(link => {
            link.classList.toggle('active', link.dataset.href === currentFile);
        });
    }

    // --- 3. FUNGSI PENGATURAN (Sederhana) ---

    function applyFontSize() {
        contentArea.style.setProperty('--current-font-size', `${currentFontSize}em`);
        fontSizeDisplay.textContent = `${Math.round(currentFontSize * 100)}%`;
        fontDecreaseBtn.disabled = currentFontSize <= MIN_FONT_SIZE;
        fontIncreaseBtn.disabled = currentFontSize >= MAX_FONT_SIZE;
        localStorage.setItem('ebook_font_size', currentFontSize);
    }
    
    function initSettings() {
        // Muat ukuran font dari localStorage atau set default
        const savedSize = parseFloat(localStorage.getItem('ebook_font_size'));
        currentFontSize = isNaN(savedSize) ? 1.0 : savedSize;
        applyFontSize();
    }

    // --- 4. EVENT LISTENERS ---

    if (nextBtn) nextBtn.addEventListener('click', () => loadContent(currentIndex + 1));
    if (prevBtn) prevBtn.addEventListener('click', () => loadContent(currentIndex - 1));
    if (tocBtn && sidebar) tocBtn.addEventListener('click', () => sidebar.classList.add('open'));
    if (closeSidebarBtn && sidebar) closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('open'));
    document.addEventListener('click', (e) => {
        if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== tocBtn) {
            sidebar.classList.remove('open');
        }
    });

    // Event Listener Pengaturan
    if (settingsBtn && settingsOverlay) settingsBtn.addEventListener('click', () => settingsOverlay.classList.add('visible'));
    if (closeSettingsBtn && settingsOverlay) closeSettingsBtn.addEventListener('click', () => settingsOverlay.classList.remove('visible'));
    if (settingsOverlay) settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) {
            settingsOverlay.classList.remove('visible');
        }
    });

    if (fontIncreaseBtn) fontIncreaseBtn.addEventListener('click', () => {
        if (currentFontSize < MAX_FONT_SIZE) {
            currentFontSize = parseFloat((currentFontSize + FONT_SIZE_STEP).toFixed(2));
            applyFontSize();
        }
    });

    if (fontDecreaseBtn) fontDecreaseBtn.addEventListener('click', () => {
        if (currentFontSize > MIN_FONT_SIZE) {
            currentFontSize = parseFloat((currentFontSize - FONT_SIZE_STEP).toFixed(2));
            applyFontSize();
        }
    });

    // --- 5. INISIALISASI ---
    populateTOC();
    initSettings(); // Panggil fungsi inisialisasi pengaturan
    loadContent(0);
});