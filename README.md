# Dev_ListasNegras
## Programas del Workspace

En este repositorio, encontrarás los siguientes programas relacionados con el funcionamiento de las listas negras:

1. **CS: TKIO - Consulta Listas Negras - CS**: Este programa se encarga de realizar consultas a las listas negras. Utiliza solicitudes POST para enviar datos al servicio SL y desencadenar el proceso de consulta.

2. **SLS: TKIO - Consulta Listas Negras Service - SL**: Este programa es el servicio que recibe las solicitudes del programa CS. Se encarga de procesar las consultas y enviar los resultados de vuelta al CS.

3. **SL: TKIO - Consulta Listas Negras - SL**: Este programa es el encargado de realizar las consultas a las listas negras. Recibe las solicitudes del servicio SLS y realiza las consultas correspondientes.

Además, se utilizan las siguientes herramientas y registros auxiliares:

- **Sublist_updatedata**: Este registro auxiliar almacena un JSON con los RFC utilizados en las consultas a las listas negras.

- Si el número de proveedores es menor a 500, el registro auxiliar se utiliza en el PageInit del programa CS para recopilar los proveedores en un arreglo y enviarlos al servicio. El proceso de solicitud POST y la actualización de la barra de progreso se mantienen sin cambios.

- Si el número de proveedores es mayor a 500, el programa SL detecta esta condición y envía los datos a un proceso de MapReduce (MR) para su procesamiento.

- Todo el proceso del MR se registra en el registro de seguimiento "Seguimiento Consulta Listas Negras", el cual proporciona datos más detallados sobre el proceso de consulta.

- Se debe implementar un control para evitar la creación de múltiples registros de seguimiento al recargar la página. Esto se puede lograr utilizando un redireccionamiento a un Suitelet.

¡No dudes en explorar los programas y registros auxiliares mencionados para obtener más información sobre el funcionamiento de las listas negras en este proyecto!
