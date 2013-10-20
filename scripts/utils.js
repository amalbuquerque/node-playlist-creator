// 2013-10-20, AA: From http://stackoverflow.com/a/4673436/687420
// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function getDateTimeString(){

    //For todays date;
    var getDate = function( currentDate ){ 
        return ((currentDate.getDate() < 10)?"0":"") 
        + currentDate.getDate() +"/"+(((currentDate.getMonth()+1) < 10)?"0":"") 
        + (currentDate.getMonth()+1) +"/"+ currentDate.getFullYear() 
    };

    //For the time now
    var getTime = function( currentDate ){
         return ((currentDate.getHours() < 10)?"0":"") + currentDate.getHours() +":"+ ((currentDate.getMinutes() < 10)?"0":"") + currentDate.getMinutes() +":"+ ((currentDate.getSeconds() < 10)?"0":"") + currentDate.getSeconds();
    };

    var currentdate = new Date(); 

    var datetime =  "" + currentdate.getDate() + "/"
                    + (currentdate.getMonth()+1)  + "/" 
                    + currentdate.getFullYear() + " @ "  
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
    // return datetime;

    return getDate(currentdate) + ' @ ' + getTime(currentdate);
}

function log( msg ){
    if(DEBUG) {
        console.log(getDateTimeString() + ': ' + msg);
    }
}
