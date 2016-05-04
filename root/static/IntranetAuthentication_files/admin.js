//
// admin.js: Contains javascript needed in the Back Office, (work and admin area).
//           Named "admin.js" to match file admin.css which has the same requirements.
//

// ---------------------------------------
// Functions for select element (<select><option>)
// Used by doEditFriendlyURLs.jsp
// ---------------------------------------
  
  // Select all element in the given select form input
  function selectAllInSelectElement(elSel)
  {
    for (var i = 0; i < elSel.length; i++) {
      if (elSel.options[i] != null) {
        elSel.options[i].selected = true;
      }
    }
  }
  
  // Add new option to the given select form element, from the input element
  function addInputToSelectElement(elInput, elSel)
  {
    var elOptNew = document.createElement('option');
    elOptNew.text = elInput.value;
    elOptNew.value = elInput.value;
    
    for (var i = 0; i < elSel.length; i++) {
      if (elSel.options[i] != null && elSel.options[i].value == elOptNew.value) {
        return; // do not add anything if value already there
      }
    }  
    try {
      elSel.add(elOptNew, null); // standards compliant; doesn't work in IE
    }
    catch(ex) {
      elSel.add(elOptNew); // IE only
    }
  }
  
  // Remove the selected option of the given select form element
  function removeSelectedOptionFromSelectElement(elSel)
  {
    for (var i = elSel.length - 1; i >= 0; i--) {
      if (elSel.options[i] != null && elSel.options[i].selected) {
        elSel.remove(i);
      }
    }
  }
  
  
//---------------------------------------
// Edit workspace instance workflow 
//---------------------------------------
  // Namespace
  if (!jQuery.JCMS) {
    jQuery.JCMS = {};
  }
  if (!jQuery.JCMS.admin) {
    jQuery.JCMS.admin = {};
  }
  jQuery.JCMS.admin.instanceWorkflow = {
	  
	  updateInstanceWorkflow : function(element, typeName, wsId){
	    var $element = jQuery(element);
	    var $container = $element.closest(".instance-workflow");
  		var url = "work/workspace/editWorkspaceInstanceWorkflow.jsp?typeName="+encodeURIComponent(typeName)+"&wsId="+encodeURIComponent(wsId)+"&rd="+Math.random();
  		var presetWorkflows = $container.find("INPUT.selectedWorkflows");
  		url += "&presetSelectedWorkflows="+encodeURIComponent(presetWorkflows.val());
  		var presetGroups = $container.find("INPUT.selectedGroups");
  		url += "&preselectedGroups="+encodeURIComponent(presetGroups.val());
  		jQuery.jalios.ui.Modal.openFromUrl(url , { 'callback' : function(popinForm){
  		  $popinForm = jQuery(popinForm);
  			if($popinForm.exists()){
  				var selectedWorkflows = $popinForm.find(".selectedWorkflows");
  				var newValue ="";
  				selectedWorkflows.each(function(index, item){
  				  item = jQuery(item);
  					if(item.val() && item.val() != ""){
  						newValue += item.val() +",";
  					}
  				})				
  				presetWorkflows.val(newValue);
  				var newGroupValue ="";
  				var selectedGroups = $popinForm.find(".widget-name-groups INPUT.form-control-value");
  				selectedGroups.each(function(index, item){
  				  item = jQuery(item);
  					if(item.val() && item.val() != ""){
  						newGroupValue += item.val() +",";
  					}
  				})				
  				presetGroups.val(newGroupValue);
  			}
  			return true;
  		}});
  		return false;
	  },

	  toggleInstanceWorkflowState : function(elt){
	    var $elt =jQuery(elt);
	    var value = $elt.val();
	    var state = false;
	    if(value){
	      state = !value.endsWith("disabled");
	    }     
	    
	    var container = $elt.closest("TR").find(".instance-workflow");
	    var widgetInput = container.find("INPUT");
	    if(state){
	      container.removeClass("disabled");
        widgetInput.attr('disabled', false);
	    }
	    else{
	      container.addClass("disabled");
	      widgetInput.attr('disabled', true);
	      widgetInput.prop('checked', false);
	      container.find("A").removeClass("inline");
	      container.find("A").addClass("hide");
	    }   
	  }
  }
  
  /**
  /* read value of the widget and enable/disable elements list if the value is false/true
   */  
  function toggleWidgetState(widget, widgetName, elementsList){
  	var form = jQuery(widget).closest("FORM");	  
    var value = form.find('input[type=radio][name='+widgetName+']:checked').val();
  	for ( var index = 0; index < elementsList.length; ++index) {
  		var eltWrapper = elementsList[index];
  		//change all widget wrapper		
  		jQuery(eltWrapper).find(".widget").each(function(index, item){
  			var input = jQuery(item).find("input");
  			if(value == "true"){
  			  jQuery(item).addClass("disabled");
  				if(input.exists()){input.prop("disabled", true);}
  				jQuery(item).find("select").each(function(index, selectItem){
  					jQuery(selectItem).prop("disabled", true);
  				});
  			}
  			else{
  			  jQuery(item).removeClass("disabled");
          if(input.exists()){input.prop("disabled", false);}
          jQuery(item).find("select").each(function(index, selectItem){
            jQuery(selectItem).prop("disabled", false);
  				});
  			}
  		});
  	}		 
  }