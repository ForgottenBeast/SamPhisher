!function ($) {
  
  var isCtrlKeyPressed = false;
  var CTRL_KEY = 17;
  var LEFT_CLICK = 1;
  var MIDDLE_CLICK = 2;

  var callback = function(event) {
    var $elm = $(event.currentTarget);    var $target = $(event.target);
    var $closestLink = $target.closest("A");
    
    //Prevent link inside a clickable container to be handled by clickable event
    if ($target.is("A")) {
      $target[0].trigger( "click" );
      return;
    }
    
    if ($closestLink.length > 0) {
      $closestLink[0].trigger( "click" );
      return;
    }
    
    var url = null;
    var $links = $("A", $elm);
    var dataUrl = $elm.data("jalios-url");
    if (dataUrl) {
      url = dataUrl;
    } else if ($links.exists()){
      url = $links.first().prop("href");
    }
    
    if (url) {
      var options = $elm.data("jalios-options");
      // IE and Firefox do not allow new tab to be opened through javascript
      var isBrowserHandleNewTab = $("BODY").hasClass("browser-Chrome");
      if (event.which === LEFT_CLICK) {
        if (isBrowserHandleNewTab && (options && options.target === "_blank" || isCtrlKeyPressed)) {
          // Handle options.target = "_blank"
          var win = window.open(url, '_blank');
        } else {
          document.location.href = url.startsWith("http") ? url : document.getElementsByTagName('base')[0].href + url;
        }
      } else if (isBrowserHandleNewTab && event.which === MIDDLE_CLICK) {
        event.preventDefault();
        var win = parent.window.open(url, '_blank');
      }
    }
  }

  var onKeyDown = function(event) {
    if (event.which === CTRL_KEY) {
      isCtrlKeyPressed = true;
    }
  }
  
  var register = function() {
    $(document).on("mousedown",".clickable[data-jalios-url]", callback);
    $(document).keydown(onKeyDown);
    $(document).keyup( function(){ 
      isCtrlKeyPressed = false; 
    });  
  }
  
  // Plugin initialization on DOM ready
  $(document).ready(function($) {
    register();
  });
  
}(window.jQuery);