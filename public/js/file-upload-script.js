$(function(){

    var ul = $('#upload ul');
	var allowedExtensions = ['.jpg', '.png', '.gif', '.bmp', '.jpeg']; // always specify in lower case
	var maxFileSizeMB = 2; //for how many MB;
	var $this = $('#upload');
    $('#drop a').click(function(){
        // Simulate a click on the file input button
        // to show the file browser dialog
        var i = $(this).parent().find('input');
		i.show();
		i.focus();
		i.click();
		i.hide();
    });

    // Initialize the jQuery File Upload plugin
    $('#upload').fileupload({

        // This element will accept file drag/drop uploading
        dropZone: $('#drop'),

        // This function is called when the upload is done succes or error
		done: function(e, data){
			var filename = data.files[0].name;
			var response = JSON.parse(data.result);
			var tag = $this.find('#file_info_tag').val();
			var status = $('span#file_status_' + tag);
			var img = $('img#file_thumb_' + tag);
			var input = $('input#file_input_' + tag);
			if(response.status == 'success'){
				if(tag == 'audio'){
					var audio = $('audio#audio_file');
					audio.html('');
					audio.append('<source src="' + response.filename + '" type="' + (response.filename.substr(response.filename.lastIndexOf('.')) == '.mp3'? 'audio/mpeg' : 'audio/wav') + '">');
					img.attr('src', 'images/audio.jpg');
				}else{
					img.attr('src', response.filename);
					$('#file_name_display').fadeIn();
				}
				status.text(filename);
				input.val(response.filename);
			}else{
				status.html(response.error);
				img.attr('src', '');
				input.val('');
			}
		},
		
        // This function is called when a file is added to the queue;
        // either via the browse button, or via drag/drop:
        add: function (e, data) {
			var fileName = data.files[0].name;
			var fileExt = fileName.substring(fileName.lastIndexOf('.'), fileName.length);
			//check for maximum file size
			if(data.files[0].size > maxFileSizeMB * 1024000){
	
				var tp = $('<li class="working"><input type="text" value="0" data-width="48" data-height="48"'+
					' data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span></li>');
	
				// Append the file name and file size
				tp.find('p').text('Error')
							 .append('<i>File size should not be larger than '+ maxFileSizeMB + ' MB</i>');
	
				// Add the HTML to the UL element
				//ul.empty(); //this is just to fake single upload, there should be a backend handle for that
				tp.appendTo(ul);
	
				// Initialize the knob plugin
				//tpl.find('input').knob();
	
				// Listen for clicks on the cancel icon
				tp.find('span').click(function(){
	
					tp.fadeOut(function(){
						tp.remove();
					});
	
				});
			}else if(inArray(fileExt, allowedExtensions)){
			// Check for file extension maybe its supported
			
	
				var tpl = $('<li class="working"><input type="text" value="0" data-width="48" data-height="48" data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span></li>'); 

				// Append the file name and file size
				tpl.find('p').text(fileName)
							 .append('<i>' + formatFileSize(data.files[0].size) + '</i>');
	
				// Add the HTML to the UL element
				ul.empty(); //this is just to fake single upload, there should be a backend handle for that
				data.context = tpl.appendTo(ul);
	
				// Initialize the knob plugin
				tpl.find('input').knob();
	
				// Listen for clicks on the cancel icon
				tpl.find('span').click(function(){
	
					if(tpl.hasClass('working')){
						jqXHR.abort();
					}
	
					tpl.fadeOut(function(){
						tpl.remove();
					});
	
				});
	
				// Automatically upload the file once it is added to the queue
				var jqXHR = data.submit();
			}else{
	
				var tp = $('<li class="working"><input type="text" value="0" data-width="48" data-height="48"'+
					' data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span></li>');
	
				// Append the file name and file size
				tp.find('p').text('Error')
							 .append('<i>\"' + fileExt + '\" format not supported</i>');
	
				// Add the HTML to the UL element
				//ul.empty(); //this is just to fake single upload, there should be a backend handle for that
				tp.appendTo(ul);
	
				// Initialize the knob plugin
				//tpl.find('input').knob();
	
				// Listen for clicks on the cancel icon
				tp.find('span').click(function(){
	
					tp.fadeOut(function(){
						tp.remove();
					});
	
				});
	
				// Automatically upload the file once it is added to the queue
				//var jqXHR = data.submit();
				// File extension not supported
			}
        },

        progress: function(e, data){

            // Calculate the completion percentage of the upload
            var progress = parseInt(data.loaded / data.total * 100, 10);

            // Update the hidden input field and trigger a change
            // so that the jQuery knob plugin knows to update the dial
            data.context.find('input').val(progress).change();

            if(progress == 100){
                data.context.removeClass('working');
            }
        },

        fail:function(e, data){
            // Something has gone wrong!
            data.context.addClass('error');
        }

    });


    // Prevent the default action when a file is dropped on the window
    $(document).on('drop dragover', function (e) {
        e.preventDefault();
    });

    // Helper function that formats the file sizes
    function formatFileSize(bytes) {
        if (typeof bytes !== 'number') {
            return '';
        }

        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }

        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }

        return (bytes / 1000).toFixed(2) + ' KB';
    }
	
	// Added by me to check the extensions
	function inArray(needle, haystack) {
		var length = haystack.length;
		for(var i = 0; i < length; i++) {
			if(haystack[i] == needle.toLowerCase()) return true;
		}
		return false;
	}

});