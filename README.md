# Website Loading Time
Measure the full website loading time for a particular URL using Nightmare JS/Electron. Other solutions are way too overblown; this quick and dirty script keeps things as simple as possible. Feel free to fork and adapt as desired!

## Installation
```
npm install
```

## Usage
```
node website-loading-time.js https://google.com
```

## Example output
```
website-loading-time rinogo$ node website-loading-time.js https://google.com
796
Error: Navigation timed out after 4000 ms
723
859
1007
966
```