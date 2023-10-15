var canvas;
var numFishSlider;
var numFishLabel;
var seperationStrengthSlider;
var alignmentSlider;
var cohesionSlider;
var detectionRadiusSlider;
var gl;

// fish variables
var NumVertices  = 9;
var NumBody = 6;
var NumTail = 3;
var NumSides = 6;
var numFish;
var fishes = []; // keeps track of position and speed

// fish coords
var vertices = [
    // fish body
    vec4( -0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2,  0.2, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2, -0.15, 0.0, 1.0 ),
	vec4( -0.5,  0.0, 0.0, 1.0 ),
    // fish tail
    vec4( -0.5,  0.0, 0.0, 1.0 ),
    vec4( -0.65,  0.15, 0.0, 1.0 ),
    vec4( -0.65, -0.15, 0.0, 1.0 ),
    //fish sides
    vec4(0.3, 0.0, 0.0, 1.0),
    vec4(0.1, 0.0, 0.0, 1.0),
    vec4(0.2, 0.0, -0.2, 1.0),
    vec4(0.3, 0.0, 0.0, 1.0),
    vec4(0.1, 0.0, 0.0, 1.0),
    vec4(0.2, 0.0, 0.2, 1.0)
    
];

var movement = false;     // Er músarhnappur niðri?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var rotTail = 0.0;        // Snúningshorn sporðs
var incTail = 2.0;        // Breyting á snúningshorni

var zView = 3.2;          // Staðsetning áhorfanda á z-hniti

var proLoc;
var mvLoc;
var colorLoc;

var cubeBuffer;
var fishBuffer;

// kubbur
var v = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

var lines = [ v[0], v[1], v[1], v[2], v[2], v[3], v[3], v[0],
              v[4], v[5], v[5], v[6], v[6], v[7], v[7], v[4],
              v[0], v[4], v[1], v[5], v[2], v[6], v[3], v[7]
            ];

var boxMargin = 4.5;


var seperationStrength;
var alignmentStrength;
var cohesionStrength;
var turnStrength = 0.05;
var affectionRadius = 3.0;

var paused = false;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    numFishSlider = document.getElementById("numFish");
    numFishLabel = document.getElementById("numFishLabel");
    seperationStrengthSlider = document.getElementById("seperationStrength");
    alignmentSlider = document.getElementById("alignmentStrength");
    cohesionSlider = document.getElementById("cohesionStrength");
    detectionRadiusSlider = document.getElementById("detectionRadius");
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
 
    gl.enable(gl.DEPTH_TEST);
 
    //
    //  Load shaders and initialize attribute buffers
    //
    seperationStrength = seperationStrengthSlider.value;
    alignmentStrength = alignmentSlider.value;
    cohesionStrength = cohesionSlider.value;
    numFish = numFishSlider.value;
    populateFishes();

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    fishBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, fishBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lines), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Setjum ofanvarpsfylki h�r � upphafi
    var proj = perspective( 30.0, 1.0, 1.0, 200.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    

    // Atburðafall fyrir mús
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY += (e.offsetX - origX) % 360;
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    // Atbur�afall fyrir lyklabor�
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp �r
                zView += 0.2;
                break;
            case 40:	// ni�ur �r
                zView -= 0.2;
                break;
            case 32:
                paused = !paused;
         }
     }  );  

    // Atbur�afall fyri m�sarhj�l
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zView += 0.2;
         } else {
             zView -= 0.2;
         }
     }  );

    numFishSlider.addEventListener("input", function() {
        numFish = numFishSlider.value;
        numFishLabel.textContent = "Fjöldi fiska : " + numFish;
        fishes.length = 0;
        populateFishes();
    });

    seperationStrengthSlider.addEventListener("input", function() {
        seperationStrength = seperationStrengthSlider.value;
    });

    alignmentSlider.addEventListener("input", function() {
        alignmentStrength = alignmentSlider.value;
    });

    cohesionSlider.addEventListener("input", function () {
        cohesionStrength = cohesionSlider.value;
    });

    render();
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bufferData(gl.ARRAY_BUFFER, flatten(lines), gl.STATIC_DRAW );
    renderCube();

    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    for (let i = 0; i < fishes.length; i++) {
        renderFish(i);
    }

    requestAnimFrame( render );
}


function renderFish(fishindex) {
    var fishSpeed = fishes[fishindex].speed;
    var fishPosX = fishes[fishindex].positionX;
    var fishPosY = fishes[fishindex].positionY;
    var fishPosZ = fishes[fishindex].positionZ;
    var fishColor = fishes[fishindex].color; 
    var tailColor = fishes[fishindex].tailColor;
    var sideColor = fishes[fishindex].sideColor;
    var tailRotateSpeed = fishes[fishindex].tailRotateSpeed;
    
    var fishDirection = vec3(fishSpeed[0], fishSpeed[1], -fishSpeed[2]);
    var fishCurrentPosition = vec3(fishPosX, fishPosY, fishPosZ);

    // fish avoid eachother
    var seperationDir = seperation(fishDirection, fishCurrentPosition, fishindex);
    var alignmentDir = alignment(fishDirection, fishCurrentPosition, fishindex);
    var cohesionDir = cohesion(fishDirection, fishCurrentPosition, fishindex);
    var shouldSeperation = false;
    var shouldAlignment = false;
    var shouldCohesion = false;
    if (seperationDir[0] != 0.0 && seperationDir[1] != 0.0 && seperationDir[0] != 0.0) {
        fishDirection = vec3(fishDirection[0] + seperationDir[0], fishDirection[1] + seperationDir[1], fishDirection[2] + seperationDir[2]);
        shouldSeperation = true;
    }
    if (alignmentDir[0] != 0.0 && alignmentDir[1] != 0.0 && alignmentDir[2] != 0.0) {
        fishDirection = vec3(fishDirection[0] + alignmentDir[0], fishDirection[1] + alignmentDir[1], fishDirection[2] + alignmentDir[2]);
        shouldAlignment = true;
    }
    if (cohesionDir[0] != 0.0 && cohesionDir[1] != 0.0 && cohesionDir[2] != 0.0) {
        fishDirection = vec3((fishDirection[0] + cohesionDir[0]) * 100, (fishDirection[1] + cohesionDir[1]) * 100, (fishDirection[2] + cohesionDir[2]) * 100);
        shouldCohesion = true;
    }

    // put fish back into box if his position is outside the box
    checkBoundry(fishPosX, fishPosY, fishPosZ, fishindex);

    if (shouldSeperation || shouldAlignment || shouldCohesion) {
        var newSpeedMagnitude = 0.04;
        fishDirection = normalizeVector(fishDirection);
        fishes[fishindex].speed = vec3(fishDirection[0]*newSpeedMagnitude, fishDirection[1]*newSpeedMagnitude, -fishDirection[2]* newSpeedMagnitude);
        fishSpeed = fishes[fishindex].speed;
    }
    if (!paused) {
        fishes[fishindex].positionX = fishes[fishindex].positionX + fishSpeed[0];
        fishes[fishindex].positionY = fishes[fishindex].positionY + fishSpeed[1];
        fishes[fishindex].positionZ = fishes[fishindex].positionZ + fishSpeed[2];
    }

    var mv = lookAt( vec3(0.0, 0.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );

    // Scale the fish to make it smaller
    var scaleMatrix = scalem(0.1, 0.1, 0.1); // Modify the scaling factors as needed
    mv = mult(mv, scaleMatrix);

    mv = mult(mv, translate(fishCurrentPosition));
    mv = mult(mv, rotateY(getYRotation(fishDirection)));
    // mv = mult(mv, rotateZ(getZRotation(fishDirection)));

    fishes[fishindex].rotTail += tailRotateSpeed;
    if( fishes[fishindex].rotTail > 35.0  || fishes[fishindex].rotTail <  -35.0 ) {
        fishes[fishindex].tailRotateSpeed *= -1;
    }

	gl.uniform4fv( colorLoc, fishColor);

	// draw body (without rotation)
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLES, 0, NumBody );

    // draw sides
    var side1MV = mat4();
    var side2MV = mat4();
    side1MV = mult(side1MV, rotateX(fishes[fishindex].rotTail));
    side2MV = mult(side2MV, rotateX(-fishes[fishindex].rotTail));

    gl.uniform4fv( colorLoc, sideColor);
    gl.uniformMatrix4fv(mvLoc, false, flatten(mult(mv, side1MV)));
    gl.drawArrays( gl.TRIANGLES, NumBody + NumTail, NumSides/2 );
    
    gl.uniformMatrix4fv(mvLoc, false, flatten(mult(mv, side2MV)));
    gl.drawArrays(gl.TRIANGLES, NumBody + NumTail + NumSides/2, NumSides/2);

    // Draw a tail and wiggle it
    mv = mult(mv, translate (-0.5, 0.0, 0.0));
    mv = mult( mv, rotateY( fishes[fishindex].rotTail) );
	mv = mult( mv, translate ( 0.5, 0.0, 0.0 ) );

    gl.uniform4fv( colorLoc, tailColor);
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLES, NumBody, NumTail );

}

function renderCube() {
    var mv = lookAt( vec3(0.0, 0.0, zView),
    vec3(0.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, mult( rotateX(spinX), rotateY(spinY) ) );

    gl.uniform4fv( colorLoc, vec4(0.0, 0.0, 0.0, 1.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.LINES, 0, 24);
}