
## TDRWifi

<img src="/home/an0nio/folder/imgs/TDRwifiLogo.png" />

Software compatible with Campbell TDR-100 to aquire waveforms, measure volumetric water content (θ) and the bulk electrical conductivity (σ)  via Wifi through M5Stack.


## Setup


### Prerequisites
- Linux or OSX


### Hardware needed
- M5Stack
- RS232 to TTL serial port converter module DB9 connector
- Null modem serial cable DB9 male - DB9 male

### Software needed
- [rshell](https://github.com/dhylands/rshell): Remote MicroPython shell, to access flash memory m5stack. 
- [M5Burner](https://github.com/m5stack/m5-docs/blob/master/docs/en/related_documents/M5Burner.md): To burn a firmware to install TDRWifi.

### Installation  
 #### All steps to installation and getting started explained on [this video](https://github.com/an0nio/tdrwifi/video/videoTutorial.mp4) 
 - [Install rshell ](https://github.com/dhylands/rshell#installation)
 - Download UIFlow-Desktop-IDE and M5Burner from [here](https://m5stack.com/pages/download)
 - [Download](https://github.com/an0nio/tdrwifi/archive/master.zip) this repo and unzip
  - Run M5Burner and download last version. Restart M5Burner and click erase button. Then click burn button to burn last version downloaded. 
  - Run rshell micropython:<br/>
    ```$ rshell --buffer-size=32 --port=/dev/ttyUSB* --baud=115200``` <br/>
    where \* is the conexion USB port ( \* = 0,1,2..). It can occur that u can not connect, in this case, you have to restart m5stack, click button setup (on m5stack) and select and aplication, like a game and retry. 
 - Copy `/tdrwifi-master/web/` from folder where you unzip this repo  to m5Stack flash memory:<br/>
    `$   cp -r '/FOLDER/tdrwifi-master/web/' /flash`
    
- Install TDRWifi on m5STack :
  - Reset m5stack and select: switch mode > usb mode 
  - Open UIFlow-Desktop-IDE, select the port where is your m5stack connected and click ok. 
  - Click </> Python tab and clear written code. Copy all code from `/tdrwifi-master/web/m5communication.py` and paste all code on UIFlow-Desktop-IDE (</>Python tab) . 
  - Rename proyect (TDRWifi)  and click download button. 
  
  ### Getting started
  Once you install TDRWifi on your m5Stack:
  - Start TDRWifi program on m5Stack.
  - Connect to WiFi named TDR_WIFI and type password: 123456789 (click yes if your mobile ask for keep tdr conexion)
  - Go to your browser and type: 192.168.4.1
  - Enjoy TDR_Wifi
  



