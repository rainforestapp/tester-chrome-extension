BASE_URL = 'https://portal.rainforestqa.com';
BOUNCER_URL = 'http://bouncer.rainforestqa.com';

var manifest = chrome.runtime.getManifest();
console.log("Starting:", manifest.name, manifest.version, BASE_URL);

// Start disabled: require the tester to enable if they want to
// work when the browser starts
_checking_active = false
info_hash = {tester_state: 'active', email: '', id: '', version: manifest.version}

// Set polling interval in milliseconds (note, this is rate limted,
// so if you change agressively, it will error)
default_check_for_work_interval = 8 * 1000;
check_for_work_interval = default_check_for_work_interval;



//
// Load the initial id value from storage
//
chrome.storage.sync.get("worker_uuid", function(data) {
  // Notify that we saved.
  console.log("Data loaded", data);
  if (data['worker_uuid'] != undefined) {
    info_hash["uuid"] = data["worker_uuid"];
    console.log("Updated info hash:", info_hash);
    set_checking(_checking_active);
  } else {
    sync_tab_make_new();
  }
});



// Handle the icon being clicked
//
// this enables or disables checking for new work
//
chrome.browserAction.onClicked.addListener(function (event) {
  _checking_active = !_checking_active;
  console.log("browserAction", event);
  console.log("Checking is now:", _checking_active);
  set_checking(_checking_active);
})



//
// Handle data coming from the main site
// 
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.data) {
    console.log("incoming data", request);

    if (request.data['worker_uuid']) {
      info_hash["uuid"] = request.data["worker_uuid"]
      set_checking(_checking_active);
      sendResponse({ok: true});

      chrome.storage.sync.set({'worker_uuid': request.data["worker_uuid"]}, function() {
        // Notify that we saved.
        console.log('Worker ID saved');
      });
    }
  }
});



//
// Set checking state
//
function set_checking(state) {
  if (!state) {
    chrome.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 230]});
    chrome.browserAction.setBadgeText({text:"OFF"});
  } else {
    check_for_work();
  }
}



//
// Open or focus the main work tab
//
work_tab = null
function open_or_focus_tab(url) {
  if (work_tab === null && typeof work_tab === "object" ) {
    work_tab_make_new(url);
  } else {
    refresh_tab_info();
  }
}



//
// Make sure the work tab is open and in focus
//
function refresh_tab_info() {
  chrome.tabs.get(work_tab.id, function (t) {
    if (chrome.runtime.lastError) {
      work_tab = null;
      console.log(chrome.runtime.lastError.message);
    } else {
      work_tab = t;
      console.log('checking work tab', work_tab);

      // force selection
      if (!work_tab.selected) {
        chrome.tabs.update(work_tab.id, {selected: true});
      }
    }
  });
}


//
// Open a new work tab
//
function work_tab_make_new(url) {
  // make a new tab
  chrome.tabs.create({ url: url }, function (t) {
    console.log('made new work tab', t);
    work_tab = t;
  });
}

//
// Open a sync tab
//
function sync_tab_make_new() {
  // make a new tab
  chrome.tabs.create({ url: BASE_URL + '/profile?version=' + manifest.version }, function (t) {
    console.log('made new sync tab', t);
  });
}


//
// Poll for new work
//
function check_for_work() {
  if (info_hash["uuid"] == "" || info_hash["uuid"] === undefined) {
    console.log("Info hash not set", info_hash)
    return false;
  }

  var xhr = new XMLHttpRequest();
  xhr.open("GET", BOUNCER_URL + "/1/testers/" + info_hash["uuid"] + "/work_available?info=" + JSON.stringify(info_hash), true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && _checking_active) {
      var resp = JSON.parse(xhr.responseText);
      console.log("RESP:", resp);
      if (resp.work_available) {
        chrome.browserAction.setBadgeBackgroundColor({color:[0, 255, 0, 230]});
        chrome.browserAction.setBadgeText({text:"YES"});

        open_or_focus_tab(resp.url);
      } else {
        chrome.browserAction.setBadgeBackgroundColor({color:[0, 0, 0, 230]});
        chrome.browserAction.setBadgeText({text:"NO"});
      }
    }
  }
  xhr.send();

  if (_checking_active) {
    setTimeout(function() {
      xhr.abort();
      check_for_work();
    }, check_for_work_interval);
  }
}



//
// Get user information
// 
chrome.identity.getProfileUserInfo(function(info) {
  info_hash.email = info.email
  info_hash.id = info.id

  console.log('tester info:', info_hash);
})



//
// Get idle checking - this drops the polling rate
// for "inactive" users (i.e. when AFK)
// 
chrome.idle.setDetectionInterval(15);
chrome.idle.onStateChanged.addListener(function(state){
  info_hash.tester_state = state;
  console.log('tester info:', info_hash);

  if (state == 'idle') {
    check_for_work_interval = default_check_for_work_interval * 10;
  } else if (state == 'active') {
    check_for_work_interval = default_check_for_work_interval;
  }
})
