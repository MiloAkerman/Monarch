import Replicate from "replicate";

// Helper function to get API key
function getAPIKey() {
	chrome.storage.sync.get(["apikey"]).then((result) => {
		if(!result) return null;
		else return result.key;
	});
}

// Connect to Replicate server with API key, if available
let replicate;
let apiKey = getAPIKey();
if(apiKey) {
	replicate = new Replicate({
		auth: apiKey,
	});
}

// Command listener
chrome.commands.onCommand.addListener(async (command) => {
	// Initially bound to Ctrl + M (arbitrarily; there's probably a better key)
	if (command == "caption-image") {
		const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
		let image = await chrome.tabs.sendMessage(tab.id, { type: "request_focused_img" });

		if (!image.error) requestCaption(image.data);
		else return;
	} else if(command == "caption-image-hover") {
		const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
		let image = await chrome.tabs.sendMessage(tab.id, { type: "request_hover_img" });

		if (!image.error) requestCaption(image.data);
		else return;
	} else {
		console.log("Command: " + command);
	}
});

function requestCaption(imageLink) {
	console.log("Requesting caption for " + imageLink + "...");
	// Image needs to be parsed from background script to avoid CORS issues
	if(!replicate) {
		apiKey = getAPIKey();
		if(!apiKey) {
			chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(([tab]) => {
				chrome.tabs.sendMessage(tab.id, { type: "no_api_key", error: false }).then(() => {
					chrome.tabs.create({ url: chrome.runtime.getURL("replicate_setup.html") });
				})
			});
			return;
		} else {
			replicate = new Replicate({
				auth: apiKey,
			});
		}
	}

	replicate.run(
		"rmokady/clip_prefix_caption:9a34a6339872a03f45236f114321fb51fc7aa8269d38ae0ce5334969981e4cd8",
		{
			input: {
				image: imageLink
			}
		}

	).catch(async (error) => {

		console.error(error);

		const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
		chrome.tabs.sendMessage(tab.id, { type: "send_alert", error: false, data: error });
	}).then(async (output) => {
		console.log(output)

		const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
		chrome.tabs.sendMessage(tab.id, { type: "send_alert", error: false, data: output });
	});
}