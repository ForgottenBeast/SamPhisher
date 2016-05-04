
!function ($) {
  
  // Namespace
  if (!$.jalios) { $.jalios = {}; }
  
  // ------------------------------------------
  //  PRIVATE
  // ------------------------------------------
  
  var init_MediaElementJS_I18NStrings = function(){
    
    // - Retrieve mejs I18N properties from JCMS
    var mejsProperties = {}
    $.map(I18N, function( value, key) {
      if (value && key && key.startsWith("mejs.")) {
        mejsProperties[key] = value;
      }
    });
    // Set the current language and pproperties base on JCMS information
    // Use same hack as wordpress to set current language, with global variable mejsL10n
    mejsL10n = {
      language: I18N.lang,
      strings: mejsProperties
    };

  };
  
  // Run now
  init_MediaElementJS_I18NStrings();
  
  
  var register = function(){
    
    $(document).on('click', 'A.lang-trigger', function(event){
      var $e = $(event.currentTarget);
      event.preventDefault();
      var langRequested = $e.attr('lang') || $e[0].lang;
      $.jalios.I18N.toggleLang(langRequested);
    });
    
    // Fix on refresh
    $(document).on('jalios:refresh', function(event){
      var refresh = $.jalios.Event.match(event, 'refresh', 'after')
      if (!refresh || !refresh.target){ return; }
      upgrade(refresh.target);
    });
    
    // Fix forms on load
    upgrade();
  }
  
  var upgrade = function(context){
    var $ctx = $(context || document);
    $ctx.find('FORM.lang-trigger').each(function(){
      var $this = $(this);
      $.jalios.I18N.toggleScope($this.attr('lang'), $this);
    });
    
    // Duck Tape
    $ctx.find('A.lang-fix').each(function(){
      var $this = $(this);
      $.jalios.I18N.toggleLang($this.attr('lang'), $this);
    });
  }
  
  // ------------------------------------------
  //  PUBLIC
  // ------------------------------------------
 
 /**
  * Jalios I18N:
  * Multilingual framework for JavaScript
  * 
  * @namespace $.jalios.I18N
  * @copyright Jalios SA
  */
  $.jalios.I18N = {
    
    /**
     * Find the property value according to the current language. The property can contain parameter defined by {0}, {1}, {2}, ...<br/>
     * 
     * Properties are declared in server side I18N properties, prefixed with "js.", in  
     * files <code>{lang}.prop</code> and loaded through javascript during page loading.
     * 
     * @example
     * 
     * $.jalios.I18N.glp('error.unknown');
     * => An unknown error occured, please contact an administrator.
     * 
     * @example
     * 
     * $.jalios.I18N.glp('hello.world', 'param1', 'param2');
     * => hello.world defined as Hello {0} ! World {1} !
     * => Hello param1 ! World param2 !
     * 
     * @unittest js/tests/jalios/core/jalios-i18n.html
     * 
     * @param {string} prop the property to translate
     * @param {string ...} arguments used to fill property
     * @return {string} the translated property
     * 
     */
    glp : function(prop) {
      if (typeof I18N === "undefined" ) {
        return prop;
      }
      return I18N.glp.apply(this, arguments);
    },
    
    /**
     * Toggle lang for given element trigger
     * 
     * @param lang {string} the language code
     * @param trigger {element} the trigger 
     */
    toggleLang: function(lang, trigger){
      if (!lang || lang === '') {
        return;
      }

      // Trigger
      var $e = $(trigger || '#'+CtxMenuManager.latestElement);

      // Wrapper
      var $w = $e.closest('FORM');
    
      return $.jalios.I18N.toggleScope(lang, $w);
    },
    
    /**
     * Toggle lang for given wrapper
     * @param lang {string} the language code
     * @param wrapper {element} the wrapper element 
     */
    toggleScope: function(lang, wrapper){
      var $w = $(wrapper);
      if (!$w.exists()){ return; }
      
      // Generate a new id
      var jqid  = $w.identify('jq').attr('id');
      var stamp = $w.data('jalios.lang.stamp');
      if (!stamp){
        stamp = 'lang-'+new Date().getTime();
        $w.addClass(stamp);
        $w.data('jalios.lang.stamp',stamp);
      }
      
      // Remove old rule
      if ($w.data('jalios.lang')){
        JCMS.util.StyleSheet.removeRule('.js .'+stamp+' .wdglang-'+$w.data('jalios.lang'));
      }
      
      // Put CSS Rule
      JCMS.util.StyleSheet.putRule('.js .'+stamp+' .wdglang','display: none;');
      
      // Add new rule
      JCMS.util.StyleSheet.putRule('.js .'+stamp+' .wdglang-'+lang,'display: block;');
      $w.data('jalios.lang', lang);
      $w.attr('lang', lang); // explicit set
      
      // Update all images in the scope
      var img = $('#ctxLangForm IMG.'+lang+'-flag').first();
      $w.find('A.ctxLangForm IMG.iso639flag').each(function(){
        $(this).replaceWith(img.clone());
      });
      
      // Fire tabwdg:change
      document.fire('tabwdg:change', { tabPage: $w.identify() });
    }
  };
  
  // ------------------------------------------
  //  READY
  // ------------------------------------------
    
  // Plugin initialization on DOM ready
  $(document).ready(function($) {
    register();
  });
  
 }(window.jQuery);
  
 