# Blueprints Real-Time Application

Este proyecto es un **sistema de gestión de planos (blueprints) en tiempo real** desarrollado con **Spring Boot** y **WebSockets**. Permite crear, dibujar y actualizar planos desde un navegador, compartiendo los cambios en tiempo real entre varios clientes.

---

## Tecnologías utilizadas

- **Backend:** Spring Boot, Java 17  
- **Frontend:** HTML, JavaScript, jQuery, Bootstrap  
- **Comunicación en tiempo real:** WebSockets  
- **Servidor de despliegue:** Tomcat embebido (Spring Boot)  
- **Base de datos:** (según configuración de laboratorio)  

---

## Funcionalidades

- Crear nuevos planos asignados a un autor.  
- Dibujar puntos en un canvas de manera interactiva.  
- Guardar, actualizar y eliminar planos.  
- **Actualización en tiempo real:** todos los clientes conectados ven los cambios al instante.  

---

## Instalación y ejecución local

1. Clonar el repositorio:  
```bash
git clone <REPO_URL>
cd <REPO>
```
Construir el proyecto con Maven:
```
mvn clean install
```
Ejecutar la aplicación:

```
java -jar target/blueprints-api-0.0.1-SNAPSHOT.jar
```
Abrir en el navegador:

http://localhost:8080/

Configuración de WebSocket
URL del WebSocket en el frontend:

```javascript

ws = new WebSocket("ws://localhost:8080/ws/blueprints");
```

## Despliegue en AWS EC2 (Free Tier)
Crear una instancia EC2 (Amazon Linux 2) y conectarse vía SSH.

Instalar Java 17:

```

sudo amazon-linux-extras install java-openjdk17 -y
```
Copiar el JAR del proyecto al servidor:

```

scp -i <TU_KEY.pem> target/blueprints-api-0.0.1-SNAPSHOT.jar ec2-user@<PUBLIC_IP>:/home/ec2-user/
```
Abrir el puerto 8080 en el Security Group de la instancia.

Ejecutar el JAR en la instancia:

```

java -jar blueprints-api-0.0.1-SNAPSHOT.jar
```
Acceder desde un navegador:

http://<PUBLIC_IP_DE_EC2>:8080/
