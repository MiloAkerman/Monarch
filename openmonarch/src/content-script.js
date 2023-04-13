function parseImage(node) {
    chrome.runtime.sendMessage({ type: "captionImage", img: node.src }).then(response => {
        if(!response.error) {
            node.setAttribute("alt", response.data);
            console.log(response.data);
        }
    })
}

window.onload = function() {
    document.querySelectorAll("img").forEach(image => {
        if(image.alt != '') return;

        if(image.complete) {
            parseImage(image);
        } else {
            image.onload = function() {
                parseImage(image);
            }
        }
    })
}