import firebase from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import "https://www.gstatic.com/firebasejs/9.6.7/firebase-analytics.js";
import "https://www.gstatic.com/firebasejs/9.6.7/firebase-messaging.js";
import "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js";
import "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyConFP1K_9uUI4LZD1BIjSJkB-E8FW3hgw",
    authDomain: "heritage-school-7be75.firebaseapp.com",
    databaseURL: "https://heritage-school-7be75.asia-southeast1.firebasedatabase.app",
    projectId: "heritage-school-7be75",
    storageBucket: "heritage-school-7be75.appspot.com",
    messagingSenderId: "273509784374",
    appId: "1:273509784374:web:77b5c72fe6cfcf410a7197",
    measurementId: "G-FCBFYZTMJP"
};

const Firebase = firebase.initializeApp(firebaseConfig)
console.log(Firebase)
module.exports = { Firebase }
