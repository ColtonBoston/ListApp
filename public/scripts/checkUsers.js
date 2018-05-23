var usernameInput = $("#register-username"),
    newUsernameMsg = $("#new-username-msg"),
    validationAjax,
    validationTimer;

usernameInput.on("input", function(event){
  var username = $(this)[0].value;

  resetUsernameField();
  clearTimeout(validationTimer);
  
  if (regexUsername().test(username)){
    if (username.length >= 3 && username.length <= 20){
      validationTimer = setTimeout(function(){
        validationAjax = $.ajax({
          type: "GET",
          url: "/checkUsers",
          data: {username},
          beforeSend: function(){
            // Cancel the previous ajax request if one exists when a new request is sent
            if (validationAjax && validationAjax != "ToCancelPrevReq" && validationAjax.readyState < 4){
              validationAjax.abort();
            }
          },
          success: function(res){
            if (res === "User not found."){
              showValid("Username available!");
            } else {
              showInvalid("Username already taken.");
            }
          },
          error: function(res){
          }
        });
    }, 500);
    } else {
      if (username.length > 20){
        showInvalid("Username too long.");
      } else {
        resetUsernameField();
      }
    }
  } else if (username.length > 0){
    showInvalid("Invalid username.");
  }
});
function checkUsers(){

}

function resetUsernameField(){
  usernameInput.removeClass("valid invalid");
  newUsernameMsg.addClass("hidden");
}

function showValid(message){
  newUsernameMsg[0].innerHTML = message;
  newUsernameMsg.removeClass("invalid-msg");
  newUsernameMsg.removeClass("hidden");
  usernameInput.removeClass("invalid");
  usernameInput.addClass("valid");
}

function showInvalid(message){
  newUsernameMsg[0].innerHTML = message;
  newUsernameMsg.addClass("invalid-msg");
  newUsernameMsg.removeClass("hidden");
  usernameInput.addClass("invalid");
  usernameInput.removeClass("valid");
}

function regexUsername() {
  return /^[\w\-]+$/;
}
