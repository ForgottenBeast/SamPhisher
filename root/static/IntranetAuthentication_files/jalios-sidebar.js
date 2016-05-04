(function($) {

  var register = function(){
    $('body').append($('<div/>')
    .addClass("sidebar-backdrop fade sidebar-closer")
    .attr("data-jalios-target",".sidebar-component"));
    
    $(document).on('click',".sidebar-opener",openSidebar);
    $(document).on('click',".sidebar-closer",closeSidebar);
    $(document).on("show.bs.modal",closeSiteSidebar);
  }

  var openSidebar = function (event){
   var $sidebar = getSidebar(event.target);

   $sidebar.animate({'left':'0'},250,function(){
      addOverlay();
    });
  }
    
  var closeSiteSidebar = function (){
    $(".site-sidebar").animate({'left': -(($(".site-sidebar").width() *2) + 20) },250,function(){
       removeOverlay();
    });
  }   
    
    
  var closeSidebar = function (event){
    var $sidebar = getSidebar(event.target);
    
    $sidebar.animate({'left': -(($sidebar.width() *2) + 20) },250,function(){
       removeOverlay();
    });
  }

  var getSidebar = function (sidebarOpener){
    var $sidebarOpener = $(sidebarOpener);
    
    if (!($sidebarOpener).hasClass("sidebar-opener") && !($sidebarOpener).hasClass("sidebar-closer")) {
      $sidebarOpener = $sidebarOpener.closest(".sidebar-opener");
    }
    
    var rel = $sidebarOpener.data("jalios-target");
    var $rel = $(rel);
    
    if (!$rel.exists()) {
      return;
    }
    
    return $rel;
  }  

  function addOverlay(){
    $(".sidebar-backdrop").addClass("full in");
  }
      
  function removeOverlay(){
    $(".sidebar-backdrop").removeClass("full in");
  }
  
  $(document).ready(function() {
    register();
  });

})(jQuery);