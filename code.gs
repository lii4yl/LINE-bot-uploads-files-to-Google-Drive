// ----------------------------------------------------------
// File: code.gs
// Author: 
// Created: 2024-05-18
// Description: Brief description of what this file does
// ----------------------------------------------------------

// © 2024 Your Name
// All rights reserved.

// This document is the property of Your Name and may not be reproduced,
// distributed, or used without explicit permission from the author.

// If you wish to reuse or distribute this document, you must provide
// appropriate credit to the author: [Sanpath Sunggad](https://github.com/lii4yl/lii4yl.git).
  
var channelToken = "REPLACE_WITH_YOUR_CHANNEL_ACCESS_TOKEN";
var gdrivefolderImageId = "REPLACE_WITH_YOUR_FOLDER_ID";
var gdrivefolderVideoId = "REPLACE_WITH_YOUR_FOLDER_ID";
var gdrivefolderAudioId = "REPLACE_WITH_YOUR_FOLDER_ID";
var gdrivefolderPDFId = "REPLACE_WITH_YOUR_FOLDER_ID";
var gdrivefolderWordId = "REPLACE_WITH_YOUR_FOLDER_ID";
var gdrivefolderExcelId = "REPLACE_WITH_YOUR_FOLDER_ID";
var gdrivefolderPowerPointId = "REPLACE_WITH_YOUR_FOLDER_ID";


function replyMsg(replyToken, mess, channelToken) {
  var url = 'https://api.line.me/v2/bot/message/reply';
  var opt = {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + channelToken,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': mess
    })
  };
  UrlFetchApp.fetch(url, opt);
}

function toDrive(messageId, meType, mType, gdriveId, channelToken) {
  var url = "https://api-data.line.me/v2/bot/message/" + messageId + "/content";
  var headers = {
    "headers": { "Authorization": "Bearer " + channelToken }
  };
  var getcontent = UrlFetchApp.fetch(url, headers);
  var blob = getcontent.getBlob();
  var fileBlob = Utilities.newBlob(blob.getBytes(), meType, messageId + mType);
  var rid = DriveApp.getFolderById(gdriveId).createFile(fileBlob).getId();
  return 'https://drive.google.com/uc?id=' + rid;
}


function doPost(e) {
  var value = JSON.parse(e.postData.contents);
  var events = value.events;
  var event = events[0];
  var type = event.type;
  var replyToken = event.replyToken;
  var messageType = event.message.type;
  var messageId = event.message.id;

  switch (type) {
    case 'message':
      if (messageType == 'file') {
        var fileName = event.message.fileName;
        var fileType = fileName.split('.', 2)[1];
        var mimetype;
        var folderId;

        // Determine MIME type and folder ID
        switch (fileType) {
          case 'pdf':
            mimetype = 'application/pdf';
            folderId = gdrivefolderPDFId;
            break;
          case 'doc':
          case 'docx':
            mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            folderId = gdrivefolderWordId;
            break;
          case 'xls':
          case 'xlsx':
            mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            folderId = gdrivefolderExcelId;
            break;
          case 'ppt':
          case 'pptx':
            mimetype = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            folderId = gdrivefolderPowerPointId;
            break;
          case 'mp4':
            mimetype = 'video/mp4';
            folderId = gdrivefolderVideoId;
            break;
          case 'mp3':
            mimetype = 'audio/mpeg';
            folderId = gdrivefolderAudioId;
            break;
          case 'png':
          case 'jpg':
          case 'jpeg':
          case 'gif':
            mimetype = 'image/' + fileType;
            folderId = gdrivefolderImageId;
            break;
          default:
            mimetype = 'application/octet-stream';
            folderId = gdrivefolderId; // Default folder for unsupported file types
        }

        if (mimetype && folderId) {
          var url = toDrive(messageId, mimetype, '.' + fileType, folderId, channelToken);
          var mess = [{ 'type': 'text', 'text': url }];
          replyMsg(replyToken, mess, channelToken);
        } else {
          var mess = [{ 'type': 'text', 'text': "ไม่รองรับไฟล์ประเภทนี้" }];
          replyMsg(replyToken, mess, channelToken);
        }
      }
      // Other message types handling...
      break;
    default:
      break;
  }
}
