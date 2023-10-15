function populateFishes() {
    for (var i = 0; i < numFish; i++) {
        var positionX = Math.random() - 0.5; // Random X position between -1 and 1
        var positionY = Math.random() - 0.5; // Random Y position within the cube
        var positionZ = Math.random() - 0.5; // Random Z position within the cube
        var color = vec4(Math.random(), Math.random(), Math.random(), 1.0);
        var sideColor = vec4(Math.random(), Math.random(), Math.random(), 1.0); 
        var tailColor = vec4(Math.random(), Math.random(), Math.random(), 1.0); 
        var tailRotateSpeed = Math.random() * 2;
        var rotTail = 0.0;
        var speedX = -0.03 + Math.random() * 0.06;
        var speedY = -0.03 + Math.random() * 0.06;
        var speedZ = -0.03 + Math.random() * 0.06;
    
        fishes.push({ 
            positionX: positionX,
            positionY: positionY,
            positionZ: positionZ,
            color: color,
            speed: vec3(speedX, speedY, speedZ),
            tailRotateSpeed: tailRotateSpeed,
            rotTail: rotTail,
            tailColor: tailColor,
            sideColor: sideColor
         });
    }
}

// translates radians to degrees
function degrees(radians) {
    return radians * (180 / Math.PI);
}

function normalizeVector(vector) {
    let x = vector[0];
    let y = vector[1];
    let z = vector[2];
    var magnitude = Math.sqrt(x*x + y*y + z*z);
    return vec3(x/magnitude, y/magnitude, z/magnitude);
}

// gets the rotation of the fish around the y axis
function getYRotation(dirVector) {
    const angle = Math.atan2(dirVector[2], dirVector[0]);
    return degrees(angle);
}

function getZRotation(dirVector) {
    const roll = Math.atan2(dirVector[1], dirVector[0]);
    return degrees(roll);
}

// gets the next position that the fish will be in based on speed and current position
function calculateNextPosition(speed, pos) {
    let nextXPos = pos[0] + speed;
    let nextZpos = pos[2] + speed;
    let nextYpos = pos[1] + speed;
    return vec3(nextXPos, nextYpos, nextZpos);
}

function checkBoundry(fishPosX, fishPosY, fishPosZ, fishindex) {
    if (fishPosX >= 5.0) {
        fishes[fishindex].positionX = -5.0;
    }
    if (fishPosX <= -5.0) {
        fishes[fishindex].positionX = 5.0;
    }
    if (fishPosZ >= 5.0) {
        fishes[fishindex].positionZ = -5.0;
    }
    if (fishPosZ <= -5.0) {
        fishes[fishindex].positionZ = 5.0;
    }
    if (fishPosY >= 5.0) {
        fishes[fishindex].positionY = -5.0;
    }
    if (fishPosY <= -5.0) {
        fishes[fishindex].positionY = 5.0;
    }
}

function isNeighbourInFOV(fishdir, neighbourdir, fovangle) {
    const angle = Math.acos(dot(normalizeVector(fishdir), normalizeVector(neighbourdir)));
    return degrees(angle) <= fovangle;
}