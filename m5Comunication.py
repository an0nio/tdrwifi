


from m5stack import *
from m5ui import *
from uiflow import *
import network
import os
from machine import UART
import time
import struct
import ujson



# Parte de python-------onda-----------

ser = UART(1, 9600, tx=17, rx=16,bits=8, parity=None, stop=1, timeout=100)
WAVEFORM=bytes(':GWAV35\r','utf-8')#Peticion de onda
ABRT=bytes(':ABRT29\r','utf-8')  #Aborta comando en ejecucion
DUMP=bytes(':DUMP36\r','utf-8')# Petición vp, average, points, distance, window length, probe length, probe offset

SVP=bytes(':S_VP','utf-8') #set vp
SNAV=bytes(':SNAV','utf-8')# set number average points
SPLR=bytes(':SPRL','utf-8')#set probe length
SPRO=bytes(':SPRO','utf-8')#set probe offset
SPCC =bytes(':SPCC','utf-8')#set probe cell constant
SDIS=bytes(':SDIS','utf-8')#set distance (cable length)
SPNT =bytes(':SPNT','utf-8')#set number of points
SWLN=bytes(':SWLN','utf-8')#set window length


def urldecode(str):
  dic = {"%21":"!","%22":'"',"%23":"#","%24":"$","%26":"&","%27":"'","%28":"(","%29":")","%2A":"*","%2B":"+","%2C":",","%2F":"/","%3A":":","%3B":";","%3D":"=","%3F":"?","%40":"@","%5B":"[","%5D":"]","%7B":"{","%7D":"}"}
  for k,v in dic.items(): str=str.replace(k,v)
  return str


def HL(datos):
    sum=-58
    mv=memoryview(datos)
    for el in mv:
        sum+=el
    sum=sum % 256
    hl = hex(sum)[2:].upper()
    return (datos+bytes(hl,'utf-8')+bytes([13]))

def darValor(comando, valor):
    comando=comando+b' '+bytes(str(valor),'utf-8')
    return HL(comando)

def getWaveForm(ser):#si esperamos antes de pedir la onda ser.any()!=<bound method>
    ser.write(WAVEFORM)
    while ser.any()<1: 
        time.sleep(0.1)

    header = ser.read(6)
    if header[1] !=35:
        M5TextBox(24, 134, "Cant recive wave. Retrying", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
        return "Error"+ str(header[1])
    data = ser.read()
    time.sleep(0.1)
    
    while ser.any()>0: 
      data+=ser.read()
      time.sleep(0.1)
      
    ondaBin=data.replace((bytes([34])+bytes([243])), bytes([13]))#0x22 0xf3 > 0x0d
    ondaBin=ondaBin.replace((bytes([34])+bytes([222])), bytes([34]))#0x22 0xde > 0x22
    ondaBin=ondaBin.replace((bytes([34])+bytes([198])), bytes([58]))#0x22 0xc6 > 0x3a
    try: 
      onda=struct.unpack('>251f',ondaBin)
      M5TextBox(100, 120, "Done", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
      return onda
    except: 
      M5TextBox(100, 120, "Unexpected Error. Retrying", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
      return "Error Unknow: Expected 1007 Bytes an recive "+str(len(ondaBin))
      #Este error parece ser que solo ocurre con el tdr a 57600 Baudios. Cuando esto ocurre
      #no hay ningun byte que recibir, ser.any()=0, pero sin embargo no ha recibido 251 puntos. 
      #Aun no he encontrado el porque del error
    
def getWaveJsonFich(ser):
	wave=getWaveForm(ser)
	f=open("onda.json", "w")
	f.write(ujson.dumps(wave))
	#lcd.print('ok')
	f.close()

	return

def peticion(ser, pe):
    try:
        ser.write(pe)
        time.sleep(0.1)
        i=0
        while(ser.any()==0 and i<25):
            time.sleep(0.1)
            i+=1
        recibido=ser.readline()
        if(str(recibido)[3]!='$'):
            M5TextBox(24, 134, "Error sending configuration", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
            return False
        lcd.print('.')
        time.sleep(0.3)
        return True
    except SerialException():
        M5TextBox(24, 134, "Cant configurate", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
        return False


def configEC(ser): 
    if(not peticion(ser, ABRT)):
      return False
    if(not peticion(ser, darValor(SVP, 0.99))):
      return False
    if(not peticion(ser, darValor(SNAV,1))):
      return False
    if(not peticion(ser, darValor(SPLR,0.3))):
      return False
    if(not peticion(ser, darValor(SPRO,0.09))):
      return False
    if(not peticion(ser, darValor(SPCC,1))):
      return False
    if(not peticion(ser, darValor(SDIS,0))):
      return False
    if(not peticion(ser, darValor(SPNT,251.0000000))):
      return False
    if(not peticion(ser, darValor(SWLN,50))):
      return False
    return True
    

def requestToJson(req): 
    datos=req[req.find('myData')+7:-1]  
    return urldecode(datos)
  
def configTdr100(json):
    if(not peticion(ser, ABRT)):
      return False
    dic=ujson.loads(json)
    if(not peticion(ser, darValor(SVP, dic['vp']))):
      return False
    if(not peticion(ser, darValor(SNAV,dic['averagePoints']))):
      return False
    if(not peticion(ser, darValor(SPLR,dic['probeLength']))):
      return False
    if(not peticion(ser, darValor(SPRO,dic['probeOffset']))):
      return False
    if(not peticion(ser, darValor(SPCC,dic['probeCell']))):
      return False
    if(not peticion(ser, darValor(SDIS,dic['cableLength']))):
      return False
    if(not peticion(ser, darValor(SPNT,dic['numberPoints']))):
      return False
    if(not peticion(ser, darValor(SWLN,dic['windowLength']))):
      return False
    return True
    

def saveConfig(json):
    config=ujson.loads(urldecode(json))
    f=open('web/json/config.json', 'r')
    configs = ujson.loads(f.read())
    f.close()
    if str(config['configName']) in configs:
      return False
    else: 
      configs[str(config['configName'])] = config
      f = open('web/json/config.json', 'w') 
      f.write(ujson.dumps(configs))
      f.close()
      return True
      
def deleteConfig(key): #dada una key elmina del fichero la configuracion
    f=open('web/json/config.json', 'r')
    configs = ujson.loads(f.read())
    f.close()
    if str(key) in configs:
      del configs[str(key)] 
      f = open('web/json/config.json', 'w') 
      f.write(ujson.dumps(configs))
      f.close()
      return True
    else: 
      return False

def keyConfigJson(key): #dada una key devuelve una configuración en json
    f=open('web/json/config.json', 'r')
    configs = ujson.loads(f.read())
    return ujson.dumps(configs[str(key)])

#parte server -------------------



try:
  import usocket as socket
except:
  import socket



ap = network.WLAN(network.AP_IF)
ap.active(True)
ap.config(essid='TDR_WIFI')
ap.config(authmode=3, password='123456789')
lcd.clear()

response = None
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('192.168.4.1',80))
s.listen(5)

M5TextBox(43, 15, "WELCOME  TO TDR WIFI", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
M5TextBox(21, 49, "Connect to wifi: TDR_WIFI ", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
M5TextBox(21, 79, "Password: 123456789", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
M5TextBox(24, 134, "Then go to your navigator", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
M5TextBox(25, 162, "and enter page: 192.168.4.1", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
rgb.setColorFrom(6 , 10 ,25)
rgb.setColorFrom(1 , 5 ,25)
rgb.setBrightness(100)

while True:
  conn, addr = s.accept()
  request = conn.recv(1024)
  request = str(request)
  #print ('Content = %s' % request)
  #lcd.print('Content = %s' % request,0,50,0xffffff)
  if ap.isconnected() == True:
    lcd.clear()
    M5TextBox(55, 15, "TDR WIFI", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
    M5TextBox(21, 49, "Connected", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
    rgb.setBrightness(0)
  else:
    lcd.clear()
    M5TextBox(21, 49, "Not Connected", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)





  if request.find('/js/scriptMedicion.js') > 0:
    f=open('web/js/scriptMedicion.js', 'r')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/javascript\n')
    conn.send('Connection: close\n\n')
    datos = f.read(1024)
    while datos != "":
      conn.sendall(datos)
      datos=f.read(1024)
    f.close()
    conn.close()

  elif request.find('/js/jquery-3.4.1.js') > 0:
    f=open('web/js/jquery-3.4.1.js.gz', 'r')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/javascript\n')
    conn.send('Content-Encoding: gzip\n')
    conn.send('Connection: close\n\n')
    datos = f.read(1024)
    while datos != "":
      conn.sendall(datos)
      datos=f.read(1024)
    f.close()
    conn.close()

  elif request.find('/js/bootstrap.min.js') > 0:
    f=open('web/js/bootstrap.min.js.gz', 'r')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/javascript\n')
    conn.send('Content-Encoding: gzip\n')
    conn.send('Connection: close\n\n')
    datos = f.read(1024)
    while datos != "":
      conn.sendall(datos)
      datos=f.read(1024)
    f.close()
    conn.close()

  elif request.find('/js/d3.js') > 0:
    f=open('web/js/d3.js.gz', 'r')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/javascript\n')
    conn.send('Content-Encoding: gzip\n')
    conn.send('Connection: close\n\n')
    datos = f.read(1024)
    while datos != "":
      conn.sendall(datos)
      datos=f.read(1024)
    f.close()
    conn.close()

  elif request.find('/js/bootstrap.bundle.min.js') > 0:
    f=open('web/js/bootstrap.bundle.min.js.gz', 'r')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/javascript\n')
    conn.send('Content-Encoding: gzip\n')
    conn.send('Connection: close\n\n')
    datos = f.read(1024)
    while datos != "":
      conn.sendall(datos)
      datos=f.read(1024)
    f.close()
    conn.close()

  elif request.find('/js/bootstrap-table.min.js') > 0:
    f=open('web/js/bootstrap-table.min.js.gz', 'r')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/javascript\n')
    conn.send('Content-Encoding: gzip\n')
    conn.send('Connection: close\n\n')
    datos = f.read(1024)
    while datos != "":
      conn.sendall(datos)
      datos=f.read(1024)
    f.close()
    conn.close()


  elif request.find('/css/bootstrap-table.min.css') > 0:
    f=open('web/css/bootstrap-table.min.css.gz', 'r')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: text/css\n')
    conn.send('Content-Encoding: gzip\n')
    conn.send('Connection: close\n\n')
    datos = f.read(1024)
    while datos != "":
      conn.sendall(datos)
      datos=f.read(1024)
    f.close()
    conn.close()

  elif request.find('/css/bootstrap.min.css') > 0:
    f=open('web/css/bootstrap.min.css.gz', 'r')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: text/css\n')
    conn.send('Content-Encoding: gzip\n')
    conn.send('Connection: close\n\n')
    datos = f.read(1024)
    while datos != "":
      conn.sendall(datos)
      datos=f.read(1024)
    f.close()
    conn.close()
      
  elif request.find('/json/onda.json') > 0:
    M5TextBox(21, 79, "Aquaring waveform...", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
    key=requestToJson(request)
    config=keyConfigJson(key)
    configdic=ujson.loads(config)
    if(configTdr100(config)):
      onda=getWaveForm(ser)
      if onda[0]=="E":
        datos=dict(error=onda[5:])
      else:
        datos=dict(wave=onda,cL=configdic['cableLength'] ,wL=configdic['windowLength'], firstPeak=configdic['firstPeak'])
    else:
      datos=dict(error='config')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/json\n')
    conn.send('Connection: close\n\n')
    conn.sendall(ujson.dumps(datos))
    conn.close()


  elif request.find('/configBaudRate') > 0: 
    valor=requestToJson(request)
    try:
      ser.init(int(valor), tx=17, rx=16,bits=8, parity=None, stop=1, timeout=100)
      datos=dict(send="ok")
    except:
      datos=dict(error="Cant change Baudrate")
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/json\n')
    conn.send('Connection: close\n\n')
    conn.sendall(ujson.dumps(datos))
    conn.close()

    
  elif request.find('/configOnda') > 0:
    M5TextBox(21, 79, "Aquaring waveform...", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
    if(configTdr100(requestToJson(request))):
      onda=getWaveForm(ser)
      if onda[0]=="E":
        datos=dict(error=onda[5:])
      else:
        datos=dict(wave=onda)
    else: 
      datos=dict(error='config')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/json\n')
    conn.send('Connection: close\n\n')
    conn.sendall(ujson.dumps(datos))
    conn.close()
    
  elif request.find('/saveConfig') > 0:
    M5TextBox(21, 79, "Saving config...", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
    lcd.clear()
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/json\n')
    conn.send('Connection: close\n\n')
    if(saveConfig(urldecode(requestToJson(request)))):
      conn.sendall(ujson.dumps('Saved configuration'))
    else: 
      conn.sendall(ujson.dumps('Cant save this configuration. Try to change name Configuration'))
    conn.close()

  elif request.find('/deleteConfig') > 0: 
    M5TextBox(21, 79, "Deleting config...", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/json\n')
    conn.send('Connection: close\n\n')
    if(deleteConfig(urldecode(requestToJson(request)))):
      conn.sendall(ujson.dumps('Deleted configuration'))
    else: 
      conn.sendall(ujson.dumps('Cant delete Configuration'))
    conn.close()
    
  elif request.find('/json/ec.json') > 0:
    M5TextBox(21, 79, "Aquaring EC...", lcd.FONT_DejaVu18,0xFFFFFF, rotate=0)
    if(configEC(ser)):
      onda=getWaveForm(ser)
      if onda[0]=="E":
        datos=dict(error=onda[5:])
      else:
        datos=dict(wave=onda,cL=configdic['cableLength'] ,wL=configdic['windowLength'], firstPeak=configdic['firstPeak'])
    else:
      datos=dict(error='config')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/json\n')
    conn.send('Connection: close\n\n')
    conn.sendall(ujson.dumps(datos))
    conn.close()
  
  elif request.find('/parametrosTdr100.html') > 0:
    f=open('web/parametrosTdr100.html', 'r')
    parametrosTdr100=f.read()
    f.close()
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: text/html\n')
    conn.send('Connection: close\n\n')
    conn.sendall(parametrosTdr100)
    conn.close()
  


    
  elif request.find('/parametrosTek.html') > 0:
    f=open('web/parametrosTek.html', 'r')
    parametrosTek=f.read()
    f.close()
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: text/html\n')
    conn.send('Connection: close\n\n')
    conn.sendall(parametrosTek)
    
    
  elif request.find('/datosConfig') > 0:
    f=open('web/json/config.json', 'r')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: application/json\n')
    conn.send('Connection: close\n\n')
    datos = f.read(1024)
    while datos != "":
      conn.sendall(datos)
      datos=f.read(1024)
    f.close()
    conn.close()
    


    


#cambiar el else final por un elif?
  else:
    f=open('web/medicion.html', 'r')
    conn.send('HTTP/1.1 200 OK\n')
    conn.send('Content-Type: text/html\n')
    conn.send('Connection: close\n\n')
    datos = f.read(1024)
    while datos != "":
      conn.sendall(datos)
      datos=f.read(1024)
    f.close()
    conn.close()












