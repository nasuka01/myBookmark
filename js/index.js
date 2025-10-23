
// ===== DOM参照 =====
const folderInput = document.getElementById("folder-input");
const addFolderBtn = document.getElementById("add-folder");
const folderList = document.getElementById("folder-list");
const folderEmptyMsg = document.getElementById("folder-empty");
const folderSelect = document.getElementById("folder-select");

const bmTitle = document.getElementById("bm-title");
const bmUrl = document.getElementById("bm-url");
const addBmBtn = document.getElementById("add-bm-btn");
const bookmarkList = document.getElementById("bookmark-list");
const bmEmptyMsg = document.getElementById("bm-empty");

const currentFolderName = document.getElementById("current-folder-name");

// ===== データモデル =====
let folders = {}; // 例: { "仕事": [ {title, url}, ... ] }
let currentFolder = null;

// ===== ユーティリティ =====
const clearBookmarkListButKeepEmptyMsg = () => {
  // #bm-empty 以外の li を削除（空メッセージは残す）
  [...bookmarkList.querySelectorAll("li:not(#bm-empty)")].forEach(li => li.remove());
};

const renderBookmarks = () => {
  clearBookmarkListButKeepEmptyMsg();
  const items = folders[currentFolder] || [];

  if (items.length === 0) {
    bmEmptyMsg.style.display = "list-item";
    return;
  }
  bmEmptyMsg.style.display = "none";

  items.forEach((bm, index) => {
    const li = document.createElement("li");

    const a = document.createElement("a");
    a.href = bm.url;
    a.textContent = bm.title;
    a.target = "_blank";
    li.appendChild(a);

    const delBtn = document.createElement("button");
    delBtn.textContent = "×";
    delBtn.style.marginLeft = "8px";
    delBtn.addEventListener("click", () => {
      folders[currentFolder].splice(index, 1);
      saveData();
      renderBookmarks();
    });
    li.appendChild(delBtn);

    bookmarkList.appendChild(li);
  });
};

const selectFolder = (name) => {
  currentFolder = name;
  currentFolderName.textContent = name;
  // セレクトボックスも同期
  if (folderSelect.value !== name) folderSelect.value = name;
  renderBookmarks();
};

const addFolder = (name) => {
  if (!name) return;
  if (folders[name]) {
    alert("同じ名前のフォルダがあります");
    return;
  }
  folders[name] = [];
  saveData();

  // 左ペインのリスト
  const li = document.createElement("li");
  li.textContent = name;
  li.addEventListener("click", () => selectFolder(name));
  folderList.appendChild(li);

  // 右ペインのセレクト
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  folderSelect.appendChild(option);

  folderEmptyMsg.style.display = "none";

  // 最初のフォルダが作られたら自動選択
  if (!currentFolder) selectFolder(name);
};

// ===== ストレージに保存 =====
const STORAGE_KEY = "bookmark_app_data_v1";
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ folders, currentFolder }));
}
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && data.folders) {
      folders = data.folders;
      // 画面へ反映
      Object.keys(folders).forEach(name => {
        // 左リスト & セレクトを復元
        const li = document.createElement("li");
        li.textContent = name;
        li.addEventListener("click", () => selectFolder(name));
        folderList.appendChild(li);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        folderSelect.appendChild(option);
      });
      if (Object.keys(folders).length > 0) {
        selectFolder(data.currentFolder || Object.keys(folders)[0]);
      }
      folderEmptyMsg.style.display = Object.keys(folders).length ? "none" : "block";
    }
  } catch (e) {
    console.error(e);
  }
}

// ===== イベント =====
addFolderBtn.addEventListener("click", () => {
  const name = folderInput.value.trim();
  if (name === "") {
    alert("フォルダ名を入力してください");
    return;
  }
  addFolder(name);
  folderInput.value = "";
});

addBmBtn.addEventListener("click", () => {
  const title = bmTitle.value.trim();
  const url = bmUrl.value.trim();
  // currentFolder 未選択ならセレクトの値で補完
  if (!currentFolder && folderSelect.value) currentFolder = folderSelect.value;

  if (!title || !url || !currentFolder) {
    alert("タイトル・URL・フォルダをすべて入力してください");
    return;
  }

  // データに追加（DOM直追加ではなくデータ→再描画）
  folders[currentFolder].push({ title: `[${currentFolder}] ${title}`, url });
  saveData();
  renderBookmarks();

  // 入力クリア
  bmTitle.value = "";
  bmUrl.value = "";
  // フォルダは選択維持の方が自然なのでクリアしない
});

// 初期化
loadData();
