window.addEventListener('DOMContentLoaded', function(){
    var canvas = document.getElementById('renderCanvas');
    canvas.getContext = function(type, data) {
        data.preserveDrawingBuffer = true;
        return HTMLCanvasElement.prototype.getContext.call(canvas, type, data);
    }
    const engine = new BABYLON.Engine(canvas, true);
    function run(){
        //Create the scene
        const scene = new BABYLON.Scene(engine);
        
        let gravityVector = new BABYLON.Vector3(0,-20, 0);
        scene.enablePhysics(gravityVector, new BABYLON.CannonJSPlugin());
        
        var keys = {};
        window.addEventListener('keydown', function(e) {
            keys[e.key] = true;
        });
        window.addEventListener('keyup', function(e) {
            keys[e.key] = false;
        });
        
        scene.clearColor = new BABYLON.Color3(0, 0.804, 1);
        
        //Creates the player
        const player = BABYLON.MeshBuilder.CreateSphere    ("player", {segments: 12, diameter: 2}, scene);
        
        player.material = new BABYLON.StandardMaterial("playerMaterial", scene);
        player.material.diffuseColor = new BABYLON.Color3(0, 0.804, 1);
        
        player.position = new BABYLON.Vector3(0, 15, 0);
        player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 1, restitution: 0.9}, scene);
        let canJump = true;
        let cooldown = 50;
        let inCooldown = false;
        
        //Creates the camera
        const camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(player.position.x, 10, player.position.z), scene);
        camera.attachControl(canvas, true);
        
        //Creates the light
        const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
        
        //Make the cube
        function createBox(x, y, z, w, h, d, xRot, yRot, zRot, clr, m){
            const Box = BABYLON.MeshBuilder.CreateBox('Box', {width: w, height: h, depth: d}, scene);
            Box.material = new BABYLON.StandardMaterial("BoxMaterial", scene);
            Box.material.diffuseColor = clr;
            Box.position = new BABYLON.Vector3(x, y, z);
            Box.rotation = new BABYLON.Vector3(xRot, yRot, zRot);
            if (m === undefined){
                m = 0;
            }
            Box.physicsImpostor = new BABYLON.PhysicsImpostor(Box, BABYLON.PhysicsImpostor.BoxImpostor, {mass: m, restitution: 0.5}, scene);
        }
        function createSphere(x, y, z, s, d, clr){
            const Sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {segments: s, diameter: d}, scene);
            Sphere.material = new BABYLON.StandardMaterial("sphereMaterial", scene);
            Sphere.material.diffuseColor = clr;
            Sphere.position = new BABYLON.Vector3(x, y, z);
            Sphere.physicsImpostor = new BABYLON.PhysicsImpostor(Sphere, BABYLON.PhysicsImpostor.SphereImpostor, {mass: 1, restitution: 0.5}, scene);
        }
        function createCylinder(x, y, z, h, dt, db, xRot, yRot, zRot, clr){
                const Cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {height: h, diameterTop:dt, diameterBottom:db}, scene);
            Cylinder.material = new BABYLON.StandardMaterial("cylinderMaterial", scene);
            Cylinder.material.diffuseColor = clr;
            Cylinder.position = new BABYLON.Vector3(x, y, z);
            Cylinder.rotation = new BABYLON.Vector3(xRot, yRot, zRot);
            Cylinder.physicsImpostor = new BABYLON.PhysicsImpostor(Cylinder, BABYLON.PhysicsImpostor.CylinderImpostor, {mass: 1, restitution: 0.5}, scene);
        }
        function createTorus(x, y, z, d, t, xRot, yRot, zRot, clr){
            const Torus = BABYLON.MeshBuilder.CreateTorus("torus", {diameter:d, thickness:t}, scene);
            Torus.material = new BABYLON.StandardMaterial("cylinderMaterial", scene);
            Torus.material.diffuseColor = clr;
            Torus.position = new BABYLON.Vector3(x, y, z);
            Torus.rotation = new BABYLON.Vector3(xRot, yRot, zRot);
        }
        function createTorusKnot(x, y, z, t, rs, r, xRot, yRot, zRot, clr){
            const TorusKnot = BABYLON.MeshBuilder.CreateTorusKnot("torusKnot", {tube: t, radialSegments: rs, radius:r});
            TorusKnot.material = new BABYLON.StandardMaterial("torusMaterial", scene);
            TorusKnot.material.diffuseColor = clr;
            TorusKnot.position = new BABYLON.Vector3(x, y, z);
            TorusKnot.rotation = new BABYLON.Vector3(xRot, yRot, zRot);
        }
         
         createBox(0, 0, 0, 10, 0.1, 10, 0, 0.5, 0, new BABYLON.Color3(0.5, 0.5, 0.5));
         createTorusKnot(0, 5, 0, 0.15, 100, 1, 0, 0, 0, new BABYLON.Color3(0.5, 0.5, 0.9));
         
         createBox(0, 3, -1, 1, 1, 1, 0, 0, 0, new BABYLON.Color3(0.5, 0.9, 0.9), 1);
         createSphere(1, 2, 0, 10, 1, new BABYLON.Color3(0.5, 0.9, 0.5));
         createCylinder(0, 4, 1, 1, 1, 1, 0, 0, 0, new BABYLON.Color3(0.9, 0.5, 0.5));
         
         createBox(0, 13, 1.5, 1, 1, 1, 0, 0, 0, new BABYLON.Color3(0.5, 0.9, 0.9), 1);
         createSphere(0.5, 12, 0.5, 10, 1, new BABYLON.Color3(0.5, 0.9, 0.5));
         createCylinder(0, 14, -1.5, 1, 1, 1, 0, 0, 0, new BABYLON.Color3(0.9, 0.5, 0.5));
         
         function pointerLock(){
            canvas.requestPointerLock();
         }
         scene.registerAfterRender(function() {
             //Player Movement[
            var vel = player.physicsImpostor.getLinearVelocity();
           player.physicsImpostor.setLinearVelocity(vel.scale(.95));

            var forward = camera.getFrontPosition(1).subtract(camera.position);
            forward.y = 0;
            forward = forward.normalize().scale(0.7);
            
            var up = BABYLON.Vector3.TransformCoordinates(1, BABYLON.Matrix.RotationZ((3 * Math.PI) / 2));

            var backward = BABYLON.Vector3.TransformCoordinates(forward, BABYLON.Matrix.RotationY(Math.PI));

            var left = BABYLON.Vector3.TransformCoordinates(forward, BABYLON.Matrix.RotationY((3 * Math.PI) / 2));

            var right = BABYLON.Vector3.TransformCoordinates(forward, BABYLON.Matrix.RotationY(Math.PI / 2));

            if (keys.w) { 
                player.applyImpulse(forward, player.getAbsolutePosition());
            }
            if (keys.s) {
                player.applyImpulse(backward, player.getAbsolutePosition());
            }
            if (keys.a) {
                player.applyImpulse(left, player.getAbsolutePosition());
            }
            if (keys.d) {
                player.applyImpulse(right, player.getAbsolutePosition());
            }
            if (keys.p){
                player.position = new BABYLON.Vector3(7, 7, 0);
            }
            if (keys[' '] && canJump){
                player.applyImpulse(new BABYLON.Vector3(0, 10, 0), player.getAbsolutePosition());
                canJump = false;
                inCooldown = true;
            }
            if (inCooldown){
                cooldown--;
            }
            if (cooldown <= 0){
                inCooldown = false;
                canJump = true;
                cooldown = 50;
            }
            camera.position = new BABYLON.Vector3(player.position.x, player.position.y+0.5, player.position.z);
            //]
            
            document.addEventListener("click", pointerLock);
        });
         return scene;
        }
    
    const scene = run();
    //Render the scene
    engine.runRenderLoop(function(){
        scene.render();
    });
    
});
