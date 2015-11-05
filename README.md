# tester-chrome-extension

This is a Chrome extention which notifies the tester there is new work to be done. It does this by polling the API using their tester ID.

## Installing from the portal

Note: to use this extension you MUST have done at least one job for us before. This is as we pay you via either Mechancial Turk, or Crowd Flower as normal, against an older job you did.

1. Go to https://portal.rainforestqa.com/login (register from any email from us)
2. Login
3. Click on "Get Chrome Extension"

## Developing

### 1. Clone repo

Clone this repo

### 2. Install the extension

1. Enable API access for your tester account (in admin area)
2. Go to: chrome://extensions/
3. Enable "Developer Mode"
4. Load unpacked extention
5. Select the folder you cloned

## Deploying

1. Build on circle and download the extension.zip
2. Go to https://chrome.google.com/webstore/developer/dashboard/g11410347157364884499
3. Upload the new version
4. Click publish

## Internal 

``password.txt.gpg`` contains the password for ``key.pem.gpg``, it's encrypted using Russ's public key, incase we ever loose it from Circle.