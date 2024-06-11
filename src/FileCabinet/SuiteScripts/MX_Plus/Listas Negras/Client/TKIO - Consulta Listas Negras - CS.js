/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/message', 'N/url', 'N/https', 'N/search', 'N/record', 'N/runtime',  'N/email','N/search'],
    /**
     * @param{currentRecord} currentRecord
     * @param{message} message
     * @param{url} url
     * @param{https} https
     * @param{search} search
     * @param{record} record
     * @param{runtime} runtime
     * @param{email} email
     * @param{search} search
     */
    function (currentRecord, message, url, https, search, record, runtime, email,search) {
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
            try {
                const currentRd = scriptContext.currentRecord;
                var Ids= currentRd.getValue({fieldId: 'sublist_updatedata'});
                console.log('IDS',Ids);
                if(Ids!=''){
                    var arrIds = JSON.parse(Ids);
                    const serviceSL = url.resolveScript({
                        deploymentId: 'customdeploy_tkio_consulta_list_neg_s_sl',
                        scriptId: 'customscript_tkio_consulta_list_neg_s_sl',
                        params: {}
                    });
                    var headerObj = {
                        'Content-Type': 'text/plain'
                    };
                   
                    let validados = 0;
                    let completedVendors = 0;
                    let updatePercentage = 0;
                    // if(arrIds.length<=500){ 
                    if(arrIds.length>=500){ //condicion temporal hecha para forzar la ejecución del map reduce
                        for (let i = 0; i < arrIds.length; i++) {
                                var response = https.post.promise({
                                    url: serviceSL,
                                    body: JSON.stringify(arrIds[i]),
                                    headers: headerObj
                                })
                                .then(function(response){
                                    console.log('RESPUESTA DE LA VALIDACION', response);
                                    var responseBody= JSON.parse(response.body);
                                        completedVendors++;
                                    updatePercentage = Math.round((completedVendors / arrIds.length) * 100);
                                    console.log('PORCENTAJE',updatePercentage);
                                    updateProgressBar(updatePercentage);
                
                                    log.debug({
                                        title: 'Response',
                                        details: response
                                    });
                                    if(completedVendors==arrIds.length){
                                        msgValida.hide();
                                        var msgPvdValid = message.create({
                                            title: "Proveedor(es) Validado(s)",
                                            message: "Se han validado los proveedores seleccionados",
                                            type: message.Type.CONFIRMATION
                                        });
                                        msgPvdValid.show({ duration: 30000 });
                                        setTimeout(function () {
                                            window.location.reload();
                                        }, 1000);
                                        // setTimeout(function () {
                                        //     const urlSuitlet = url.resolveScript({
                                        //         deploymentId: 'customdeploy_tkio_consulta_list_neg_sl',
                                        //         scriptId: 'customscript_tkio_consulta_list_neg_sl'
                                        //     });
                                        //     window.onbeforeunload = null;
                                        //     window.open(urlSuitlet, '_self');
                                        // }, 10000);  
                                    }  
                                })
                                .catch(function onRejected(reason) {
                                
                                    completedVendors++;
                                    updatePercentage = Math.round((completedVendors / arrIds.length) * 100);
                                    console.log('PORCENTAJE',updatePercentage);
                                    updateProgressBar(updatePercentage);
                                    if(completedVendors==arrIds.length){
                                        msgValida.hide();
                                        var msgPvdValid = message.create({
                                            title: "Proveedor(es) Validado(s)",
                                            message: "No se han logrado validar todos los proveedores, el porcentaje de validación es del "+updatePercentage+"%",
                                            type: message.Type.CONFIRMATION
                                        });
                                        msgPvdValid.show({ duration: 30000 });
                                        // setTimeout(function () {
                                        //     const urlSuitlet = url.resolveScript({
                                        //         deploymentId: 'customdeploy_tkio_consulta_list_neg_sl',
                                        //         scriptId: 'customscript_tkio_consulta_list_neg_sl'
                                        //     });
                                        //     window.onbeforeunload = null;
                                        //     window.open(urlSuitlet, '_self');
                                        // }, 10000);  
                                    }  
                                
                                    log.debug({
                                        title: 'Invalid Request: ',
                                        details: reason
                                    });
                                })
                            
                            } 
                            
                        }
                    }
            } catch (e) {
                var msgErrorRedir = message.create({
                    title: "Error al inicializar",
                    message: "Error al inicializar. " + e,
                    type: message.Type.ERROR
                });
                msgErrorRedir.show({ duration: 3000 });
            }
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

            try {
                let msgConcurrency = message.create({
                    title: "Otro proceso en curso",
                    message: "Espere a que termine el proceso actual para continuar.",
                    type: message.Type.WARNING
                });
                let msgMR = message.create({
                    title: "Proceso en curso",
                    message: "La cantidad de proveedores es alta. Se continuará este proceso de forma programada. Se enviará un correo cuando haya terminado.",
                    type: message.Type.INFORMATION
                });
                let msgValida = message.create({
                    title: "Validando proveedores...",
                    message: "Espere mientras se validan los proveedores seleccionados",
                    type: message.Type.INFORMATION
                });
                msgValida.show();
                const currentRd = scriptContext.currentRecord;
                const sublistId = 'custpage_tkio_vendor'
                var arrSublist = [];
                var lineCount = currentRd.getLineCount(sublistId);
                for (let i = 0; i < lineCount; i++) {
                    var objSublist = {};
                    currentRd.selectLine({
                        sublistId: sublistId,
                        line: i
                    });

                    const check = currentRd.getCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'sublist_check'
                    });
                    // log.debug({ title: 'check', details: check })

                    if (check) {
                        objSublist.rfc = currentRd.getCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: 'sublist_pvd_rfc'
                        });
                        arrSublist.push(objSublist);
                    }
                }
                console.log('ARRSUBLIST',arrSublist);
               
                let lengthSublist = arrSublist.length;
                
                if(lengthSublist>0){ 
                    var sublistData = JSON.stringify(arrSublist);
                    const suiteletUrl   = url.resolveScript({
                        deploymentId: 'customdeploy_tkio_consulta_list_neg_s_sl',
                        scriptId: 'customscript_tkio_consulta_list_neg_sl',
                        params: {}
                    });
                    if(lengthSublist<500){ //condicion temporal hecha para forzar la ejecución del map reduce
                        msgMR.show();
                                
                    }
                    currentRd.setValue({fieldId: 'sublist_updatedata', value: JSON.stringify(arrSublist)});
                    //currentRd.save();
                     return true;
                }
                else { 
                return false;
                }
            // if(lengthSublist<500){ 
            //     // var sublistData = JSON.stringify(arrSublist);
            //     // const suiteletUrl   = url.resolveScript({
            //     //     deploymentId: 'customdeploy_tkio_consulta_list_neg_s_sl',
            //     //     scriptId: 'customscript_tkio_consulta_list_neg_s_sl',
            //     //     params: {}
            //     // });
            //     // currentRd.setValue({fieldId: 'sublist_updatedata', value: JSON.stringify(arrSublist)});
            //     //currentRd.save();;
            //     var response = https.post({
            //         url: serviceSL,
            //         body: sublistData,
            //         headers: headerObj
            //     });
            //     return true;
            // }
            // else {
            //   for (let i = 0; i < arrSublist.length; i++) {
            //     const remainingUsage = runtime.getCurrentScript().getRemainingUsage();   
            //         var response = https.post.promise({
            //             url: serviceSL,
            //             body: JSON.stringify(arrSublist[i]),
            //             headers: headerObj
            //         })
            //         .then(function(response){
            //             console.log('RESPUESTA DE LA VALIDACION', response);
            //             var responseBody= JSON.parse(response.body);
            //                 completedVendors++;
            //              updatePercentage = Math.round((completedVendors / lengthSublist) * 100);
            //              console.log('PORCENTAJE',updatePercentage);
            //              updateProgressBar(updatePercentage);
    
            //             log.debug({
            //                 title: 'Response',
            //                 details: response
            //             });
            //             if(completedVendors==lengthSublist){
            //                 msgValida.hide();
            //                 var msgPvdValid = message.create({
            //                     title: "Proveedor(es) Validado(s)",
            //                     message: "Se han validado los proveedores seleccionados",
            //                     type: message.Type.CONFIRMATION
            //                 });
            //                 msgPvdValid.show({ duration: 30000 });
            //                 setTimeout(function () {
            //                     window.location.reload();
            //                 }, 1000);
            //                 // setTimeout(function () {
            //                 //     const urlSuitlet = url.resolveScript({
            //                 //         deploymentId: 'customdeploy_tkio_consulta_list_neg_sl',
            //                 //         scriptId: 'customscript_tkio_consulta_list_neg_sl'
            //                 //     });
            //                 //     window.onbeforeunload = null;
            //                 //     window.open(urlSuitlet, '_self');
            //                 // }, 10000);  
            //             }  
            //         })
            //         .catch(function onRejected(reason) {
                     
            //             completedVendors++;
            //             updatePercentage = Math.round((completedVendors / lengthSublist) * 100);
            //             console.log('PORCENTAJE',updatePercentage);
            //             updateProgressBar(updatePercentage);
            //             if(completedVendors==lengthSublist){
            //                 msgValida.hide();
            //                 var msgPvdValid = message.create({
            //                     title: "Proveedor(es) Validado(s)",
            //                     message: "No se han logrado validar todos los proveedores, el porcentaje de validación es del "+updatePercentage+"%",
            //                     type: message.Type.CONFIRMATION
            //                 });
            //                 msgPvdValid.show({ duration: 30000 });
            //                 // setTimeout(function () {
            //                 //     const urlSuitlet = url.resolveScript({
            //                 //         deploymentId: 'customdeploy_tkio_consulta_list_neg_sl',
            //                 //         scriptId: 'customscript_tkio_consulta_list_neg_sl'
            //                 //     });
            //                 //     window.onbeforeunload = null;
            //                 //     window.open(urlSuitlet, '_self');
            //                 // }, 10000);  
            //             }  
                      
            //             log.debug({
            //                 title: 'Invalid Request: ',
            //                 details: reason
            //             });
            //         })
                
            //     } 
            // }
                //console.log('VALIDADOS',validados);
                //console.log('LENGTH SUBLIST',lengthSublist);
                //msgValida.hide();
                // setTimeout(function() {
                   
                // },50);
                
                // else {
                //     //msgValida.hide();
                //     var msgErrorRedir = message.create({
                //         title: "Error al validar",
                //         message: respuesta.details,
                //         type: message.Type.ERROR
                //     });
                //     msgErrorRedir.show({ duration: 30000 });  
                // } 
              }
           

              catch (e) {
                // msgValida.hide();
                var msgErrorRedir = message.create({
                    title: "Error al validar",
                    message: "Error al validar RFC en listas negras. " + e,
                    type: message.Type.ERROR
                });
                msgErrorRedir.show({ duration: 3000 });

                return false;
            }
              

                
             
                    // .then(function (response) {
                    //     var respuesta = JSON.parse(response.body);
                    //     console.log('.then ~ respuesta:', respuesta)
                    //     if (respuesta.success) {
                    //         msgValida.hide();
                    //         var msgPvdValid = message.create({
                    //             title: "Proveedor(es) Validado(s)",
                    //             message: respuesta.details,
                    //             type: message.Type.CONFIRMATION
                    //         });
                    //         msgPvdValid.show({ duration: 30000 });
                    //         setTimeout(function () {
                    //             const urlSuitlet = url.resolveScript({
                    //                 deploymentId: 'customdeploy_tkio_consulta_list_neg_sl',
                    //                 scriptId: 'customscript_tkio_consulta_list_neg_sl'
                    //             });
                    //             window.onbeforeunload = null;
                    //             window.open(urlSuitlet, '_self');
                    //         }, 10000);
                    //     } else {
                    //         msgValida.hide();
                    //         var msgErrorRedir = message.create({
                    //             title: "Error al validar",
                    //             message: respuesta.details,
                    //             type: message.Type.ERROR
                    //         });
                    //         msgErrorRedir.show({ duration: 3000 });
                    //     }
                    //     console.log({
                    //         title: 'Response',
                    //         details: respuesta
                    //     });

                    //     const todayConsulta = new Date().toLocaleDateString();
                    //     const situacionPvd = respuesta.situacion || '';
                    //     console.log('.then ~ situacionPvd:', situacionPvd)
                    //     for (let indexPvd = 0; indexPvd < situacionPvd.length; indexPvd++) {

                    //         currentRd.selectLine({
                    //             sublistId: sublistId,
                    //             line: indexPvd
                    //         });
                    //         currentRd.setCurrentSublistValue({
                    //             sublistId: sublistId,
                    //             fieldId: 'custpage_sublist_estatus',
                    //             value: situacionPvd[indexPvd]
                    //         });
                    //         // Guardar el valor de la fecha en la sublista
                    //         currentRd.setCurrentSublistValue({
                    //             sublistId: sublistId,
                    //             fieldId: 'sublist_date_consul',
                    //             value: todayConsulta
                    //         });
                    //     }

                    //     currentRd.commitLine({
                    //         sublistId: sublistId
                    //     });
                    //     // console.log('.then ~ arrSublist[0].rfc:', arrSublist[0].rfc)
                    //     // editaEstado(arrSublist[0].rfc, situacionPvd);
                    // })
                    // .catch(function onRejected(reason) {
                    //     console.error({
                    //         title: 'Invalid Request: ',
                    //         details: reason
                    //     });
                    // })

                // return true;

             
        }

        // Funcion para marcar los checkbox de el formulario
        function marcar() {
            try {
                const currentRec = currentRecord.get();
                const sublistId = 'custpage_tkio_vendor';
                const sublistLineCount = currentRec.getLineCount({
                    sublistId: sublistId
                });

                for (let i = 0; i < sublistLineCount; i++) {

                    currentRec.selectLine({
                        sublistId: sublistId,
                        line: i
                    });

                    currentRec.setCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'sublist_check',
                        value: true
                    });

                }

            } catch (e) {
                var msgErrorRedir = message.create({
                    title: "Error al marcar",
                    message: "Error al marcar. " + e,
                    type: message.Type.ERROR
                });
                msgErrorRedir.show({ duration: 3000 });
            }
        }

        // Funcion para desmarcar los checkbox de el formulario
        function desmarcar() {
            try {
                const currentRec = currentRecord.get();
                const sublistId = 'custpage_tkio_vendor';
                const sublistLineCount = currentRec.getLineCount({
                    sublistId: sublistId
                });

                for (let i = 0; i < sublistLineCount; i++) {
                    currentRec.selectLine({
                        sublistId: sublistId,
                        line: i
                    });

                    currentRec.setCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'sublist_check',
                        value: false
                    });

                }

            } catch (e) {
                var msgErrorRedir = message.create({
                    title: "Error al desmarcar",
                    message: "Error al desmarcar. " + e,
                    type: message.Type.ERROR
                });
                msgErrorRedir.show({ duration: 3000 });
            }
        }
      function updateProgressBar(percentage) {
            var progressBar = document.getElementById('progress-bar');
            var progressText = document.getElementById('progress-text');
            if (progressBar && progressText) {
                progressBar.style.width = percentage + '%';
                progressText.textContent = percentage + '%';
            }
       
        }

        return {
            pageInit: pageInit,
            marcar: marcar,
            desmarcar: desmarcar,
            updateProgressBar: updateProgressBar,
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
