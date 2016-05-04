/* 
   Topbar js
   —————————
*/
(function ( $ ) {

  $.fn.topbar = function(){
  
    /* 
       Search functions and vars
       —————————————————————————
    */
    
    var extendSearchInput = function() {
      
    };
    
    var searchELem = $('.topbar .topbar-search-wrapper');
    var jSearch = {
      searchContainer:  searchELem.find('.search-container:eq(0)'),
      inputElem:        searchELem.find('.topbar-search-query'),
      filterElem:       searchELem.find('.search-filter'),
      listElem:         searchELem.find('.search-list'),
      init:             function(){
        
        var labelWidth = parseInt( searchELem.find('.result-label').css('width'),10 );
        var resultWidth = parseInt( searchELem.find('.result-group').css('width'), 10 ) - parseInt( labelWidth,10 );
        var searchContainerWidth = jSearch.searchContainer.width();
        
        
        jSearch.inputElem.on('focus',function(){
           jSearch.searchContainer.addClass('focused');
           if ($(window).width() < 480) {
             jSearch.searchContainer.css('width', $( window ).width());
           }
           jSearch.filterElem.animate({'opacity':1},250);
        });
        
        jSearch.searchContainer.on('click',function(){
           jSearch.searchContainer.addClass('focused');
           if ($(window).width() < 480) {
             jSearch.searchContainer.css('width', $( window ).width());
           }
           jSearch.filterElem.animate({'opacity':1},250);
           jSearch.inputElem.focus();
        });             
             
                                      
        $(document).mouseup(function (e) {
          var $target = $(e.target)
          var isSearchClick = $target.exists() && $target.closest(".typeahead-search-topbar").exists();
          if (!isSearchClick && !searchELem.is(e.target) && searchELem.has(e.target).length === 0){
            jSearch.searchContainer.css('width', '');
            jSearch.filterElem.animate({'opacity':0},250);
            jSearch.searchContainer.removeClass('focused');
           }
        });
          
          //This will prevent our menu to disapear when we click on it
          $('.search-filter .dropdown-menu').click(function(e) {
             e.stopPropagation();
          });
        },
        openList:            function(){
          jSearch.listElem.slideDown();
        },
        closeList:           function(){
          jSearch.listElem.slideUp();
        }
         
      };
      jSearch.init();
      
      /* 
         Publish functions and vars
         —————————————————————————
      */
      
      var publishElem = $('.topbar:eq(0) .topbar-publish-wrapper:eq(0)');
      var publish = {
         topbarPart:       publishElem.find('.publish-topbar'),
         listPart:         publishElem.find('.publish-menu-container'),
         isMenuOpen:       false,
         init:             function(){
                                                            
                              
                              //Creating menu elements in js so we don’t pollute the dom
                              publish.listPart.find('.main-menu > .publish-menu-item').each(function(index,element){
                                 
                                 var childElem = $(element).find('.child-menu:eq(0)');
                                 var isChild = childElem.length;
                                 
                                 if( isChild ){
                                    //We bound with an attribute the element menu and his child,
                                    //in order to move childElem in another div
                                    $(this).attr('data-bound',index).addClass('has-child');
                                    childElem.attr('data-bound',index);
                                    
                                    //And we destroy the childElem
                                    childElem.remove();
                                    
                                    //We move the list to an other container so we can navigate easily
                                    $('.child-menu-container').append(childElem);

                                 }
                                 
                              });
                              
                              //Events
                              publish.topbarPart.on('click',function(){
                                 
                                 if( !publish.isMenuOpen ){
                                    publish.openMenu();
                                    
                                 }else{
                                    publish.closeMenu();
                                    
                                 }
                              });
                              
                              publish.listPart.find('.has-child').on('click',function(){
                              
                                 var id_child = $(this).attr('data-bound');
                                 
                                 //We mask any menu that can be visible
                                 publish.listPart.find('.child-menu-container .list-group').css('display','none');
                                 
                                 //We make visible the menu we want to display
                                 publish.listPart.find('.child-menu-container [data-bound=' + id_child + ']').css('display','block');
                                 
                                 //And we make move the slider
                                 $('.publish-slider').animate({'left':'-300px'},250,'swing',function(){
                                    
                                    publish.changeMenuHeight(id_child);
                                    
                                 });
                                 
                              });
                              
                              publish.listPart.find('.back').on('click',function(){
                                 $('.publish-slider').animate({'left':'0'},250,'swing',function(){
                                    publish.changeMenuHeight(false);
                                 });
                              });
                              
                              $(document).mouseup(function(e){
                                 if (!publishElem.is(e.target) && publishElem.has(e.target).length === 0){
                                    if( publish.isMenuOpen ){
                                       publish.closeMenu();
                                    }
                                 }
                              });
                              
                              
                              
                           },
      changeMenuHeight:    function(id_child){
                              
                              var nb_elem;
                              
                              if( id_child === false )
                              {
                                 nb_elem = $('.topbar-publish-wrapper .main-menu .publish-menu-item').length;
                              }
                              else
                              {
                                 nb_elem = $('.child-menu-container [data-bound=' + id_child + '] .publish-menu-item').length;
                              }
                              
                              var heightLi = parseInt(publishElem.find('.publish-menu-container .publish-menu-item:eq(0)').css('height'),10);
                              
                             var menu_height = (nb_elem * heightLi) - ((nb_elem * 1) - 1) ;
                              $('.publish-menu-container').animate({'height': menu_height},250);
                           
                           },
      openMenu:            function(){
                              publishElem.addClass('publish-selected');
                              publish.listPart.slideDown('fast');
                              publish.isMenuOpen = true;
                           },
      closeMenu:           function(){
                              
                              var heightLi = parseInt(publishElem.find('.publish-menu-container .publish-menu-item:eq(0)').css('height'),10);
                              
                              publish.listPart.slideUp(250,function(){
                              publishElem.removeClass('publish-selected');
                              
                              //Reseting the menu
                              publish.listPart.find('.child-menu-container .list-group').css('display','none');
                              $('.publish-slider').css({'left':'0'});
                              var nb_elem = $('.topbar-publish-wrapper .main-menu .publish-menu-item').length;
                              var menu_height = (nb_elem * heightLi) + (nb_elem - 1);
                              $('.publish-menu-container').css({'height': menu_height});
                              
                              publish.isMenuOpen = false;
                                 
                                 
                              });
                              
                              
                           }
      };
      publish.init();
      
      
      
      /* 
         Messages functions and vars
         ———————————————————————————
      */
         $('.message').popover();
          
   };

   var register = function(){ 
     
     
     
     
     $("#search-space").on('input',function($e){
       
        var textInput = $e.target.value;
        
        var topbarLocation = $($e.target).data("jalios-topbar-location");
        
        $.ajax({
          url: "jcore/topbar/doTopbarWorkspaceList.jsp",
          type: "POST",
          data: {
            wsQuery: textInput,
            topbarLocation: topbarLocation
          }
        }).then( function (response) {
          $(".spaces-list").first().html(response);
        });
        
     });          
     $.fn.topbar();
   }
   
   $(document).ready(function(){ 
     register();
   });
   
}( jQuery ));