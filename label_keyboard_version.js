// Aleyna Kutuk's Firebase Connection
const firebaseConfig = {
  apiKey: "AIzaSyCAZOblzgyVbrGCRbGO_mskKSQAV1-PUhs",
  authDomain: "scene-dataset.firebaseapp.com",
  databaseURL: "https://scene-dataset-default-rtdb.firebaseio.com",
  projectId: "scene-dataset",
  storageBucket: "scene-dataset.appspot.com",
  messagingSenderId: "613884392238",
  appId: "1:613884392238:web:60996e315f709dbc0e80bf"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// get firebase database
let database = firebase.database();
let usersRefInDatabase = database.ref("sceneData/");

//Element retrieval
let $ = function (id) { return document.getElementById(id) };
let drawingModeEl = $('modeButton');


var canvas = this.__canvas = new fabric.Canvas('canvas', {isDrawingMode: true });
var ctx = canvas.getContext("2d", { willReadFrequently: true });
let brush = canvas.freeDrawingBrush;
var shadow = new fabric.Shadow({ color: "red", blur: 8});
let canvasDiv = $("canvas");

// Set brush features
brush.color = rgbToHex(0, 0, 0);
brush.width = 3;

canvas.selectionColor = 'rgba(0,255,0,0.3)';
canvas.selectionBorderColor = 'rgba(230, 126, 34, 1)';
canvas.selectionLineWidth = 1;
canvas.selectionShadow = shadow;

var mouse = false;
let mDown;
let pDown;
ctx.lineJoin = "round";
ctx.lineCap = "round";
var positionX, positionY;

let user_data = [];
let color_palette = {}; 
let currentSceneIndex = 0;
let currentObjIndex = 1;
let active_strokes = [];
let labelled_obj_indices = [];
let obj_divisions = [-1];  // keep last stroke indices
let stroke_num = -1;
getSceneData(currentObjIndex);

window.addEventListener("DOMContentLoaded", startup);

function getSceneData(currentObjIndex) {
  
  var getPromise = usersRefInDatabase.once("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {

      var scene_info = childSnapshot.child("scene_info").val();
      let canvasObjects = canvas.getObjects();
      var stroke = []; //should contain 3 array in it
      var xCords = [];
      var yCords = [];
      for (let i = 0; i < scene_info.length; i++) {
            var vec = scene_info[i]["drawing"];
            stroke[0] = vec[0];
            stroke[1] = vec[1];
            
            if (canvas.getObjects().length == 0) {
                temp_stroke_vec = stroke;
             } else {
  
              canvasObjects[canvas.getObjects().length - 1].vectorRepresentation = temp_stroke_vec;
              temp_stroke_vec = stroke;
             }

            canvasObjects[canvas.getObjects().length - 1].vectorRepresentation = temp_stroke_vec;
            temp_stroke_vec = stroke;
      }

  });
  });

}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const hex2rgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

for (let i = 0; i < obj_classes.length; i++) {
  let hexcolor = rgbToHex(getRandomInt(80,255), getRandomInt(80,255), getRandomInt(80,255));
  color_palette[obj_classes[i]] = hexcolor;
}

function startup() {

  const el = $('canvas');
  el.addEventListener('touchstart', handleStart);
  el.addEventListener('touchmove', handleMove);
  el.addEventListener('touchend', handleEnd);
  el.addEventListener('touchcancel', handleCancel);

}

function handleStart(evt) {
  evt.preventDefault();
  canvas.renderAll();
  pDown = true;

  canvas.getObjects().forEach(function (o) {
      o.shadow = null;
  });
  if (canvas.getActiveObjects()) {
      canvas.getActiveObjects().forEach(function (o) {
          o.shadow = shadow;
      });
  }
}

function handleMove(evt) {
  evt.preventDefault();
  pDown = true;

  canvas.getObjects().forEach(function (o) {
      o.shadow = null;
  });
  if (canvas.getActiveObjects()) {
      canvas.getActiveObjects().forEach(function (o) {
          o.shadow = shadow;
      });
  }
}

function handleEnd(evt) {
  evt.preventDefault();
  pDown = false;

  canvas.getObjects().forEach(function (o) {
      o.shadow = null;
  });
  if (canvas.getActiveObjects()) {
      canvas.getActiveObjects().forEach(function (o) {
          o.shadow = shadow;
      });
  }
}

function handleCancel(evt) {
  evt.preventDefault();
}      

function showInstructions() {
  
  let instructions = ["First select the strokes of an object.",
                      "To select strokes, use RIGHT ARROW.",
                      "To unselect strokes, use LEFT ARROW.",
                      "If a stroke is selected, it will appear black.",
                      "After selecting the whole object, label it with the appropriate category name.",
                      "You can choose from the list or create a new category name.",
                      "Then, click the SUBMIT button.",
                      "You can see your labelled object list on the right of the canvas."];
  let message = "";
  for (let i = 0; i < instructions.length; i++) {
    message += "‣"+ instructions[i] + "<br><br>" ;
  }
  customAlert.alert(message);

}

// this function removes all selected strokes and turn them all grey color.
function clearAllSelections() {
  let allObjects = canvas.getObjects();
  
  if (allObjects.length > 0) {
    let stroke_color = rgbToHex(211, 211, 211);
    for (let i=0; i < allObjects.length; i++) {
        allObjects[i].set("stroke", stroke_color);
    }
    stroke_num = -1;
    user_data = [];
    active_strokes = [];
    labelled_obj_indices = [];
    obj_divisions = [-1];
    modifyLabelledObjectList($('dropdown-labelledobjs'), 2);
    canvas.renderAll();
  }
}

// this function go back to the last state, only the last object strokes turns into grey color.
function undoLastSelection() {
  let allObjects = canvas.getObjects();
  
  if(labelled_obj_indices.length > 0){
    let stroke_color = rgbToHex(211, 211, 211);
    var last_stroke_id = obj_divisions.pop();
    var prev_stroke_id = obj_divisions.at(-1);
    stroke_num = prev_stroke_id; // update stroke_num
    let stroke_cnt = last_stroke_id - prev_stroke_id;

    for (let i=allObjects.length-1; i > prev_stroke_id; i--) {
        allObjects[i].set("stroke", stroke_color);
    }
    
    for (let i=0; i < stroke_cnt; i++) {
      labelled_obj_indices.pop();
      active_strokes.pop();
    }
    user_data.pop();
    modifyLabelledObjectList($('dropdown-labelledobjs'), 3);
    canvas.renderAll();

  }
}


// this function triggers when you click LEFT ARROW key.
function moveSceneBackward() {
  const includesIdx = labelled_obj_indices.includes(stroke_num);
  if (stroke_num < -1){
    customAlert.alert("You should click to RIGHT ARROW!!");
    stroke_num = -1;
  }
  else if(stroke_num == -1)
  {
    customAlert.alert("You should click to RIGHT ARROW!!");
  }
  else if(includesIdx){
    customAlert.alert("You cannot label an object twice, if you made a labeling mistake, please use CLEAR ALL or UNDO buttons !!");
  }
  else{
    changeStrokeColor("grey");
    stroke_num -= 1;
  }
}

// this function triggers when you click RIGHT ARROW key.
function moveSceneForward() {
    stroke_num += 1;
    let allObjects = canvas.getObjects();
    if (stroke_num >= allObjects.length){
      customAlert.alert("No grey stroke left !!");
      stroke_num -= 1;
    }
    else{
      changeStrokeColor("black");
    }
}

// this function changes color of the strokes: GREY or BLACK.
function changeStrokeColor(stroke_color) {
  let allObjects = canvas.getObjects();
  
  if (allObjects.length > 0) {

    if (stroke_color == "grey"){
      let stroke_color = rgbToHex(211, 211, 211);
      allObjects[stroke_num].set("stroke", stroke_color);
    }
    else if(stroke_color == "black"){
      let stroke_color = rgbToHex(0, 0, 0);
      allObjects[stroke_num].set("stroke", stroke_color);
    }
    canvas.renderAll();
  }
}

// this function searches for the labelled object stroke indices.
function findLabelledObject(){
    let objs = canvas.getObjects();
    for (let i = 0; i < objs.length; i++) {
      let rgb_color = hex2rgb(objs[i].get("stroke"));
      if (rgb_color[0] == 0 && rgb_color[1] == 0 && rgb_color[2] == 0){
         
        const includesIdx = labelled_obj_indices.includes(i);

         if(includesIdx == false){
            var vec = objs[i].get('vectorRepresentation');
            if(typeof vec !== "undefined"){
               active_strokes.push(vec);
            }
            labelled_obj_indices.push(i);
            console.log(active_strokes);
            console.log("labelled_obj_indices:", labelled_obj_indices);
         }
      }
    }
    var last_labelled_id = labelled_obj_indices.at(-1);
    if(typeof last_labelled_id !== "undefined"){
        if (!(obj_divisions.includes(last_labelled_id))){
             obj_divisions.push(last_labelled_id);
             console.log("obj_divisions:", obj_divisions);
       }
    }
    
}

function checkEmptyDrawing(){

  if (active_strokes.length <= 0) return false;
  else return true;

}

function modifyLabelledObjectList(dropdown, state, categoryname="") {
  
  //create dropdown items for each pushed object category
  if (state == 1){
    let dropdown_item = document.createElement('a');
    dropdown_item.setAttribute('href', '#'+ categoryname);
    dropdown_item.setAttribute('class', 'dropdown-labelledobjs-item');
    dropdown_item.innerHTML = categoryname;
    dropdown.appendChild(dropdown_item);

  }
  //empty the list
  else if (state == 2){
    document.querySelectorAll('.dropdown-labelledobjs-item').forEach(el => el.remove());
  }
  //remove the last item from the list
  else if (state == 3){
    let dropdown_items = dropdown.querySelectorAll('.dropdown-labelledobjs-item');
    let dropdown_item = dropdown_items[dropdown_items.length-1];
    dropdown.removeChild(dropdown_item);
  }

}

// this function triggers when you submit a category name from a given list.
function saveCategory(){

  let categoryname = $("categoryname");

  if(categoryname.value == "") {
    customAlert.alert("You must select a category!")
  }
  else{
    findLabelledObject();
    const emptyFlag = checkEmptyDrawing();
    console.log("emptyFlag", emptyFlag);
    if (emptyFlag){
      const new_data = {
        "labels": categoryname.value,
        "drawing": active_strokes
       };
       
       modifyLabelledObjectList($('dropdown-labelledobjs'), 1, categoryname.value);

       user_data.push(new_data);
       active_strokes = [];
       categoryname.value = "";
    }
    else{
      customAlert.alert("You cannot label an object twice, if you made a labeling mistake, please use CLEAR or UNDO buttons !!");
    }
  } 
} 

// this function triggers when you submit an external category name.
function saveOther() {

  let categoryname = $("labelname");

  if(categoryname.value == "") {
    customAlert.alert("You must write a new category !!")
  }
  else{
    
    findLabelledObject();

    const emptyFlag = checkEmptyDrawing();
  
    if (emptyFlag){

      const new_data = {
        "labels": categoryname.value,
        "drawing": active_strokes
       };
       
       modifyLabelledObjectList($('dropdown-labelledobjs'), 1, categoryname.value);

       user_data.push(new_data);
       active_strokes = [];
       categoryname.value = ""
  
    }
    else{
      customAlert.alert("Use CLEAR ALL or UNDO buttons to correct your labeling mistake !!");
    }

  }
}

// this function saves incomplete objects
function saveIncomplete(){
    findLabelledObject();

    const emptyFlag = checkEmptyDrawing();
    modifyLabelledObjectList($('dropdown-labelledobjs'), 1, "incomplete");

    if (emptyFlag){

      const new_data = {
        "labels": "incomplete",
        "drawing": active_strokes
       };
       
       user_data.push(new_data);
    }
    active_strokes = [];
  } 


// this function triggers when you switch to the NEXT SCENE, saves the data to the firebase.
function nextSketch(){
  
  let objs = canvas.getObjects();

  if (labelled_obj_indices.length != objs.length){
      customAlert.alert("Please label every objects !!");
  }
  else{
      let currentScene = sceneDescriptions[currentSceneIndex];
      document.getElementById("sceneDesc").innerHTML = sceneDescriptions[currentSceneIndex + 1];
      let submit_content = { "user_email": email, "agreement": agreement, "scene_info": user_data, "scene_description": currentScene};
      console.log(user_data);
      usersRefInDatabase.push(submit_content, (error) => {
       if (error) {
        customAlert.alert("Error while pushing data to the firebase.");
       } else {
         console.log(submit_content);
         console.log("Data sent successfully!");
       }
      
      });

      modifyLabelledObjectList($('dropdown-labelledobjs'), 2);
      currentObjIndex++;
      currentSceneIndex++;
      
      user_data = [];
      active_strokes = [];
      labelled_obj_indices = [];
      obj_divisions = [-1];

      if (currentObjIndex > numScenes) {
        window.location.href = "./end.html";
      }
      else{
          stroke_num = -1;
          getSceneData(currentObjIndex);
      }
  }
}
