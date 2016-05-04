!function ($) {
  // Action regexp
  var pattern = /submit/i;
  
  var callback = function(event) {
    var broker = $.jalios.Event.match(event, 'broker', pattern, true);
    if (!broker){ return; }
    
    // Element
    var elm = broker.source.currentTarget;
    broker.options._broked = true;
    
    var form = $(elm).closest("FORM");
    
    if (form.exists()) {
      form.submit();
    }
    
  }
  
  var register = function() {
    // Register to broker
    $(document).on("jalios:broker", callback);
  }
  
  // Plugin initialization on DOM ready
  $(document).ready(function($) {
    register();
  });
  
}(window.jQuery);