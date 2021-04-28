var chat = document.getElementsByClassName('connectToChat');



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
