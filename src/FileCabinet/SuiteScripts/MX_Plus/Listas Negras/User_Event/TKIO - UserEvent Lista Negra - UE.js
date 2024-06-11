/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/https', 'N/log', 'N/record', 'N/search', 'N/url', 'N/ui/serverWidget', 'N/ui/message', '../../lib/access_pac', '../../lib/functions_gbl'],
    /**
 * @param{https} https
 * @param{log} log
 * @param{record} record
 * @param{search} search
 * @param{url} url
 * @param{serverWidget} serverWidget
 * @param{message} message
 */
    (https, log, record, search, url, serverWidget, message, access_pac, functions) => {
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
                const datosAuth = functions.getCompanyInformation();
                // log.debug('datosAuth', datosAuth);
                const { COMPANY, MX_PLUS_CONFIG } = functions;
                // log.debug('COMPANY', COMPANY);
                const configAll = functions.getConfig();
                // log.debug('configAll', configAll);
                let services, apis
                if (configAll[MX_PLUS_CONFIG.FIELDS.TEST_MODE] == true) {
                    services = access_pac.testURL.services
                    apis = access_pac.testURL.apis
                } else {
                    services = access_pac.prodURL.services
                    apis = access_pac.prodURL.apis
                }
                const urlToken = access_pac.resolveURL(services, access_pac.accessPoints.authentication);
                // log.debug('urlToken', urlToken);
    
                const getToken = access_pac.getTokenAccess(urlToken, datosAuth[COMPANY.FIELDS.EMAIL]);
                const tokenSW = getToken.data.token;
                // log.debug('execute ~ tokenSW:', tokenSW)
                var situacionPvd = '';
                var estatusPvd = '';
                if (contextType === scriptContext.UserEventType.VIEW) {
                    var newRecord = scriptContext.newRecord;
                    var vendorName = newRecord.getValue({ fieldId: 'companyname' });
                    //log.debug({ title: 'vendorName', details: vendorName });
                    var vendorRFC = newRecord.getValue({ fieldId: 'custentity_mx_rfc' });
                    if(vendorRFC === ''){
                        log.audit('El proveedor no tiene RFC, se detiene la validacion. Proveedor: ', vendorName)
                        return
                    }
                    log.debug({ title: 'vendorRFC', details: vendorRFC });
                    var validaPvd = getListaNegra(services, tokenSW, vendorRFC);
                    situacionPvd = validaPvd.situacion;
                    // Si el proveedor no tiene ninguno de los 4 estatus
                    if (situacionPvd === '') {
                        estatusPvd = 'Libre';
                    } else {
                        // Si tiene algun estatus, lo obtiene
                        estatusPvd = situacionPvd;
                    }
                    log.debug({ title: 'estatusPvd', details: estatusPvd });
                    // scriptContext.form.addPageInitMessage({ type: message.Type.INFORMATION, message: 'Hello world!', duration: 5000 }); // mensaje de prueba
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
                            objMsg.title = "¡Proveedor correcto!"
                            objMsg.message = 'El proveedor ' + vendorName + ' no se encuentra en la lista negra 69b';
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

        // Obtener la situación del contribuyente en la lista negra de Smarter Web
        function getListaNegra(services, tokenSW, rfc) {
            var dataReturn = { success: false, error: '', situacion: '' }
            try {
                const urlTaxPayers = access_pac.resolveURL(services, access_pac.accessPoints.tax_payers);
                // log.debug('getListaNegra ~ urlTaxPayers:', urlTaxPayers)
                var responseLN = https.get({
                    url: urlTaxPayers + rfc,
                    headers: { "Authorization": "Bearer " + tokenSW }
                });
                // log.debug({ title: 'responseLN', details: responseLN });

                if (responseLN.code == 200) {
                    var data = JSON.parse(responseLN.body);
                    log.debug({ title: 'data', details: data });
                    dataReturn.situacion = data.data.situacion_del_contribuyente;
                    dataReturn.success = true;
                } else if (responseLN.code == 400) {
                    dataReturn.situacion = '';
                    dataReturn.success = true;
                } else {
                    dataReturn.success = false; 
                    dataReturn.error = 'Failed to get data. HTTP Status Code: ' + responseLN.code;
                }

            } catch (error) {
                log.error({ title: 'getTokenSW', details: error });
                dataReturn.success = false;
                dataReturn.error = error;
            }
            return dataReturn;
        }

        return { beforeLoad }

    });
