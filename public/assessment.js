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

  let langForm = document.getElementById(changeEvent.target.value)

  langForm.classList.remove("hideMePlease")

  langForm.classList.add("showMePlease")

}
