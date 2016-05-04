
  // -----------------------------------------------------------------------------------
  //  WIKITOOLBAR
  // -----------------------------------------------------------------------------------


  if (!window.WikiToolbar) {
    var WikiToolbar = new Object();
  }
  
  Object.extend(WikiToolbar,{

    // ----------------------------------------------------
    //  INIT
    // ----------------------------------------------------

    /**
     * Inits (lazy) all elements WikiToolbars.
     */
    _init: false,
    initWikiToolbar: function(){
      if (WikiToolbar._init){ return; }  
      WikiToolbar._init = true;
      
      var t0 = new Date().getTime();
      
      Event.observe('wikitoolbar',"mousedown",JCMS.form.Widget.dragStart);
      
      var t1 = new Date().getTime();
      JcmsLogger.info('WikiToolbar', 'Init WikiToolbar Manager', ' in '+(t1-t0)+' ms');
    },

    // ----------------------------------------------------
    //  WIKI FUNCTION
    // ----------------------------------------------------

    _word: function(selection){
      if (selection.start > selection.end){ return; }
      
      var start = selection.start;
      var end   = selection.end;
      var value = selection.input.value;
      
      if (start == end){ start--;  }
      
      var chr   = value.charAt(start);
      while (start >= 0 && chr!=' ' && chr!='\n' && chr!='\r') { start--; chr = value.charAt(start); }
      return value.substring(start+1,selection.end);
    },

    // ----------------------------------------------------
    //  WIKI FUNCTION
    // ----------------------------------------------------
    
    runLineBreak: function(event){
      JcmsLogger.debug('WikiToolbar','runLineBreak');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceSelection(context.input,"#\n",true);
      return false;
    },
    runPublink: function(event){
      JcmsLogger.debug('WikiToolbar','runPublink');
      var context   = WikiToolbar.getContext(event);
      this.currentSelection = InputUtil.getSelection(context.input,true);
      var wsid = Element.getJcmsId(document.body,'WS_');
      Popup.popupWindow(context.ctxPath+"/work/pubChooser.jsp?textFieldPubLink=true&jsFunc=WikiToolbar.insertPubLinkCallback&ws="+wsid,'pubChooser',1200,700,false,true,true,false);
      return false;
    },
    runPubUrl: function(event){
      JcmsLogger.debug('WikiToolbar','runPubUrl');
      var context   = WikiToolbar.getContext(event);
      this.currentSelection = InputUtil.getSelection(context.input,true);
      var txt = this.currentSelection.value ? encodeURIComponent(this.currentSelection.value) : "";
      Popup.popupWindow(context.ctxPath+"/work/wikiLink.jsp?txt="+txt+"&jsFunc=WikiToolbar.insertWikiLinkCallback",'pubChooser',400,210,false,true,false,false);
      return false;
    },
    runInsertMedia: function(event){
      JcmsLogger.debug('WikiToolbar','runInsertMedia');
      var context   = WikiToolbar.getContext(event);
      this.currentSelection = InputUtil.getSelection(context.input,true);
      var wsid = Element.getJcmsId(document.body,'WS_');
      jQuery.jalios.ui.Widget.Chooser.openDataChooser('media', WikiToolbar.insertMediaUrlCallback, {
        params : { 'ws': wsid }
      });
      return false;
    },
    runBold: function(event){
      JcmsLogger.debug('WikiToolbar','runBold');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^\*(.+)\*$/gm,"$1","*$1*",true);
      return false;
    },
    runSnippet:function(event, ahref){

      JcmsLogger.debug('WikiToolbar','runSnippet');
      var img = ahref.fastChild('IMG');
      var replace = img.alt.replace('{0}','$1');
      
      var context   = WikiToolbar.getContext(event);
      var selection = InputUtil.getSelection(context.input,true);
      InputUtil.replaceRegexp(selection.input,/^(.+)$/g,replace,replace,true, true, selection);

      return false;
    },
    runItalic: function(event){
      JcmsLogger.debug('WikiToolbar','runItalic');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^_(.+)_$/gm,"$1","_$1_",true);
      return false;
    },
    runBoldItalic: function(event){
      JcmsLogger.debug('WikiToolbar','runBoldItalic');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^__(.+)__$/gm,"$1","__$1__",true);
      return false;
    },
    runFixed: function(event){
      JcmsLogger.debug('WikiToolbar','runFixed');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^=(.+)=$/gm,"$1","=$1=",true);
      return false;
    },
    runBoldFixed: function(event){
      JcmsLogger.debug('WikiToolbar','runBoldFixed');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^==(.+)==$/gm,"$1","==$1==",true);
      return false;
    },
    runOrderedList: function(event){
      JcmsLogger.debug('WikiToolbar','runOrderedList');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^(.+)$/gm,"   1 $1","   1 $1",false);
      return false;
    },
    runUnorderedList: function(event){
      JcmsLogger.debug('WikiToolbar','runUnorderedList');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^(.+)$/gm,"   * $1","   * $1",false);
      return false;
    },
    runOutdent: function(event){
      JcmsLogger.debug('WikiToolbar','runOutdent');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^[\n\r\t]*[ ]{3}([\d\*][ ])*(.+)$/gm,"$2","$1",false);
      return false;
    },
    runIndent: function(event){
      JcmsLogger.debug('WikiToolbar','runIndent');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^(.+)$/gm,"   $1","   $1",false);
      return false;
    },
    runHorizontalRule: function(event){
      JcmsLogger.debug('WikiToolbar','runHorizontalRule');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^\s*-{30}(.*)\n*$/g,"$1","\n------------------------------\n$1",false, true);
      return false;
    },
    runHeading1: function(event){
      JcmsLogger.debug('WikiToolbar','runHeading1');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^\s*---\+\+\s(.+)$/gm,"$1","---++ $1",false);
      return false;
    },
    runHeading2: function(event){
      JcmsLogger.debug('WikiToolbar','runHeading2');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^\s*---\+\+\+\s(.+)$/gm,"$1","---+++ $1",false);
      return false;
    },
    runHeading3: function(event){
      JcmsLogger.debug('WikiToolbar','runHeading3');
      var context = WikiToolbar.getContext(event);
      InputUtil.replaceRegexp(context.input,/^\s*---\+\+\+\+\s(.+)$/gm,"$1","---++++ $1",false);
      return false;
    },
    runSearch: function(event){
      JcmsLogger.debug('WikiToolbar','runSearch');
      // TODO: Rewrite wikiSearchReplace.jsp
      var context = WikiToolbar.getContext(event);
      var targetInput = "document."+context.formName+".elements["+context.getInputPos()+"]";
      if (isIE) {
        window.showModelessDialog(context.ctxPath+"/work/wikiSearchReplace.jsp", context.input, 'help:no;status:no;scroll:no;dialogWidth:300px;dialogHeight:250px;');
      } else { 
        Popup.popupWindow(context.ctxPath+"/work/wikiSearchReplace.jsp?targetInput="+targetInput,'Search',330,400,false,true,false,false);
      }
      return false;
    },
    runSpell: function(event){
      JcmsLogger.debug('WikiToolbar','runSpell');
      // TODO: Rewrite wikiSpellChecker.jsp
      var context = WikiToolbar.getContext(event);
      var targetInput = "document."+context.formName+".elements["+context.getInputPos()+"]";
      if (isIE) {
        window.showModelessDialog(context.ctxPath+"/work/wikiSpellChecker.jsp?lang="+context.input.lang, context.input, 'help:no;status:no;scroll:no;dialogWidth:400px;dialogHeight:300px;');
      } else { 
        Popup.popupWindow(context.ctxPath+"/work/wikiSpellChecker.jsp?targetInput="+targetInput+"&lang="+context.input.lang,'SpellChecker',400,250,false,true,false,false);
      }
      return false;
    },
    runQuery: function(event){
      JcmsLogger.debug('WikiToolbar','runQuery');
      var context = WikiToolbar.getContext(event);
      this.currentSelection = InputUtil.getSelection(context.input,true);

      jQuery.jalios.ui.Widget.Chooser.openDataChooser('query', WikiToolbar.insertQueryCallback);
      return false;
    },
    
    
    getPreview: function() {
      var preview = $('wikipreview');
      if (!preview){
        preview = document.createElement('IFRAME');
        preview.id = 'wikipreview';
        preview.className = 'wikipreview';
        
        document.body.appendChild(preview);
        preview = $(preview);
        preview.addClassName('hidden');
      }
      return preview;
    },
    
    hidePreview: function(event, input) {
      input = input || WikiToolbar.getContext(event).input;
      var preview = this.getPreview();
      
      if (preview.hasClassName('show')) {
        jQuery('#wikitoolbar button').prop('disabled', false);
        jQuery('#wikitoolbar').removeClass('preview-enabled');
        try { clearInterval(WikiToolbar.wikiPreviewResizeTimer); } catch(err) { };
        preview.addClassName('hidden');
        preview.removeClassName('show');
        return true;
      }
      
      return false;
    },
    
    showPreview: function(event) {
      var context = WikiToolbar.getContext(event);
      var input = context.input;
      var preview = this.getPreview();
      
      jQuery('#wikitoolbar button').not('.wiki-preview').prop('disabled', true);
      jQuery('#wikitoolbar').addClass('preview-enabled');

      var margin = 2;
      preview.style.height = (input.getHeight()-5-(2*margin))+'px';
      preview.style.width  = (input.getWidth()-1-(2*margin))+'px';
      preview.style.margin = margin+'px';
      preview.innerHTML    = '';

      var onIframeLoad = function() {
        this.addClassName('show');
        this.removeClassName('hidden');
        preview.scrollTop = (input.scrollTop * preview.scrollHeight) / input.scrollHeight;
        
        // Regulary check the dimension of the input to resize the preview
        WikiToolbar.wikiPreviewInputHeight = input.getHeight();
        WikiToolbar.wikiPreviewInputWidth = input.getWidth();
        try { clearInterval(WikiToolbar.wikiPreviewResizeTimer); } catch(err) { };
        WikiToolbar.wikiPreviewResizeTimer = setInterval(function() {
          if (input.getHeight() != WikiToolbar.wikiPreviewInputHeight) {
            preview.style.height = (input.getHeight()-5)+'px';
            WikiToolbar.wikiPreviewInputHeight = input.getHeight();
          }
          if (input.getWidth() != WikiToolbar.wikiPreviewInputWidth) {
            preview.style.width = (input.getWidth()-1)+'px';
            WikiToolbar.wikiPreviewInputWidth = input.getWidth();
          }
        }, 100);
        
        jQuery(preview).off('load', onIframeLoad);
      }
      jQuery(preview).on('load', onIframeLoad);
      
      preview.src = 's.gif';
      preview.src = JCMS.Security.getUrlWithCSRFToken('jcore/wiki/wiki2html.jsp?targetInputId=' + input.id + '&time='+(new Date()).getTime());
      
      input.parentNode.insertBefore(preview,input);
      return;
    },
    
    
    runPreview: function(event){
      JcmsLogger.debug('WikiToolbar','runPreview');
      var context = WikiToolbar.getContext(event);
      
      var input   = $(context.input);
      
      if (this.hidePreview(event)) {
        return;
      }
      
      this.showPreview(event);
      
      return false;
    },
    
    runHelp: function(event){
      JcmsLogger.debug('WikiToolbar','runHelp');
      var context = WikiToolbar.getContext(event);
      Popup.popupWindow(context.ctxPath+"/work/howToTFR.jsp",'JaliosTFR',900,500,false,true,true,false);
      return false;
    },
    
    runExpandToolbar: function(event) {
      JcmsLogger.debug('WikiToolbar','runExpandToolbar');
      jQuery('#wikitoolbar').toggleClass('full-toolbar');
      return false;      
    },
    runReduceToolbar: function(event) {
      JcmsLogger.debug('WikiToolbar','runReduceToolbar');
      jQuery('#wikitoolbar').toggleClass('full-toolbar');
      return false;      
    },
    
    // ----------------------------------------------------
    //  CALLBACK FUNCTION
    // ----------------------------------------------------
    
    insertQueryCallback: function(value,lbl){
      var selection = WikiToolbar.currentSelection;
      if ((!selection) || (!value)){
        return;
      }
      InputUtil.replaceRegexp(selection.input,/^(.+)$/g,"$1 "+value+" ",value,true, true, selection);
      WikiToolbar._closeMenu();
    },
    
    insertPubLinkCallback: function(id,lbl){
      JcmsLogger.debug('WikiToolbar','insertPubLinkCallback');
      var selection = WikiToolbar.currentSelection;
      if ((!selection) || (!id)){
        return;
      }
      InputUtil.replaceRegexp(selection.input,/^(.+)$/g,"[["+id+"][$1]]","[["+id+"]["+lbl+"]]",true, true, selection);
    },
    
    // TODO: Fix in JCMS 5.7 for Intuitive URL
    insertPubURLCallback: function(id,lbl){
      JcmsLogger.debug('WikiToolbar','insertPubURLCallback');
      var selection = WikiToolbar.currentSelection;
      if ((!selection) || (!id)){
        return;
      }
      InputUtil.replaceRegexp(selection.input,/^(.+)$/g,"display.jsp?id="+id,"display.jsp?id="+id,true, true, selection);
    },
    
    insertWikiLinkCallback: function(url,txt){
      JcmsLogger.debug('WikiToolbar','insertWikiLinkCallback');
      var selection = WikiToolbar.currentSelection;
      if ((!selection) || (!url)){
        return;
      }
      InputUtil.replaceRegexp(selection.input,/^(.+)$/g,"[["+url+"]["+txt+"]]","[["+url+"]["+txt+"]]",true, true, selection);
    },
    
    // TODO: Fix in JCMS 5.7 for Intuitive URL
    insertWikiURLCallback: function(url,txt){
      JcmsLogger.debug('WikiToolbar','insertWikiURLCallback');
      var selection = WikiToolbar.currentSelection;
      if ((!selection) || (!url)){
        return;
      }
      InputUtil.replaceRegexp(selection.input,/^(.+)$/g,url,url,true, true, selection);
    },
    
    insertMediaUrlCallback: function(id, title, mediatype, url, targetInput, targetLabel){
      JcmsLogger.debug('WikiToolbar','insertMediaUrlCallback');
      var selection = WikiToolbar.currentSelection;
      if ((!selection) || (!url)){
        return;
      }
      if (mediatype == "image") {
        InputUtil.replaceRegexp(selection.input,/^(.+)$/g,"$1 "+url+" "," "+url+" ",true, true, selection);
      } else {
        InputUtil.replaceRegexp(selection.input,/^(.+)$/g,"$1 [media path='"+url+"'] "," [media path='"+url+"'] ",true, true, selection);        
      }
    },
    
    
    // ----------------------------------------------------
    //  CONVENIENT FUNCTION
    // ----------------------------------------------------
   
   /**
    * Build a context object from the given event
    * - x:            Event click x coordinate
    * - y:            Event click y coordinate
    * - ctxPath:      Page context path
    * - input:        The working input
    * - form:         The working form
    * - getInputPos() Function checking the position of the input in the form.
    * - getInputRel() Function checking the relative position of the input.
    * 
    * @param event the raised event
    */
    getContext: function(event){
      var context = new Object();
      context.x = Event.pointerX(event);
      context.y = Event.pointerY(event);
      context.ctxPath = JcmsJsContext.getContextPath();
      
      // Retrieve text area from the clicked item (the area of the map)
      // <div>  ... <textarea></textarea> ... <map><area><area></map> ... </div>
      try {

        var link         = Event.element(event);
        context.input    = link.fastUp('DIV','wikitoolbar').fastPrevious('TEXTAREA');
        context.form     = context.input.form;
        context.formName = context.form.attributes['name'].value;
      } catch(ex) { }
      
      if (!context.input) {
        alert(I18N.glp("error.unknown"));
      }
      
      // Bind a function to context to discover the input pos in form elements
      context.getInputPos = function() {
        
        if (this._inputPos || !this.form || !this.input)
          return this._inputPos;
        
        this._inputRel = -1;
        $A(this.form.elements).each(function(elm, idx){
          if (elm.name == this.input.name){
            this._inputRel += 1;
          }
          if (elm == this.input){
            this._inputPos = idx;
            throw $break;
          }
        }.bind(this));
        
        return this._inputPos;
      }.bind(context);
      
      context.getInputRel = function() {
        this.getInputPos();
        return this._inputRel;
      }
      
      return context;
    }
    
  });

  
  // ----------------------------------------------------
  //  INITIALISATION
  // ----------------------------------------------------
  
  Event.observe(window, 'load', function(){ WikiToolbar.initWikiToolbar.defer() }, false);
  if (document.isAjaxRefresh){
    WikiToolbar.initWikiToolbar();
  }

  