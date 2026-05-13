window.addEventListener('message', (event) => {
    if (event.data.type === 'STEAM_FLOAT_TRANSLATIONS') {
        console.log('MAIN: Çeviriler alındı', event.data.translations);
        translations = event.data.translations;
        injectPanel(); // paneli hemen oluştur
    }
});
(function() {
    'use strict';

    // Çevirileri isolated'dan al
    let translations = {};
    window.addEventListener('message', (event) => {
        if (event.data.type === 'STEAM_FLOAT_TRANSLATIONS') {
            translations = event.data.translations;
            // Çeviriler geldikten sonra paneli oluştur
            injectPanel();
        }
    });

    const APP_KEY = 'steam_float_filters_v3';
    const CURRENT_SKIN = decodeURIComponent(window.location.pathname.split('/').pop());

    // --- Yerel depolama ---
    function getFilters() {
        try {
            const data = localStorage.getItem(APP_KEY);
            return data ? JSON.parse(data) : { global: [], local: {} };
        } catch (e) {
            return { global: [], local: {} };
        }
    }

    function saveFilters(filters) {
        localStorage.setItem(APP_KEY, JSON.stringify(filters));
        renderActiveFilters();
        injectFloatValuesAndHighlight();
    }

    // --- Float + Paint Seed gösterimi ve renklendirme ---
    function injectFloatValuesAndHighlight() {
        if (typeof g_rgListingInfo === 'undefined' || typeof g_rgAssets === 'undefined') return;

        const allFilters = getFilters();
        const activeFilters = [...allFilters.global, ...(allFilters.local[CURRENT_SKIN] || [])];

        for (let listingId in g_rgListingInfo) {
            const listing = g_rgListingInfo[listingId];
            const row = document.getElementById('listing_' + listingId);
            if (!row) continue;

            const assetId = listing.asset.id;
            const asset = g_rgAssets?.["730"]?.["2"]?.[assetId];
            if (!asset || !asset.asset_properties) continue;

            const floatProp = asset.asset_properties.find(p => p.propertyid === 2);
            const paintSeedProp = asset.asset_properties.find(p => p.propertyid === 1);
            if (!floatProp) continue;

            const floatValue = parseFloat(floatProp.float_value);
            const paintSeed = paintSeedProp ? paintSeedProp.int_value : "---";

            // Float/Paint Seed gösterimi (resimdeki gibi)
            const nameColumn = row.querySelector('.market_listing_item_name_block');
            if (nameColumn && !row.querySelector('.steam-native-float-wrap')) {
                const wrap = document.createElement('div');
                wrap.className = 'steam-native-float-wrap';
                const progressPos = floatValue * 100;
                wrap.style.cssText = `margin-top:4px; font-family:Arial,sans-serif; color:#8f98a0; font-size:12px; line-height:1.4;`;
                wrap.innerHTML = `
                    <div style="position:relative; width:120px; height:5px; background:linear-gradient(to right, #4caf50 0%, #4caf50 7%, #8bc34a 7%, #8bc34a 15%, #cddc39 15%, #cddc39 38%, #ff9800 38%, #ff9800 45%, #f44336 45%, #f44336 100%); border-radius:2px; margin-bottom:4px; border:1px solid rgba(0,0,0,0.3);">
                        <div style="position:absolute; left:${progressPos}%; top:-3px; width:3px; height:9px; background:#fff; border-radius:1px; box-shadow:0 0 2px #000;"></div>
                    </div>
                    <div>
                        <span>Float: <span style="color:#fff;">${floatValue.toFixed(14)}</span></span><br>
                        <span>Paint Seed: <span style="color:#fff;">${paintSeed}</span></span>
                    </div>
                `;
                nameColumn.appendChild(wrap);
            }

            // Filtre kontrolü ve renklendirme
            let matchedColor = null;
            for (const filter of activeFilters) {
                let isMatch = false;
                if (filter.op === '<') isMatch = floatValue < filter.val;
                else if (filter.op === '>') isMatch = floatValue > filter.val;
                else if (filter.op === '<=') isMatch = floatValue <= filter.val;
                else if (filter.op === '>=') isMatch = floatValue >= filter.val;
                if (isMatch) { matchedColor = filter.color; break; }
            }

            if (matchedColor) {
                row.style.setProperty('background-color', `${matchedColor}44`, 'important');
                row.style.setProperty('border-left', `5px solid ${matchedColor}`, 'important');
            } else {
                row.style.setProperty('background-color', '', 'important');
                row.style.setProperty('border-left', 'none', 'important');
            }
        }
    }

    // --- Sıralama ---
    function sortListings(asc = true) {
        const container = document.querySelector('#searchResultsRows');
        if (!container) return;
        const rows = Array.from(container.querySelectorAll('.market_listing_row.market_recent_listing_row'));

        rows.sort((a, b) => {
            const idA = a.id.replace('listing_', '');
            const idB = b.id.replace('listing_', '');
            let floatA = asc ? 1 : 0;
            let floatB = asc ? 1 : 0;

            try {
                if (g_rgListingInfo?.[idA] && g_rgAssets?.["730"]?.["2"]?.[g_rgListingInfo[idA].asset.id]) {
                    const prop = g_rgAssets["730"]["2"][g_rgListingInfo[idA].asset.id].asset_properties?.find(p => p.propertyid === 2);
                    if (prop) floatA = parseFloat(prop.float_value);
                }
                if (g_rgListingInfo?.[idB] && g_rgAssets?.["730"]?.["2"]?.[g_rgListingInfo[idB].asset.id]) {
                    const prop = g_rgAssets["730"]["2"][g_rgListingInfo[idB].asset.id].asset_properties?.find(p => p.propertyid === 2);
                    if (prop) floatB = parseFloat(prop.float_value);
                }
            } catch (e) {}

            return asc ? floatA - floatB : floatB - floatA;
        });

        rows.forEach(row => container.appendChild(row));
    }

    // --- Aktif filtreleri listele (UI) ---
    function renderActiveFilters() {
        const container = document.getElementById('active-filters-list');
        if (!container) return;
        const filters = getFilters();
        container.innerHTML = '';

        const createBar = (filter, isGlobal, index) => {
            const bar = document.createElement('div');
            bar.style.cssText = `
                display: flex; align-items: center; gap: 8px; background: #222;
                padding: 6px 10px; margin-top: 5px; border-radius: 4px; border: 1px solid #444;
                border-left: 4px solid ${filter.color};
            `;

            bar.innerHTML = `
                <input type="color" class="edit-color" value="${filter.color}" title="Rengi Değiştir" style="width:22px; height:22px; border:none; cursor:pointer; background:none; padding: 0;">
                <span style="color: #ccc; font-family: monospace; flex-grow: 1; font-size: 13px;">float ${filter.op} ${filter.val}</span>
                <button class="global-btn" style="background: ${isGlobal ? '#4c6b22' : '#333'}; color: white; border: 1px solid #555; padding: 4px 10px; border-radius: 2px; cursor: pointer; font-size: 11px;">${isGlobal ? translations.globalActive : translations.makeGlobal}</button>
                <button class="remove-btn" title="Sil" style="background: transparent; color: #a32d2d; border: none; cursor: pointer; font-size: 16px; font-weight: bold; padding: 0 5px;">✕</button>
            `;

            bar.querySelector('.edit-color').onchange = (e) => {
                const db = getFilters();
                if (isGlobal) db.global[index].color = e.target.value;
                else db.local[CURRENT_SKIN][index].color = e.target.value;
                saveFilters(db);
            };

            bar.querySelector('.global-btn').onclick = () => {
                const db = getFilters();
                const list = isGlobal ? db.global : db.local[CURRENT_SKIN];
                const item = list.splice(index, 1)[0];
                if (isGlobal) {
                    if (!db.local[CURRENT_SKIN]) db.local[CURRENT_SKIN] = [];
                    db.local[CURRENT_SKIN].push(item);
                } else {
                    db.global.push(item);
                }
                saveFilters(db);
            };

            bar.querySelector('.remove-btn').onclick = () => {
                const db = getFilters();
                if (isGlobal) db.global.splice(index, 1);
                else db.local[CURRENT_SKIN].splice(index, 1);
                saveFilters(db);
            };

            return bar;
        };

        filters.global.forEach((f, i) => container.appendChild(createBar(f, true, i)));
        (filters.local[CURRENT_SKIN] || []).forEach((f, i) => container.appendChild(createBar(f, false, i)));
    }

    // --- Panel ekle (çeviriler kullanılarak) ---
    function injectPanel() {
        if (document.getElementById('ultimate-csfloat-panel')) return;
        const target = document.querySelector('.market_listing_table');
        if (!target) return;

        const panel = document.createElement('div');
        panel.id = 'ultimate-csfloat-panel';
        panel.style.cssText = `background: #171a21; border: 1px solid #2a475e; padding: 15px; margin-bottom: 15px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);`;

        panel.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #2a475e;">
                <span style="color: #67c1f5; font-weight: bold; font-size: 13px; letter-spacing: 1px;">${translations.sortBy}</span>
                <button id="btn-sort-low" style="background: #4c6b22; color: white; border: none; padding: 6px 15px; border-radius: 2px; cursor: pointer; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${translations.sortLow}</button>
                <button id="btn-sort-high" style="background: #3a3a3a; color: white; border: none; padding: 6px 15px; border-radius: 2px; cursor: pointer; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${translations.sortHigh}</button>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="text" id="filter-input" placeholder="${translations.filterPlaceholder}"
                    style="flex-grow: 1; background: #000; border: 1px solid #333; color: #67c1f5; padding: 8px 10px; border-radius: 3px; font-family: monospace; font-size: 14px;">
                <input type="color" id="main-color" value="#4c6b22" title="Başlangıç Rengi" style="width:35px; height:35px; border:none; cursor:pointer; background:none; padding: 0;">
                <button id="btn-add" style="background: linear-gradient( to bottom, #75b022 5%, #588a1b 95%); color: #eee; border: none; padding: 8px 25px; border-radius: 2px; cursor: pointer; font-weight: bold; font-size: 13px;">${translations.addFilter}</button>
            </div>

            <div id="active-filters-list" style="margin-top: 10px;"></div>
        `;

        target.parentNode.insertBefore(panel, target);

        document.getElementById('btn-sort-low').onclick = () => sortListings(true);
        document.getElementById('btn-sort-high').onclick = () => sortListings(false);

        const handleAdd = () => {
            const val = document.getElementById('filter-input').value;
            const color = document.getElementById('main-color').value;
            const match = val.match(/(<|>|<=|>=)\s*([0-9.]+)/);

            if (match) {
                const db = getFilters();
                if (!db.local[CURRENT_SKIN]) db.local[CURRENT_SKIN] = [];
                db.local[CURRENT_SKIN].push({ op: match[1], val: parseFloat(match[2]), color: color });
                saveFilters(db);
                document.getElementById('filter-input').value = '';
            }
        };

        document.getElementById('btn-add').onclick = handleAdd;
        document.getElementById('filter-input').onkeypress = (e) => { if(e.key === 'Enter') handleAdd(); };

        renderActiveFilters();
    }

    // --- Sponsor butonu ---
    function injectSideAd() {
        if (document.getElementById('steam-float-side-ad')) return;
        const sideAd = document.createElement('div');
        sideAd.id = 'steam-float-side-ad';
        sideAd.style.cssText = `
            position: fixed;
            top: 80px;
            left: 20px;
            background: linear-gradient(135deg, #ff9a00 0%, #ff5a00 100%);
            color: #fff;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 25px;
            cursor: pointer;
            z-index: 999999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            transition: transform 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;
        sideAd.innerHTML = translations.sponsorText;
        sideAd.onclick = () => window.open('https://kendi-linkin.com', '_blank');
        sideAd.onmouseover = () => { sideAd.style.transform = "scale(1.05)"; };
        sideAd.onmouseout = () => { sideAd.style.transform = "scale(1)"; };
        document.body.appendChild(sideAd);
    }

    // --- Ana döngü (sürekli dene, ama çeviriler gelene kadar bekle) ---
    function safeInject() {
        if (!translations.sortBy) return; // çeviriler henüz gelmedi
        try { injectPanel(); } catch (e) { console.log('Panel hatası:', e); }
        try { injectFloatValuesAndHighlight(); } catch (e) { console.log('Float hatası:', e); }
        try { injectSideAd(); } catch (e) { console.log('Sponsor hatası:', e); }
    }

    setInterval(safeInject, 1000);
})();