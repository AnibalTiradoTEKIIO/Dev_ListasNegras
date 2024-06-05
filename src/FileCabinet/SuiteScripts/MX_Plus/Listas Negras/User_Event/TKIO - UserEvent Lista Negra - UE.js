/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/https', 'N/log', 'N/record', 'N/search', 'N/url', 'N/ui/serverWidget', 'N/ui/message'],
    /**
 * @param{https} https
 * @param{log} log
 * @param{record} record
 * @param{search} search
 * @param{url} url
 * @param{serverWidget} serverWidget
 * @param{message} message
 */
    (https, log, record, search, url, serverWidget, message) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            try {
                var contextType = scriptContext.type;
                var objMsg = new Object();
                var tokenSW = getTokenSW();
                var situacionPvd = '';
                var estatusPvd = '';
                if (contextType === scriptContext.UserEventType.VIEW) {
                    var newRecord = scriptContext.newRecord;
                    var vendorName = newRecord.getValue({ fieldId: 'companyname' });
                    //log.debug({ title: 'vendorName', details: vendorName });
                    var vendorRFC = newRecord.getValue({ fieldId: 'custentity_mx_rfc' });
                    log.debug({ title: 'vendorRFC', details: vendorRFC });
                    var validaPvd = getListaNegra(tokenSW.token, vendorRFC);
                    situacionPvd = validaPvd.situacion;
                    // Si el proveedor no tiene ninguno de los 4 estatus
                    if (situacionPvd === '') {
                        estatusPvd = 'Libre';
                    } else {
                        // Si tiene algun estatus, lo obtiene
                        estatusPvd = situacionPvd.situacion_del_contribuyente;
                    }
                    log.debug({ title: 'estatusPvd', details: estatusPvd });
                    // scriptContext.form.addPageInitMessage({ type: message.Type.INFORMATION, message: 'Hello world!', duration: 5000 });
                    // Mostrar mensaje al guardar o editar proveedor
                    switch (estatusPvd) {
                        case 'Sentencia Favorable':
                            objMsg.type = message.Type.INFORMATION
                            objMsg.title = "Proveedor en Lista Negra"
                            objMsg.message = 'El proveedor ' + vendorName + ' se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + estatusPvd + '</b>';
                            scriptContext.form.addPageInitMessage(objMsg);
                            break;
                        case 'Desvirtuado':
                            objMsg.type = message.Type.WARNING
                            objMsg.title = "Proveedor en Lista Negra"
                            objMsg.message = 'El proveedor ' + vendorName + ' se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + estatusPvd + '</b>';
                            scriptContext.form.addPageInitMessage(objMsg);
                            break;
                        case 'Definitivo':
                            objMsg.type = message.Type.ERROR
                            objMsg.title = "Proveedor en Lista Negra"
                            objMsg.message = 'El proveedor ' + vendorName + ' se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + estatusPvd + '</b>';
                            scriptContext.form.addPageInitMessage(objMsg);
                            break;
                        case 'Presunto':
                            objMsg.type = message.Type.WARNING
                            objMsg.title = "Proveedor en Lista Negra"
                            objMsg.message = 'El proveedor ' + vendorName + ' se encuentra en la lista negra 69b del SAT con un estatus de: <b>' + estatusPvd + '</b>';
                            scriptContext.form.addPageInitMessage(objMsg);
                            break;
                        case 'Libre':
                            objMsg.type = message.Type.CONFIRMATION
                            objMsg.title = "¡Proveedor agregado con exito!"
                            objMsg.message = 'Proveedor ' + vendorName + ' creado correctamente';
                            scriptContext.form.addPageInitMessage(objMsg);
                            break;
                        default:
                            objMsg.type = message.Type.ERROR
                            objMsg.title = "Error no identificado."
                            objMsg.message = 'Consulte a su administrador'
                            scriptContext.form.addPageInitMessage(objMsg);
                            break;
                    }
                }
            } catch (error) {
                log.error({ title: 'Error afterSubmit:', details: error });
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
           
        }

        // Obtener token de authenticacion de Smarter Web
        function getTokenSW() {
            var dataReturn = { success: false, error: '', token: '' }
            try {
                var credSW = getCertificadoSW();
                var urlTestSW = credSW[0].url;
                var urlToken = urlTestSW + '/security/authenticate';
                var user = credSW[0].user;
                var pass = 'mQ*wP^e52K34';
                var headers = {
                    "user": user,
                    "password": pass
                };
                var response = https.post({
                    url: urlToken,
                    headers: headers,
                    body: {}
                });
                // log.debug({title:'response', details:response});
                if (response.code == 200) {
                    var token = JSON.parse(response.body);
                    log.debug({ title: 'token', details: token });
                    dataReturn.token = token.data;
                    dataReturn.success = true;
                }
            } catch (error) {
                log.error({ title: 'getTokenSW', details: error });
                dataReturn.success = false;
                dataReturn.error = error;
            }
            return dataReturn;
        }
        // Obtener la situación del contribuyente en la lista negra de Smarter Web
        function getListaNegra(tokenSW, rfc) {
            var dataReturn = { success: false, error: '', situacion: '' }
            try {
                var urlSW = getCertificadoSW();
                var url = urlSW[0].url + '/taxpayers/' + rfc
                var header = {
                    "Authorization": "Bearer " + tokenSW.token
                }

                var responseLN = https.get({
                    url: url,
                    headers: header
                });
                log.debug({ title: 'responseLN', details: responseLN });

                if (responseLN.code == 200) {
                    var data = JSON.parse(responseLN.body);
                    log.debug({ title: 'data', details: data });
                    dataReturn.situacion = data.data;
                    dataReturn.success = true;
                } else if (responseLN.code == 400) {
                    dataReturn.situacion = '';
                    dataReturn.success = true;
                }

            } catch (error) {
                log.error({ title: 'getTokenSW', details: error });
                dataReturn.success = false;
                dataReturn.error = error;
            }
            return dataReturn;
        }

        // Obtener credenciales de SmarterWeb
        function getCertificadoSW() {
            try {
                var credenciales = [];
                var efx_metodo_de_envio_recordSearchObj = search.create({
                    type: 'customrecord_efx_fe_mtd_envio',
                    // filters:
                    //     [
                    //         ['recordid', search.Operator.IS, id]
                    //     ],
                    columns:
                        [
                            search.createColumn({ name: "custrecord_efx_fe_mtd_env_urltest" }),
                            search.createColumn({ name: "custrecord_efx_fe_mtd_env_usertest" })
                        ]
                });
                var searchResultCount = efx_metodo_de_envio_recordSearchObj.runPaged().count;
                log.debug("efx_metodo_de_envio_recordSearchObj result count", searchResultCount);
                efx_metodo_de_envio_recordSearchObj.run().each(function (result) {
                    log.debug({ title: 'result', details: result });
                    credenciales.push({
                        url: result.getValue({ name: 'custrecord_efx_fe_mtd_env_urltest' }) || ' ',
                        user: result.getValue({ name: 'custrecord_efx_fe_mtd_env_usertest' }) || ' '
                    })
                    log.debug({ title: 'credenciales', details: credenciales });
                });
                return credenciales;

            } catch (error) {
                log.error({ title: 'error getCertificadoSW', details: error })
            }
        }

        return { beforeLoad }

    });
