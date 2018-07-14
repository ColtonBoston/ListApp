$("#btn-check-permissions").click(function(){
  checkAllPermissions(true);
});

$("#btn-uncheck-permissions").click(function(){
  checkAllPermissions(false);
});

var allCheckboxes = $("input[type=checkbox]");
function checkAllPermissions(newCheckedState){
  allCheckboxes.each(function(){
    $(this)[0].checked = newCheckedState;
  });
}
