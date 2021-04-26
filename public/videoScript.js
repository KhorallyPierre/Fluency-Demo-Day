const socket = io('/')
const videoGrid = document.getElementById('video-grid')
// const myPeer = new Peer(undefined, {})

//Every Peer object is assigned a random, unique ID when it's created.
const myPeer = new Peer(undefined, {})
const myVideo = document.createElement('video')
myVideo.muted = true
// object being used to organize stuff in one place - referred to as a namespace
const peers = {}
// asking permission to get camera
let theStream = null
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  theStream = stream
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    //userID is connecting through stream to ...
    connectToNewUser(userId, stream)
  })
})
// ther seems to be one user ID for every peer
// very likely that peer is the stream, and user ID is user using that stream
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})
// difference between peer and user? Circle back to this
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  // video call being initiated
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  // peer is being decleared (not a good practice)
  peers[userId] = call
}
// event listenever for when video stream begins
function addVideoStream(video, stream) {
  console.log('number of screens active', videoGrid.children.length)
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
  if (videoGrid.children.length === 2) {

    countDown()
  }

}

const timeLeftDisplay = document.querySelector('#time-left')
timeLeft = 3000

function countDown() {
  console.log('timer has started')
  setInterval(function() {
    if (timeLeft <= 0) {
      clearInterval(timeLeft = 0)
      window.location.href = "/profile"
    }

    timeLeftDisplay.innerText = "Time Left: " + timeLeft
    timeLeft -= 1

  }, 1000)
}

// to mute audio
function muteSelf() {
  console.log('muting myself')
  theStream.getAudioTracks()[0].enabled = false;
}

document.querySelector('.muteSelf').addEventListener('click', muteSelf)

// window.addEventListener('load', countDown)
