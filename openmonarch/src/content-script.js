/* TODO: Load with focus
function nextFocusableElement() {
    //add all elements we want to include in our selection
    var focusableElements =
        'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    if (document.activeElement && document.activeElement.form) {
        var focusable = Array.prototype.filter.call(
            document.activeElement.form.querySelectorAll(focusableElements),
            function (element) {
                //check for visibility while always include the current activeElement
                return (
                    element.offsetWidth > 0 ||
                    element.offsetHeight > 0 ||
                    element === document.activeElement
                );
            }
        );
        var index = focusable.indexOf(document.activeElement);
        if (index > -1) {
            var nextElement = focusable[index + 1] || focusable[0];
            return nextElement;
        }
    }
}*/

function isImage(i) {
    return i instanceof HTMLImageElement;
}
function findImage(node) {
    if(isImage(node)) return node;
    if(node.getElementsByTagName("img").length > 0) return node.getElementsByTagName("img")[0];
    return false;
} 

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if (request.type == "request_focused_img") {
        let foundImage = findImage(document.activeElement);
        if(!foundImage) {
            alert("ERROR: No image found!");
            sendResponse({ error: true, data: "not_image" });
            return;
        }

        console.log(foundImage);
        if(foundImage.complete) {
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
    if (request.type == "send_alert") {
        if(!request.error) alert("Image description: " + request.data)
        else alert("ERROR: " + request.data);
    }
});