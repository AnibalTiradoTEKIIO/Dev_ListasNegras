/**
 * @NApiVersion 2.1
 * 
 * @NScriptType Suitelet
 */
define(['N/log', 'N/search', 'N/ui/serverWidget', 'N/https', 'N/record', '../../lib/access_pac', '../../lib/functions_gbl'],
    /**
 * @param{log} log
 * @param{search} search
 * @param{serverWidget} serverWidget 
 */
    (log, search, serverWidget, https, record, access_pac, functions) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                const remainingUsage = runtime.getCurrentScript().getRemainingUsage();
                if (remainingUsage < 100) {
                    // Crea una tarea Map/Reduce
                    const mrTask = task.create({ taskType: task.TaskType.MAP_REDUCE });
                    mrTask.scriptId = 'customscript_TKIO_MR_Listas_Negras'; 
                    mrTask.deploymentId = 'customdeploy_TKIO_MR_Listas_Negras'; 
                    mrTask.submit();
            
                    // Envía un correo electrónico a los administradores
                    email.send({
                        author: runtime.getCurrentUser().id,
                        recipients: ['anibal.tirado@tekiio.mx'], 
                        subject: 'Proceso de Listas Negras',
                        body: 'El proceso de Listas Negras continuará de manera programada. Se enviará un correo cuando haya terminado.'
                    });
            
                    // Termina la ejecución del Suitelet
                    return;
                }
                // let results = { success: false, details: '', data: [] };
                let parametros = JSON.parse(scriptContext.request.body);
                log.debug('onRequest ~ parametros:', parametros)

                const datosAuth = functions.getCompanyInformation();
                 log.debug('datosAuth', datosAuth);
                const { COMPANY, MX_PLUS_CONFIG } = functions;
                 log.debug('COMPANY', COMPANY);
                const configAll = functions.getConfig();
                 log.debug('configAll', configAll);
                let services, apis
                if (configAll[MX_PLUS_CONFIG.FIELDS.TEST_MODE] == true) {
                    services = access_pac.testURL.services
                    apis = access_pac.testURL.apis
                } else {
                    services = access_pac.prodURL.services
                    apis = access_pac.prodURL.apis
                }

                const urlToken = access_pac.resolveURL(services, access_pac.accessPoints.authentication);
                 log.debug('urlToken', urlToken);

                const getToken = access_pac.getTokenAccess(urlToken, datosAuth[COMPANY.FIELDS.EMAIL]);
                const tokenSW = getToken.data.token;
                 log.debug('tokenSW', getToken.data.token);

            
                //let lengthSublist = Object.keys(parametros.arrSublist).length;
                let results = {};
                let situacion = [];
               // let progress= 0;
                //let completedVendors=0;
                // log.debug('onRequest ~ lenghtSublist:', lenghtSublist)
                // for (let index = 0; index < lengthSublist; index++) {
                    results = getListaNegra(services, tokenSW, parametros.rfc)
                    log.debug('results', results);
                    if (results.success) {
                        situacion.push(results.situacion);
                        //log.debug('Percentage: ', updatePercentage)
                        // fetch('/update-percentage', {
                        //     method: 'POST',
                        //     headers: {
                        //       'Content-Type': 'application/json',
                        //     },
                        //     body: JSON.stringify({ percentage: updatePercentage }),
                        //   })
                        // https.post({ 
                        //     url: '/update-percentage',
                        //     body: { percentage: updatePercentage }
                        // });
                    } else {
                        scriptContext.response.write({
                            output: ''
                        });
                    }
                  
                // }
                log.debug('onRequest ~ situacion:', situacion)
                // results.success = false
                results.data = parametros
                results.situacion = situacion;
                results.details = 'Se ha validado un proveedor';
                scriptContext.response.write({
                    output: JSON.stringify(results)
                });
                

            } catch (error) {
                log.error('error onRequest', error)
            }

           }



        const getListaNegra = (services, tokenSW, rfc) => {
            try {
                let responseResult = { success: false, error: '', situacion: '', details: '' };
                const urlTaxPayers = access_pac.resolveURL(services, access_pac.accessPoints.tax_payers);
                log.debug('getListaNegra ~ urlTaxPayers:', urlTaxPayers)
                const responseLN = https.get({
                    url: urlTaxPayers + rfc,
                    headers: { "Authorization": "Bearer " + tokenSW }
                });
                if (responseLN.code == 200) {
                    const data = JSON.parse(responseLN.body);
                    // log.debug({ title: 'data', details: data });
                    responseResult = { success: true, situacion: data.data.situacion_del_contribuyente };
                    editaEstado(rfc, responseResult.situacion);
                    return responseResult; 
                } else if (responseLN.code == 400) {
                    responseResult = { success: true, situacion: '' };
                    editaEstado(rfc, responseResult.situacion);
                    return responseResult;
                } else {
                    return responseResult = { success: false, error: 'Failed to get data. HTTP Status Code: ' + responseLN.code }
                }
            } catch (error) {
                log.error('getListaNegra ~ error:', error)
            }
        }

        // Edita el registro del Proveedor con su Estatus en la lista negra
        function editaEstado(rfc, valorStatus) {
            try {
                const fechConsulta = new Date();
                // log.debug({ title: 'fecha de Consulta', details: fechConsulta });
                const idVendor = getSearchId(rfc, 'custentity_mx_rfc', search.Type.VENDOR);
                // log.debug({ title: 'idVendor', details: idVendor });
                const idStatus = getSearchId(valorStatus, 'name', 'customrecord_efx_pp_sol_lco');
                // log.debug({ title: 'idStatus', details: idStatus });
                record.submitFields({
                    type: record.Type.VENDOR,
                    id: idVendor,
                    values: {
                        'custentity_efx_fe_lns_status': idStatus,
                        'custentity_efx_fe_lns_valida_date': fechConsulta
                    },
                    options: {
                        enablesourcing: true,
                        ignoreMandatoryFields: true
                    }
                    
                });
                // const record_toChange = record.load({
                //     type: 'vendor',
                //     id: idVendor
                // });
                
                // record_toChange.setValue({
                //     fieldId: 'custentity_efx_fe_lns_status',
                //     value: idStatus
                // });
                
                // record_toChange.setValue({
                //     fieldId: 'custentity_efx_fe_lns_valida_date',
                //     value: fechConsulta
                // });
                
                // record_toChange.save({
                //     enableSourcing: false,
                //     ignoreMandatoryFields: true
                // });
            } catch (error) {
                log.error({ title: 'Error editaEstado', details: error })
            }
        }
        // Busqueda para el ID del Proveedor y el status 
        function getSearchId(valorFiltro, filtId, searchType) {
            try {
                let resId = '';
                const searchObj = search.create({
                    type: searchType,
                    filters:
                        [
                            [filtId, search.Operator.IS, valorFiltro]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalId" })
                        ]
                });
                searchObj.run().each(function (result) {
                    resId = result.getValue({ name: "internalId" }) || ' '
                });
                return resId;
            } catch (error) {
                log.error({ title: 'error getSearchId', details: error })
                return ''
            }
        }
        
        return { onRequest }

    });
