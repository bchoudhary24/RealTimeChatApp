const socket = io('https://realtimechatapp-b70g.onrender.com');
const username = localStorage.getItem('username') || 'Guest';
let currentRoom = 'general';

// Join room
socket.emit('join', { username, room: currentRoom });

// Send message
function sendMessage() {
    const msg = document.getElementById('messageInput').value.trim();
    if (msg) {
        const msgId = Date.now();
        socket.emit('chat message', { room: currentRoom, username, message: msg, id: msgId });

        const div = document.createElement('div');
        div.id = 'msg-' + msgId;
        div.className = 'message';
        div.innerHTML = `<b>${ username }: </b>${msg} <span id="seen-${msgId}" class="seen-status"></span >`;
        document.getElementById('messages').appendChild(div);
        div.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('messageInput').value = '';
    }
}

// Receive message
socket.on('chat message', data => {
    if (data.username === username) return;
    const div = document.createElement('div');
    div.id = 'msg-' + data.id;
    div.className = 'message';
    div.innerHTML = `<b>${ data.username }:</b>${data.message} <span id="seen-${data.id}" class="seen-status"></span >`;
    document.getElementById('messages').appendChild(div);
    div.scrollIntoView({ behavior: 'smooth' });
    socket.emit('seen', { room: currentRoom, msgId: data.id, sender: data.username, seenBy: username });
});

// Seen status
socket.on('seen', data => {
    if (data.sender === username) {
        const seenSpan = document.getElementById('seen-' + data.msgId);
        if (seenSpan) {
            seenSpan.textContent = '(seen)';
            seenSpan.style.color = 'green';
            seenSpan.style.fontSize = '0.8em';
        }
    }
});

// === Emoji picker ===
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const emojis = ['😀', '😁', '😂', '🤣', '😜', '😍', '😎', '😡', '😭', '😅', '😇', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'];
emojiBtn.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'flex' : 'none';
});
emojis.forEach(e => {
    const span = document.createElement('span');
    span.textContent = e;
    span.style.cursor = 'pointer';
    span.onclick = () => document.getElementById('messageInput').value += e;
    emojiPicker.appendChild(span);
});

// === File upload ===
document.getElementById('fileInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            socket.emit('file message', { room: currentRoom, username, fileName: file.name, data: reader.result });
        };
        reader.readAsDataURL(file);
    }
});
socket.on('file message', data => {
    let content;
    if (data.fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
        content = `<img src = "${data.data}"
        style = "max-width:150px;">`;
    } else {
        content = `<a href = "${data.data}"
        download = "${data.fileName}" >📎${ data.fileName } < /a>`;
    }
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<b>${ data.username }:</b>
    ${ content }`;
    document.getElementById('messages').appendChild(div);
});

// === Voice recording ===
// Audio record button
let mediaRecorder;
let audioChunks = [];

document.getElementById('audioBtn').addEventListener('click', async() => {
    if (!mediaRecorder) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = e => {
            audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onload = () => {
                socket.emit('audio message', {
                    room: currentRoom,
                    username,
                    audioData: reader.result
                });
            };
            reader.readAsDataURL(audioBlob);
            audioChunks = [];
        };
    }

    if (mediaRecorder.state === 'inactive') {
        mediaRecorder.start();
        alert('🎙 Recording started. Click again to stop.');
    } else {
        mediaRecorder.stop();
        alert('✅ Recording stopped & sent!');
    }
});

// Receive & play audio message
socket.on('audio message', data => {
    const audio = new Audio(data.audioData);
    audio.controls = true;

    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<b>${data.username}:</b> `;
    div.appendChild(audio);

    document.getElementById('messages').appendChild(div);
});

// === Camera open demo ===
document.getElementById('cameraBtn').addEventListener('click', async() => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        alert('✅ Camera opened (demo)');
        stream.getTracks().forEach(track => track.stop());
    } catch (err) {
        alert('❌ Cannot open camera');
    }
});

// === Dark mode toggle ===
function toggleDarkMode() {
    document.body.classList.toggle('dark');
}
