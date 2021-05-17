const scoket = io()

//dom elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector("#send-location");
const $message = document.querySelector("#messages");
const $sidebarBtn  = document.querySelector("#special-btn")
const $sidebarChat = document.querySelector(".chat__sidebar");
//templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $messageTemplateMe = document.querySelector("#message-template--me").innerHTML;
const $locationTemplate = document.querySelector("#location-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    //new message element
    const $newMessage = $message.lastElementChild;

    //height of the new message
    const newMessageStles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStles.marginBottom);
    const $newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //visible height
    const visibleHeight = $message.offsetHeight;

    //height of messages container
    const containerHeight = $message.scrollHeight;

    //how far have i scrolled
    const scrollOffset = $message.scrollTop + visibleHeight;

    if (containerHeight - $newMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight;
    }
};

scoket.on('sendNewMessage', (msg) => {
    let markup;
    if(msg.username === username.toLowerCase()) {
        let markup = Mustache.render($messageTemplateMe, {
            message: msg.message,
            username: msg.username,
            createdAt: moment(msg.createdAt).format('h:mm a'),
        });
        $message.insertAdjacentHTML('beforeend', markup);
    } else {
        markup = Mustache.render($messageTemplate, {
            message: msg.message,
            username: msg.username,
            createdAt: moment(msg.createdAt).format('h:mm a'),
        });
        $message.insertAdjacentHTML('beforeend', markup);
    }
    autoscroll();
});

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
    let message = e.target.elements.message.value;
    scoket.emit('messageFromClient', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if (error) {
            console.log(error);
        } else {
            console.log('message delivered');
        }
    });
});

document.querySelector("#send-location").addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert("geolocation isnot supported by your browser");
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        scoket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log("the location was sent");
        })
    });
});

scoket.on('sendLocationMessage', (locationMessage) => {
    console.log(locationMessage.url);
    let markup = Mustache.render($locationTemplate, {
        message: locationMessage.url,
        username: locationMessage.username,
        createdAt: moment(locationMessage.createdAt).format('h:mm a'),
    });
    $message.insertAdjacentHTML('beforeend', markup);
    autoscroll();
});

scoket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    };
});

scoket.on('roomData', ({ room, users }) => {
    let markup = Mustache.render($sidebarTemplate, {
        users,
        room
    });

    document.querySelector("#sidebar").innerHTML = markup;
});

$sidebarBtn.addEventListener("click", () => {
    $sidebarChat.classList.toggle("sidebar--active");
});
