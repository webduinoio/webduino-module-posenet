Blockly.Blocks['posenet_init'] = {
  init: function() {
    this.appendValueInput("input")
        .setCheck("String")
        .appendField(Blockly.Msg.WA_PosnetInit)
        .appendField(Blockly.Msg.WA_PosnetInit_Duel)
        .appendField(new Blockly.FieldCheckbox("FALSE"), "duel");
    this.setOutput(false, null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['posenet_get_result'] = {
  init: function() {
    let person = [
      ['1', '0'],
      ['2', '1'],
    ];

    let poses = [
      ['nose', '0'],
      ['leftEye', '1'],
      ['rightEye', '2'],
      ['leftEar', '3'],
      ['rightEar', '4'],
      ['leftShoulder', '5'],
      ['rightShoulder', '6'],
      ['leftElbow', '7'],
      ['rightElbow', '8'],
      ['leftWrist', '9'],
      ['rightWrist', '10'],
      ['leftHip', '11'],
      ['rightHip', '12'],
      ['leftKnee', '13'],
      ['rightKnee', '14'],
      ['leftAnkle', '15'],
      ['leftAnkle', '16'],
    ];

    let valname = [
      [Blockly.Msg.WA_Posnet_PosX, 'x'],
      [Blockly.Msg.WA_Posnet_PosY, 'y'],
      [Blockly.Msg.WA_Posnet_Score, 'score']
    ];
    this.appendDummyInput()
        .appendField(Blockly.Msg.WA_Posnet_Get_Result1)
        .appendField(new Blockly.FieldDropdown(person), "person")
        .appendField(Blockly.Msg.WA_Posnet_Get_Result2)
        .appendField(new Blockly.FieldDropdown(poses), "pose")
        .appendField(Blockly.Msg.WA_Posnet_Get_Result3)
        .appendField(new Blockly.FieldDropdown(valname), "valname")
        .appendField(Blockly.Msg.WA_Posnet_Get_Result4);
    this.setOutput(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};

Blockly.Blocks['posenet_camera_input'] = {
  init: function() {
    let res = [
      ['320x240', '320x240'],
      ['640x480', '640x480'],
      ['800x600', '800x600'],
      ['1280x720', '1280x720'],
      ['1920x1080', '1920x1080'],
    ];

    this.appendDummyInput()
        .appendField(Blockly.Msg.WA_Posnet_Camera)
        .appendField(new Blockly.FieldDropdown(this.generateOptions), "NAME")
        .appendField(Blockly.Msg.WA_Posnet_Camera_Resolution)
        .appendField(new Blockly.FieldDropdown(res), "NAME2")
        .appendField(Blockly.Msg.WA_Posnet_Camera_Mirror)
        .appendField(new Blockly.FieldCheckbox("FALSE"), "NAME3");

    this.setOutput(true, "String");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },

  generateOptions: function() {
    (async function getCameras() {
      let devices = [];
      let deviceInfos = await navigator.mediaDevices.enumerateDevices();
      for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        if (deviceInfo.kind === 'videoinput') {
          devices.push([deviceInfo.label, deviceInfo.deviceId]);
        }
      }
      window.waposnetCameras = devices;
    })();

    let list = [
      [Blockly.Msg.WA_Posnet_Camera_Auto, 'auto'],
      [Blockly.Msg.WA_Posnet_Camera_MRear, 'mobile_rear'],
      [Blockly.Msg.WA_Posnet_Camera_MFront, 'mobile_front'],
    ];

    if (!window.waposnetCameras) {
      return list;
    } else {
      return list.concat(window.waposnetCameras);
    }
  }
};
