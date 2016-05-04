'JCMS.treews'._namespace();

JCMS.treews.TreeHelper = {

  addClassOpenGroup : function(link) {
  	var oldHref = link.href;
  	link.href = oldHref + "&classForOpenNodes=" + encodeURIComponent($('hiddenDivForOpenNodes').className);
  	return true;
  },
  
  toggleWSDiv: function(wsId){
    var hDiv =  $('hiddenDivForOpenNodes');
    if (!hDiv) { return; }
    
    hDiv.toggleClassName('openWSNode'+wsId);
    return true;
  },
  
  toggleGrpDiv: function(elm, wsId){
    var pNode = $(elm).fastUp('DIV','wsgroupset',false);
    pNode.toggleClassName('open');
    
    var hDiv =  $('hiddenDivForOpenNodes');
    if (!hDiv) { return; }
    hDiv.toggleClassName('openGroupsOf'+wsId);
    
    return true;
  }
};