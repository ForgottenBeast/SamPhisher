!function ($) {
    
  // ------------------------------------------
  //  PRIVATE: Register
  // ------------------------------------------
  
  // Action regexp
  var pattern = /modal/i;
  
  
  // Debug function
  var callback = function(event){
    // Skip loop event
    if (event && event.skip == 'modal'){ return; }

    // Check event
    var broker = $.jalios.Event.match(event, 'broker', pattern, true, true);
    if (!broker){ return; }
    // Element
    var elm = broker.source.currentTarget;
    
    // Call show() function
    $.jalios.ui.Modal.open(elm, broker.options);
    
  }
  
  var fallback = function(event){ 
        
    // Skip loop event
    if (event.skip == 'modal'){ return; }
 
    // Prevent click
    event.preventDefault();
    
    // Prevent propagation
    event.stopPropagation();
    
    // Prevent other handlers
    event.stopImmediatePropagation();
    
    // Call show() function
    $.jalios.ui.Modal.open(event.currentTarget);
    // Hide CtxMenu
    $.jalios.ui.CtxMenu.hide();
  }

  var previousModalIdx = 0;
  var restorePreviousModal = function(event) { 
    var $previousModal = $('#jalios-previous-modal-' + previousModalIdx);
    if ($previousModal.exists()) {
      $previousModal.prop('id', 'jalios-modal');
      $previousModal.modal('show');
      previousModalIdx--;
    }
  }
  var backupPreviousModal = function($trigger) {
    var $closestModal = $trigger ? $trigger.closest('DIV.modal') : $('#jalios-modal');
    if ($closestModal.exists() && $closestModal.is(":visible")){
      previousModalIdx++;
      $.jalios.ui.Modal.close(false);
      $('#jalios-modal').prop('id', 'jalios-previous-modal-' + previousModalIdx);
    }
  }
  
  //Takes maximum size to display an image when displaying it in a modal
  var resizeImageModal = function() {
    var $imageModalDialog = $('#jalios-modal').find(".modal-dialog.modal-image");

    if ($imageModalDialog.exists()) {
      var modalFooterHeight = $imageModalDialog.find(".modal-footer").height();
      var $modalImage = $imageModalDialog.find(".modal-body IMG");
      
      // Create new offscreen image to test
      var theImage = new Image();
      theImage.src = $modalImage.attr("src");
      
      // Get accurate measurements from that.
      var imageWidth = theImage.width;
      var imageHeight = theImage.height;

      var widthGap = 60;
      var heightGap = 180;
      
      var windowWidth = $(window).width() - widthGap;
      var windowHeight = $(window).height() - heightGap;
      
      var widthRatio =  imageWidth * 100 / windowWidth;
      var heightRatio = imageHeight * 100 / windowHeight;
      
      var animationRate = 200;
      
      if (widthRatio > 100 || heightRatio > 100) {
        if (widthRatio > heightRatio) {
          $modalImage.animate({"height" : imageHeight * 100 / widthRatio}, animationRate);
          $imageModalDialog.find(".modal-body").animate({"max-height": (imageHeight * 100 / widthRatio) + widthGap}, animationRate, function() {
            $modalImage.animate({"width" : imageWidth * 100 / widthRatio}, animationRate);
            $imageModalDialog.animate({"width": imageWidth * 100 / widthRatio}, animationRate);
          });
        } else {
          $imageModalDialog.find(".modal-body").animate({"max-height" : windowHeight + widthGap}, animationRate);
          $modalImage.animate({"height" : imageHeight * 100 / heightRatio}, animationRate, function () {
            $modalImage.animate({"width" : imageWidth * 100 / heightRatio}, animationRate);
            $imageModalDialog.animate({"width" : imageWidth * 100 / heightRatio}, animationRate);
          });
        }
      } else {
        $imageModalDialog.find(".modal-body").animate({"max-height" : imageHeight + widthGap}, animationRate);
        $imageModalDialog.animate({"width" : imageWidth}, animationRate);
      }
    }
  }
  
  var register = function(){
    // Register to broker
    $(document).on("jalios:broker", callback);
    
    // Register fallback
    $(document).on('click', 'A.modal',       fallback);
    $(document).on('click', ':button.modal', fallback);
    $(document).on('click', ':submit.modal', fallback);
    $(document).on('click', 'area.modal', fallback);
    
    $(document).on('hide.bs.modal', restorePreviousModal);
    $(document).on('shown.bs.modal', resizeImageModal);
    
    // Smart submit
    $(document).on('keydown', function(event){
      if ( event.which != 13 ) {
        return;
      } // Carriage return
      
      var $body = $(document.body);
      if (!$body.hasClass('modal-open')) {
        return;
      }
      
      var $target = $(event.target);
      if ($target.prop('tagName') == 'TEXTAREA') {
        return;
      }
      
      if ($target.is(":input")) {
        var $primary = $body.find('.modal-content .modal-footer .btn-primary').last();
        if (!$primary.exists()) {
          return;
        }
          
        var evt = $.Event('click');
        evt.which = 1;
        $primary.trigger(evt);        
      }

      event.preventDefault();
    });
  }
  
  // ------------------------------------------
  //  PUBLIC
  // ------------------------------------------
  
  // Namespace
  if (!$.jalios)      { $.jalios    = {}; }
  if (!$.jalios.ui)   { $.jalios.ui = {}; }
  
  
  /**
   * Manage Jalios Modals using Bootstrap framework.
   * <br/><br/>
   * 
   * <h5>Trigger</h5>
   * The trigger will be treadted as an Ajax-Refresh trigger for a given Modal. All ajax-refresh features applies.
   * <ul>
   *   <li>Must have class <code>modal</code> or attribute <code>data-jalios-action="modal"</code></li>
   *   <li>Classes <code>alert</code>, <code>confirm</code>, <code>prompt</code>, <code>warning</code> open a custom modal</li>
   *   <li>FIXME: data-jalios-modal="keyboard, static, ..."</li>
   *   <li>FIXME: prompt.jsp vs enter key</li>
   *   <li>FIXME; Resize on ajax-refresh </li>
   * </ul>
   * 
   * <h5>Data</h5>
   * <code>$.jalios.ui.Modal.latest</code> is an object with latest modal information.
   * <ul>
   *   <li>trigger: the trigger opening the modal</li>
   *   <li>value: information given by <code>$.jalios.ui.Modal.close()</code></li>
   * </ul>
   * 
   * <h5>Events</h5>
   * An event <code>jalios:modal</code> is trigged when a modal is closed with the following information.
   * <ul>
   *   <li>modal.type: closed is the event type</li>
   *   <li>modal.latest: references to <code>$.jalios.ui.Modal.latest</code></li>
   * </ul>
   * 
   * @namespace $.jalios.ui.Modal
   * @copyright Jalios SA
   * @see $.jalios.DataBroker
   * @see $.jalios.AjaxRefresh
   * 
   * @example
   * 
   * &lt;%@ include file='/jcore/doInitPage.jsp' %&gt;
   * 
   * &lt;% if (hasParameter("opSubmit")) { %&gt;
   *   &lt;%-- request.setAttribute("modal.redirect", "customRedirect.jsp"); --%&gt;
   *   &lt;%@ include file="/jcore/modal/modalRedirect.jspf" %&gt;
   * &lt;% } %&gt;
   * 
   * &lt;% 
   * if (hasParameter("opRefresh")) { 
   *   String text = getUntrustedStringParameter("text", "");
   *   jcmsContext.setInfoMsg("Your text: " + encodeForHTML(text));
   * }
   * %&gt;
   * 
   * &lt;div class="ajax-refresh-div"&gt;
   *   &lt;a href="debug/modal.jsp" class="ajax-refresh-url" style="display:none"&gt;&lt;/a&gt;
   *   &lt;form action="debug/modal.jsp" method="post" name="editForm"&gt;
   *   &lt;div class="modal-form" style="width:500px;"&gt;
   *   
   *     &lt;div class="modal-header"&gt;
   *       &lt;img src="images/jalios/logos/powered-by-jalios.gif" class="visual"/&gt;  
   *       &lt;h3&gt;Example of form modal&lt;/h3&gt;
   *     &lt;/div&gt;
   *   
   *     &lt;%--  
   *       int step = formHandler.getFormStep(); 
   *       int stepCount = formHandler.getFormStepCount();
   *       String stepPrefixProp = "jcmsplugin...steps.";
   *     %&gt;&lt;%@ include file='/jcore/doSteps.jspf' --%&gt;
   * 
   *     &lt;div class="modal-body"&gt;
   *       &lt;%@ include file='/jcore/doMessageBox.jsp' %&gt;
   *       &lt;div class="info"&gt;The introduction...&lt;/div&gt;
   * 
   *       &lt;input name="text" value="Enter some text" /&gt;
   *     &lt;/div&gt;
   *     
   *     &lt;div class="modal-footer"&gt;
   *       &lt;%-- @ include file='/jcore/doStepButtons.jspf' --%&gt;
   *       &lt;a href="#" class="ajax-refresh"&gt;Refresh Link&lt;/a&gt;
   *       &lt;input type="submit" class="btn" name="opCancel" onclick="return JCMS.window.Modal.close(false);" value="&lt;%= glp("ui.com.btn.cancel") %&gt;"/&gt;
   *       &lt;input type="submit" class="btn ajax-refresh" name="opRefresh" value="&lt;%= glp("ui.com.btn.refresh") %&gt;" /&gt;
   *       &lt;input type="submit" class="btn btn-primary ajax-refresh" name="opSubmit" value="&lt;%= glp("ui.com.btn.save") %&gt;" /&gt;
   *     &lt;/div&gt;
   *   &lt;/div&gt;
   *   &lt;/form&gt;
   *   
   *   &lt;%@ include file='/jcore/doAjaxFooter.jspf' %&gt;
   * &lt;/div&gt;
   * 
   */
  
  $.jalios.ui.Modal = {

    latest: {}, 
    
    /**
     * Open a modal to a given URL
     * <ul>
     *   <li>A common modal is created or reused</li>
     *   <li>An Ajax-Refresh is performed on modal with the given URL</li>
     * </ul>
     * 
     * Options
     * <ul>
     *   <li>callback</li>
     * </ul>
     * 
     * @param {string} url the url to access
     * @param {object} options (optional)
     */
    openFromUrl: function(url, options){ 
      
      backupPreviousModal();
      
      // Build modal if needed
      var $modal =  $.jalios.ui.Modal.getModal();
      if (!$modal || !$modal.exists()){ return; }
      
      // Reset modal's data
      $.jalios.ui.Modal.latest = options || {}
      
      // Show modal
      $modal.modal('show');
      
      // Show perform ajax-refresh
      var opts = $.extend(true, {}, {
        'url'    : url,
        'noscroll'  : true,
        'nohistory' : true
      }, options);
      opts.callback = false;
      $modal.refresh(opts);
      
      // Hide CtxMenu
      $.jalios.ui.CtxMenu.hide();
    },
    
    /**
     * Open a modal to a given Trigger
     * <ul>
     *   <li>A common modal is created or reused</li>
     *   <li>An Ajax-Refresh is performed on modal with the given trigger</li>
     * </ul>
     * 
     * <h5>Custom classes:</h5>
     * <ul>
     *   <li><code>alert</code>: simple alert (ok)</li>
     *   <li><code>confirm</code>: simple confirm (ok/cancel)</li>
     *   <li><code>prompt</code>: simple prompt (ok/cancel/input)</li>
     *   <li><code>warning</code>: simple warnint (ok/cancel)</li>
     * </ul>
     * These custom class append a <code>msg-box</code> class to modal.
     * 
     * <h5>Images:</h5>
     * IMG source ending with jpg|jpeg|gif|png|bmp will open a custom modal (image.jsp).
     * The class <code>ajax-lazy-chunk</code> on a refreshed content trigger resize of the modal after loading.
     * 
     * <h5>IFrame:</h5>
     * Tags with a <code>rel</code> attribute will open a custom modal ({rel}.jsp).
     * <ul>
     *   <li><code>rel="iframe"</code>: open an iframe in a modal</li>
     * </ul>
     * 
     * <h5>data-*</h5>
     * The attribute <code>data-jalios-modal-url</code> is a workaround when <code>data-jalios-ajax-refresh-url</code> can't be used.
     * (Modal could be opened on DIV's clicks)
     * 
     * <ul>
     *   <li>FIXME: Handle CtxMenu Trigger</li>
     * </ul>
     * 
     * @param {element} trigger the trigger 
     * @param {object} options (optional)
     */
    open: function(trigger, options){ 
      if (!trigger){ return false; }

      var $trigger = $(trigger);
      
      // Do not handle action in .disabled
      if ($trigger.is('.disabled') || $trigger.closest('LI').is('.disabled')){
        return false;
      }
      
      backupPreviousModal($trigger);
      
      $.jalios.ui.Modal.latest = options || {}
      $.jalios.ui.Modal.latest.trigger = $trigger;
      
      // Build modal
      var $modal =  $.jalios.ui.Modal.getModal();
      if (!$modal || !$modal.exists()){ return; }
      
      // Case 1: Dialog Message
      var url    = false;
      var helper = false;
           if ($trigger.hasClass('alert'))  { url = 'jcore/modal/alert.jsp';   helper = true; } 
      else if ($trigger.hasClass('confirm')){ url = 'jcore/modal/confirm.jsp'; helper = true; } 
      else if ($trigger.hasClass('prompt')) { url = 'jcore/modal/prompt.jsp';  helper = true; } 
      else if ($trigger.hasClass('warning')){ url = 'jcore/modal/warning.jsp'; helper = true; }
      else if ($trigger.hasClass('permalink')){ url = 'jcore/modal/permalink.jsp'; helper = true; }

      // Set helper data
      if (helper){
        url += '?';
        var msg = $trigger.attr('data-jalios-text') || $trigger.attr('title');
        url += msg ? 'msg='+ $.jalios.Http.encode(msg) +'&' : '';
        $modal.addClass('modal-msg');
        
        var def = $trigger.attr('data-jalios-modal-default');
        if (!def && $trigger.hasClass('permalink')) {
          def = $trigger[0].href;
        }
        url += def ? '&defValue='+$.jalios.Http.encode(def)+'&' : '';
      }
      
      // Case 2: Modal images
      var href = $trigger.get(0).href; // fix bug DEVJCMS-5 : DO NOT use $elm.attr('href')   
      if (href && href.match(new RegExp('(jpg|jpeg|gif|png|bmp)([?][^?]+)*$','img'))) {
        url = 'jcore/modal/image.jsp?url='+  $.jalios.Http.encode(href);
        // In Iframe, display image in a popup
        // FIXME if Util.isInIFrame() Popup.popupWindow(tag.href, tag.readAttribute('title') || tag.href, 640, 480);
      }
      
      // Case 3: Handle data-jalios-modal-url hack when data-jalios-ajax-refresh-url is not available
      var href = $trigger.attr('data-jalios-modal-url');
      if (href){
        url = href;
      }
      
      // Case 4: Url has been forced and override value
      if (options && options.url){
        url = options.url;
      }
      
      // Handle IFrame
      var rel = $trigger.attr('rel');
      if (rel){
        var title = $.jalios.Http.encode($trigger.attr('title'));
        url = 'jcore/modal/'+rel.toLowerCase()+'.jsp?url='+  $.jalios.Http.encode(href);
      }
      
      // Show modal
      $modal.modal('show');
      
      // Show perform ajax-refresh
      var opts = $.extend(true, {}, {
        'target'    : '#jalios-modal', 
        'url'       : url,
        'noscroll'  : true,
        'nohistory' : true,
        'waiting'   : $trigger.hasClass('modal-waiting')
      }, options);
      opts.callback = false;
      $trigger.refresh(opts);
      
      // Hide CtxMenu
      $.jalios.ui.CtxMenu.hide();
    },
    
    /**
     * Open a prompt dialog with given message and call the callback with the given value. 
     * 
     * @param {string} msg the message to display
     * @param {string} callback the callback to call (optional) 
     * @param {string} defvalue the default value to fill prompt (optional)
     */
    prompt: function(msg, callback, defvalue){

      // Build URL
      var url = 'jcore/modal/prompt.jsp?msg='+ $.jalios.Http.encode(msg);
      
      // Append default value to url
      if (defvalue){
        url += '&defValue='+defvalue;
      }
      
      // Open a modal to the given URL
      $.jalios.ui.Modal.openFromUrl(url, { 
        'callback': callback,
        'value' : defvalue
      });
      
      return false;
    },
    
    /**
     * Open a confirm dialog with given message and call the callback with the given value. 
     * 
     * @param {string} msg the message to display
     * @param {string} callback the callback to call (optional) 
     * @param {boolean} reverse the condition (optional) 
     */
    confirm: function(msg, callback, reverse){
      
      // Build URL
      var url = 'jcore/modal/confirm.jsp?msg='+ $.jalios.Http.encode(msg);
      
      // Open a modal to the given URL
      $.jalios.ui.Modal.openFromUrl(url, { 
        'callback': function(value){ 
          if (value  && !reverse){ callback(value); }
          if (!value &&  reverse){ callback(value); }
        }
      });
      
      return false;
    },
    
    /**
     * Open an alert dialog with given message and call the callback with the given value. 
     * 
     * @param {string} msg the message to display
     * @param {string} callback the callback to call (optional) 
     */
    alert: function(msg, callback){
      
      // Build URL
      var url  = 'jcore/modal/alert.jsp?msg='+ $.jalios.Http.encode(msg);
      var opts = {};
      
      if (callback){
        opts['callback'] = function(value){ callback(value); }
      }
      
      // Open a modal to the given URL
      $.jalios.ui.Modal.openFromUrl(url, opts);
      return false;
    },
    
    confirmInModal: function(trigger, callback){
      var $trigger = $(trigger);
      var $modal   = $trigger.closest('DIV.modal .modal-content .modal-footer');
      var text  = $trigger.attr('data-jalios-text') || $trigger.attr('title') || I18N.glp("msg.js.confirm");
      var html  = '<div class="modal-footer modal-confirm fade">'
                  + '<div class="row">'
                    + '<div class="confirm-message col-sm-9">' + text + '</div>'
                    + '<div class="confirm-buttons col-sm-3">'
                      + '<a href="#" class="btn btn-default btn-cancel">' + I18N.glp("com.lbl.cancel") + '</a>'
                      + '<a href="#" class="btn btn-danger btn-confirm">' + I18N.glp("com.lbl.ok") + '</a>'
                    + '</div>'
                  + '</div>'
                + '</div>';
                
      var $html = $(html);      
           
      $html.appendTo($modal).delay(300).queue(function(next){ $(this).addClass('in'); next(); })
      // OK - Cancel
      $(document).on("click",".modal-confirm .btn-cancel, .modal-confirm .btn-danger", function(event){ 
        event.preventDefault();
        
        var $target = $(event.target);
        var $w = $target.closest('.modal-confirm');
        var $that = $(this);

        if ($target.hasClass("btn-confirm")) {
          $(".modal-footer").remove();
          $(".modal-body").addClass("text-center").html($("<img/>").attr("src","images/jalios/icons/wait.gif"));
        }    
         
        $w.removeClass('in').delay(500).queue(function(next){ 
          callback($that.hasClass('btn-danger'));
          $w.remove(); 
          next();
        });
      });
    },
    
    /**
     * Close the current modal and store in <code>$.jalios.ui.Modal.latest.value</code> the given value.
     * 
     * @param value the value to store.
     * 
     * @example
     * <button onClick="$.jalios.ui.Modal.close(true)" />
     */
    close: function(value){
      
      $.jalios.ui.Modal.latest.value = value;
      $('#jalios-modal').modal('hide');
      
      return false;
    },
    
    /**
     * Close the current modal and reload the page.
     * @param {string} url to use for reload (optional)
     */
    closeAndReload: function(url){
      $.jalios.ui.Modal.close();
      if (url){
        $.jalios.Browser.redirect(url);
      } else {
        $.jalios.Browser.reload();
      }
      return false;
    },
    
    /**
     * Close the current modal and trigger an ajax-refresh on the wrapper.
     * Should use closeAndFollow() that will trigger a click on trigger (with skip modal and call to next actions (like ajax-refresh)
     */
    closeAndRefresh: function(){
      $.jalios.ui.Modal.close();
      $.jalios.AjaxRefresh.refreshTarget($.jalios.ui.Modal.latest.trigger);
      return false;
    },
    
    /**
     * Close the current modal and follow link/button event.
     * <ul>
     *   <li>Link are called with parameter value=...</li>
     *   <li>Input/Button 'submit' are submited with their name and input hidden value</li>
     *   <li>Form are submited with their name and input hidden value</li>
     * </ul>
     * 
     * @param {string} value the value to set (optional) 
     */
    closeAndFollow: function(value){
      $.jalios.ui.Modal.close(value);

      // Do not follow if it is an ajax-refresh confirm (kludge)
      if ($.jalios.ui.Modal.latest.callback){
        return false;
      }

      $.jalios.DOM.follow($.jalios.ui.Modal.latest.trigger, 'modal', 'value', value);
      return false;
    },
    
    /**
     * Returns the Common Modal
     * @return modal
     */
    getModal : function(){
      var $modal = $('#jalios-modal');
      if ($modal.exists()){

        // Do not open a modal when already open
        if ($modal.data('bs.modal').isShown){
          $.console.warn('[Modal]','Cannot open a Modal when a modal is already opened'); 
          return; 
        }
        
        // Hide elements before refresh
        $modal.children().hide().remove('A.ajax-refresh-url'); 
        
        // Clean modal (used as targer)
        $modal.prop('class','modal fade ajax-refresh-div').css('width','').css('marginLeft','').removeAttr('data-jalios-ajax-refresh-url');
        
        return $modal;
      }

      // hide fade
      $modal = $('<div id="jalios-modal" class="modal fade ajax-refresh-div" role="dialog" aria-labelledby="modalLabel" aria-hidden="true"></div>').appendTo('BODY');
      $modal.modal({ keyboard: true, backdrop: 'static' });

      $modal.on('hidden.bs.modal', function(event){
        // Fire to the callback
        if ($.jalios.ui.Modal.latest.callback){
          $.jalios.ui.Modal.latest.callback($.jalios.ui.Modal.latest.value);
        }
      });

      $modal.on('click', '.modal-steps A', function(event){
        // Prevent click
        event.preventDefault();
        
        // Prevent propagation
        event.stopPropagation();
        
        // Prevent other handlers
        event.stopImmediatePropagation();
      });
      
      return $modal;
    },
    
    fixWidth: function(context){
      var $modal = $(context || '.modal');
      var $this  = $modal.children('div, form').first();
      var width  = $this.width() || $modal.width();
      
      // Handle iFrame case
      var $iframe = $this.find('IFRAME');
      if ($iframe.exists()){
        try { width = $iframe[0].contentWindow.document.body.offsetWidth;     } 
        catch (ex){ 
          $iframe = false; 
          $.console.warn("[modal] Can't read iFrame properties",ex);  
        }
      } 
      
      // Set margin and width
      var margin = width/2;
      var winW  = $(window).width();
      if (winW/2 < margin){ margin = 0; }
      var $modal = $this.closest('.modal').css('marginLeft',-margin+'px');
      if ($iframe && $iframe.exists()){
        $modal.css('width', (width+18)+'px');
      }
    } 
  }
  
  // Plugin initialization on DOM ready
  $(document).ready(function($) {
    register();
  });
  
}(window.jQuery);


// ------------------------------------------
//  DEPRECATED
// ------------------------------------------

var deprecatedModal = function(fctn){
  jQuery.console.warn("[Deprecated] "+fctn+": JCMS requires the new Modal framework");
  jQuery.console.stacktrace();
}

JCMS                       = window.JCMS || {};
JCMS.window                = JCMS.window || {};
JCMS.window.Modal          = JCMS.window.Modal || {};
JCMS.window.Modal.close    = jQuery.jalios.ui.Modal.close;
JCMS.window.Modal.relocate = function(){ deprecatedModal('Modal.relocate'); };

JCMS.window.Modal.showJSP = function(jsp, callback, params){
  deprecatedModal('Modal.showJSP');

  if (typeof params == "object"){
    jsp += '?'  + jQuery.param(params, true);
  }
  jQuery.jalios.ui.Modal.openFromUrl(jsp , { 'callback' : callback});
}


JCMS.window.Modal.confirm = function(msg, func, usage){
  deprecatedModal('Modal.confirm');
  jQuery.jalios.ui.Modal.confirm(msg , func);
}


//
// This function prompts the given message and provide a text input. 
// Then, if the user confirms (OK button), it execute a javascript
// function.
// 
// @param msg the message to prompt.
// @param func the function to execute.
// @param defvalue the default value of the text input.
// @deprecated use isntead jQuery.jalios.ui.Modal
//
function promptJSAction(msg , func, defvalue){
  deprecatedModal('promptJSAction');
  jQuery.jalios.ui.Modal.prompt(msg , func, defvalue);
}

//
// This function prompts the given message and provide a text input. 
// Then, if the user confirms (OK button), it redirect on the given 
// URL with the input value bound to the given parameter.
// 
// @param msg the message to prompt.
// @param url the url to redirect on.
// @param param the name of the parameter used to provide the input value
// @param defvalue the default value of the text input.
// @deprecated use isntead jQuery.jalios.ui.Modal
//
function promptAction(msg , url, param, defvalue){
  deprecatedModal('promptAction');
  
  jQuery.jalios.ui.Modal.prompt(msg , function(value){
    if (value === false){ return; }
    jQuery.jalios.Browser.redirect(jQuery.jalios.Http.getUrlWithUpdatedParam(url, param, value));
  }, defvalue);
}

//
// This function prompts the given message and execute given function if the user confirms (OK button)
// @param msg the message to prompt.
// @param func the function to run.
// @deprecated use isntead jQuery.jalios.ui.Modal
//
function confirmJSAction(msg, func) {
  deprecatedModal('confirmJSAction');
  
  jQuery.jalios.ui.Modal.confirm(msg , func);
}

//
// This function prompts the given message and redirect on the given URL if the user confirms (OK button)
// @param msg the message to prompt.
// @param url the url to redirect on.
// @deprecated use isntead jQuery.jalios.ui.Modal
//
function confirmAction(msg, url) {
  deprecatedModal('confirmAction');
  
  jQuery.jalios.ui.Modal.confirm(msg , function(){
    jQuery.jalios.Browser.redirect(url);
  });
  
  return false;
}

//
// This function prompts the given message and redirect on the given URL if the user does not confirm (Cancel button)
// @param msg the message to prompt.
// @param url the url to redirect on.
// @deprecated use isntead JCMS.window.Modal
//
function confirmNoAction(msg, url) {
  deprecatedModal('confirmNoAction');
  
  jQuery.jalios.ui.Modal.confirm(msg , function(){
    jQuery.jalios.Browser.redirect(url);
  }, true);
}




