/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/log', 'N/https', 'N/record'],

    (search, log, https, record) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {search} search
         * @param {log} log
         * @param {record} record 
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            var arrVendors = getVendors();
            var tokenSW = getTokenSW();
            var situacionPvd = '';
            var estatusPvd = '';
            arrVendors.forEach((vendor) => {
                var validaPvd = getListaNegra(tokenSW.token, vendor.custentity_mx_rfc);
                situacionPvd = validaPvd.situacion;
                // Si el proveedor no tiene ninguno de los 4 estatus
                if (situacionPvd === '') {
                    estatusPvd = situacionPvd;
                } else {
                    // Si tiene algun estatus, lo obtiene
                    estatusPvd = situacionPvd.situacion_del_contribuyente;
                }
                // Edita el status y la fecha de consulta del proveedor
                editaEstado(vendor.custentity_mx_rfc, estatusPvd);
            })
        }
        // Buscar a los proveedores 
        function getVendors() {
            try {
                var arrPvd = [];
                var vendors_recordSearchObj = search.create({
                    type: search.Type.VENDOR,
                    // filters:
                    //     [
                    //         ['custentity_mx_rfc', search.Operator.ISNOTEMPTY, id]
                    //     ],
                    columns:
                        [
                            search.createColumn({ name: "internalId", label: "Id" }),
                            search.createColumn({ name: "entityid", sort: search.Sort.ASC, label: "Proveedor" }),
                            search.createColumn({ name: "custentity_mx_rfc", label: "RFC" }),
                            search.createColumn({ name: "custentity_efx_fe_lns_status", label: "Estatus" }),
                            search.createColumn({ name: "custentity_efx_fe_lns_valida_date", label: "Fecha de Consulta" })
                        ]
                });

                var searchResultCount = vendors_recordSearchObj.runPaged().count;
                log.debug("vendors_recordSearchObj result count", searchResultCount);
                vendors_recordSearchObj.run().each(function (result) {
                    // log.debug({ title: 'result', details: result });
                    arrPvd.push({
                        internalId: result.getValue({ name: 'internalId' }) || ' ',
                        entityid: result.getValue({ name: 'entityid' }) || ' ',
                        custentity_mx_rfc: result.getValue({ name: 'custentity_mx_rfc' }) || ' ',
                        custentity_efx_fe_lns_status: result.getText({ name: 'custentity_efx_fe_lns_status' }) || ' ',
                        custentity_efx_fe_lns_valida_date: result.getValue({ name: 'custentity_efx_fe_lns_valida_date' }) || ' '
                    })
                    return true;
                });
                return arrPvd;
            } catch (e) {
                log.error({ title: 'Error obtenInfoProveedores:', details: e });
                return [];
            }

        }

        // Obtener token de authenticacion de Smarter Web
        function getTokenSW() {
            var dataReturn = { success: false, error: '', token: '' }
            try {
                var credSW = getCertificadoSW();
                // log.debug({ title: 'credSW', details: credSW });
                var urlTestSW = credSW[0].url;
                // log.debug({ title: 'urlTestSW', details: urlTestSW });
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

        // Edita el registro del Proveedor con su Estatus en la lista negra
        function editaEstado(rfc, valorStatus) {
            try {
                let fechConsulta = new Date();
                log.debug({ title: 'fecha de Consulta', details: fechConsulta});
                var idVendor = getSearchId(rfc, 'custentity_mx_rfc', search.Type.VENDOR);
                log.debug({ title: 'idVendor', details: idVendor});
                var idStatus = getSearchId(valorStatus, 'name', 'customrecord_efx_pp_sol_lco');
                log.debug({ title: 'idStatus', details: idStatus});
                var record_toChange = record.load({
                    type: 'vendor',
                    id: idVendor,
                    isDynamic: true
                });

                record_toChange.setValue({
                    fieldId: 'custentity_efx_fe_lns_status',
                    value: idStatus
                });
                
                record_toChange.setValue({
                    fieldId: 'custentity_efx_fe_lns_valida_date',
                    value: fechConsulta
                });

                record_toChange.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
            } catch (error) {
                log.error({ title: 'Error editaEstado', details: error })
            }
        }

        // Busqueda dinamica para el ID del proveedor y estatus
        function getSearchId(valorFiltro, filtId, searchType) {
            try {
                var retStatus = '';
                var busquedaPvd = { name: "internalId" }
                var vendor_data_recordSearchObj = search.create({
                    type: searchType,
                    filters:
                        [
                            [filtId, search.Operator.IS, valorFiltro]
                        ],
                    columns:
                        [
                            search.createColumn( busquedaPvd )
                        ]
                });
                var searchResultCount = vendor_data_recordSearchObj.runPaged().count;
                log.debug("vendor_data_recordSearchObj result count", searchResultCount);
                vendor_data_recordSearchObj.run().each(function (result) {
                    log.debug({ title: 'result', details: result });
                    retStatus = result.getValue(busquedaPvd) || ' '
                    log.debug({ title: 'retStatus', details: retStatus });
                });
                return retStatus;

            } catch (error) {
                log.error({ title: 'error getSearchId', details: error })
            }
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

        return { execute }

    });
