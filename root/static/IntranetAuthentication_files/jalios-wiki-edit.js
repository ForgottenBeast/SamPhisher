!function ($) {

  // ------------------------------------------
  //  PRIVATE
  // ------------------------------------------
  
  var register = function(){
    init();
    toolbar();
    upgrade();
  };
  
  var linkEdit   = false;
  var linkSave   = false;
  var linkCancel = false;
  var $widget    = false;
  var $last      = false;
  var init = function(){
    
    // Build Edit Link
    linkEdit  = '<img alt="" src="images/jalios/icons/editSmall.gif" class="icon">';  
    linkEdit  = '<button class="wiki-action wiki-edit-section hidden-print btn btn-link">' + linkEdit +'</button>'

    // Build Save Link
    linkSave = '<button class="wiki-action wiki-save-section btn btn-primary btn-xs">' + $.jalios.I18N.glp("wiki.section.save") +'</button>'
    
    // Build Cancel Link
    linkCancel = '<button class="wiki-action wiki-cancel-section btn btn-default btn-xs">' + $.jalios.I18N.glp("wiki.section.cancel") +'</button>'
    
    // Bind events
    $(document).on('click', '.wiki-edit-section',   callback);
    $(document).on('click', '.wiki-save-section',   callback);
    $(document).on('click', '.wiki-cancel-section', callback);
    
    // Build Widget
    $widget = $('<div id="edit-widget" class="edit-widget" ></div>').appendTo(document.body);
    
    // Ajax-Refresh
    $(document).on('jalios:refresh', upgrade);
  }
  
  var callback = function(event){
    event.preventDefault();
    
    var $e = $(event.currentTarget);
    if ($e.hasClass('wiki-edit-section')){
      edit($e);
    } else if ($e.hasClass('wiki-save-section')){
      save($e);
    } else if ($e.hasClass('wiki-cancel-section')){
      cancel($e);
    }
  }
  
  var edit = function($e){
    // Cancel previous
    cancel();
    
    $($e.eq(0)).closest(".wiki-edit").addClass("wiki-edit-enabled");
    
    var ctxt = computeSection($e);
    if (!ctxt.id || !ctxt.field){ return; }
    
    // Toggle section
    var bounds = toggleSection(ctxt);
    if (!bounds){ return; }
    
    
    var supportScrollY = window.scrollY !== undefined;
    var supportPageOffset = window.pageXOffset !== undefined;
    var scrollYOffset;
    
    
    //Resolve scrollY position, since scrollY is not handled by IE (Use pageYOffset instead)
    if (supportScrollY) {
      scrollYOffset = window.scrollY;
    } else if (supportPageOffset) {
      scrollYOffset = window.pageYOffset;
    } else {
      var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
      scrollYOffset = isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
    }

    //Do not display a textarea with a height superior to display window
    var computedHeight = Math.max(Math.min($(window).height() - (bounds.top - scrollYOffset) - 40, bounds.height), 200);
    
    // Show widget
    $widget.css('left',   bounds.left   +'px')
           .css('top',    bounds.top    +'px')
           .css('width',  bounds.width  +'px')
           .css('height', computedHeight +'px')
           .show();      

           
    // Retrieve content
    var url  = 'jcore/wiki/wikiSection.jsp?';
        url += 'id='+ctxt.id + '&field='+ctxt.field + '&section='+ctxt.index + '&mdate='+ctxt.mdate + (ctxt.wikiwygOptionSet ? '&wikiwyg='+ctxt.wikiwyg : '');
    
    $e.refresh({
      'url'       : url,
      'target'    : $widget,
      'noscroll'  : true,
      'nohistory' : true,
      'callback'  : setupEditor
    });
  }
  
  var save = function($e){
    var ctxt = computeSection($e);
    if (!ctxt.id || !ctxt.field){ return; }
    
    var $textarea = $widget.find('TEXTAREA');
    
    // When working with wikiwyg, trigger save of html2wiki in textarea
    var tinymceEditor = window['tinyMCE'] != undefined && tinyMCE.get($textarea.attr('id'));
    if (tinymceEditor) { tinymceEditor.save(); }
    
    var url  = 'jcore/wiki/wikiSection.jsp?';
        url += 'id='+ctxt.id+'&field='+ctxt.field+'&section='+ctxt.index+'&mdate='+ctxt.mdate;
        url += '&update='+encodeURIComponent($textarea.val());
    
    $e.refresh({ // FIXME: Kludge: Use Ajax-Refresh has an Ajax-Request
      'url'       : url,
      'noresponse': true,
      'callback'  : function(){ 
        cancel();
        $e.refresh({ 'noscroll': true, 'nohistory': true })
      }
    });
  }
  
  var cancel = function($e){
    if (!$last){ return; }
    
    $last.removeClass('wiki-editing');
    $widget.hide();
    
    if (!$e){ return; }
    
    $($e.eq(0)).closest(".wiki-edit").removeClass("wiki-edit-enabled");
    
    var id  = $e.closest('.wiki-edit').getJcmsId();
    var url = 'jcore/wiki/wikiSection.jsp?id='+id+'&unlock=true';
    $e.refresh({ // FIXME: Kludge: Use Ajax-Refresh has an Ajax-Request
      'url'       : url,
      'noresponse': true
    });
  }
  
  var upgrade = function(event){
    var $e =  $(document);
    
    var refresh = $.jalios.Event.match(event, 'refresh', 'after')
    if (refresh && refresh.target){
      $e = refresh.target;
    }
    
    $e.find('.wiki-edit').each(function(){
      var $that = $(this);
      
      if (!$that.hasClass('wiki-edit-upgrade')){
        $that.addClass('wiki-edit-upgrade');
        $that.append(linkEdit).append(linkSave).append(linkCancel);
      }
      
      $that.find('.wiki-section').not('.wiki-section-upgrade').each(function(){
        $(this).addClass('wiki-section-upgrade').append(linkEdit).append(linkSave).append(linkCancel);
      });
    });
  }

  // ------------------------------------------
  //  WIKIWYG
  // ------------------------------------------
  
  var setupEditor = function(){
    var $textarea = $widget.find('TEXTAREA');
    
    if ($.browser.msie){ 
      $textarea.attr('rows', '1'); 
      $textarea.css('height', ($widget.height() - 4) + 'px');
    }
  
    if ($textarea.hasClass("formWikiwyg")){
      resizeEditor.defer($textarea);
    }
  }
  
  var resizeEditor = function($textarea) {
    var tinymceEditor = window['tinyMCE'] != undefined && tinyMCE.get($textarea.attr('id'));
    if (!tinymceEditor){
      resizeEditor.defer($textarea);
      return;
    }

    var $table  = $('#'+tinymceEditor.id+'_tbl');
    var $iframe = $('#'+tinymceEditor.id+'_ifr');
    
    $iframe.css('width', $widget.width() + 'px').css('height', $widget.height() + 'px');
    $table.css('width' , $widget.width() + 'px').css('height', $widget.height() + 'px');
  }
  
  // ------------------------------------------
  //  SECTION
  // ------------------------------------------
  
  /**
   * Compute all data about a section
   */
  var computeSection = function($e){

    var $section = $e.closest('.wiki-section');
    var $wrapper = $e.closest('.wiki-edit');
    
    return {
      section : $section,
      index   : indexSection($section),
      wrapper : $wrapper,
      id      : $wrapper.getJcmsId(),
      field   : $wrapper.matchClass(/wiki-field-(\S+)/g),
      mdate   : $wrapper.matchClass(/wiki-mdate-(\d+)/g),
      wikiwyg : $wrapper.hasClass('wikiwyg'),
      wikiwygOptionSet : $wrapper.hasClass('wikiwyg') || $wrapper.hasClass('no-wikiwyg') 
    }
  }
  
  /**
   * Return coded section index
   */
  var indexSection = function($section) {
    if (!$section.exists()){ return 0; }
    var index = '';
    
    var sectionLevel = parseInt($section.prop('tagName').match(/\d/)); // H1-3
    var count = 1;
    $section.prevUntil(false,'.wiki-section').each(function(){
      
      var level = parseInt($(this).prop('tagName').match(/\d/)); // H1-3
      if (level == sectionLevel){ count++; }
      if (level <  sectionLevel){
        sectionLevel = level;
        index = count+'-'+index; 
        count = 1;
      }
    });
    index = count+'-'+index;
    return index.substring(0,index.length-1);
  }
  
  /**
   * Return next >= section 
   */
  var nextSection = function($section) {
    var sectionLevel = parseInt($section.prop('tagName').match(/\d/)); // H1-3
    var $next = false;
    $section.nextUntil(false,'.wiki-section').each(function(){
      var level = parseInt($(this).prop('tagName').match(/\d/)); // H1-3
      if (level <= sectionLevel){
        $next = $(this);
        return false;
      }
    });
    return $next;
  }
  
  /**
   * Toggle a given section
   */
  var toggleSection = function(context){
  
    var $section = context.section.exists() ? context.section : context.wrapper;
    if (!$section.exists()){ return false; }
    
    // Backup
    $last = $section;
   
    // Add Class
    $section.addClass('wiki-editing');
    
    // Compute bounds
    if (!context.section.exists()){
      return context.wrapper.bounds();
    }
    
    // Compute bounds
    var $section = context.section;
    var bounds   = $section.bounds();
    var $next    = nextSection($section);
    
    bounds.top += bounds.height;
    bounds.height = $next ? $next.bounds().top - bounds.bottom 
                          : context.wrapper.bounds().bottom - bounds.bottom;

    return bounds;
  }
  
  // ------------------------------------------
  //  WIKITOOLBAR
  // ------------------------------------------
  
  var toolbar = function() {
    
    $(document).on('focusin', 'TEXTAREA.wikiarea', function() {
      $.jalios.Wiki.showWikiToolbar(this);
    });
    
    $(document).on('jalios:refresh', function(event){
      var refresh = $.jalios.Event.match(event, 'refresh', 'before');
      if (!refresh){ return; }
      
      hideWikiToolbar(refresh.target);
    });
  }
  
  var showWikiToolbar = function(input) {
    var $input  = $(input);
    var $widget = $input.getWidget();
    
    if (!$widget.exists()){ return; }
    if ($widget.hasClass('disabled')){ return; }
    
    // WikiArea
    var $toolbar = $('#wikitoolbar');
    if (!$toolbar.exists()){ return; }
    
    $input.after($toolbar);
    // $toolbar.css('width', $input.width() + 'px');
    WikiToolbar.hidePreview(null, input);
    $toolbar.show();
  }
  
  var hideWikiToolbar = function($container) {
    hideBar($('#wikitoolbar'), $container);
  }
  
  var hideBar = function($bar, $container) {
    if (!$bar.exists()){ return; }
    if ($container.exists() && !$bar.closest($container).exists()){ return; }
    $bar.appendTo($(document.body)); $bar.hide();
  }
  
  // ------------------------------------------
  //  PUBLIC
  // ------------------------------------------
  
  // Namespace
  if (!$.jalios) { $.jalios = {}; }
  
  $.jalios.Wiki = {
    'showWikiToolbar' : showWikiToolbar,
    'hideWikiToolbar' : hideWikiToolbar
  } 
  
  $.jalios.Wiki.Edit = { 
    'edit'   : edit,
    'save'   : save,
    'cancel' : cancel
  }
  
  // ------------------------------------------
  //  READY
  // ------------------------------------------
  
  // Plugin initialization on DOM ready
 $(document).ready(function($) {
    register();
  });
  
}(window.jQuery);