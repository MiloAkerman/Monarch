// Detect mouse position, for use in alternative hover-based description
let mouseX, mouseY;
document.onmousemove = function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

// Detect selected image
function getUrlExtension(url) {
    // I hate regex.
    return url.split(/[#?]/)[0].split('.').pop().trim();
}
function isImage(i) {
    // Hardcoding image types is probably not particuarly efficient
    return i.src != undefined && (
        getUrlExtension(i.src) == "png" ||
        getUrlExtension(i.src) == "jpg" ||
        getUrlExtension(i.src) == "gif"
    )
}
function findImage(node) {
    if (isImage(node)) return node;
    if (node.getElementsByTagName("img").length > 0) return node.getElementsByTagName("img")[0];
    return false;
}

// Handles all messages received from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    // When message of shortcut press received, get detected image, wait for load, and send back
    if (request.type == "request_focused_img") {
        let foundImage = findImage(document.activeElement);
        if (!foundImage) {
            alert("ERROR: No image found!");
            sendResponse({ error: true, data: "not_image" });
            return;
        }

        console.log(foundImage);
        // If image already cached, send right away. Otherwise, wait for load
        if (foundImage.complete) {
            console.log("Image complete, requesting...");
            sendResponse({ error: false, data: foundImage.src });
        } else {
            console.log("Image not cached. Waiting... ");
            foundImage.onload = () => {
                console.log("All good. Image loaded.");
                sendResponse({ error: false, data: foundImage.src });
            }
        }
    }

    // Communicate error/info to end user
    if (request.type == "send_alert") {
        if (!request.error) alert("Image description: " + request.data)
        else alert("ERROR: " + request.data);
    }
});