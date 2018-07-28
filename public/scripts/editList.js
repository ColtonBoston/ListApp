var list = $("#list"),  // Main list div
    notificationTimer,
    listActions = $(".list-actions"),
    initialInputVal;    // Initial value for list item input (for editing/updating)

// Logic for button to focus new item input on mobile devices
if (window.innerWidth <= 767){
  $(".btn-new-item").click(function(){
    $(this).addClass("slide-right");
  });

  // Hides the button that focuses the new item input if the input is already visible
  setInterval(function(){
    var pageTop = window.pageYOffset;
    var pageBottom = window.pageYOffset + window.innerHeight;
    var elemTop = listActions[0].getBoundingClientRect().top,
        elemHeight = listActions[0].clientHeight;
    if (elemTop < window.innerHeight && elemTop + elemHeight > 0){
      $(".btn-new-item").addClass("slide-right");
    } else {
      $(".btn-new-item").removeClass("slide-right");
    }
  }, 350);
}

// Edit list button clicked
list.on("click", ".btn-edit-item", function(event){
  event.preventDefault();

  var itemId = $(this)[0].dataset.parentId,
      itemText = $("#list-item-text-" + itemId),
      editForm = $("#edit-item-form-" + itemId),
      optionsList = $("#item-options-" + itemId);

  initialInputVal = itemText[0].innerHTML;
  itemText.toggleClass("js_hidden");
  editForm.toggleClass("js_hidden");
  optionsList.addClass("hidden");
});

list.on("click", ".btn-cancel-edit", function(event){
  var parentForm = $(this)[0].parentElement,
      itemId = parentForm.id.split("-")[3];

  parentForm.classList.add("js_hidden");
  $("#list-item-text-" + itemId).removeClass("hidden js_hidden");
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
  };

  // Notify user that the item is being added (for slower connections)
  notifyUser("Adding...", false);
  $.ajax({
    type: "POST",
    url: url,
    cache: false,
    data: { item: { name: newItemName } },
    success: function(data){
      // Get the new item's data from the response to create a new li
      var li = $(data).find("#list")[0].lastElementChild;
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

// Update list item on submitting the form
list.on("submit", ".edit-item-form", function(event){
  event.preventDefault();

  var itemId = $(this)[0].id.split("-")[3];
  updateListItem($(this));
  document.activeElement.blur();
  $(this).addClass("js_hidden");
  $("#list-item-text-" + itemId).removeClass("hidden js_hidden");
});


// Handler for completing items
list.on("submit", ".form-complete-item", function(event){
  event.preventDefault();

  var action = $(this)[0].action;

  // Clear the timer that sends ajax request if the form is submitted again
  clearTimeout($(this)[0].completeItemTimer);

  // Toggle completed-item class on parent li. The user will see it completed even if the ajax fails, but only locally until the page is refreshed.
  $(this)[0].parentElement.classList.toggle("completed-item");

  var isCompleted = $(this)[0].parentElement.classList.contains("completed-item");

  // Sets a timeout and ajax to toggle completion of the li that is being checked completed.
  // This allows each li to have a separate timer/ajax that can be stopped or reset without affecting other list items if the form is submitted twice
  $(this)[0].completeItemTimer = setTimeout(function(){
    $(this)[0].completeItemAjax = $.ajax({
      type: "POST",
      url: action,
      data: { isCompleted: isCompleted },
      beforeSend: function(){
        // Cancel the previous ajax request if one exists when a new request is sent
        if ($(this)[0].completeItemAjax && $(this)[0].completeItemAjax != "ToCancelPrevReq" && $(this)[0].completeItemAjax.readyState < 4){
          $(this)[0].completeItemAjax.abort();
        }
      },
      success: function(){
        // Done - do nothing.
      }
    });
  // Waits 500ms to make the ajax call. If the form is submitted again before this time, the timer is reset for another 500ms.
  // This prevents the user from spamming the form and sending multiple post requests.
  }, 500);
});
// End of handler to complete items

// Delete list item click handler
list.on("click", ".btn-delete-item", function(event){
  event.preventDefault();
  deleteListItem($(this));
});

// Toggle completion of list item
list.on("click", ".btn-complete-item", function(event){
});

// Show an item's options (edit/delete) when its options button is clicked
list.on("click", ".btn-item-options", function(event){
  var itemId = $(this)[0].id.split("-")[3],
      allOptionsLists = $(".item-options"),
      optionsList = $("#item-options-" + itemId),
      areOptionsHidden = optionsList.hasClass("hidden");

  // Hide options for all list item options
  allOptionsLists.addClass("hidden");

  // Shows the item's options if they weren't already shown
  if (areOptionsHidden){
    optionsList.removeClass("hidden");
  }
});

// Toggle visibility of permissions
$(".permissions-toggle").on("click", function(event){
  $(".list-permissions").toggleClass("hidden");
  $(this)[0].firstElementChild.classList.toggle("glyphicon-menu-down");
  $(this)[0].firstElementChild.classList.toggle("glyphicon-menu-up");
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
      data: {item: item},
      success: function(){
        // Update the text in the item display span
        form[0].previousElementSibling.innerHTML = escapeHTML(item);

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
    initialInputVal = "";
  }
}

function deleteListItem(btn){
  var url = btn[0].parentElement.action,
      parentId = btn[0].dataset.parentId,
      listOptions = $("#item-options-" + parentId),
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
        itemText = unescapeHTML(itemText);
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
  clearTimeout(notificationTimer);
  var notification = $(".notification");
  $(".notification-message")[0].innerHTML = escapeHTML(message);
  notification.addClass("notification-slider");
  notification.removeClass("notification-success");
  notification.removeClass("notification-failure");
  if (isComplete) {
    if (isSuccessful){
      notification.addClass("notification-success");
    } else {
      notification.addClass("notification-failure");
    }
    notificationTimer = setTimeout(function(){
      notification.removeClass("notification-slider");
    }, 2700);
  }
}

// Change strings to display html as plain text
function escapeHTML(str){
  return str.replace(/</g, "&lt").replace(/>/g, "&gt");
}

function unescapeHTML(str){
  return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
