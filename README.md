[readme.md](https://github.com/user-attachments/files/27701303/readme.md)
Steam Float Pro V1.4
Steam Float Pro is a high-performance browser extension (Userscript) designed to enhance the Steam Community Market experience for CS2 players and traders. It provides real-time access to item Float Values, Paint Seeds, and advanced filtering tools directly on the market listing page.

📥 Install
You can download the extension from the Chrome Web Store:
[**Chrome Web Store - Steam Float Pro**](https://chromewebstore.google.com/detail/steam-float-pro/nliogofnagangpihfdoafgbkkjhkmeml?authuser=0&hl=tr)

Key Features
📊 Instant Float Visualization: View precise float values (up to 14 decimal places) and a color-coded wear bar directly under every item name.

🎯 Pattern Identification: Displays the Paint Seed (Pattern ID) for each listing without needing to inspect the item in-game.

⚡ Smart Sorting: One-click buttons to sort the current page by Lowest Float or Highest Float instantly.

🎨 Dynamic Highlighting: Create custom filters (e.g., float < 0.01) that automatically highlight matching items with a color and border of your choice.

🌍 Global & Local Filters: * Local: Apply filters specifically to the skin you are currently viewing.

Global: Set "Global" rules that apply across every weapon and skin on the Steam Market.

💾 Persistent Storage: All your custom filters and color preferences are saved locally in your browser.

🛠 How to Use
Adding a Filter
In the control panel, enter a condition in the input box using standard operators:

 < 0.005 (to find low-float items)

 > 0.15 (to find high-float items)

Select a highlight color using the color picker and click Add Filter.

Managing Filters
Global Toggle: Click the "Global" button on a filter to make it active across all market pages.

Edit Color: Change the highlight color of an existing filter on the fly.

Remove: Click the ✕ to delete a filter instantly.

Sorting
Use the "Sort: Low Float" or "Sort: High Float" buttons to reorganize the items currently loaded on your page.

📋 Technical Overview
Data Source: The script hooks into Steam's native g_rgListingInfo and g_rgAssets objects for zero-latency data retrieval.

UI Injection: Dynamically builds a management panel (#ultimate-csfloat-panel) using clean, modern CSS-in-JS.

Multi-Language: Supports an isolated translation system to adapt the UI to different languages.

Disclaimer
Official Link: This plugin is not affiliated with, endorsed by, or developed by Valve Corporation or Steam in any way.

Risk of Use: This tool is provided solely for visualizing market data. All responsibility regarding its use rests with the user.

Steam Terms: The script reads existing data from the Steam Community Market; however, the use of third-party tools should always be considered within the framework of Steam's terms of service.
