/*
	By Iraka & Liu Zhichao as a project of Digital Art class
	to visualize a grid field for an image
	This .js file contains particle system simulator
*/

var delta=0.1; // particle speed
var stroke=2; // stroke width
var MAX_LIFE_TIME=50; // life time of a single particle
var trail=1; // is trail shown ?


var particle; // all particles array
var pix; // image pixel data array

// Particle class
// Create a particle with
//    Particle(x,y,{r,g,b}) // Specified parameters
//    Particle()            // Automatic parameters

function Particle(x,y,color){ // color={r,g,b}
	this.x=x; // ON SCREEN coord (x,y)
	this.y=y;
	this.life=Math.round(Math.random()*MAX_LIFE_TIME); // randomly select lifetime
	this.color="#"+toHexStr(color[0])+toHexStr(color[1])+toHexStr(color[2]); // set color string
}
function Particle(){ // color={r,g,b}
	this.x=Math.round(Math.random()*w); // ON SCREEN coord (x,y)
	this.y=Math.round(Math.random()*h);
	this.life=Math.round(Math.random()*MAX_LIFE_TIME);
	var idx=pixIndex(this.y,this.x,0);
	var color=pix.slice(idx,idx+3);
	this.color="#"+toHexStr(color[0])+toHexStr(color[1])+toHexStr(color[2]);
}
Particle.prototype.update=function(){
	// Update a particle according to its position
	// Meanwhile draw it on to the canvas

	// Round its position to integer coordinate
	var tx=Math.round(this.x);
	var ty=Math.round(this.y);
	if(tx<0||tx>=w||ty<0||ty>=h){ // Out of image range, dies immediately
		this.life=-1;
		return;
	}
	var p=field.vec[ty][tx]; // get a field point, contains its velocity
	var pt=tfield.vec[ty][tx];

	// draw point on canvas
	ctx.strokeStyle=this.color;
	ctx.globalAlpha=this.life/MAX_LIFE_TIME; // the older the particle, the lighter it strokes
	ctx.beginPath();
	ctx.moveTo(this.x,this.y);
	this.x+=(p.x+pt.x)*delta; // renew position
	this.y+=(p.y+pt.y)*delta;
	ctx.lineTo(this.x,this.y);
	ctx.stroke();

	this.life--;

	// Now, custom field is preserved over time
	// If you need to attenuate the user-drawn field through every loop,
	// uncomment the expressions below
	//pt.x*=0.8;
	//pt.y*=0.8;
}

// return a hexadecimal expression of an integer, fixed to two digits
function toHexStr(v){
	if(!v)return "00";
	return (v<16?"0":"")+v.toString(16);
}

// initialize n particles
function initParticle(n){
	pix=$("#canvas").get(0).getContext("2d").getImageData(0,0,w,h).data;
	particle=new Array(n);
	for(var i=0;i<n;i++){
		particle[i]=new Particle();
		//console.log("Init "+particle[i].x+","+particle[i].y);
	}
}

var loopt=0; // loop counter
function loop(){
	if(useDefaultBackground != prevUseDefaultBackground){ // using default background? (original image shown?)
		if(useDefaultBackground){
			$("#canvas").css("opacity","1"); // show original image
		}
		else{
			$("#canvas").css("opacity","0"); // hide original image
		}
	}
	prevUseDefaultBackground = useDefaultBackground;
	//console.log(loopt++);

	// Will the particle trail disappear ?
	if(!trail){
		cv.width=w; // clear canvas
		ctx=cv.getContext("2d"); //refresh ctx
		//ctx.lineCap="round"; // Enable this property will greatly affect processing speed
	}

	// set stroke width
	ctx.lineWidth=stroke;
	for(i in particle){
		particle[i].update(); // including drawing this particle
		if(particle[i].life<=0){ // this particle is dead
			particle[i]=new Particle(); // replace this particle with a new one
		}
	}

}
