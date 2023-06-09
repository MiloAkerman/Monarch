import Replicate from "replicate";

// Helper function to get API key
async function getAPIKey() {
	let keyObj = await chrome.storage.sync.get(["apikey"]);
	console.log(keyObj.apikey);
	if(!keyObj.apikey) return null;
	else return keyObj.apikey;
}

// Connect to Replicate server with API key, if available
let replicate;
let apiKey = getAPIKey().then((apiKey) => {
	if(apiKey) {
		replicate = new Replicate({
			auth: apiKey,
		});
	}
});

// Command listener
chrome.commands.onCommand.addListener(async (command) => {
	const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

	// Initially bound to Ctrl + M (arbitrarily; there's probably a better key)
	if (command == "caption-image") {
		let image = await chrome.tabs.sendMessage(tab.id, { type: "request_focused_img" });

		if (!image.error) requestCaption(image.data);
		else return;
	} else if(command == "caption-image-hover") {
		let image = await chrome.tabs.sendMessage(tab.id, { type: "request_hover_img" });

		if (!image.error) requestCaption(image.data);
		else return;
	} else {
		console.log("Command: " + command);
	}
});

async function requestCaption(imageLink) {
	console.log("Requesting caption for " + imageLink + "...");
	// Image needs to be parsed from background script to avoid CORS issues
	if(!replicate) {
		apiKey = await getAPIKey();
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

	// request image from API
	replicate.run(
		"rmokady/clip_prefix_caption:9a34a6339872a03f45236f114321fb51fc7aa8269d38ae0ce5334969981e4cd8",
		{
			input: {
				image: imageLink
			}
		}

	// error catching
	).catch(async (error) => {

		console.error(error);

		const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
		chrome.tabs.sendMessage(tab.id, { type: "send_alert", error: false, data: error });

	// send back data
	}).then(async (output) => {
		console.log(output)

		const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
		chrome.tabs.sendMessage(tab.id, { type: "send_alert", error: false, data: output });
	});
}