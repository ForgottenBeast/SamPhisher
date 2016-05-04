//
// treegroup.js - since jcms-5.6
// This file is used by the navigation tree group (see Group.printTreeGroup())
//
var TreeGroup = {

  /**
   * Open/close a workspace node.
   *
   * @param title the title div
   * @param tree the tree div
   * @since jcms-5.6.0
   */
  toggle: function (title, tree) {
    
    title = $(title);
    
    // Toggle tree div
    tree.toggle();
    
    // Change title div class
    if (tree.style.display == "") {
      title.addClassName("open");
    } else {
      title.removeClassName("open");
    }
  },
  
  init: function() {
// Iterate over all the img tag in the tree
$$(".tree img").each(function(img) {
  
  // Add the toggle behaviour for each node
  Event.observe(img, 'click' , function() { 
    // For each node under this <li>
    var li = img.parentNode;
    $A(li.childNodes).each(function(subNode){
    
      // Just consider <ul> tag
      if (subNode.tagName != "UL") {
        return;
      }
      
      // Toggle the UL
      $(subNode).toggle();
        
      // Change icon
      if (subNode.style.display == "") {
        img.src = "images/jalios/icons/groupParentOpened.gif";
      } else {
        img.src = "images/jalios/icons/groupParent.gif";
      }
    });
  });
});
  }
}