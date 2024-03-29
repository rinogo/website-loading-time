# Website Loading Time
Measure the full website loading time for a particular URL using Nightmare JS/Electron. Other solutions are way too overblown; this quick and dirty script keeps things as simple as possible. Feel free to fork and adapt as desired!

## Installation
```
npm install
```

Note that if you are running the script in a headless (server/CLI) environment, you'll need to install and run xvfb. On RedHat or CentOS, this would be accomplished with something like the following:
```
sudo yum install xorg-x11-server-Xvfb libXScrnSaver
```

## Usage
```
node website-loading-time.js https://google.com
```

Constants are available within `website-loading-time.js` for modifying the following settings:
- Frequency (Integer)
- Timeout (Integer)
- Loading time sanity check threshold (Integer)
- Show browser (Boolean)
- Show errors (Boolean)
- Include timestamp (Boolean)
- NIXStats API Key (String) 

## Cron and xvfb Usage
We use this script in combination with xvfb on a headless machine (server) to check and report the actual loading times of one of our sites. This is the cron job we use; hopefully it helps you! This cron job uses `flock` to ensure that only one instance of the script is running at a time:
```
#Run website-loading-time.js on the server and report the loading time to NIXStats.
* * * * * /usr/bin/flock -n /tmp/website-loading-time.lockfile xvfb-run -a --server-args="-screen 0 1280x2000x24" node /home/rinogo/website-loading-time/website-loading-time.js https://google.com -- --progress=false --single-run --watch=false
```

## Example output
### Full output
```
website-loading-time rinogo$ node website-loading-time.js https://google.com
1569876956500	1657
1569876971524	967
1569876986529	1179
1569877001535	1005
1569877016541	1084
1569877031546	Error: Navigation timed out after 4000 ms
1569877046551	1076
...
```

### Loading times only (no timestamps or errors)
```
website-loading-time rinogo$ node website-loading-time.js https://google.com
1657
967
1179
1005
1084
1076
...
```
