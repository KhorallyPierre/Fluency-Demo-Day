var chat = document.getElementsByClassName('connectToChat');

document.addEventListener('DOMContendLoaded', () => {
  const timeLeftDisplay = document.querySelector('#time-left')
  const startTime = document.querySelector('.timer2') // button that should trigger the start of the timer
  timeLeft = 1500

  function countDown() {
    setInterval(function() {
      if (timeLeft <= 0) {
        clearInterval(timeLeft = 0)
      }

      timeLeftDisplay.innerText = "Time Left: " + timeLeft
      timeLeft -= 1
    }, 1000)
  }
startTime.addEventListener('click', countDown)
window.addEventListener('load', countDown)

})



console.log(chat)
Array.from(chat).forEach(function(element) {
  element.addEventListener('click', function() {
    console.log('you clicked to chat', element.id)
    // call fetch to that pair API
    // pair API should match you with someone to talk to
    const url = '/pair?' + 'learning=' + element.id
    fetch(url)
      .then(response => response.json())
      .then(data => {

        window.location = '/profile'


        console.log(data)
      });


  })
});
