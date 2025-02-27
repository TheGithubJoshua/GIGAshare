const firebaseConfig = {
  apiKey: "AIzaSyA3g2Z4_RqkuYBOFssL_0QQfmVXRmVa50Y",
  authDomain: "gigashare-8c656.firebaseapp.com",
  projectId: "gigashare-8c656",
  storageBucket: "gigashare-8c656.appspot.com",
  messagingSenderId: "883414466633",
  appId: "1:883414466633:web:5dd056341dd00ee0e7ff98",
  measurementId: "G-VML1NKVRP9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference messages collection
var messagesRef = firebase.database().ref("image");

// Listen for form submit

function uploadImage() {
  if (document.getElementById("file").value != "") {
    var uploadtext = document.getElementById("upload").innerHTML;
    document.getElementById("upload").innerHTML = "Uploading...";
    var file = document.getElementById("file").files[0];
    var storageRef = firebase.storage().ref("images/" + file.name);
    var uploadTask = storageRef.put(file);
    uploadTask.on(
      "state_changed",
      function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes * 100).toFixed(2);
        console.log("Upload is " + progress + "% done");
        document.getElementById("upload").innerHTML = "Uploading"+" "+progress+"%...";
      },
      function (error) {
        console.log(error.message);
        document.getElementById("upload").innerHTML = "Upload Failed";
      },
      function () {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          console.log("File available at", downloadURL);
          saveMessage(downloadURL);
        });
      }
    );
  } else {
    var uploadtext = document.getElementById("upload").innerHTML;
    document.getElementById("upload").innerHTML = "Please select a file";
    // After 2 sec make it empty
    setTimeout(function () {
      document.getElementById("upload").innerHTML = uploadtext;
    }, 2000);
  }
}



// Save message to firebase
function saveMessage(downloadURL) {
  var newMessageRef = messagesRef.push();
  var unique = createUniquenumber();
  // Hidding recive file div
  var x = document.getElementById("downloadiv");
  x.style.display = "none";
  var showUnique = document.getElementById("ShowUniqueID");
  var shU = document.getElementById("showunique");
  shU.value = unique;
  showUnique.style.display = "block";
  // showUnique.value = unique;
  newMessageRef.set({
    url: downloadURL,
    number: unique,
  });
  document.getElementById("upload").innerHTML = "Upload Successful";
  //Make file input empty
  document.getElementById("file").value = "";
}

function createUniquenumber() {
  // Create a unique 5 digit number for each image which is not in the database field number yet
  var number = Math.floor(10000 + Math.random() * 90000);
  var ref = firebase.database().ref("image");
  ref.on("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var childData = childSnapshot.val();
      if (childData.number == number) {
        createUniquenumber();
      }
    });
  });
  return number;
}

function showimage() {
  var uniqueId = document.getElementById("unique").value;
  if (uniqueId == "") {
    alert("Unique Id is empty\n Please enter a Unique Id");
    return;
  }
  var ref = firebase.database().ref("image");
  var flag = 0;
  ref.on("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var childData = childSnapshot.val();
      if (childData.number == uniqueId) {
        flag = 1;
        window.open(childData.url, "_blank");
        // AFter this delete the image from the database
        ref.child(childSnapshot.key).remove();
        // Remove file from storage
        //Run this with 5sec delay
        setTimeout(function () {
          var storageRef = firebase.storage().refFromURL(childData.url);
          storageRef
            .delete()
            .then(function () {
              ref.child(childSnapshot.key).remove();
              // File deleted successfully
            })
            .catch(function (error) {});
        }, 15000);
      }
    });
  });
  // After some time if flag is still 0 then show alert
  // setTimeout(function(){

  // if(flag == 0){
  //     alert("File not found Check the Unique ID");
  // }
  // }, 5000);
}

function flesize() {
  var file = document.getElementById("file").files[0];
  // Dont allow file size greater than 100MB
  if (file.size > 5100000000) {
    alert(
      "File size is greater than 5GB\n Please select a file less than 5GB"
    );
    document.getElementById("file").value = "";
  }
}

// Click on download button when enter is pressed
document.getElementById("unique").addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("show").click();
  }
});
