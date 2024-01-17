// Variable para validar el ingreso del usuario
let validate = false;

// Conexión al servidor de Socket.io
const socket = io();

// Elementos del DOM
const chatBox = document.querySelector('#chatBox');
const chatUser = document.querySelector('#chatUser');
const checkUser = document.querySelector('#checkUser');
const messageLogs = document.querySelector('#messageLogs');
const clearMessages = document.querySelector('#clearMessages')

// Evento al presionar una tecla en el cuadro de chat
chatBox.addEventListener('keyup', (e) => {
  // Validar el usuario al enviar un mensaje por primera vez
  if (!validate) { validateUser() }

  // Enviar el mensaje al servidor al presionar Enter
  if (e.key === 'Enter') {
    if (chatBox.value.trim().length > 0) {
      socket.emit('message', { user: chatUser.value, message: chatBox.value })
      chatBox.value = ''
    }
  }
})

// FIXME corregir el evento de cargado inicial
chatBox.addEventListener('load', () => {
  socket.emit('init', "dato")
})

// Manejar los mensajes recibidos del servidor y actualizar el historial de mensajes
socket.on('messageLogs', data => {
  let messageLog = '';
  data.forEach(elm => {
    messageLog += `<div class="log"><p class="user">${elm.user}</p>
    <p class="text">${elm.message}</p>
    <p class="date">${new Date(elm.atCreated).toLocaleString()}</p>
    </div>`
  });
  messageLogs.innerHTML = messageLog;
})

// Evento al escribir en el cuadro de nombre de usuario
chatUser.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    // Validar el formato del correo electrónico
    if (validator.isEmail(chatUser.value)) {
      changeValidate(true)
    } else {
      changeValidate(false)
    }
  } else {
    changeValidate(false)
  }
})

// Función para validar el usuario utilizando una ventana emergente de Swal
function validateUser() {
  Swal.fire({
    title: 'Identifícate con tu email',
    input: 'email',
    text: 'Ingrese un e-mail para identificarse',
    allowOutsideClick: false,
    inputValidator: value => {
      if (!validator.isEmail(value)) {
        return 'Necesitas escribir un e-mail para continuar!!'
      }
    }
  }).then(result => {
    changeValidate(true)
    chatUser.value = result.value
  })
}

// Función para cambiar el estado de validación y mostrar/ocultar el icono de verificación
function changeValidate(check) {
  if (check) {
    validate = true;
    checkUser.classList.remove('visibleOff')
  } else {
    validate = false;
    checkUser.classList.add('visibleOff')
  }
}

// FIXME: corregir evento que debería borrar mensajes en MongoDB
clearMessages.addEventListener('click', () => {
  messageLogs.innerHTML = '';
  socket.emit('clean', "dato")
})
