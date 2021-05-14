// Should use MutationObserver instead of polling but some websites make it
// a pain (e.g. favicon dynamically loaded)
var REFRESH_INTERVAL = 75;
var SLACK_SIDEBAR_HIDING_TIMEOUT = 15 * 60 * 1000;


var pageCss = (function() {
  function getAllCssRules() {
    return [...document.styleSheets]
    .map(styleSheet => [...styleSheet.cssRules])
    .filter(Boolean)
    .flat();
  }
  var CSS_RULES = getAllCssRules();

  var separator = "#####";  // Arbitrary string that is very unlikely to be used by a CSS
  function __id(selectorText, prop) {
    return selectorText + separator + prop;
  }

  var res = {};
  var overriden = {};

  res.__overrideRule = function(selectorText, prop, value) {


    var rule = CSS_RULES.find(rule => rule.selectorText == selectorText);
    var ruleId = __id(selectorText, prop);

    if (!overriden[ruleId]) {
      overriden[ruleId] = rule.style[prop];
    }

    rule.style[prop] = value;
  };

  res.overrideRule = function(selectorText, prop, value) {
    try {
      res.__overrideRule(selectorText, prop, value);
    } catch (e) {
      // Of course it could fail in a different way but CSS not fully loaded is
      // the one we want to catch here
      CSS_RULES = getAllCssRules();
      setTimeout(res.overrideRule.bind(res, selectorText, prop, value), REFRESH_INTERVAL);
    }
  };

  res.restoreRule = function(selectorText, prop) {
    var rule = CSS_RULES.find(rule => rule.selectorText == selectorText);
    var ruleId = __id(selectorText, prop);

    rule.style[prop] = overriden[ruleId];
  };

  return res;
})();


function legibleDuration(_s) {
  s = Math.floor(_s / 1000);

  if (s < 60) {
    return s + "s";
  } else {
    return ((s - (s % 60)) / 60) + "m " + (s % 60) + "s"
  }
}


/**
 * Force page to use the supplied faviconFile
 * Prevents both websites that update favicons (e.g. Slack) and websites
 * that allow different favicons for the same kind of resources (e.g. Notion)
 */
function forceFavicon(faviconFile) {
  var faviconUrl = chrome.extension.getURL(faviconFile);
  var favicon;

  setInterval(function () {
    if (!favicon) { favicon = document.querySelector('link[rel*="icon"]'); }
    if (favicon) { favicon.href = faviconUrl; }
  }, REFRESH_INTERVAL);
}


/**
 * Prevent notification number from appearing in the title
 * Remove all supplied characters as well
 */
function noNotificationInTitle(_unneededStrings) {
  var title = document.querySelector("title");
  var unneededStrings = _unneededStrings || [];

  setInterval(function () {
    title.textContent = title.textContent.replace(/\([0-9]+\+?\) /, "");
    unneededStrings.forEach(s => title.textContent = title.textContent.split(s).join(""));
  }, REFRESH_INTERVAL);
}


if (location.href.startsWith("https://www.notion.so/")) {
  forceFavicon('images/notion.ico');
  noNotificationInTitle();
}


if (location.href.startsWith("https://mail.google.com/")) {
  noNotificationInTitle();
}


// No notification on Paper (what use do they serve anyway???)
if (location.href.startsWith("https://paper.dropbox.com/")) {
  var paperNotif = document.querySelector(".hp-notifications-badge");

  setInterval(function () {
    paperNotif.style.display = "none";
  }, REFRESH_INTERVAL);

}


if (location.href.startsWith("https://app.slack.com/")) {
  function hideSidebarAndBadges() {
    pageCss.overrideRule('.p-channel_sidebar__list', 'display', 'none');
    pageCss.overrideRule('.c-mention_badge', 'display', 'none');
    pageCss.overrideRule('.c-search_autocomplete__unread_count', 'display', 'none');
    restoreButton.style.display = "flex";
    explanatoryText.style.display = "block";
  }

  function restoreSidebarAndBadges() {
    pageCss.restoreRule('.p-channel_sidebar__list', 'display');
    pageCss.restoreRule('.c-mention_badge', 'display');
    pageCss.restoreRule('.c-search_autocomplete__unread_count', 'display');
    restoreButton.style.display = "none";
    explanatoryText.style.display = "none";

    setTimeout(hideSidebarAndBadges, SLACK_SIDEBAR_HIDING_TIMEOUT);
  }

  var restoreButton = document.createElement("button");
  restoreButton.classList.add("c-button");
  restoreButton.classList.add("c-button--outline");
  restoreButton.classList.add("c-button--medium");
  restoreButton.style.margin = "8px";
  restoreButton.innerHTML = "Reactivate sidebar and badges";
  restoreButton.addEventListener("click", restoreSidebarAndBadges);

  var explanatoryText = document.createElement("div");
  explanatoryText.style.margin = "8px";
  explanatoryText.innerHTML = "After reactivation, the sidebar will be deactivated again after " + legibleDuration(SLACK_SIDEBAR_HIDING_TIMEOUT) + ".<br><br>You don't need to reactivate it to navigate! Use Ctrl+K or Ctrl+Shift+K (PC) / Cmd+K or Cmd+Shift+K (Mac) to select the conversation you want to jump to.";

  function insertControls() {
    var sidebar = document.querySelector(".p-channel_sidebar");
    if (!sidebar) {
      setTimeout(insertControls, REFRESH_INTERVAL);
    } else {
      sidebar.prepend(explanatoryText);
      sidebar.prepend(restoreButton);
    }
  }


  forceFavicon('images/slack_calm.png');
  noNotificationInTitle(["* ", "! "]);
  insertControls();
  hideSidebarAndBadges();
}


// Only searchbar on LinkedIn
//if (location.host === "www.linkedin.com" || location.host === "linkedin.com") {
//if (location.href === "https://www.linkedin.com/feed/") {
if (location.href.match(/^https:\/\/linkedin.com\/?$|^https:\/\/www\.linkedin\.com\/?$|^https:\/\/www\.linkedin\.com\/feed\/?$/)) {

  function actuallyShowLinkedInFrontpage() {
    document.querySelector(".scaffold-layout__row").style.display = "";
    document.getElementById("actually-show-frontpage").style.display = "none";

    // This ugly hack ensures all tiles are well positioned
    window.scrollBy(0,10);
    window.scrollBy(0,-10);
  }

  function actuallyShowLinkedInChat() {
    document.querySelector(".msg-overlay-container").style.display = "";
    document.getElementById("actually-show-chat").style.display = "none";
  }


  // Main screen
  var main_interval_id = setInterval(function() {
    if (document.querySelector(".scaffold-layout__row")) {
      document.querySelector(".scaffold-layout__row").style.display = "none";

      // Add button to display the home page
      var button = document.createElement("input");
      button.type = "button";
      button.value = "Actually I want to waste time on LinkedIn's front page";
      button.style["font-size"] = "18px";
      button.style["margin-top"] = "20px";
      button.id = "actually-show-frontpage";
      button.addEventListener("click", actuallyShowLinkedInFrontpage);
      document.querySelector(".scaffold-layout__inner").prepend(button);

      clearInterval(main_interval_id);
    }
  }, 100)

  // Chat
  var chat_interval_id = setInterval(function() {
    if (document.querySelector(".msg-overlay-container")) {
      document.querySelector(".msg-overlay-container").style.display = "none"

      // Add button to display the chat
      var button = document.createElement("input");
      button.type = "button";
      button.value = "Actually I need to use the chat";
      button.style["font-size"] = "18px";
      button.style["margin-right"] = "20px";
      button.style["margin-top"] = "20px";
      button.id = "actually-show-chat";
      button.addEventListener("click", actuallyShowLinkedInChat);
      document.querySelector(".scaffold-layout__inner").prepend(button);

      clearInterval(chat_interval_id);
    }
  }, 100)

}


if (location.href.startsWith("https://www.linkedin.com/")) {
  noNotificationInTitle();
}


