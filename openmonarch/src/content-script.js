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

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if (request.type == "request_focused_img") {
        if(document.activeElement.src) { 
            sendResponse({ error: false, data: document.activeElement.src });
            console.log(document.activeElement);
        }
        else sendResponse({ error: true, data: "not_image" });
    }
    if (request.type == "send_alert") {
        if(!request.error) alert("Image description: " + request.data)
        else alert("ERROR: " + request.data);
    }
});