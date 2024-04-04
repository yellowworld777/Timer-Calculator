import { system, world, Vector, TicksPerSecond } from "@minecraft/server";

let tps = 20;
let Value = 1;
let lastDate = Date.now();

system.runInterval(() =>{
    //Calculate TPS
    if(system.currentTick % 20 == 0){
        const deltaDate = Date.now() - lastDate;
        const lag = deltaDate / 1000;
        tps = TicksPerSecond / lag;
        Value = lag;
        lastDate = Date.now();
    }

    const players = world.getPlayers();

    //Run calculate for every players
    for(const player of players){
        const lastLocation = player.lastLocation;
        if(lastLocation){
            const Velocity = player.getVelocity(); //Normal Velocity
            const LocationVelocity = new Vector(player.location.x - lastLocation.x, player.location.y - lastLocation.y, player.location.z - lastLocation.z); //Velocity calculated from location
            const ServerSpeed = Math.abs(Math.hypot(Math.hypot(LocationVelocity.x, LocationVelocity.z), LocationVelocity.y));
            const ClientSpeed = Math.abs(Math.hypot(Math.hypot(Velocity.x, Velocity.z), Velocity.y));

            calculateTimer(player, ServerSpeed, ClientSpeed, Value);
        }
        player.lastLocation = player.location;
    }
})

function calculateTimer(player, ServerSpeed, ClientSpeed, Value){
    if(!isMoving(player.getVelocity())) return;
    const duped = ServerSpeed / ClientSpeed;
    if(player.timerHold == null) player.timerHold = [];
    player.timerHold.push(duped * TicksPerSecond);
    if(duped == 0) return; //return while player lagging
    if(player.timerHold.length >= 20){
        let timer = 0;
        //Get average timer value
        for(const currentTH of player.timerHold){
            timer += currentTH;
        }
        let timerValue = timer / player.timerHold.length / Value;
        //Adjust timer for lagging player
        if(player.timerHold.length >= 24){
            timerValue += 2;
        }
        
        //TIMER CODE (Warning:it sometimes bugs, so if you want to use if for timer cheat detection. flag player when the value is unnatural 2 or 3 times in a row.)
        player.sendMessage(`Timer:${timerValue}, Value:${Value}`);

        player.timerHold.splice(0);
    }
}

function isMoving(velocity){
	return Math.abs(Math.hypot(velocity.x, velocity.z)) > 0.01;
}