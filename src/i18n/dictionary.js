/**
 * Traditional Chinese (zh-TW) interface strings.
 *
 * God's Eye View has no message-catalog layer: interface copy is written
 * directly into `src/ui/templates/*.html` and into the modules that render
 * rows, chips and status lines at runtime. Rewriting ~640 modules to pull from
 * a catalog would touch every surface the upstream project keeps changing, and
 * this fork merges upstream regularly.
 *
 * So the translation runs the other way round: the English source string IS the
 * key, and `src/i18n/domLocalizer.js` swaps rendered text in place. A string
 * absent from this table is left exactly as the application wrote it, which is
 * what keeps live data — callsigns, place names, coordinates, station names —
 * out of the translation path entirely.
 *
 * Keys are matched after whitespace collapsing (see `translationKey`), so the
 * line breaks and indentation in the HTML templates do not have to be
 * reproduced here.
 */

/** English interface copy mapped to its Traditional Chinese equivalent. */
export const ZH_TW = Object.freeze({
  // ── Branding and first run ──────────────────
  'NO PLACE LEFT BEHIND': '沒有任何角落被遺漏',
  'Initializing photorealistic world...': '正在初始化擬真世界…',
  'MISSION CONTROL · FIRST LAUNCH': '任務管制 · 首次啟動',
  'Choose your first view': '選擇你的第一個視角',
  'It feels like a forbidden cockpit—then you realize the sources are public and the data is real.':
    '它看起來像一個禁區駕駛艙——然後你發現這些來源全是公開的，而且資料是真的。',
  'LIVE CONTACTS': '即時接觸目標',
  'Aircraft, vessels and nearby intelligence': '航空器、船舶與周邊情資',
  'SPACE MISSIONS': '太空任務',
  'Launches, spacecraft and orbital context': '發射、太空船與軌道脈絡',
  ENVIRONMENTAL: '環境監測',
  'Live earthquakes and active fires, from USGS and NASA':
    '來自 USGS 與 NASA 的即時地震與活躍火點',
  'EXPLORE MANUALLY': '自由探索',
  'Begin with a clean globe': '從一顆乾淨的地球開始',
  "Don't show this again": '不要再顯示',
  'ESC to dismiss': '按 ESC 關閉',
  'Tip: the GEV MIC button in the dock lets you talk to the map.':
    '提示：控制列的 GEV MIC 按鈕可以讓你對著地圖說話。',

  // ── Top-center globe actions ────────────────
  'Globe actions': '地球操作',
  'Clear selected data layers': '清除已選取的資料圖層',
  'Turn off all selected data layers': '關閉所有已選取的資料圖層',
  'Copy share link': '複製分享連結',
  'Tilt map to oblique view': '將地圖傾斜為斜視角',
  'Toggle straight-down and tilted map views': '切換正俯視與傾斜視角',
  'Reset map to north up': '將地圖重設為正北朝上',
  'Reset map bearing to north': '將地圖方位重設為正北',
  'Reset to full globe view': '回到完整地球視角',
  'Reset camera and return to full globe view': '重設鏡頭並回到完整地球視角',
  'ACTIVE STYLE': '目前風格',
  'LOADING LIVE DATA': '正在載入即時資料',
  'syncing road network': '正在同步路網',
  'loading frames': '正在載入影格',
  'Visible map targets': '畫面中的地圖目標',

  // ── Visual presets / map source ─────────────
  'VISUAL PRESETS': '視覺預設',
  'Expand Visual Presets': '展開視覺預設',
  'Pin visual presets': '釘選視覺預設',
  'Keep visual presets open': '保持視覺預設展開',
  Normal: '一般',
  NORMAL: '一般',
  'Show the globe without a visual filter.': '不套用任何視覺濾鏡顯示地球。',
  'Emulate a green phosphor CRT with scanlines and screen curvature.':
    '模擬綠色映像管：帶掃描線與螢幕曲率。',
  'Simulate night-vision goggles with green intensification and a tube vignette.':
    '模擬夜視鏡：綠色增強與管狀暗角。',
  'Simulate FLIR-style thermal contrast. Turn up Ironbow for color.':
    '模擬 FLIR 熱影像對比。調高 Ironbow 可增加色彩。',
  Anime: '動畫',
  'Apply bright cel-shaded color and illustrated outlines.':
    '套用明亮的賽璐璐上色與插畫線條。',
  Noir: '黑色電影',
  'Apply high-contrast monochrome film-noir grading.':
    '套用高對比黑白的黑色電影調色。',
  Snow: '雪景',
  'Add a cold, snowy whiteout treatment to the scene.':
    '為場景加上冷冽的雪白處理。',
  'MAP SOURCE': '地圖來源',
  'Map source': '地圖來源',
  Style: '風格',

  // ── Location bar ────────────────────────────
  LOCATION: '位置',
  'Expand LOCATION': '展開位置',
  'Pin location tray': '釘選位置面板',
  'Keep location tray open': '保持位置面板展開',
  'Location: --': '位置：--',
  'Landmark: --': '地標：--',
  'Search any location': '搜尋任何地點',
  'Search any location...': '搜尋任何地點…',
  'Search location by name or coordinates': '以名稱或座標搜尋地點',

  // ── Display panel ───────────────────────────
  DISPLAY: '顯示',
  'Collapse panel': '收合面板',
  'Expand panel': '展開面板',
  'Intelligence HUD (H)': '情報抬頭顯示器（H）',
  'HUD layout': '抬頭顯示器版面',
  Layout: '版面',
  Tactical: '戰術',
  Operator: '操作員',
  Minimal: '極簡',
  'Detection Overlay (D)': '偵測疊層（D）',
  'Detection overlay': '偵測疊層',
  DETECT: '偵測',
  Density: '密度',
  'Detection label density': '偵測標籤密度',
  Allocation: '配置',
  'Detection label allocation': '偵測標籤配置',
  Elastic: '彈性',
  Weighted: '加權',
  Fade: '淡出',
  'Detection fade distance': '偵測淡出距離',
  'World-overlay fade distance outside the keyhole as a percentage of its radius':
    '世界疊層在鎖孔外的淡出距離，以鎖孔半徑的百分比表示',
  Outside: '鎖孔外',
  'Detection opacity outside the keyhole': '鎖孔外的偵測不透明度',
  'World-overlay label and card opacity beyond the fade distance':
    '超出淡出距離後，世界疊層標籤與卡片的不透明度',
  PARAMETERS: '參數',
  '3D aircraft — flat icons zoomed out, 3D models up close':
    '3D 航空器——拉遠是平面圖示，拉近是 3D 模型',
  Models: '模型',
  '3D model coverage': '3D 模型涵蓋範圍',
  Proximity: '鄰近',
  All: '全部',
  Scope: '鏡圈',
  'Scope — the circular viewport mask': '鏡圈——圓形視窗遮罩',
  Feather: '羽化',
  'Scope edge feather': '鏡圈邊緣羽化',
  'Scope edge feather as a percentage of the keyhole radius':
    '鏡圈邊緣羽化，以鎖孔半徑的百分比表示',
  Draw: '繪製',
  'Draw on the world — click vertices, double-click or Enter to finish, Esc to cancel':
    '在世界上繪製——點擊頂點，雙擊或按 Enter 完成，Esc 取消',
  Shape: '形狀',
  'Shape to draw': '要繪製的形狀',
  Area: '區域',
  Line: '線段',
  Pin: '圖釘',
  'Label (optional)': '標籤（選填）',
  'Label for the drawn shape': '繪製圖形的標籤',
  'Colour of the drawn shape': '繪製圖形的顏色',
  Primary: '主色',
  Amber: '琥珀',
  Cyan: '青',
  Green: '綠',
  Red: '紅',
  Clear: '清除',
  'Remove every mark from the board': '清除畫板上的所有標記',
  Celestial: '天體環',
  'Celestial ring — reveal the full globe': '天體環——顯示完整地球',
  'Clean UI': '淨空介面',
  'Hide UI chrome': '隱藏介面外框',
  'EXIT CLEAN VIEW': '離開淨空視圖',
  'Return UI controls': '恢復介面控制項',
  Bloom: '光暈',
  'Bloom / Glow': '光暈／發光',
  'Bloom intensity': '光暈強度',
  Sharpen: '銳化',
  Sharpening: '銳化',
  'Sharpen intensity': '銳化強度',

  // ── Data layers panel ───────────────────────
  'DATA LAYERS': '資料圖層',
  Movement: '移動',
  Cameras: '攝影機',
  Infrastructure: '基礎設施',
  Events: '事件',
  Utilities: '工具',
  'Live Flights': '即時航班',
  'Military Flights': '軍機航跡',
  'Live AIS Vessels': '即時 AIS 船舶',
  'Live Vessels': '即時船舶',
  Satellites: '衛星',
  'Street Traffic': '道路車流',
  Transit: '大眾運輸',
  Bikeshare: '共享單車',
  'Bike Share': '共享單車',
  'ALPR Cameras': '車牌辨識攝影機',
  'Mapped ALPR Cameras': '已標記車牌辨識攝影機',
  'Mapped Installations': '已標記設施',
  'Data Centers': '資料中心',
  Datacenters: '資料中心',
  Dams: '水壩',
  'Submarine Cables': '海底電纜',
  'Space Missions (30d)': '太空任務（30 天）',
  'Earthquakes (24h)': '地震（24 小時）',
  'Active Fires': '活躍火點',
  Directions: '路線規劃',
  Radio: '廣播',
  'Global Context': '全域脈絡',

  // ── Feed state chips ────────────────────────
  ON: '開啟',
  OFF: '關閉',
  LOADING: '載入中',
  DEGRADED: '降級',
  STALE: '過期',
  PARTIAL: '部分',
  FALLBACK: '備援',
  UNAVAILABLE: '無法使用',
  UNKNOWN: '未知',
  READY: '就緒',
  Ready: '就緒',

  // ── CCTV panel ──────────────────────────────
  // The bare "CCTV" panel title has no entry: the initialism is what a
  // Traditional Chinese reader expects, and an entry that translates to itself
  // is dead weight the table test rejects.
  'CCTV camera': 'CCTV 攝影機',
  'CCTV feed frame': 'CCTV 影像畫面',
  'SOURCE · UNKNOWN': '來源 · 未知',
  'Enable CCTV to load camera intersections': '啟用 CCTV 以載入路口攝影機',
  'CCTV OFF': 'CCTV 關閉',
  NEAREST: '最近',
  PREV: '上一個',
  NEXT: '下一個',
  FOCUS: '對焦',
  'COVERAGE OFF': '涵蓋範圍關閉',
  'AUTO HOP OFF': '自動跳轉關閉',
  'PROJECTION ON': '投影開啟',
  'CAL · --': '校正 · --',
  CALIBRATION: '校正',
  ADJUST: '調整',
  'Drag the camera in the world: rings rotate, arrows move, handles set range/FOV':
    '在世界中拖曳攝影機：圓環旋轉、箭頭平移、把手設定距離／視角',
  'Camera pose — click a value to type': '攝影機姿態——點擊數值可直接輸入',
  'Heading (compass °) — click to type': '方位（羅盤度）——點擊可輸入',
  'Pitch (° up/down) — click to type': '俯仰（上下度）——點擊可輸入',
  'Horizontal FOV (°) — click to type': '水平視角（度）——點擊可輸入',
  'Range / monitor-plane distance (m) — click to type':
    '距離／監視平面距離（公尺）——點擊可輸入',
  'Mount height above ground (m) — click to type':
    '離地架設高度（公尺）——點擊可輸入',
  'North offset from catalog position (m) — click to type':
    '相對目錄位置的向北偏移（公尺）——點擊可輸入',
  'East offset from catalog position (m) — click to type':
    '相對目錄位置的向東偏移（公尺）——點擊可輸入',
  'SAVE CAL': '儲存校正',
  'RESET CAL': '重設校正',
  'SCENE SUMMARY': '場景摘要',
  'Enable CCTV to start camera-linked intelligence summaries.':
    '啟用 CCTV 以開始產生與攝影機連動的情資摘要。',

  // ── Scene director panel ────────────────────
  SCENES: '場景',
  'Scene recipe': '場景腳本',
  NEW: '新增',
  DEL: '刪除',
  'CAPTURE SHOT': '擷取鏡位',
  'UPDATE SHOT': '更新鏡位',
  START: '開始',
  STOP: '停止',
  'EXPORT PRESETS': '匯出預設',
  IMPORT: '匯入',
  'RUN LOG': '執行紀錄',

  // ── Context rail ────────────────────────────
  CONTEXT: '脈絡',
  'Context mode': '脈絡模式',
  'SELECT CONTEXT': '選擇脈絡',
  CONTACTS: '接觸目標',
  'Cycles the nearest contacts of whatever type you select — planes, vessels, installations. Satellites track independently.':
    '依你選擇的類型輪播最近的接觸目標——飛機、船舶、設施。衛星獨立追蹤。',
  'CONTACTS — nearest planes · vessels · sites':
    '接觸目標——最近的飛機 · 船舶 · 設施',
  'SPACE MISSIONS — launches & orbital assets': '太空任務——發射與軌道資產',
  'Contact Context actions': '接觸目標脈絡操作',
  COCKPIT: '駕駛艙',
  'SEARCH NEARBY SITES': '搜尋周邊設施',
  'Reclassify tracked contact as TR-3B': '將追蹤目標重新歸類為 TR-3B',
  'Reclassify as TR-3B': '重新歸類為 TR-3B',
  'CONTACTS CONTEXT OFF': '接觸目標脈絡關閉',
  'SELECT CONTACTS TO LOAD OBSERVED / MAPPED PROXIMITY':
    '選擇接觸目標以載入觀測／標記的周邊資料',
  'Available Space Missions': '可用的太空任務',
  'AVAILABLE MISSIONS': '可用任務',
  'SELECT A MISSION TO INSPECT': '選擇一項任務以檢視',
  'LOADING 30-DAY MISSION INDEX': '正在載入 30 天任務索引',
  'TAB PREVIEWS · ENTER / SPACE SELECTS': 'TAB 預覽 · ENTER／空白鍵 選取',
  'NEAREST OBSERVED / MAPPED': '最近的觀測／標記',
  'OBSERVED / MAPPED PINGS': '觀測／標記訊號',
  'AVAILABLE INPUTS ONLY · NOT AN ALL-CLEAR': '僅限可用輸入 · 不代表全無目標',
  'Nearby cohort counts': '周邊同類計數',

  // ── Radio ───────────────────────────────────
  RADIO: '廣播',
  'Internet radio companion': '網路廣播夥伴',
  'Open compact Radio controls': '開啟精簡廣播控制',
  'Close compact Radio controls': '關閉精簡廣播控制',
  'Compact Radio controls': '精簡廣播控制',
  'Open detailed Radio controls': '開啟完整廣播控制',
  'Expand Radio': '展開廣播',
  'Expand Radio section': '展開廣播區塊',
  'RADIO READY': '廣播就緒',
  ENABLE: '啟用',
  'STATION TAG': '電台標籤',
  'Filter stations by station tag': '以電台標籤篩選',
  'NO STATION SELECTED': '尚未選擇電台',
  'Enable Radio, then choose a globe marker or use next.':
    '啟用廣播後，在地球上點選標記或按下一個。',
  'DIRECTORY BAND': '目錄頻段',
  'DRAG TO TUNE': '拖曳以調頻',
  'ALL · DRAG THE NEEDLE': '全部 · 拖曳指針',
  'SNAPS TO AVAILABLE STATIONS': '自動吸附到可用電台',
  'Tune available internet radio stations': '調整可用的網路廣播電台',
  'No station available': '沒有可用電台',
  'Radio playback': '廣播播放',
  'Previous filtered station': '上一個篩選後的電台',
  'Previous filtered radio station': '上一個篩選後的廣播電台',
  'Previous station': '上一個電台',
  'Play selected station': '播放選取的電台',
  'Play selected radio station': '播放選取的廣播電台',
  Play: '播放',
  'Next filtered station': '下一個篩選後的電台',
  'Next filtered radio station': '下一個篩選後的廣播電台',
  'Next station': '下一個電台',
  'Stop radio playback': '停止廣播播放',
  PLAY: '播放',
  VOLUME: '音量',
  'Radio volume': '廣播音量',
  'Compact Radio volume': '精簡廣播音量',
  'Cockpit Radio volume': '駕駛艙廣播音量',
  'Radio off': '廣播關閉',
  'STATION SITE': '電台網站',
  'DIRECTORY: RADIO BROWSER': '目錄：RADIO BROWSER',
  'Audio connects directly to the broadcaster after you press play. Your IP is visible to that broadcaster.':
    '按下播放後，音訊會直接連線到廣播業者。該業者看得到你的 IP。',

  // ── Cockpit ─────────────────────────────────
  'Aircraft cockpit view': '航空器駕駛艙視角',
  'EXIT COCKPIT': '離開駕駛艙',
  'Exit cockpit view': '離開駕駛艙視角',
  'Exit cockpit and return to full globe view': '離開駕駛艙並回到完整地球視角',
  'Reset cockpit to full globe view': '將駕駛艙重設為完整地球視角',
  RESET: '重設',
  'View switcher': '視角切換',
  'ESC EXIT': 'ESC 離開',
  'FIRST PERSON': '第一人稱',
  'C TOGGLE': 'C 切換',
  'Cockpit display options': '駕駛艙顯示選項',
  'Expand Cockpit display options': '展開駕駛艙顯示選項',
  'Cockpit display and Radio controls': '駕駛艙顯示與廣播控制',
  'Cockpit compact Radio controls': '駕駛艙精簡廣播控制',
  'Expand Cockpit Radio controls': '展開駕駛艙廣播控制',
  'Cockpit vision style': '駕駛艙視覺風格',
  'Next cockpit vision style': '下一個駕駛艙視覺風格',
  'Previous cockpit vision style': '上一個駕駛艙視覺風格',
  'Next vision style': '下一個視覺風格',
  'Previous vision style': '上一個視覺風格',
  'Current cockpit vision style: NORMAL. Activate for next style.':
    '目前駕駛艙視覺風格：一般。啟動以切換下一個風格。',
  'Current style: NORMAL — click for next': '目前風格：一般——點擊切換下一個',
  'Enable cockpit weather effects': '啟用駕駛艙天氣效果',
  'Contact cockpit summary': '接觸目標駕駛艙摘要',
  'Contact navigation': '接觸目標導覽',
  'Collapse Contact panel': '收合接觸目標面板',
  'Collapse contact panel': '收合接觸目標面板',
  'Collapse briefing panel': '收合簡報面板',
  'Collapse cockpit briefing panel': '收合駕駛艙簡報面板',
  'Cockpit briefing carousel': '駕駛艙簡報輪播',
  'Cockpit briefing controls': '駕駛艙簡報控制',
  'Cockpit briefing pages': '駕駛艙簡報頁面',
  'Next briefing page': '下一頁簡報',
  'Previous briefing page': '上一頁簡報',
  'Cycle briefing pages automatically every 9 seconds (Signals → News → Local). Pauses while you hover or focus the panel. Live signal data refreshes continuously either way.':
    '每 9 秒自動輪播簡報頁面（訊號 → 新聞 → 在地）。游標停留或聚焦面板時暫停。即時訊號資料兩種情況下都會持續更新。',
  'CYCLE OFF': '輪播關閉',
  'Show Live Signals': '顯示即時訊號',
  'Show Regional News': '顯示區域新聞',
  'Show Local Info': '顯示在地資訊',
  'Live signals': '即時訊號',
  'Latest regional news': '最新區域新聞',
  'Location-based information': '以位置為基礎的資訊',
  'LIVE SIGNALS': '即時訊號',
  NEWS: '新聞',
  LOCAL: '在地',
  'ACQUIRING REGIONAL NEWS': '正在取得區域新聞',
  'RESOLVING REGION': '正在判定區域',
  'SOURCE-BACKED EVENTS · NO SYNTHETIC NEWS': '有來源佐證的事件 · 無合成新聞',
  'NO AVAILABLE EXAMPLE': '沒有可用範例',
  'CONTACTS · 250 KM': '接觸目標 · 250 公里',
  'Next — nearest unvisited contact in the 250 km window':
    '下一個——250 公里範圍內最近且尚未造訪的目標',
  'Previous — prior visited contact in the 250 km window':
    '上一個——250 公里範圍內先前造訪過的目標',
  CONTACT: '接觸目標',
  'CONTEXT ONLY': '僅脈絡',
  'ESTIMATED FLIGHT PLAN': '推估飛行計畫',
  'Estimated flight plan': '推估飛行計畫',
  'Estimated destination direction': '推估目的地方向',
  'ROUTE DATA UNAVAILABLE': '無航路資料',
  'LIVE TRACK · COURSE ALIGNED': '即時航跡 · 航向對齊',
  'VISOR LOCK · ACTIVE': '鏡片鎖定 · 啟動',
  'OPTICAL PLANE · 01': '光學平面 · 01',
  'Current aircraft heading': '目前航空器航向',
  ALTITUDE: '高度',
  'ALTITUDE · FT': '高度 · 英尺',
  'GROUND SPEED': '地速',
  'GROUND SPEED · KTS': '地速 · 節',
  LEVEL: '高度層',
  CURRENT: '目前',
  FROM: '起點',
  TO: '終點',
  VIEW: '視角',
  SKY: '天空',
  SITE: '地點',
  TEMP: '溫度',
  WIND: '風',
  PRECIP: '降水',
  'Weather data by Open-Meteo.com': '天氣資料由 Open-Meteo.com 提供',

  // ── Provider settings (POWER UP) ────────────
  'POWER UP': '啟用金鑰',
  'GROUND STATION · PROVIDER SETTINGS': '地面站 · 供應商設定',
  'Power up the globe': '為地球加值',
  'Close key setup': '關閉金鑰設定',
  "The globe already flies keyless. Every key below switches on another real feed — paste one and it's saved into this app's local configuration, then the server restarts itself. Server-side keys stay on this machine; Google Maps and Cesium ion run in the browser and must be provider-restricted. Keys you configured elsewhere are shown but never touched.":
    '不用金鑰，地球本來就飛得動。下面每一把金鑰都會再打開一條真實資料流——貼上後會存進這個 App 的本機設定，伺服器接著自行重啟。伺服器端金鑰只留在這台機器；Google Maps 與 Cesium ion 在瀏覽器中執行，必須在供應商端設定使用限制。你在別處設定好的金鑰會顯示出來，但不會被動到。',
  'SAVE KEYS': '儲存金鑰',
  'ESC to close': '按 ESC 關閉',
  'The Google Maps key buys the photorealistic planet — everything else stacks on top.':
    'Google Maps 金鑰換來的是擬真星球——其他都是疊加上去的。',

  // ── Dock and voice ──────────────────────────
  'Navigation, voice, and visual preset controls': '導覽、語音與視覺預設控制',
});

/** Interface languages this fork ships, in toggle order. */
export const LANGUAGES = Object.freeze([
  Object.freeze({ code: 'en', label: 'EN', name: 'English', strings: null }),
  Object.freeze({
    code: 'zh-TW',
    label: '中',
    name: '繁體中文',
    strings: ZH_TW,
  }),
]);

/** The language a fresh visitor gets: the upstream copy, untranslated. */
export const DEFAULT_LANGUAGE = 'en';
