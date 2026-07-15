const socket = io();

// ---------- elementos ----------
const gate = document.getElementById('gate');
const chat = document.getElementById('chat');
const joinForm = document.getElementById('join-form');
const nameInput = document.getElementById('name-input');
const gateOnlineCount = document.getElementById('gate-online-count');
const onlineCount = document.getElementById('online-count');
const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let myName = '';

// ---------- entrada no chat ----------
joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;

  myName = name;
  socket.emit('user:join', name);
});

socket.on('user:joined', () => {
  gate.classList.add('hidden');
  chat.classList.remove('hidden');
  messageInput.focus();
});

// ---------- contador online ----------
socket.on('online:count', (count) => {
  gateOnlineCount.textContent = count;
  onlineCount.textContent = count;
});

// ---------- mensagens ----------
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  socket.emit('chat:message', text);
  messageInput.value = '';
});

socket.on('chat:message', (msg) => {
  renderMessage(msg);
});

socket.on('system:message', (msg) => {
  renderSystemMessage(msg.text);
});

function renderMessage(msg) {
  const isOwn = msg.id === socket.id;

  const wrapper = document.createElement('div');
  wrapper.className = 'msg' + (isOwn ? ' own' : '');

  const meta = document.createElement('div');
  meta.className = 'msg-meta';

  const nameEl = document.createElement('span');
  nameEl.className = 'msg-name';
  nameEl.textContent = isOwn ? 'você' : msg.name;

  const timeEl = document.createElement('span');
  timeEl.textContent = formatTime(msg.timestamp);

  meta.appendChild(nameEl);
  meta.appendChild(timeEl);

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = msg.text;

  wrapper.appendChild(meta);
  wrapper.appendChild(bubble);
  messagesEl.appendChild(wrapper);

  scrollToBottom();
}

function renderSystemMessage(text) {
  const wrapper = document.createElement('div');
  wrapper.className = 'msg system';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  messagesEl.appendChild(wrapper);

  scrollToBottom();
}

function formatTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
