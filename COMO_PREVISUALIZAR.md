# Cómo previsualizar la invitación

## 1. Local (en esta computadora)

Desde la carpeta del proyecto:

```
python3 -m http.server 8123 --bind 127.0.0.1
```

Abrir en el navegador: http://localhost:8123

## 2. En otro dispositivo de la misma red WiFi (celular, tablet)

Levantar el servidor enlazado a todas las interfaces:

```
python3 -m http.server 8123 --bind 0.0.0.0
```

Buscar la IP local de esta computadora:

```
hostname -I
```

Desde el otro dispositivo (conectado al mismo WiFi), abrir:

```
http://<IP-de-esta-computadora>:8123
```

## 3. Exponer temporalmente a internet (para revisiones remotas)

Con el servidor local corriendo (paso 1 o 2), abrir un túnel público con `localtunnel`:

```
npx --yes localtunnel --port 8123
```

Esto imprime una URL pública tipo `https://algo-random.loca.lt`.

La primera vez que alguien abre esa URL, localtunnel muestra una pantalla
pidiendo una "Tunnel Password". Para obtenerla, ejecutar:

```
curl -s https://loca.lt/mytunnelpassword
```

Esa IP es la contraseña que hay que ingresar una sola vez en esa pantalla.

**Importante:**
- Mientras el túnel esté abierto, cualquiera con el link puede ver la página.
- Es solo para revisiones puntuales y breves — cerrarlo apenas se termine de revisar.
- Para cerrarlo: buscar el proceso y matarlo:

```
pgrep -fa "lt --port 8123"
kill <PID>
```

  (o simplemente cerrar la terminal / detener el proceso en primer plano si no se corrió en segundo plano).
