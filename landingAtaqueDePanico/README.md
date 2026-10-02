# Ataque de Pánico — Landing

Landing page de **Ataque de Pánico**, agrupación de metal de Colombia. Presenta el EP *Malviajado* (2025), la discografía de la banda y sus redes oficiales.

Es un sitio estático (HTML, CSS y JavaScript sin frameworks ni dependencias), listo para publicar en GitHub Pages.

## Características

- **Intro animada "crisis de pánico"**: un monitor cardíaco con ECG y BPM que se aceleran, grietas que se abren desde el centro (se generan al azar en cada visita), unos ojos amarillos que se abren y el logo con efecto glitch antes de mostrar el sitio. Se puede saltar con el botón *Saltar* o con `Esc`, `Enter` o `Espacio`, y repetir desde el footer.
- **Sonido de monitor de hospital**: pitidos al ritmo de los BPM, línea plana, vidrio rompiéndose y un golpe grave al final. Todo se genera con Web Audio API, sin archivos de audio. Una pantalla previa pide *Entrar con sonido* o *Sin sonido*, porque los navegadores bloquean el audio sin una interacción del usuario.
- **"Malviajado" desde el 3:50**: al terminar la intro aparece un reproductor flotante de Spotify (iFrame API) que salta al minuto 3:50 de la canción.
- **Discografía**: Malviajado (EP, 2025), Fragmentado (single, 2025), Caras Vemos (single, 2025) y Severa Molleja (álbum, 2017). *Escuchar aquí* carga cada disco en el reproductor de la página.
- **Español / Inglés**: selector ES/EN en el header y en la pantalla previa. El idioma inicial sale del navegador y la elección se guarda en `localStorage`.
- **Responsive y accesible**: menú móvil, foco visible y textos alternativos. Si el sistema tiene activado *reducir movimiento*, se muestra una versión corta de las animaciones.

## Estructura

```
landingAtaqueDePanico/
├── index.html        # Marcado y textos en español
├── css/styles.css    # Estilos (variables de color en :root)
├── js/main.js        # Intro, sonido, Spotify, discografía, idioma, menú
└── img/              # Logo, favicon y portadas oficiales de Spotify
```

## Ver en local

Abre `index.html` en el navegador. Para que Spotify y el audio funcionen como en producción, conviene servir la carpeta por HTTP, por ejemplo con la extensión *Live Server* de VS Code (clic derecho en `index.html` → *Open with Live Server*) o con cualquier servidor estático:

```bash
cd landingAtaqueDePanico
python -m http.server 8000
# luego abre http://localhost:8000
```

## Editar contenido

| Qué | Dónde |
|---|---|
| Textos en español | `index.html` (los elementos con `data-i18n` o `data-i18n-attr`) |
| Textos en inglés | `js/main.js` → objeto `I18N.en`, con la misma clave del `data-i18n` |
| Textos generados por JS (mensajes de la intro, botones) | `js/main.js` → `JS_TEXT.es` / `JS_TEXT.en` |
| Colores | `css/styles.css` → `--c` (cian), `--y` (amarillo), `--bg` (fondo) |
| Minuto de inicio de la canción | `js/main.js` → `const START = 230` (segundos) |
| Duración de cada fase de la intro | `js/main.js` → funciones `playIntro()` y `queueRest()` |
| Volumen del sonido | `js/main.js` → `master.gain.value` dentro del módulo `Sound` |

El español se lee del HTML al cargar la página, así que no hay que duplicarlo en el JS.

## Limitaciones conocidas

- **Spotify desde el 3:50**: sólo funciona si el visitante tiene una sesión de Spotify abierta en el navegador. Sin sesión, Spotify entrega una vista previa de 30 segundos que no se puede adelantar. Además, Spotify puede bloquear la reproducción automática; en ese caso el reproductor aparece en pausa.
- Para que el fragmento suene para todos los visitantes, la alternativa es un archivo de audio propio (por ejemplo `audio/malviajado.mp3`) reproducido desde la página.

## Enlaces de la banda

- Spotify: https://open.spotify.com/artist/10jcDYbdUmeICp2HG6zGNK
- YouTube: https://www.youtube.com/@ataquedepanico3986
- Instagram: https://www.instagram.com/ataquepanico/
- Facebook: https://www.facebook.com/ATAQUEDEPANICOCOLOMBIA/
- Página de enlaces: https://ataquedepanico.github.io/socialnetwork/

## Créditos

El logo, las portadas y la música son propiedad de **Ataque de Pánico**. Las portadas son las publicadas en Spotify.
