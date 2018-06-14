var usernameInput = $("#register-username"),
    newUsernameMsg = $("#new-username-msg"),
    invalidEmailMsg = $("#invalid-email-msg"),
    emailInput = $("#register-email"),
    usernameObj = {},
    emailObj = {};

usernameInput.on("input", function(event){
  var username = $(this)[0].value;

  resetUsernameField();
  clearTimeout(usernameObj.validationTimer);

  if (regexUsername().test(username)){
    if (username.length >= 3 && username.length <= 20){
      usernameObj.validationTimer = setTimeout(function(){
        // Searches the db to check if a username is taken
        usernameObj.validationAjax = $.ajax({
          type: "GET",
          url: "/checkUsers",
          data: {
            username: username
          },
          beforeSend: function(){
            // Cancel the previous ajax request if one exists when a new request is sent
            if (usernameObj.validationAjax && usernameObj.validationAjax != "ToCancelPrevReq" && usernameObj.validationAjax.readyState < 4){
              usernameObj.validationAjax.abort();
            }
          },
          success: function(res){
            if (res === "User not found."){
              showValid("Username available!");
            } else {
              showInvalid("Username taken.");
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

emailInput.on("blur", function(event){
  var email = $(this)[0].value;

  invalidEmailMsg.addClass("hidden");
  clearTimeout(emailObj.validationTimer);

  if (regexEmail().test(email)){
    emailObj.validationTimer = setTimeout(function(){
      // Searches the db to check if the email address already belongs to an account.
      emailObj.validationAjax = $.ajax({
        type: "GET",
        url: "/checkUsers",
        data: {
          email: email
        },
        beforeSend: function(){
          // Cancel the previous ajax request if one exists when a new request is sent
          if (emailObj.validationAjax && emailObj.validationAjax != "ToCancelPrevReq" && emailObj.validationAjax.readyState < 4){
            emailObj.validationAjax.abort();
          }
        },
        success: function(res){
          if (res === "That user exists."){
            invalidEmailMsg.removeClass("hidden");
          }
        },
        error: function(res){
        }
      });
    }, 500);
  }
});

// Toggle visibility  of password text
$(".show-password-chk").click(function(event){
  var isChecked = $(this)[0].checked;
  if (isChecked){
    $("#register-password")[0].type = "text";
  } else {
    $("#register-password")[0].type = "password";
  }
});

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

// Regex to test if a username only has valid characters
function regexUsername() {
  return /^[\w\-]+$/;
}

// Regex to test if an email has at least 1 ampersand and 1 period
function regexEmail() {
  return /(?=.*@)(?=.*\.).+/;
}
