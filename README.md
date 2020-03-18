##TDRWifi
<img src="https://blogs.protegerse.com/wp-content/imagenes/wifi_krack.png" data-canonical-src="https://gyazo.com/eb5c5741b6a9a16c692170a41a49c858.png" width="150" height="100" />
(Habrá que buscar un icono)

Software compatible with Campbell TDR-100 to aquire waveforms, measure volumetric water content (θ) and the bulk electrical conductivity (σ)  via Wifi through M5Stack.

[TOCM]

## Setup

### Prerequisites
- Linux or OSX


### Hardware needed
- M5Stack
- RS232 to TTL serial port converter module DB9 connector
- Null modem serial cable DB9 male - DB9 male

###Software needed
- [rshell](https://github.com/dhylands/rshell): Remote MicroPython shell, to access flash memory m5stack.  
- [M5Burner](https://github.com/m5stack/m5-docs/blob/master/docs/en/related_documents/M5Burner.md): To burn a firmware to install TDRWifi.

###Installation
 - [Install rshell ](https://github.com/dhylands/rshell#installation)
 - [Install m5Burner](https://github.com/m5stack/m5-docs/blob/master/docs/en/related_documents/M5Burner.md#m5burner-1) and burn last version (works fine untill version UIFlow-v1.4.3 )
 - [Download](https://github.com/an0nio/tdrwifi/archive/master.zip) this repo and unzip
 - Run rshell micropython:
 `$ rshell --buffer-size=32 --port=/dev/ttyUSB* --baud=115200`  where \* is the conexion USB port ( \* = 0,1,2..)
 - Copy `/tdrwifi-master/web/` from folder where you unzip this repo  to m5Stack flash memory:
  `$   cp '/FOLDER/tdrwifi-master/web/' /flash`
 
- Install TDRWifi on m5STack (6 first steps explained on [this video](https://www.youtube.com/watch?v=UVUprvXjUbA)):
  - Click button on m5stack and press button configuration
  - Select: Switch to Internet mode
  - Connect to Wifi access point displayed on the screen
  - On the decive that you connect Wifi access point, go to your browser and visit adress: 192.168.4.1
  - Select your Wifi and type the password and click save.
  - Visit http://flow.m5stack.com and type the APIKEY displayed on the screen on settings on UIFlow program page.
  - Rename project and select </>Python tab on UIFlow program page. Copy all code from `/tdrwifi-master/web/m5communication.py` to web window and download project. See image below:
  <img src="https://github.com/an0nio/tdrwifi/blob/master/imgs/flowStep_1.png?raw=true" >



##Getting Started


