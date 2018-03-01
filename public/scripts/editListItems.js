var list = $("#list"),
    isEditable = false,
    timer;

$("#btn-add-item").removeClass("hidden");

$("#btn-add-item").click(function(event){
    event.preventDefault();
    $("#new-item-input").focus();
});

// Edit list button clicked
$("#btn-edit-item").click(function(event){
    event.preventDefault();
    isEditable = !isEditable;
    isEditable ? $(this)[0].innerHTML = "<i class='glyphicon glyphicon-ok'></i> Finish Editing" : $(this)[0].innerHTML = "<i class='glyphicon glyphicon-edit'></i> Edit List";

    $(".list-group-item").each(function(i, li){
      if (!$(this)[0].classList.contains("completed-item")) {
        $(this).find(".list-item-text").toggleClass("js_hidden");
        $(this).find(".edit-item-form").toggleClass("js_hidden");
      }
    });
    $(".delete-form").toggleClass("js_hidden");
    $(".delete-list-form").toggleClass("js_hidden");
});

$("#btn-new-item").click(function(){
  $("#new-item-input").focus();
})

// Add list item
$("#new-item-form").submit(function(event){
  event.preventDefault();
  var input = $(this)[0].elements["item[name]"],
      newItemName = input.value,
      url = $(this)[0].action;

  var item = {
    name: newItemName
  }

  // Notify user that the item is being added (for slower connections)
  notifyUser("Adding...", false);
  $.ajax({
    type: "POST",
    url: url,
    data: {item},
    success: function(data){
      var li = $(data).find("#list")[0].lastElementChild;

      if (isEditable){
        // Show the forms if the list is in edit mode
        $.each(li.children, function(i, elem){
          elem.classList.remove("js_hidden");
        });
        // Hide the item text since the input is visible
        li.firstElementChild.classList.add("js_hidden");
      }
      list.append(li);
      input.value = "";
      if (item.name.length < 15){
        notifyUser("\"" + item.name + "\" added!", true);
      } else {
        notifyUser("\"" + item.name.slice(0, 15) + "...\" added!", true);
      }
    },
    error: function(){
      notifyUser("Failed to add item.", true);
    }
  });

  document.activeElement.blur();
});

var initialInputVal;
list.on("focus", ".list-item-input", function(event){
  initialInputVal = $(this)[0].value;
});

var hasItemUpdated = false;
// Update list item on submitting the form
list.on("submit", ".edit-item-form", function(event){
  event.preventDefault();
  updateListItem($(this));
  hasItemUpdated = true;
  document.activeElement.blur();
});

// Update list item on the form losing focus
list.on("blur", ".edit-item-form", function(event){
  if (!hasItemUpdated){
    updateListItem($(this));
  } else {
    hasItemUpdated = false;
  }
});

// Delete list item
list.on("click", ".btn-delete-item", function(event){
  event.preventDefault();
  deleteListItem($(this));
});

list.on("click", ".list-group-item", function(event){
  if (!isEditable){
    $(this).toggleClass("completed-item");
    $(this).find(".item-added-by").toggleClass("faded");
  }
});

function updateListItem(form){
  // Get the action of the form and the value of the form's input
  var url = form[0].action,
      item = form[0].children[0].value;

  // Updates the list item in the db if the value has changed. Resets the input
  // to before it was focused if the value is empty
  if (item !== initialInputVal && item !== ""){
    // Notify user that the item is being updated (for slower connections)
    notifyUser("Updating...", false);
    $.ajax({
      type: "POST",
      url: url,
      data: {item},
      success: function(){
        form[0].previousElementSibling.innerHTML = item;
        if (item.length < 15){
          notifyUser("\"" + item + "\" updated!", true);
        } else {
          notifyUser("\"" + item.slice(0, 15) + "...\" updated!", true);
        }
      },
      error: function(){
        notifyUser("Failed to update item.", true);
        form[0].children[0].value = initialInputVal;
      }
    });
  } else {
    form[0].children[0].value = initialInputVal;
  }
}

function deleteListItem(form){

  var url = form[0].parentElement.action;

  // Notify user that the item is being removed (for slower connections)
  notifyUser("Removing...", false);
  form[0].offsetParent.classList.add("slide-left");

  // Deletes the list item from the db and removes the corresponding li from the ul
  $.ajax({
    type: "POST",
    url: url,
    success: function(data){
      if (data){
        var item = form[0].offsetParent.firstElementChild.innerHTML;
        if (item.length < 15){
          notifyUser("\"" + item + "\" removed!", true);
        } else {
          notifyUser("\"" + item.slice(0, 15) + "...\" removed!", true);
        }
        setTimeout(function(){
          form[0].offsetParent.remove();
        }, 220);
      } else {
        notifyUser("Failed to remove item.", true);
        form[0].offsetParent.classList.remove("slide-left");
      }
    },
    error: function(){
      notifyUser("Failed to remove item.", true);
      form[0].offsetParent.classList.remove("slide-left");
    }
  });
}

function notifyUser(message, isComplete){
  clearTimeout(timer);
  var notification = $(".notification");
  $(".notification-message")[0].innerHTML = message;
  notification.addClass("notification-slider");
  notification.removeClass("notification-success");
  if (isComplete) {
    notification.addClass("notification-success");
    timer = setTimeout(function(){
      notification.removeClass("notification-slider");
    }, 3000);
  }
}
