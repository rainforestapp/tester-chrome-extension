BASE_URL = 'https://portal.rainforestqa.com';

var manifest = chrome.runtime.getManifest();

// Start disabled: require the tester to enable if they want to
// work when the browser starts
var _checking_active = false;
var info_hash = {
  tester_state: 'active',
  work_available_endpoint: BASE_URL + '/api/1/testers/',
  email: '',
  id: '',
  version: manifest.version
};

// Set polling interval in milliseconds (note, this is rate limted,
// so if you change agressively, it will error)
default_check_for_work_interval = 8 * 1000;
check_for_work_interval = default_check_for_work_interval;

//
// Load the initial id value from storage
//
chrome.storage.sync.get("worker_uuid", function(data) {
  // Notify that we saved.
  if (data.worker_uuid != undefined) {
    info_hash.uuid = data.worker_uuid;
    set_checking(_checking_active);
  } else {
    sync_tab_make_new();
  }
});

//
// Load the initial api endpoint value from storage
//
chrome.storage.sync.get("work_available_endpoint", function(data) {
  // Notify that we saved.
  if (data.work_available_endpoint !== undefined) {
    info_hash.work_available_endpoint = data.work_available_endpoint;
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
  set_checking(_checking_active);
});



//
// Handle data coming from the main site
// 
chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.data) {
    if (request.data.worker_uuid && request.data.work_available_endpoint) {
      info_hash.uuid = request.data.worker_uuid;
      info_hash.work_available_endpoint = request.data.work_available_endpoint;
      set_checking(_checking_active);
      sendResponse({ok: true});

      chrome.storage.sync.set(
        {
          worker_uuid: request.data.worker_uuid,
          work_available_endpoint: request.data.work_available_endpoint
        },
        function() {}
      );
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
    } else {
      work_tab = t;

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
    work_tab = t;
  });
}

//
// Open a sync tab
//
function sync_tab_make_new() {
  // make a new tab
  chrome.tabs.create({ url: BASE_URL + '/profile?version=' + manifest.version }, function (t) {
  });
}


//
// Poll for new work
//
function check_for_work() {
  if (info_hash.uuid == "" || info_hash.uuid === undefined) {
    return false;
  }

  var xhr = new XMLHttpRequest();
  xhr.open("GET", info_hash.work_available_endpoint + info_hash.uuid + "/work_available?info=" + JSON.stringify(info_hash), true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && _checking_active) {
      var resp = JSON.parse(xhr.responseText);
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
})



//
// Get idle checking - this drops the polling rate
// for "inactive" users (i.e. when AFK)
// 
chrome.idle.setDetectionInterval(15);
chrome.idle.onStateChanged.addListener(function(state){
  info_hash.tester_state = state;

  if (state == 'idle') {
    check_for_work_interval = default_check_for_work_interval * 10;
  } else if (state == 'active') {
    check_for_work_interval = default_check_for_work_interval;
  }
})
