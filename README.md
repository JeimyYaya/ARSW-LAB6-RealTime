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
![](img/mock2.png)
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

Cada una de las operaciones (`PUT`, `POST`, `DELETE`) debe manejarse mediante promesas, para encadenar correctamente los pasos y evitar anidaciones excesivas.
![](img/mock2.png)

1. Agregue al canvas de la página un manejador de eventos que permita capturar los 'clicks' realizados, bien sea a través del mouse, o a través de una pantalla táctil. Para esto, tenga en cuenta [este ejemplo de uso de los eventos de tipo 'PointerEvent'](https://mobiforge.com/design-development/html5-pointer-events-api-combining-touch-mouse-and-pen) (aún no soportado por todos los navegadores) para este fin. Recuerde que a diferencia del ejemplo anterior (donde el código JS está incrustado en la vista), se espera tener la inicialización de los manejadores de eventos correctamente modularizado, tal [como se muestra en este codepen](https://codepen.io/hcadavid/pen/BwWbrw).

2. Agregue lo que haga falta en sus módulos para que cuando se capturen nuevos puntos en el canvas abierto (si no se ha seleccionado un canvas NO se debe hacer nada):
    1. Se agregue el punto al final de la secuencia de puntos del canvas actual (sólo en la memoria de la aplicación, AÚN NO EN EL API!).
    2. Se repinte el dibujo.

3. Agregue el botón Save/Update. Respetando la arquitectura de módulos actual del cliente, haga que al oprimirse el botón:
    1. Se haga PUT al API, con el plano actualizado, en su recurso REST correspondiente.
    2. Se haga GET al recurso /blueprints, para obtener de nuevo todos los planos realizados.
    3. Se calculen nuevamente los puntos totales del usuario.

    Para lo anterior tenga en cuenta:

    * jQuery no tiene funciones para peticiones PUT o DELETE, por lo que es necesario 'configurarlas' manualmente a través de su API para AJAX. Por ejemplo, para hacer una peticion PUT a un recurso /myrecurso:

    ```javascript
    return $.ajax({
        url: "/mirecurso",
        type: 'PUT',
        data: '{"prop1":1000,"prop2":"papas"}',
        contentType: "application/json"
    });
    
    ```
    Para éste note que la propiedad 'data' del objeto enviado a $.ajax debe ser un objeto jSON (en formato de texto). Si el dato que quiere enviar es un objeto JavaScript, puede convertirlo a jSON con: 
    
    ```javascript
    JSON.stringify(objetojavascript),
    ```
    * Como en este caso se tienen tres operaciones basadas en _callbacks_, y que las mismas requieren realizarse en un orden específico, tenga en cuenta cómo usar las promesas de JavaScript [mediante alguno de los ejemplos disponibles](http://codepen.io/hcadavid/pen/jrwdgK).

4. Agregue el botón 'Create new blueprint', de manera que cuando se oprima: 
    * Se borre el canvas actual.
    * Se solicite el nombre del nuevo 'blueprint' (usted decide la manera de hacerlo).
    
    Esta opción debe cambiar la manera como funciona la opción 'save/update', pues en este caso, al oprimirse la primera vez debe (igualmente, usando promesas):

    1. Hacer POST al recurso /blueprints, para crear el nuevo plano.
    2. Hacer GET a este mismo recurso, para actualizar el listado de planos y el puntaje del usuario.

5. Agregue el botón 'DELETE', de manera que (también con promesas):
    * Borre el canvas.
    * Haga DELETE del recurso correspondiente.
    * Haga GET de los planos ahora disponibles.

### Criterios de evaluación

1. Funcional
    * La aplicación carga y dibuja correctamente los planos.
    * La aplicación actualiza la lista de planos cuando se crea y almacena (a través del API) uno nuevo.
    * La aplicación permite modificar planos existentes.
    * La aplicación calcula correctamente los puntos totales.
2. Diseño
    * Los callback usados al momento de cargar los planos y calcular los puntos de un autor NO hace uso de ciclos, sino de operaciones map/reduce.
    * Las operaciones de actualización y borrado hacen uso de promesas para garantizar que el cálculo del puntaje se realice sólo hasta cando se hayan actualizados los datos en el backend. Si se usan callbacks anidados se evalúa como R.
    
