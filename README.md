# tester-chrome-extension

This is a Chrome extention which notifies the tester there is new work to be done. It does this by polling the API using their tester ID.

## Installing from store

https://chrome.google.com/webstore/detail/immdjpjbcikbffjifkbncgfbohbjicpo


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


## Alpha testers

A list of people who requested early access is here: https://docs.google.com/spreadsheets/d/1Fs9CgJSoz0O4d3kwGxECaiR9m6pDXyuoXbEYKlrofaM/edit#gid=2004031407

### Allowing access

```ruby
uuids = %w{
    ...put uuid's here..
}

Worker.where(uuid: uuids).not_blocked.each do |w|
  w.add_feature!(:portal_api_access)
  w.add_feature!(:chrome_extension)
  Jobs::Workers::Notify.do([w.id], "Welcome to the Rainforest Chrome Plugin Beta", "Hey #{w.name},

Thanks for signing up via the portal to get beta access. Congratulations, you've been invited to the beta (i.e. it's been tested, but might still have bugs) of the Rainforest Chrome Plugin. This will become the easiest way to get notified of new work.

Some things:
1. if it breaks or you have feedback, please let me know by email - russ@rainforestqa.com (include the url, plus any error message)
2. this is enabled for your account and a few others - it will not work for other testers, so sharing it won't work
3. to use it:
  1. install with the button on your profile
  2. it will redirect to your profile in order to get it's authorization
  3. it should show 'off' when you aren't working
  4. click the icon when you want to start. 'no' means there is no work. 'yes' will appear and a tab will open taking you direct to the job if there is work.

Any feedback would be awesome!

Russ
Rainforest QA
")
end
```

## Internal 

``password.txt.gpg`` contains the password for ``key.pem.gpg``, it's encrypted using Russ's public key, incase we ever loose it from Circle.