Blockly.JavaScript['posenet_init'] = function(block) {
  var value_input = Blockly.JavaScript.valueToCode(block, 'input', Blockly.JavaScript.ORDER_ATOMIC);
  var checkbox_duel = block.getFieldValue('duel') == 'TRUE';
  var code = 'await __WaPosenet__.init(' + value_input + ', ' + checkbox_duel + ');\n';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['posenet_camera_input'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  var dropdown_name2 = block.getFieldValue('NAME2');
  var checkbox_name3 = block.getFieldValue('NAME3') == 'TRUE';
  var output = JSON.stringify({
    source: 'webcam_' + dropdown_name,
    resolution: dropdown_name2,
    flipHorizontal: checkbox_name3,
  })
  var code = '\'' + output + '\'';
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.JavaScript['posenet_get_result'] = function(block) {
  var dropdown_person = block.getFieldValue('person');
  var dropdown_pose = block.getFieldValue('pose');
  var dropdown_valname = block.getFieldValue('valname');
  var code = '__WaPosenet__.getResult(' + dropdown_person + ',' + dropdown_pose + ',"' + dropdown_valname + '")';
  return [code, Blockly.JavaScript.ORDER_NONE];
};