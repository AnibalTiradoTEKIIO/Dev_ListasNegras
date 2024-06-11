/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/task', 'N/email','N/runtime'],
    /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{url} url
 * @param{task} task
 * @param{email} email
 * @param{runtime} runtime
 */
    (log, record, search, serverWidget,url,task,email,runtime) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                var parametros = scriptContext.request.parameters
                log.debug('onRequest ~ parametros:', parametros)
                log.debug(' METHOD', scriptContext.request.method)
                if (parametros.custpage_tkio_vendordata){

                }
                const arrSublist = [];
                generarFormulario(scriptContext, parametros);
                switch (scriptContext.request.method) { 
                    case 'GET':

                        break;
                    case 'POST':
                        
                        var sublistData = JSON.parse(parametros.sublist_updatedata);
                        log.debug('sublistData', sublistData);
                       // if(sublistData.length>500){
                        log.debug('sublistDataLength', sublistData.length);
                        if(sublistData.length<500){ //Condicion de prueba creada para forzar la ejecución del map reduce
                            //setValue({fieldId: 'sublist_updatedata', value:sublistData});
                            //var sublistData = JSON.parse(parametros.sublist_updatedata);

                            var seguimiento = record.create({ type: 'customrecord_tkio_consulta_list_neg_seg', isDynamic: true })
                            seguimiento.setValue({ fieldId: 'custrecordtkio_listas_negras_status', value: '2' });
                            seguimiento.setValue({ fieldId: 'custrecord_tkio_listas_negras_user', value: runtime.getCurrentUser().id });
                            seguimiento.setValue({ fieldId: 'custrecord_tkio_listas_negras_data', value:sublistData.length});
                            seguimiento.setValue({ fieldId: 'custrecord_tkio_listas_negras_procesados', value:0});
                            var seguimientoId=seguimiento.save({ enableSourcing: true, ignoreMandatoryFields: false });
                            
                            var objetToProcess = {
                                sublistData: sublistData,
                                seguimientoId: seguimientoId,
                            }
                            var mrTask = task.create({
                                taskType: task.TaskType.MAP_REDUCE
                            });
                            mrTask.scriptId = 'customscript_tkio_mr_listas_negras'; 
                            mrTask.deploymentId = 'customdeploy_tkio_mr_listas_negras'; 
                            mrTask.params = {
                                custscript_tkio_vendor_dataupdate: JSON.stringify(objetToProcess)
                            };
                        var mrTaskID =  mrTask.submit();
                            log.debug('Tarea creada', mrTaskID);
                            record.submitFields({ type: 'customrecord_tkio_consulta_list_neg_seg', id: seguimientoId, values: { custrecord_tkio_listas_negras_taskid: mrTaskID } });
                            try {
                                email.send({
                                    author: runtime.getCurrentUser().id,
                                    recipients: ['anibal.tirado@tekiio.mx'],
                                    subject: 'Proceso de Listas Negras',
                                    body: 'El proceso de Listas Negras continuará de manera programada. Se enviará un correo cuando haya terminado.'
                                });
                                scriptContext.response.write('Email sent successfully.');
                            } catch (e) {
                                log.error({
                                    title: 'Error sending email',
                                    details: e
                                });
                                context.response.write('Error sending email: ' + e.message);
                            }
                        
                        }
                        break;
                }

            } catch (e) {
                log.error({
                    title: 'Error onRequest',
                    details: e
                });
            }

        }

        function generarFormulario(scriptContext, parametros) {
            try {
              
                // const { request, response } = scriptContext
                // const { parameters } = request
                // const filters = []
                // assignFilters(filters, parameters, pageObject)
                var form = serverWidget.createForm({ title: 'Valida Listas Negras' });
                form.clientScriptModulePath = '../Client/TKIO - Consulta Listas Negras - CS.js';
                // Create a field group for the progress bar
                    var progressBarGroup = form.addFieldGroup({
                        id: 'custpage_progress_bar_group',
                        label: 'Progress Bar'
                    });

                    // Add the progress bar to the group
                    var progressBar = form.addField({
                        id: 'custpage_progress_bar',
                        type: serverWidget.FieldType.INLINEHTML,
                        label: 'Progress Bar',
                        container: 'custpage_progress_bar_group' // Add the progress bar to the group
                    });
                 progressBar.defaultValue = `
                    <div style="background-color: #ddd; width: 100%; height: 20px; position: relative;">
                        <div id="progress-bar" style="background-color: #4CAF50; width: 0%; height: 100%; position: absolute;">
                            <span id="progress-text" style="position: absolute; width: 100%; text-align: center;"></span>
                        </div>
                    </div>
                `;

                // form.addButton({ id: 'custpage_tkio_validar', label: 'Validar', functionName: 'validar' });
                form.addSubmitButton({ label: 'Validar' })
                const colorBtn = form.addField({
                        id: 'custpage_styles',
                        label: ' ',
                        type: 'inlinehtml'
                });
                colorBtn.defaultValue = '<style>#submitter, #secondarysubmitter{ background-color: #0097a7ff !important; ' + 
                'color: white !important; }</style> <style> #tdbody_submitter, #tdbody_secondarysubmitter{ border: none !important; }</style>'
                let infoRelated = obtenInfoProveedores(parametros.idRecord);
              
                var sublist_proveedores = form.addSublist({
                    id: 'custpage_tkio_vendor',
                    label: 'Proveedores',
                    type: serverWidget.SublistType.LIST
                });

                sublist_proveedores.addButton({
                    id: 'sublist_btn_marcar',
                    label: 'Marcar Todos',
                    functionName: 'marcar'
                });
                sublist_proveedores.addButton({
                    id: 'sublist_btn_desmarcar',
                    label: 'Desmarcar Todos',
                    functionName: 'desmarcar'
                });
                sublist_proveedores.addField({ id: 'sublist_check', type: serverWidget.FieldType.CHECKBOX, label: 'Seleccionado' });
                
                sublist_proveedores.addField({ id: 'sublist_pvd_name', type: serverWidget.FieldType.TEXT, label: 'Proveedor' });
                sublist_proveedores.addField({ id: 'sublist_pvd_rfc', type: serverWidget.FieldType.TEXT, label: 'RFC' }).updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.ENTRY
                });
                sublist_proveedores.addField({ id: 'custpage_sublist_estatus', type: serverWidget.FieldType.TEXT, label: 'Estado' }).updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.ENTRY
                });
                sublist_proveedores.addField({ id: 'sublist_date_consul', type: serverWidget.FieldType.TEXT, label: 'Fecha de Consulta' }).updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.ENTRY
                });
                var IDS = form.addField({ id: 'sublist_updatedata', type: serverWidget.FieldType.LONGTEXT, label: 'IDs' });
                if(parametros?.sublist_updatedata!= ''){
                    IDS.defaultValue = parametros.sublist_updatedata;
                }
                IDS.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
               
                infoRelated.forEach((item, index) => {

                    sublist_proveedores.setSublistValue({ id: 'sublist_pvd_name', line: index, value: item.entityid })
                    sublist_proveedores.setSublistValue({ id: 'sublist_pvd_rfc', line: index, value: item.custentity_mx_rfc })
                    sublist_proveedores.setSublistValue({ id: 'custpage_sublist_estatus', line: index, value: item.custentity_efx_fe_lns_status })
                    sublist_proveedores.setSublistValue({ id: 'sublist_date_consul', line: index, value: item.custentity_efx_fe_lns_valida_date })
                })
                log.debug({ title: 'infoRelated', details: infoRelated });
                // var lineCount = sublist.lineCount;

           
                scriptContext.response.writePage(form)
            } catch (e) {
                log.error({
                    title: 'Error generarFormulario:',
                    details: e
                });
            }
        }

        const obtenInfoProveedores = (id) => {
            try {
                var arrPvd = [];
                var customrecord_tkiio_lista_negra_recordSearchObj = search.create({
                    type: search.Type.VENDOR,
                    filters:
                        [
                            ['custentity_mx_rfc', search.Operator.ISNOTEMPTY, id]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "entityid", sort: search.Sort.ASC, label: "Proveedor" }),
                            search.createColumn({ name: "custentity_mx_rfc", label: "RFC" }),
                            search.createColumn({ name: "custentity_efx_fe_lns_status", label: "Estatus" }),
                            search.createColumn({ name: "custentity_efx_fe_lns_valida_date", label: "Fecha de Consulta" })
                        ]
                });

                var searchResultCount = customrecord_tkiio_lista_negra_recordSearchObj.runPaged().count;
                log.debug("customrecord_tkiio_lista_negra_recordSearchObj result count", searchResultCount);
                customrecord_tkiio_lista_negra_recordSearchObj.run().each(function (result) {
                    log.debug({ title: 'result', details: result });
                    arrPvd.push({
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

        return { onRequest }

    });

