// --- 🔧 參數設定 (請填寫您專屬的 4 項資訊) ---
const CONFIG = {
  LINE_TOKEN: 'YOUR_LINE_ACCESS_TOKEN', // 請在此填入 LINE Channel Access Token
  GEMINI_KEY: 'YOUR_GEMINI_API_KEY',    // 請在此填入 Gemini API Key
  DRIVE_FOLDER_ID: 'YOUR_FOLDER_ID',     // 請在此填入 Google Drive 資料夾 ID
  SHEET_ID: 'YOUR_SHEET_ID'              // 請在此填入試算表 ID
};

// --- 📝 專屬 Markdown 提示詞 (加入逐字稿強制分隔指令) ---
const MEETING_PROMPT = `你現在的角色是一位專業的「會議整理與筆記助手」。我會提供錄音檔，請你解析並完成任務。

請根據以下需求產出繁體中文會議紀錄：

1. 摘要部分 (請嚴格使用 Markdown 語法)：
# 📅 會議紀錄摘要
---
## 🎯 1. 整體概要
## 📝 2. 主要討論重點
## 🚀 3. 行動計畫與下一步

2. 逐字稿部分：
請在摘要完成後，務必加上一行純文字分隔線 \`---逐字稿開始---\`，並在下方附上完整的會議逐字稿（請盡量依據不同發言者分段）。`;

// --- 🤖 主程式邏輯 (V41 等待命名機制) ---

function doPost(e) {
  if (!e || !e.postData) return;
  const body = JSON.parse(e.postData.contents);
  const event = body.events[0];
  if (!event) return;

  const userId = event.source.userId;
  const msg = event.message;
  const props = PropertiesService.getScriptProperties();

  // 狀況 A：收到音訊或檔案
  if (msg && (msg.type === 'audio' || msg.type === 'file')) {
    if (msg.type === 'file' && !checkAudioExtension(msg.fileName)) return;

    // 將錄音檔的 ID 存起來，等待使用者輸入名稱
    props.setProperty(userId + '_pending_audio_id', msg.id);
    
    // 如果是檔案，順便記下原始副檔名
    const ext = msg.fileName ? msg.fileName.split('.').pop() : "m4a";
    props.setProperty(userId + '_pending_ext', ext);

    pushText(userId, "🎙️ 錄音檔已就緒！\n\n請輸入這場「會議名稱」，我將開始專業分析。");
    return;
  }

  // 狀況 B：收到文字 (會議名稱)
  if (msg && msg.type === 'text') {
    const pendingAudioId = props.getProperty(userId + '_pending_audio_id');
    
    // 如果有正在等待的錄音檔
    if (pendingAudioId) {
      const meetingName = msg.text.trim();
      const ext = props.getProperty(userId + '_pending_ext') || "m4a";
      
      pushText(userId, `📝 會議名稱：「${meetingName}」設定成功。\n正在進行光速 AI 分析，請稍候...`);
      
      // 啟動分析流程
      runAnalysisProcess(userId, pendingAudioId, meetingName, ext);
      
      // 清除等待狀態，迎接下一次會議
      props.deleteProperty(userId + '_pending_audio_id');
      props.deleteProperty(userId + '_pending_ext');
    }
  }
}

// --- 🛠️ 核心分析與雙表存檔流程 ---

function runAnalysisProcess(userId, audioId, meetingName, ext) {
  try {
    const timestampStr = Utilities.formatDate(new Date(), "GMT+8", "yyyy/MM/dd HH:mm:ss");
    const saveName = `${meetingName}_${Utilities.formatDate(new Date(), "GMT+8", "yyyyMMdd_HHmm")}.${ext}`;

    // 1. 取得 LINE 音訊並命名
    const blob = getLineContent(audioId);
    blob.setName(saveName); 
    
    // 2. 備份到 Google Drive
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const file = folder.createFile(blob);
    const fileUrl = file.getUrl();

    // 3. 呼叫 Gemini 光速分析
    const aiResponse = analyzeDirectly(blob);

    // 4. 切割「摘要」與「逐字稿」
    let summary = "";
    let transcript = "";
    // 使用正規表達式做彈性切割，避免 AI 產生多餘空格
    if (aiResponse.match(/---逐字稿開始---/)) {
      const parts = aiResponse.split(/---逐字稿開始---/);
      summary = parts[0].trim();
      transcript = parts[1].trim();
    } else {
      summary = aiResponse.trim();
      transcript = "⚠️ AI 未能成功生成逐字稿分隔線，請參考上方摘要或檢查音訊長度。";
    }

    // 5. 寫入 Google Sheet (精準寫入 A, B, C, D 欄)
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    
    // 處理【會議記錄摘要】工作表
    let summarySheet = ss.getSheetByName('會議記錄摘要');
    if (!summarySheet) {
      // 防呆：如果你手動刪除了，程式會自動建回來
      summarySheet = ss.insertSheet('會議記錄摘要');
      summarySheet.appendRow(['會議名稱', '時間', '會議紀錄摘要', '音訊檔案連結']); 
    }
    summarySheet.appendRow([meetingName, timestampStr, summary, fileUrl]);

    // 處理【會議記錄逐字稿】工作表
    let transcriptSheet = ss.getSheetByName('會議記錄逐字稿');
    if (!transcriptSheet) {
      transcriptSheet = ss.insertSheet('會議記錄逐字稿');
      transcriptSheet.appendRow(['會議名稱', '時間', '會議紀錄逐字稿', '音訊檔案連結']); 
    }
    transcriptSheet.appendRow([meetingName, timestampStr, transcript, fileUrl]);

    // 6. 回傳結果到 LINE
    pushText(userId, `✅ 分析完成！逐字稿已同步存入資料庫。\n\n${summary}`);

  } catch (err) {
    console.error(err.stack);
    pushText(userId, `❌ 處理失敗：${err.message}`);
  }
}

// --- 🛠️ AI API 呼叫 (光速直傳模式) ---

function analyzeDirectly(blob) {
  const baseUrl = "https://generativelanguage.googleapis.com";
  const modelPath = "models/gemini-2.5-flash"; // 最新 2.5 穩定模型
  const genUrl = `${baseUrl}/v1beta/${modelPath}:generateContent?key=${CONFIG.GEMINI_KEY}`;

  const mimeType = blob.getContentType() || "audio/m4a";

  const payload = {
    contents: [{
      parts: [
        { text: MEETING_PROMPT },
        {
          inline_data: {
            mime_type: mimeType, 
            data: Utilities.base64Encode(blob.getBytes())
          }
        }
      ]
    }]
  };

  const res = UrlFetchApp.fetch(genUrl, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const json = JSON.parse(res.getContentText());
  
  if (json.candidates && json.candidates[0].content) {
    return json.candidates[0].content.parts[0].text;
  } else if (json.error) {
    throw new Error(json.error.message);
  }
  
  throw new Error("無法解析回傳結果，請確認音訊內容是否清晰。");
}

// --- 🛠️ 輔助工具函式 ---

function checkAudioExtension(n) { 
  return n && /\.(m4a|mp3|wav|aac|amr)$/i.test(n); 
}

function getLineContent(id) {
  return UrlFetchApp.fetch(`https://api-data.line.me/v2/bot/message/${id}/content`, {
    headers: { Authorization: 'Bearer ' + CONFIG.LINE_TOKEN }
  }).getBlob();
}

function pushText(to, text) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + CONFIG.LINE_TOKEN },
    payload: JSON.stringify({ to: to, messages: [{ type: 'text', text: text }] })
  });
}
