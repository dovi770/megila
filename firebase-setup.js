const firebaseConfig = {
    apiKey: "AIzaSyBTAjmwijuxSoo1W8SBh0MWu-ZFDlFZZ8U",
    authDomain: "megilat-ester.firebaseapp.com",
    databaseURL: "https://megilat-ester-default-rtdb.firebaseio.com/",
    projectId: "megilat-ester",
    storageBucket: "megilat-ester.firebasestorage.app",
    messagingSenderId: "933099508099",
    appId: "1:933099508099:web:7276a005e72a75c16326b6"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
