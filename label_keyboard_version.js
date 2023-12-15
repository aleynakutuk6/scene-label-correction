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

var canvas = this.__canvas = new fabric.Canvas('canvas', {isDrawingMode: false});

var ctx = canvas.getContext("2d", { willReadFrequently: true });
let brush = canvas.freeDrawingBrush;
var shadow = new fabric.Shadow({ color: "red", blur: 8});
let canvasDiv = $("canvas");

// Set brush features
brush.color = rgbToHex(0, 0, 0);
brush.width = 3;

//disable user to move strokes on canvas
fabric.Group.prototype.hasControls = false;
fabric.Group.prototype.lockMovementX = true;
fabric.Group.prototype.lockMovementY = true;
fabric.Group.prototype.lockScalingX = true;
fabric.Group.prototype.lockScalingY = true;
fabric.Group.prototype.hasBorders = false;

canvas.selectionColor = 'rgba(0,255,0,0.3)';
canvas.selectionBorderColor = 'rgba(230, 126, 34, 1)';
canvas.selectionLineWidth = 1;
canvas.selectionShadow = shadow;

ctx.lineJoin = "round";
ctx.lineCap = "round";
var positionX, positionY;

var user_data = [];
let currentObjIndex = 1;
let active_strokes = [];
let labelled_obj_indices = [];
let obj_divisions = [-1];  // keep last stroke indices
let stroke_num = -1;
let line_num = [0];

var scene_infos = [];
var obj_cnts = [];
var curr_scene_id = -1;
var tot_scene_cnt = 0;

getSceneData();

window.addEventListener("DOMContentLoaded", startup);

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


function getFirebaseData(){
    
  var getPromise = usersRefInDatabase.once("value", function(s) {
    tot_scene_cnt = s.numChildren();
    s.forEach(function(childSnapshot) {
      var scene_info = childSnapshot.child("scene_info").val();
      var obj_cnt = childSnapshot.child("scene_info").numChildren();
      scene_infos.push(scene_info);
      obj_cnts.push(obj_cnt);
    });
  });
}

function getDrawing(strokes) {

  var points = [];
  line_num.push(line_num[line_num.length -1] + strokes[0].length - 1);
  //define your points from 0 to width and from 0 to height
  for(k =0; k < strokes[0].length; k++){
     points.push({
     x : (strokes[0][k]),
     y : (strokes[1][k])
     });
  }
  console.log(points);
  //drow lines
  for(i =0; i < points.length - 1; i++)
  {
      canvas.add(new fabric.Line([points[i].x, points[i].y, points[i+1].x, points[i+1].y], {
            stroke: rgbToHex(211, 211, 211),
            strokeWidth: 4
         }));
  }

  canvas.renderAll();
}


function getSceneData() {
  
  if (tot_scene_cnt == 0){
     getFirebaseData();
  }
  else{
    curr_scene_id += 1;
    if (curr_scene_id == tot_scene_cnt){
       console.log("Finished!!!!");
    }
    else{
      deleteObjects();
      var scene_info = scene_infos[curr_scene_id];
      var obj_cnt = obj_cnts[curr_scene_id];
  
      for (let i = 0; i < obj_cnt; i++) {
          var stroke = []; 
          var vec = scene_info[i]["drawing"];
          var label = scene_info[i]["labels"];
          
          for (let j = 0; j < vec.length; j++) {
              stroke[j] = vec[j];
              getDrawing(stroke[j]);
          }
          
          canvas.set({vectorRepresentation: stroke});
          canvas.renderAll();
      }
    }   

  }
 
}

function deleteObjects() {
    canvas.forEachObject(function(obj){
        if(obj.type === 'line'){
            canvas.remove(obj);
        }
    });

    canvas.renderAll();
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


// this function removes all selected strokes and turn them all grey color.
function clearAllSelections() {
  let allObjects = canvas.getObjects();
  
  if (allObjects.length > 0) {
    let stroke_color = rgbToHex(211, 211, 211);
    for (let i=0; i < allObjects.length; i++) {
        allObjects[i].set("stroke", stroke_color);
    }
    stroke_num = -1;
    line_num = [0];
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
    console.log("last_stroke_id", last_stroke_id);
    console.log("prev_stroke_id",prev_stroke_id);

    for (let i = line_num[prev_stroke_id]; i > line_num[stroke_num]; i--) {
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
    console.log("You should click to RIGHT ARROW!!");
    stroke_num = -1;
  }
  else if(stroke_num == -1)
  {
    console.log("You should click to RIGHT ARROW!!");
  }
  else if(includesIdx){
    console.log("You cannot label an object twice, if you made a labeling mistake, please use CLEAR ALL or UNDO buttons !!");
  }
  else{
    changeStrokeColor("grey");
    stroke_num -= 1;
  }
}

// this function triggers when you click RIGHT ARROW key.
function moveSceneForward() {
    stroke_num += 1;
    console.log(line_num.length -1);
    if (stroke_num >= line_num.length -1){
      console.log("No grey stroke left !!");
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
      for (let i = line_num[stroke_num]; i < line_num[stroke_num+1]; i++) {
        allObjects[i].set("stroke", stroke_color);
      }
      
    }
    else if(stroke_color == "black"){
      let stroke_color = rgbToHex(0, 0, 0);
      for (let i = line_num[stroke_num]; i < line_num[stroke_num+1]; i++) {
        allObjects[i].set("stroke", stroke_color);
      }
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
    console.log("You must select a category!")
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
      console.log("You cannot label an object twice, if you made a labeling mistake, please use CLEAR or UNDO buttons !!");
    }
  } 
} 

// this function triggers when you submit an external category name.
function saveOther() {

  let categoryname = $("labelname");

  if(categoryname.value == "") {
    console.log("You must write a new category !!")
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
      console.log("Use CLEAR ALL or UNDO buttons to correct your labeling mistake !!");
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
      console.log("Please label every objects !!");
  }
  else{
      
      let submit_content = { "user_email": email, "agreement": agreement, "scene_info": user_data, "scene_description": currentScene};
      console.log(user_data);
      usersRefInDatabase.push(submit_content, (error) => {
       if (error) {
        console.log("Error while pushing data to the firebase.");
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
          getSceneData();
      }
  }
}
