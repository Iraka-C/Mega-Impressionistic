/*
	By Iraka & Liu Zhichao as a project of Digital Art class
	to visualize a grid field for an image
	This .js file contains field processor
*/

// velocity vector field
function Point(){
	this.x=10; // initial value to prevent particle stay on image edges
	this.y=10;
	this.g=0; // grayscale value & grad value
}
function Field(w,h){
	this.w=w;
	this.h=h;
	this.vec=new Array(h); // h rows of pixel
	for(var i=0;i<h;i++){
		this.vec[i]=new Array(w);
		for(var j=0;j<w;j++){
			this.vec[i][j]=new Point();
		}
	}
}
Field.prototype.clear=function(){
	for(var i=0;i<this.h;i++){
		for(var j=0;j<this.w;j++){
			this.vec[i][j].x=0;
			this.vec[i][j].y=0;
		}
	}
}

var field; // velocity field
var tfield; // temp field
var cv; // cover canvas in DOM
var ctx; // cv content 2D
var w; // global width
var h; // global height

// function to get the index of pixel (x,y) in an imagedata array
function pixIndex(x,y,offset){ // offset: {R:0,G:1,B:2,A:3}
  return 4*(x*w+y)+offset;
};

function initField(){

	field=new Field(w,h);
	tfield=new Field(w,h);
	cv=$("<canvas></canvas>") // create a cover canvas for containing strokes
		.attr({
			"id":"cover",
			"width":w,
			"height":h
		})
		.addClass("canvas").addClass("withShadow")
		.fadeIn("slow")
		.appendTo("#canvaspanel")
		.get(0); // get canvas DOM
	setSize();
	ctx=cv.getContext("2d");

	// get the pixel data (RGBA) of original picture
	var ctx_img=$("#canvas").removeClass("withShadow").get(0).getContext("2d");
	var cvPix_img=ctx_img.getImageData(0,0,w,h).data;

	// randomly spread particles on the cover canvas
	// 5000 particles is both friendly to effects and processing speed
	initParticle(5000);

	// init mouse handlers
	$("#cover").mousemove(mousemoveHandler);
	$("#cover").mousedown(function(e){isMouseDown=1;});
	$("body").mouseup(function(e){isMouseDown=0;});

	if(useField)
	{
		if(useDefaultField){ // use online field data
			console.log("Try to fetch field data");
			tfield.clear();
			readField(); // get online data
			return;
		}
		else{ // calculate field data by one's own
			// continue calculating field
		}
	}
	else { // use custom field
		console.log("Clear field");
		field.clear();
		tfield.clear();
		setInterval(loop,40); // start without calculating
		return;
	}

	// Start calculating field
	// Calculate gray scale of the image
	for(var i=0;i<h;i++){
		for(var j=0;j<w;j++){
			field.vec[i][j].g=(cvPix_img[pixIndex(i,j,0)]+cvPix_img[pixIndex(i,j,1)]+cvPix_img[pixIndex(i,j,2)])/3;
		}
	}

	// Gaussian Blur to reduce noise
	// Now disabled !
	for(var t=1;t<=0;t++){
		for(var i=1;i<h-1;i++){
			for(var j=1;j<w-1;j++){
				tfield.vec[i][j].g=( // one pattern, loop to create larger pattern
					field.vec[i-1][j+1].g+2*field.vec[i][j+1].g+field.vec[i+1][j+1].g+
					2*field.vec[i-1][j].g+4*field.vec[i][j].g+2*field.vec[i+1][j].g+
					field.vec[i-1][j-1].g+2*field.vec[i][j-1].g+field.vec[i+1][j-1].g
				)/16;
			}
		}
		for(var i=1;i<h-1;i++){
			for(var j=1;j<w-1;j++){
				field.vec[i][j].g=tfield.vec[i][j].g;
			}
		}
	}

	// Calculate grad field with Sobel operator
	for(var i=1;i<h-1;i++){
		for(var j=1;j<w-1;j++){
			field.vec[i][j].x=(
				(2*field.vec[i][j+1].g+field.vec[i+1][j+1].g+field.vec[i-1][j+1].g)-
				(2*field.vec[i][j-1].g+field.vec[i+1][j-1].g+field.vec[i-1][j-1].g)
			)/4;
			field.vec[i][j].y=(
				(2*field.vec[i+1][j].g+field.vec[i+1][j+1].g+field.vec[i+1][j-1].g)-
				(2*field.vec[i-1][j].g+field.vec[i-1][j+1].g+field.vec[i-1][j-1].g)
			)/4;

			// to order the vectors to (mostly) same directions
			if(field.vec[i][j].x>0){
				field.vec[i][j].x=-field.vec[i][j].x;
				field.vec[i][j].y=-field.vec[i][j].y;
			}
		}
	}

	// Change Grad field to velocity directions
	for(var i=1;i<h-1;i++){
		for(var j=1;j<w-1;j++){
			var x=field.vec[i][j].x;
			var y=field.vec[i][j].y;
			field.vec[i][j].x=-y;
			field.vec[i][j].y=x;
		}
	}

	// Gaussian Blur on velocity field
	// 3 times is a suitable range
	for(var t=1;t<=3;t++){
		for(var i=1;i<h-1;i++){
			for(var j=1;j<w-1;j++){
				tfield.vec[i][j].x=(
					field.vec[i-1][j+1].x+2*field.vec[i][j+1].x+field.vec[i+1][j+1].x+
					2*field.vec[i-1][j].x+4*field.vec[i][j].x+2*field.vec[i+1][j].x+
					field.vec[i-1][j-1].x+2*field.vec[i][j-1].x+field.vec[i+1][j-1].x
				)/16;
				tfield.vec[i][j].y=(
					field.vec[i-1][j+1].y+2*field.vec[i][j+1].y+field.vec[i+1][j+1].y+
					2*field.vec[i-1][j].y+4*field.vec[i][j].y+2*field.vec[i+1][j].y+
					field.vec[i-1][j-1].y+2*field.vec[i][j-1].y+field.vec[i+1][j-1].y
				)/16;
			}
		}
		for(var i=1;i<h-1;i++){
			for(var j=1;j<w-1;j++){
				field.vec[i][j].x=tfield.vec[i][j].x;
				field.vec[i][j].y=tfield.vec[i][j].y;
			}
		}
	}


	// From now on, tfield acts as recording the custom field.
	tfield.clear();

	// Draw grad field for debug
	//drawField();
	//loop(); // Start only once
	setInterval(loop,40); // Start
}

// an illustration to (vertical direction of) grad field
function drawGrad(){

	var x=mouseX;
	var y=mouseY;

	try{

		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(x+field.vec[y][x].x,y+field.vec[y][x].y);
		ctx.stroke();
	}
	catch(err){
		console.log(x+","+y);
	}
}

function drawField(){
	var cvData=ctx.getImageData(0,0,w,h);
	var cvPix=cvData.data;
	for(var i=1;i<h-1;i++){
		for(var j=1;j<w-1;j++){
			var grad=Math.sqrt((field.vec[i][j].x*field.vec[i][j].x+field.vec[i][j].y*field.vec[i][j].y)/2);
			cvPix[pixIndex(i,j,0)]=grad;
			cvPix[pixIndex(i,j,1)]=0;
			cvPix[pixIndex(i,j,2)]=0;
			cvPix[pixIndex(i,j,3)]=grad;
		}
	}
	ctx.putImageData(cvData,0,0);
}
