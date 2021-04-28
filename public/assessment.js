// find the select language form

const selectLanguage = document.querySelector('#addLang')
//add an event listener to select langauge form which runs
//choose lang function when user chooses a specific langauge (or changes the select)
selectLanguage.addEventListener('change', chooseLang)
console.log('see me', selectLanguage)

function chooseLang(changeEvent) {
  console.log("hello there", changeEvent.target.value)
  // defining form that is visible to viewers that needs to be hidden
  let visibleForm = document.querySelector('.showMePlease')
  console.log("visible form", visibleForm.classList)
  // letting the program know which classes should be removed or added based on click events
  // show me please will be removed on original forms
  visibleForm.classList.remove("showMePlease")
  // hide me please will be on remaining forms
  visibleForm.classList.add("hideMePlease")
  console.log("visible form2", visibleForm.classList)
  // defining form that will be visible to viewers after they've clicked
  let langForm = document.getElementById(changeEvent.target.value)
  console.log('form', langForm.classList)
  //removing class that hides so form can be visible
  langForm.classList.remove("hideMePlease")
  // adding class that will allow chosen form to be viewed
  langForm.classList.add("showMePlease")
  console.log('form2', langForm.classList)
}
