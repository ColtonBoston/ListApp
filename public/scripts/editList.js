var list = $("#list"),
    isEditable = false,
    timer;

// Edit list button clicked
$("#btn-edit-item").click(function(event){
    event.preventDefault();
    isEditable = !isEditable;
    isEditable ? $(this)[0].innerHTML = "<i class='glyphicon glyphicon-ok'></i> Finish Editing" : $(this)[0].innerHTML = "<i class='glyphicon glyphicon-edit'></i> Edit List";

    $("#list-name").toggleClass("js_hidden");
    $("#list-name-form").toggleClass("js_hidden");
    $(".list-group-item").each(function(i, li){
      if (!$(this)[0].classList.contains("completed-item")) {
        $(this).find(".list-item-text").toggleClass("js_hidden");
        $(this).find(".edit-item-form").toggleClass("js_hidden");
      }
    });
    $(".delete-form").toggleClass("js_hidden");
    // $(".delete-list-form").toggleClass("js_hidden");
});

// Focus new item input on clicking new item button (fixed mobile button)
$("#btn-new-item").click(function(){
  $("#new-item-input").focus();
});

// Delete list button clicked
$("#btn-delete-list").click(function(event){
  if (confirm("This list will be deleted permanently. Are you sure?")){
    // List deleted
  } else {
    event.preventDefault();
  }
});

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
      // Get the new item's data from the response to create a new li
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
        notifyUser("\"" + item.name + "\" added!", true, true);
      } else {
        notifyUser("\"" + item.name.slice(0, 15) + "...\" added!", true, true);
      }
    },
    error: function(){
      notifyUser("Failed to add item.", true, false);
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
// list.on("blur", ".edit-item-form", function(event){
//   if (!hasItemUpdated){
//     updateListItem($(this));
//   } else {
//     hasItemUpdated = false;
//   }
// });

// Delete list item click handler
list.on("click", ".btn-delete-item", function(event){
  event.preventDefault();
  deleteListItem($(this));
});

// Toggle completion of list item
list.on("click", ".list-group-item", function(event){
  if (!isEditable){
    $(this).toggleClass("completed-item");
    $(this).find(".item-added-by").toggleClass("faded");
  }
});

// Show an item's options (edit/delete) when its options button is clicked
list.on("click", ".btn-item-options", function(event){
  var liNum = $(this)[0].id.split("-")[3],
      allOptionsLists = $(".item-options-list"),
      optionsList = $("#item-options-list-" + liNum),
      areOptionsHidden = optionsList.hasClass("hidden");

  // Prevent bubbling
  event.stopPropagation();

  // Hide options for all list item options
  allOptionsLists.addClass("hidden");

  // Shows the item's list options if they weren't already shown
  if (areOptionsHidden){
    optionsList.removeClass("hidden");
  }
});

// Toggle visibility of permissions
$(".permissions-header").on("click", function(event){
  $(".list-permissions").toggleClass("list-hidden");
  $("#permissions-toggle").toggleClass("glyphicon-menu-up")
});

// Add/Remove permission handler
$(".btn-permission").on("click", function(event){
  var btn = $(this),
      form = $(this)[0].parentElement,
      li = $(this)[0].offsetParent,
      glyphicon = $(this).find(".glyphicon"),
      permissionsLength = $(".permissions-length")[0];

  event.preventDefault();
  notifyUser("Updating permissions...", false);
  // Add or remove friend from list permissions array in db
  $.ajax({
    type: "POST",
    url: form.action,
    success: function(data){
      console.log("Successful change of permission");

      // Add or remove 1 from permissionsLength span
      if (btn.hasClass("btn-danger")){
        permissionsLength.innerHTML = parseInt(permissionsLength.innerHTML) - 1;
        notifyUser("Permission removed!", true, true);
      } else {
        permissionsLength.innerHTML = parseInt(permissionsLength.innerHTML) + 1;
        notifyUser("Permission added!", true, true);
      }

      // Move li and change classes to show if friend is permitted or not
      $(".list-permissions")[0].insertBefore(li, $(".unpermitted-friend")[0]);
      li.classList.toggle("unpermitted-friend");
      btn.toggleClass("btn-primary btn-danger");
      glyphicon.toggleClass("glyphicon-plus glyphicon-minus");

      // Toggle form action to .../addPermission/:id or .../removePermission/:id
      var actionSplit = form.action.split("/");
      actionSplit[5] = actionSplit[5] === "addPermission" ? "removePermission" : "addPermission";
      var newAction = actionSplit.join("/");
      form.action = newAction;
    },
    error: function(){
      notifyUser("Failed to update permissions.", true, false);
    }
  });

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

    // Send request to db to update the item
    $.ajax({
      type: "POST",
      url: url,
      data: {item},
      success: function(){
        // Update the text in the item display span
        form[0].previousElementSibling.innerHTML = item;

        // Notify the user that the item was updated and shorten the item's text if it is too long
        if (item.length < 25){
          notifyUser("\"" + item + "\" updated!", true, true);
        } else {
          notifyUser("\"" + item.slice(0, 22) + "...\" updated!", true, true);
        }
      },
      error: function(){
        notifyUser("Failed to update item.", true, false);
        // Reset the input's value
        form[0].children[0].value = initialInputVal;
      }
    });
  } else {
    form[0].children[0].value = initialInputVal;
  }
}

function deleteListItem(btn){
  var url = btn[0].parentElement.action,
      parentId = btn[0].dataset.parentId,
      listOptions = $("#item-options-list-" + parentId),
      parentLi = $("#list-item-" + parentId);

  listOptions.addClass("hidden");

  // Notify user that the item is being removed (for slower connections)
  notifyUser("Removing item...", false);

  //Deletes the list item from the db and removes the corresponding li from the ul
  $.ajax({
    type: "POST",
    url: url,
    success: function(data){
      if (data){
        var itemText = parentLi[0].firstElementChild.innerHTML;
        if (itemText.length < 25){
          notifyUser("\"" + itemText + "\" removed!", true, true);
        } else {
          notifyUser("\"" + itemText.slice(0, 22) + "...\" removed!", true, true);
        }
        parentLi.addClass("slide-left");
        setTimeout(function(){
          parentLi.remove();
        }, 220);
      } else {
        notifyUser("Failed to remove item.", true, false);
        parentLi.removeClass("slide-left");
      }
    },
    error: function(){
      notifyUser("Failed to remove item.", true, false);
      parentLi.removeClass("slide-left");
    }
  });
}

function notifyUser(message, isComplete, isSuccessful){
  clearTimeout(timer);
  var notification = $(".notification");
  $(".notification-message")[0].innerHTML = message;
  notification.addClass("notification-slider");
  notification.removeClass("notification-success");
  notification.removeClass("notification-failure");
  if (isComplete) {
    if (isSuccessful){
      notification.addClass("notification-success");
    } else {
      notification.addClass("notification-failure");
    }
    timer = setTimeout(function(){
      notification.removeClass("notification-slider");
    }, 3000);
  }
}
