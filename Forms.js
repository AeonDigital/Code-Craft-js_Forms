/**
* @package Code Craft
* @pdesc Conjunto de soluções front-end.
*
* @module Forms
* @file Forms.
*
* @requires BasicTools
* @requires BasicDOM
* @requires ComplexType
* @requires StringExtension [optional]
*
* @author Rianna Cantarelli <rianna.aeon@gmail.com>
*/
'use strict';




// --------------------
// Caso não exista, inicia objeto CodeCraft
var CodeCraft = (CodeCraft || function () { });
if(typeof(CodeCraft) === 'function') { CodeCraft = new CodeCraft(); };





/**
* Classe que contém melhorias para utilizar em campos de formulários.
*
* @class Forms
*
* @memberof CodeCraft
*
* @static
*
* @type {Class}
*/
CodeCraft.Forms = new (function () {
    var _bt = CodeCraft.BasicTools;
    var _dom = CodeCraft.BasicDOM;
    var _ct = CodeCraft.ComplexType;







    /* ----------
    EXEMPLO DE MARCAÇÃO PARA CONECTAR UM CAMPO NO HTML À UM OBJETO "ComplexType"


    1 - HTML
    

    Atributos especiais
    data-ccw-fcon-object           :        Este atributo tem como objetivo indicar qual objeto "ComplexType" controla
    a validação e formatação do campo alem de informar.
    Também informa qual "Id" dos respectivos objetos está sendo apresentado.
    Ex : 
    Suponha as seguintes tabelas e propriedades

    Tabelas : 
        Client = {
            Id : null,
            Name : 'String',
            Phone : 'Telephone[]'
        };
        Telephone = {
            Id : null,
            Number : 'String'
    };

    Um campo com o atributo [data-ccw-fcon-object="Client[0].Name"]
    irá fazer uma conexão com a propriedade "Name" da tabela "Client".
    A indicação [0] define que o objeto é novo.

    Fosse usado o atributo [data-ccw-fcon-object="Client[25].Name"]
    indica que o campo deve mostrar o valor atual da propriedade "Name" da tabela "Client"
    para o respectivo registro de Id 25.

    Já um valor como [data-ccw-fcon-object="Client[15].Phone[3].Number"]
    deverá demonstrar o valor do campo "Number" da tabela "Telephone" para o registro de
    Id 3. A notação indica também que o objeto "Telephone" está contido como um dos
    elementos da propriedade "Phone" da tabela "Client" do registro de id 15.


    data-ccw-fcon-valid            :        Indica se o campo é válido [true] ou não [false]
    data-ccw-fcon-validate         :        Indica se é para validar o campo ou não [true|false]


    <form action="index.html" method="post" novalidate="novalidate">
        <div>
        <label for="ViewForm_0_FullName">Nome</label>
        <input type="text" id="ViewForm_0_FullName" name="ViewForm_0_FullName" class="iCommom small-fix"
                data-ccw-fcon-object="ViewForm[0].FullName"
                title="Nome" />
        </div>

        <div>
            <label for="ViewForm_0_Email">Email</label>
            <input type="text" id="ViewForm_0_Email" name="ViewForm_0_Email" class="iCommom"
                    data-ccw-fcon-object="ViewForm[0].Email"
                    title="Email" />
        </div>

        <div>
            <label for="ViewForm_0_Mensagem_1_Conteudo">Mensagem</label>
            <input type="text" id="ViewForm_0_Mensagem_1_Conteudo" name="ViewForm_0_Mensagem_1_Conteudo" class="iCommom"
                data-ccw-fcon-object="ViewForm[0].Mensagem[1].Conteudo"
                title="Mensagem" />
        </div>
    </form>



    2 - JAVASCRIPT

    O código abaixo registra os tipos complexos utilizados pelos campos do formulário.


    CodeCraft.Forms.AddNewCollection('ViewForm', [
        CodeCraft.Forms.CreateFormType('FullName', 'String', 64, null, null, null, false, null, null),
        CodeCraft.Forms.CreateFormType('Email', 'String', null, null, null, null, false, null, String.Pattern.World.Email),
        CodeCraft.Forms.CreateFormType('Mensagem', 'String', null, null, null, null, false, null, null)
    ]);

    
    CodeCraft.Forms.ConnectFields();



    ---------- */










    /**
    * Objeto resultante da validação de um formulário.
    * 
    * @typedef {ValidateFormResult}
    *
    * @property {Node}                      Field                           Elemento que falhou.
    * @property {ValidateError}             ErrorType                       Tipo do erro de validação.
    * @property {String}                    Message                         Mensagem de erro amigável.
    */




















    /*
    * PROPRIEDADES PRIVADAS
    */



    /**
    * Agrupa todas as coleções de "ComplexType" que podem ser usados nas validações.
    *
    * @type {Object[Key/ComplexType[]))
    */
    var _complexTypes = {};





    /**
    * Tipos de erros para a validação de campos de formulários.
    *
    * @memberof Forms
    *
    * @enum ValidateError
    *
    * @type {String}
    *
    * @readonly
    */
    var ValidateError = {
        /** 
        * Valor do atributo "data-ccw-fcon-object" é inválido. 
        *
        * @memberof ValidateError
        */
        InvalidComplexType: 'InvalidComplexType',
        /**
        * "ComplexType" não existe.
        *
        * @memberof ValidateError
        */
        ComplexTypeDoesNotExist: 'ComplexTypeDoesNotExist',
        /**
        * Valor obrigatorio não foi informado.
        *
        * @memberof ValidateError
        */
        RequiredValueNotSet: 'RequiredValueNotSet',
        /**
        * Valor informado é inválido.
        *
        * @memberof ValidateError
        */
        InvalidValue: 'InvalidValue',
        /**
        * Tipo do valor é inválido.
        *
        * @memberof ValidateError
        */
        InvalidType: 'InvalidType',
        /**
        * O valor informado é maior que o tamanho do campo.
        *
        * @memberof ValidateError
        */
        MaxLengthExceeded: 'MaxLengthExceeded',
        /**
        * O valor informado excedeu os limites definidos.
        *
        * @memberof ValidateError
        */
        ValueOutOfRange: 'ValueOutOfRange',
        /**
        * Algum valor deve ser selecionado.
        *
        * @memberof ValidateErrorLabels
        */
        ValueNotSelected: 'ValueNotSelected'
    };





















    /*
    * MÉTODOS PRIVADOS
    */



    /**
    * Conjunto de métodos para trabalhar com a notação usada para o atributo "data-ccw-fcon-object"
    */
    var _nttTools = {
        /**
        * Trata a menor porção de uma notação, retornando um objeto do tipo
        * { New : Boolean, Id : Integer, Name : 'String' }
        *
        * @function _unMake
        *
        * @param {String}               ntt                 Notação.
        *
        * @return {Object}
        */
        _unMake: function (ntt) {
            var r = {
                New: true,
                Id: 0,
                Name: ntt
            };


            ntt = ntt.split('[');
            if (ntt.length == 2) {
                r.New = (ntt[1].indexOf('N') !== -1) ? true : false;
                r.Id = parseInt(ntt[1].replace(']', '').replace('N', ''), 10);
                r.Name = ntt[0];
            }

            return r;
        },
        /**
        * Retorna o objeto "ComplexType" a partir do valor de um atributo "data-ccw-fcon-object".
        *
        * @function _getComplexTypeByNotation
        *
        * @param {String}                   ntt                         Notação usada para a conexão do campo ao atributo alvo.
        *
        * @return {!ComplexType}
        */
        _getComplexTypeByNotation: function (ntt) {
            var r = null;
            var _nt = _nttTools;

            // Apenas se houverem, ao menos 2 partes identificadas...
            ntt = ntt.split('.');
            if (ntt.length >= 2) {
                var c = _nt._unMake(ntt[0]).Name;
                var n = _nt._unMake(ntt[1]).Name;
                r = _nt._getComplexType(c, n);

                // Havendo mais que 2 partes...
                if (ntt.length > 2) {
                    for (var i = 2; i < ntt.length; i++) {
                        c = r.RefType;
                        n = _nt._unMake(ntt[i]).Name;
                        r = _nt._getComplexType(c, n);
                    }
                }
            }

            return r;
        },
        /**
        * Retorna o objeto "ComplexType" indicado.
        *
        * @function _getComplexType
        *
        * @param {String}                       collection                      Nome da coleção.
        * @param {String}                       ctName                          Nome do tipo que será selecionado.
        *
        * @return {!ComplexType}
        */
        _getComplexType: function (collection, ctName) {
            var r = null;

            for (var it in _complexTypes) {
                if (it == collection) {
                    var ct = _complexTypes[it];

                    for (var n in ct) {
                        if (ct[n].Name == ctName) { r = ct[n]; break; }
                    }

                    break;
                }
            }

            return r;
        }
    };









    /**
    * Objeto que traz os controles para trabalhar com Modelos de Dados representados em formulários.
    * A principal função deste objeto é permitir a representação no HTML de objetos que possuam
    * relação entre si, permitindo também um controle básico para adicionar/remover cada Instância.
    */
    var _dataModelTools = {

        /**
        * Altera o valor dos atributos informados removendo a marcação típica de um objeto de modelo.
        *
        * @param {Node}                         e                               Node do elemento.
        * @param {String[]}                     attrs                           Array com Nome dos atributos.
        * @param {Integer}                      i                               Indice do modelo.
        */
        _changeModelAttrs: function (e, attrs, i) {
            for (var it in attrs) {
                var a = attrs[it];

                if (e.hasAttribute(a)) {
                    e.setAttribute(a, e.getAttribute(a).replace('[M]', i));
                }
            }
        },
        /**
        * Identifica se o elemento informado é filho de um [data-ccw-fcon-object-model].
        *
        * @function _isChildOfModel
        *
        * @param {Node}                         n                               Node que será testado.
        *
        * @return {Boolean}
        */
        _isChildOfModel: function (n) {
            var r = false;

            var p = n.parentNode;
            while (r == false && p.tagName.toLowerCase() != 'body') {
                r = p.hasAttribute('data-ccw-fcon-object-model');
                p = p.parentNode;
            }

            return r;
        },
        /**
        * Identifica o Node [data-ccw-fcon-instance-of] que contém o elemento alvo.
        *
        * @function _parentInstance
        *
        * @param {Node}                         n                               Node filho de uma instância.
        *
        * @return {!Node}
        */
        _parentInstance: function (n) {
            var r = false;

            var p = n;
            while (r == false && p.tagName.toLowerCase() != 'body') {
                p = p.parentNode;
                r = p.hasAttribute('data-ccw-fcon-instance-of');
            }

            return (r == true) ? p : null;
        },
        /**
        * Inicia os botões de controle que estão contidos na Instancia indicada.
        *
        * @function _setInstanceControls
        *
        * @param {Node}                         n                               Node da instância alvo.
        *
        * @return {!Node}
        */
        _setInstanceControls: function (n) {
            // Seta os botões de controle para adicionar nova instância
            var btns = _dom.Get('[data-ccw-fcon-object-model-add]', n);
            for (var it in btns) {
                _dom.SetEvent(btns[it], 'click', _public.AddModelInstance);
            }

            // Seta os botões de controle para remover instância
            var btns = _dom.Get('[data-ccw-fcon-object-model-remove]', n);
            for (var it in btns) {
                _dom.SetEvent(btns[it], 'click', _public.RemoveModelInstance);
            }
        },





        /**
        * Inicia todos os Modelos de Dados existêntes na view atual.
        *
        * @param {Node}                         [t]                             Node dentro do qual estão os modelos a serem iniciados.
        *
        * @function _initiViewsDataModels
        */
        _initiViewsDataModels: function (t) {
            t = (t === undefined) ? document.body : t;
            var dmls = _dom.Get('[data-ccw-fcon-object-model]', t);



            // Seta atributos mínimos para os modelos encontrados.
            for (var it in dmls) {
                var m = dmls[it];

                if (!m.hasAttribute('data-ccw-fcon-object-model-min')) {
                    m.setAttribute('data-ccw-fcon-object-model-min', 1);
                }
                if (!m.hasAttribute('data-ccw-fcon-object-model-max')) {
                    m.setAttribute('data-ccw-fcon-object-model-max', 0);
                }
            }




            // Para cada modelo encontrado
            for (var it in dmls) {
                var m = dmls[it];

                // Apenas se o modelo não for filho de outro modelo...
                if (!_dataModelTools._isChildOfModel(m)) {
                    var mName = m.getAttribute('data-ccw-fcon-object-model');
                    var insert = m.getAttribute('data-ccw-fcon-object-model-insert');
                    var min = parseInt(m.getAttribute('data-ccw-fcon-object-model-min'), 10);


                    // Gera o número mínimo de modelos definidos.
                    for (var i = 0; i < min; i++) {
                        _dataModelTools._setModelInstance(mName, m.parentNode, insert);
                    }
                }
            }


            _dataModelTools._setInstanceControls(t);
            _dataModelTools._setRemoveControls();
        },





        /**
        * A partir do nome do Modelo de Dados informado prepara uma nova instância para ser inserida no DOM.
        *
        * @function _setModelInstance
        *
        * @param {String}                       mName                           Nome do Modelo de Dados que será adicionado.
        * @param {Node}                         parent                          Node pai, onde o novo modelo será adicionado.
        * @param {String}                       [insert = 'bottom']             Indica se o modelo deve ser adicionado ao topo ou abaixo
        */
        _setModelInstance: function (mName, parent, insert) {
            insert = (insert === undefined) ? 'bottom' : insert.toLowerCase();
            var m = _dom.Get('[data-ccw-fcon-object-model="' + mName + '"]', parent);


            if (m != null) {
                m = m[0];

                // Apenas se o modelo atual não for filho de outro modelo...
                if (!_dataModelTools._isChildOfModel(m)) {
                    var max = parseInt(m.getAttribute('data-ccw-fcon-object-model-max'), 10);


                    // Apenas adiciona nova instância se ainda não atinjiu o máximo definido
                    var inst = _dom.Get('[data-ccw-fcon-instance-of="' + mName + '"]', parent);
                    if (inst == null || inst.length < max) {

                        // Identifica o ID mais alto entre as instancias que existem.
                        var Id = 0;
                        if (inst != null) {
                            for (var it in inst) {
                                var iId = parseInt(inst[it].getAttribute('data-ccw-fcon-instance-id'), 10);
                                if (iId >= Id) {
                                    Id = iId + 1;
                                }
                            }
                        }


                        // Clona o modelo
                        var c = m.cloneNode(true);
                        c.removeAttribute('data-ccw-fcon-object-model');
                        c.removeAttribute('data-ccw-fcon-object-model-min');
                        c.removeAttribute('data-ccw-fcon-object-model-max');
                        c.removeAttribute('data-ccw-fcon-object-model-insert');
                        c.setAttribute('data-ccw-fcon-instance-of', mName);
                        c.setAttribute('data-ccw-fcon-instance-id', Id);


                        // Prepara os elementos internos
                        var tgtElem = _dom.Get('input, textarea, select, label, button', c);
                        var tgtAttrs = ['for', 'id', 'name', 'data-ccw-fcon-object',
                                        'data-ccw-fcon-object-model-remove-id', 'data-ccw-fcon-object-model-add-id']

                        for (var it in tgtElem) {
                            _dataModelTools._changeModelAttrs(tgtElem[it], tgtAttrs, Id);
                        }


                        // Insere a nova instância no DOM conforme a indicação.
                        var nRef = m.nextSibling;
                        if (insert == 'bottom' && inst != null) {
                            nRef = inst[inst.length - 1].nextSibling;
                        }

                        if (nRef !== null) {
                            parent.insertBefore(c, nRef);
                        }
                        else {
                            parent.appendChild(c);
                        }


                        // Adiciona botões de controle
                        _dataModelTools._setInstanceControls(c);


                        // Resgata os modelos existentes dentro do novo modelo e inicia-os
                        var cDMs = _dom.Get('[data-ccw-fcon-object-model]', c);
                        for (var it in cDMs) {
                            var cm = cDMs[it];

                            var cmName = cm.getAttribute('data-ccw-fcon-object-model');
                            var cInsert = cm.getAttribute('data-ccw-fcon-object-model-insert');
                            var min = parseInt(cm.getAttribute('data-ccw-fcon-object-model-min'), 10);

                            // Gera o número mínimo de modelos definidos.
                            for (var i = 0; i < min; i++) {
                                _dataModelTools._setModelInstance(cmName, c, cInsert);
                            }
                        }
                    }
                }
            }
        },





        /**
        * Efetua o controle dos botões "remove" das Instâncias definidas 
        * não permitindo ao usuário remover itens obrigatórios.
        *
        * @function _setRemoveControls
        */
        _setRemoveControls: function () {
            // Seleciona todas as instâncias
            var allInst = _dom.Get('[data-ccw-fcon-instance-of]');
            var collection = [];
            var uniParent = [];




            // Seleciona a primeira instância filha de cada node diferente
            // tendo assim 1 representante de cada coleção existênte no DOM
            for (var it in allInst) {
                var i = allInst[it];
                var p = i.parentNode;

                if (uniParent.indexOf(p) === -1) {
                    collection.push(i);
                    uniParent.push(p);
                }
            }





            /**
            * Identifica quais botões "remove" que os elementos da instância informada devem ser
            * desabilitados.
            *
            * @param {Node}                     inst                        Instância alvo.
            *
            */
            var __disableRemoveButtons = function (inst) {
                var p = inst.parentNode;
                var n = inst.getAttribute('data-ccw-fcon-instance-of');
                var m = _dom.Get('[data-ccw-fcon-object-model="' + n + '"]', p)[0];
                var min = parseInt(m.getAttribute('data-ccw-fcon-object-model-min'), 10);

                // Resgata todos os botões "remove" das instâncias do tipo atual
                var aBtns = _dom.Get('[data-ccw-fcon-instance-of="' + n + '"] [data-ccw-fcon-object-model-remove="' + n + '"]', p);
                for (var i = 0; i < aBtns.length; i++) {
                    if (i < min) {
                        aBtns[i].setAttribute('disabled', 'disabled');
                    }
                }
            };




            // Para cada coleção de instâncias
            for (var it in collection) {
                __disableRemoveButtons(collection[it]);
            }
        }
    };










    /**
    * Resgata o nome pelo qual o campo é chamado.
    * 
    * @function _getFieldName
    *
    * @private
    *
    * @param {Node}                         f                               Campo cujo nome será identificado.
    *
    * @return {String}
    */
    var _getFieldName = function (f) {
        var n = '';

        if (f.hasAttribute('title')) {
            n = f.getAttribute('title');
        }
        else if (f.hasAttribute('id')) {
            var l = _dom.Get('label[for="' + f.id + '"]');
            if (l !== null) {
                n = l[0].textContent;
            }
        }

        if (n == '' && f.hasAttribute('name')) {
            n = f.getAttribute('name');
        }

        return n;
    };



















    /**
    * OBJETO PÚBLICO QUE SERÁ EXPOSTO.
    */
    var _public = this.Control = {
        /**
        * Legendas para mensagens de erro amigáveis.
        *
        * @memberof Forms
        *
        * @enum ValidateErrorLabels
        *
        * @type {String}
        */
        ValidateErrorLabels: {
            /**
            * Título para alertas de falha ao preenchimento de algum campo de formulário.
            *
            * @memberof ValidateErrorLabels
            *
            * @type {String}
            */
            FormErrorTitleAlert: 'The following errors were found:',
            /** 
            * Valor do atributo "data-ccw-fcon-object" é inválido. 
            *
            * @memberof ValidateErrorLabels
            */
            InvalidComplexType: 'The value "{label}" of attribute "data-ccw-fcon-object" is invalid.',
            /**
            * ComplexType definido não existe.
            *
            * @memberof ValidateErrorLabels
            */
            ComplexTypeDoesNotExist: 'Table or column does not exist.\n[data-ccw-fcon-object="{label}"]',
            /**
            * Valor obrigatorio não foi informado.
            *
            * @memberof ValidateErrorLabels
            */
            RequiredValueNotSet: 'The field "{label}" must be filled.',
            /**
            * Valor informado é inválido.
            *
            * @memberof ValidateErrorLabels
            */
            InvalidValue: 'Properly fill the field "{label}".',
            /**
            * Tipo do valor é inválido.
            *
            * @memberof ValidateErrorLabels
            */
            InvalidType: 'Properly fill the field "{label}".',
            /**
            * O valor informado é maior que o tamanho do campo.
            *
            * @memberof ValidateErrorLabels
            */
            MaxLengthExceeded: 'The field "{label}" is too long.',
            /**
            * O valor informado excedeu os limites definidos.
            *
            * @memberof ValidateErrorLabels
            */
            ValueOutOfRange: 'The value of field "{label}" is out of range',
            /**
            * Mensagem para campo select onde nenhuma opção está selecionada.
            *
            * @memberof ValidateErrorLabels
            */
            ValueNotSelected: 'You must select an option from the field "{label}".'
        },










        /**
        * Cria um objeto "ComplexType" sem precisar informar dados desnecessários para campos
        * comuns de formulário.
        * 
        * @function CreateFormType
        *
        * @memberof Forms
        *
        * @param {String}                   parName                         Nome do tipo.
        * @param {PrimitiveType}            parType                         Tipo de dado primitivo aceito.
        * @param {Integer}                  [parLength = null]              Tamanho máximo para um campo do tipo String.
        * @param {Integer}                  [parMin = null]                 Valor mínimo aceito para um campo numérico.
        * @param {Integer}                  [parMax = null]                 Valor máximo aceito para um campo numérico.
        * @param {String}                   [parRefType = null]             Nome do tipo ao qual este deve ser uma referência.
        * @param {Boolean}                  [parAllowEmpty = false]         Indica se permite que o valor seja vazio [''].
        * @param {String}                   [parDefault = null]             Valor inicial para uma variável deste tipo.
        * @param {DataFormat}               [parFormatSet = null]           Objeto de definições para formatação.
        *
        * @return {!ComplexType}
        */
        CreateFormType: function (parName, parType, parLength, parMin, parMax,
                                            parRefType, parAllowEmpty, parDefault, parFormatSet) {

            return _ct.CreateNewType(parName, parType, parLength, parMin, parMax, parRefType,
                                            true, true, parAllowEmpty, false, false, parDefault, parFormatSet);
        },









        /**
        * Adiciona uma nova coleção de tipos complexos ao rol de possibilidades.
        * 
        * @function AddNewCollection
        *
        * @memberof Forms
        *
        * @param {String}                   name                            Nome da coleção.
        * @param {ComplexType[]}            collection                      Coleção de elementos.
        *
        * @return {Boolean}
        */
        AddNewCollection: function (name, collection) {
            var r = true;

            for (var it in _complexTypes) {
                if (it == name) { r = false; break; }
            }

            if (r) {
                _complexTypes[name] = collection;
            }

            return r;
        },





        /**
        * Inicia todas as definições especiais para os formulários de uma view.
        * 
        * @function StartForms
        *
        * @memberof Forms
        */
        StartForms: function () {
            // Monta o html básico para todos os objetos modelos.
            _dataModelTools._initiViewsDataModels();

            // Conecta os campos marcados
            _public.ConnectFields();
        },




        /**
        * Conecta os campos marcados com seus respectivos objetos "ComplexType".
        * 
        * @function ConnectFields
        *
        * @memberof Forms
        */
        ConnectFields: function () {
            var tgtInputs = _dom.Get('input, textarea, select');
            var d = true;
            

            for (var it in tgtInputs) {
                var f = tgtInputs[it];


                // apenas se for um objeto válido, que não seja parte de um modelo definido...
                if (f.hasAttribute('data-ccw-fcon-object') && !_dataModelTools._isChildOfModel(f)) {
                    var cType = _nttTools._getComplexTypeByNotation(f.getAttribute('data-ccw-fcon-object'));


                    if (cType == null) {
                        console.log('Input has an invalid value for attribute "data-ccw-fcon-object". Found "' + f.getAttribute('data-ccw-fcon-object') + '".');
                    }
                    else {
                        var ft = _bt.GetFieldType(f);

                        // Marca todos os checkbox como não validáveis
                        if (ft.IsCheckBox) {
                            f.setAttribute('data-ccw-fcon-validate', 'false');
                        }
                        else if (ft.IsField || ft.IsTextArea || ft.IsSelect) {
                            if (cType.AllowSet === false) { f.setAttribute('disabled', 'disabled'); }
                            if (cType.AllowNull === false && !f.hasAttribute('required')) { f.setAttribute('required', 'required'); }

                            // Sets para Campos Comuns ou TextArea
                            if (!ft.IsSelect) {
                                if (cType.Length != null) { f.setAttribute('maxlength', cType.Length); }
                                if (cType.Min != null) {
                                    var vM = (cType.Type.Name != 'Date') ? cType.Min : cType.Type.ParseToString(cType.Min);
                                    f.setAttribute('min', vM);
                                }
                                if (cType.Max != null) {
                                    var vM = (cType.Type.Name != 'Date') ? cType.Max : cType.Type.ParseToString(cType.Max);
                                    f.setAttribute('max', vM);
                                }

                                // Se o campo permite insert E está marcado como ReadOnly
                                // verifica se o valor atual está definido...
                                if (cType.AllowSet === true && cType.ReadOnly === true && _bt.IsNotNullValue(f.value)) {
                                    f.setAttribute('readonly', 'readonly');
                                }
                            }



                            // Seta o valor padrão caso nenhum seja informado
                            if (cType.Default != null && f.value == '') {
                                if (cType.Type.Name === 'Date' && cType.Default === 'new') {
                                    var val = new Date();
                                    var use = (String.Pattern != undefined) ? String.Pattern.World.Dates.DateTime : null;
                                    use = (cType.FormatSet != null && cType.FormatSet.Format != null) ? cType.FormatSet : use;

                                    if (_bt.IsNotNullValue(use)) {
                                        f.value = use.Format(val);
                                    }
                                }
                                else {
                                    f.value = cType.Default;
                                }
                            }


                            // Adiciona verificador/formatador
                            var fc = CodeCraft.Forms;
                            var ev = (ft.IsField || ft.IsTextArea) ? 'keyup' : 'change';

                            _dom.SetEvent(f, ev, fc.CheckAndFormatField);
                            fc.CheckAndFormatField(f, false);
                        }
                    }

                }
            }
        },





        /**
        * A partir do "ComplexType" definido para o campo, verifica se seu valor é válido.
        * No caso do valor encontrado ser válido e haver uma formatação prevista, esta será aplicada.
        * 
        * @function CheckAndFormatField
        *
        * @memberof Forms
        *
        * @param {Node}                     o                               Elemento que será validado.
        * @param {Boolean}                  [c = true]                      Indica se é ou não para usar o atributo [data-ccw-fcon-valid] no elemento.
        * @param {Boolean}                  [r = true]                      Quando "true" irá retornar um valor booleano, senão, 
        *                                                                   retornará o código do erro em caso de falha ou True em caso de sucesso.
        *
        * @return {Boolean|[True|ValidateError]}
        */
        CheckAndFormatField: function (o, c, r) {
            o = (o.target === undefined) ? o : o.target;
            c = (c === undefined) ? true : c;
            r = (r === undefined) ? true : r;

            var validate = (o.hasAttribute('data-ccw-fcon-validate')) ? _bt.TryParse.ToBoolean(!o.getAttribute('data-ccw-fcon-validate')) : true;
            var isValid = false;


            // Se o campo não deve ser validado, ou, se não possui marcação que 
            // possibilite enquadra-lo em alguma regra de validação... ignora-o
            if (!validate || !o.hasAttribute('data-ccw-fcon-object')) {
                isValid = true;
            }
            else {
                var cType = _nttTools._getComplexTypeByNotation(o.getAttribute('data-ccw-fcon-object'));
                if (cType == null) {
                    isValid = (r === true) ? false : ValidateError.ComplexTypeDoesNotExist;
                }
                else {
                    var ft = _bt.GetFieldType(o);
                    var val = o.value;
                    var req = (_bt.IsNotNullValue(o.required)) ? _bt.TryParse.ToBoolean(o.required) : false;


                    // Verifica valores obrigatórios
                    if (req && o.value == '') {
                        var err = (ft.IsSelect) ? ValidateError.ValueNotSelected : ValidateError.RequiredValueNotSet;
                        isValid = (r === true) ? false : err;
                    }
                    else {

                        // Campos select não passam pelas validações a seguir.
                        if (ft.IsSelect) {
                            isValid = true;
                        }
                        else {
                            var ss = (_bt.IsNotNullValue(cType.FormatSet)) ? cType.FormatSet : null;

                            // Verifica se a string é válida dentro das especificações do SuperType
                            isValid = (ss != null && _bt.IsNotNullValue(ss.Check)) ? ss.Check(val) : true;

                            if (!isValid) {
                                isValid = (r === true) ? false : ValidateError.InvalidValue;
                            }
                            else {
                                // Força para que o valor retorne ao seu tipo original
                                val = (ss != null && ss.RemoveFormat != null) ? ss.RemoveFormat(val) : val;
                                val = cType.Type.TryParse(val, cType.RefType);


                                // Valida o valor conforme o tipo de dado da coluna,
                                // ENUNs são testados aqui
                                isValid = cType.Type.Validate(val, cType.RefType);

                                if (!isValid) {
                                    isValid = (r === true) ? false : ValidateError.InvalidType;
                                }
                                else {
                                    switch (cType.Type.Name) {
                                        // Verificação para String                                                                                                                                                                                                                                  
                                        case 'String':
                                            // Havendo um formatador, executa-o
                                            val = (ss != null && ss.Format != null) ? ss.Format(val) : val;


                                            // Verifica tamanho.
                                            if (cType.Length != null && val.length > cType.Length) {
                                                isValid = (r === true) ? false : ValidateError.MaxLengthExceeded;
                                            }

                                            break;

                                        // Verificação para Numerais e Date                                                                                                                                                                                                                                 
                                        case 'Date':
                                        case 'Byte':
                                        case 'Short':
                                        case 'Integer':
                                        case 'Long':
                                        case 'Float':
                                        case 'Double':
                                            if (val < cType.Min || val > cType.Max) {
                                                isValid = (r === true) ? false : ValidateError.ValueOutOfRange;
                                            }

                                            break;
                                    }



                                    if (isValid && ss != null && ss.Format != null) {
                                        o.value = ss.Format(val);
                                    }
                                }
                            }
                        }
                    }


                    if (c) {
                        o.setAttribute('data-ccw-fcon-valid', ((isValid === true) ? true : false));
                    }
                }
            }


            return isValid;
        },





        /**
        * Valida todos os campos encontrados para o formulário alvo.
        * Retorna True caso todos passem ou um array com objetos "ValidateFormResult" referentes
        * aos campos que falharam na validação.
        * 
        * @function CheckFields
        *
        * @memberof Forms
        *
        * @param {Node}                     form                            Elemento "form" que terá seus campos validados.
        * @param {JSON}                     [labels]                        Mensagens amigáveis para serem mostradas ao usuário.
        *                                                                   Se não forem definidas usará o objeto "ValidateErrorLabels"
        *
        * @return {True|ValidateFormResult[]}
        */
        CheckFields: function (form, labels) {
            var errors = [];
            var fc = CodeCraft.Forms;
            var tgtInputs = _dom.Get('[data-ccw-fcon-object]', form);
            labels = (labels === undefined) ? fc.ValidateErrorLabels : labels;


            for (var it in tgtInputs) {
                var f = tgtInputs[it];

                // Apenas se não for um item de um modelo
                if (!_dataModelTools._isChildOfModel(f)) {
                    var r = fc.CheckAndFormatField(f, true, false);

                    if (r !== true) {

                        var msg = labels[r];
                        var lbl = (r == 'InvalidComplexType' ||
                                r == 'ComplexTypeDoesNotExist') ? f.getAttribute('data-ccw-fcon-object') : _getFieldName(f);

                        errors.push({
                            Field: f,
                            ErrorType: r,
                            Message: labels[r].replace('{label}', lbl)
                        });
                    }
                }
            }


            return (errors.length === 0) ? true : errors;
        },





        /**
        * Prepara todos os campos <input> do formulário alvo para dispararem o evendo indicado
        * ao pressionar o botão "Enter".
        * 
        * @function SetActionOnEnter
        *
        * @memberof Forms
        *
        * @param {Node}                     f                               Elemento "form" alvo.
        * @param {Function}                 ev                              Evento que será disparado.
        */
        SetActionOnEnter: function (f, ev) {
            // Evento que será adicionado nos campos encontrados
            var __event_OnEnter = function (e) { if (e.keyCode == 13) { ev(e); } };


            var flds = _dom.Get('input', f);
            for (var it in flds) {
                var t = flds[it].type;

                switch (t) {
                    case 'datetime-local': case 'datetime': case 'date':
                    case 'month': case 'week': case 'time': case 'number':
                    case 'range': case 'email': case 'color': case 'tel':
                    case 'url': case 'text': case 'password': case 'search':

                        _dom.SetEvent(flds[it], 'keyup', __event_OnEnter);
                        break;
                }
            }
        },















        /**
        * Adiciona uma nova instância de objeto a partir do modelo definido.
        * 
        * @function AddModelInstance
        *
        * @memberof Forms
        *
        * @param {Event}                    o                               Evento.
        */
        AddModelInstance: function (o) {
            o = o.target;
            var mName = o.getAttribute('data-ccw-fcon-object-model-add');
            var m = _dom.Get('[data-ccw-fcon-object-model="' + mName + '"]');


            if (m != null) {
                m = m[0];

                // Identifica o elemento parent
                var p = _dataModelTools._parentInstance(o);
                if (p == null) {
                    p = m.parentNode;
                }

                _dataModelTools._setModelInstance(mName, p, undefined);
                _dataModelTools._setRemoveControls();
            }
        },





        /**
        * Remove a instância do modelo apontada.
        * 
        * @function RemoveModelInstance
        *
        * @memberof Forms
        *
        * @param {Event}                    o                               Evento.
        */
        RemoveModelInstance: function (o) {
            o = o.target;
            var p = _dataModelTools._parentInstance(o);
            p.parentNode.removeChild(p);
            _dataModelTools._setRemoveControls();
        }
    };



    return _public;
});