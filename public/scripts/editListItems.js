var list = $("#list");

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
      list.append(li);
      input.value = "";
    },
    error: function(){
      console.log("Error: Could not add item to list.");
    }
  })
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

  // Deletes the list item from the db and removes the corresponding li from the ul
  $.ajax({
    type: "POST",
    url: url,
    success: function(data){
      if (data){
        console.log("Item deleted.");
        console.log(data.status);
        form[0].offsetParent.remove();
      } else {
        console.log("Delete failed.");
      }
    },
    error: function(){
      console.log("Delete failed.");
    }
  });
}
