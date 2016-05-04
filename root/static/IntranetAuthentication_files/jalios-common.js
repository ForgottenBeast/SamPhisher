
!function ($) {

  // Namespace
  if (!$.jalios) { $.jalios       = {}; }
  
  // ------------------------------------------
  //  PRIVATE
  // ------------------------------------------
  
  var rJcmsId = /ID_([^ ]+)/;
  var rUsage  = /USAGE_([^ ]+)/;
  
  var cbDelay = $.Callbacks();
  var registerTimer = function(){
  
    $.console.info("[Common] Initializing Idle Timer: 8000ms");
    $(document).idleTimer(8000, {'name' : 'Notifier'});
    
    $(document).on("Notifier.idle", function(){
     $.jalios.Common.idle = true;
    });
    
    $(document).on("Notifier.active", function(){
     $.jalios.Common.idle = false;
     cbDelay.fire();
     cbDelay.empty();
    });
  }
  
  var registerFocus = function(){
    $(document).on('focusin', function(){ $.jalios.DOM.hasFocus = true;  });
    $(document).on('focusout', function(){ $.jalios.DOM.hasFocus = false; });
  }
  
  var baseUrl = false;
  var contextPath = false;
  
  
  var registerResponsive = function() {

    if (typeof(elementQuery) === 'undefined') {
      return;
    }
    
    $(document).on('jalios:refresh', function(event){
      var refresh = $.jalios.Event.match(event, 'refresh', 'after');
      if (!refresh){ return; }
      if (!refresh.target){ return; }

      elementQuery();
    });
    
    $(document).on('show.bs.collapse', function(event) {
      setTimeout(elementQuery, 200);
    });
    
    $(document).on('shown.bs.tab', function(event) {
      setTimeout(elementQuery, 200); 
    });
    
    $(document).on('shown.bs.modal', function(event) {
      setTimeout(elementQuery, 200); 
    });
    
    $(document).on('jalios:broker', function(event) {
      var broker = $.jalios.Event.match(event, 'broker', /toggle/i, true);
      if (!broker){ return; }
      var elm = broker.source.currentTarget; 
      if($(elm).is(':visible')) {
        setTimeout(elementQuery, 200);
      }
    });
    
    elementQuery();
  }
  
  /**
   * Do not follow links with only # ad the end of href
   */
  var registerBTFix = function(){
    $(document).on('click', 'A', function(event){
      var $e   = $(event.currentTarget);
      var href = $e.attr('href'); // JsChecker.authorize(".attr('href')")
      if (href && href.endsWith('#')){
        event.preventDefault();
      }
    });
  }
  
  // ------------------------------------------
  //  PUBLIC
  // ------------------------------------------
  
 /**
  * Add convenient function to Function prototype
  * 
  * @namespace Function
  * @copyright Jalios SA
  */
  
  /**
   * Convennient delay function (inspired by Prototype) to defer execution.
   * This fix many IE6+ thread issues
   * 
   * @example
   *   var func = function(arg1, arg2){ ... }
   *   func.defer(arg1, arg2);
   */
  Function.prototype.defer = function() {
   var __method = this, args = Array.prototype.slice.call(arguments, 0);
   
   return window.setTimeout(function() {
      return __method.apply(__method, args);
   }, 0.01);
  }
  
  /**
   * Convennient delay function (inspired by Prototype)
   * 
   * @param {int} delay the delay in seconds
   * 
   * @example
   *   var func = function(arg1, arg2){ ... }
   *   func.delay(5, arg1, arg2);
   */
  Function.prototype.delay = function(delay) {
   var __method = this, args = Array.prototype.slice.call(arguments, 1);
   var __func = function() {
     return __method.apply(__method, args);
   }
   
   return window.setTimeout(__func,delay*1000);
  }
  
 /**
   * Same as delay function 
   * but If browser is not available, the event will be fired later
   * 
   * @param {int} delay the delay in seconds
   * 
   * @example
   *   var func = function(arg1, arg2){ ... }
   *   func.delay(5, arg1, arg2);
   */
  Function.prototype.postpone = function(delay) {
    var __method = this, args = Array.prototype.slice.call(arguments, 1);
    var __func = function() {
      return __method.apply(__method, args);
    }
     
    if (!$.jalios.DOM.hasFocus){ 
      cbDelay.add(__func);
      return;
    }
     
    if ($.jalios.Common.idle){ 
      cbDelay.add(__func);
      return;
    }
     
    return window.setTimeout(__func,delay*1000);
  }
  
  /**
   * Add prototype endsWith() to String
   */
  if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
  }
  
 // ==========================================
 //  $.jalios.Commons
 // ==========================================

 /**
  * Jalios Commons:<br/>
  * Static funtion missing in core librairies to manipulate: String, Arrays, ...
  * 
  * @namespace $.jalios.Common
  * @copyright Jalios SA
  */
  
  $.jalios.Common = {
    
    idle: false,
    
    /**
     * Strip all spaces in a given string and merge all blank. 
     *
     * @param  {string} str the String to strip
     * @param  {boolean} lazy set true to not merge spaces 
     * @return {string} the stripped String
     * @unittest js/tests/jalios/core/jalios-common.html
     */ 
    strip : function(str, lazy) {
      str = str.replace(/^\s+|\s+$/g, '');
      if (!lazy){
        str = str.replace(/(\s)\s*/g, '$1');
      }
      return str;
    },
    
    /**
     * Check if a given String is blank
     * 
     * @param  {string} str the String to test
     * @return {boolean} true if the String is blank
     * @unittest js/tests/jalios/core/jalios-common.html
     */
    blank: function(str){
      return !str ||  !/\S/.test(str);
    },
    
    /**
     * Inject object into memo using iterator
     * @param {object} object to iterate
     * @param {object} memo receive data
     * @param {function} iterator to walkthrough
     */
    inject: function(object, memo, iterator){
        $.each(object, function (idx, val) {
            memo = iterator(memo, val, idx);
        }); 
        return memo;
    },
    
    /**
     * Convert the given object in to a boolean value, or use
     * default value if object cannot be converted
     */
    toBoolean: function(object, defaultValue) {
      if (typeof object == 'boolean') { return object; }
      if (object == 'false' || object == 'no' ) { return false; }
      if (object == 'true'  || object == 'yes') { return true;  }
      return defaultValue;
    },
    
    shakeIE: function(){
     /*
      if (!Prototype.Browser.IE) { return; }
      $(document.body).toggleClassName("fixIERenderingBug");
      JcmsLogger.debug('ShakeIE','Warning slow IE6 ! Use instead CSS (position: relative; zoom:1)');
     */
    }
  };
  
 // ==========================================
 //  $.jalios.Properties
 // ==========================================

  /**
   * Jalios Properties :
   * Server side configuration framework for JavaScript
   * 
   * @namespace $.jalios.Properties
   * @copyright Jalios SA
   */
   $.jalios.Properties = {

       /**
        * Retrieve the specified property value.
        * 
        * Properties are retrieved from all server side properties prefixed with <code>js.</code> 
        * and declared in file such as <code>custom.prop</code>, <code>webapp.prop</code> and <code>plugin.prop</code>  
        * 
        * @example
        * 
        * js.myplugin.some-feature.duration: 42
        * $.jalios.Properties.get('myplugin.some-feature.duration');
        * => 42
        * 
        * @example
        * You can also declare real javascript code!
        * 
        * js.myplugin.hello-world: function() { alert('Hello World!'); }
        * 
        * $.jalios.Properties.get('myplugin.hello-world')() ;
        * => retrieve function, execute it and display hello world message
        * 
        * @param {string} prop the property to retrieve
        * @return {string} the value of the property or null/undefined if properties could not be found
        */ 
       get : function(prop) {
         if (!JCMS_Properties){
           return null;
         }
         return JCMS_Properties[prop];
       }     
   };
  
 // ==========================================
 //  $.jalios.Event
 // ==========================================

 /**
  * Jalios Event:
  * Event helpers for JavaScript
  * 
  * @namespace $.jalios.Event
  * @copyright Jalios SA
  */
  
  $.jalios.Event = {
    
    /**
     * Perform common tests on Event to check requirement.
     * 
     * @param {object} event the Event to test
     * @param {string} memo the Event's memo name (broker, refresh, ...)
     * @param {pattern} (optional) pattern the Event's type (Some JCMS multipurpose events have a type)
     * @param {boolean} (optional) stop Stop event propagation
     * @param {boolean} (optional) stop Stop event propagation (if multiple action: modal > ajax-refresh)
     * @return {object} the matching memo 
     */ 
    match : function(event, memo, pattern, stop, stopImmediate) {
      
      // No event
      if (!event || !event[memo]){ return false; }
      
      // Data type
      var data = event[memo];
      if (pattern){
        if (!data.type){ return false; }
        if (!data.type.match(pattern)){ return false; }
      }
      
      // Prevent propagation
      if (stop){ 
        event.stopPropagation();
      }
      
      // Prevent other handlers
      if (stopImmediate){
        event.stopImmediatePropagation();
      }
      
      return data;
      
    }
  };
  
 // ==========================================
 //  $.jalios.Http
 // ==========================================
 

 
 /**
  * Jalios Http:<br/>
  * Static funtion missing in core librairies to manipulate: URL, QueryString, ... missing in core librairies. 
  * 
  * @namespace $.jalios.Http
  * @copyright Jalios SA
  */
  $.jalios.Http = {
    
    /**
     * Decode QueryString parameters<br/>
     * Querystring parameters are always encoded and must be decoded before processed.
     * 
     * @param {string} param the parameter or it's key
     * @return {string} decoded parameter
     * @unittest js/tests/jalios/core/jalios-common.html
     */
    decode: function(param){
      return decodeURIComponent( param.replace(/\+/g, ' ') );
    },
  
    /**
     * Encode QueryString parameters
     * 
     * @param {string} param the parameter or it's key
     * @return {string} encoded parameter
     * @unittest js/tests/jalios/core/jalios-common.html
     */
    encode: function(param){
      return encodeURIComponent(param);
    },
    
    /**
     * Convert a QueryString to a JSON Object.<br/>
     * The oposite is <a href="http://api.jquery.com/jQuery.param/">jQuery.param()</a>
     * 
     * @param  {string} str the url to parse 
     * @return {object} a JSON object
     * 
     * @example
     * $.jalios.Http.toQueryParams("http://my.server/webapp/my.jsp?param1=value1&amp;param1=value3&amp;param2=value2")
     * => { param1: ['value1','value3'] , param2: 'value2' }
     * 
     * @unittest js/tests/jalios/core/jalios-common.html
     */
    toQueryParams: function(str, separator) {
      if (!str) return {};
      str =  $.jalios.Common.strip(str);
      
      // MUST contains '=' aka a key/value pairs
      if (str.indexOf('=') < 0) return {};
      
      var match = str.match(/([^?#]*)(#.*)?$/);
      if (!match) return {};
      
      
       return $.jalios.Common.inject(match[1].split(separator || '&'), {}, function(hash, pair) {
        if ((pair = pair.split('='))[0]) {
          var key = decodeURIComponent(pair.shift()),
              value = pair.length > 1 ? pair.join('=') : pair[0];
  
          if (value != undefined) value = $.jalios.Http.decode(value);
  
          if (key in hash) {
            if (!$.isArray(hash[key])) hash[key] = [hash[key]];
            hash[key].push(value);
          }
          else hash[key] = value;
        }
        return hash;
      });
    },
    
    /**
     * Return browser base baseURL computed from base tag
     * 
     * @return {string} the base URL
     * @unittest js/tests/jalios/core/jalios-common.html
     */
    getBaseUrl: function(){
      if (!baseUrl){
        baseUrl = $('BASE').prop('href');
      }
      return baseUrl || '';
    },
    
    /**
     * Return browser context path<br/>
     * 
     * <strong>Implementation note:</strong> A JSP code (server side) set "document._contextPath" in document's head
     * @return the context path
     */
    getContextPath: function(){
      if (!contextPath){
        contextPath = document._contextPath;
      }
      return contextPath || '';
    },
    
    /**
     * Update given url with given params/value pairs replace or add (using regexp)<br/>
     * Note: Develpers should use instead  toQueryParams(), jQuery.param() and jQuery.extend()
     * 
     * @param {string} url the url to start
     * @param {string} param the param to update
     * @param {string} value the value to update
     * @return {string} the updated url
     * @unittest js/tests/jalios/core/jalios-common.html
     */
    getUrlWithUpdatedParam : function(url,param,value){
      var targeturl = url.toString();
          
      re1 = new RegExp("([^\?]*\\?.*)(" + param + "=[^&]*&?)(.*)", "i");
      re2 = new RegExp("([^\?]*\\?)(.*)", "i");
      re3 = new RegExp("([^\?]*)", "i");
      
      var v = value;
      if(v) {
        v = $.jalios.Http.encode(v);
      }
      
      if (targeturl.search(re1) != -1) {
        if (value) {
          targeturl = targeturl.replace(re1,"$1" + param + "=" + v + "&$3");
        } else {
          targeturl = targeturl.replace(re1, "$1" + "$3");
        }
      }
      else if (targeturl.search(re2) != -1) { 
        if (value) {
          targeturl = targeturl.replace(re2, "$1" + param + "=" + v + "&$2");
        } else {
          targeturl = targeturl.replace(re2, "$1" + "$2");
        }
      }
      else { 
        if (value) {
          targeturl = targeturl.replace(re3, "$1?" + param + "=" + v);
        } else {
          targeturl = targeturl.replace(re3, "$1");
        }
      }
      
      return targeturl;
    }
  }
  
 // ==========================================
 //  $.jalios.Ajax
 // ==========================================
 
 /**
  * Jalios Ajax: <br/>
  * 
  * <ul>
  *   <li>Add hooks and filters to improve communication, security, ... between JCMS and Xhr</li>
  *   <li>Add convenient Ajax function </li>
  * </ul>
  * 
  * There is no wrapper on Ajax request. Developers should simply use <a href="http://api.jquery.com/jQuery.ajax/" />jQuery API</a>.
  * 
  * 
  * @namespace $.jalios.Ajax
  * @copyright Jalios SA
  */
  
  $.jalios.Ajax = {
  
    /**
     * <strong>Internal</strong><br/>
     * Callback of jQuery.ajaxPrefilter() to override all jQuery XHR parameter by custom headers.
     * 
     * @param {object} options the XHR options
     */
    _fixHeader: function(options){
      
      options.headers = options.headers || {};
      // Handle AjaxId
      var ajaxId = document.body.id;
      if (ajaxId) {
        options.headers['X-Jcms-Ajax-Id'] = ajaxId; 
      }
      
      // Handle Ajax-Deflate : Keep Ajax request working even after session expiration
      var ajaxCtxtDeflat = $('#AjaxCtxtDeflate');
      if (ajaxCtxtDeflat.exists() && !$.jalios.Browser.isMobileSafari()) {
        options.headers['X-Jcms-Ajax-Deflate'] = ajaxCtxtDeflat.html();
      }
      
      // Handle CSRF Prevention
      var csrfTokenElm = $('#CSRFTokenElm');
      if (csrfTokenElm.exists()) {
        options.headers['X-Jcms-CSRF-Token'] = csrfTokenElm.html(); // see: JCMS.Security.CSRF_TOKEN_HEADER_NAME
      }
    },
    
    /**
     * <strong>Internal</strong><br/>
     * Callback of jQuery.ajaxPrefilter() to display waiting area.
     * 
     * @param {object} options the XHR options
     */
    _fixWait: function(options, defaults, jqXHR){
      
      var before = options.beforeSend;
      var after = options.complete;
      
      options.beforeSend = function(){ $.jalios.Ajax.wait(true);  if (before) before(); }
      options.complete   = function(){ $.jalios.Ajax.wait(false); if (after)  after();  }
      
    },
    
    /**
     * Toggle the wait div according to given parameter
     * 
     * @param {boolean} show to display wait state
     * @param {element} (optional) trigger
     */
    wait: function(show, trigger){
      
      // Setup window status
      var wnd  = parent ? parent : window;
      var wndcursor ='';
      var wndstatus ='';
      var $body = $('BODY');
      
      
      // Get wait window
      var $div = $('#ajax-wait');
      if (!$div.exists()){
        var glp = $.jalios.I18N.glp('info.msg.loading');
        $div = $('<div id="ajax-wait" class="hide">'+glp+'</div>').appendTo($body);
      }
      
      // Toggle visibility
      if (show){
        wndcursor = 'wait';
        wndstatus = I18N.glp('info.msg.loading');
        $div.removeClass("hide");
      } 
      else {
        $div.addClass("hide");
      }
      
      // Set window status
      try { if (wnd.status){ wnd.status = wndstatus; }} catch(e){ /* Security catch */ }
      
      // Set window cursor
      if (trigger){ $(trigger).css('cursor', wndcursor); }
      $body.css('cursor', wndcursor);
    },
    
    /**
     * <strong>Internal</strong><br/>
     * Initialise history management for Ajax requests.<br/>
     * 
     * <ul>
     *   <li>Create HTML component based on Browser version in DIV#rshStorageDiv</li>
     *   <li>Trigger Event jalios:history on change</li>
     *   <li>Already bind to ajax-refresh events</li>
     * </ul>
     * 
     * @fires jalios:history
     * @unittest js/tests/jalios/core/jalios-ajax-refresh.html
     */
    _history: function(){

      if (typeof(History) == 'undefined' || typeof(History.getState) == 'undefined') {
        return;
      }
      
      // No advanced Ajax history for non HTML 5 browser, there'a limit in what we want to maintain without hassle !  
      if (typeof(window.history) == 'undefined' || typeof(window.history.pushState) == 'undefined') {
        $.console.debug("[Common] [History] No History. Stop using outdated browser without modern feature.");
        return;
      }
      
      $.console.debug("[Common] [History] Initializing History");
      
      // History
      $.jalios.Ajax._histIntercept = true;
      $.jalios.Ajax._histIdx = 0;
      
      // Function invoked when we want to revert to a specific state
      var browseBack = function(state) {
        if (!state) {
          $.console.debug("[Common] [History] Skip statechange missing state data");
          return; 
        }
        
        if (!$.jalios.Ajax._histIntercept) {
          $.console.debug("[Common] [History] Skip statechange we triggered", state);
          $.jalios.Ajax._histIntercept = true;
          return;
        }
        
        if (!state.data || !state.data.url || !state.data.target) {
          var $firstTarget = $(History.getStateByIndex(0).data.target);
          if ($firstTarget.exists()) {
            $.console.debug("[Common] [History] Revert to initial state, by refreshing target", $firstTarget, state);
            $firstTarget.refresh({params:{historyRevertToInitialState:true},nohistory:true});
            return;
          }
          $.console.debug("[Common] [History] Skip statechange without original first history target", state);
          return;
        }
        
        // Send an Event
        var event = jQuery.Event("jalios:history");
        event.history = {};
        //event.history.loc = loc;
        event.history.data = state.data;
        $(document).trigger(event);
        
        // Handle Ajax-Refresh to revert to previous state
        $.console.debug("[Common] [History] Revert to state by refreshing target", state.data.target, state);
        $.jalios.AjaxRefresh.refresh(state.data.url, state.data.target, $.extend({}, state.data.options, {nohistory:true}))
      } 

      // Revert to initial state when user come back from another page
      var state = History.getState();
      if (state && state.data && state.data.target) {
        $.console.debug("[Common] [History] Revert to last state in previous page", state);
        browseBack(state);
      }
      
      // Add listener to StateChange Event
      History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        var state = History.getState(); // Note: We are using History.getState() instead of event.state
        browseBack(state);
      });
      
      // Add Ajax-Refresh listener
      $(document).on('jalios:refresh', function(event){
        
        var refresh = $.jalios.Event.match(event, 'refresh', 'success')
        if (!refresh){ return; }
        
        // Check flag nohisotry
        if (refresh.options.nohistory){ return; }
        
        // Can't handle callbacks
        if (refresh.callback){ return }
        
        // Do not stack history
        refresh.options.nohistory = true;
        
        // Add an history entry
        refresh.options.target = false; // because not a periodical
        var historyEntryData = {
          'url'     : refresh.url,
          'target'  : refresh.target.identify().map(function() { return '#' + $(this).attr('id'); }).get().join(','),
          'options' : refresh.options 
        };
        
        // On first Ajax request, update the initial state with the portlet being modified to be able to refresh it when needed
        var firstState = History.getStateByIndex(0);
        if (firstState && firstState.data && !firstState.data.target) {
          $.console.debug("[Common] [History] Update initial state with first portlet being modified", historyEntryData.target);
          firstState.data.target = historyEntryData.target; 
        }
        
        $.jalios.Ajax.addHistory(historyEntryData);
        
      });
    },
    
    /**
     * Add a new entry to Ajax History.
     * 
     * @param data the object to store
     */
    addHistory: function(data){
      if (typeof(History) == 'undefined' || typeof(History.getState) == 'undefined') {
        return;
      }
      
      // Use of a URL parameter is required to provide working back button to the initial request
      $.jalios.Ajax._histIdx++;
      var currentUrlWithoutHash = document.location.href.replace(document.location.hash,"");
      var newUrl = $.jalios.Http.getUrlWithUpdatedParam(currentUrlWithoutHash, 'histstate', $.jalios.Ajax._histIdx);
      
      // Set custom flag to skip this event in the statechange callback
      $.jalios.Ajax._histIntercept = false;
      
      $.console.debug("[Common] [History] Adding History Entry", data, newUrl);      
      History.pushState(data, document.title, newUrl);
    }
  }
  
 // ==========================================
 //  $.jalios.DOM
 // ==========================================
  
  // Remove return false;
  var regxpClick = /^\W*return\W*false\W*$/i;
  
 /**
  * Jalios DOM:<br/>
  * A set of DOM static function to fill the gap between JCMS, jQuery and Prototype.
  * 
  * @namespace $.jalios.DOM
  * @copyright Jalios SA
  */

  $.jalios.DOM = {
    
    _resources: {},
    
    /**
     * Mark the given resource as "loaded".
     * @param {string} path to resource
     * @return {boolean} true if the resources is marked false if alread marked.
     * 
     * @unittest js/tests/jalios/core/jalios-common.html
     */
    markResource: function(path){
    
      // Already marked
      if ($.jalios.DOM._resources[path]){
        return false;
      }
      
      // Mark resource
      $.jalios.DOM._resources[path] = true;
      return true;
    },
    
    /**
     * Mark the given resources as "loaded".
     * @param {string...} paths to resources
     */
    markResources: function(){
      $.each(arguments, function(idx, path){
        $.jalios.DOM.markResource(path);
      });
    },
    
    /**
     * Load a StyleSheet file from its relative path.
     * @param {string} path the CSS path (absolute or relative)
     * @param {string} media an optionnal media for this CSS (default to all)
     * @param {string} version an optionnal version of this file, as defined through JCMS property channel.packer.version
     * @return {boolean} true if the stylesheet has been added
     * 
     * @unittest js/tests/jalios/core/jalios-common.html
     */
    loadStyleSheet : function (path, media, version) {
      
      // Mark resource
      if (!$.jalios.DOM.markResource(path)){
        $.console.info('StyleSheet already imported: ', path);
        return false;
      }
      
      $.console.info('Import StyleSheet', path, version);
      
      // Add LINK to HEAD 
      media = media || 'all';
      path += version ? ('?v=' + version) : '';

      // Fix bug DEVVDP-14 : CSS are not loaded properly in IE7 during/after Ajax request 
      //  do not use the jQuery loading which does not work in IE7 : 
      //     $('HEAD').append('<link rel="stylesheet" href="'+path+'" type="text/css" media="'+media+'" />');      
      //  instead use the classic old method which work fine : 
      var headID = document.getElementsByTagName("head")[0];         
      var cssNode = document.createElement('link');
      cssNode.href = path;
      if (media == 'prefetch'){ // Chrome test: http://prerender-test.appspot.com/
        cssNode.rel = 'prerender prefetch';
      } else {
        cssNode.type = 'text/css';
        cssNode.rel = 'stylesheet';
        cssNode.media = media;
      }
      headID.appendChild(cssNode);
      
      // Shake IE
      if ($.jalios.Browser.isIE) {
        var deferedFunc = function() {
          $('BODY').toggleClass("fixIERenderingBugOnDynamicCssLoad");
        }
        deferedFunc.defer();
      }
      
      return true;
    },
    
    /**
     * Load a JavaScript file from its relative path.<br/>
     * Fire Event jalios:ready when all the javascrip files has been loaded<br/> 
     * <br/>
     * 
     * Trigger event jalios:ready when all javascript has been added.
     * <ul>
     *   <li>&lt;jalios:javascript&gt; is already trigged on jalios:ready</li>
     *   <li>Custom code that relies on javascript loaded MUST wait for this event</li>
     *   <li>The event can be trigged multiple times</li>
     * </ul>
     * 
     * <br/>
     * <strong>Implementation:</strong><br/>
     * Use jQuery magic that do not add script tag in the header
     * 
     * @param {string} path the JS path (absolute or relative)
     * @param {string} version an optionnal version of this file, as defined through JCMS property channel.packer.version
     * @return {boolean} true if the javascript has been added
     * @fires jalios:ready
     * 
     * @unittest js/tests/jalios/core/jalios-common.html
     */
    loadJavaScript : function (path, version) {
      
      // Push resource to load
      $.jalios.DOM._loaded++;
      
      // Mark resource
      if (!$.jalios.DOM.markResource(path)){
        $.console.info('JavaScript already imported: ', path);
        $.jalios.DOM._loadReady.defer(path); // trigger to synchronize
        return false;
      }
      
      $.console.info('Import JavaScript', path, version);
      
      // Load JavaScript, using jQuery AjaxQueue to ensure sequential loading/execution (fix bug such as JCMS-4489)
      $.ajaxQueue({ 
      
        url: path,
        dataType: "script",
        cache: true

      }).always(function(data){
        $.jalios.DOM._loadReady.defer(path); // trigger to synchronize
      });
      
      return true;
    },
    
    _loaded: 0,
    _loadTrigger: $.Callbacks(),
    _loadReady: function(path){
      
      $.jalios.DOM._loaded--;
      if ($.jalios.DOM._loaded > 0){ return; }
      
      // Fire all callback
      $.jalios.DOM._loadTrigger.fire();
      $.jalios.DOM._loadTrigger.empty();
      
      // Fire an event
      var event = jQuery.Event("jalios:ready");
      $(document).trigger(event);
    },
    
    /**
     * <strong>Internal</strong><br/>
     * Called by &lt;jalios:javascript&gt; to trigger script at the end of javascript load
     * @param {function} cb the callback to call once
     */
    _loadRegister: function(cb){
      $.jalios.DOM._loadTrigger.add(cb);
    },
    
    /**
     * Displays information about browser state.
     * True indicate document is focused otherwise false
     */
    hasFocus: true,
    
    /**
     * Follow given element with updated key/value and skip given data:broker event
     * @param {element} elm the element to work with
     * @param {string} skip the component triggering the follow (avoid loop)
     * @param {string} key the key pair to update
     * @param {string} value the value pair to update
     * 
     * FIXME: handle target = _blank (window.open(url,'_blank');)
     */
    follow: function(elm, skip, key, value){

      if (!elm){ return; }
      var $elm = $(elm);
      if (!$elm.exists()){ return; }
      
      // Build event
      var evt = $.Event('click');
      evt.which = 1;
      evt.skip  = skip; 

      // Clean return false;
      var hack = $elm.attr('onclick');
      if (hack && regxpClick.test(hack)){
        $elm.prop('onclick', null);
      }

      if (!key || !value){
        // Simulate click with a given skip info
        $elm.trigger(evt);
        if (evt.isDefaultPrevented()){ return; }
      }

      // Update href value of the trigger
      var href = $elm.prop('href'); // fix bug DEVJCMS-5 : DO NOT use $elm.attr('href') 
      if (href && key && value){
        $elm.attr('href', $.jalios.Http.getUrlWithUpdatedParam(href, key, value));
      }
      
      // Update form value of the trigger
      var $form = $elm.closest('FORM');
      if ($form.exists()){
        // Should we add input name/value ?
      }
      
      // Simulate click with a given skip info
      $elm.trigger(evt);
      if (evt.isDefaultPrevented()){ return; }
      
      // Follow links
      var href = $elm.prop('href'); // fix bug DEVJCMS-5 : DO NOT use $elm.attr('href') 
      if (href){
        var target = $elm.attr('target');
        if (target){ $.jalios.Browser.popup(href, $elm.attr('title')); } 
        else {       $.jalios.Browser.redirect(href); }
        return;
      }
      
      // Follow Input Form
      if ($elm.attr('type') == 'submit'){
        var $form = $elm.closest('FORM');
        $form.append('<input type="hidden" name="'+ $elm.attr('name') +'" value="'+ $elm.attr('value') +'" />');
        $form.submit();
      }
    },
    
    // ----------
    //  IFRAME
    // ----------
    
    /**
     * Check if current code is running in IFrame or main window
     */
    isInIFrame: function() {
      return window != top; // DO NOT use "!==" as it would not work in IE
    },
  
    registerIFrame: function(){
      $.jalios.DOM.setupIFrame();
      $(document).on('jalios:refresh', $.jalios.DOM.setupIFrame);
    },
    
    setupIFrame: function(event){
      var $e = $(document);
      if (event){
        var refresh = $.jalios.Event.match(event, 'refresh', 'after');
        if (!refresh || !refresh.$target){ return; }
        $e = refresh.$target;
      }
      
      $e.find('IFRAME[height="100%"]')
      .each(function(){ $.jalios.DOM.resizeIframeToViewport.defer($(this)); })
      .load(function(){ $.jalios.DOM.resizeIframeToViewport.defer($(this)); });
    },
    
    /**
     * Resize given jquery element to viewport with the given max height.
     * If no max height is providen, max height will be 400px.
     * Do not handle, but catch cross domain exceptions. Handle iFrame navigation.
     * @param {element} $e the IFrame
     * @param {int} max the max height to apply. Set -1 for no max.
     */
    resizeIframeToViewport: function($e, max){
      if (!$e || !$e.exists()){ return; }
      var maxHeight = max || 400;
      var height = maxHeight;
      try {
        height = $e.contents().find('BODY').css('height','auto').outerHeight() + 20;
      } catch(ex){ }
      height = maxHeight !== -1 ? Math.min(maxHeight, height) : height;
      $e.css('height', height + 'px');
    }
  }
  
 // ==========================================
 //  $.fn
 // ==========================================
  
 /**
  * Add convenient function to jQuery function $()
  * 
  * @namespace $.fn
  * @copyright Jalios SA
  */
  
  /**
   * Check if a jQuery object has results
   * @unittest js/tests/jalios/core/jalios-common.html
   */
  $.fn.exists = function(){ return this.length  > 0;}
  
  
  /**
   * Build and set unique id for the given element with given prefix 
   * @param prefix {string} the to append (without '_')
   * @param force {boolean} force new random id
   * @unittest js/tests/jalios/core/jalios-common.html
   */
  $.fn.identify = function(prefix, force) {
    var i = 0;
    prefix = prefix || 'jq';
    return this.each(function() {
      if ($(this).attr('id')) {
        if (force){ 
          var now = new Date().getTime();
          $(this).attr('id', prefix + '_' + now);  
        }
        return; 
      };
      do { 
          i++;
          var id = prefix + '_' + i;
      } while($('#' + id).length > 0);            
      $(this).attr('id', id);            
    });
  };

  /**
   * Call the find() on each next() sibbling. Usefull with ToggleManager
   * @param selector the selector to match
   */
  $.fn.findNext = function(selector){
    return this.nextAll().find(selector);
  }
  
  /**
   * Call the find() on each next() sibbling. Usefull with ToggleManager
   * @param selector the selector to match
   */
  $.fn.findPrev = function(selector){
    return this.prevAll().find(selector);
  }

  /**
   * Returns the match for the given regexp on given element classes
   * @param regexp to match
   * @param group the regexp group to match (default = 1)
   * @return an array of match
   * @unittest js/tests/jalios/core/jalios-common.html
   */
  $.fn.matchClass = function(regexp, group) {
    var group = group || 1;
    var value = [];
    
    this.each(function() {
      var clazz = $(this).attr('class');
      
      if (!clazz) {
        return;
      }
      
      var classes = clazz.split(/\s+/);
      for (var i = 0 ; i < classes.length ; i++) {
        /* recompile the regex */
        regexp.compile(regexp);
        var match = regexp.exec(classes[i]);
        if (match && match.length > group) {
          value.push(match[group]);
        }
      }
    });
    
    return value;
  };
  
  /**
   * Add all the given classes to the given Set. 
   * And update all classes with the following pattern: te-xt-number
   * @param classes string classes separated by spaces
   */
  $.fn.updateClass = function(classes){
    if (!classes){ return; }
    var classes =classes.split(' ');
    return this.each(function() {
      var $this = $(this);
      var cname = $this.attr('class');
      for (var i = 0 ; i < classes.length ; i++){
        if (rClassCpt.test(classes[i])){
          var match = rClassCpt.exec(classes[i]);
          var rexp  =  new RegExp(match[1]+'\\d+');
          var src   =  cname.match(rexp);
          $this.removeClass(''+src);
        }
        $this.addClass(classes[i]);
      }
    });
  }
  
  var rClassCpt = /(([\w_-])+(-+))(\d)+/;
  
  // Form functions
  // ==============
  
  /**
   * Serialize a Form to JSON using underlaying jQuery function and fill the gap.
   * @param filter a subset of keys to retrieve
   * @unittest js/tests/jalios/core/jalios-common.html
   */
   $.fn.serializeObject = function(filter) {
     var o = {};
     var a = this.serializeArray(); 

     $.each(a, function() {
       if (filter && filter[this.name] === undefined){ return; } // Filter
       if (o[this.name] !== undefined) {
         if (!o[this.name].push) {
             o[this.name] = [o[this.name]];
         }
         o[this.name].push(this.value || '');
       } else {
         o[this.name] = this.value || '';
       }
     });
     
     return $.extend(true, {}, filter, o);
   };
  
  /**
   * Fill a form with a JSON Object
   * @param json the json object
   */
  $.fn.populate = function(json){
    var $this = $(this);
    $.each(json, function(key, value){
      $('[name='+key+']', $this).val(value);
    });
  }
  
  /**
   * Returns all form element with given names
   * @param names an array of names
   */
  $.fn.named = function(names){
    var selector = '[name=' + names.join('],[name=') + ']';
    return $(this).find(selector);
  }
  
  // Portal functions
  // ================
  
  /**
   * Check if the elment is a Portlet<br/>
   * <strong>Implementation note:</strong> check element has Class 'Portlet' and a JcmsId
   * 
   * @return {boolean} true if the given element match
   * @unittest js/tests/jalios/core/jalios-common.html
   */
  $.fn.isPortlet = function(){
    if (!$(this).hasClass('Portlet')){ return false; }
    var i = 0, l = this.length;
    for ( ; i < l; i++ ) {
      if (this[i].className == 'Portlet'){ continue; }
      if (this[i].className.match(rJcmsId)){ return true; }
    }
    
    return false;
  }
  
  /**
   * Return the Jcms Id associated with the given element.<br/>
   * @param dataOnly only check the data-jalios-id
   * @return {string} the element's JcmsId. Or false if missing.
   * @unittest js/tests/jalios/core/jalios-common.html
   */
  $.fn.getJcmsId = function(dataOnly){
    var i = 0, l = this.length;
    for ( ; i < l; i++ ) {
      var $this = $(this[i]);
      if ($this.attr('data-jalios-id')){ return $this.attr('data-jalios-id'); }
      if (dataOnly) return;
      
      var clazz = $this.attr('class');
      if (!clazz) continue;
      
      var match = clazz.match(rJcmsId);
      if (match){ return match[1]; }
    }
    return false;
  }
  
  /**
   * Return the template usage of a given element<br/>
   * FIXME: Should handle data-jalios-usage attribute
   * 
   * @return {string} the element's template usage. Or false if missing.
   * @unittest js/tests/jalios/core/jalios-common.html
   */
  $.fn.getUsage = function(){
    var i = 0, l = this.length;
    for ( ; i < l; i++ ) {
      var clazz = this[i].className;
      if (!clazz) continue;
      
      var match = clazz.match(rUsage);
      if (match){ return match[1]; }
    }
    return false;
  }
  
  $.fn['bounds'] = function(){
    var t = this, e = t[0];
    if (!e) return;
   
    var offset = t.offset(), pos = { width:e.offsetWidth, height:e.offsetHeight, left: 0, top: 0, right: 0, bottom: 0, x: 0, y: 0 };
  
    pos.left = offset.left;
    pos.top = offset.top;
  
    //right and bottom
    pos.right = (pos.left + pos.width);
    pos.bottom = (pos.top + pos.height);
    pos.x = pos.left;
    pos.y = pos.top;
    pos.inner = {width: t.width(), height: t.height()};
  
    $.extend(pos, {toString: function(){ var t = this; return 'x: ' + t.x + ' y: ' + t.y + ' width: ' + t.width + ' height: ' + t.height + ' right: ' + t.right + ' bottom: ' + t.bottom; }});
  
    return pos;
  };

  /**
   * Return the max of the given applied function
   * @param selector function to call on collection 
   * @return the max
   */
  $.fn.max = function(selector) { 
    return Math.max.apply(null, this.map(function(index, el) { return selector.apply(el); }).get() ); 
  }

  // ------------------------------------------
  //  DOM READY
  // ------------------------------------------

  $(document).ready(function($) {
    $.console.info("[Common] Initializing jalios-common.js");
  
    // Plug notifier
    registerTimer();
    
    // Plug focus
    registerFocus();
    
    // Plug element query
    registerResponsive();
    
    // Plug Ajax prefilter
    $.ajaxPrefilter($.jalios.Ajax._fixHeader);
    $.ajaxPrefilter($.jalios.Ajax._fixWait);
    
    // Trap hash click
    registerBTFix();
    
    // Plug IFrame detection
    $.jalios.DOM.registerIFrame();
    
    // Plug Really Simple History
    $.jalios.Ajax._history();
  });
  
}(window.jQuery);

