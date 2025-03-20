from machine import ADC, Pin
import time
import ujson
import urequests  # Solo si usas un módulo WiFi externo como ESP8266 o Pico W

# Configuración del ADC para el micrófono MAX4466
mic_pin = ADC(26)  # GPIO26 en Raspberry Pi Pico
reference_voltage = 3.3  # Voltaje de referencia
sample_window = 50  # Tiempo de muestreo en ms
dBReference = 94.0  # Nivel de referencia

# WiFi (Solo para Pico W o con módulo externo)
WIFI_SSID = "TuRedWiFi"
WIFI_PASS = "TuContraseña"
SERVER_URL = "http://192.168.1.13:3000/data"

def conectar_wifi():
    import network
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(WIFI_SSID, WIFI_PASS)
    while not wlan.isconnected():
        time.sleep(1)
        print("Conectando a WiFi...")
    print("Conectado a WiFi")

def leer_sensor_sonido():
    start_time = time.ticks_ms()
    signal_max = 0
    signal_min = 4095  # ADC de 12 bits (0-4095)
    
    while time.ticks_diff(time.ticks_ms(), start_time) < sample_window:
        sample = mic_pin.read_u16() >> 4  # Convertimos 16 bits a 12 bits
        signal_max = max(signal_max, sample)
        signal_min = min(signal_min, sample)
    
    peak_to_peak = (signal_max - signal_min) * (reference_voltage / 4096.0)
    if peak_to_peak <= 0:
        peak_to_peak = 0.0001
    
    dB = 20 * math.log10(peak_to_peak) + dBReference
    print(f"Nivel de ruido: {dB - 18:.2f} dB")
    return dB - 18

def enviar_datos(dB):
    json_data = ujson.dumps({"zona": 1, "decibelios": dB})
    headers = {"Content-Type": "application/json"}
    try:
        response = urequests.post(SERVER_URL, data=json_data, headers=headers)
        print(f"Datos enviados. Codigo: {response.status_code}")
        response.close()
    except Exception as e:
        print(f"Error al enviar datos: {e}")

if __name__ == "__main__":
    conectar_wifi()
    while True:
        nivel_sonido = leer_sensor_sonido()
        enviar_datos(nivel_sonido)
        time.sleep(0.5)
