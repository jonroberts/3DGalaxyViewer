// • Add options of different maximum redshifts

// code for disabling mouse scrolling.
function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

function wheel(e) {
  preventDefault(e);
}

function disableScroll() {
  if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', wheel, false);
  }
  window.onmousewheel = document.onmousewheel = wheel;
}

function enableScroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = null;  
}

disableScroll();

c3dl.addMainCallBack(canvasMain, "galaxyViewer");

var isDragging = false; //tracks or not the user is currently dragging the mouse
var rotationStartCoords = [0,0]; //The mouse coordinates at the beginning of a rotation
var SENSITIVITY = 0.7;
var maxDistance=4000;

var zMax=0.01
var zMin=0.008;
var EMin=55;
var mult=1;

function getZLims(){
	zMin=localStorage.getItem('zMin');
	if(zMin==null){
		zMin=0;
	}
	zMax=localStorage.getItem('zMax');
	if(zMax==null){
		zMax=0.01;
	}
}

function updateZTerms(){
	//document.getElementById("secTitle").innerHTML = "2MRS Galaxies from z="+zMin+" to "+zMax;
	document.getElementById("zMinField").value=zMin;
	document.getElementById("zMaxField").value=zMax;
	document.getElementById("zMinTag").innerHTML=zMin;
	document.getElementById("zMaxTag").innerHTML=zMax;
}

function setZLims(form){
	localStorage.setItem('zMin',zMinField.value);
	localStorage.setItem('zMax',zMaxField.value);
}

// Now we call it.
getZLims();

function updateZRange(){
	var min=new Number(document.getElementById("zMinField").value);
	var max=new Number(document.getElementById("zMaxField").value);	
	var step=new Number(document.getElementById("zMaxField").step);
	
	if(min>=max){
		min=max-step;
		document.getElementById("zMinField").value=min;
	}
	
	document.getElementById("zMinTag").innerHTML=min.toFixed(3);
	document.getElementById("zMaxTag").innerHTML=max.toFixed(3);
}

function updateERange(){
	EMin=new Number(document.getElementById("EMinField").value);
	document.getElementById("EMinTag").innerHTML=EMin.toFixed(0)+" EeV";
	
	var isVis=false;
	for(var i in objects[4]){
		if(objects[4][i].isVisible()){
			isVis=true;
		}
	}

	if(isVis){
		for(var i in objects[4]){
			if(CRs[i]["E"]>EMin){
				objects[4][i].setVisible(true);}
			else{
				objects[4][i].setVisible(false);}
		}
	}
}

var currentOrigGal;
var currentFinalGal;
//var previousOrigColour;
var currentLine;
var cameraLine;

//Called when the user releases the left mouse button.
//Records that the user is no longer dragging the mouse
function mouseUp(evt)
{
	if(evt.which == 1)
	{
		isDragging = false;
	}
}

//Called when the user presses the left mouse button.
//Records that the user may start to drag the mouse, along with the current X & Y
// coordinates of the mouse.
function mouseDown(evt)
{
	if(evt.which == 1)
	{
		isDragging = true;
		rotationStartCoords[0] = xevtpos(evt);
		rotationStartCoords[1] = yevtpos(evt);
	}
}

function mouseScroll(evt)
{	
	var cam = scn.getCamera();
	var delta=2.*evt.wheelDelta;
	if(delta<0)
	{cam.goFarther(Math.abs(delta));}
	else
	{cam.goCloser(Math.abs(delta));}
}

//Called when the mouse moves
//This function will only do anything when the user is currently holding
// the left mouse button.  It will determine how far the cursor has moved
// since the last update and will pitch and yaw the camera based on that
// amount and the sensitivity variable.
function mouseMove(evt)
{
	if(isDragging == true)
	{
        var cam = scn.getCamera();
		var x = xevtpos(evt);
		var y = yevtpos(evt);
		
		// how much was the cursor moved compared to last time
		// this function was called?
		var deltaX = x - rotationStartCoords[0];
        var deltaY = y - rotationStartCoords[1];

		cam.yaw(-deltaX * SENSITIVITY);
		cam.pitch(deltaY * SENSITIVITY);
		
		// now that the camera was updated, reset where the
		// rotation will start for the next time this function is 
		// called.
		rotationStartCoords = [x,y];
	}
}

//Calculates the current X coordinate of the mouse in the client window
function xevtpos(evt)
{
    return 2 * (evt.clientX / evt.target.width) - 1;
}

//Calculates the current Y coordinate of the mouse in the client window
function yevtpos(evt)
{
    return 2 * (evt.clientY / evt.target.height) - 1;
}

function getMultCoords(coordsIn,mult){
	var coords=[3];
	coords[0]=coordsIn[0]*mult;
	coords[1]=coordsIn[1]*mult;
	coords[2]=coordsIn[2]*mult;
	return coords;	
}

function getGals(){
	origins={}; // The uncorrected locations of the corrected galaxies
	lines={}; // The lines connecting the original locations to the final locations
	gals={}; // The corrected locations of the galaxies
	uncorrGals={}; // the galaxies with no corrections

	var maxR=0;
	for(var i in finalGals){
		var z=finalGals[i]["z"];

		if(z>zMin && z<zMax){
			var coords=origGals[i]["coords"];
			var R=Math.sqrt(coords[0]*coords[0]+coords[1]*coords[1]+coords[2]*coords[2]);
			if(R>maxR){
				maxR=R;
			}
		}	
	}	

	mult=maxDistance/(4.*maxR);

	for(var i in finalGals){
		
		var zEff=finalGals[i]["z_eff"];
		var z=finalGals[i]["z"];
		
		if(z>zMin && z<zMax){
			// gal1 are the corrected distances
			var gal1=new c3dl.Point();
			
			gal1.setPosition(getMultCoords(finalGals[i]['coords'],mult));
			gal1.setColor([0.1,0.4,0.1]);
			gal1.setName(i);
			gal1.setVisible(false);

			gals[i]=gal1;

			var line=new c3dl.Line();
			line.setCoordinates(getMultCoords(origGals[i]['coords'],mult),getMultCoords(finalGals[i]['coords'],mult));
			line.setColors([0.4,0.1,0.1],[0.1,0.4,0.1]);
			line.setWidth(0.1);
			line.setVisible(false);
			lines[i]=line;

			var gal2=new c3dl.Point();
			gal2.setPosition(getMultCoords(origGals[i]['coords'],mult));
			gal2.setColor([0.4,0.1,0.1]);
			gal2.setName(i);
			gal2.setVisible(true);
			origins[i]=gal2;
		}
	}

	for(i in origGals){
		if(i in finalGals){
			continue;
		}
		var z=origGals[i]["z"]
		if(z>zMin && z<zMax){
			var gal=new c3dl.Point();
			gal.setPosition(getMultCoords(origGals[i]['coords'],mult));
			gal.setColor([0.3,0.3,0.3]);
			gal.setName(i);
			gal.setVisible(false);
			uncorrGals[i]=gal;
		}
	}
	
	return [origins,gals,lines,uncorrGals];
}

var objects=getGals();

function resetSample(zMinIn,zMaxIn){
	zMax=zMaxIn;
	zMin=zMinIn;
	object=getGals();
}

function toggleOrigGals(){
	var key;
	for(var i in objects[0]){
		if(key==undefined)
		{key=i;}
		objects[0][i].setVisible(!objects[0][i].isVisible());
	}
	document.getElementById('origLocButton').innerHTML = (objects[0][key].isVisible())?"Hide Original Locations":"Show Original Locations";
}
function toggleFinalGals(){
	var key;
	for(var i in objects[1]){
		if(key==undefined)
		{key=i;}
		objects[1][i].setVisible(!objects[1][i].isVisible());
	}
	document.getElementById('finalLocButton').innerHTML = (objects[1][key].isVisible())?"Hide Final Locations":"Show Final Locations";
}
function toggleLines(){
	var key;
	for(var i in objects[2]){
		if(key==undefined)
		{key=i;}
		objects[2][i].setVisible(!objects[2][i].isVisible());
	}
	document.getElementById('linesButton').innerHTML = (objects[2][key].isVisible())?"Hide Lines":"Show Lines";
}
function toggleUncorrectedGals(){
	var key;
	for(var i in objects[3]){
		if(key==undefined)
		{key=i;}
		objects[3][i].setVisible(!objects[3][i].isVisible());
	}
	console.log(document.getElementById('unCorrGalsButton').innerHTML);
	document.getElementById('unCorrGalsButton').innerHTML = (objects[3][key].isVisible())?"Hide Uncorrected Gals":"Show Uncorrected Gals";
}

function canvasMain(canvasName){

	scn = new c3dl.Scene();
	scn.setCanvasTag(canvasName);
	
	renderer = new c3dl.WebGL();
	renderer.createRenderer(this);
	
	var origins=objects[0];
	var gals=objects[1];
	var lines=objects[2];
	var uncorrGals=objects[3];

	scn.setRenderer(renderer);
	scn.init(canvasName);

	scn.setPointSize(3);

	if(renderer.isReady() ){
		// sets the background color in the format rgb (normalised from 0-1)
		scn.setBackgroundColor([1,1,1]);
		for(var i in origins){
			scn.addObjectToScene(origins[i]);
		}
	
		for(var i in gals){
			scn.addObjectToScene(gals[i]);
		}
		for(var i in lines){
			scn.addObjectToScene(lines[i]);
		}	
		for(var i in uncorrGals){
			scn.addObjectToScene(uncorrGals[i]);
		}	
	
		var cam = new c3dl.OrbitCamera();
		cam.setFarthestDistance(5000);
		cam.setClosestDistance(60);	
		cam.setOrbitPoint([0.0, 0.0, 0.0]);
		cam.setDistance(2500);
		scn.setCamera(cam);
			
		scn.setMouseCallback(mouseUp,mouseDown, mouseMove, mouseScroll);
		
		scn.startScene();
		
		// tell the scene what function to use when
		// a mouse event is detected
		scn.setPickingCallback(handler); 
	}
}

function highlightGalaxy(obj){
	if(currentOrigGal!=undefined){
		currentOrigGal.setColor(currentOrigGal.previousColour);
	}
	if(currentFinalGal!=undefined){
		currentFinalGal.setColor(currentFinalGal.previousColour);
	}

	if(currentLine!=undefined){
		scn.removeObjectFromScene(currentLine);
	}
	var locID=obj.getName();
	if(locID in objects[0]){
		currentOrigGal=objects[0][locID];
		currentOrigGal.previousColour=currentOrigGal.getColor();
		currentOrigGal.setColor([1,0.2,0.2]);		
	}
	if(locID in objects[1]){
		currentFinalGal=objects[1][locID];
		currentFinalGal.previousColour=currentFinalGal.getColor();
		currentFinalGal.setColor([0.2,1,0.2]);
	}
	if(locID in objects[3]){
		currentOrigGal=objects[3][locID];
		currentOrigGal.previousColour=currentOrigGal.getColor();
		currentOrigGal.setColor([0,0,0]);		
	}
	
	if(locID in objects[0] && locID in objects[1]){
		currentLine=new c3dl.Line();
		currentLine.setCoordinates(getMultCoords(origGals[locID]["coords"],mult),getMultCoords(finalGals[locID]["coords"],mult));
		currentLine.setColors([1,0.2,0.2],[0.2,1,0.2]);
		currentLine.setWidth(2);
		scn.addObjectToScene(currentLine);
	}
	
	// present the details of the galaxy
	document.getElementById('galID').innerHTML = "ID:		<a href=\"http://ned.ipac.caltech.edu/cgi-bin/imgdata?objname=2MASX+J"+obj.getName() +"\" target=_blank>"+obj.getName()+"</a>";
	document.getElementById('galL').innerHTML = "l:		"+origGals[obj.getName()]["L"];
	document.getElementById('galB').innerHTML = "b:		"+origGals[obj.getName()]["B"];
	document.getElementById('galZ').innerHTML = "z:		"+origGals[obj.getName()]["z"];
	if(obj.getName() in finalGals){
		document.getElementById('galZEff').innerHTML = "z_eff:	"+finalGals[obj.getName()]["z_eff"];
	}
	else{
		document.getElementById('galZEff').innerHTML = "z_eff:	N/A";
	}
}

function gotoGalaxy(obj){
	var galPos=obj.getPosition();
	var galDist=c3dl.vectorLength(galPos);
	var cam = scn.getCamera();
	var camDist=c3dl.vectorLength(cam.getPosition());

	var newCamLocation=c3dl.multiplyVector(galPos,camDist/galDist);
	cam.setPosition(newCamLocation);
}

// This function is the callback that is passed to the scene.
// When a mouse down event is detected this function is called.
// The handler is given an object that knows what button was
// pressed and has a list of objects picked.
function handler(result)
{
	var buttonUsed = result.getButtonUsed();
	var objectsPicked = result.getObjects();
	if(objectsPicked != undefined)
	{
		// a left mouse click will equal 1;
		// at present that is the only mouse event implemented
		if (buttonUsed == 1)
		{
			// get the object that was picked
			var obj;
			for(i in objectsPicked){
				obj = objectsPicked[i];
				if(obj.isVisible())
				{break;}
			}

			if(obj!=undefined){
				if(obj.isVisible())
				{highlightGalaxy(obj);}
			}
		}
	}
}

// initialising form behavior so that it doesn't reload the page.
$(function(){
	// overrides the 'submit' action of the form element.
	$('#selectGalaxy').submit(function () {
	 jumpToGalaxy(this);
	 return false;
	});
	$('#jumpToLB').submit(function () {
	 jumpToLB(this);
	 return false;
	});
	$('#selectRedshift').submit(function () {
	 setZLims(this);
	 //return false;
	});
})

function jumpToGalaxy(form){
	if(galaxyID.value in objects[0])
	{
		var obj=objects[0][galaxyID.value];
		highlightGalaxy(obj);
		gotoGalaxy(obj);
	}
	else{
		alert(galaxyID.value+" is not a valid ID for galaxies within this redshift.");
	}
}

function getPosFromLB(L,B,z){
	console.log(z);
	var theta=Math.PI/2.-B*Math.PI/180.;
	var phi=L*Math.PI/180.;
	var r=z/zMax*1000;

	x=r*Math.sin(theta)*Math.cos(phi);
	y=r*Math.sin(theta)*Math.sin(phi);
	z=r*Math.cos(theta);
	
	return [x,y,z];
}

function jumpToLB(form){
	var pos=getPosFromLB(galaxyL.value,galaxyB.value,galaxyZ.value);

	if(cameraLine!=undefined){
		scn.removeObjectFromScene(cameraLine);
	}

	var line=new c3dl.Line();
	line.setCoordinates([0,0,0],pos);
	line.setColors([1,0.5,0.5],[1,0.5,0.5]);
	line.setWidth(0.2);
	cameraLine=line
	scn.addObjectToScene(cameraLine);

	var cam = scn.getCamera();
	cam.setPosition(pos);
}


