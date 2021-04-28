// find the select language form

const selectLanguage = document.querySelector('#addLang')
//add an event listener to select langauge form which runs
//choose lang function when user chooses a specific langauge (or changes the select) 
selectLanguage.addEventListener('change', chooseLang)
console.log('see me', selectLanguage)

function chooseLang(changeEvent) {
  console.log("hello there", changeEvent.target.value)
  let visibleForm = document.querySelector('.showMePlease')
  console.log("visible form", visibleForm.classList)
  visibleForm.classList.remove("showMePlease")
  visibleForm.classList.add("hideMePlease")
  console.log("visible form2", visibleForm.classList)
  let langForm = document.getElementById(changeEvent.target.value)
  console.log('form', langForm.classList)
  langForm.classList.remove("hideMePlease")
  langForm.classList.add("showMePlease")
  console.log('form2', langForm.classList)
}
