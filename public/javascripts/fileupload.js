// This is a script that shows user which file they have selected
$(document).on('change', ':file', function(event) {
  var input = $(this),
      numFiles = input.get(0).files ? input.get(0).files.length : 1,
      label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

  // get a HTML DOM Object from jQuery object
  var img = $('#default-profile').get(0);
  img.src = URL.createObjectURL(event.target.files[0]);
  // display the image name in the label box
  $('#file-description').val(label);
});

