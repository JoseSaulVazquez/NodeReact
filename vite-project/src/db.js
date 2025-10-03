// db.js
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("database", 1);
    request.onupgradeneeded = (event) => {
      let db = event.target.result;
      if (!db.objectStoreNames.contains("table")) {
        db.createObjectStore("table", { autoIncrement: true });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

export function addData(data) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("table", "readwrite");
      const store = tx.objectStore("table");
      const req = store.add(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

export function getAllData() {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("table", "readonly");
      const store = tx.objectStore("table");
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
}

export function clearData() {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("table", "readwrite");
      const store = tx.objectStore("table");
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  });
}
