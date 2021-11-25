function confirmUrl(url, msg){
	if(confirm(msg? msg : 'Are you sure you want to perform action?')){
		window.location = url;
	}
}