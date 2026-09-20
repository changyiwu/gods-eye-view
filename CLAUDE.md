@AGENTS.md

<!--
  本檔是「橋接檔」：Claude Code 自 v2.1.277 起能原生讀 AGENTS.md，
  但預設是二選一——只要有 CLAUDE.md 就只讀 CLAUDE.md、完全不碰 AGENTS.md，
  所以用第一行的 @AGENTS.md 把跨 Agent 專案藍圖 import 進來（不會讀兩次）。
  專案內容一律寫進 AGENTS.md，這裡只放 Claude Code 專屬規範，避免兩份分叉。
-->

## Claude Code 專屬

- 這個 repo 有 640 個 `.js`、325 個 `.test.mjs`，直接全域搜尋很容易吃掉 context。找東西優先用 `Grep`／`Glob` 收斂路徑，不要整包 `Read`。
- 動到 `src/ui/` 或 `src/voice/` 之前，先讀對應的 `docs/UI-OWNERSHIP.md`／`docs/VOICE-OWNERSHIP.md`，再進 plan mode 確認計畫。
