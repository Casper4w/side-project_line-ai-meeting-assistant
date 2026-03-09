# side-project_line-ai-meeting-assistant
結合 LINE Bot 與 Gemini API 的自動化會議記錄機器人。

<a name="top"></a>
# 🤖 LINE AI 會議紀錄小幫手：全自動化部署指南

這是一個結合 **LINE Messaging API**、**Google Apps Script (GAS)** 與 **Google Gemini 2.5 Flash** 模型的多模態會議紀錄機器人。只需在 LINE 傳送錄音檔，AI 就會自動產出摘要與逐字稿，並同步儲存至 Google 試算表與雲端硬碟。

---

## 📖 目錄
* [✨ 核心功能特色](#-核心功能特色)
* [🔑 階段一：準備 4 把關鍵金鑰 (含 LINE 詳細指引)](#-階段一準備-4-把關鍵金鑰)
* [💻 階段二：建立 Google Apps Script (雲端大腦)](#-階段二建立-google-apps-script-雲端大腦)
* [🌐 階段三：部署為網頁應用程式](#-階段三部署為網頁應用程式)
* [🔗 階段四：LINE Webhook 串接與收尾](#-階段四-line-webhook-串接與收尾)
* [⚠️ 使用限制與資安注意事項 (必讀)](#-使用限制與資安注意事項-免費帳號部署必讀)

---

## ✨ 核心功能特色
1. **多模態 AI 解析**：採用 Gemini 2.5 Flash，直接讀取音訊檔案，無需額外語音轉文字 (STT) 服務。
2. **對話式歸檔**：機器人會引導輸入「會議名稱」，自動重新命名音檔並儲存。
3. **資料雙路儲存**：摘要與逐字稿自動分類寫入 Google 試算表，原始音檔備份至 Google Drive。
4. **精美 Markdown 格式**：產出的會議紀錄包含「整體概要」、「討論重點」與「行動計畫」。

[⬆️ 回到頂端](#top)

---

## 🔑 階段一：準備 4 把關鍵金鑰
請依序取得以下資訊並記錄於記事本中：

### 1. LINE_TOKEN (操作步驟)
* **登入後台**：前往 [LINE Developers Console](https://developers.line.biz/)。
* **建立提供者 (Provider)**：點擊「Create」，輸入一個名稱（例如：`My-Automation-Tools`）。
* **建立通道 (Channel)**：
    - 點擊「Create a Messaging API channel」。
    - 填寫機器人名稱、描述、類別，並確認建立。
* **產生 Token**：
    - 點擊進入剛建立好的 Channel。
    - 切換到 **「Messaging API」** 分頁。
    - 捲動到頁面最下方，找到 **「Channel access token」**。
    - 點擊 **「Issue」**，複製這串超長的亂碼。

### 2. GEMINI_KEY (Gemini API 金鑰)
* 前往 [Google AI Studio](https://aistudio.google.com/)。
* 點擊左側 **「Get API key」**。
* 點擊「Create API key」並複製。

### 3. DRIVE_FOLDER_ID (雲端硬碟資料夾 ID)
* 在 Google Drive 建立資料夾，打開後查看網址列。
* 網址 `https://drive.google.com/drive/folders/【這串英數字】` 即為 ID。

### 4. SHEET_ID (試算表 ID)
* 建立新的 Google 試算表。
* **重要**：手動建立兩個工作表，名稱請完全符合：`會議記錄摘要` 與 `會議記錄逐字稿`。
* 網址 `https://docs.google.com/spreadsheets/d/【這串英數字】/edit` 即為 ID。

[⬆️ 回到頂端](#top)

---

## 💻 階段二：建立 Google Apps Script (雲端大腦)
1. 前往 [Google Apps Script (GAS)](https://script.google.com/)，點擊「新專案」。
2. 將編輯器內原本的內容清空，貼上本專案提供的 `Code.gs` 完整程式碼。
3. 在程式碼最上方的 `CONFIG` 區塊，貼入剛才準備好的 4 把金鑰。
4. 點擊上方的 **「儲存」** (磁碟片圖示)。

[⬆️ 回到頂端](#top)

---

## 🌐 階段三：部署為網頁應用程式
1. 在 GAS 編輯器右上角，點擊 **「部署」 > 「新增部署」**。
2. 點擊左側「齒輪 ⚙️」，選擇 **「網頁應用程式」**。
3. **設定如下：**
   - 說明：`AI 會議助手 v1`
   - 執行身分：`我`
   - 誰可以存取：`所有人 (Anyone)`
4. 點擊 **「部署」**。
5. **關鍵步驟**：第一次部署需完成授權（審查權限 > 選擇帳號 > 進階 > 前往專案 > 允許）。
6. **複製** 產生的 「網頁應用程式網址 (URL)」。

[⬆️ 回到頂端](#top)

---

## 🔗 階段四：LINE Webhook 串接與收尾
1. **串接 Webhook：**
   - 回到 LINE Developers > Messaging API 分頁。
   - 找到 **Webhook URL** 欄位，貼上 GAS 的網址，點擊 **Verify** 確認出現 Success。
   - 開啟下方 **Use webhook** 開關。
2. **關閉自動回應：**
   - 前往 [LINE 官方帳號管理後台](https://manager.line.biz/)。
   - 進入「設定」>「回應設定」。
   - 回應模式設為「聊天機器人」，並 **「停用」** 自動回應訊息。

[⬆️ 回到頂端](#top)

---

## ⚠️ 使用限制與資安注意事項 (免費帳號部署必讀)

本專案使用免費服務，若應用於企業環境（如 HR 或機密會議），請留意以下限制：

### 1. 🛡️ 企業機密與資安隱私
* **資料訓練：** 根據條款，免費版 Google AI Studio 的數據可能會被 Google 用於模型訓練。
* **建議：** 處理高機密會議時，請使用 **付費版 Google Cloud (Vertex AI)** 或企業版 Workspace 帳號。

### 2. 💬 LINE 推播額度
* **額度限制：** 免費方案每月僅 200 則免費推播。
* **影響：** 會議回報頻繁時可能耗盡額度，屆時機器人將暫時無法回覆。

### 3. 💾 雲端儲存空間
* **空間消耗：** 免費版 15GB 空間由信箱與相簿共用。
* **維護：** 會議錄音檔較大，請定期清理或使用大容量企業空間存放。

### 4. ⏱️ 頻率與運算限制
* **Gemini API：** 免費版每分鐘上限 15 次請求。
* **GAS 執行時間：** 每天背景執行上限 90 分鐘。
* **建議：** 個人或單一部門使用綽綽有餘，但應避免多人同時上傳超長音檔。

[⬆️ 回到頂端](#top)
