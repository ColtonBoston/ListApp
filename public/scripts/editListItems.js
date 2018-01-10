var initialItemVal;

// onFocus event for all list item inputs
// keep var of initial focused val
$("#list").on("focus", ".list-item-input", function(event){
  initialItemVal = $(this)[0].value;
});

// onBlur or onEnter?
// if var of initial focused val has changed, put all list item inputs into an array and save the list
$("#list").on("blur", ".list-item-input", function(event){
  var selectedList = $(this);
  var updatedItemVal = selectedList[0].value;
  if(updatedItemVal === initialItemVal || updatedItemVal === ""){
    selectedList[0].value = initialItemVal;
  } else {
    // update db here
    var items = getListArray();
    console.log(items);
    $.ajax({
      type: "POST",
      url: "/lists/" + list._id + "?_method=PUT",
      data: {items},
      success: function(){
        console.log("Update successful");
      },
      error: function(){
        console.log("Update failed");
        selectedList[0].value = initialItemVal;
      }
    });
  }
});

// newListItem.onClick
// create a new list item inputs
// get all list item input values and put them in an array
// save list
$("#new-item-submit").click(function(event){
  event.preventDefault();
  var newItemInput = $("#new-item-input"),
      newItemVal = newItemInput[0].value;
  console.log()
  if (newItemVal !== ""){
    console.log("add li with " + newItemVal);

    var items = getListArray(),
        listIndex = items.length;
    var li = "<li id='list-item-" + listIndex + "' class='list-group-item'><input class='list-item-input' type='text' value='" + newItemVal + "'><button class='btn btn-danger btn-delete-item'><i class='glyphicon glyphicon-trash'></i></button></li>";
    items.push(newItemVal);
    newItemInput[0].value = "";
    console.log(items);
    $.ajax({
      type: "POST",
      url: "/lists/" + list._id + "?_method=PUT",
      data: {items},
      success: function(){
        console.log("Update successful");
        $("#list").append(li);
      }
    });
    //addItemEvents($("#list-item-" + listIndex));
  } else {
    console.log("do nothing");
  }
});

// Delete button.onclick
$("#list").on("click", ".btn-delete-item", function(event){
  //console.log($(this)[0].parentElement.classList);
  var removedItem = $(this)[0].parentElement;
  removedItem.classList.add("hidden");
  console.log(removedItem.classList);
  // $(this)[0].parentElement.remove();
  var items = getListArray();
  $.ajax({
    type: "POST",
    url: "/lists/" + list._id + "?_method=PUT",
    data: {items},
    success: function(){
      console.log("Delete successful");
      removedItem.remove();
    },
    error: function(){
      removedItem.classList.remove("hidden");
    }
  });
});

function getListArray(){
  var listInputs = $(".list-item-input"),
      listItems = [];

  for(var i = 0; i < listInputs.length; i++){
    // if (!listInputs[i].hasClass("hidden")){
    //   listItems.push(listInputs[i].value);
    //   console.log(listInputs[i]);
    // }
    if(!listInputs[i].parentElement.classList.contains("hidden")){
      listItems.push(listInputs[i].value);
    }
  }
  return listItems;
}

/*
----------OR----------
put form over all list item inputs (including newListItem)
create handlers:
  newListItem submit.onclick: submit form if input is not empty
  editListItem onfocus: save item value to var
    maybe add pencil button to edit and make input not readonly
  editListItem onblur: if val has changed, submit form
  listItem delete.onclick: remove li, create array of other items, submit form
in list update route, check for empty inputs and remove them from array, then save
*/
