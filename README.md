# tester-chrome-extension [![Coverage Status](https://coveralls.io/repos/github/rainforestapp/tester-chrome-extension/badge.svg)](https://coveralls.io/github/rainforestapp/tester-chrome-extension)

This is a Chrome extention which notifies the tester there is new work to be done. It does this by polling the API using their tester ID.

## Installing from the portal

Note: to use this extension you MUST have done at least one job for us before. This is as we pay you via either Mechancial Turk, or Crowd Flower as normal, against an older job you did.

1. Go to https://portal.rainforestqa.com/login (register from any email from us)
2. Login
3. Click on "Get Chrome Extension"

## Developing

### 1. Clone repo

Clone this repo

### 2. Run the local dev server

1. Run the local dev server with `./dev_server`
2. (To test websocket interactions) run schrute locally at localhost:4000 (note:
   this is not open source)

### 2. Install the extension

1. Go to: chrome://extensions/
2. Enable "Developer Mode"
3. Click "Load unpacked extension"
4. Select `extension` folder in this repo

### 3. Run tests

1. `npm install`
2. `npm run lint`
3. `npm test`

## Contributing

Contributions are welcome! Please keep the following in mind:

- Follow the
  [Rainforest frontend conventions](https://github.com/rainforestapp/frontend-conventions)
  where it makes sense.
- Always follow the ESLint style suggestions.
- State should be managed with [Redux](http://redux.js.org/); if you're not
  familiar,
  [this video guide](https://egghead.io/courses/getting-started-with-redux) is a
  great resource.
- Always write tests to go along with your changes (our tests are written with
  [mocha](https://mochajs.org/) and [chai](http://chaijs.com/)).


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

Changes should be tested with the staging version of the plugin before the code
is merged to master.

The following situations require new versioned plugin releases:

- Changes to any files in /extension (`index_prod.html`, `options_prod.html`,
  ``constants/prod.js``, etc).
- Changes to manifest files.

## Internal

``password.txt.gpg`` contains the password for ``key.pem.gpg``, it's encrypted using Russ's public key, incase we ever loose it from Circle.
