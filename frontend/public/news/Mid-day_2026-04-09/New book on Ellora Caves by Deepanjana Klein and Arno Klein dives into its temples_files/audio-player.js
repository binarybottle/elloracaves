let startEvents = [ "mouseover", "keydown", "touchmove", "touchstart", "scroll" ],
	eventFired  = false;
startEvents.forEach( event => {
	if ( ! eventFired ) {
		addEventListener( event, audioPlayerLoader );
	}
}); 
function audioPlayerLoader() {
	if($('#audio-file').val() != ""){
		eventFired = true;
		startEvents.forEach( event => {
			removeEventListener( event, audioPlayerLoader );
		});
		let audio    = new Audio($('#audio-file').val()),
		pausePlayBtn = document.getElementById('play-pause'),
		progressBar  = document.getElementById('seek-slider'),
		currentTime  = document.getElementById('current-time');
		const maxAudioProgress = progressBar.max;
		/* Update total-time */
		audio.ondurationchange = () => {
			if ( ! isNaN ( audio.duration ) ) {
				currentTime.textContent = convertTime( audio.duration );
			}
		}
		/* Play/pause audio. */
		pausePlayBtn.onclick = function () {
			if (audio.paused) {
				audio.play();
			} else {
				audio.pause();
			}
		}

		let playedFirstTime = false;
		audio.onplay = function () {
			pausePlayBtn.className = 'pause-icon';
			// Add ga event when the audio is played first time.
			if ( ! playedFirstTime ) {
				playedFirstTime = true;
				var article_click_id = $('#article_id').val();
				sendCustomGA4EventCode('article_audio_click', { article_id: article_click_id });
			}
			if (checkIsMobile() == false) {
				addEventListener( 'scroll', insertStickyPlayer );
			}
		}
		audio.onpause = function () {
			pausePlayBtn.className = 'play-icon';
		}
		/* Update progress */
		audio.ontimeupdate = function () {
			let audioProgress = audio.currentTime / audio.duration;
			progressBar.value = audioProgress * maxAudioProgress;
			currentTime.textContent = convertTime(audio.duration - audio.currentTime);
			progressBar.style.backgroundSize = (audioProgress * 100) + '%';
		}
		/* Change progess for audio. */
		progressBar.oninput = function () {
			audio.currentTime = this.value / maxAudioProgress * audio.duration;
		}
		/* Progress may not be 100% due to estimations in calculation. */
		progressBar.onended = function () {
			progressBar.nodeValue = maxAudioProgress;
		}
		/* Convert time to mm:ss */
		function convertTime(time) {
			/* Get minutes and seconds. */
			var s = parseInt(time % 60);
			var m = parseInt((time / 60) % 60);
			/* Add 0 if seconds less than 10*/
			if (s < 10) {
				s = '0' + s;
			}
			/* Add 0 if minutes less than 10. */
			if (m < 10) {
				m = '0' + m;
			}
			return m + ':' + s;
		}
		
		// Script for sticky player only for desktop.
		if (window.innerWidth > 480) {
			const audioPlayer = document.getElementsByClassName('audio-player-tts')[0],
				  audioPlayerTop = audioPlayer.offsetTop;
			// Pause the audio, remove event & the player on closing the player.
			document.getElementById('audio-close-btn').onclick = () => { 
				audio.pause();
				removeEventListener( 'scroll', insertStickyPlayer );
				audioPlayer.classList.remove('audioPlayerSticky');
			}
			// Handle adding & removal of sticky audio player.
			function insertStickyPlayer(){
				// 45px is the height of fixed navbar. Added to make the transition smooth.
				if ( this.window.scrollY + 45 >= audioPlayerTop+580 ) {
					audioPlayer.classList.add('audioPlayerSticky');

				} else {
					audioPlayer.classList.remove('audioPlayerSticky');
				}
			}
		}
	}
}

function sendCustomGA4EventCode(eventName, params = {}) {
	if (typeof gtag === 'function') {
	  gtag('event', eventName, params);
	  console.log("GA4 Event sent:", eventName, params);
	} else {
	  console.warn("GA4 gtag function not found!");
	}
}