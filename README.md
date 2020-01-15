# TDRWIFI

Software necesario
  - m5Burner (para programar)
  - rshell micropython (github) (para modificar los archivos)
  - flow m5stack desktop id (para programar

Si ha petado 
  - descargar última versión en m5burner: erase+burn

Ejecutar rshell
  - rshell --buffer-size=32 --port=/dev/ttyUSB0 --baud=115200 
  - (así es como me funciona a mí)

Con el software instalado, en concreto para el tdrwifi:
  - ejecutar rshell y descargar carpeta web en /flash, en mi caso :
  - cp '/home/an0nio/Escritorio/tdr/web' /flash
  - ejecutar flow m5stack desktop id y hacer copia-pega del archivo m5Comunication.py
  - en la pestaña de python del m5flow + run (boton de play)
  - Grabar imagen 
