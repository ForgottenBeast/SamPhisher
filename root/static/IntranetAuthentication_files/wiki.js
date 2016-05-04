/* Wiki JS */

Event.observe(window, 'load' ,  function(){
  /* Open Notes */
  Util.observeClass('note',function(event, elm, className, eventName){
    var note = $(elm).fastNext('DIV','note',false,2);
    if (note.style.display == 'block'){
    
      note.setStyle({ display: 'none' });
    
    } else {
    
      var prev = $(document._last);
      if (prev){ prev.setStyle({ display: 'none' }); }
      
      note.setStyle({ display: 'block' });
      document._last = note.identify();
    }
  });
});



// Put your custom scripts here