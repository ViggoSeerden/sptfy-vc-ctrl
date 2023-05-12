import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

serviceWorkerRegistration.register();

//Asking for permission with the Notification API
// if (typeof Notification !== typeof undefined) { //First check if the API is available in the browser
// 	Notification.requestPermission().then(function (result) {
// 		//If accepted, then save subscriberinfo in database
// 		if (result === "granted") {
// 			console.log("Browser: User accepted receiving notifications, save as subscriber data!");
// 			navigator.serviceWorker.ready.then(function (serviceworker) { //When the Service Worker is ready, generate the subscription with our Serice Worker's pushManager and save it to our list
// 				const VAPIDPublicKey = "BB2QFz3_yLlam4951aTgyeUNTNfaSFEEq1fEAPrQ42oCu7k7_b6Ix3Xwq3dQ4afOdGS4vjEXf-pjUDb1tIIwZlY"; // Fill in your VAPID publicKey here
// 				const options = { applicationServerKey: VAPIDPublicKey, userVisibleOnly: true } //Option userVisibleOnly is neccesary for Chrome
// 				serviceworker.pushManager.subscribe(options).then((subscription) => {
// 					//POST the generated subscription to our saving script (this needs to happen server-side, (client-side) JavaScript can't write files or databases)
// 					let subscriberFormData = new FormData();
// 					subscriberFormData.append("json", JSON.stringify(subscription));
// 					fetch("static/data/saveSubscription.php", { method: "POST", body: subscriberFormData });
// 				});
// 			});
// 		}
// 	}).catch((error) => {
// 		console.log(error);
// 	});
// }




// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
