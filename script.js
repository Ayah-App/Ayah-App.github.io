const API_BASE = "https://api.alquran.cloud/v1/surah";
let surahCache = {};

function router() {
    const hash = window.location.hash.slice(1) || 'home';
    const container = document.getElementById('app-container');

    const navBar = `
        <nav class="top-nav" style="text-align: center; padding: 15px 0; margin-bottom: 20px; border-bottom: 1px solid #eaeaea;">
            <a href="#home" style="margin-right: 15px; text-decoration: none; font-weight: bold; color: inherit;">Home</a>
            <span style="color: #ccc;">|</span>
            <a href="#surahs" style="margin-left: 15px; text-decoration: none; font-weight: bold; color: inherit;">Surahs</a>
        </nav>
    `;

    if (hash === 'home' || hash === '') {
        document.title = "Ayah";
        
        container.innerHTML = `
            ${navBar}
            <div class="welcome-card">
                <h1>Welcome to Ayah</h1>
                <p>Explore the Holy Quran seamlessly with Ayah. A fast, ad-free single-page web app featuring all 114 Surahs, beautiful Arabic text, and Sahih International English translations.</p>
                <a href="#surahs" class="btn">Browse All Surahs</a>
            </div>
        `;
    } else if (hash === 'surahs') {
        document.title = "Ayah - Surah Index";
        renderSurahIndex(container, navBar);
    } else if (hash.startsWith('surah-')) {
        const surahId = parseInt(hash.split('-')[1], 10);
        renderSurahDetail(container, surahId, navBar);
    }
}

async function renderSurahIndex(container, navBar) {
    container.innerHTML = `${navBar}<div class="welcome-card"><h2>Loading Surah Index...</h2></div>`;

    try {
        const response = await fetch(API_BASE);
        const data = await response.json();
        const surahs = data.data;

        let html = `
            ${navBar}
            <div class="surah-view">
                <h2>Surah Index (1 - 114)</h2>
                <div class="surah-list-grid">`;
        
        surahs.forEach((surah) => {
            html += `
                <a href="#surah-${surah.number}" class="surah-card-link">
                    ${surah.number}. ${surah.englishName} <small>(${surah.name})</small>
                </a>`;
        });
        
        html += `</div></div>`;
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `${navBar}<div class="welcome-card"><h2>Failed to load Surahs. Check your internet connection.</h2></div>`;
    }
}

async function renderSurahDetail(container, surahId, navBar) {
    container.innerHTML = `${navBar}<div class="welcome-card"><h2>Loading Surah ${surahId}...</h2></div>`;

    try {
        if (!surahCache[surahId]) {
            const [arabicRes, translationRes] = await Promise.all([
                fetch(`https://api.alquran.cloud/v1/surah/${surahId}`),
                fetch(`https://api.alquran.cloud/v1/surah/${surahId}/en.sahih`)
            ]);

            const arabicData = await arabicRes.json();
            const translationData = await translationRes.json();

            let arabicAyahs = arabicData.data.ayahs;
            let transAyahs = translationData.data.ayahs;

            let showBismillahBanner = false;

            // Al-Fatihah (1) includes Bismillah as Ayah 1 natively.
            // At-Tawbah (9) has no Bismillah at all.
            // For all other Surahs, the API provides the standalone Bismillah as index 0.
            // We pull it out for our header banner and leave index 1 onwards as Verse 1, 2, 3...
            if (surahId !== 1 && surahId !== 9) {
                if (arabicAyahs.length > 0 && arabicAyahs[0].text.includes("بِسْمِ")) {
                    showBismillahBanner = true;
                    arabicAyahs = arabicAyahs.slice(1);
                    transAyahs = transAyahs.slice(1);
                }
            }

            surahCache[surahId] = {
                number: arabicData.data.number,
                englishName: arabicData.data.englishName,
                name: arabicData.data.name,
                showBismillah: showBismillahBanner,
                ayahs: arabicAyahs.map((ayah, index) => ({
                    numberInSurah: ayah.numberInSurah,
                    arabic: ayah.text,
                    translation: transAyahs[index] ? transAyahs[index].text : ""
                }))
            };
        }

        const surah = surahCache[surahId];
        if (!surah) throw new Error("Surah data not found");

        document.title = `Ayah - ${surah.number}. ${surah.englishName}`;

        let html = `
            ${navBar}
            <div class="surah-view">
                <div class="surah-header-title">
                    <h2>${surah.number}. ${surah.englishName} (${surah.name})</h2>
                </div>`;

        // Render standalone Bismillah banner if active
        if (surah.showBismillah) {
            html += `
                <div class="ayah-row" style="text-align: center; background: rgba(0,0,0,0.02); padding: 20px; margin-bottom: 20px; border-radius: 8px;">
                    <div class="arabic-container" style="font-size: 1.8rem; margin-bottom: 10px; font-family: 'Amiri', serif;">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                    <div class="translation-container" style="color: #666; font-style: italic;">
                        In the name of Allah, the Entirely Merciful, the Especially Merciful.
                    </div>
                </div>
            `;
        }

        html += `<div class="ayahs-container">`;

        surah.ayahs.forEach((ayah) => {
            html += `
                <div class="ayah-row">
                    <div class="ayah-top-bar">
                        <span>${surah.number}:${ayah.numberInSurah}</span>
                    </div>
                    <div class="arabic-container">
                        ${ayah.arabic} <span class="ayah-number-badge">۝${ayah.numberInSurah}</span>
                    </div>
                    <div class="translation-container">
                        ${ayah.translation}
                    </div>
                </div>
            `;
        });

        html += `</div>
                <br>
                <a href="#surahs" class="btn">Back to Surahs</a>
            </div>`;
        container.innerHTML = html;

    } catch (error) {
        console.error("Render error:", error);
        surahCache[surahId] = null;
        container.innerHTML = `${navBar}<div class="welcome-card"><h2>Failed to load Surah verses. Please try again.</h2></div>`;
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
