/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/message', 'N/url', 'N/https', 'N/search', 'N/record'],
    /**
     * @param{currentRecord} currentRecord
     * @param{message} message
     * @param{url} url
     * @param{https} https
     * @param{search} search
     * @param{record} record
     */
    function (currentRecord, message, url, https, search, record) {
        const currentRd = currentRecord.get();
        const tokenSW = getTokenSW();
        /**
         * Function to be executed after page is initialized.
        *
        * @param {Object} scriptContext
        * @param {Record} scriptContext.currentRecord - Current form record
        * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
        */
       function pageInit(scriptContext) {

        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {

        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {

        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            var rfc = '';
            var sublistLineCount = currentRd.getLineCount({
                sublistId: 'custpage_tkio_vendor'
            });
            var todayConsulta = new Date().toLocaleDateString();
            var estatus = '';
            try {
                // Se autentica en Smarter Web
                // var tokenSW = getTokenSW();
                // log.debug({ title: 'tokenSW', details: tokenSW.token })

                for (var i = 0; i < sublistLineCount; i++) {
                    currentRd.selectLine({
                        sublistId: 'custpage_tkio_vendor',
                        line: i
                    });

                    var check = currentRd.getCurrentSublistValue({
                        sublistId: 'custpage_tkio_vendor',
                        fieldId: 'sublist_check'
                    });

                    log.debug({ title: 'check', details: check })

                    if (check === true) {
                        var rfc = currentRd.getCurrentSublistValue({
                            sublistId: 'custpage_tkio_vendor',
                            fieldId: 'sublist_pvd_rfc'
                        });
                        log.debug({ title: 'RFC de Proveedor', details: rfc })
                        // Se obtiene la situacion fiscal del proveedor en la lista negra
                        var listaNegra = getListaNegra(tokenSW.token, rfc)
                        log.debug({ title: 'Lista Negra', details: listaNegra })
                        var situacionPvd = listaNegra.situacion;
                        // Si el proveedor no tiene ninguno de los 4 estatus
                        if (situacionPvd === '') {
                            estatus = situacionPvd;
                        } else {
                            // Si tiene algun estatus, lo obtiene
                            estatus = situacionPvd.situacion_del_contribuyente;
                        }
                        log.debug({ title: 'estatus', details: estatus })
                        // setEstatus(rfc);
                        // Guardar el valor del estatus en la sublista
                        currentRd.setCurrentSublistValue({
                            sublistId: 'custpage_tkio_vendor',
                            fieldId: 'custpage_sublist_estatus',
                            value: estatus
                        });
                        // Guardar el valor de la fecha en la sublista
                        currentRd.setCurrentSublistValue({
                            sublistId: 'custpage_tkio_vendor',
                            fieldId: 'sublist_date_consul',
                            value: todayConsulta
                        });

                        currentRd.commitLine({
                            sublistId: 'custpage_tkio_vendor'
                        });

                        editaEstado(rfc, estatus);
                        // window.location.reload(true);
                        // window.history.replaceState( null, null, window.location.href );
                    }

                }
                var msgPvdValid = message.create({
                    title: "Proveedor(es) Validado(s)",
                    message: "Se han validado las listas negras",
                    type: message.Type.CONFIRMATION
                });
                msgPvdValid.show({ duration: 3000 });

                return true;

            } catch (e) {
                var msgErrorRedir = message.create({
                    title: "Error al validar",
                    message: "Error al validar RFC en listas negras",
                    type: message.Type.ERROR
                });
                msgErrorRedir.show({ duration: 2000 });
                
                return false;
            }
        }

        // Funcion para marcar los checkbox de el formulario
        function marcar() {
            try {

                var sublistLineCount = currentRd.getLineCount({
                    sublistId: 'custpage_tkio_vendor'
                });

                for (var i = 0; i < sublistLineCount; i++) {
                    
                    // var check = currentRd.getSublistValue({
                    //     sublistId: 'custpage_tkio_vendor',
                    //     fieldId: 'sublist_check',
                    //     line: i
                    // });

                    currentRd.selectLine({
                        sublistId: 'custpage_tkio_vendor',
                        line: i
                    });

                    currentRd.setCurrentSublistValue({
                        sublistId: 'custpage_tkio_vendor',
                        fieldId: 'sublist_check',
                        value: true
                    });

                    // currentRd.commitLine({ sublistId: 'custpage_tkio_vendor' });

                    // var aDocument = document.getElementById('sublist_btn_marcar');

                    // if (check === false) {
                    //     aDocument.value = 'Desmarcar';
                    // } else {
                    //     aDocument.value = 'Marcar';
                    // }
                }

                // var msgRedir = message.create({
                //     title: "Marcar todos los registros 🟢",
                //     message: "Marcado correctamente!",
                //     type: message.Type.CONFIRMATION
                // });
                // msgRedir.show({ duration: 2000 });

            } catch (e) {
                var msgErrorRedir = message.create({
                    title: "Error al marcar",
                    message: "Error al marcar",
                    type: message.Type.ERROR
                });
                msgErrorRedir.show({ duration: 2000 });
            }
        }

        // Funcion para desmarcar los checkbox de el formulario
        function desmarcar() {
            try {

                var sublistLineCount = currentRd.getLineCount({
                    sublistId: 'custpage_tkio_vendor'
                });

                for (var i = 0; i < sublistLineCount; i++) {
                    currentRd.selectLine({
                        sublistId: 'custpage_tkio_vendor',
                        line: i
                    });

                    currentRd.setCurrentSublistValue({
                        sublistId: 'custpage_tkio_vendor',
                        fieldId: 'sublist_check',
                        value: false
                    });

                }

                // var msgRedir = message.create({
                //     title: "Desmarcar todos los registros 🟢",
                //     message: "Desmarcado correctamente!",
                //     type: message.Type.CONFIRMATION
                // });
                // msgRedir.show({ duration: 3000 });

            } catch (e) {
                var msgErrorRedir = message.create({
                    title: "Error al desmarcar",
                    message: "Error al desmarcar",
                    type: message.Type.ERROR
                });
                msgErrorRedir.show({ duration: 3000 });
            }
        }

        // Funcion para boton validar
        // Valida que el proveedor se encuentre o no en la lista negra 69b del SAT
        function validar() {
            // var rfc = '';
            // var sublistLineCount = currentRd.getLineCount({
            //     sublistId: 'custpage_tkio_vendor'
            // });
            // var todayConsulta = new Date().toLocaleDateString();
            // var estatus = '';
            // try {
            //     // Se autentica en Smarter Web
            //     var tokenSW = getTokenSW();
            //     log.debug({ title: 'tokenSW', details: tokenSW.token })

            //     for (var i = 0; i < sublistLineCount; i++) {
            //         var check = currentRd.getSublistValue({
            //             sublistId: 'custpage_tkio_vendor',
            //             fieldId: 'sublist_check',
            //             line: i
            //         });
            //         log.debug({ title: 'check', details: check })

            //         if (check === true) {
            //             var getRFC = currentRd.getSublistValue({
            //                 sublistId: 'custpage_tkio_vendor',
            //                 fieldId: 'sublist_pvd_rfc',
            //                 line: i
            //             });
            //             log.debug({ title: 'getRFC de Proveedor', details: getRFC })
            //             rfc = getRFC;
            //             // Se obtiene la situacion fiscal del proveedor en la lista negra
            //             var listaNegra = getListaNegra(tokenSW.token, rfc)
            //             log.debug({ title: 'Lista Negra', details: listaNegra })
            //             var situacionPvd = listaNegra.situacion;
            //             // Si el proveedor no tiene ninguno de los 4 estatus
            //             if (situacionPvd === '') {
            //                 estatus = situacionPvd;
            //             } else {
            //                 // Si tiene algun estatus, lo obtiene
            //                 estatus = situacionPvd.situacion_del_contribuyente;
            //             }
            //             log.debug({ title: 'estatus', details: estatus })
            //             // setEstatus(rfc);
            //             currentRd.selectLine({
            //                 sublistId: 'custpage_tkio_vendor',
            //                 line: i
            //             });
            //             // Guardar el valor del estatus en la sublista
            //             currentRd.setCurrentSublistValue({
            //                 sublistId: 'custpage_tkio_vendor',
            //                 fieldId: 'custpage_sublist_estatus',
            //                 value: estatus
            //             });
            //             // Guardar el valor de la fecha en la sublista
            //             currentRd.setCurrentSublistValue({
            //                 sublistId: 'custpage_tkio_vendor',
            //                 fieldId: 'sublist_date_consul',
            //                 value: todayConsulta
            //             });

            //             currentRd.commitLine({
            //                 sublistId: 'custpage_tkio_vendor'
            //             });

            //             editaEstado(rfc, estatus);
            //         }

            //     }
            //     var msgPvdValid = message.create({
            //         title: "Proveedor(es) Validado(s)",
            //         message: "Se han validado las listas negras",
            //         type: message.Type.CONFIRMATION
            //     });
            //     msgPvdValid.show({ duration: 3000 });

            // } catch (e) {
            //     var msgErrorRedir = message.create({
            //         title: "Error al validar",
            //         message: "Error al validar RFC en listas negras",
            //         type: message.Type.ERROR
            //     });
            //     msgErrorRedir.show({ duration: 2000 });
            // }
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
            // console.log(dataReturn);
            return dataReturn;
        }
        // Obtener la situación del contribuyente en la lista negra de Smarter Web
        function getListaNegra(tokenSW, rfc) {
            // console.log(tokenSW.token)
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
                log.error({ title: 'getListaNegra', details: error });
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
                    filters:
                        [
                            ['name', search.Operator.IS, 'Certificado 3.3']
                        ],
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
        // Busqueda dinamica para el ID del proveedor y estatus
        function getSearchId(valorFiltro, filtId, searchType) {
            try {
                var retStatus = '';
                var busquedaPvd = { name: "internalId" }
                var customrecord_estado_proveedor_recordSearchObj = search.create({
                    type: searchType,
                    filters:
                        [
                            [filtId, search.Operator.IS, valorFiltro]
                        ],
                    columns:
                        [
                            search.createColumn(busquedaPvd)
                        ]
                });
                var searchResultCount = customrecord_estado_proveedor_recordSearchObj.runPaged().count;
                log.debug("customrecord_estado_proveedor_recordSearchObj result count", searchResultCount);
                customrecord_estado_proveedor_recordSearchObj.run().each(function (result) {
                    log.debug({ title: 'result', details: result });
                    retStatus = result.getValue(busquedaPvd) || ' '
                    log.debug({ title: 'retStatus', details: retStatus });
                });
                return retStatus;

            } catch (error) {
                log.error({ title: 'error getSearchId', details: error })
            }
        }
        // Edita el registro del Proveedor con su Estatus en la lista negra
        function editaEstado(rfc, valorStatus) {
            try {
                let fechConsulta = new Date();
                log.debug({ title: 'fecha de Consulta', details: fechConsulta });
                var idVendor = getSearchId(rfc, 'custentity_mx_rfc', search.Type.VENDOR);
                log.debug({ title: 'idVendor', details: idVendor });
                var idStatus = getSearchId(valorStatus, 'name', 'customrecord_efx_pp_sol_lco');
                log.debug({ title: 'idStatus', details: idStatus });
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

        return {
            pageInit: pageInit,
            marcar: marcar,
            desmarcar: desmarcar,
            // validar: validar
            // getTokenSW: getTokenSW,
            // getListaNegra: getListaNegra,
            // getSearchId: getSearchId,
            // editaEstado: editaEstado
            // fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            saveRecord: saveRecord
        };

    });
