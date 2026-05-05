var deferredPrompt;
if (!window.Promise) {
    window.Promise = Promise;
}
if ('serviceWorker' in navigator) {  
  navigator.serviceWorker.getRegistrations().then(registrations => {
    });
    navigator.serviceWorker
    .register('/service-worker.js?v=7.2')
    .then(function() {       
    })
    .catch(function(err) {
    });
}