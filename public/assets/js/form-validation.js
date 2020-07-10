$(document).ready(function(){
    $('#insert').click(function(){
         var image_name = $('#image').val();
         if(image_name == '')
         {
              alert("Please Select Image");
              return false;
         }
         else
         {
              var extension = $('#image').val().split('.').pop().toLowerCase();
              if(jQuery.inArray(extension, ['gif','png','jpg','jpeg']) == -1)
              {
                   alert('Invalid Image File');
                   $('#image').val('');
                   return false;
              }
         }
    });
    $("#msform").on("submit",function(e) {
        if (!isValidEmailAddress($("#email").val())) return false;
      if ($("#pass").val()!==$("#cpass").val()) {
           alert("Passwords don't match");
           return false;
       }
       return true;
    });
  //   $('#sbmt').click(function() {
  //     var user,pass,email,dob,image,phone;
  //     if ($("#pass").val()!==$("#cpass").val()) {
  //         alert("Passwords don't match");
  //         return;
  //     }
  //     user = $("#name").val();
  //     pass = $("#pass").val();
  //     email = $("#email").val();
  //     dob = $("#dob").val();
  //     image = $("#image").val();
  //     phone = $("#phone").val();
  //     $.post("http://localhost:1215/saveUser",{
  //         user: user,
  //         password: pass,
  //         email: email,
  //         dob : dob,
  //         image : image,
  //         phone : phone
  //     });
  //     console.log("Confirm Kill");
  //   });
  });


function preview_image(event)
{
var reader = new FileReader();
reader.onload = function()
{
 var output = document.getElementById('output_image');
 output.src = reader.result;
}
reader.readAsDataURL(event.target.files[0]);
}


function isValidEmailAddress(email) {
   var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
   return pattern.test(email);
}

function validatePassword() {
   var validator = $("#register-form").validate({
       rules: {
           pass: "required",
           cpass: {
               equalTo: "#pass"
           }
       },
       messages: {
           pass: " Enter Password",
           cpass: "Must match with Password"
       }
   });
   if (validator.form()) {
       alert('Form is Validated');
   }
}
