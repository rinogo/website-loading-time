//NightmareJS is powerful; check the documentation - https://github.com/segmentio/nightmare

//Settings
const TIMEOUT = 4000;
const FREQUENCY = 5000;
const SHOW_BROWSER = true;
const INCLUDE_TIMESTAMP = true;

//Dev settings
// const TIMEOUT = 4000;
// const FREQUENCY = 5000;
// const SHOW_BROWSER = true;
// const INCLUDE_TIMESTAMP = true;

var url = process.argv[2];
var Nightmare = require("nightmare");

//From https://github.com/segmentio/nightmare#extending-nightmare
Nightmare.action(
  "clearCache",
  (name, options, parent, win, renderer, done) => {
    parent.respondTo("clearCache", done => {
			win.webContents.session.clearCache(done)
			done(); //Shouldn't be necessary (`clearCache()` should call the `done()` callback), but apparently clearCache might have a bug... (See https://github.com/segmentio/nightmare/issues/959#issuecomment-535713489)
    })
    done()
  },
  function(done) {
		this.child.call("clearCache", done)
  }
)

//High level description of how nightmare works: Chaining commands onto nightmare adds to the queue of things to do.  Adding .then() executes those commands.  Note that you can start a new nightmare command queue within the then() anonymous function, itself terminated in a .then() call.
var nightmare = new Nightmare({
	//Dev
	waitTimeout: TIMEOUT,
	gotoTimeout: TIMEOUT,
	loadTimeout: TIMEOUT,
	executionTimeout: TIMEOUT,

	pollInterval: 50,

	//Electron options
	//NOTE: The NightmareJS window (whether shown or hidden) is an instance of Electron's BrowserWindow.  So, you can use any options for BrowserWindow here, as well.  https://electron.atom.io/docs/all/#new-browserwindowoptions
	webPreferences: {
	},
	show: SHOW_BROWSER,
	openDevTools: {
		mode: "detach"
	},
});

var start;

testUrl(url);
setInterval(function () { testUrl(url); }, FREQUENCY)

function testUrl(url) {
	start = new Date().getTime();
	nightmare
		.viewport(1680, 1050)
		.useragent("Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36")
		.goto(url)
		.clearCache()
		// .end()
		.then(function (r) {
			var end = new Date().getTime();
			console.log((INCLUDE_TIMESTAMP ? start + ": " : "") + (end - start));
		})
		.catch(handleError);
}

//Handle a NightmareJS error.
function handleError(error) {
	//Commented out the next line so we don't exit
	// nightmare.end().then(); //Documentation says, ".then() must be called after .end() to run the .end() task"
	
	var message;
	if(typeof error.details != "undefined" && error.details != "") {
		message = error.details;
	} else if(typeof error == "string") {
		message = error;

		if(error == "Cannot read property 'focus' of null") {
			message += " (Likely because a non-existent selector was used)";
		}
	} else {
		message = error.message;
	}
	// console.error(JSON.stringify({"status": "error", "message": message}));
	console.log((INCLUDE_TIMESTAMP ? start + ": " : "") + "Error: " + message);
}
