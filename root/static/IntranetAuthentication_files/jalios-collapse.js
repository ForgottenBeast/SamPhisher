!function ($) {

  var isReady = false;
  var ready = function() {
    // Must wait for all stuff to init things
    if (isReady) { return; }
    isReady = true;
    
    // Register to other ajax-refresh
    $(document).on('jalios:refresh', function(event){
    var refresh = $.jalios.Event.match(event, 'refresh', 'after')
      if (!refresh){ return; }
      setup();
    });

    // Then setup
    setup();
  }

  var setup = function() {
    // Change chevron icons 
    $('.jalios-accordion', document).on('shown.bs.collapse hidden.bs.collapse', function(e) {
      var $panel = $(e.target);
      var $panelHeader = $panel.siblings('.panel-heading');
      var toggleClass = $panel.closest('.jalios-accordion').data('jalios-collapse-toggle');
      $panelHeader.find('.collapse-action .jalios-icon').toggleClass(toggleClass);
      $panelHeader.find('.collapse-action').toggleClass('dropup');
    });
  }

  // ------------------------------------------
  //  READY
  // ------------------------------------------

  // Plugin initialization on DOM ready
  $(document).on('jalios:ready', ready);

}(window.jQuery);