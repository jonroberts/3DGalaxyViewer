$(document).keydown(function(e){
    if (e.keyCode == 37) { 
       alert( "left pressed" );
       return false;
    }
    if (e.keyCode == 38) { 
       alert( "up pressed" );
       return false;
    }
    if (e.keyCode == 39) { 
       alert( "right pressed" );
       return false;
    }
    if (e.keyCode == 40) { 
       alert( "down pressed" );
       return false;
    }
});