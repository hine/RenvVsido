(function() {

  var ws = new WebSocket("ws://localhost:8888/ws");

  ws.onopen = function() {
    // WebSocketオープン時の挙動を書く
  };

  ws.onmessage = function (evt) {
    // WebSocketでメッセージを受け取った時の処理をまとめて
    try {
      var messageData = JSON.parse(evt.data);
      parseMessage(messageData);
    } catch(e) {
      alert('受け取ったメッセージの形式が不正です [message]:' + messageData['message']);
    }
  };

  $('#robot-connect').on('click', function() {
    if ($('#serial-port').val() == '') {
      alert("シリアルポートを指定してください。");
    } else {
      ws.send(JSON.stringify({command: "robot_connect", port: $('#serial-port').val()}));
    }
  });

  $('#robot-disconnect').on('click', function() {
    ws.send(JSON.stringify({command: "robot_disconnect"}));
  });

  $('#save-json').on('click', function() {
    try {
      jsonData = JSON.parse($('#json-data').val());
      ws.send(JSON.stringify({command: "set_motion_command", json_data: jsonData}));
    } catch(e) {
      alert("JSONの構文が間違っています")
    }
  });

  $('#renv-connect').on('click', function() {
    if ($('#websocket').val() == '') {
      alert("websocketを指定してください。");
    } else {
      ws.send(JSON.stringify({command: "renv_connect", websocket: $('#websocket').val()}));
    }
  });

  $('#renv-disconnect').on('click', function() {
    ws.send(JSON.stringify({command: "renv_disconnect"}));
  });

  $('#json-data').on('change keyup', function() {
    buttonEnable($('#save-json'));
  });

  var json = {};

  function parseMessage(messageData) {
    // WebSocketで受け取ったJSONメッセージの処理
    message = messageData['message']
    if (message == 'robot_connected') {
      $('#serial-port').prop("disabled", true);
      buttonDisable($('#robot-connect'));
      buttonEnable($('#robot-disconnect'));
      alert('ロボットに接続されました。');
    }
    if (message == 'robot_cannot_connect') {
      alert('ロボットに接続出来ませんでした。シリアルポートの確認をしてください。');
    }
    if (message == 'robot_disconnected') {
      $('#serial-port').prop("disabled", false);
      buttonEnable($('#robot-connect'));
      buttonDisable($('#robot-disconnect'));
    }
    if (message == 'motion_command') {
      json = messageData['json_data'];
      printJSON();
      buttonEnable($('#save-json'));
      $('#editor').jsonEditor(json, { change: updateJSON, propertyclick: showPath });
      $('#json-data').change(function() {
        var val = $('#json-data').val();
        if (val) {
          try {
            json = JSON.parse(val);
          }
          catch (e) {
            alert('Error in parsing json. ' + e);
          }
        } else {
          json = {};
        }
        $('#editor').jsonEditor(json, { change: updateJSON, propertyclick: showPath });
      });
      $('#expander').click(function() {
        var editor = $('#editor');
        editor.toggleClass('expanded');
        $(this).text(editor.hasClass('expanded') ? 'Collapse' : 'Expand all');
      });
    }
    if (message == 'renv_connected') {
      buttonDisable($('#renv-connect'));
      buttonEnable($('#renv-disconnect'));
      alert('R-env(連舞)に接続されました');
    }
    if (message == 'renv_cannot_connect') {
      alert('R-env(連舞)に接続出来ませんでした。Scratchの起動と遠隔センサーの設定の確認をしてください。');
    }
    if (message == 'renv_disconnected') {
      buttonEnable($('#renv-connect'));
      buttonDisable($('#renv-disconnect'));
    }
  }

  function buttonEnable(button) {
    button.prop("disabled", false);
    button.prop("className", "button");
  }

  function buttonDisable(button) {
    button.prop("disabled", true);
    button.prop("className", "button-disable");
  }

  function printJSON() {
    $('#json-data').val(JSON.stringify(json, null, '  '));
  }

  function updateJSON(data) {
      json = data;
      printJSON();
  }

  function showPath(path) {
    $('#path').text(path);
  }

})();
