# tester-chrome-extension [![Build Status](https://travis-ci.org/rainforestapp/tester-chrome-extension.svg?branch=develop)](https://travis-ci.org/rainforestapp/tester-chrome-extension)[![Coverage Status](https://coveralls.io/repos/github/rainforestapp/tester-chrome-extension/badge.svg)](https://coveralls.io/github/rainforestapp/tester-chrome-extension)

This is a Chrome extension for testers of the Rainforest [QA Testing Platform](https://www.rainforestqa.com/), it notifies testers there is new work to be done.

## Important!!!

This repo is only for technical discussion of the extension, not for general Rainforest-related discussion. Please use the [tester forum](https://forum.rainforestqa.com/) for general discussion (if you're not sure, the forum is likely the right place to go). If you want to open an issue or contribute, please see the [CONTRIBUTING guide](https://github.com/rainforestapp/tester-chrome-extension/blob/develop/CONTRIBUTING.md).

## Installing from the portal

Note: to use this extension you MUST have done at least one job for us before. This is as we pay you via either Mechanical Turk, or Crowd Flower as normal, against an older job you did.

1. Go to https://portal.rainforestqa.com/login (register from any email from us)
2. Login
3. Click on "Get Chrome Extension"

## Developing

### 1. Clone repo

Clone this repo

### 2. Run the local dev server

1. Run the local dev server with `./dev_server`
2. (To test websocket interactions) run schrute locally at localhost:4000 (note: this is not open source)

### 2. Install the extension

1. Go to: chrome://extensions/
2. Enable "Developer Mode"
3. Click "Load unpacked extension"
4. Select `extension` folder in this repo

### 3. Run tests

1. `npm install`
2. `npm run lint`
3. `npm test`

## Deploying

Most deploys do *not* require a new release of the plugin. If you are only
changing /src, the code will be deployed as soon as it is merged to master. (Do
not bump any versions in this case.)

If you are deploying changes to the actual plugin (as opposed to the JS source
code), do the following:

1. Bump the version in `package.json`, `production_manifest.json`, `staging_manifest.json` and `extension/manifest.json`
2. Build on circle and download the extension.zip
3. Go to https://chrome.google.com/webstore/developer/dashboard/u85d2beaae4ec3450eae7ccaa97b3ac82
4. Upload the new version
5. Click publish

**Warning: don't open a release PR until you've published the staging version, otherwise it will get auto-merged.**

Changes should be tested with the staging version of the plugin before the code is merged to master.

The following situations require new versioned plugin releases:

- Changes to any files in /extension (`index_prod.html`, `options_prod.html`, `constants/prod.js`, etc).
- Changes to manifest files.

## Internal

``password.txt.gpg`` contains the password for ``key.pem.gpg``, it's encrypted using Russ's public key, in case we ever loose it from Circle.
