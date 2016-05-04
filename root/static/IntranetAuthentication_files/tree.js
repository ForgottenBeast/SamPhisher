function toggleUL(event, ulId,img,open,openable) {
 ulElt = document.getElementById(ulId) ;
 ulElt.style.display = ulElt.style.display=="none" ? "block" : "none" ;
 img.src = ulElt.style.display=="block" ? open : openable ;
 if ( (event&&event.ctrlKey) ) {
  var descendants = ulElt.getElementsByTagName("UL") ;
  var icons = ulElt.getElementsByTagName("IMG") ;
  if (ulElt.style.display=="block") {
   for(var i=0;i<descendants.length;i++) { descendants[i].style.display = "block" ; }
   for(var i=0;i<icons.length;i++) { if (icons[i].src.indexOf(openable)!=-1) { icons[i].src = open ; } }
  } else {
   for(var i=0;i<descendants.length;i++) { descendants[i].style.display = "none" ; }
   for(var i=0;i<icons.length;i++) { if (icons[i].src.indexOf(open)!=-1) { icons[i].src = openable ; } }  
  }
 }
}