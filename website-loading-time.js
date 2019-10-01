//NightmareJS is powerful; check the documentation - https://github.com/segmentio/nightmare

//Settings
const FREQUENCY = 15000;
const TIMEOUT = FREQUENCY - 1000;
const LOADING_TIME_SANITY_CHECK_THRESHOLD = 100; //Sometimes, our Electron window gets into a funky state in which it fails to load the page but doesn't generate an error (at least not one that I seem to be receiving). So, if the loading time is below this threshold, we open a new Electron window to fix the problem.
const SHOW_BROWSER = true;
const SHOW_ERRORS = false;
const INCLUDE_TIMESTAMP = true;
const LOGGING_API_KEY = "abc123";

//Dev settings
// const FREQUENCY = 5000;
// const TIMEOUT = FREQUENCY - 1000;
// const LOADING_TIME_SANITY_CHECK_THRESHOLD = 100;
// const SHOW_BROWSER = true;
// const SHOW_ERRORS = true;
// const INCLUDE_TIMESTAMP = true;
// const LOGGING_API_KEY = "abc123";

var url = process.argv[2];
var Nightmare = require("nightmare");
var request = require("request");
// require("request-debug")(request); //For request debugging (Not included in package.json; execute `npm install request-debug` to use)

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

var nightmare;
var nightmareStart;
var start;

testUrl(url);
setInterval(function () { testUrl(url); }, FREQUENCY)

//Make sure we get a new Nightmare instance every hour. (In testing, Electron started malfunctioning after about 2.5 hours)
function getNightmare() {
  var now = new Date().getTime();
  if(typeof nightmare != "undefined" && typeof nightmareStart != "undefined" && now - nightmareStart < 3600000) {
    return nightmare;
  }

  closeNightmare();
  nightmareStart = new Date().getTime();

  //High level description of how nightmare works: Chaining commands onto nightmare adds to the queue of things to do.  Adding .then() executes those commands.  Note that you can start a new nightmare command queue within the then() anonymous function, itself terminated in a .then() call.
  nightmare = new Nightmare({
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

  return nightmare;
}

//End the existing Nightmare instance (window/headless window), if any. The next iteration will open a new Nightmare instance to perform its loading.
function closeNightmare() {
  if(typeof nightmare != "undefined") {
    nightmare.end().then(); //Documentation says, ".then() must be called after .end() to run the .end() task"
    nightmare = undefined;
  }
}

function testUrl(url) {
  nightmare = getNightmare();
	start = new Date().getTime();
	nightmare
		.viewport(1680, 1050)
		.useragent("Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36")
		.goto(url)
		.clearCache()
		// .end()
		.then(function (r) {
      var duration = new Date().getTime() - start;
      if(duration < LOADING_TIME_SANITY_CHECK_THRESHOLD) {
        closeNightmare();
        throw { message: "The loading time sanity check threshold was not met. Nightmare (Electron) will be restarted." };
      }

      console.log((INCLUDE_TIMESTAMP ? start + "\t" : "") + duration);
		})
		.catch(handleError);
          logToServer(start, duration);
}

//Handle a NightmareJS error.
function handleError(error) {
	//Commented out the next line so we don't exit
  // nightmare.end().then(); //Documentation says, ".then() must be called after .end() to run the .end() task"
  
  if(!SHOW_ERRORS) {
    return;
  }
	
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
	console.log((INCLUDE_TIMESTAMP ? start + "\t" : "") + "Error: " + message);
}

//Currently configured to log to NIXStats, but can likely be easily adapted to your monitoring service of choice.
function logToServer(timestamp, duration) {
  var server_id = "abc123";
  
  request.post(
    "https://api.eu.nixstats.com/v1/server/" + server_id + "/store?token=" + LOGGING_API_KEY,
    {
      json: {
        metrics: [
          {
            metric: "testgroup.loading_time",
            points: [[Math.round(timestamp / 1000), duration / 1000]]
          }
        ]
      }
    },
    function (error, response, body) {
      if(error) {
        handleError(error);
      }
    }
  );
}
