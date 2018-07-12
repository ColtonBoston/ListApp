var searchResults = $(".search-results"),
    searchTimer,
    searchAjax;

$("#search-bar").on("keyup", function(event){
  var search = this.value.split(" ").join(""),
      usersList = $("#users-list");

  clearTimeout(searchTimer);

  if (search !== ""){
    searchTimer = setTimeout(function(){
      searchAjax = $.ajax({
        type: "GET",
        url: "/users/searchjson/" + search,
        dataType: "json",
        beforeSend: function(){
          // Cancel the previous ajax request if one exists when a new request is sent
          if (searchAjax && searchAjax != "ToCancelPrevReq" && searchAjax.readyState < 4){
            searchAjax.abort();
          }
        },
        success: function(users){
          if (users.length > 0){
            // Reset users search list to empty
            usersList.html("");
            users.forEach(function(user){
              var index = currentUser.friends.indexOf(user._id);
              // If currentUser has this user as a friend, show remove friend button
              if (currentUser && currentUser.friends.indexOf(user._id) > -1){
                usersList.append("<li class='list-group-item li-user'><span class='li-user-username'><a href='/users/profile/" + user._id + "'>" + user.username + "</a></span><button class='btn-friend btn btn-danger btn-sm pull-right' type='submit' data-user-id='" + user._id + "'>Remove Friend</button></li>");
                searchResults.removeClass("hide-search-results");
              } else if (user._id === currentUser._id){
                // Do nothing if this user is the currentUser
              } else {
                // If this user is not already a friend of the currentUser, show add friend button
                usersList.append("<li class='list-group-item li-user'><span class='li-user-username'><a href='/users/profile/" + user._id + "'>" + user.username + "</a></span><button class='btn-friend btn btn-primary btn-sm pull-right type='submit' data-user-id='" + user._id + "'>Add Friend</button></li>");
                searchResults.removeClass("hide-search-results");
              }
            });
          } else {
            usersList.html("");
            searchResults.addClass("hide-search-results");
          }
        }
      });
    }, 500);
  } else {
    usersList.html("");
    searchResults.addClass("hide-search-results");
  }
});

$("#users-list").on("click", ".btn-friend", function(event){
  var url,
      action,
      actionText,
      clickedBtn = $(this),
      friendId = clickedBtn[0].dataset.userId,
      index;

  if (clickedBtn[0].innerHTML === "Add Friend"){
    action = "/addFriend/";
    actionText = "Remove Friend";
  } else {
    action = "/removeFriend/";
    actionText = "Add Friend";
  }

  url = action + friendId;

  index = currentUser.friends.indexOf(friendId);

  $.ajax({
    type: "post",
    url: url,
    success: function(){
      clickedBtn[0].innerHTML = actionText;
      clickedBtn.toggleClass("btn-primary btn-danger");

      if (action === "/addFriend/"){
        // Add friend to local currentUser.friends
        currentUser.friends.push(friendId);
      } else {
        // Remove friend from local currentUser.friends
        currentUser.friends.splice(index, 1);
      }
    }
  });
});

$("#btn-hide-results").click(function(){
  searchResults.addClass("hide-search-results");
});
