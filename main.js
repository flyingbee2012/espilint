﻿/// <reference path="/scripts/babylon.max.js" />

var engine;
var canvas;
var scene;
var meshesColliderList = [];
var materialAmiga;
var materialWood;

document.addEventListener("DOMContentLoaded", startGame, false);
function startGame() {
    if (BABYLON.Engine.isSupported()) {
        canvas = document.getElementById("renderCanvas");
        engine = new BABYLON.Engine(canvas, true);

        BABYLON.SceneLoader.Load("http://cdn.babylonjs.com/wwwbabylonjs/Scenes/Espilit/", "Espilit.babylon", engine, function (loadedScene) {
            scene = loadedScene;

            scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.OimoJSPlugin());
            //scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.CannonJSPlugin());

            CreateMaterials();
            addListeners();
            
            for (var i = 1; i < scene.meshes.length; i++) {
                if (scene.meshes[i].checkCollisions && scene.meshes[i].isVisible === false) {
                    scene.meshes[i].physicsImpostor = new BABYLON.PhysicsImpostor(
                        scene.meshes[i],
                        BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7},
                        scene);
                    meshesColliderList.push(scene.meshes[i]);
                }
            }

            //CreateCollidersHTMLList();
   
            // Wait for textures and shaders to be ready
            scene.executeWhenReady(function () {
                // Attach camera to canvas inputs
                scene.activeCamera.attachControl(canvas);
                
                // Once the scene is loaded, just register a render loop to render it
                engine.runRenderLoop(function () {
                    scene.render();
                });
            });
        }, function (progress) {
            // To do: give progress feedback to user
        });
    }
}

function CreateMaterials() {
    materialAmiga = new BABYLON.StandardMaterial("amiga", scene);
    materialAmiga.diffuseTexture = new BABYLON.Texture("assets/amiga.jpg", scene);
    materialAmiga.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    materialAmiga.diffuseTexture.uScale = 5;
    materialAmiga.diffuseTexture.vScale = 5;

    materialWood = new BABYLON.StandardMaterial("wood", scene);
    materialWood.diffuseTexture = new BABYLON.Texture("assets/wood.jpg", scene);
    materialWood.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
}

function addListeners() {
    window.addEventListener("keydown", function (evt) {
        // s for sphere
        if (evt.keyCode == 83) {
            for (var index = 0; index < 25; index++) {
                var sphere = BABYLON.Mesh.CreateSphere("Sphere0", 10, 0.5, scene);
                sphere.material = materialAmiga;
                sphere.position = new BABYLON.Vector3(0 + index / 10, 3, 5 + index / 10);
                sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);
            }
        }
        // b for box
        if (evt.keyCode == 66) {
            for (var index = 0; index < 10; index++) {
                var box0 = BABYLON.Mesh.CreateBox("Box0", 0.5, scene);
                box0.position = new BABYLON.Vector3(0 + index / 5, 3, 5 + index / 5);
                box0.material = materialWood;
                box0.physicsImpostor = new BABYLON.PhysicsImpostor(box0, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 4 }, scene);
            }
        }
    });

    scene.onPointerDown = function (evt, pickResult) {
        if (pickResult.pickedMesh.name.indexOf("Sphere0") === -1 &&
            pickResult.pickedMesh.name.indexOf("Box0") === -1) {
            return;
        }
        if (pickResult.hit) {
            var dir = pickResult.pickedPoint.subtract(scene.activeCamera.position);
            dir.normalize();
            pickResult.pickedMesh.applyImpulse(dir.scale(5), pickResult.pickedPoint);
        }
    }
}

function CreateCollidersHTMLList() {
    var listColliders = document.getElementById("listColliders");
    for (var j = 0; j < meshesColliderList.length; j++) {
        var newLi = document.createElement("li");

        var chkVisibility = document.createElement('input');
        chkVisibility.type = "checkbox";
        chkVisibility.name = meshesColliderList[j].name;
        chkVisibility.id = "colvis" + j;

        var chkPhysics = document.createElement('input');
        chkPhysics.type = "checkbox";
        chkPhysics.name = meshesColliderList[j].name;
        chkPhysics.id = "colphysx" + j;

        (function (j) {
            chkVisibility.addEventListener(
             "click",
             function (event) {
                 onChangeVisibility(j, event);
             },
             false
           );
            chkPhysics.addEventListener(
            "click",
            function (event) {
                onChangePhysics(j, event);
            },
            false
            );
        })(j)

        newLi.textContent = meshesColliderList[j].name + " visibility/physx ";
        newLi.appendChild(chkVisibility);
        newLi.appendChild(chkPhysics);
        listColliders.appendChild(newLi);
    }
    function onChangeVisibility(id, event) {
        if (!meshesColliderList[id].isVisible) {
            meshesColliderList[id].isVisible = true;
            meshesColliderList[id].material.alpha = 0.75;
            meshesColliderList[id].material.ambientColor.r = 1;
        }
        else {
            meshesColliderList[id].isVisible = false;
        }

    }
    function onChangePhysics(id, event) {
        if (!meshesColliderList[id].checkCollisions) {
            meshesColliderList[id].checkCollisions = true;
            meshesColliderList[id].physicsImpostor =
                new BABYLON.PhysicsImpostor(meshesColliderList[id],
                            BABYLON.PhysicsImpostor.BoxImpostor,
                            { mass: 0, friction: 0.5, restitution: 0.7 },
                            scene);
        }
        else {
            meshesColliderList[id].checkCollisions = false;
            meshesColliderList[id].physicsImpostor.dispose();
        }
    }
}