!function ($) {

  var register = function(){
    //$(document).on('jalios:refresh', refresh);
    $(document).on('mouseover', 'UL.TreeCat.dragdrop IMG.folder', init);
  }
  
  // Callback on mousedown
  var init = function(event){
    var $e = $(event.currentTarget);
    $e.closest('UL.TreeCat.dragdrop').find('LI').each(function(){
      $(this).droppable({
        tolerance: 'pointer', 
        greedy: true,
        drop: drop,
        accept: 'LI',
        hoverClass: 'sortable-active' // same as jalios-sortable.js
      });
    });
    
    $e.closest('LI').draggable({
      axis: 'y',
      revert: 'invalid',
      handle: '.folder'
    });
  }
  
  var drop = function(event, ui){
    var $drag   = $(ui.helper).find('.title').first();
    var $drop   = $(this).find('.title').first();
    
    //$.console.debug('setParent()', $drag.getJcmsId(), $drop.getJcmsId(), getSuffix($drag));
    Ajax.Tree.setParent(getSuffix($drag), $drag.getJcmsId(), $drop.getJcmsId());
  }
  
  var getSuffix = function($e){
    var id = $e.attr('id');
    if (id && id.indexOf('proxy') == 0){ return id.substring(6); }
    return $e.closest('UL.TreeCat').attr('id');
  }
  
  // Plugin initialization on DOM ready
  $(document).ready(function($) { register(); });
}(window.jQuery);
