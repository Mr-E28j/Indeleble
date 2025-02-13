document.addEventListener("DOMContentLoaded", () => {
    
    /* === Elementos del DOM === */
    const toggleDarkModeButton = document.getElementById("toggle-dark-mode");
    const notificationDiv = document.getElementById("notification");
    const alertDiv = document.getElementById("alert");
  
    // Tabs y áreas de contenido
    const tabs = document.querySelectorAll(".tab");
    const encodeTab = document.getElementById("encode");
    const decodeTab = document.getElementById("decode");
  
    // Botones y áreas de texto de cada pestaña
    const encodeButton = document.getElementById("encodeButton");
    const decodeButton = document.getElementById("decodeButton");
    const copyButton = document.getElementById("copyButton");
    const outputContainer = document.getElementById("outputContainer");
  
    const inputTextEncode = document.getElementById("inputText");
    const inputTextDecode = document.getElementById("inputTextDecode");
    const outputText = document.getElementById("outputText");
  
    const clearInputButton = document.getElementById("clearInput");
    const clearInputDecodeButton = document.getElementById("clearInputDecode");
  
    /* === Caracteres invisibles para codificación === */
    const invisibleChars = {
      one: "\u200B",      // representa el bit '1'
      zero: "\u200C",     // representa el bit '0'
      separator: "\u200D" // separador entre bytes
    };
  
    /* === Funcionalidad de pestañas === */
    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        // Remover clase activa de todos los tabs y actualizar aria-selected
        tabs.forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        // Ocultar todos los contenidos de pestañas
        document.querySelectorAll(".tab-content").forEach((content) =>
          content.classList.add("hidden")
        );
        // Activar el tab clickeado
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        const tabId = tab.getAttribute("data-tab");
        document.getElementById(tabId).classList.remove("hidden");
        // Limpiar alertas y área de salida
        alertDiv.classList.add("hidden");
        outputContainer.classList.add("hidden");
      });
    });
  
    /* === Modo Oscuro / Claro === */
    const currentMode = localStorage.getItem("darkMode");
    
    // Si no hay preferencia, activamos el modo oscuro por defecto
    if (currentMode === "true" || (currentMode === null && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.documentElement.classList.add("dark");
    }
    
    toggleDarkModeButton.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      const isDarkMode = document.documentElement.classList.contains("dark");
      localStorage.setItem("darkMode", isDarkMode);
      updateDarkModeButton();
    });
  
    function updateDarkModeButton() {
      if (document.documentElement.classList.contains("dark")) {
        toggleDarkModeButton.innerHTML = "☀️";
        toggleDarkModeButton.setAttribute("aria-label", "Activar modo claro");
      } else {
        toggleDarkModeButton.innerHTML = "🌙";
        toggleDarkModeButton.setAttribute("aria-label", "Activar modo oscuro");
      }
    }
    updateDarkModeButton();
  
    /* === Función para mostrar notificaciones === */
    function showNotification(message, isError = false) {
      notificationDiv.textContent = message;
      // Se pueden ajustar los estilos según se requiera
      notificationDiv.classList.remove("hidden");
      setTimeout(() => {
        notificationDiv.classList.add("hidden");
      }, 2000);
    }
  
    /* === Funciones para mostrar y limpiar alertas === */
    function showAlert(message) {
      alertDiv.textContent = message;
      alertDiv.classList.remove("hidden");
    }
    function clearAlert() {
      alertDiv.textContent = "";
      alertDiv.classList.add("hidden");
    }
  
    /* === Función de Codificación === */
    function encodeText(text) {
      if (!text.trim()) {
        showAlert("Por favor, ingrese texto para codificar");
        return "";
      }
      let encoded = "";
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const binary = char.charCodeAt(0).toString(2).padStart(8, "0");
        for (const bit of binary) {
          encoded += bit === "1" ? invisibleChars.one : invisibleChars.zero;
        }
        encoded += invisibleChars.separator;
      }
      clearAlert();
      showNotification("Texto codificado correctamente");
      return encoded;
    }
  
    /* === Función de Decodificación === */
    function decodeText(text) {
      if (!text.trim()) {
        showAlert("Por favor, ingrese texto para decodificar");
        return "";
      }
      try {
        const parts = text.split(invisibleChars.separator);
        let decoded = "";
        parts.forEach((part) => {
          if (part === "") return;
          let binary = "";
          for (const char of part) {
            binary += char === invisibleChars.one ? "1" : "0";
          }
          decoded += String.fromCharCode(parseInt(binary, 2));
        });
        clearAlert();
        showNotification("Texto decodificado correctamente");
        return decoded;
      } catch (error) {
        showAlert("Error al decodificar: El texto no contiene un formato válido");
        return "";
      }
    }
  
    /* === Eventos de botones === */
    encodeButton.addEventListener("click", () => {
      const text = inputTextEncode.value;
      const encoded = encodeText(text);
      if (encoded) {
        outputText.value = encoded;
        outputContainer.classList.remove("hidden");
      }
    });
  
    decodeButton.addEventListener("click", () => {
      const text = inputTextDecode.value;
      const decoded = decodeText(text);
      if (decoded) {
        outputText.value = decoded;
        outputContainer.classList.remove("hidden");
      }
    });
  
    clearInputButton.addEventListener("click", () => {
      inputTextEncode.value = "";
      outputText.value = "";
      outputContainer.classList.add("hidden");
      clearAlert();
      showNotification("Se han limpiado todos los campos");
    });
  
    clearInputDecodeButton.addEventListener("click", () => {
      inputTextDecode.value = "";
      outputText.value = "";
      outputContainer.classList.add("hidden");
      clearAlert();
      showNotification("Se han limpiado todos los campos");
    });
  
    /* === Copiar al portapapeles === */
    copyButton.addEventListener("click", () => {
      if (!outputText.value.trim()) return;
      navigator.clipboard
        .writeText(outputText.value)
        .then(() => {
          showNotification("Texto copiado al portapapeles");
        })
        .catch(() => {
          // Método alternativo
          const textarea = document.createElement("textarea");
          textarea.value = outputText.value;
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand("copy");
            showNotification("Texto copiado al portapapeles");
          } catch (err) {
            showNotification("No se pudo copiar el texto", true);
          }
          document.body.removeChild(textarea);
        });
    });
});
