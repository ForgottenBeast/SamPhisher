!function ($) {

  // Namespace
  if (!$.jalios)           { $.jalios           = {}; }
  if (!$.jalios.ui)        { $.jalios.ui        = {}; }
  
  
  // ------------------------------------------
  //  PRIVATE
  // ------------------------------------------

  var register = function(){
    
    $(document).on('focusin', 'DIV.widget INPUT', function(event) {
      var $e = $(event.currentTarget);
      $e.getWidget().addClass('focus-widget');
    });
    
    $(document).on('focusout', 'DIV.widget INPUT', function(event) {
      var $e = $(event.currentTarget);
      $e.getWidget().removeClass('focus-widget');
    });
    
    // Empty the hidden input value which contains the id of the chosen data (.form-control) 
    // when the input chooser is empty
    $(document).on('input propertychange', 'DIV.widget INPUT.form-control-autocomplete', function(event) {
      // Check value
      var $input = $(this);
      if (!$input.val()) {
        $input.next('.form-control').val('');
      }
    });
    
    $(document).on('keydown', 'DIV.widget.keyword INPUT', function(event) {
      
      // Keydown
      $.jalios.ui.Widget.Keyword.resizeKeyword($(this));

    });
    
    $(document).on('click', 'DIV.widget .add-field', doAddFields);
    
    // Keyword resize
    $(document).on('change', 'DIV.widget.keyword INPUT', function(event){
      $.jalios.ui.Widget.Keyword.resizeKeyword($(this));
      $.jalios.ui.Widget.Keyword.toggleClear.defer($(this));
    });
    
    // Smart Focus
    $(document).on('jalios:refresh', function(event){
      var refresh = $.jalios.Event.match(event, 'refresh', 'after');
      if (!refresh){ return; }
      if (refresh.target){ smartFocus(refresh.target, !refresh.options.noscroll); }
    });
    
    // CtxMenu
    $(document).on('jalios:refresh', function(event){
      var refresh = $.jalios.Event.match(event, 'refresh', 'before');
      if (!refresh || !refresh.options){ return; }
      
      var $trigger = $(refresh.options.trigger);
      if ($trigger.getJcmsId() != 'CtxWidget'){ return; }
      
      ctxWidgetMenuHook($trigger, refresh.options.params);
    });
    
    /*
     * This should be use for real attribute required
    var elements = document.getElementsByTagName("INPUT");
    for (var i = 0; i < elements.length; i++) {
      elements[i].oninvalid = function(e) {
          e.target.setCustomValidity("");
          if (!e.target.validity.valid) {
              e.target.setCustomValidity("This field "+ e.target.id +" cannot be left blank");
          }
      };
      elements[i].oninput = function(e) {
          e.target.setCustomValidity("");
      };
    }
    */
  }
  
  var smartFocus = function(e, scroll){
    if (!e){ return; }
    var $e = $(e);
    
    // bypass nofocus div
    if ($e.closest('.no-focus').exists()){ return;  }

    // Narrow search on given area
    var $focus = $e.find('.focus');
    if ($focus.exists()){
      $e = $focus;
    }

    var $input = $e.find(':input:visible:first');
    if ($input.closest('.no-focus').exists()){ return;  }
    if (!$input.exists()){ return; }
    
    if (scroll){
      $input.focus();
      $('html,body').animate({ scrollTop: $input.offset().top - $(window).height()/2 }, 'fast');
    } else {
      $input.focusWithoutScrolling();
    }
  }
  
  /**
   * Clear Fields 
   * @param link the clicked link
   * @param skipRemove (optional) will not remove empty field
   */
  var clear = function(trigger, skipRemove) {
    var $trigger = $(trigger || $.jalios.ui.CtxMenu.$latest);

    var $wrapper = $.jalios.ui.Widget.getWrapper($trigger);
    _clear($wrapper);
    
    // Handle Keyword
    var kw = $.jalios.ui.Widget.Keyword.isInKeyword($trigger);
    var mv = $.jalios.ui.Widget.getWidget($trigger).hasClass('multivalued');
    if (!skipRemove && (kw || mv)) {
      JCMS.form.Widget.remove($trigger[0]);
      return false;
    }
    
  }
  
  var _clear = function($wrapper){
    $wrapper.find('INPUT, SELECT, TEXTAREA').each(function(){
      var $e = $(this);
      if ($e.prop('checked')){ $e.prop('checked', false); }
      else if ($e.prop('selectedIndex')){ $e.prop('selectedIndex',0); }
      else if($e.is(':not(:radio)') && $e.is(':not(:checkbox)')) { $e.val('').change(); }
    });
  }
  
  var doAddFields = function(event) {
    event.preventDefault();
    var $e = $(event.currentTarget);

    var $widget = $.jalios.ui.Widget.getWidget($e);
    var $tabsFieldGroup = $widget.find('.jalios-nav-pills');

    var $lastTab = $tabsFieldGroup.children().last();
    var $tabLink = $lastTab.children();
    var fieldGroup = $tabLink.data('jalios-fieldgroup');
    if(fieldGroup) {
      $('A[data-jalios-fieldgroup=' + fieldGroup + ']').each(function() {
        var $this = $(this);
        var $tabPaneLang = $this.closest('.tab-pane.wdglang');
        var $wrapper = $tabPaneLang.exists() ? $tabPaneLang : $.jalios.ui.Widget.getWidget($this);
        addFields($wrapper);
      });
    }
    else {
      addFields($widget);
    }
  }
  
  var addFields = function($wrapper) {
    $.jalios.Wiki.hideWikiToolbar($wrapper); // Hide wiki toolbar to prevent to duplicate the wiki toolbar
    
    var $tabML = $wrapper.find('.tab-pane.wdglang');
    if ($tabML.exists()) {
      $tabML.each(function() { addField($(this)); });
    } 
    else {
      addField($wrapper);
    }
  }
  
  var addField = function($wrapper) {    
    // Main List
    var $list = $wrapper.find('OL.input-group-list, UL.input-group-list');

    // Create a new element by cloning the last element
    var $clone1 = $list.children().last().clone();
    $clone1.removeClass('active');
    
    $list.append($clone1);
    
    $clone1.find('.form-control').each(function() {
      var $this = $(this);
      updateId($this);
      if($this.hasClass('tinyMceInitialized')) {
        $this.removeClass('tinyMceInitialized'); // Remove this class to initialize this textarea with TinyMCE
        $this.show(); // Display the textarea to obtain the TinyMCE SPAN without display:none
        $this.next('SPAN.mceEditor').remove(); // Remove the cloned TinyMCE SPAN
        // Create new event to trigger the TinyMCE refresh (/js/jalios/wysiwyg/wysiwyg-init.jsp)
        var event = $.Event('jalios:tinymce');
        event.tinymce         = {};
        event.tinymce.type    = 'refresh';
        $(document).trigger(event);
      };
    });
    
    var $fileInput = $clone1.find('.jalios-publication-filebrowser');
    if($fileInput.exists()) {
      updateId($fileInput);
      
      // Enable file input
      if($fileInput.is(':input')) { // classic file input
        $fileInput.prop('disabled', $wrapper.hasClass('disabled')); // Do not enable if the field is disabled
      } else { // plupload
        // Clean the plupload wrapper
        $fileInput.empty();
        // initialize the new plupload
        $fileInput.jcmsPlupload();
      }
      // Show file input
      $fileInput.removeClass('hide');
      
      // Hide and disable publication input
      $clone1.find('INPUT.form-control-display').addClass('hide').prop('disabled', true);
      // Hide and disable publication input
      $clone1.find('INPUT.form-control-value').addClass('hide').prop('disabled', true);
    }
    
    _clear($clone1);
    
    // TextArea / Fieldgroup
    var $tabs = $wrapper.find('.jalios-nav-pills');
    var $clone2 = $tabs.children().last().clone();
    $clone2.removeClass('active');
    $tabs.append($clone2);
    
    // Update the id of the input
    var nid = updateId($clone1);
    if(!nid) {
      return;
    }
    
    // Update the id of the tab link and the 'data-jalios-fieldgroup' attribute if exists
    var clonedTabLink = $clone2.children();
    var cpt = parseInt(nid.substring(nid.lastIndexOf('_') + 1))
    clonedTabLink.attr('href', '#' + nid).html(cpt + 1);
    var fieldGroup = clonedTabLink.data('jalios-fieldgroup');
    if(fieldGroup) {
      var fieldGroupId = fieldGroup.substring(0, fieldGroup.lastIndexOf('_') + 1) + cpt;
      clonedTabLink.data('jalios-fieldgroup', fieldGroupId);
      clonedTabLink.attr('data-jalios-fieldgroup', fieldGroupId);
    }
  }
  
  var updateId = function(elt) {
    var $elt = $(elt);
    var id = $elt.attr('id');
    if (id) {
      var prefix = id.substring(0, id.lastIndexOf('_') + 1);
      var cpt = parseInt(id.substring(id.lastIndexOf('_') + 1)) + 1;
      var newId = prefix + cpt;
      
      $elt.attr('id', newId);
      return newId;
    }
    return false;
  }
  
  // ==========================================
  //  CTXMENU
  // ==========================================
  
  var ctxItems = {
   UI_EDITOR_COLORCHOOSER:        'F',
   UI_EDITOR_IMAGEPATH:           'I',
   UI_EDITOR_SIMPLEIMAGEPATH:     'I',
   UI_EDITOR_MEDIAPATH:           'M',
   UI_EDITOR_SIMPLEMEDIAPATH:     'M',
   UI_EDITOR_DATECHOOSER:         'V',
   
   UI_EDITOR_MEMBERCHOOSER:       'EHJY',
   UI_EDITOR_GROUPCHOOSER:        'EGY',
   UI_EDITOR_PUBLICATIONCHOOSER:  'ELXMSCcY',
   UI_EDITOR_PUBLICATIONSCHOOSER: 'ELXMSCcY',
   UI_EDITOR_CATEGORYCHOOSER:     'EZY',
   UI_EDITOR_CATEGORIESCHOOSER:   'EZY',
   UI_EDITOR_WORKSPACECHOOSER:    'EOY',
   UI_EDITOR_QUERYCHOOSER:        'QY',
   UI_EDITOR_ACLCHOOSER:          'Y',
   UI_EDITOR_SQLQUERY:            '',
   UI_EDITOR_DBRECORDCHOOSER:     ''
  }
  
  var ctxWidgetMenuHook = function($elm, options){
    
    var $widget  = $elm.getWidget();
    var $wrapper = $.jalios.ui.Widget.getWrapper($elm);
    
    // Items
    options.items = '';

    // Items: base
    var classes = $widget.attr('class').split(/\s+/);
    for (var i = 0 ; i < classes.length ; i++){
      if (!ctxItems[classes[i]]){ continue; }
      options.items += ctxItems[classes[i]];
    }
    
    // Items: MV
    if ($wrapper.is('LI')){
      options.items = ($wrapper.parent().is('OL') && !$widget.hasClass('nodnd')) ? ('R'+options.items+'-ATUD-') : (options.items+'-AT-');
    } else {
      options.items = 'R' + options.items;
    }
    
    // Items: ML
    if ($widget.is('ml')){
      options.items += 'y';
    }
    
    // Language
    options.lang = $.jalios.ui.Widget.getLanguage($elm);
    
    var $chooser = $wrapper.find('INPUT.formChooserfield');
    if (!$chooser.exists()){ return; }
    
    // Chooser Id
    options.chooserId = $chooser.val();
    
    // Chooser Type
    options.chooserType = $widget.matchClass(/super_([\w\.]+)/, 1) || false;
  }
  
  // ==========================================
  //  WIDGET
  // ==========================================
  
  /**
   * Utility function for widgets
   */
  $.jalios.ui.Widget = {
    
    /**
     * Return the wrapping widget DIV
     * @param {element} elm the trigger
     */
    getWidget: function(elm){
      if (!elm){ return; }
      var $e = $(elm);
      return $e.closest('DIV.widget, SPAN.widget');
    },
    
    /**
     * Return the first wrapper of element DIV or LI if multivalued widget
     * @param {element} elm the trigger
     */
    getWrapper: function(elm){
      if (!elm){ return; }
      var $e = $(elm);
      var $w = $e.closest('LI, DIV');
      return $w.is('.input-group-btn') ? $w.parent() : $w;
    },
    
    /**
     * Return the language for given widget element 
     * @param {element} elm the trigger
     */
    getLanguage: function(elm){
      if (!elm){ return; }
      var $e = $(elm);
      return $e.closest('DIV.wdglang').matchClass(/wdglang-(\S+)/, 1) || false;
    },
    
    'smartFocus': smartFocus,
    'clear': clear
  }
  
  // ==========================================
  //  KEYWORD
  // ==========================================

  /**
   * Specific function for Widget Keyword
   */
  $.jalios.ui.Widget.Keyword = {
  
    isInKeyword: function(elm) {
      return $.jalios.ui.Widget.getWidget(elm).hasClass('keyword');
    },
    
    resizeKeyword: function(input){
      if (!$.jalios.ui.Widget.Keyword.isInKeyword(input)){ return; }
      var $input = $(input);
      $input.attr('size', $input.val().length || 1);
    },
    
    toggleClear: function(input){
      if (!$.jalios.ui.Widget.Keyword.isInKeyword(input)){ return; }
      var $input = $(input);

      // $input.parent().find('BUTTON[data-jalios-action^="chooser:"]').first().remove();
      // $input.parent().find('BUTTON[data-jalios-action^="chooser:"]').first().addClass('hide');
      // $input.parent().find('BUTTON[data-jalios-action^="widget:clear"]').removeClass('hide');
    } 
  }

  // ==========================================
  //  $.fn
  // ==========================================
  
  /**
   * Helper to retrieve wrapping widget of given element.
   */
  $.fn.getWidget = function(){
    return $.jalios.ui.Widget.getWidget(this);
  }
  
  /**
   * Helper to perform smart focus in the wrapping DIV 
   */
  $.fn.smartFocus = function(){
    return $.jalios.ui.Widget.smartFocus(this);
  }
  
  $.fn.focusWithoutScrolling = function(){
    if (!this.exists()){ return; }
    var x  = window.scrollX, y = window.scrollY, $w = $(window);
    
    this.parents('DIV').each(function(){
      if ($(this).css('overflow') != 'auto'){ return; }
      $w = $(this);
      y = $w.scrollTop();
      x = $w.scrollLeft();
      return false;
    });
    
    this.focus();
    $w.scrollTop(y);
    $w.scrollLeft(x);
  };
  
  /**
   * Toggle the field to be disabled or not.
   */
  $.fn.toggleDisabledField = function() {
    $(this).toggleClass('disabled');
    $(this).find(':input').prop('disabled', function (_, val) { return ! val; });
    $(this).find('A.ctxLangForm').toggleClass('disabled');
  }
  
  var _addClass = $.fn.addClass;
  $.fn.addClass = function(clazz){
    var r = _addClass.apply(this, arguments);
    if (this.exists() && (clazz == 'active' || clazz == 'in')){
      smartFocus(this);
    }
    return r;
  }
  
  var _removeClass = $.fn.removeClass;
  $.fn.removeClass = function(clazz){
    var r = _removeClass.apply(this, arguments);
    if (this.exists() && (clazz == 'hide' || clazz == 'hide-scroll')){
      smartFocus(this, clazz == 'hide-scroll');
    }
    return r;
  }
  
  // ==========================================
  //  READY
  // ==========================================
  

  // Plugin initialization on DOM ready
  $(document).ready(function($) {
    register();
  });

}(window.jQuery);