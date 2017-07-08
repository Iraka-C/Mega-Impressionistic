/*
	By Iraka & Liu Zhichao as a project of Digital Art class
	to visualize a grid field for an image
	This .js file contains initalizer and event handlers
*/
//mousedrag
var pmouseX;
var pmouseY;
var affectRadius=25;
var force=0.25;
var isMouseDown=0;
var useDefaultField=0;
var useDefaultBackground = 1;
var prevUseDefaultBackground = 1-useDefaultBackground;
var useField = 1;
function mouseDragged() {
   	var v = [];
   	v[0] = mouseX-pmouseX;
   	v[1] = mouseY-pmouseY;
   	//normalize(v);
   	v[0] *= force;
   	v[1] *= force;
    //console.log(pmouseX+","+pmouseY);
    for(var i=-affectRadius; i<=affectRadius; i++) {
      for(var j=-affectRadius; j<=affectRadius; j++) {
        if(i*i+j*j<affectRadius*affectRadius)
        if(pmouseX+i>=0 && pmouseX+i<w && pmouseY+j>=0 && pmouseY+j<h ){
            //console.log((pmouseX+i)+','+(pmouseY+j));
            tfield.vec[pmouseY+j][pmouseX+i].x += v[0];
            //tfield.vec[pmouseY+j][pmouseX+i].x *= 0.9;
            tfield.vec[pmouseY+j][pmouseX+i].y += v[1];
            //tfield.vec[pmouseY+j][pmouseX+i].y *= 0.9;
        }
      }
    }
}

//initialization
function init(){
	// welcome info
	$("<div></div>")
		.attr("id","hintpanel")
		.text("Drag an image to here.")
		.fadeIn("slow")
        .click(function(e){
            useDefaultField=1-useDefaultField;
            $("#hintpanel").html("Drag an image to here."+(useDefaultField?"&radic;":""));
        })
		.appendTo("#infopanel");
    $("<div></div>")
		.attr("id","clearField")
		.html("Custom field [&times;]")
		.fadeIn("slow")
        .click(function(e){
            useField=1-useField;
            $("#clearField").html("Custom field ["+(1-useField?"&radic;":"&times;")+"]");
        })
		.appendTo("#infopanel");
	setSize();
	// bind() not jQuery compatible:
	// event.dataTransfer can't be sent
	/*$("#canvaspanel")
		.bind({
			"dragenter":dragHandle,
			"dragleave":dragHandle,
			"dragover":dragHandle,
			"drop":dragHandle
		});*/
	var drop=document.getElementById("canvaspanel");
	drop.addEventListener("dragenter",dragHandle,false);
	drop.addEventListener("dragleave",dragHandle,false);
	drop.addEventListener("dragover",dragHandle,false);
	drop.addEventListener("drop",dragHandle,false);
    console.log("Bind");
};

// the function to resize every element
// to a relatively beautiful range
// when window size changes
var leftGap=0;
var topGap=0;
var mouseX=0;
var mouseY=0;

function setSize(){
	var doc=document.documentElement;
	var p=$("#infopanel");
	if(p.get(0))p.css("font-size",doc.clientWidth/$("#hintpanel").text().length);
    c=$("#canvas");
	if(c.get(0)){
		leftGap=Math.round((doc.clientWidth-c.get(0).width)/2);
		topGap=Math.round((doc.clientHeight-c.get(0).height)/2);
		c.css({
			"left":leftGap,
			"top":topGap
		});
	}
	c=$("#cover");
	if(c.get(0)){
		c.css({
			"left":leftGap,
			"top":topGap
		});
	}
}

// handler for a file-dropped event
// draw the image file onto a canvas element
function dragHandle(e){
	e.preventDefault();
	if(e.type=="dragenter"){
		$("#hintpanel").text("Release mouse to drop the image.");
        $("#clearField").text("");
		setSize();
	}
	try{
		if(e.type=="dragleave"){
			throw 0; // no file dropped
		}
		if(e.type=="drop"){
			$("#hintpanel").text("Please wait ...");
            $("#clearField").text("");
			var file=e.dataTransfer.files[0];
			if(!file.type.match(/image*/))throw 0; // if not an image

			window.URL=window.URL||window.webkitURL;
			$("<img/>") // create a temporary image element
				.attr("src",window.URL.createObjectURL(file))
				.load(function(e){ // when image is loaded into DOM
					$("#canvaspanel").empty();
					w=this.width; // global width, in field.js
					h=this.height; // global height, in field.js
					var w_win=Math.min(document.documentElement.clientWidth-50,800);
					var h_win=Math.min(document.documentElement.clientHeight-50,800);
					if(w>w_win||h>h_win){
						var rx=w_win/w,ry=h_win/h;
						var r=Math.min(rx,ry);
						w=Math.round(w*r);
						h=Math.round(h*r);
					}
					$("<canvas></canvas>") // create a canvas element
						.attr({
							"id":"canvas",
							"width":w,
							"height":h
						})
						.addClass("canvas").addClass("withShadow")
						.fadeIn("slow")
						.appendTo("#canvaspanel")
						.get(0) // get canvas DOM
						.getContext("2d") // get context
						.drawImage(this,0,0,w,h);
					window.URL.revokeObjectURL(this.src); // release img URL
					setSize();
					initController();
					initField();
				});

			// disable drag file function
			var drop=document.getElementById("canvaspanel");
			drop.removeEventListener("dragenter",dragHandle,false);
			drop.removeEventListener("dragleave",dragHandle,false);
			drop.removeEventListener("dragover",dragHandle,false);
			drop.removeEventListener("drop",dragHandle,false);
		}
	}
	catch(err){ // catch "No file dropped" error
		$("#hintpanel").text("Drag an image to here."+(useDefaultField?"&radic;":""));
        $("#clearField").text("Custom field ["+(1-useField?"&radic;":"&times;")+"]");
		setSize();
	}
}

function mousemoveHandler(e){
    pmouseX=mouseX;
    pmouseY=mouseY;
	mouseX=e.clientX-leftGap;
	mouseY=e.clientY-topGap;
    if(isMouseDown)mouseDragged();
	//drawGrad(e); // drawn in main loop
}

function initController(){ // controllers for rendering parameters
	$("<div></div>")
		.attr("id","speedcontroller")
		.addClass("controller")
		.text("Speed: "+delta.toFixed(2))
		.fadeIn("slow")
		.appendTo("#controllerpanel");
	$("<div></div>")
		.attr("id","strokecontroller")
		.addClass("controller")
		.text("Stroke: "+stroke.toFixed(1))
		.fadeIn("slow")
		.appendTo("#controllerpanel");
	$("<div></div>")
		.attr("id","trailcontroller")
		.addClass("controller")
		.text("Trail: "+(trail?"YES":"NO"))
		.fadeIn("slow")
		.appendTo("#controllerpanel");
    $("<div></div>")
		.attr("id","radiuscontroller")
		.addClass("controller")
		.text("Radius: "+affectRadius.toFixed(0))
		.fadeIn("slow")
		.appendTo("#controllerpanel");
    /*$("<div></div>")
		.attr("id","forcecontroller")
		.addClass("controller")
		.text("Force: "+force.toFixed(1))
		.fadeIn("slow")
		.appendTo("#controllerpanel");*/
    $("<div></div>")
		.attr("id","useDefaultBackground")
		.addClass("controller")
		.text("Image: "+(useDefaultBackground?"YES":"NO"))
		.fadeIn("slow")
		.appendTo("#controllerpanel");

	document.getElementById("speedcontroller").addEventListener("mousewheel",changeSpeed);
	document.getElementById("strokecontroller").addEventListener("mousewheel",changeStroke);
	document.getElementById("trailcontroller").addEventListener("mousewheel",changeTrail);
    document.getElementById("trailcontroller").addEventListener("click",changeTrail);
    document.getElementById("radiuscontroller").addEventListener("mousewheel",changeRadius);
    //document.getElementById("forcecontroller").addEventListener("mousewheel",changeForce);
    document.getElementById("useDefaultBackground").addEventListener("mousewheel",changeUseDefaultBackground);
    document.getElementById("useDefaultBackground").addEventListener("click",changeUseDefaultBackground);
}

//================= UI Controller =====================
function changeForce(e) {
    stopBubble(e);
	stopDefault(e);
	if(e.wheelDelta>0&&force<2){ // max=100
        force+=0.05;
	}
	else if(e.wheelDelta<0&&force>0.05){ // min=5
        force-=0.05;
	}

	$("#forcecontroller").text("Force: "+force.toFixed(2))
}
function changeRadius(e) {
    stopBubble(e);
	stopDefault(e);
	if(e.wheelDelta>0&&affectRadius<48){ // max=50
        affectRadius+=5;
	}
	else if(e.wheelDelta<0&&affectRadius>7){ // min=5
        affectRadius-=5;
	}

	$("#radiuscontroller").text("Radius: "+affectRadius.toFixed(0))
}
function changeSpeed(e){
	stopBubble(e);
	stopDefault(e);
	if(e.wheelDelta>0&&delta<0.49){ // max=0.5
        delta+=0.02;
	}
	else if(e.wheelDelta<0&&delta>0.03){ // min=0.02
        delta-=0.02;
	}
	$("#speedcontroller").text("Speed: "+delta.toFixed(2));
}

function changeStroke(e){
	stopBubble(e);
	stopDefault(e);
	if(e.wheelDelta>0&&stroke<4.7){ // max=5
		stroke+=0.5;
	}
	else if(e.wheelDelta<0&&stroke>0.7){ // min=0.5
		stroke-=0.5;
	}
	$("#strokecontroller").text("Stroke: "+stroke.toFixed(1));
}

function changeTrail(e){
	stopBubble(e);
	stopDefault(e);
	trail=1-trail;
	$("#trailcontroller").text("Trail: "+(trail?"YES":"NO"));
}
function changeUseDefaultBackground(e) {
    stopBubble(e);
	stopDefault(e);
	useDefaultBackground=1-useDefaultBackground;
	$("#useDefaultBackground").text("Image: "+(useDefaultBackground?"YES":"NO"));
}

//================= Event flow control =================
function stopBubble(e){
	if (e&&e.stopPropagation){
		e.stopPropagation();
	}
	else{
		window.event.cancelBubble=true;
	}
}

function stopDefault(e){
	if (e&&e.preventDefault){
		e.preventDefault();
	}
	else{
		window.event.returnValue=false;
	}
	return false;
}

//================= Debug Area ========================
// Use original field from https://github.com/DomonJi/InteractiveStarryNight
// For Starry Night ONLY

function readField(){
	$("<div></div>")
		.attr("id","errorMsg")
		.addClass("controller")
		.html("<span style='color:#ffff00'>Data Not Received</span>")
		.fadeIn("slow")
		.appendTo("#controllerpanel");
	$.get(
		"https://raw.githubusercontent.com/DomonJi/InteractiveStarryNight/master/data/field.txt",
		function(data,status){
			console.log(status);
            if(data&&data.length>100000){
                console.log("Data Ready");
			    parseField(data.split("\t"));
				$("#errorMsg").fadeOut();
            }
		}
	);
}

function parseField(fieldData){
	for(var i=0;i<h;i++){
		for(var j=0;j<w;j++){
			var ip=Math.floor(i/h*190);
			var jp=Math.floor(j/w*240);
			var dataPoint=fieldData[jp*190+ip].split(",");

			field.vec[i][j].x=parseFloat(dataPoint[0])*10;
			field.vec[i][j].y=parseFloat(dataPoint[1])*10;

		}
	}
	setInterval(loop,40);
}
