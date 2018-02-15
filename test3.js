var mycanvas;
var myctx;
var mainImage = null;
var maskImage = null;
var overlapRegion=null;
var overlapRegionP1 = null;
var overlapRegionP2 = null;
var TEST_COUNTER=0;
var MIN_TEST_COUNT=0;
var MAX_TEST_COUNT=1;

$(document).ready(function () {

	var $ = function(id){return document.getElementById(id)};
  	var el, lastActive, object;

	mycanvas  = new fabric.Canvas('c');
	mycanvas.backgroundColor = "#68a5c4";
	mycanvas.preserveObjectStacking=true;
	mycanvas.renderAll();
	myctx = mycanvas.getContext("2d");
  
	console.log("Loading main image...");
    fabric.Image.fromURL('./mask2.jpg', function(myImg) {
		mainImage = myImg.set({ left: 200, top: 0 , width:300, height:218});
		mainImage.itemId = 'a65c6bd6-a33b-4c9c-8d3c-811c6aae17d6';
		mycanvas.add(mainImage); 


		fabric.Maskedimage.fromURL('./image.jpg', function(myImg) {
			console.log("done loading mask.");
			//i create an extra var for to change some image properties
			maskImage = myImg.set({ left: 0, top: 0, width:300, height:218, opacity: 1.0});
			maskImage.objectCaching=false;				 
			mycanvas.add(maskImage); 
		});
	});

	// crop image
  	$('startCrop').onclick = function(){
  	  	startCrop();
  	};

  	$('endCrop').onclick = function(){
    	endCrop();
  	};

  	function startCrop(){

	    mycanvas.remove(el);
	    if(mycanvas.getActiveObject()) {  
	      object=mycanvas.getActiveObject();
	  
	      if(lastActive !== object)
	        {console.log('different object');}  
	      else {console.log('same object');}
	      if (lastActive && lastActive !== object) {
	        lastActive.clipTo = null;    
	      }
	   
	      el = new fabric.Rect({
	        fill: 'transparent',
	        originX: 'left',
	        originY: 'top',
	        stroke: '#ccc',
	        strokeDashArray: [2, 2],
	        opacity: 1,
	        width: 1,
	        height: 1,
	        borderColor: '#36fd00',
	        cornerColor: 'green',
	        hasRotatingPoint:false,
	        objectCaching: false
	      });
	  
	      el.left=mycanvas.getActiveObject().left;
	      el.top=mycanvas.getActiveObject().top;
	      el.width=mycanvas.getActiveObject().width*mycanvas.getActiveObject().scaleX;
	      el.height=mycanvas.getActiveObject().height*mycanvas.getActiveObject().scaleY;
	    
	      mycanvas.add(el);
	      mycanvas.setActiveObject(el)
	    }
	  
	    else {
	      alert("Please select an object or layer");
	    }
	 }

	  function endCrop(){
	    var left = el.left - object.left;
	    var top = el.top - object.top;
	    
	    left *= 1;
	    top *= 1;
	    
	    var width = el.width * 1;
	    var height = el.height * 1;
	    object.clipTo = function (ctx) {      
	      ctx.rect(-(el.width/2)+left, -(el.height/2)+top, parseInt(width*el.scaleX), parseInt(el.scaleY*height));
	    }   
	    mycanvas.remove(mycanvas.getActiveObject(el));
	    //console.log('end crop, ', object);
	    lastActive = object;
	    mycanvas.renderAll();   
	}
});

function getUnionRect( x1, y1, w1, h1, x2, y2, w2, h2 ) {
	console.log("main image getUnionRect x1["+x1+"] y1["+y1+"] w1["+w1+"] h1["+h1+"]");
	console.log("mask image getUnionRect x2["+x2+"] y2["+y2+"] w2["+w2+"] h2["+h2+"]");
	var  rx, ry, rw, rh;
	var angle = Math.floor(mainImage.getAngle());
	if (angle === 0) {
		rx = x2 > x1 ? x2 : x1;
		ry = y2 > y1 ? y2 : y1;
		rw = (x1 < x2 ) ? (x1+w1-x2): (x2+w2-x1)
		rh = (y1 + h1) < (y2 + h2) ? (y1 + h1- y2) : (y2 + h2 - y1);
	 	console.log("getUnionRect rx["+rx+"] ry["+ry+"] rw["+rw+"] rh["+rh+"]");
	  	
	} else {
		console.log('angle of main image != 0');
		rx = mainImage.left;
		ry = mainImage.top;
		rw = mainImage.width;
		rh = mainImage.height;
	}
	return  new fabric.Rect({
		left: rx,
		top: ry,
		width: rw,
		height: rh
	});
}