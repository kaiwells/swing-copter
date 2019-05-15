var Images = {};
var canvas = document.getElementById("myCanvas");
//var skyCanvas = document.createElement("skyCanvas");
var SPIKE = 0;
var YELLOWJUMP = 1;
var SPEEDUP = 2;
var LAUNCHER = 3;
var CUBEPORTAL = 4;
var UFOPORTAL = 5;
var CLOWN = 6;
var BALLPORTAL = 7;
var CUBE = 0;
var UFO = 1;
var BALL = 2;
var gravity = 0.2;
canvas.width = 1280;
canvas.height = 720;
var GROUND_WIDTH = 289;
var GROUND_HEIGHT = 200;
var CAMERA_PLAYER_OFFSET = 200;
var GROUND_LEVEL = canvas.height - GROUND_HEIGHT;
var NUMBER_OF_GROUND_TILES = Math.ceil(canvas.width/GROUND_WIDTH)+1;
var RESISTANCE = 0.2;
var turnOnFriction = true;
var MAXSPEED = 40;
var IMAGES_LOADED = 0;
var afterDeathTimer = 100;
var attachPointX = 400;
var attachPointY = 0;
var key = [];
var ctx = canvas.getContext("2d");//document.querySelector("canvas").getContext("2d");
//var ctxSky = document.createElement("skyCanvas").getContext("2d");
var player = {
	x: 66,
	y: 226,
	vx: 0,
	vy: 0,
	w: 34,
	h: 34,
	xHitboxOffset: 0,
	yHitboxOffset: 0,
	w: 34,
	h: 34,
	rotation: 0,
	rotateSpeed: 0,
	type: CUBE,
	attempt: 1, 
	ropeRotation: 0,
	rotationVelocity: -2
};

var scoreMessage = {
	message: "OMG OMG OMG",
	score: "0",
	x: 0,
	y: 0
}

player.ropeRotation=Math.atan((attachPointX-player.x-player.w)/(player.y-attachPointY))*-180/Math.PI;

var imageData = [{
	name: "player",
	url: "img/player.png",
},{
	name: "background",
	url: "img/background.png",
}];
var audio = {
	song: document.getElementById("song"),
	death: document.getElementById("death"),
	menu: document.getElementById("menu")
};
var platformsData = [];
var landingPoints = [];
var theParticles = [];
var camera = {
	x: 0, 
	y: 0, 
	w: canvas.width, 
	h: canvas.height,
	a: 0,
	generateObstacles: 0,
	bg: 0,
	initialX: 0,
	initialY: 0
};
var top5Scores = [0,0,0,0,0];
var playerState = 2;
var JUMPED=1;
var SWINGING=0;
var MOVING=2;
var ROPE = 3;
var REPOSITION = 4;
var CELEBRATE = 5;
var gameHasStarted = 0;
var timer = 0;
var particleTimer = 0;
var score = 0;
var finalScore = 0;
var scoreIncrement = 0;
var playerJumpPointX = 150;
var playerJumpPointY = 226;
var highscore = localStorage.getItem("geomtetrysmashHighscore");
var gameMode;
var attachTimer = 0;
var repositionTimer = 0;
var REPOSITIONTIME = 50;
var ROPETIME = 30;
var scoreTimer = 100;

//var painting = document.getElementById('paint');
//var paint_style = getComputedStyle(painting);
//canvas.width = parseInt(paint_style.getPropertyValue('width'));
//canvas.height = parseInt(paint_style.getPropertyValue('height'));

var mouse = {x: 0, y: 0};
 
canvas.addEventListener('mousemove', function(e) {
  mouse.x = e.pageX - this.offsetLeft;
  mouse.y = e.pageY - this.offsetTop;
}, false);

ctx.lineWidth = 1;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = '#00CC99';
 
canvas.addEventListener('mousedown', function(e) {
	if(afterDeathTimer>60||gameHasStarted===0){
		if(playerState===SWINGING){
			playerState=JUMPED;
			attachTimer=0;
		}
	}
}, false);



	
//Loop over the list of images and add them to the Images Object. Wait for them all to load
function loadImages(list){
     var total = 0;
     document.querySelector("span").innerText = "Loading...";
     for(var i = 0; i < list.length; i++){
		var img = new Image();
		Images[list[i].name] = img;
		img.onload = function(){
			total++;
			if(total == list.length){
				document.querySelector("span").innerText = "";
				//startGame();
				IMAGES_LOADED = 1;
				//chosenPokemon = Math.floor(Math.random() * pokemonData.length);
				//currentPokemon = chosenPokemon;
				
			}				 
		};
		img.src = list[i].url; 
	}     
}

// add all of the images you want to use for the game to this list. name: "theNameYouReferenceTheImageWith url: "thePathToTheFile"
var images = loadImages(imageData);

function gameOver() {
	if (highscore !== null) {
		if (score > highscore) {
			highscore = score;
			localStorage.setItem("highscore", score);      
		}
	} else {
		highscore = score;
		localStorage.setItem("highscore", score);
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.textAlign = "center";
	ctx.font = "45px Arial";
	ctx.fillText("Game Over!",200,100);
	ctx.fillText("Final Score: " + score,200,150);
	ctx.font = "15px Arial";
	ctx.fillText(correctAnswers + " correct",133,190);
	ctx.fillText(incorrectAnswers + " incorrect",266,190);
	ctx.font = "30px Arial";
	ctx.fillText("High Score: " + highscore,200,250);
	ctx.fillText("Click to Retry",200,320);
	gameOverTimer = 200;
	resultTimer = 0;
}

addPlatforms(0, 260, 150);
addPlatforms(700, 300, 200);

function draw() {
	if(IMAGES_LOADED === 1){
		ctx.textAlign = "left";
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawBG();
		//drawGround();
		updatePlayer();
		drawPlayer();
		drawPlatforms();
		drawRope();
		//updateObstacles();
		//drawObstacles();
		tileOffScreen();
		//createObstacles();
		//checkCollision();
		//updateParticles();
		//drawParticles();
		updateTimer();
		//updateScore();
		updateCamera();
		drawHud();
		if(gameHasStarted===0&&key[13]){
			camera.x=0;
			player.vx=30;
			player.y=GROUND_LEVEL-player.h;
			player.vy=-30;
			audio.song.load();
			audio.song.loop = true;
			audio.menu.pause();
			gameHasStarted=1;
			playerState=LAUNCH;
			player.type=CUBE;
			score=0;
			platformsData.push ({
				type: CLOWN,
				img: Images["mirrorportal"],
				x: 0,
				y: GROUND_LEVEL-126,
				xHitboxOffset: 0,
				yHitboxOffset: 0,
				w: 86,
				h: 126,
				w: 86,
				h: 126,
				collisionDetected: false
			});
		}
	}
}

function drawPlatforms() {
	ctx.lineWidth = 3;
	

	platformsData.forEach( function(i, j) {
		var scale = 1;
		if(i.w < 136) {
			scale = i.w/136;
		}
		var grd = ctx.createLinearGradient(i.x-camera.x, i.y, i.x+34*scale-camera.x, i.y);
		grd.addColorStop(0, '#FFFFFF');
		grd.addColorStop(1, "#000000");
		var grd2 = ctx.createLinearGradient(i.x+i.w-camera.x, i.y, i.x+i.w-34*scale-camera.x, i.y);
		grd2.addColorStop(0, '#FFFFFF');
		grd2.addColorStop(1, "#000000");
		ctx.beginPath();
		ctx.fillStyle = grd;
		ctx.fillRect(i.x-camera.x, i.y-camera.y, 34*scale,500);
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = grd2;
		ctx.fillRect(i.x-camera.x+i.w-34*scale, i.y-camera.y, 34*scale,500);
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = '#000000';
		ctx.fillRect(i.x-camera.x+34*scale, i.y-camera.y, i.w-68*scale,500);
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = '#0000ff';
		ctx.fillRect(i.x-camera.x, i.y-camera.y, i.w,10);
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = '#00ff00';
		ctx.fillRect(i.x-camera.x+i.w/2-51*scale, i.y-camera.y, 102*scale,10);
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = '#ffff00';
		ctx.fillRect(i.x-camera.x+i.w/2-34*scale, i.y-camera.y, 68*scale,10);
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = '#FF0000';
		ctx.fillRect(i.x-camera.x+i.w/2-17*scale, i.y-camera.y, 34*scale,10);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle = '#000000';
		ctx.rect(i.x-camera.x, i.y-camera.y, i.w,500);
		ctx.stroke();
		
	});
}

function addPlatforms(x, y, w) {
	platformsData.push ({
		x: x,
		y: y,
		w: w,
		h: 0
	});
}

function drawRope() {
	if(playerState!=JUMPED&&playerState!=REPOSITION&&playerState!=MOVING){
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(attachPointX*attachTimer/ROPETIME+((player.x+player.w-camera.x)*(ROPETIME-attachTimer)/ROPETIME), attachPointY*attachTimer/ROPETIME+((player.y-camera.y)*(ROPETIME-attachTimer)/ROPETIME));
		ctx.lineTo(player.x+player.w-camera.x, player.y-camera.y);
		ctx.stroke();
	}
}

function drawGround() {
	for(var i = 0; i < NUMBER_OF_GROUND_TILES; i++){
		ctx.drawImage(Images["ground"], GROUND_WIDTH*i-camera.a, GROUND_LEVEL);
	}
	if(gameHasStarted===1){
		ctx.textAlign="center";
		ctx.strokeStyle = '#000000';
		ctx.font = "45px pusab";
		ctx.fillStyle = '#FFFFFF';
		ctx.lineWidth = 7;
		ctx.strokeText("Attempt " + player.attempt,canvas.width/2-camera.x,260);
		ctx.lineWidth = 1;
		ctx.fillText("Attempt " + player.attempt,canvas.width/2-camera.x,260);
	}
}

function drawPlayer() {
	ctx.save();
	ctx.translate(player.x-camera.x+player.w/2,player.y-camera.y+player.h/2);
	ctx.rotate(player.rotation*Math.PI/180);
	ctx.drawImage(Images["player"], -player.w/2, -player.h/2);
	ctx.restore();
	
	/*ctx.beginPath();
	ctx.strokeStyle = '#FFFFFF';
	ctx.rect(player.x-camera.x+CAMERA_PLAYER_OFFSET+player.xHitboxOffset, player.y+player.yHitboxOffset, player.w, player.hitboxH);
	ctx.stroke();*/

}

function updatePlayer() {
	if(player.x<playerJumpPointX-player.w&&playerState===MOVING){
		player.x+=2;
	}else if(playerState===MOVING){
		playerState=ROPE;
	}
	var originalX = player.x;
	var originalY = player.y;
	if(playerState===SWINGING){
		player.x = Math.sin(player.ropeRotation*Math.PI/180)*302+attachPointX-player.w/2+camera.x;
		player.y = Math.cos(player.ropeRotation*Math.PI/180)*302+attachPointY+camera.y;
		player.vx = player.x-originalX;
		player.vy = player.y-originalY;
		player.ropeRotation+=player.rotationVelocity;
		if(player.ropeRotation>0){
			player.rotationVelocity-=0.1;
		} else {
			player.rotationVelocity+=0.1;
		}
	} else if (playerState===JUMPED) {
		player.x += player.vx;
		player.y += player.vy;
		if(player.vx > 0){
			player.vx -= RESISTANCE;
		} else {
			player.vx = 0;
		}
		player.vy += gravity;
		platformsData.forEach( function(i, j) {
			if(collides(i, player)&&i.x+i.w/2>playerJumpPointX){
				player.vx=0;
				player.vy=-6;
				player.y=i.y-player.h;
				playerState = CELEBRATE;
				camera.initialX = camera.x;
				camera.initialY = camera.y;
				playerJumpPointX = platformsData[1].x+platformsData[1].w;
				playerJumpPointY = platformsData[1].y-player.h;
				if(i.x-camera.x+i.w/2+68<i.x-camera.x+i.w){
					if(player.x+player.w/2>platformsData[1].x+platformsData[1].w/2-17&&player.x+player.w/2<platformsData[1].x+platformsData[1].w/2+17){
						score+=1000;
						scoreTimer = 0;
						scoreMessage.message = "Perfect!";
						scoreMessage.score = "+1000";
						scoreMessage.x = player.x;
						scoreMessage.y = player.y;
					}else if(player.x+player.w/2>platformsData[1].x+platformsData[1].w/2-34&&player.x+player.w/2<platformsData[1].x+platformsData[1].w/2+34){
						score+=500;
						scoreTimer = 0;
						scoreMessage.message = "Excellent!";
						scoreMessage.score = "+500";
						scoreMessage.x = player.x;
						scoreMessage.y = player.y;
					}else if(player.x+player.w/2>platformsData[1].x+platformsData[1].w/2-51&&player.x+player.w/2<platformsData[1].x+platformsData[1].w/2+51){
						score+=200;
						scoreTimer = 0;
						scoreMessage.message = "Good!";
						scoreMessage.score = "+200";
						scoreMessage.x = player.x;
						scoreMessage.y = player.y;
					}else if(player.x+player.w/2>=platformsData[1].x&&player.x+player.w/2<=platformsData[1].x+platformsData[1].w){
						score+=100;
						scoreTimer = 0;
						scoreMessage.message = "Okay!";
						scoreMessage.score = "+100";
						scoreMessage.x = player.x;
						scoreMessage.y = player.y;
					}else{
						score+=50;
						scoreTimer = 0;
						scoreMessage.message = "OMG I SWEAR U GONNA DIE!";
						scoreMessage.score = "+50";
						scoreMessage.x = player.x;
						scoreMessage.y = player.y;
					}
				}else{
					if(player.x+player.w/2>platformsData[1].x+3*platformsData[1].w/8&&player.x+player.w/2<platformsData[1].x+5*platformsData[1].w/8){
						score+=1000;
						scoreTimer = 0;
						scoreMessage.message = "Perfect!";
						scoreMessage.score = "+1000";
						scoreMessage.x = player.x;
						scoreMessage.y = player.y;
					}else if(player.x+player.w/2>platformsData[1].x+platformsData[1].w/4&&player.x+player.w/2<platformsData[1].x+3*platformsData[1].w/4){
						score+=500;
						scoreTimer = 0;
						scoreMessage.message = "Excellent!";
						scoreMessage.score = "+500";
						scoreMessage.x = player.x;
						scoreMessage.y = player.y;
					}else if(player.x+player.w/2>platformsData[1].x+platformsData[1].w/8&&player.x+player.w/2<platformsData[1].x+7*platformsData[1].w/8){
						score+=200;
						scoreTimer = 0;
						scoreMessage.message = "Good!";
						scoreMessage.score = "+200";
						scoreMessage.x = player.x;
						scoreMessage.y = player.y;
					}else if(player.x+player.w/2>platformsData[1].x&&player.x+player.w/2<platformsData[1].x+platformsData[1].w){
						score+=100;
						scoreTimer = 0;
						scoreMessage.message = "Okay!";
						scoreMessage.score = "+100";
						scoreMessage.x = player.x;
						scoreMessage.y = player.y;
					}else{
						score+=50;
						scoreTimer = 0;
						scoreMessage.message = "OMG I SWEAR U GONNA DIE!";
						scoreMessage.score = "+50";
						scoreMessage.x = player.x;
						scoreMessage.y = player.y;
					}
				}
				addPlatforms(platformsData[1].x+Math.random()*300+500, platformsData[1].y+Math.random()*300, platformsData[1].w+Math.random()*100-50);
			}
		});
		if(player.y>720+camera.y){
			player.x=playerJumpPointX-player.w;
			player.y=playerJumpPointY;
			playerState=ROPE;
		}
	} else if(playerState===CELEBRATE){
		player.rotation+=5;
		player.vy += gravity;
		player.y+=player.vy;
	}
}

function createObstacles() {
	if(camera.generateObstacles >= 500) {
		var selectObstacle = Math.random() * 2.7;
		if (selectObstacle < 1) {
		platformsData.push ({
			type: SPIKE,
			img: Images["spike"],
			x: camera.x+Math.random() * 500+canvas.width,
			y: GROUND_LEVEL-68,
			xHitboxOffset: 20,
			yHitboxOffset: 40,
			w: 68,
			h: 68,
			hitboxW: 28,
			hitboxH: 28,
			collisionDetected: false
		});
		} else if (selectObstacle < 1.7) {
		platformsData.push ({
			type: YELLOWJUMP,
			img: Images["yellowjump"],
			x: camera.x+Math.random() * 500+canvas.width,
			y: GROUND_LEVEL-10,
			xHitboxOffset: 0,
			yHitboxOffset: 0,
			w: 68,
			h: 10,
			hitboxW: 68,
			hitboxH: 10,
			collisionDetected: false
		});
		} else if (selectObstacle < 2) {
		platformsData.push ({
			type: SPEEDUP,
			img: Images["speedup"],
			x: camera.x+Math.random() * 500+canvas.width,
			y: GROUND_LEVEL-68,
			xHitboxOffset: 0,
			yHitboxOffset: 0,
			w: 61,
			h: 68,
			hitboxW: 61,
			hitboxH: 68,
			collisionDetected: false
		});
		} else if (selectObstacle < 2.5) {
		platformsData.push ({
			type: LAUNCHER,
			img: Images["launcher"],
			x: camera.x+Math.random() * 500+canvas.width,
			y: GROUND_LEVEL-204,
			xHitboxOffset: 0,
			yHitboxOffset: 0,
			w: 136,
			h: 68,
			hitboxW: 136,
			hitboxH: 68,
			collisionDetected: false
		});
		}else if (selectObstacle < 2.6) {
		platformsData.push ({
			type: CUBEPORTAL,
			img: Images["cubeportal"],
			x: camera.x+Math.random() * 500+canvas.width,
			y: GROUND_LEVEL-126,
			xHitboxOffset: 0,
			yHitboxOffset: 0,
			w: 68,
			h: 126,
			hitboxW: 68,
			hitboxH: 126,
			collisionDetected: false
		});
		}else if (selectObstacle < 2.7) {
		platformsData.push ({
			type: UFOPORTAL,
			img: Images["ufoportal"],
			x: camera.x+Math.random() * 500+canvas.width,
			y: GROUND_LEVEL-126-Math.random() * 400,
			xHitboxOffset: 0,
			yHitboxOffset: 0,
			w: 68,
			h: 126,
			hitboxW: 68,
			hitboxH: 126,
			collisionDetected: false
		});
		}else if (selectObstacle < 2.9) {
		platformsData.push ({
			type: BALLPORTAL,
			img: Images["ballportal"],
			x: camera.x+Math.random() * 500+canvas.width,
			y: GROUND_LEVEL-126-Math.random() * 400,
			xHitboxOffset: 0,
			yHitboxOffset: 0,
			w: 68,
			h: 126,
			hitboxW: 68,
			hitboxH: 126,
			collisionDetected: false
		});
		}
		camera.generateObstacles-=500;
	}
}
		
function drawBG() {
	for(var i = 0; i < 3; i++){
		ctx.drawImage(Images["background"], 720*(i+Math.floor(camera.x/2160))-camera.x/3, 0);
	}
}

function drawObstacles() {
	platformsData.forEach( function(i, j) {
		ctx.drawImage(i.img, i.x-camera.x+CAMERA_PLAYER_OFFSET, i.y);
		/*ctx.beginPath();
		ctx.strokeStyle = '#FFFFFF';
		ctx.rect(i.x-camera.x+CAMERA_PLAYER_OFFSET+i.xHitboxOffset, i.y+i.yHitboxOffset, i.hitboxW, i.hitboxH);
		ctx.stroke();*/
	});
}

function drawParticles() {
	theParticles.forEach(function(i, j) {
		ctx.drawImage(
		    i.img,
		    //i.frameIndex * i.width+(i.width-i.scale)/2,
			i.frameIndex * i.width,
		    //(i.width-i.scale)/2,
			0,
		    //i.width-i.width+i.scale,
			i.width,
		    //i.height-i.height+i.scale,
			i.height,
		    i.x-i.width/2-camera.x+i.width*(1-i.scale)/2,
		    i.y-i.height/2-camera.y+i.height*(1-i.scale)/2,
		    i.width*i.scale,
		    i.height*i.scale);
	});
}

/*theParticles.push ({
	img: Images["explosion"],
	frameIndex: 0,
	width: 95,
	height: 95,
	numberOfFrames: 15,
	tickCount: 0,
	ticksPerFrame: 2,
	x: 500,
	y: 100
});*/
		
function updateParticles() {
	theParticles.forEach(function(i, j) {
		i.tickCount += 1;

		if (i.tickCount > i.ticksPerFrame) {

			i.tickCount = 0;
			// If the current frame index is in range
			if (i.frameIndex < i.numberOfFrames - 1) {	
				// Go to the next frame
				i.frameIndex += 1;
			} else if(i.loop===false){
				theParticles.splice(j, 1);
			} else{
				i.frameIndex=0;
			}
		}
		if(i.x-camera.x < -100){
			theParticles.splice(j, 1);
		}
		if(i.img===Images["particle"]){
			i.y-=3;
			i.scale-=1/40;
			if(i.scale<0){
				theParticles.splice(j, 1);
			}
		}
		if(i.img===Images["particlelauncher"]||i.img===Images["particlecubeportal"]||i.img===Images["particleufoportal"]||i.img===Images["particleballportal"]){
			i.x+=i.vx;
			i.y+=i.vy;
			i.scale-=1/80;
			if(i.scale<0){
				theParticles.splice(j, 1);
			}
		}
		if(i.img===Images["translucentcircleyellow"]||i.img===Images["translucentcirclegreen"]||i.img===Images["translucentcircleblue"]||i.img===Images["translucentcircleorange"]){
			i.scale-=1/20;
			if(i.scale<0){
				theParticles.splice(j, 1);
			}
		}
	});
	particleTimer++;
	if(particleTimer>1){
		particleTimer=0;
	}
}

function updateObstacles() {
	platformsData.forEach( function(i, j) {
		if(i.x-camera.x < -300){
			platformsData.splice(j, 1);
		}
		if(i.type===YELLOWJUMP&&particleTimer===0){
			theParticles.push ({
				img: Images["particle"],
				frameIndex: 0,
				width: 20,
				height: 20,
				numberOfFrames: 1,
				tickCount: 0,
				ticksPerFrame: 2,
				x: i.x+CAMERA_PLAYER_OFFSET+10+Math.random() * 48,
				y: i.y,
				loop: true,
				scale: (Math.random() * 10 + 5)/20
			});
		}
		if(i.type===LAUNCHER&&particleTimer===0){
			var spawnposx = i.x-10+Math.random() * 176;
			var spawnposy = i.y+50+Math.random() * 68;
			var scalevalue = (Math.random() * 10 + 5)/20;
			theParticles.push ({
				img: Images["particlelauncher"],
				frameIndex: 0,
				width: 20,
				height: 20,
				numberOfFrames: 1,
				tickCount: 0,
				ticksPerFrame: 2,
				x: spawnposx+CAMERA_PLAYER_OFFSET,
				y: spawnposy,
				loop: true,
				scale: scalevalue,
				vx: (i.x+i.w/2-spawnposx)/scalevalue/80,
				vy: (i.y+40-spawnposy)/scalevalue/80
			});
		}
		if(i.type===CUBEPORTAL&&particleTimer===0){
			var spawnposx = i.x-40+Math.random() * 68;
			var spawnposy = i.y-5+Math.random() * 166;
			var scalevalue = (Math.random() * 10 + 5)/20;
			theParticles.push ({
				img: Images["particlecubeportal"],
				frameIndex: 0,
				width: 20,
				height: 20,
				numberOfFrames: 1,
				tickCount: 0,
				ticksPerFrame: 2,
				x: spawnposx+CAMERA_PLAYER_OFFSET,
				y: spawnposy,
				loop: true,
				scale: scalevalue,
				vx: (i.x+30-spawnposx)/scalevalue/80,
				vy: (i.y+i.h/2-spawnposy)/scalevalue/80,
			});
		}
		if(i.type===UFOPORTAL&&particleTimer===0){
			var spawnposx = i.x-40+Math.random() * 68;
			var spawnposy = i.y-5+Math.random() * 166;
			var scalevalue = (Math.random() * 10 + 5)/20;
			theParticles.push ({
				img: Images["particleufoportal"],
				frameIndex: 0,
				width: 20,
				height: 20,
				numberOfFrames: 1,
				tickCount: 0,
				ticksPerFrame: 2,
				x: spawnposx+CAMERA_PLAYER_OFFSET,
				y: spawnposy,
				loop: true,
				scale: scalevalue,
				vx: (i.x+30-spawnposx)/scalevalue/80,
				vy: (i.y+i.h/2-spawnposy)/scalevalue/80,
			});
		}
		if(i.type===BALLPORTAL&&particleTimer===0){
			var spawnposx = i.x-40+Math.random() * 68;
			var spawnposy = i.y-5+Math.random() * 166;
			var scalevalue = (Math.random() * 10 + 5)/20;
			theParticles.push ({
				img: Images["particleballportal"],
				frameIndex: 0,
				width: 20,
				height: 20,
				numberOfFrames: 1,
				tickCount: 0,
				ticksPerFrame: 2,
				x: spawnposx+CAMERA_PLAYER_OFFSET,
				y: spawnposy,
				loop: true,
				scale: scalevalue,
				vx: (i.x+30-spawnposx)/scalevalue/80,
				vy: (i.y+i.h/2-spawnposy)/scalevalue/80,
			});
		}
		if(i.type===CLOWN){
			var oldY = i.y;
			i.y=Math.sin(afterDeathTimer/20)*190+190;
			i.vy=i.y-oldY;
		}
	});
}

function updateCamera() {
	if(playerState===REPOSITION){
		var repositionX = platformsData[1].x-player.w;
		var repositionY = platformsData[1].y-260;
		repositionTimer++;
		camera.x=camera.initialX*(REPOSITIONTIME-repositionTimer)/REPOSITIONTIME+repositionX*repositionTimer/REPOSITIONTIME;
		camera.y=camera.initialY*(REPOSITIONTIME-repositionTimer)/REPOSITIONTIME+repositionY*repositionTimer/REPOSITIONTIME;
		if(repositionTimer>REPOSITIONTIME){
			playerState=MOVING;
			platformsData.splice(0, 1);	
		}
	} else {
		repositionTimer = 0;
	}
}

function tileOffScreen() {
	if(camera.bg >= 720){
		camera.bg-=720;
	}
}

function collides(a, b) {
	return	a.x - camera.x < b.x - camera.x + b.w &&
	a.x - camera.x + a.w > b.x - camera.x &&
	a.y - camera.y < b.y - camera.y + b.h &&
	a.y - camera.y + a.h > b.y - camera.y;
}

function checkCollision() {
	platformsData.forEach( function(i, j){
		if (collides(i, player)&&playerState===ALIVE&&i.collisionDetected===false) {
			if (i.type === SPIKE) {
				playerState = SWINGING;
				audio.song.pause();
				audio.death.play();
				recordScore();
				afterDeathTimer=0;
				player.type=CUBE;
				player.attempt++;
				theParticles.push ({
					img: Images["explosion"],
					frameIndex: 0,
					width: 95,
					height: 95,
					numberOfFrames: 15,
					tickCount: 0,
					ticksPerFrame: 2,
					x: player.x+CAMERA_PLAYER_OFFSET+player.w/2,
					y: player.y+player.h/2,
					loop: false,
					scale: 1
				});
			} else if (i.type === YELLOWJUMP) {
				player.vy=-(player.vy)*0.6-20;
				player.vx+=2;
				turnOnFriction=false;
				theParticles.push ({
					img: Images["translucentcircleyellow"],
					frameIndex: 0,
					width: 68,
					height: 68,
					numberOfFrames: 1,
					tickCount: 0,
					ticksPerFrame: 2,
					x: i.x+CAMERA_PLAYER_OFFSET+i.w/2,
					y: i.y+i.h/2,
					loop: true,
					scale: 1,
					vx:0,
					vy:0
				});
			} else if (i.type === SPEEDUP) {
				player.vx+=6;
				theParticles.push ({
					img: Images["translucentcirclegreen"],
					frameIndex: 0,
					width: 68,
					height: 68,
					numberOfFrames: 1,
					tickCount: 0,
					ticksPerFrame: 2,
					x: i.x+CAMERA_PLAYER_OFFSET+i.w/2,
					y: i.y+i.h/2,
					loop: true,
					scale: 1,
					vx:0,
					vy:0
				});
			} else if (i.type === LAUNCHER) {
				player.vy=-32;
				player.vx+=4;
				turnOnFriction=false;
				theParticles.push ({
					img: Images["translucentcircleblue"],
					frameIndex: 0,
					width: 68,
					height: 68,
					numberOfFrames: 1,
					tickCount: 0,
					ticksPerFrame: 2,
					x: i.x+CAMERA_PLAYER_OFFSET+i.w/2,
					y: i.y+i.h/2,
					loop: true,
					scale: 1,
					vx:0,
					vy:0
				});
			} else if (i.type === CUBEPORTAL) {
				player.type=CUBE;
				gravity=0.8;
				theParticles.push ({
					img: Images["translucentcirclegreen"],
					frameIndex: 0,
					width: 68,
					height: 68,
					numberOfFrames: 1,
					tickCount: 0,
					ticksPerFrame: 2,
					x: i.x+CAMERA_PLAYER_OFFSET+i.w/2,
					y: i.y+i.h/2,
					loop: true,
					scale: 1,
					vx:0,
					vy:0
				});
			} else if (i.type === UFOPORTAL) {
				player.type=UFO;
				gravity=0.6;
				player.rotateSpeed=0;
				player.rotation=0;
				theParticles.push ({
					img: Images["translucentcircleorange"],
					frameIndex: 0,
					width: 68,
					height: 68,
					numberOfFrames: 1,
					tickCount: 0,
					ticksPerFrame: 2,
					x: i.x+CAMERA_PLAYER_OFFSET+i.w/2,
					y: i.y+i.h/2,
					loop: true,
					scale: 1,
					vx:0,
					vy:0
				});
			}else if (i.type === BALLPORTAL) {
				player.type=BALL;
				gravity=0.8;
				player.rotateSpeed=player.vx/6;
				theParticles.push ({
					img: Images["translucentcircleorange"],
					frameIndex: 0,
					width: 68,
					height: 68,
					numberOfFrames: 1,
					tickCount: 0,
					ticksPerFrame: 2,
					x: i.x+CAMERA_PLAYER_OFFSET+i.w/2,
					y: i.y+i.h/2,
					loop: true,
					scale: 1,
					vx:0,
					vy:0
				});
			}
			i.collisionDetected=true;
		}
	});
}

function updateTimer() {
	timer+=1;
	scoreTimer++;
	if(playerState===ROPE){
		attachTimer++;
		if(attachTimer>=ROPETIME){
			playerState=SWINGING;
			player.ropeRotation=Math.atan((attachPointX-player.x-player.w+camera.x)/(player.y-attachPointY-camera.y))*-180/Math.PI;
			player.rotationVelocity=-2;
		}
	}
}

function updateScore() {
	if(playerState===ALIVE){
		score+=player.vx;
	}
}

function drawHud() {
	ctx.lineWidth = 7;
	ctx.beginPath();
	ctx.font = "30px pusab";
	ctx.strokeStyle = '#000000';
	ctx.strokeText(score, 10, 50);
	ctx.lineWidth = 1;
	ctx.fillStyle = '#ffffff';
	ctx.fillText(score, 10, 50);
	ctx.stroke();
	if(scoreTimer<60){
		ctx.beginPath();
		ctx.lineWidth = 7;
		ctx.font = "30px pusab";
		ctx.strokeStyle = '#000000';
		ctx.strokeText(scoreMessage.score, scoreMessage.x-camera.x, scoreMessage.y-50-camera.y);
		ctx.lineWidth = 1;
		ctx.fillStyle = '#ffffff';
		ctx.fillText(scoreMessage.score, scoreMessage.x-camera.x, scoreMessage.y-50-camera.y);
		ctx.stroke();
		ctx.beginPath();
		ctx.font = "30px pusab";
		ctx.lineWidth = 7;
		ctx.strokeStyle = '#000000';
		ctx.strokeText(scoreMessage.message, scoreMessage.x-camera.x, scoreMessage.y-85-camera.y);
		ctx.lineWidth = 1;
		ctx.fillStyle = '#ffffff';
		ctx.fillText(scoreMessage.message, scoreMessage.x-camera.x, scoreMessage.y-85-camera.y);
		ctx.stroke();
	}else if(playerState === CELEBRATE){
		playerState=REPOSITION;
		player.rotation=0;
		player.y=platformsData[1].y-player.h;
	}
}

function recordScore() {
	score=Math.floor(score);
	for(var i = 0; i < top5Scores.length; i++){
		if(score>top5Scores[i]){
			top5Scores.splice(i, 0, score);
			top5Scores.splice(top5Scores.length-1, 1);
			break;
		}
	}
}

function drawSky() {
	if(player.y<0){
		ctxSky.drawImage(Images["sky"], -skyCamera.bg, skyCamera.ybg);
		ctxSky.drawImage(Images["sky"], 300-skyCamera.bg, skyCamera.ybg);
		ctxSky.drawImage(Images["sky"], -skyCamera.bg, 300+skyCamera.ybg);
		ctxSky.drawImage(Images["sky"], 300-skyCamera.bg, 300+skyCamera.ybg);
		ctxSky.save();
		//ctxSky.translate(player.x-camera.x+CAMERA_PLAYER_OFFSET+player.w/2,player.y-camera.y-player.h/2+GROUND_LEVEL);
		ctxSky.rotate(player.rotation*Math.PI/180);
		if(player.type===CUBE){
			ctxSky.drawImage(Images["player"], -34, -34);
		}else if(player.type===UFO){
			ctxSky.drawImage(Images["ufo"], -34, -34);
		}else if(player.type===BALL){
			ctxSky.drawImage(Images["ball"], -34, -34);
		}
		ctx.beginPath();
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 10;
		ctx.rect(490, 0, 300,300);
		ctx.stroke();
		ctxSky.restore();
	}else{
		skyCamera.ybg=0;
	}
}
canvas.addEventListener("keydown", function (e) {
	key[e.keyCode] = true;
}, false);
setInterval(draw, 17);
