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
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
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
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

// document.querySelector('timer2')
// const startingMinutes = 15;
// let time = startingMinutes * 60;
//
// const countdownEl = getElementById('countdown');
//
// setInterval(updateCountdown, 1000);
//
// function updateCountdown() {
//   const minutes = Math.floor(time / 60);
//   let seconds = time % 60;
//
//   countdownEl.innerHTML = `${minutes}: ${seconds}`;
//
//   time--;
// }
