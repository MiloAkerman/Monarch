document.getElementById("submit").onclick = function() {
    let key = document.getElementById("keyinput").value;
    chrome.storage.sync.set({ "apikey": key }).then(() => {
        console.log("Set key to " + key);
    });
}