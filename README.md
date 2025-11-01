## Escuela Colombiana de Ingeniería
- Jeimy Yaya

# Laboratorio Blueprints - Parte III.

## 1. Introducción

En esta tercera parte del laboratorio extendemos la funcionalidad del cliente Blueprints, agregando la posibilidad de crear, modificar y eliminar planos directamente desde el navegador, con soporte para interacción gráfica en un `<canvas>`.

En la fase anterior se integró un cliente básico capaz de:
- Consultar planos por autor.
- Mostrar los planos en una tabla (nombre, número de puntos).
- Calcular el total de puntos usando `reduce`.
- Dibujar los puntos de un plano en el `<canvas>`.

En esta fase se añaden eventos interactivos, peticiones PUT, POST y DELETE al API REST, y se implementan promesas para mantener el flujo de actualización sincronizado.


## 2. Objetivos específicos

1. Capturar eventos de clic/tacto en el <canvas> y agregar nuevos puntos dinámicamente.
2. Actualizar (PUT) los planos existentes en el backend.
3. Crear nuevos planos (POST).
4. Eliminar planos (DELETE).
5. Recalcular automáticamente el puntaje total del usuario.
6. Mantener un diseño modular y usar promesas para evitar “callback hell”.

## 3. Requerimientos previos
- Java 8+/11+
- Maven
- Spring Boot
- Navegador moderno compatible con eventos `PointerEvent`
- Editor de texto (VS Code, IntelliJ, etc.)
- Conexión al API REST local (BlueprintsRESTAPI)

## 4. Descripción de las nuevas funcionalidades
### 4.1 Captura de eventos en el canvas

- Se agregó un manejador de eventos PointerEvent que capture clics o toques en el `<canvas>`.
- Cada click generará un nuevo punto en el plano actualmente cargado (si hay uno seleccionado).
- Los puntos nuevos solo se almacenan temporalmente en memoria, hasta que el usuario haga *Save/Update.*
### 4.2 Botón Save/Update
Cuando el usuario presione “Save/Update”:
1. Se enviará un PUT al recurso REST correspondiente (/blueprints/{author}/{name}).
2.Se obtendrán nuevamente los planos del autor mediante GET.
3. Se recalculará el puntaje total.
```javascript
return $.ajax({
    url: "/blueprints/" + author + "/" + name,
    type: 'PUT',
    data: JSON.stringify(updatedBlueprint),
    contentType: "application/json"
});
```
### 4.3 Botón Create New Blueprint
Este botón debe:
- Limpiar el canvas.
- Solicitar el nombre del nuevo blueprint (por prompt() o campo input).
- Permitir añadir puntos manualmente.
- Al presionar Save/Update por primera vez, debe realizar:
      * POST al API para crear el plano.
      * GET para refrescar la lista y recalcular el puntaje.
```javascript
return $.ajax({
    url: "/blueprints/" + author,
    type: 'POST',
    data: JSON.stringify(newBlueprint),
    contentType: "application/json"
});
```
### 4.4 Botón Delete
Este botón eliminará el plano actual y actualizará la lista:
1. Hace DELETE al recurso correspondiente (/blueprints/{author}/{name}).
2. Limpia el canvas.
3. Realiza un GET para obtener los planos restantes.
```javascript
return $.ajax({
    url: "/blueprints/" + author + "/" + name,
    type: 'DELETE'
});
```
## 5. Uso de Promesas

Cada una de las operaciones (`PUT`, `POST`, `DELETE`) Se manejó mediante promesas,  para garantizar el orden correcto de ejecución:

1. Actualizar o eliminar el plano.

2. Obtener nuevamente la lista de planos.

3. Recalcular el total de puntos.

## 6. Resultado
<img width="1856" height="856" alt="image" src="https://github.com/user-attachments/assets/c9d61701-f883-459a-8649-b8c289fa34f1" />


## 7. Criterios de evaluación
**Funcionalidad**

- La aplicación carga y dibuja correctamente los planos.

- Permite crear, modificar y eliminar planos usando el API REST.

- Recalcula los puntos totales después de cada operación.

**Diseño**

- Uso de map y reduce en lugar de ciclos tradicionales.

- Estructura modular de JavaScript (separación de responsabilidades).

- Uso adecuado de promesas para sincronizar operaciones.
