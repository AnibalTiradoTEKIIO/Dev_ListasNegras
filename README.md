# Dev_ListasNegras
Hubo bastantes cambios en el funcionamiento de listas negras
Dentro de los siguientes puntos se consideran solo 3 archivos que fueron los modificados
CS: TKIO - Consulta Listas Negras - CS
SLS: TKIO - Consulta Listas Negras Service - SL
SL: TKIO - Consulta Listas Negras - SL

#Se usa como herramienta las solicitudes post que manda el CS al SL, para desencadenar el MR desde el SL

#Usamos tambien un registro auxiliar para almacenar un JSON con los RFC llamado sublist_updatedata

#Si hay menos de 500 proveedores, Este registro se usa en el PageInit del CS para recopilarlo en un arreglo y enviarlo al Service, la solicitud post.promise y la actualización de la progress bar se mantiene tal cual

#Si hay mas de 500 proveedores, el SL lo detecta dentro del CASE 'POST' y lo envía a un MapReudce

#Todo el proceso del MR se traslada a un registro de seguimiento que nos da datos mas detallados 'Seguimiento Consulta Listas Negras'

#Falta controlar que al recargaer la página crea otro registro de seguimiento, esto puede ser con un redirect.tosuitelet

