!function($) {

  var register = function(){
    
    /*
     * IE8 .table-data && .table-striped even / odd style
     * .odd class is added on each TR
    */    
    if ($("BODY.browser-IE8").length) {
      $(".table-data, .table-striped").each(function(){
        $(this).find("TR:odd").addClass("odd");
      });
    }
    
    /*
     * IE8 Placeholders
    */
    if (!Modernizr.input.placeholder){
      $('[placeholder]').focus(function() {
        var input = $(this);
        if (input.val() == input.attr('placeholder')) {
          input.val('');
          input.removeClass('placeholder');
        }
      }).blur(function() {
        var input = $(this);
        if (input.val() == '' || input.val() == input.attr('placeholder')) {
          input.addClass('placeholder');
          input.val(input.attr('placeholder'));
        }
      }).blur();
      
      $('[placeholder]').parents('form').submit(function() {
        $(this).find('[placeholder]').each(function() {
        var input = $(this);
        if (input.val() == input.attr('placeholder')) {
        input.val('');
      }
      })
      });

      jQuery.extend({
        propHooks: {
          elements: {
            get: function (elem) {
              var elements = elem.elements;
              elements = jQuery.grep(elements, function( el ) {
                return !jQuery(el).is('.placeholder');
              });
              return elements;
            }
          }
        }
      });
      
    }
   }

  // ------------------------------------------
  //  READY
  // ------------------------------------------
    
  // Plugin initialization on DOM ready
  $(document).ready(function($) {
    register();
  });

}(window.jQuery);
