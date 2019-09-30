# Website Loading Time
Measure the full website loading time for a particular URL using Nightmare JS/Electron. Other solutions are way too overblown; this quick and dirty script keeps things as simple as possible. Feel free to fork and adapt as desired!

## Installation
```
npm install
```

Note that if you are running the script in a headless (server/CLI) environment, you'll need to install and run xvfb.

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


## Example output
```
website-loading-time rinogo$ node website-loading-time.js https://google.com
1569876956500	1657
1569876971524	967
1569876986529	1179
1569877001535	1005
1569877016541	1084
1569877031546	Error: Navigation timed out after 4000 ms
1569877046551	1076

```