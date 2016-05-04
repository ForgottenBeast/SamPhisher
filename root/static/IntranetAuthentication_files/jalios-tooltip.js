!function ($) {

  var register = function(){
  
    $(document).idleTimer(500,  {'name' : 'Hover'});
    
    // Handle Hover events
    $(document).on("Hover.idle", function(event){
      var $e = $(event.timer.target);
      if ($e.closest('DIV.popover.tt').exists()){ return; } // Fix: no ttCard in ttCard 
      if ($e.closest('.dropdown-menu').exists()){ return; } // Fix: no ttCard in ctxMenu 
      initCard($e);
      initTip($e);
    });
    
    // Handle Click event => Use DataBroker ?
    $(document).on('click', '.ctxTooltipMenu', function(event){
      var $e = $(event.currentTarget);
      initTip($e, true);
    });

    // Handle Click event => Use DataBroker ?
    $(document).on('click', '.ctxTooltipCard', function(event){
      var $e = $(event.currentTarget);
      initCard($e, true);
    });
    
    // Close tooltips on click
    $(document).on('mouseup', ttHide);
    
    // Close tooltips on refresh
    $(document).on("jalios:refresh", ttHideRefresh);
    
  }
  
  var ttHide = function(event){
    var $e = $(event.target);

    if (!$e.is('BUTTON.close') && $e.closest('DIV.popover.tt').exists()){ return; }
    if ($e.data('bs.popover')){ return; }
    $('DIV.popover.tt').not('.tt-static').removeClass('in').hide();
  }
  
  var ttHideRefresh = function(event){
    var refresh = $.jalios.Event.match(event, 'refresh', 'before');
    if (!refresh){ return; }
    $('DIV.popover.tt').not(refresh.$target).removeClass('in').hide();
  }

  
  // ------------------------------------------
  //  TT CARD
  // ------------------------------------------
  
  var ttTemplateCard = '<div class="popover tt-card tt no-focus"><div class="arrow"></div><button class="close" type="button">×</button><div class="popover-content ajax-refresh-div"></div></div>';
  var initCard = function($e, click){
    if (!$e){ return; }

    //Do nothing if ttcard are disabled
    if ($("BODY").hasClass("jcms-ttcard-disabled")) {
      return;
    }

    if (!$e.is('.ctxTooltipCard')){    
      // Images in ctxTooltipCard links                  
      var $e = $e.parent('A.ctxTooltipCard'); 
      if (!$e.exists()){ return; }
    }
    
    if ($e.prop('tagName') == 'A' && click){ 
      return; // Do not trigger ttCard on A:click
    }
    
    if (ttToggle($e, click)){ 
      return; // Toggle ttCard show/hide
    }                   
    if ($e.closest('.noTooltipCard').exists()){ 
      // Prevent ttCard
      return; 
    } 
    
    var popover = $e.data('bs.popover');
    var html    = $e.data('popover-html');
    var $tip    = popover ? popover.tip() : null;
        
    $('DIV.popover.tt').not($tip).removeClass('in').hide();
    
    // Cache + timeout 2s
    var now  = (new Date()).getTime();
    if (html && timeout+2000 > now){ 
      $e.popover({
        trigger: 'manual',
        html : true,
        container: 'body',
        delay: { show: 500, hide: 10000 },
        template: ttTemplateCard,
        content: html
      }).popover('show');
      return; 
    }
    timeout = now;
    
    var id = $e.getJcmsId();
    var params = $e.attr('class').replace("ID_"+id,"").replace("ctxTooltipCard","").replace(/^\s+|\s+$/g,"").replace(/\s+/g,"|");
    var url = 'jcore/tooltip/ttCard.jsp?ttId='+id+'&ttContext='+params;
  
    $.ajax({
      url: url,
      dataType: "html",
      cache:true,
      success: function(data) {
        var $ajaxContent = $('<DIV/>').html(data);
        
        $ajaxContent.imagesLoaded(function() {
          
          $e.popover({
            trigger: 'manual',
            html : true,
            container: 'body',
            delay: { show: 500, hide: 10000 },
            template: ttTemplateCard,
            placement: 'auto',
            content: data
          }).popover('show');
          
          popover = $e.data('bs.popover');
          popover.refreshInProgress = true;
          $e.data('popover-html', html);
          
          if (!data){ 
            popover.refreshInProgress = false;
            $tip.hide();
            return;
          }
          
          popover.refreshInProgress = false;      
          
          
        });
        
  
      }
    });
    
  }
  
  var initCardPlacement = function(){
    
    
    
  }
  
  
  var timeout = 0; // Global timeout threashold for request
  var ttContentCard = function(){
    var $this   = $(this); 
    return $this.data('popover-html') || ttTemplateCard;  
  }
  
  // ------------------------------------------
  //  TT TIP
  // ------------------------------------------

  var ttTemplateTip = '<div class="popover tt tip no-focus"><div class="arrow"></div><div class="popover-content ajax-refresh-div"></div></div>';
  var initTip  = function($e, click){
    if (!$e){ 
      return; 
    }
    
    if (!$e.is('.ctxTooltipMenu')){ 
      return; 
    }
    
    if ($e.prop('tagName') == 'A' && click){ 
      return; 
    }
    
    if (ttToggle($e, click)){ 
      return; 
    }
    
    var offset = $e.offset();
    if (offset.top == 0 && offset.left == 0){ 
      return; 
    }
    
    $e.popover({
      trigger: 'manual',
      html : true,
      container: 'body',
      delay: { show: 1000, hide: 5000 },
      template: ttTemplateTip,
      content: ttContentTip
    });
    
    //execute ajax-refresh if needed to get content
    setTtContentTip.call($e[0]);
    $e.popover('show');
  }

  var ttContentTip = function(){
    var $this   = $(this); 
    return $this.data('popover-html') || ttTemplateTip;
  }
  
  var setTtContentTip = function(){
    var $this   = $(this);
    var html    = $this.data('popover-html');
    var popover = $this.data('bs.popover');
    var $tip    = $this.data('bs.popover').tip();

    if(popover.refreshInProgress == true){
      return html;
    }
    
    $('DIV.popover.tt').not($tip).removeClass('in').hide();
    
    // Cache + timeout 2s
    var now  = (new Date()).getTime();
    if (html && timeout+2000 > now){ return ttHTML($this, $tip, html); }
    timeout = now;
    
    var url = $this.attr('longDesc') || $this.attr('data-jalios-tt-url');
    if (url){
      url += (url.indexOf('?')>0?'&':'?')+'d='+(new Date()).getTime(); // Fix JCMS-2636
      $this.refresh({
        'url': url,
        'target': $tip.find('.popover-content'),
        'nohistory': true,
        'noscroll': true,
        'callback' : function($target, html){ 
          if (!html){  popover.refreshInProgress = false; $tip.hide(); return; }
          popover.refreshInProgress=true;
          ttHTML($this, $tip, html, true);
          popover.show(); // relocate
          popover.refreshInProgress = false;
        } 
      });
    }
    else if ($this.attr('title')) {
      var title = '<p class="tip-content">'+$this.attr('title')+'</p>';
      $this.removeAttr('title');
      ttHTML($this, $tip, title);
      return title;
    }
    else if ($this.attr('data-original-title')) {
      var title = '<p class="tip-content">'+$this.attr('data-original-title')+'</p>';
      $this.removeAttr('data-original-title');
      ttHTML($this, $tip, title);
      return title;
    }
    else if (html) { 
      ttHTML($this, $tip, html);
      return html;
    }
    else { // Default on inline data
      var $tt = $this.nextAll('.ctxTooltip');
      if (!$tt.exists()){ $tt = $this.parent().nextAll('.ctxTooltip'); }
      ttHTML($this, $tip, $tt.first().html());
      popover.show();
    }
    
    return '...';
  }
  
  var ttHTML = function($this, $tip, html, skip){
    if (!html){ $tip.hide(); return; }
    if (!skip){ $tip.find('.popover-content').html(html); }
    $this.data('popover-html', html);
    return html
  }
  
  // ------------------------------------------
  //  TT COMMON
  // ------------------------------------------
  
  var ttToggle = function($e, click){
    if (!$e.data('bs.popover')){ 
      return false;
    }
    
    var $tip = $e.data('bs.popover').$tip;
    if ($tip.hasClass('in')){ 
      if (click){ $tip.removeClass('in').hide(); }
      return true; 
    }
    // Cache + timeout 10s
    var now  = (new Date()).getTime();
    if (timeout+10000 < now){ 
      //request new content
      return false;
    }
    
    $('DIV.popover.tt').removeClass('in').hide();
    
    $e.popover('show');  
    return true;
  }
  
  // ------------------------------------------
  //  PUBLIC
  // ------------------------------------------
  
  // Plugin initialization on DOM ready
  $(document).ready(function($) {
    register();
  });
  
}(window.jQuery);