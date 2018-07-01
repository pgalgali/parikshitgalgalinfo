"use strict";

      var CLIENT_ID = '124753688845-fmtbtheaqhlalo7dgrvuqbhnf8dctkij.apps.googleusercontent.com';

      var SCOPES = ['https://www.googleapis.com/auth/drive'];

      /**
       * Check if current user has authorized this application.
       */
      function checkAuth() {
        gapi.auth.authorize({'client_id': CLIENT_ID, 'scope': SCOPES.join(' '), 'immediate': true}, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        document.getElementById("body-div").style["display"] = "none";
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          authorizeDiv.style.display = 'none';
          document.getElementById("body-div").style["display"] = "block";
          loadDriveApi();
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          authorizeDiv.style.display = 'inline';
        }
      }

      /**
       * Initiate auth flow in response to user clicking authorize button.
       *
       * @param {Event} event Button click event.
       */
      function handleAuthClick(event) {
        gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
        return false;
      }

      /**
       * Load Drive API client library.
       */
      function loadDriveApi() {
        gapi.client.load('drive', 'v3', listFiles);
      }

      /**
       * Delete a file.
       */
      function deleteFile(){
      	var request = gapi.client.drive.files.delete({
      		'fileId': document.getElementById("file_id").value
      	});
      	request.execute(listFiles);
      }
       /**
       * copy file.
       */
       function copyFile(){
       	var request = gapi.client.drive.files.copy({
       		'fileId': document.getElementById("file_id").value
       	});
       	request.execute(listFiles);
       }

      /**
       * list files.
       */
      function listFiles() {
        var request = gapi.client.drive.files.list({
            'pageSize': document.querySelector("#nr-of-files").value,
            'q': "'root' in parents",
            'orderBy' : "folder, name",
            'fields': "nextPageToken, files(id, name, mimeType, parents, webViewLink, webContentLink)"
          });

        document.getElementById('output').innerHTML = "";

        request.execute(function(resp) {
          console.log(resp);
            var files = resp.files;
            if (files && files.length > 0) {
              for (var i = 0; i < files.length; i++) {
                var file = files[i];
                appendDiv(file.name, file.id, file.mimeType);
                //console.log("filename: " + file.name + " parent: " + file.parents);
                //console.log(file.mimeType);

              }

            }
          });
      }

      /**
       * download file
       */

      function downloadFile(){
         //if(mimeType == "application/vnd.google-apps.document")
            var request = gapi.client.drive.files.get({
              'fileId': document.getElementById("file_id").value,
              'fields': "name,id,mimeType,webContentLink"

            });

            request.execute(function(resp){
                console.log(resp);
                if(resp.mimeType === "application/vnd.google-apps.document")
                  window.open("https://docs.google.com/document/export?format=" + "pdf" + "&id=" + resp.id);
                else if(resp.mimeType === "application/vnd.google-apps.presentation")
                  window.open("https://docs.google.com/presentation/d/" + resp.id + "/export/pdf" + "?id=" + resp.id);
                else if(resp.mimeType === "application/vnd.google-apps.spreadsheet")
                  window.open("https://docs.google.com/spreadsheets/d/" + resp.id + "/export");
                else if(resp.webContentLink)
                  window.open(resp.webContentLink);
            });

        }

        /**
         *   view file
         *   Opens google webview to view the file
         */
      function viewFile(){
      var request = gapi.client.drive.files.list({
          'q': "name = '" + document.getElementById("file_name").value + "'",
          'fields': "files(webViewLink)"
        });

       request.execute(function(resp){
        console.log(resp);
          var link = resp.files[0].webViewLink;
        window.open(link, '_blank');

       })
      }

       /**
         *   fill id and name
         */

      function fillIdAndNameInput(event){
      	var fileId = event.target.getAttribute("data-file_id");
        console.log(fileId);
        var fileName = event.target.getAttribute("data-file_name");
      	document.getElementById("file_id").setAttribute("value", fileId);
        document.getElementById("file_name").setAttribute("value", fileName);
      }

       /**
         *   function for handling
         */

      function listFolderFiles(event){
        var fileId = event.target.getAttribute("data-file_id");
        var request = gapi.client.drive.files.list({
            'pageSize': document.querySelector("#nr-of-files").value,
            'q': "'"+fileId+"'"+ " in parents",
            'orderBy' : "folder, name",
            'fields': "nextPageToken, files(id, name, mimeType, parents, webViewLink, webContentLink)"
          });

        document.getElementById('output').innerHTML = "";


        request.execute(function(resp) {
          console.log(resp);
            var files = resp.files;
            if (files && files.length > 0) {
              for (var i = 0; i < files.length; i++) {
                var file = files[i];
                appendDiv(file.name, file.id, file.mimeType);
                //console.log("filename: " + file.name + " parent: " + file.parents);
                //console.log(file.mimeType);
              }
            }
          });
      }
      /**
       * Append a div element to the body containing the given message
       * as its text node.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendDiv(message, file_id, mime_type) {
        var view = document.getElementById('output');
        var newContent = document.createTextNode(message + '\n');
        var newDiv = document.createElement("div");
        var newImg = document.createElement("img");
        newImg.setAttribute("class", "file_icons");
        newImg.setAttribute("data-file_id", file_id);
        newImg.setAttribute("data-file_name", message);
        newImg.setAttribute("draggable", "true");
        newImg.addEventListener('dragstart', dragstart_handler);
        //newImg.addEventListener('dragleave', handleDragLeave);
        var p = document.createElement("p");
        p.appendChild(newContent);
        newDiv.setAttribute("class", "file");
        switch(mime_type){
        	case "application/vnd.google-apps.document":
        		newImg.setAttribute("src", "icons/1460722625_word.svg");
        		break;
          case "application/vnd.google-apps.presentation":
            newImg.setAttribute("src", "icons/1460722628_powerpoint.svg");
            break;
        	case "application/vnd.google-apps.folder":
        		newImg.setAttribute("src", "icons/1460722935_folder.svg");
            newImg.addEventListener("dblclick", listFolderFiles);
        		break;
          case "application/vnd.google-apps.spreadsheet":
            newImg.setAttribute("src", "icons/1460722621_excel.svg");
            break;
          case "application/pdf":
            newImg.setAttribute("src", "icons/1460722630_pdf.svg");
            break;
          case "image/jpeg":
            newImg.setAttribute("src", "icons/1460722632_image.svg");
            break;
        	default:
        		newImg.setAttribute("src", "icons/ic_warning_black_48px.svg");

        }
        newImg.addEventListener("click", fillIdAndNameInput);
        //newDiv.appendChild(newContent);
        view.appendChild(newDiv);
        newDiv.appendChild(newImg);
        newDiv.appendChild(p);
      }


 // Drag&Drop
 function dragstart_handler(ev) {
 //ev.currentTarget.style.border = "dashed";
 ev.dataTransfer.setData("text/plain", ev.target.getAttribute("data-file_id"));
}

/*function handleDragLeave(ev) {
  ev.preventDefault();
  ev.currentTarget.style.border = "none";
}*/

function dragover_handler(ev) {
 ev.preventDefault();
}

function drop_handler(ev) {
 ev.preventDefault();
 var data = ev.dataTransfer.getData("text");
// console.log(data);
// var element = document.querySelector("[data-file_id="+"'"+data+"'");
// console.log(element);
 document.getElementById("file_id").setAttribute("value", data);
 deleteFile();
 ev.dataTransfer.clearData();

}