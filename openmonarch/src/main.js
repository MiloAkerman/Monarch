import Replicate from "replicate";

const replicate = new Replicate({
	auth: "4d20564813565c3014c5448216c6ee153788215a",
});

chrome.commands.onCommand.addListener(async (command) => {
    if(command == "caption-image") {
		const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        let image = await chrome.tabs.sendMessage(tab.id, { type: "request_focused_img" });
		
		if(image.error) {
			if(image.data == "not_image") chrome.tabs.sendMessage(tab.id, { type: "send_alert", error: true, data: "No image selected!" });
			else chrome.tabs.sendMessage(tab.id, { type: "send_alert", error: true, data: "Unknown error encountered." });
			return;
		}
        /*if (image.alt && image.alt != '') {
            chrome.tabs.sendMessage(tab.id, { type: "send_alert", error: true, data: "This image is already captioned!" });
			return;
        }*/

        if (image.complete) {
			console.log("Image complete, requesting...");
            requestCaption(image);
        } else {
			console.log("Image not cached. Waiting...")
            image.onload = function () {
                requestCaption(image);
            }
        }
    } else {
		console.log("Command: " + command);
	}
});

function requestCaption(imageLink) {
	console.log("Requesting caption for " + imageLink + "...");
	// parse image on background to avoid CORS issues
	if (request["type"] == "captionImage") {
		replicate.run(
			"rmokady/clip_prefix_caption:9a34a6339872a03f45236f114321fb51fc7aa8269d38ae0ce5334969981e4cd8",
			{
				input: {
					image: imageLink
				}
			}

		).catch(async (error) => {
			console.error(error);

			const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
			chrome.tabs.sendMessage(tab.id, { type: "send_alert", error: false, data: error });
		}).then(async (output) => {
			console.log(output)

			const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
			chrome.tabs.sendMessage(tab.id, { type: "send_alert", error: false, data: output });
		});
	}
}