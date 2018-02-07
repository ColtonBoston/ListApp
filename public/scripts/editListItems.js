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
    console.log($(this));
    isEditable = !isEditable;
    isEditable ? $(this)[0].innerHTML = "<i class='glyphicon glyphicon-ok'></i> Finish Editing" : $(this)[0].innerHTML = "<i class='glyphicon glyphicon-pencil'></i> Edit List";
    $(".delete-form").toggleClass("js_hidden");
    $(".delete-list-form").toggleClass("js_hidden");
    $(".edit-item-form").toggleClass("js_hidden");
    $(".list-item-span").toggleClass("js_hidden");
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

  $.ajax({
    type: "POST",
    url: url,
    data: {item},
    success: function(data){
      console.log("Item added to list.");

      var li = $(data).find("#list")[0].lastElementChild;
      console.log(li.children.classList);

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
      notifyUser(item.name, "added");
    },
    error: function(){
      console.log("Error: Could not add item to list.");
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

function updateListItem(form){
  // Get the action of the form and the value of the form's input
  var url = form[0].action,
      item = form[0].children[0].value;
  // Updates the list item in the db if the value has changed. Resets the input
  // to before it was focused if the value is empty
  if (item !== initialInputVal && item !== ""){
    $.ajax({
      type: "POST",
      url: url,
      data: {item},
      success: function(){
        console.log("Update successful.");
        console.log(item);
        form[0].previousElementSibling.innerHTML = item;
        notifyUser(item, "updated");
      },
      error: function(){
        console.log("Update failed.");
        form[0].children[0].value = initialInputVal;
      }
    });
  } else {
    form[0].children[0].value = initialInputVal;
  }
}

function deleteListItem(form){

  var url = form[0].parentElement.action;

  form[0].offsetParent.classList.add("slide-left");

  // Deletes the list item from the db and removes the corresponding li from the ul
  $.ajax({
    type: "POST",
    url: url,
    success: function(data){
      if (data){
        console.log("Item deleted.");
        var itemName = form[0].offsetParent.firstElementChild.innerHTML;
        notifyUser(itemName, "removed");
        setTimeout(function(){
          form[0].offsetParent.remove();
        }, 220);
      } else {
        console.log("Delete failed.");
        form[0].offsetParent.classList.remove("slide-left");
      }
    },
    error: function(){
      console.log("Delete failed.");
      form[0].offsetParent.classList.remove("slide-left");
    }
  });
}

function notifyUser(itemName, message){
  clearTimeout(timer);
  console.log($(".notification-item"));
  var notification = $(".notification");
  $(".notification-item")[0].innerHTML = "\"" + itemName;
  $(".notification-message")[0].innerHTML = "\" " + message + "!";
  notification.addClass("notification-slide-down");
  timer = setTimeout(function(){
    notification.removeClass("notification-slide-down");
  }, 3000);
}
