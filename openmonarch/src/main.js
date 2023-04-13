import Replicate from "replicate";

const replicate = new Replicate({
    auth: "4d20564813565c3014c5448216c6ee153788215a",
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // parse image on background to avoid CORS issues
        if (request["type"] == "captionImage") {
            replicate.run(
                "rmokady/clip_prefix_caption:9a34a6339872a03f45236f114321fb51fc7aa8269d38ae0ce5334969981e4cd8",
                {
                    input: {
                        image: request["img"]
                    }
                }
            ).catch((error) => {
                console.error(error);
                sendResponse({ error: true, data: error})
            }).then(output => {
                console.log(output)
                sendResponse({ error: false, data: output });
            });
        }

        return true;
    }
);