function seperation(fishdir, fishpos, fishindex) {

    let close_dx = 0;
    let close_dy = 0;
    let close_dz = 0;

    for (let i = 0; i < fishes.length; i++) {
        if (i == fishindex) continue;
        let fish = fishes[i];
        
        let dVector = vec3(fishpos[0] - fish.positionX, fishpos[1] - fish.positionY, fishpos[2] - fish.positionZ); 
        let distance = Math.sqrt(dVector[0]**2 + dVector[1]**2 + dVector[2]**2);

        // if they are not close enough they dont affect eachother
        if (distance > affectionRadius) continue;
        // if (!isNeighbourInFOV(fishdir, fish.speed, 90)) continue;

        let dx = fishpos[0] - fish.positionX;
        let dy = fishpos[1] - fish.positionY;
        let dz = fishpos[2] - fish.positionZ;

        close_dx += dx;
        close_dy += dy;
        close_dz += dz;
    }
    return vec3(close_dx * seperationStrength, close_dy * seperationStrength, -close_dz * seperationStrength);
}

function alignment(fishdir, fishpos, fishindex) {
    let xvel_avg = 0;
    let yvel_avg = 0;
    let zvel_avg = 0;
    let neighboring_fish = 0;

    for (let i = 0; i < fishes.length; i++) {
        fish = fishes[i];

        if (i == fishindex) continue;

        let dVector = vec3(fishpos[0] - fish.positionX, fishpos[1] - fish.positionY, fishpos[2] - fish.positionZ);
        let distance = Math.sqrt(dVector[0]**2 + dVector[1]**2 + dVector[2]**2);

        // if they are not close enough they dont affect eachother
        if (distance > affectionRadius) continue;
        // if (!isNeighbourInFOV(fishdir, fish.speed, 90)) continue;

        xvel_avg += fish.speed[0];
        yvel_avg += fish.speed[1];
        zvel_avg += fish.speed[2];
        neighboring_fish += 1;
    }

    if (neighboring_fish > 0) {
        xvel_avg = xvel_avg/neighboring_fish;
        yvel_avg = yvel_avg/neighboring_fish;
        zvel_avg = zvel_avg/neighboring_fish;
    }    
    return vec3(xvel_avg * alignmentStrength, yvel_avg * alignmentStrength, zvel_avg * alignmentStrength);
}

function cohesion(fishdir, fishpos, fishindex) {
    let xpos_avg = 0;
    let ypos_avg = 0;
    let zpos_avg = 0;
    let neighboring_fish = 0;

    for (let i = 0; i < fishes.length; i++) {
        fish = fishes[i];

        if (i == fishindex) continue;

        let dVector = vec3(fishpos[0] - fish.positionX, fishpos[1] - fish.positionY, fishpos[2] - fish.positionZ);
        let distance = Math.sqrt(dVector[0]**2 + dVector[1]**2 + dVector[2]**2);

        // if they are not close enough they dont affect eachother
        if (distance > affectionRadius) continue;
        // if (!isNeighbourInFOV(fishdir, fish.speed, 90)) continue;

        xpos_avg += fish.positionX;
        ypos_avg += fish.positionY;
        zpos_avg += fish.positionZ;

        neighboring_fish += 1;
    }

    if (neighboring_fish > 0) {
        xpos_avg = xpos_avg/neighboring_fish;
        ypos_avg = ypos_avg/neighboring_fish;
        zpos_avg = zpos_avg/neighboring_fish;
    } else {
        return vec3(0.0, 0.0, 0.0);
    }
    return vec3((xpos_avg - fishpos[0]) * cohesionStrength, (ypos_avg - fishpos[1]) * cohesionStrength, (zpos_avg - fishpos[2]) * cohesionStrength);
}