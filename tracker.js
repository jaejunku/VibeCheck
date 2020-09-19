// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.
var divRoot = $("#affdex_elements")[0];
var width = 640;
var height = 480;
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
//Construct a CameraDetector and specify the image width / height and face detector mode.
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

//Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();
detector.detectAllEmojis();
detector.detectAllAppearance();


//Add a callback to notify when the detector is initialized and ready for runing.
detector.addEventListener("onInitializeSuccess", function() {
  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");
});

function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}

var xV = document.getElementById("final_note");

//function executes when Start button is pushed.
function onStart() {
  if (detector && !detector.isRunning) {
    $("#logs").html("");
    detector.start();
  }
  log('#logs', "Clicked the start button");

  //Letting the final note display at the end only
  xV.style.display = "none";
}

//function executes when the Reset button is pushed.
function onReset() {
  log('#logs', "Clicked the reset button");
  if (detector && detector.isRunning) {
    detector.reset();

    $('#results').html("");
  }
};

//Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
});

//Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "webcam denied");
  console.log("Webcam access denied");
});

//Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
  $("#results").html("");
});


// // let csvContent = "data:text/csv;charset=utf-8,";
var joye = [];
var sade = [];
var feare = [];
var surpe = [];
var valene = [];
var framenum = [];
var ind = 0;

// Current consecutive fear/sadness levels
var fearF = 0;
var sadF = 0;

//Add a callback to receive the results from processing an image.
//The faces object contains the list of the faces detected in an image.
//Faces object contains probabilities for all the different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  $('#results').html("");
  $('#drlogs').html("");
  log('#results', "Timestamp: " + timestamp.toFixed(2));
  log('#results', "Number of faces found: " + faces.length);

  if (faces.length > 0) {
    log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
    log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));

    var xSm = document.getElementById("ressm");
    var xSad = document.getElementById("ressad");

    if (faces[0].emotions['valence'] >= 0) {
      xSm.style.display = "block";
      xSad.style.display = "none";
    } else {
      xSm.style.display = "none";
      xSad.style.display = "block";
    }

    ind += 1;

    //keeping track of patient's fear status
    if (faces[0].emotions['fear'].toFixed(0) > 10) {
      fearF +=1;
    }
    if (faces[0].emotions['fear'].toFixed(0) <= 10) {
      fearF = 0;
    }
    /*
    //if patient has been fearful for over 3 seconds display that!
    if (fearF >= 30) {
      log('#drlogs', "The patient has been fearful, could you tell him signs of hope?");
    }

    //keeping track of patient's fear status
    if (faces[0].emotions['sadness'].toFixed(0) > 10) {
      sadF +=1;
    }
    if (faces[0].emotions['sadness'].toFixed(0) <= 10) {
      sadF = 0;
    }

    //if patient has been fearful for over 3 seconds display that!
    if (sadF >= 30) {
      log('#drlogs', "The patient has been displaying a pattern of sadness, could you tell stories of others who made it?");
    }
    */
    /*
    //adding frame values to their respective arrays
    framenum.push(ind);
    valene.push(faces[0].emotions['valence'].toFixed(0));
    joye.push(faces[0].emotions['joy'].toFixed(0));
    sade.push(faces[0].emotions['sadness'].toFixed(0));
    feare.push(faces[0].emotions['fear'].toFixed(0));
    surpe.push(faces[0].emotions['surprise'].toFixed(0));
    */
    log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val;
    }));
    log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
    if($('#face_video_canvas')[0] != null)
      drawFeaturePoints(image, faces[0].featurePoints);

  }
});

//function executes when the Stop button is pushed.
function onStop() {
  log('#logs', "Clicked the stop button");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();
  }

  var n = valene.length;
  var nI = Math.round( n/10 );
  var valEnd = 0;
  //alert(nI);
  for (var i = n - nI-1; i < n; ++i) {
    if (valene[i]>=0) {
      valEnd +=1;
    }
  }
  //alert(valEnd);
  if (valEnd >= (nI*0.7)) {
    xV.style.display = "block";
  }


  var joy_em = {
  x: framenum,
  y: joye,
  name: 'Joy',
  type: 'lines'
  };

  var sadness_em = {
  x: framenum,
  y: sade,
  name: 'Sadness',
  type: 'lines'
  };

  var surprise_em = {
  x: framenum,
  y: surpe,
  name: 'Surprise',
  type: 'lines'
  };

  var fear_em = {
  x: framenum,
  y: feare,
  name: 'Fear',
  type: 'lines'
  };

  var data4 = [joy_em, sadness_em, surprise_em, fear_em];

  var layout = {
    title: 'Emotions displayed through out the session',
    xaxis: {
      title: 'Frame number'
    },
    yaxis: {
      title: 'Emotion detected',
      showline: false
    }
  };

  Plotly.newPlot('tester', data4, layout);

  //re-setting all arrays
  joye = [];
  sade = [];
  feare = [];
  surpe = [];
  valene = [];
//  framenum = [];


};

//Draw the detected facial feature points on the image
function drawFeaturePoints(img, featurePoints) {
  var contxt = $('#face_video_canvas')[0].getContext('2d');

  var hRatio = contxt.canvas.width / img.width;
  var vRatio = contxt.canvas.height / img.height;
  var ratio = Math.min(hRatio, vRatio);

  contxt.strokeStyle = "#FFFFFF";
  for (var id in featurePoints) {
    contxt.beginPath();
    contxt.arc(featurePoints[id].x,
      featurePoints[id].y, 2, 0, 2 * Math.PI);
    contxt.stroke();

  }
}