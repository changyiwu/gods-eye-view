# God's Eye View（繁中在地化 fork）（專案藍圖）

> 本檔為跨 Agent 通用的專案藍圖（AGENTS.md 開放標準）。任何 Agent 的每個 session 都應先讀本檔＋`handoff.md`。
> Claude Code 預設只在沒有 `CLAUDE.md` 時才讀 `AGENTS.md`，故由 `CLAUDE.md` 的 `@AGENTS.md` import 本檔；Claude 專屬規範寫在 `CLAUDE.md`。

## 專案簡介

本專案是開源專案 [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view)（Cesium 3D 地球儀 + 即時公開資料源的「間諜衛星模擬器」）的個人 fork。主線目標是**把介面繁體中文化／在地化**，同時定期 merge upstream 的新功能。本地改動留在自己的 fork，不回推上游。

## 關鍵時程

<!-- 格式：- 事件名稱：日期（說明）；目前無 -->

## 目標與路線圖

- [x] 階段一：介面繁體中文化基礎建設（語言切換按鈕 + 字串表 + 語言偏好持久化）
- [ ] 階段二：擴大翻譯覆蓋率（駕駛艙即時遙測、toast、AI HUD 摘要、Provider Settings 動態列）
- [ ] 階段三：建立追上游的例行流程（定期 `git merge upstream/main`，確認在地化改動未被覆蓋）

## 資料夾結構

```
gods-eye-view/
├── src/              前端主體（640 個 .js、325 個 .test.mjs）
│   ├── app/          應用組裝：application.js、catalog、layers、sources、scene
│   ├── annotations/  語音／手動標註（Area、Line、Pin）與渲染器
│   ├── data/         資料模型與轉換
│   ├── director/     場景導演、鏡頭巡航
│   ├── layers/       各資料圖層（航班、船舶、衛星、CCTV…）
│   ├── maps/         底圖來源（Esri、Google 3D、OSM、Ion）
│   ├── overlays/     疊加顯示（偵測框、軍事 HUD…）
│   ├── scenes/       預設場景
│   ├── search/       地點搜尋
│   ├── services/     對外服務串接
│   ├── sources/      資料源設定
│   ├── standalone/   獨立頁面
│   ├── styles/       GLSL 感測器風格（CRT、NVG、FLIR…）
│   ├── testSupport/  測試輔助
│   ├── tooling/      開發工具
│   ├── ui/           介面元件（← 在地化主戰場）
│   └── voice/        語音 agent 與工具
├── server/           本機服務（providers／standalone）
├── config/           CCTV 等資料源設定 JSON
├── scripts/          開發與 QA 腳本（doctor、format、pinokio、qa-*）
├── build/            Vite 與 HTML 建置外掛
├── tools/            離線素材生成工具
├── public/           靜態資產（models、圖示）
├── pinokio/          Pinokio 一鍵安裝啟動器
├── docs/             架構與子系統文件（APPLICATION、UI-OWNERSHIP、VOICE-OWNERSHIP…）
├── .github/          CI workflows、issue 範本、CODEOWNERS
├── .agents/skills/   專案內技能（community-pr）
├── index.html        入口
└── vite.config.js
```

## 專案專屬規則

### 在地化（i18n）

- **翻譯走 DOM 覆寫，不改各模組原始碼**：上游沒有字串目錄，UI 文案直接寫在 `src/ui/templates/*.html` 與各渲染模組裡。`src/i18n/` 的做法是**以英文原字串當 key**，在渲染後的 DOM 上就地替換，並用 MutationObserver 追後續重繪。要新增翻譯就往 `src/i18n/dictionary.js` 加一條，**不要**去改各個 UI 模組——那會讓每次 merge upstream 都爆衝突。
- **字典是「整個文字節點完全比對」**：不在字典裡的字串原封不動，所以呼號、地名、座標、電台名這類即時資料天生不會被翻到。代價是短英文字容易誤傷（`VIEW`、`ON`、`ALL`）；要排除某塊 UI，在該元素加 `data-gev-no-translate`。
- **絕不翻 `.material-symbols-outlined` 的文字內容**：那是圖示字型的 ligature 名稱，翻掉會渲染出字而不是圖示。`src/i18n/translation.js` 已擋住，不要拿掉。

### 通用

- **Node 版本**：`>=24.14.0 <25 || >=26 <27`。Node 25 已 EOL，`npm run doctor` 會警告。
- **絕不 commit 金鑰**：`.env`、`pinokio/ENVIRONMENT` 已在 `.gitignore`。金鑰一律透過 App 內 **POWER UP → Provider Settings** 設定，不要寫進追蹤中的檔案。
- **換行必須是 LF**：`.gitattributes` 已設 `* text=auto eol=lf`。有 44 個測試檔用 `readFileSync` 對原始碼做跨行 regex 比對，錨定 `\n`；Windows 若讓 git 轉成 CRLF，`npm test` 會直接掛掉 25 項。不要改這個設定。
- **改動前先跑測試基準**：`npm test`（單元測試）與 `npm run check:boundaries`（模組匯入邊界）。這個 repo 有模組邊界檢查，跨層 import 會被擋。
- **UI 改動先讀 [docs/UI-OWNERSHIP.md](docs/UI-OWNERSHIP.md)**，語音相關先讀 [docs/VOICE-OWNERSHIP.md](docs/VOICE-OWNERSHIP.md)——這個 repo 對「哪個模組擁有哪塊 UI」有明確規範。
- **追上游流程**：`git fetch upstream && git merge upstream/main`。合併後務必重跑 `npm test`，並確認在地化字串沒有被上游改動覆蓋。
- **`handoff.md` 不進 repo**：本專案是 **public fork**，且會持續 merge upstream。為避免污染 upstream 的 `.gitignore` 造成每次合併衝突，`handoff.md` 改以本機的 `.git/info/exclude` 忽略（效果相同，不進版控）。
- **本專案不在雲端硬碟**（路徑為 `C:\dev\gods-eye-view`），故 `handoff.md` **不會自動跨電腦同步**。換電腦接手請以 Obsidian（L3）的〈專案工作流程〉為準。

## 同步層級（本專案初始化至第 3 層級）

| 層級 | 平台 | 位置 | 讀取時機 |
|------|------|------|---------|
| L1 | 本地 | `AGENTS.md`＋`handoff.md`（不進 git）＋`CLAUDE.md`（橋接） | 每個 session |
| L2 | GitHub | [changyiwu/gods-eye-view](https://github.com/changyiwu/gods-eye-view)（**公開** fork；upstream 為 bilawalsidhu/gods-eye-view） | 指定時 |
| L3 | Obsidian | `gods-eye-view/專案工作流程.md` | 有需要時 |

## 三個檔案的職責（依「時效性」分家，不是依「詳細程度」）

| 檔案 | 時效 | 寫入方式 | 放什麼 |
|------|------|---------|--------|
| `handoff.md` | **只對下一個 session 有效**，過期即丟 | 每次收工**整份重寫** | 做到哪、下一步、**這次**的暫時 workaround |
| `AGENTS.md`（本檔） | **長期有效**，每個 session 都適用 | 只有規則本身變了才改 | 目標、路線圖、常設規則、結構 |
| Obsidian（L3）／`git log` | **歷史**：發生過什麼、為什麼 | 只增不刪 | 決策紀錄、踩坑完整版、逐次進度 |

驗收標準：**`handoff.md` 整份刪掉，不應損失任何長期資訊**——會的話代表該升級進本檔卻沒升級。

**本檔不要出現的東西**（會無限膨脹，且開工每次都要重讀）：
- ❌ `## 最近進度`／逐次工作紀錄 → 寫 Obsidian「🗓️ 最近更動紀錄」
- ❌ 決策記錄、取捨理由、踩坑經過的完整版 → Obsidian「決策紀錄」「🕳️ 踩坑筆記」
- ✅ 只留「結論式的規則」：踩過的坑收斂成一條**祈使句**寫進〈工作約定〉或〈專案專屬規則〉，理由那一大段留在 Obsidian

## 工作約定

- 任何 Agent、任何電腦：**開工先讀 `handoff.md`，收工必更新 `handoff.md`**
- `handoff.md` **不進 git**（含真實電腦名與本機絕對路徑），已列入本機 `.git/info/exclude`——不要把它加回版控
- 修改共用檔案前先讀最新內容，避免覆蓋其他 Agent 的變更
- 所有回應與文件使用繁體中文
- 修改前先確認計畫，優先保留原有資料結構
