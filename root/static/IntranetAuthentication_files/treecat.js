
// ------------------------------------------------------------------------------------
//  AJAX TREE PACKAGE
// ------------------------------------------------------------------------------------

'Ajax.Tree'._namespace({
 
  // ------------------------------------------------------------------------------------
  //  AJAX Function
  // ------------------------------------------------------------------------------------
  _downloadChildrenHooks: $H(),
  
  /**
   * Allow other javascript code to register a custom callback
   * when a new tree branch is retrieved in ajax.
   */
  registerDownloadChildrenHook: function(ajaxSuffix, customCallback) {
    var callbacks = Ajax.Tree._downloadChildrenHooks.get(ajaxSuffix);
    if (!callbacks) {
      callbacks = $A();
      Ajax.Tree._downloadChildrenHooks.set(ajaxSuffix,callbacks);
    }
    callbacks.push(customCallback);
  },
  
  invokeDownloadChildrenHook: function(ajaxSuffix, ul) {
    var callbacks = Ajax.Tree._downloadChildrenHooks.get(ajaxSuffix);
    if (!callbacks) { return; }
    callbacks.each(function(item) {
      item(ul);
    });
  },
  
  /**
   * Get HTML of children 
   * - for the ID in the img.classname (ID_j_42)
   * - for the full tree with given checkedArray
   * 
   * Update UL innerHTML with this new content.
   * Remove Image click function to toggleVisibility instead of calling a new Ajax call.
   * 
   * @param img the clicked image
   * @param ajaxSuffix String that represents the main UL id
   * @param ul the root branch to fill
   * @param checkedArray a Array of checked category ids
   */
  downloadChildren: function(img, ajaxSuffix, ul, checkedArray, openedArray, customCallback) {

    JcmsLogger.debug('TreeCat','downloadChildren():', ajaxSuffix, img, checkedArray, openedArray);
    
    // Init Json Request
    var jsonRequest = new JcmsJsonRequest(img); 
    
    // Init RPC with jsonRequest
    var funcRPC = function(){
      
      if (img){
        Ajax.Tree._getRpcTree(ajaxSuffix).getChildren(jsonRequest.asyncJsonCallBack.bind(jsonRequest), $(img).getJcmsId());
      } else {
        var rpc  = Ajax.Tree._getRpcTree(ajaxSuffix);
        var func = jsonRequest.asyncJsonCallBack.bind(jsonRequest);
        if (rpc){
          rpc.getChildren(func,checkedArray,openedArray);
        } else { func(' '); } /* Buggy on first call */
      }
    }
    
    // Init Callback with jsonRequest
    var funcCallback = function(returnValue){
      if (!returnValue){
        ul.parentNode.removeChild(ul);
        return;
      }
      
      // Clean
	    ul.innerHTML = returnValue;
      
  	  // Call custom callback
  	  if (customCallback){
  	    customCallback();
  	  }
    
      Ajax.Tree.invokeDownloadChildrenHook(ajaxSuffix, ul);
    }
    
    // Init custom exception handle
    var funcException = function(){
      ul.parentNode.removeChild(ul);
      Ajax.Tree.toggleOpenClose(img);
    }

     // Run JSON Request
    jsonRequest.rpc       = funcRPC;
    jsonRequest.callback  = funcCallback;
    jsonRequest.exception = funcException;
    jsonRequest.asyncJsonCall();
    
  },  
  
  /**
   * Rename the given category using ajax call
   * Refresh the full category tree in ajax
   * 
   * @param ajaxSuffix String that represents the main UL id
   * @param catId The JCMS Category id
   * @param value The new category name in current language
   */
  rename: function(ajaxSuffix, catId, value){
    JcmsLogger.debug('TreeCat','rename():', ajaxSuffix, catId, value);
    
    // Init Json Request
    var jsonRequest = new JcmsJsonRequest(); 
    
    // Init RPC with jsonRequest callback
    var funcRPC = function(){
      Ajax.Tree._getRpcTree(ajaxSuffix).rename(function(msg){ Ajax.Tree._handleRPCResponse(jsonRequest, msg, ajaxSuffix); }, catId, value);
    };
        
    // Run JSON Request
    jsonRequest.rpc      = funcRPC;
    jsonRequest.callback = Ajax.Tree._callbackRefresh;
    jsonRequest.asyncJsonCall();
  },
  
  /**
   * Add a new category using ajax call
   * Refresh the full category tree in ajax
   * 
   * @param ajaxSuffix String that represents the main UL id
   * @param catId The JCMS Category id
   * @param value The category name to add in current language
   */
  addSubCat: function(ajaxSuffix, catId, value){
    JcmsLogger.debug('TreeCat','addSubCat():', ajaxSuffix, catId, value);
    
    // Init Json Request
    var jsonRequest = new JcmsJsonRequest(); 
    
    // Init RPC with jsonRequest callback
    var funcRPC = function(){
      Ajax.Tree._getRpcTree(ajaxSuffix).addSubCat(function(msg){ Ajax.Tree._handleRPCResponse(jsonRequest, msg, ajaxSuffix); },catId, value);
    };

    // Run JSON Request
    jsonRequest.rpc        = funcRPC;
    jsonRequest.callback   = function(returnValue, returnEffect){ Ajax.Tree._callbackRefresh(returnValue, returnEffect, catId); };
    jsonRequest.asyncJsonCall();
  },
  
  /**
   * Add a sibling category using ajax call
   * Refresh the full category tree in ajax
   * 
   * @param ajaxSuffix String that represents the main UL id
   * @param catId The JCMS Category id
   * @param value The category name to add in current language
   */
  addSiblingCat: function(ajaxSuffix, catId, value){
    JcmsLogger.debug('TreeCat','addSiblingCat():', ajaxSuffix, catId, value);
    
    // Init Json Request
    var jsonRequest = new JcmsJsonRequest(); 
    
    // Init RPC with jsonRequest callback
    var funcRPC = function(){
      Ajax.Tree._getRpcTree(ajaxSuffix).addSiblingCat(function(msg){ Ajax.Tree._handleRPCResponse(jsonRequest, msg, ajaxSuffix); },catId, value);
    };

    // Run JSON Request
    jsonRequest.rpc        = funcRPC;
    jsonRequest.callback   = function(returnValue, returnEffect){ Ajax.Tree._callbackRefresh(returnValue, returnEffect); };
    jsonRequest.asyncJsonCall();
  },
  
 /**
  * Remove a category using ajax call
  * Refresh the full category tree in ajax
  * 
  * @param ajaxSuffix String that represents the main UL id
  * @param catId The JCMS Category id
  */
  remove: function(ajaxSuffix, catId){
    JcmsLogger.debug('TreeCat','remove():', ajaxSuffix, catId);
    
    // Init Json Request
    var jsonRequest = new JcmsJsonRequest(); 
    
    // Init RPC with jsonRequest callback
    var funcRPC = function(){
      Ajax.Tree._getRpcTree(ajaxSuffix).remove(function(msg){ Ajax.Tree._handleRPCResponse(jsonRequest, msg, ajaxSuffix); },catId);
    };

    // Run JSON Request
    jsonRequest.rpc        = funcRPC;
    jsonRequest.callback   = Ajax.Tree._callbackRefresh;
    jsonRequest.asyncJsonCall();
  },
  
  
 /**
  * Update the parent of a givent category
  * Refresh the full category tree in ajax
  * 
  * @param ajaxSuffix String that represents the main UL id
  * @param catId The JCMS Category id
  */
  setParent: function(ajaxSuffix, catId, parentId){
    JcmsLogger.debug('TreeCat','setParent():', ajaxSuffix, catId, parentId);
    
    // Init Json Request
    var jsonRequest = new JcmsJsonRequest(); 
    
    // Init RPC with jsonRequest callback
    var funcRPC = function(){
      Ajax.Tree._getRpcTree(ajaxSuffix).setParent(function(msg){ Ajax.Tree._handleRPCResponse(jsonRequest, msg, ajaxSuffix); },catId, parentId);
    };

    // Run JSON Request
    jsonRequest.rpc        = funcRPC;
    jsonRequest.callback   = function(returnValue, returnEffect){ Ajax.Tree._callbackRefresh(returnValue, returnEffect, parentId); };
    jsonRequest.asyncJsonCall();
  },
  
  /**
   * Refresh an Ajax TreeCat
   * 1. Parse tree to record checked nodes.
   * 2. Remove all children of main branch.
   * 3. Retrieve a new Tree using Ajax.Tree.downloadChildren
   * 4. Update main branch
   * 
   * If UL.TreeCat has className 'follow' then the tree will open (not select)
   * the given branch ids then follow the Ahref link.
   *
   * If UL.TreeCat has className 'follow' AND 'fire' then the tree will not 
   * follow the href link but instead fire a jcms:click event
   * (this event is observe by util.js / observeClass).
   * 
   * @param ajaxSuffix String that represents the main UL id
   * @param ids an array of ids to add to checked/open elements
   *        or a single id (that will follow url after refresh)
   */
  refresh: function(ajaxSuffix, ids, checked){
    
    JcmsLogger.debug('TreeCat','refresh():',ajaxSuffix,ids);
    
    Ajax.setWaitState(true);
    
    var ul  = $(ajaxSuffix);
    if (ids){
      ids = Object.isArray(ids) ? $A(ids) : $A([ids]);
    }
    
    // Search checked categories
    var openedArray  = new Array();
    var checkedArray = new Array();
    
    $A(ul.getElementsByTagName('INPUT')).each(function(elm, idx){
      if (elm.checked){
        checkedArray.push(elm.value);
        return;
      }

      // Remove disabled ids
      if (ids && elm.disabled && ids.indexOf(elm.value) >= 0){
       ids = ids.without(elm.value);
      }
    });
    
    // Search opened nodes
    $A(ul.select('LI.open')).each(function(elm, idx){
      var node = elm.down();
      if (node){
        var nodeCatId = $(node).getJcmsId();
        openedArray.push(nodeCatId);
        JcmsLogger.debug('TreeCat', 'Opened:', nodeCatId);
      }
    });
    
    
    // Add given additional checked ids
    if (ids){
      openedArray = openedArray.concat(ids);
      if (checked && !ul.hasClassName('follow')){
        checkedArray = checkedArray.concat(ids);
      }
    }

    // Append message
    ul.innerHTML = "<li><img src='s.gif' class='loading'/> Loading...</li>";
    

    // Prepare custom callback follow
    var customCallback = null; 
    if (ul.hasClassName('follow') && ids && ids.length == 1 ){
      customCallback = function(){  Ajax.Tree._followRefreshCallback(ajaxSuffix, ids); }
    }
    
    // Dowload children  
    Ajax.Tree.downloadChildren(null, ajaxSuffix, ul, checkedArray, openedArray, customCallback);
  },
  
  /**
   * Called by refresh() for Treecat with class 'follow'
   * @param ajaxSuffix String that represents the main UL id
   * @param ids the id to work with to find URL to follow
   */
  _followRefreshCallback: function(ajaxSuffix, ids){
    var treecat = $(ajaxSuffix);
    var elms = treecat.select('IMG.ID_'+ids);
    if (!elms || !elms[0]){
      JcmsLogger.warn('TreeCat','Id not found',ids);
      return;
    }
    var img = elms[0];
    var ahref = img.next('A');
    if (treecat.hasClassName('fire')) {
      // Fire a custom jcms:click event (this event is observed by util.js / Util.observeClass)
      JcmsLogger.debug('TreeCat', 'fire jcms:click', ahref);
      ahref.fire('jcms:click');
    } else if (ahref) {
      document.location = ahref.href;
    }
  },
  
  // ------------------------------------------------------------------------------------
  //  Utility Function
  // ------------------------------------------------------------------------------------
   
   
  
  /**
   * Makes AJAX call to import all the children 
   * for the given img LI and given AJAX suffix.
   * 
   * @param img the clicked image
   */
  _importChildren: function(img) {
    var li = $(img.parentNode);
    if (li.hasClassName('imported')) {
      return;
    }
    
    Ajax.setWaitState(true,img);
    
    // Set wait icon
    var ul = document.createElement('UL');
    ul.innerHTML = "<li><img src='s.gif' class='loading'/> Loading...</li>";
    li.appendChild(ul);
    
    // Mark this branch as imported
    li.addClassName('imported');
    
    // Asynchronous call
    var ajaxSuffix = $(img).fastUp('UL', 'TreeCat').id;
    Ajax.Tree.downloadChildren(img, ajaxSuffix, ul);
  },
   
  /**
   * Toggles className 'open' and 'close' on parent LI of image.
   * 
   * @param img the clicked image
   */
  toggleOpenClose: function(img) {
    if (!img){ return; }
    var li = $(img.parentNode);
    li.toggleClassName('tree-close');
    li.toggleClassName('tree-open');
    Ajax.Tree._importChildren(img);
  },
  
  /**
   * Returns the ajaxSuffix of the parent UL of 
   * the given element.
   * 
   * @param the children element
   */
  getAjaxSuffix: function(elm){
    
    if (!elm){
      return;
    }
    
    var elm = $(elm);
    
    // Hook for an element handle click as a proxy
    if (elm.id && elm.id.indexOf('proxy') >= 0){
      return elm.id.substring(6);
    }
    
    var ul = elm.fastUp('UL', 'TreeCat');
    if (!ul){
      return;
    }
    
    JcmsLogger.debug('TreeCat','getAjaxSuffix():', ul.id);
    return ul.id;
  },
  
  /**
   * Returns the category id for the given element
   * 
   * @param elm the element to work with
   */
  getCategoryId: function(elm, level){
    if (!elm){
      return;
    }
    // Use a level for recursive call to prevent an infinite process
    // in case the HTML is not the expected tags tree
    level = (level || 0) + 1;
    if (level > 42) {
      return;
    }
    
    if (elm.tagName == 'LI'){
      var liElm = elm.down(0);
      return Ajax.Tree.getCategoryId(liElm, level); // recursive
    }
    else if (elm.tagName == 'IMG' || elm.tagName == 'A'){
      return $(elm).getJcmsId();
    }
    else {
      var ulElm = elm.up('UL.TreeCat LI');
      return Ajax.Tree.getCategoryId(ulElm, level); // recursive
    }
  },
  
  // ------------------------------------------------------------------------------------
  //  Internal Function
  // ------------------------------------------------------------------------------------
  
  /**
   * Returns the correct JSON-RPC AjaxTree from given ajaxSuffix
   * 
   * @param ajaxSuffix the ajaxSuffix or null
   */
  _getRpcTree: function(ajaxSuffix){
    if (!ajaxSuffix){
      return JcmsJsContext.getJsonRPC().AjaxTree;
    }
    else {
      return JcmsJsContext.getJsonRPC()['AjaxTree'+ajaxSuffix];
    }
  },
  
  /**
   * Convenient callback function called to refresh 
   * treecat after json-rpc call
   * 
   * @param ajaxSuffix the ajaxsuffix used to refresh tree
   * @param returnEffect the Effect (not used)
   */
  _callbackRefresh: function(ajaxSuffix, returnEffect, openId){ 
    JcmsLogger.debug('TreeCat','Callback Refresh',ajaxSuffix,returnEffect,openId);
    if (ajaxSuffix){
      if (openId){
        var ids = new Array();
        ids.push(openId);
        Ajax.Tree.refresh(ajaxSuffix, ids);
      }
      else {
        Ajax.Tree.refresh(ajaxSuffix);
      }
    }
  },
  
  /**
   * Convenient function used to handle RPC reponse.
   * If RPC returns a message then call alert and finish JsonRequest job
   * else finish JsonRequest Job with the given return value.
   * 
   * @param msg the error message
   * @param returnValue the value to return if there is no errors
   */
  _handleRPCResponse: function(jsonRequest, msg, returnValue){
    if (msg){
      alert(msg);
      jsonRequest.asyncJsonCallBack();
      return;
    }
    jsonRequest.asyncJsonCallBack(returnValue);
  }

});
