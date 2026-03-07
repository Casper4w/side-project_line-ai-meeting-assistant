# side-project_line-ai-meeting-assistant
結合 LINE Bot 與 Gemini API 的自動化會議記錄機器人。

本專案利用 Gemini 2.5 Flash 的多模態處理能力，省去了傳統語音轉文字 (STT) 的中間步驟，直接解析音訊，大幅提升了處理速度與摘要準確度。

# 🤖 LINE AI 會議紀錄小幫手：部署指南

本專案將引導您從零開始建置一個結合 LINE Bot、Google Apps Script 與 Gemini API 的自動化工具。

## 📖 目錄
* [🔑 階段一：準備 4 把金鑰與雲端空間](#-階段一準備-4-把金鑰與雲端空間)
* [💻 階段二：建立 Google Apps Script (雲端大腦)](#-階段二建立-google-apps-script-雲端大腦)
* [🌐 階段三：部署為網頁應用程式](#-階段三部署為網頁應用程式)
* [🔗 階段四：LINE Webhook 串接與收尾](#-階段四-line-webhook-串接與收尾)

---

## 🔑 階段一：準備 4 把金鑰與雲端空間
我們需要準備 4 個關鍵資訊（ID 與 Key），請先將其記錄於記事本備用。

| 項目 | 取得管道 | 說明 |
| :--- | :--- | :--- |
| **LINE_TOKEN** | LINE Developers | 建立 Provider 與 Messaging API Channel，點擊 **Issue** 產生 Token。 |
| **GEMINI_KEY** | Google AI Studio | 點擊 **Get API key**，建立並複製您的 API 金鑰。 |
| **DRIVE_FOLDER_ID** | Google Drive | 建立資料夾，網址 `/folders/` 後的一長串英數字即為 ID。 |
| **SHEET_ID** | Google Sheets | 建立試算表，網址 `/d/` 與 `/edit` 中間的英數字即為 ID。 |

> [!IMPORTANT]
> **試算表設定：** 請在下方手動建立兩個工作表，名稱務必命名為：`會議記錄摘要` 與 `會議記錄逐字稿`。

---

## 💻 階段二：建立 Google Apps Script (雲端大腦)
1. 前往 [Google Apps Script (GAS)](https://script.google.com/)，點擊「新專案」。
2. 清空編輯器內容，將 `Code.gs` 內的完整程式碼貼上。
3. 在程式碼最上方的 `CONFIG` 區塊，填入您在階段一準備好的 4 把金鑰。
4. 點擊上方的 **「儲存」** (磁碟片圖示)。

---

## 🌐 階段三：部署為網頁應用程式
1. 在 GAS 編輯器右上角，點擊 **「部署」 > 「新增部署」**。
2. 點擊左側「齒輪 ⚙️」，選擇 **「網頁應用程式」**。
3. **設定如下：**
   - 說明：`AI 會議助手 v1`
   - 執行身分：`我`
   - 誰可以存取：`所有人 (Anyone)`
4. 點擊 **「部署」** 並完成權限授權。
5. **複製** 產生的 「網頁應用程式網址 (URL)」。

---

## 🔗 階段四：LINE Webhook 串接與收尾
1. **貼上 Webhook 網址：**
   - 回到 LINE Developers > Messaging API 分頁。
   - 在 `Webhook URL` 欄位貼上剛才複製的網址，點擊 **Verify** 確認成功。
   - 開啟 **Use webhook** 開關。
2. **關閉自動回應：**
   - 前往 LINE 官方帳號管理後台 > 回應設定。
   - 將「回應模式」設為「聊天機器人」，並 **停用** 「自動回應訊息」。

🎉 **大功告成！現在您可以對著機器人傳送錄音檔進行測試。**
