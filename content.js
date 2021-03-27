
// No Slack notification on favicon
if (location.host === "app.slack.com") {
  var file = 'images/slack.png';
  var url = chrome.extension.getURL(file);

  setInterval(function() {
    document.querySelector('link[rel*="icon"]').href = url;
  }, 150)
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


