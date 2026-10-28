// CHANGE THIS TO YOUR DESIRED YOUTUBE LINK
const YOUTUBE_TARGET_URL = "https://www.awqaf.gov.ae/quran/#p=1"; 

function router() {
    const hash = window.location.hash.slice(1) || 'home';
    const container = document.getElementById('app-container');

    const navBar = `
        <nav class="top-nav" style="text-align: center; padding: 15px 0; margin-bottom: 20px; border-bottom: 1px solid #eaeaea;">
            <a href="#home" style="margin-right: 15px; text-decoration: none; font-weight: bold; color: inherit;">Home</a>
            <span style="color: #ccc;">|</span>
            <a href="#action" style="margin-left: 15px; text-decoration: none; font-weight: bold; color: inherit;">Browse</a>
        </nav>
    `;

    if (hash === 'home' || hash === '' || hash === 'action') {
        if (hash === 'action') {
            // Instantly opens your YouTube link in a new tab and resets the hash back to home
            window.open(YOUTUBE_TARGET_URL, '_blank');
            window.location.hash = '#home';
            return;
        }

        document.title = "Ayah";
        
        container.innerHTML = `
            ${navBar}
            <div class="welcome-card">
                <h1>Welcome to Ayah</h1>
                <p>Ayah is on maintenance until confirmed 100% legitimate, meanwhile please use another quran provider. Awqaf is from the Government of the UAE and are trusted professionals.</p>
                <a href="#action" class="btn">Open Awqaf</a>
            </div>
        `;
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
