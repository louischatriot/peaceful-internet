var REFRESH_INTERVAL = 75


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
  }, 150);

}


// No Slack notification on favicon or title bar
if (location.href.startsWith("https://app.slack.com/")) {
  forceFavicon('images/slack.png');
  noNotificationInTitle(["* ", "! "]);
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


