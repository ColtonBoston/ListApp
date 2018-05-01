searchResults = $(".search-results");

$("#search-bar").on("keyup", function(event){
  var search = this.value.split(" ").join(""),
      usersList = $("#users-list");

  if (search !== ""){
    $.ajax({
      type: "GET",
      url: "/users/searchjson/" + search,
      dataType: "json",
      success: function(users){
        console.log(currentUser);
        if (users.length > 0){
          // Reset users search list to empty
          usersList.html("");
          users.forEach(function(user){
            var index = currentUser.friends.indexOf(user._id);
            console.log(currentUser.friends.indexOf(user._id) > -1);
            // If currentUser has this user as a friend, show remove friend button
            if (currentUser && currentUser.friends.indexOf(user._id) > -1){
              usersList.append("<li class='list-group-item users-search-li'><span class='user-text'>" + user.username + "</span><button class='btn-friend btn btn-danger btn-sm pull-right' type='submit' data-user-id='" + user._id + "'>Remove Friend</button></li>");
              searchResults.removeClass("hide-search-results");
            } else if (user._id === currentUser._id){
              // Do nothing if this user is the currentUser
            } else {
              // If this user is not already a friend of the currentUser, show add friend button
              usersList.append("<li class='list-group-item users-search-li'><span class='user-text'>" + user.username + "</span><button class='btn-friend btn btn-primary btn-sm pull-right type='submit' data-user-id='" + user._id + "'>Add Friend</button></li>");
              searchResults.removeClass("hide-search-results");
            }
          });
        } else {
          usersList.html("");
          searchResults.addClass("hide-search-results");
        }
      }
    });
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

  console.log(clickedBtn[0].innerHTML);
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
      console.log("Friends list update successful");
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

  $("#search-bar").focus();
});

$("#btn-hide-results").click(function(){
  searchResults.addClass("hide-search-results");
});
