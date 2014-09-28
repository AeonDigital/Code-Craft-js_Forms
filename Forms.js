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
    var _notTools = {
        /**
        * Trata a menor porção de uma notação, retornando um objeto do tipo
        * { Name : 'String', Id : Integer }
        *
        * @function _unMake
        *
        * @param {String}               not                 Notação.
        *
        * @return {Object}
        */
        _unMake: function (not) {
            var r = {
                Id: 0,
                Name: not
            };

            not = not.split('[');
            if (not.length == 2) {
                r.Id = parseInt(not[1].replace(']', ''), 10);
                r.Name = not[0];
            }

            return r;
        },
        /**
        * Retorna o objeto "ComplexType" a partir do valor de um atributo "data-ccw-fcon-object".
        *
        * @function _getComplexTypeByNotation
        *
        * @param {String}                   not                         Notação usada para a conexão do campo ao atributo alvo.
        *
        * @return {!ComplexType}
        */
        _getComplexTypeByNotation: function (not) {
            var r = null;
            var _nt = _notTools;

            // Apenas se houverem, ao menos 2 partes identificadas...
            not = not.split('.');
            if (not.length >= 2) {
                var c = _nt._unMake(not[0]).Name;
                var n = _nt._unMake(not[1]).Name;
                r = _nt._getComplexType(c, n);

                // Havendo mais que 2 partes...
                if (not.length > 2) {
                    for (var i = 2; i < not.length; i++) {
                        c = r.RefType;
                        n = _nt._unMake(not[i]).Name;
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

                if (f.hasAttribute('data-ccw-fcon-object')) {
                    var cType = _notTools._getComplexTypeByNotation(f.getAttribute('data-ccw-fcon-object'));


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
                                if (cType.Min != null) { f.setAttribute('min', cType.Min); }
                                if (cType.Max != null) { f.setAttribute('max', cType.Max); }

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
                var cType = _notTools._getComplexTypeByNotation(o.getAttribute('data-ccw-fcon-object'));
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
                var r = fc.CheckAndFormatField(f, true, false);

                console.log(f.id);
                console.log(r);
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
        }
    };



    return _public;
});