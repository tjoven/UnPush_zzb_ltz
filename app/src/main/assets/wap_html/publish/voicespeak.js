$(function(){
	$("#speakButton").attr("speak_status","朗读");
	$("#speakButton").css("background","url('../img/start_speak.png') no-repeat");
	
	$("#speakButton").click(function(){
		var $this = $(this);
		if (isAndriod) {
			if ("朗读" == $this.attr("speak_status")) {
				var str = $("#ggnr_content").text();
				window.webview.startSpeaking(str);
				$this.attr("speak_status","暂停");
				$this.css("background","url('../img/stop_speak.png') no-repeat");
			} else if ("暂停" == $this.attr("speak_status")) {
				window.webview.pauseSpeaking();
				$this.attr("speak_status","继续");
				$this.css("background","url('../img/start_speak.png') no-repeat");
			} else if ("继续" == $this.attr("speak_status")) {
				window.webview.resumeSpeaking();
				$this.attr("speak_status","暂停");
				$this.css("background","url('../img/stop_speak.png') no-repeat");
			}
		}
	});
});

function onSpeakCompleted(){
	$("#speakButton").attr("speak_status","朗读");
	$("#speakButton").css("background","url('../img/start_speak.png') no-repeat");
}
